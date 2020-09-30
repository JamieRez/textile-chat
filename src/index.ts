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
  Where,
} from '@textile/hub';
import ethers, { Signer } from 'ethers';
import { EventEmitter } from 'events';
import schemas from './helpers/schemas';
import {
  getIdentity,
  auth,
  getDomainPubKey,
  getAndVerifyDomainPubKey,
  encrypt,
  decrypt,
  decryptAndDecode,
  getChatThreadId,
} from './helpers';
import * as contacts from './helpers/contacts';
import * as messages from './helpers/messages';
import ChatError, { ChatErrorCode } from './errors';

export type Events = 'contacts' | 'invites' | 'messages';
export type EventCallbackParams = {
  invites: contacts.InviteMessage[];
  contacts: { domain: string; id: string }[];
  messages: messages.Message[];
};
export default class TextileChat {
  domain: string;
  contactsList: [];
  contactInvitesList: [];
  activeContact: string;
  identity: Identity;
  client: Client;
  userAuth: UserAuth;
  signer: Signer;
  threadId: ThreadID;
  users: Users;
  provider: ethers.providers.Web3Provider;
  emitter: EventEmitter;

  constructor(domain: string, web3Provider: ethers.providers.Web3Provider) {
    this.domain = domain;
    this.contactsList = [];
    this.contactInvitesList = [];
    this.provider = web3Provider;
    this.signer = this.provider.getSigner();
    this.emitter = new EventEmitter();
  }

  async init() {
    const identity = await getIdentity(this.signer);
    const domainPubKey = await getDomainPubKey(this.provider, this.domain);
    if (!domainPubKey) {
      throw new ChatError(ChatErrorCode.UnconfiguredDomain, {
        domain: this.domain,
      });
    }
    if (identity.public.toString() !== domainPubKey) {
      throw new ChatError(ChatErrorCode.InvalidPubKey, {
        domain: this.domain,
        pubKey: domainPubKey,
        expected: identity.public.toString(),
      });
    }
    const userAuth = await auth(identity, this.domain, this.signer);
    this.identity = identity;
    this.userAuth = userAuth;
    this.client = Client.withUserAuth(userAuth);
    this.users = Users.withUserAuth(userAuth);
    await this.users.getToken(identity);
    await this.client.getToken(identity);
    this.threadId = await getChatThreadId(this.client);
    this.client.find(this.threadId, 'contacts', {}).catch(() => {
      return this.client.newCollection(
        this.threadId,
        'contacts',
        schemas.contacts,
      );
    });
    const mailboxId = await this.users.getMailboxID().catch(() => null);
    if (!mailboxId) {
      await this.users.setupMailbox();
    }
  }

  on<Event extends Events>(
    event: Event,
    cb: (params: EventCallbackParams[Event]) => void,
  ) {
    this.emitter.on(event, cb);
  }

  async deleteContact(contactDomain: string) {
    const q = new Where('domain').eq(contactDomain);
    const contact = (await this.client.find(this.threadId, 'contacts', q))
      .instancesList[0];
    if (contact) {
      return this.client.delete(this.threadId, 'contacts', [contact._id]);
    }
  }

  async getContacts(
    cb: (contacts: Array<{ domain: string; id: string }>) => void,
  ) {
    const contacts: { domain: string; id: string }[] = [];
    this.client.find(this.threadId, 'contacts', {}).then((result) => {
      result.instancesList.map((contact) => {
        contacts.push({ domain: contact.domain, id: contact._id });
      });
      this.emitter.emit('contacts', contacts);
    });
    this.client.listen(
      this.threadId,
      [{ collectionName: 'contacts' }],
      async (contact) => {
        if (!contact?.instance) {
          return;
        }
        contacts.push({
          domain: contact.instance.domain,
          id: contact.instance._id,
        });
        this.emitter.emit('contacts', contacts);
      },
    );
  }

  async sendContactInvite(contactDomain: string) {
    const domainPubKey = await getDomainPubKey(
      this.signer.provider!,
      contactDomain,
    );
    if (!domainPubKey) {
      throw new ChatError(ChatErrorCode.UnconfiguredDomain, {
        domain: contactDomain,
      });
    }
    const recipient = PublicKey.fromString(domainPubKey);
    const sig = await encrypt(
      PublicKey.fromString(this.identity.public.toString()),
      domainPubKey,
    );
    const dbInfo = await this.client.getDBInfo(this.threadId);
    const contactInviteMessage: contacts.InviteMessageBody = {
      type: 'ContactInvite',
      sig,
      domain: this.domain,
      dbInfo: JSON.stringify(dbInfo),
      threadId: this.threadId.toString(),
    };
    return this.users.sendMessage(
      this.identity,
      recipient,
      new TextEncoder().encode(JSON.stringify(contactInviteMessage)),
    );
  }

