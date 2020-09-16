import {
  PrivateKey,
  Users,
  UserAuth,
  ThreadID,
  Client,
  Query,
  PublicKey,
  Identity,
  DBInfo,
  Where
} from "@textile/hub";
import ethers, { Signer } from "ethers";
import { EventEmitter } from 'events';
import RegistryContract from "./contracts/Registry.json";
import DefaultResolverContract from "./contracts/DefaultResolver.json";
import schemas from "./schemas";

const CONTACT_INDEX_LIMIT = 50;

interface Contact {
  pubKey: string;
  alias: string;
  name: string;
  notifCount?: number;
}

interface InviteMessage {
  from: string;
  id: string;
  body: InviteMessageBody;
}

interface InviteMessageBody {
  type: "ContactInviteAccepted" | "ContactInvite";
  sig: string;
  domain: string;
  dbInfo: string;
  threadId: string;
}

interface Message {
  body: string;
  time: number;
  owner: string | null;
  id: string;
}

interface MessagesIndex {
  currentLength: number;
  limit: number;
  readerDecryptKey: string;
  ownerDecryptKey: string;
  threadId: string;
  dbInfo: string;
  encryptKey: string;
  _id: "index";
}

interface Events {
  contacts: Contact[];
  contactInvites: Contact[];
  contactMessages: Message[];
}

interface TypedEventEmitter<T> {
  on<K extends keyof T>(s: K, listener: (v: T[K]) => void);
  emit<K extends keyof T>(s: K, param: T[K]);
}

const fromHexString = (hexString: string) =>
  new Uint8Array(hexString.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16)));

const toHexString = (byteArray: Uint8Array) => {
  var s = "0x";
  byteArray.forEach((byte) => {
    s += ("0" + (byte & 0xff).toString(16)).slice(-2);
  });
  return s;
};

const registryContract = (provider: ethers.providers.Provider) =>
  new ethers.Contract(RegistryContract.address, RegistryContract.abi, provider);

const resolverContract = (
  provider: ethers.providers.Provider,
  address: string
) => new ethers.Contract(address, DefaultResolverContract.abi, provider);

const getResolverContract = async (
  provider: ethers.providers.Provider,
  domain: string
): Promise<ethers.Contract> => {
  const tokenId = ethers.utils.namehash(domain);
  const RegistryContract = registryContract(provider);
  const resolverAddress = await RegistryContract.resolverOf(tokenId);
  if (!resolverAddress || resolverAddress === `0x${"0".repeat(40)}`) {
    throw new Error("No resolver set");
  }
  const ResolverContract = resolverContract(provider, resolverAddress);
  return ResolverContract;
};

const setRecord = async (
  signer: ethers.Signer,
  domain: string,
  record: {
    key: string;
    value: string;
  }
) => {
  const tokenId = ethers.utils.namehash(domain);
  const ResolverContract = (
    await getResolverContract(signer.provider!, domain)
  ).connect(signer);
  return ResolverContract.set(record.key, record.value, tokenId);
};

const getRecord = async (
  provider: ethers.providers.Provider,
  domain: string,
  key: string
) => {
  const tokenId = ethers.utils.namehash(domain);
  const ResolverContract = await getResolverContract(provider, domain);
  return ResolverContract.get(key, tokenId);
};

const configureDomain = async (
  textileId: PrivateKey,
  domain: string,
  signer: ethers.Signer
): Promise<void> => {
  return setRecord(signer, domain, {
    key: "social.textile.pubkey",
    value: textileId.public.toString(),
  });
};

const getDomainPubKey = (
  provider: ethers.providers.Provider,
  domain: string
) => {
  return getRecord(provider, domain, "social.textile.pubkey");
};

const getIdentity = async (signer: ethers.Signer) => {
  const identificationSignature = await signer.signMessage(
    "*****ONLY SIGN ON TRUSTED APPS*****: By signing this message you will create your Textile identification used for decentralized chat on ThreadsDB"
  );
  return getIdentityFromSignature(identificationSignature);
};

const getIdentityFromSignature = async (signature: string) => {
  const hex = Buffer.from(signature, "utf8");
  const privateKey = ethers.utils.sha256(hex).replace("0x", "");
  return new PrivateKey(fromHexString(privateKey));
};

const loginWithChallenge = (
  domain: string,
  signer: ethers.Signer,
  id: PrivateKey
): Promise<UserAuth> => {
  return new Promise((resolve, reject) => {
    const socketUrl = `ws://localhost:8080/ws/textile-auth`;

    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          domain,
          pubkey: id.public.toString(),
          type: "token",
        })
      );

      socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "error": {
            reject(data.value);
            break;
          }
          case "challenge": {
            const buf = Buffer.from(data.value);
            const signed = await id.sign(buf);

            socket.send(
              JSON.stringify({
                type: "challenge",
                sig: Buffer.from(signed).toJSON(),
              })
            );
            break;
          }
          case "token": {
            resolve({ ...data.value, key: "bk44oyenlgauefar67jn56p7edm" });
            break;
          }
        }
      };
    };
  });
};

