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
import schemas from "./helpers/schemas";
import {
  getIdentity,
  auth,
  getRecord,
  configureDomain,
  getDomainPubKey,
  getAndVerifyDomainPubKey,
  encrypt,
  decrypt,
  decryptAndDecode
} from "./helpers/index";
import * as contacts from "./helpers/contacts";
import * as messages from "./helpers/messages";

export default class TextileChat {

  domain: string;
  contactsList: [];
  contactInvitesList: any[];
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
  }

  async join(domain: string) {
    return new Promise(async (resolve) => {
      this.domain = domain;
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
        await users.getToken(identity);
        await client.getToken(identity);
        let threadId: ThreadID = ThreadID.fromRandom();
        try {
          const thread = await users.getThread("unstoppable-chat");
          if (thread) {
            threadId = thread.id;
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
        const mailboxId = await users.getMailboxID().catch(() => null);
        if (!mailboxId) {
          await users.setupMailbox();
        }
        // try{
        //   const c: any = await client.find(threadId, "contacts", {});
        //   await client.delete(threadId, "contacts", c.map((contact: any) => contact._id));
        // } catch {

        // }
        // await client.deleteCollection(threadId, 'contacts');
        await contacts.configure({identity, threadId, signer, users, client});
        resolve();
      } else {
        window.alert(
          "Domain record does not match id. Would you like to reconfigure your domain?"
        );
      }
    })
  }

  async deleteContact(contactDomain: string){
    if(!this.client || !this.threadId) return;
    const q = new Where("domain").eq(contactDomain);
    const contact: any = (await this.client.find(this.threadId, 'contacts', q))[0];
    if(contact) {
      await this.client.delete(this.threadId, "contacts", [contact._id]);
    }
  }
  
  async getContacts (cb) {
    if(!this.client || !this.threadId) return;
    const emitter = new EventEmitter();
    emitter.on('contacts', cb)
    const contacts: {domain: string, id: string}[] = [];
    const q = new Where("owner").eq(this.identity.public.toString());
    this.client.find(this.threadId, "contacts", q).then((result) => {
      result.map((contact: any) => {
        contacts.push({ domain: contact.domain, id: contact._id });
      });
      emitter.emit('contacts', contacts);
    }).catch(() => {
    });
    this.client.listen(this.threadId, [{collectionName: 'contacts'}], async (contact) => {
      if(!contact || !contact.instance) return;
      contacts.push({ domain: contact.instance.domain, id: contact.instance._id });
      emitter.emit('contacts', contacts);
    })

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
    const contactInviteMessage: contacts.InviteMessageBody = {
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
  
  async getInvites (cb) {
    if(!this.users || !this.identity) return;
    const emitter = new EventEmitter();
    emitter.on('invites', cb)
    const messages = await this.users.listInboxMessages();
    const privateKey = PrivateKey.fromString(this.identity.toString())
    this.contactInvitesList = (
      await Promise.all(
        messages.map(async (message) => {
          const body: contacts.InviteMessageBody = JSON.parse(
            new TextDecoder().decode(await privateKey.decrypt(message.body))
          );
          if (body.type === "ContactInvite") {
            return { body, from: message.from, id: message.id };
          }
          return null;
        })
      )
    ).filter((x): x is contacts.InviteMessage => x !== null);
    emitter.emit('invites', this.contactInvitesList);
    
    contacts.handleAcceptedInvites({
      privateKey: privateKey,
      identity: this.identity,
      threadId: this.threadId,
      signer: this.signer,
      users: this.users,
      client: this.client
    });

    //LISTEN FOR NEW INVITES
    const mailboxID = await this.users.getMailboxID();
    this.users.watchInbox(mailboxID, async (reply) => {
      if (reply && reply.message) {
        const message = reply.message;
        const body: contacts.InviteMessageBody = JSON.parse(
          new TextDecoder().decode(await privateKey.decrypt(message.body))
        );
        if (body.type === "ContactInvite") {
          const contactInviteMessage: contacts.InviteMessage = {
            body,
            from: message.from,
            id: message.id,
          };
          this.contactInvitesList.push(contactInviteMessage);
          emitter.emit('invites', this.contactInvitesList);
        }
        if (body.type === "ContactInviteAccepted") {
          const contactAcceptedMessage: contacts.InviteMessage = {
            body,
            from: message.from,
            id: message.id,
          };
          contacts.handleAcceptedInvite({
            signer: this.signer,
            contactAcceptedMessage,
            identity: this.identity,
            privateKey,
            client: this.client,
            threadId: this.threadId,
            users: this.users,
          })
        }
      }
    });
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
    await contacts.contactCreate(this.client, this.threadId, contactInviteMessage.body.domain, this.identity);
    await contacts.sendInviteAccepted({
      threadId: this.threadId,
      users: this.users,
      privateKey: privateKey,
      dbInfo,
      signer: this.signer,
      contactInviteMessage,
      domain: this.domain,
    });
    await messages.createIndex({
      threadId: this.threadId,
      contactPubKey,
      privateKey: privateKey,
      client: this.client,
      contactThreadId: contactInviteMessage.body.threadId,
      contactDbInfo: contactInviteMessage.body.dbInfo,
      identity: this.identity
    });
    await this.users.deleteInboxMessage(contactInviteMessage.id);
  };
  
  async declineInvite (contactInviteMessage) {
    if(!this.users) return;
    await this.users.deleteInboxMessage(contactInviteMessage.id);
    this.contactInvitesList.splice(this.contactInvitesList.indexOf(contactInviteMessage), 1);
  };

  async sendMessage (contactDomain, msg, index) {
    if(!this.client || !this.threadId) return;
    const contactPubKey = await getDomainPubKey(
      this.signer.provider!,
      contactDomain
    );
    const msgIndex = await messages.getIndex({
      client: this.client,
      threadId: this.threadId,
      pubKey: contactPubKey,
    });
    const pubKey = PublicKey.fromString(msgIndex.encryptKey);
    const message: messages.Message = {
      time: Date.now(),
      body: await encrypt(pubKey, msg),
      owner: this.identity.public.toString(),
      id: "",
    };
    return this.client.create(this.threadId, contactPubKey + "-" + index.toString(), [
      message,
    ]);
  };
  
  async loadContactMessages (contactDomain, index, cb){
    if(!this.client || !this.threadId || !this.userAuth || !this.identity || !this.signer) return;
    const emitter = new EventEmitter();
    emitter.on("newMessage", cb);
    const _contactPubKey = await getDomainPubKey(
      this.signer.provider!,
      contactDomain
    );
    const _messagesIndex = await messages.getIndex({
      client: this.client,
      threadId: this.threadId,
      pubKey: _contactPubKey,
    });
    const _contactClient = await Client.withUserAuth(this.userAuth);
    try {
      // TODO: Ask textile about dbInfo
      await _contactClient.joinFromInfo(JSON.parse(_messagesIndex.dbInfo));
    } catch (e) {
      if (e.message === "db already exists") {
        // ignore, probably using same textile id
      } else {
        throw new Error(e.message);
      }
    }
    const contactThreadId = ThreadID.fromString(_messagesIndex.threadId);
    const contactMessageIndex: messages.MessagesIndex = await messages.getIndex(
      {
        client: _contactClient,
        threadId: contactThreadId,
        pubKey: this.identity.public.toString(),
      }
    );
    const privateKey = PrivateKey.fromString(this.identity.toString())
    const ownerDecryptKey = new PrivateKey(
      await decrypt(privateKey, _messagesIndex.ownerDecryptKey)
    );
    const readerDecryptKey = new PrivateKey(
      await decrypt(privateKey, contactMessageIndex.readerDecryptKey)
    );

    const messageList: messages.Message[] = [];

    const loadMessages = async (
      pubKey,
      client,
      threadId,
      decryptKey,
      name,
      index
    ) => {
      const collectionName = pubKey + "-" + index.toString();
      const q = new Where("owner").eq(pubKey);
      const msgs = (await client.find(threadId, collectionName, q));
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
      emitter.emit('newMessage', messageList);
      client.listen(threadId, [{ collectionName }], async (msg: any) => {
        if (!msg.instance) {
          return;
        }
        const decryptedBody = await decryptAndDecode(decryptKey, msg.instance.body);
        messageList.push({
          body: decryptedBody,
          time: msg.instance.time,
          owner: name,
          id: msg._id,
        })
        messageList.sort((a, b) => a.time - b.time);
        emitter.emit('newMessage', messageList);
      });
    }
    loadMessages(
      _contactPubKey,
      this.client,
      this.threadId,
      ownerDecryptKey,
      this.domain,
      index,
    );
    loadMessages(
      this.identity.public.toString(),
      _contactClient,
      contactThreadId,
      readerDecryptKey,
      contactDomain,
      index
    );

  };

}