  async getInvites(cb: (contactInvites: contacts.InviteMessage[]) => void) {
    const messages = await this.users.listInboxMessages();
    const privateKey = PrivateKey.fromString(this.identity.toString());
    const contactInvites: contacts.InviteMessage[] = [];
    for (const message of messages) {
      const body: contacts.InviteMessageBody = JSON.parse(
        new TextDecoder().decode(await privateKey.decrypt(message.body)),
      );
      if (body.type === 'ContactInvite') {
        contactInvites.push({ body, from: message.from, id: message.id });
      }
    }
    this.emitter.emit('invites', contactInvites);

    contacts.handleAcceptedInvites({
      identity: privateKey,
      threadId: this.threadId,
      signer: this.signer,
      users: this.users,
      client: this.client,
    });

    //LISTEN FOR NEW INVITES
    const mailboxID = await this.users.getMailboxID();
    this.users.watchInbox(mailboxID, async (reply) => {
      if (reply && reply.message) {
        const message = reply.message;
        const body: contacts.InviteMessageBody = JSON.parse(
          new TextDecoder().decode(await privateKey.decrypt(message.body)),
        );
        if (body.type === 'ContactInvite') {
          const contactInviteMessage: contacts.InviteMessage = {
            body,
            from: message.from,
            id: message.id,
          };
          contactInvites.push(contactInviteMessage);
          this.emitter.emit('invites', contactInviteMessage);
        }
        if (body.type === 'ContactInviteAccepted') {
          const contactAcceptedMessage: contacts.InviteMessage = {
            body,
            from: message.from,
            id: message.id,
          };
          contacts.handleAcceptedInvite({
            signer: this.signer,
            contactAcceptedMessage,
            identity: privateKey,
            client: this.client,
            threadId: this.threadId,
            users: this.users,
          });
        }
      }
    });
  }

  async acceptContactInvite(contactInviteMessage: contacts.InviteMessage) {
    const contactPubKey: string = await getAndVerifyDomainPubKey(
      this.signer.provider!,
      contactInviteMessage.body.domain,
      contactInviteMessage.from,
    );
    const dbInfo = await this.client.getDBInfo(this.threadId);
    const privateKey = PrivateKey.fromString(this.identity.toString());
    await contacts.contactCreate(
      this.client,
      this.threadId,
      contactInviteMessage.body.domain,
    );
    await contacts.sendInviteAccepted({
      threadId: this.threadId,
      users: this.users,
      identity: privateKey,
      dbInfo,
      signer: this.signer,
      contactInviteMessage,
      domain: this.domain,
    });
    await messages.createIndex({
      threadId: this.threadId,
      contactPubKey,
      identity: privateKey,
      client: this.client,
      contactThreadId: contactInviteMessage.body.threadId,
      contactDbInfo: contactInviteMessage.body.dbInfo,
    });
    await this.users.deleteInboxMessage(contactInviteMessage.id);
  }

  async declineInvite(contactInviteMessage: contacts.InviteMessage) {
    return this.users.deleteInboxMessage(contactInviteMessage.id);
  }

  async sendMessage(contactDomain: string, msg: string, index: number) {
    const contactPubKey = await getDomainPubKey(
      this.signer.provider!,
      contactDomain,
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
      owner: '',
      id: '',
    };
    return this.client.create(
      this.threadId,
      contactPubKey + '-' + index.toString(),
      [message],
    );
  }

  async loadMessages(
    pubKey: string,
    client: Client,
    threadId: ThreadID,
    decryptKey: PrivateKey,
    name: string,
    index: number,
  ) {
    const messageList: messages.Message[] = [];
    const collectionName = pubKey + '-' + index.toString();
    const msgs = (await client.find(threadId, collectionName, {}))
      .instancesList;
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
    this.emitter.emit('messages', messageList);
    client.listen(threadId, [{ collectionName }], async (msg: any) => {
      if (!msg.instance) {
        return;
      }
      const decryptedBody = await decryptAndDecode(
        decryptKey,
        msg.instance.body,
      );
      messageList.push({
        body: decryptedBody,
        time: msg.instance.time,
        owner: name,
        id: msg._id,
      });
      messageList.sort((a, b) => a.time - b.time);
      this.emitter.emit('messages', messageList);
    });
  }

  async loadContactMessages(
    contactDomain: string,
    index: number,
    cb: () => void,
  ) {
    if (this.activeContact) {

    }
    this.activeContact = contactDomain;
    const _contactPubKey = await getDomainPubKey(
      this.signer.provider!,
      contactDomain,
    );
    const _messagesIndex = await messages.getIndex({
      client: this.client,
      threadId: this.threadId,
      pubKey: _contactPubKey,
    });
    const _contactClient = await Client.withUserAuth(this.userAuth);
    try {
      await _contactClient.joinFromInfo(JSON.parse(_messagesIndex.dbInfo));
    } catch (e) {
      if (e.message === 'db already exists') {
        // ignore, probably using same textile id
      } else {
        throw new ChatError(ChatErrorCode.UnknownError, {
          errorMessage: e.message,
        });
      }
    }
    const contactThreadId = ThreadID.fromString(_messagesIndex.threadId);
    const contactMessageIndex: messages.MessagesIndex = await messages.getIndex(
      {
        client: _contactClient,
        threadId: contactThreadId,
        pubKey: this.identity.public.toString(),
      },
    );
    const privateKey = PrivateKey.fromString(this.identity.toString());
    const ownerDecryptKey = new PrivateKey(
      await decrypt(privateKey, _messagesIndex.ownerDecryptKey),
    );
    const readerDecryptKey = new PrivateKey(
      await decrypt(privateKey, contactMessageIndex.readerDecryptKey),
    );

    this.loadMessages(
      _contactPubKey,
      this.client,
      this.threadId,
      ownerDecryptKey,
      this.domain,
      index,
    );
    this.loadMessages(
      this.identity.public.toString(),
      _contactClient,
      contactThreadId,
      readerDecryptKey,
      contactDomain,
      index,
    );
  }
}