const getAndVerifyDomainPubKey = async (
  provider: ethers.providers.Provider,
  domain: string,
  pubKey: string
) => {
  const domainPubKey: string = await getDomainPubKey(provider, domain);
  if (!domainPubKey) {
    throw new Error("Domain does not have chat configured");
  }
  if (domainPubKey !== pubKey) {
    throw new Error("Message does not match domain pubkey");
  }
  return domainPubKey;
};

const auth = async (
  textileId: PrivateKey,
  domain: string,
  signer: ethers.Signer
): Promise<UserAuth> => {
  const userAuth = await loginWithChallenge(domain, signer, textileId);
  return userAuth;
};

const findOrCreateCollection = ({
  threadId,
  client,
  collectionName,
  schema,
  query,
}: {
  threadId: ThreadID;
  client: Client;
  collectionName: string;
  schema: Object;
  query?: Query;
}) => {
  return client.find(threadId, collectionName, query || {}).catch((e) => {
    return client.newCollection(threadId, collectionName, schema);
  });
};

const decryptAndDecode = async (identity: PrivateKey, message: string) => {
  return new TextDecoder().decode(
    await identity.decrypt(Uint8Array.from(message.split(",").map(Number)))
  );
};

const encrypt = async (pubKey: PublicKey, message: string) => {
  return (await pubKey.encrypt(new TextEncoder().encode(message))).toString();
};

const decrypt = async (identity: PrivateKey, message: string) => {
  return await identity.decrypt(
    Uint8Array.from(message.split(",").map(Number))
  );
};

const sendContactInviteAccepted = ({
  domain,
  contactInviteMessage,
  identity,
  users,
  dbInfo,
  threadId,
}: {
  domain: string;
  contactInviteMessage: InviteMessage;
  identity: PrivateKey;
  signer: Signer;
  users: Users;
  dbInfo: DBInfo;
  threadId: ThreadID;
}) => {
  const body: InviteMessageBody = {
    type: "ContactInviteAccepted",
    sig: contactInviteMessage.body.sig,
    domain: domain,
    dbInfo: JSON.stringify(dbInfo),
    threadId: threadId.toString(),
  };
  const recipient = PublicKey.fromString(contactInviteMessage.from);
  return users.sendMessage(
    identity,
    recipient,
    new TextEncoder().encode(JSON.stringify(body))
  );
};

const handleAcceptedContactInvites = async ({
  identity,
  threadId,
  signer,
  users,
  client,
}: {
  identity: Identity;
  threadId: ThreadID;
  signer: Signer;
  users: Users;
  client: Client;
}): Promise<void> => {
  const messages = await users.listInboxMessages();
  await Promise.all(
    messages.map(async (message) => {
      const privateKey = PrivateKey.fromString(identity.toString());
      const body: InviteMessageBody = JSON.parse(
        new TextDecoder().decode(await privateKey.decrypt(message.body))
      );
      if (body.type === "ContactInviteAccepted") {
        const contactAcceptedMessage: InviteMessage = {
          body,
          id: message.id,
          from: message.from,
        };
        return handleAcceptedContactInvite({
          contactAcceptedMessage,
          signer,
          threadId,
          client,
          identity: privateKey,
          users,
        });
      }
      return null;
    })
  );
};

const handleAcceptedContactInvite = async ({
  signer,
  contactAcceptedMessage,
  identity,
  client,
  threadId,
  users,
}: {
  threadId: ThreadID;
  client: Client;
  signer: Signer;
  identity: PrivateKey;
  contactAcceptedMessage: InviteMessage;
  users: Users;
}) => {
  const contactPubKey = await getAndVerifyDomainPubKey(
    signer.provider!,
    contactAcceptedMessage.body.domain,
    contactAcceptedMessage.from
  );
  const sig = await decryptAndDecode(identity, contactAcceptedMessage.body.sig);
  if (sig !== contactPubKey) {
    throw new Error("Signature does not match domainPubKey");
  }
  await contactCreate(client, threadId, contactAcceptedMessage.body.domain);
  await createMessagesIndex({
    threadId,
    contactPubKey,
    client,
    identity,
    contactDbInfo: contactAcceptedMessage.body.dbInfo,
    contactThreadId: contactAcceptedMessage.body.threadId,
  });
  await users.deleteInboxMessage(contactAcceptedMessage.id);
};

