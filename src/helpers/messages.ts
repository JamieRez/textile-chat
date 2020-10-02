import {
  Client,
  Users,
  PrivateKey,
  ThreadID,
  PublicKey,
  Private,
  Where,
  Identity,
} from '@textile/hub';
import schemas from './schemas';
import { findOrCreateCollection, decryptAndDecode } from '.';
import { encrypt } from './textile';
import events from 'events';
import ChatError, { ChatErrorCode } from '../errors';

const CONTACT_INDEX_LIMIT = 50;

export interface MessagesIndex {
  currentLength: number;
  limit: number;
  readerDecryptKey: string;
  ownerDecryptKey: string;
  threadId: string;
  dbInfo: string;
  encryptKey: string;
  _id: 'index';
}

export interface Message {
  body: string;
  time: number;
  owner: string | null;
  id: string | null;
}

const createIndex = async ({
  threadId,
  contactPubKey,
  client,
  privateKey,
  contactThreadId,
  contactDbInfo,
  identity
}: {
  threadId: ThreadID;
  contactPubKey: string;
  client: Client;
  privateKey: PrivateKey;
  contactThreadId: string;
  contactDbInfo: string;
  identity: Identity;
}): Promise<MessagesIndex> => {
  const messagesIndexCollectionName = contactPubKey + '-index';
  await findOrCreateCollection({
    client,
    threadId,
    collectionName: messagesIndexCollectionName,
    schema: schemas.messagesIndex,
    writeValidator: ((writer, event, instance) => {
      var patch = event.patch.json_patch;
      var type = event.patch.type;
      if(type === "create"){
        if (writer === patch.owner) {
          return true
        } else { 
          return false
        }
      } else {
        if (writer === instance.owner){
          return true;
        } else {
          return false;
        }
      }
    })
  });
  const contact = PublicKey.fromString(contactPubKey);
  const encryptionWallet = PrivateKey.fromRandom();
  const readerDecryptKey = (
    await contact.encrypt(encryptionWallet.seed)
  ).toString();
  const ownerDecryptKey = (
    await privateKey.public.encrypt(encryptionWallet.seed)
  ).toString();
  const messagesIndex: MessagesIndex = {
    currentLength: 0,
    limit: CONTACT_INDEX_LIMIT,
    readerDecryptKey,
    ownerDecryptKey,
    encryptKey: encryptionWallet.public.toString(),
    threadId: contactThreadId,
    dbInfo: contactDbInfo,
    _id: 'index',
  };
  try {
    await client.delete(threadId, messagesIndexCollectionName, [
      messagesIndex._id,
    ]);
  } catch (e) {
    console.log(e);
  }
  await client
    .create(threadId, messagesIndexCollectionName, [messagesIndex])
    .catch((e) => {
      if (e.message === "can't create already existing instance") {
        // Contact index already created - ignore error
      } else {
        throw new ChatError(ChatErrorCode.UnknownError, {
          errorMessage: e.message,
        });
      }
    });
  await findOrCreateCollection({
    client,
    threadId,
    collectionName: contactPubKey + '-0',
    schema: schemas.messages,
    writeValidator: ((writer, event, instance) => {
      var patch = event.patch.json_patch;
      var type = event.patch.type;
      if(type === "create"){
        if (writer === patch.owner) {
          return true
        } else { 
          return false
        }
      } else {
        if (writer === instance.owner){
          return true;
        } else {
          return false;
        }
      }
    })
  });
  return messagesIndex;
};

const getIndex = async ({
  client,
  threadId,
  pubKey,
}: {
  threadId: ThreadID;
  client: Client;
  pubKey: string;
}): Promise<MessagesIndex> => {
  const q = new Where('_id').eq('index');
  const collection: any = await client.find(threadId, pubKey + '-index', q);
  return collection[0];
};

const collectionCreate = async ({
  indexNumber,
  client,
  threadId,
  contactPubKey,
}: {
  threadId: ThreadID;
  indexNumber: number;
  client: Client;
  contactPubKey: string;
}) => {
  const collectionName = contactPubKey + '-' + indexNumber.toString();
  return findOrCreateCollection({
    client,
    threadId,
    collectionName,
    schema: schemas.messages,
    writeValidator: ((writer, event, instance) => {
      var patch = event.patch.json_patch;
      var type = event.patch.type;
      if(type === "create"){
        if (writer === patch.owner) {
          return true
        } else { 
          return false
        }
      } else {
        if (writer === instance.owner){
          return true;
        } else {
          return false;
        }
      }
    })
  });
};

const sendMessage = async ({
  messagesIndex,
  client,
  threadId,
  index,
  contactPubKey,
  msg,
}: {
  msg: string;
  threadId: ThreadID;
  identity: PrivateKey;
  messagesIndex: MessagesIndex;
  index: number;
  client: Client;
  contactPubKey: string;
}) => {
  const pubKey = PublicKey.fromString(messagesIndex.encryptKey);
  const message: Message = {
    time: Date.now(),
    body: await encrypt(pubKey, msg),
    owner: '',
    id: '',
  };
  return client.create(threadId, contactPubKey + '-' + index.toString(), [
    message,
  ]);
};

const loadMessages = async ({
  pubKey,
  client,
  threadId,
  decryptKey,
  name,
  index,
}: {
  index: number;
  pubKey: string;
  client: Client;
  threadId: ThreadID;
  decryptKey: PrivateKey;
  name: string;
}) => {
  const collectionName = pubKey + '-' + index.toString();
  const msgs: any[] = await client.find(threadId, collectionName, {});
  const messageList: Message[] = [];
  for (const msg of msgs) {
    const decryptedBody = await decryptAndDecode(decryptKey, msg.body);
    messageList.push({
      body: decryptedBody,
      time: msg.time,
      owner: name,
      id: msg._id,
    });
  }
  messageList.sort((a, b) => a.time - b.time);
  return messageList;
};

const listenForMessages = async ({
  pubKey,
  client,
  threadId,
  decryptKey,
  name,
  index,
  cb,
}: {
  index: number;
  pubKey: string;
  client: Client;
  threadId: ThreadID;
  decryptKey: PrivateKey;
  name: string;
  cb: (msgs: Message[]) => void;
}) => {
  const collectionName = pubKey + '-' + index.toString();
  const emitter = new events.EventEmitter();
  emitter.on('newMessage', cb);
  client.listen(threadId, [{ collectionName }], async (msg: any) => {
    if (!msg.instance) {
      return;
    }
    const decryptedBody = await decryptAndDecode(decryptKey, msg.instance.body);
    emitter.emit('newMessage', [
      {
        body: decryptedBody,
        time: msg.instance.time,
        owner: name,
        id: msg._id,
      },
    ]);
  });
};

export {
  listenForMessages,
  loadMessages,
  getIndex,
  createIndex,
  collectionCreate,
  sendMessage,
};
