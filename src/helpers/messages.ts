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

export interface ContactMessagesIndex {
  currentLength: number;
  limit: number;
  readerDecryptKey: string;
  ownerDecryptKey: string;
  threadId: string;
  dbInfo: string;
  encryptKey: string;
  owner: string;
  _id: 'index';
}

export interface Message {
  body: string;
  time: number;
  owner: string | null;
  id: string | null;
}

const createContactIndex = async ({
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
}): Promise<ContactMessagesIndex> => {
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
  const messagesIndex: ContactMessagesIndex = {
    currentLength: 0,
    limit: CONTACT_INDEX_LIMIT,
    readerDecryptKey,
    ownerDecryptKey,
    encryptKey: encryptionWallet.public.toString(),
    threadId: contactThreadId,
    dbInfo: contactDbInfo,
    owner: this.identity.public.toString(),
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

const getContactIndex = async ({
  client,
  threadId,
  pubKey,
}: {
  threadId: ThreadID;
  client: Client;
  pubKey: string;
}): Promise<ContactMessagesIndex> => {
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

export {
  getContactIndex,
  createContactIndex,
  collectionCreate,
};