const contactCreate = (client: Client, threadId: ThreadID, domain: string) => {
  return client
    .create(threadId, "contacts", [{ domain: domain, _id: domain }])
    .catch((e) => {
      if (e.message === "can't create already existing instance") {
        // Contact already created - ignore error
      } else {
        throw Error(e.message);
      }
    });
};

const createMessagesIndex = async ({
  threadId,
  contactPubKey,
  client,
  identity,
  contactThreadId,
  contactDbInfo,
}: {
  threadId: ThreadID;
  contactPubKey: string;
  client: Client;
  identity: PrivateKey;
  contactThreadId: string;
  contactDbInfo: string;
}) => {
  const messagesIndexCollectionName = contactPubKey + "-index";
  await findOrCreateCollection({
    client,
    threadId,
    collectionName: messagesIndexCollectionName,
    schema: schemas.messagesIndex,
  });
  const contact = PublicKey.fromString(contactPubKey);
  const encryptionWallet = PrivateKey.fromRandom();
  const readerDecryptKey = (
    await contact.encrypt(encryptionWallet.seed)
  ).toString();
  const ownerDecryptKey = (
    await identity.public.encrypt(encryptionWallet.seed)
  ).toString();
  const messagesIndex: MessagesIndex = {
    currentLength: 0,
    limit: CONTACT_INDEX_LIMIT,
    readerDecryptKey,
    ownerDecryptKey,
    encryptKey: encryptionWallet.public.toString(),
    threadId: contactThreadId,
    dbInfo: contactDbInfo,
    _id: "index",
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
        throw Error(e.message);
      }
    });
  await findOrCreateCollection({
    client,
    threadId,
    collectionName: contactPubKey + "-0",
    schema: schemas.messages,
  });
  return messagesIndex;
};

const getMessagesIndex = async ({
  client,
  threadId,
  pubKey,
}: {
  threadId: ThreadID;
  client: Client;
  pubKey: string;
}): Promise<MessagesIndex> => {
  const q = new Where("_id").eq("index");
  const collection = await client.find(threadId, pubKey + "-index", q);
  return collection.instancesList[0];
};

const messagesCollectionCreate = async ({
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
  const collectionName = contactPubKey + "-" + indexNumber.toString();
  return findOrCreateCollection({
    client,
    threadId,
    collectionName,
    schema: schemas.messages,
  });
};

export default class TextileChat {

  domain: string;
  contactsList: Contact[];
  contactInvitesList: Contact[];
  activeContact: string;
  identity: Identity;
  client: Client;
  userAuth: UserAuth;
  signer: Signer;
  threadId: ThreadID;
  users: Users;

  constructor() {
    this.domain = '';
    this.contactsList = [];
    this.contactInvitesList = [];
    // this.activeContact = null;
    // this.identity = null;
    // this.client = null;
    // this.userAuth = null;
    // this.signer = null;
    // this.threadId = null;
    // this.users = null
  }

  async join(username: string, password: string, domain: string) {
    return new Promise(async (resolve) => {
      if (!(window as any).ethereum) {
        return window.alert(
          "Unable to detect a web3 wallet. Visit https://metamask.io/ to download a web3 compatible wallet."
        );
      }
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      await (window as any).ethereum.enable();
      const signer = provider.getSigner();
      const identity = await getIdentity(signer);
      const domainPubKey = await getDomainPubKey(signer.provider, this.domain);
      if (!domainPubKey) {
        await configureDomain(identity, this.domain, signer);
      } else if (identity.public.toString() === domainPubKey) {
        const userAuth = await auth(identity, this.domain, signer);
        const client = Client.withUserAuth(userAuth);
        const users = Users.withUserAuth(userAuth);
        let threadId: ThreadID = ThreadID.fromRandom();
        try {
          const thread = await client.getThread("unstoppable-chat");
          if (thread) {
            threadId = ThreadID.fromString(thread.id);
          }
        } catch {
          threadId = await client.newDB(threadId, "unstoppable-chat");
        }
        this.identity = identity;
        this.userAuth = userAuth;
        this.signer = signer;
        this.threadId = threadId;
        this.client = client;
        this.users = users;
        client
          .find(threadId, "contacts", {})
          .catch(() => {
            return client.newCollection(threadId, "contacts", schemas.contacts);
          })
        
        resolve();
      } else {
        window.alert(
          "Domain record does not match id. Would you like to reconfigure your domain?"
        );
      }
    })
  }

  deleteContacts(
    contactIds: string[]
  ) {
    if(!this.client || !this.threadId) return;
    return this.client.delete(this.threadId, "contacts", contactIds);
  };
  
  async deleteAllContacts () {
    if(!this.client || !this.threadId) return;
    const contacts = await this.client.find(this.threadId, "contacts", {});
    this.deleteContacts(
      contacts.instancesList.map((contact) => contact._id)
    );
  };
  
  async getContacts () {
    if(!this.client || !this.threadId) return;
    const emitter = new EventEmitter();
    this.client.find(this.threadId, "contacts", {}).then((result) => {
      emitter.emit('contacts', result.instancesList.map((contact) => {
        return { domain: contact.domain, id: contact._id };
      }));
    });
  };
  
  async sendContactInvite (contactDomain: string) {
    if(!this.signer || !this.identity || !this.client || !this.domain || !this.threadId || !this.users) return;
    const domainPubKey = await getDomainPubKey(this.signer.provider!, contactDomain);
    if (!domainPubKey) {
      throw new Error("Domain does not have pubkey set");
    }
    const recipient = PublicKey.fromString(domainPubKey);
    const sig = await encrypt(PublicKey.fromString(this.identity.public.toString()), domainPubKey);
    const dbInfo = await this.client.getDBInfo(this.threadId);
    const contactInviteMessage: InviteMessageBody = {
      type: "ContactInvite",
      sig,
      domain: this.domain,
      dbInfo: JSON.stringify(dbInfo),
      threadId: this.threadId.toString(),
    };
    await this.users.sendMessage(
      this.identity,
      recipient,
      new TextEncoder().encode(JSON.stringify(contactInviteMessage))
    );
  };
  
  async getInvites () {
    if(!this.users || !this.identity) return;
    const messages = await this.users.listInboxMessages();
    const privateKey = PrivateKey.fromString(this.identity.toString())
    const contactInvites = (
      await Promise.all(
        messages.map(async (message) => {
          const body: InviteMessageBody = JSON.parse(
            new TextDecoder().decode(await privateKey.decrypt(message.body))
          );
          if (body.type === "ContactInvite") {
            return { body, from: message.from, id: message.id };
          }
          return null;
        })
      )
    ).filter((x): x is InviteMessage => x !== null);
    handleAcceptedContactInvites({
      identity: this.identity,
      threadId: this.threadId,
      signer: this.signer,
      users: this.users,
      client: this.client
    });
    return contactInvites;
  };
  
  async acceptContactInvite (contactInviteMessage) {
    if(!this.signer || !this.client || !this.threadId || !this.users || !this.identity || !this.domain) return;
    const contactPubKey: string = await getAndVerifyDomainPubKey(
      this.signer.provider!,
      contactInviteMessage.body.domain,
      contactInviteMessage.from
    );
    const dbInfo = await this.client.getDBInfo(this.threadId);
    const privateKey = PrivateKey.fromString(this.identity.toString())
    await contactCreate(this.client, this.threadId, contactInviteMessage.body.domain);
    await sendContactInviteAccepted({
      threadId: this.threadId,
      users: this.users,
      identity: privateKey,
      dbInfo,
      signer: this.signer,
      contactInviteMessage,
      domain: this.domain,
    });
    await createMessagesIndex({
      threadId: this.threadId,
      contactPubKey,
      identity: privateKey,
      client: this.client,
      contactThreadId: contactInviteMessage.body.threadId,
      contactDbInfo: contactInviteMessage.body.dbInfo,
    });
    await this.users.deleteInboxMessage(contactInviteMessage.id);
  };
  
  async declineInvite (contactInviteMessage) {
    if(!this.users) return;
    await this.users.deleteInboxMessage(contactInviteMessage.id);
  };

  async sendMessage (contactPubKey, msg, msgIndex, index) {
    if(!this.client || !this.threadId) return;
    const pubKey = PublicKey.fromString(msgIndex.encryptKey);
    const message: Message = {
      time: Date.now(),
      body: await encrypt(pubKey, msg),
      owner: "",
      id: "",
    };
    return this.client.create(this.threadId, contactPubKey + "-" + index.toString(), [
      message,
    ]);
  };
  
  const loadContactMessages = async (
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
    const emitter = new EventEmitter();
    const collectionName = pubKey + "-" + index.toString();
    const msgs = (await client.find(threadId, collectionName, {})).instancesList;
    const messageList: Message[] = [];
    await Promise.all(
      msgs.map(async (msg) => {
        const decryptedBody = await decryptAndDecode(decryptKey, msg.body);
        messageList.push({
          body: decryptedBody,
          time: msg.time,
          owner: name,
          id: msg._id,
        });
      })
    );
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
    const collectionName = pubKey + "-" + index.toString();
    const emitter = new events.EventEmitter();
    emitter.on("newMessage", cb);
    client.listen(threadId, [{ collectionName }], async (msg: any) => {
      if (!msg.instance) {
        return;
      }
      const decryptedBody = await decryptAndDecode(decryptKey, msg.instance.body);
      emitter.emit("newMessage", [
        {
          body: decryptedBody,
          time: msg.instance.time,
          owner: name,
          id: msg._id,
        },
      ]);
    });
  };

}
