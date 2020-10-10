import {
  PrivateKey,
  Users,
  UserAuth,
  ThreadID,
  Client,
  PublicKey,
  Identity,
  DBInfo,
  Where,
  Buckets
} from "@textile/hub";
import ethers, { Signer } from "ethers";
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
  getFunctionBody
} from './helpers';
import * as contacts from './helpers/contacts';
import * as channels from './helpers/channels';
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
  contactsList: any[];
  contactInvitesList: any[];
  channelsList: any[];
  channelInvitesList: any[];
  activeContact: string;
  identity: Identity;
  client: Client;
  userAuth: UserAuth;
  signer: Signer;
  threadId: ThreadID;
  users: Users;
  provider: ethers.providers.Web3Provider;
  emitter: EventEmitter;
  activeContactListeners: Array<{ close: () => void }> = [];
  textileSocketUrl: string;

  constructor(
    domain: string,
    textileSocketUrl: string,
    web3Provider: ethers.providers.Web3Provider,
  ) {
    this.textileSocketUrl = textileSocketUrl;
    this.domain = domain;
    this.contactsList = [];
    this.contactInvitesList = [];
    this.channelsList = [];
    this.channelInvitesList = [];
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
    const userAuth = await auth(
      this.textileSocketUrl,
      identity,
      this.domain,
      this.signer,
    );
    this.identity = identity;
    this.userAuth = userAuth;
    this.client = Client.withUserAuth(userAuth);
    this.users = Users.withUserAuth(userAuth);
    await this.users.getToken(identity);
    await this.client.getToken(identity);
    this.threadId = await getChatThreadId(this.users, this.client);
    const writeValidatorStr = `let ownerPub = '${this.identity.public.toString()}';
if (writer === ownerPub) {
  return true;
}
return false;
`;
    // await this.client.deleteCollection(this.threadId, 'contacts');
    try {
      await this.client.newCollection(this.threadId, {
        name: 'contacts',
        schema: schemas.contacts,
        // writeValidator: writeValidatorStr
      });
    } catch (e) {
      console.log(e)
    }
    // const ids:any[] = [];
    // const cs = await this.client.find(this.threadId, 'channels', {});
    // cs.forEach((c:any) => {
    //   ids.push(c._id);
    // })
    // await this.client.delete(this.threadId, 'channels', ids);
    // await this.client.deleteCollection(this.threadId, 'channels');
    try {
      await this.client.newCollection(this.threadId, {
        name: 'channels',
        schema: schemas.channels,
        // writeValidator: writeValidatorStr
      });
    } catch (e) {
      console.log(e)
    }
    // await this.client.deleteCollection(this.threadId, 'channelsIndex');
    try {
      await this.client.newCollection(this.threadId, {
        name: 'channelsIndex',
        schema: schemas.channelsIndex,
        // writeValidator: writeValidatorStr
      });
    } catch (e) {
      console.log(e)
    }
    const mailboxId = await this.users.getMailboxID().catch(() => null);
    if (!mailboxId) {
      await this.users.setupMailbox();
    }
  }

  async deleteContact(contactDomain: string) {
    const q = new Where('domain').eq(contactDomain);
    const contact: any = (
      await this.client.find(this.threadId, 'contacts', q)
    )[0];
    if (contact) {
      return this.client.delete(this.threadId, 'contacts', [contact._id]);
    }
  }

  async getContacts(cb: (contact: { domain: string; id: string }) => void) {
    this.emitter.on('contact', cb);
    this.contactsList = [];
    const q = new Where("owner").eq(this.identity.public.toString());
    this.client.find(this.threadId, 'contacts', q).then((result: any) => {
      result.map((contact) => {
        this.contactsList.push({ domain: contact.domain, id: contact._id });
      });
    });
    this.client.listen(
      this.threadId,
      [{ collectionName: 'contacts' }],
      async (contact) => {
        if (!contact?.instance) {
          return;
        }
        this.emitter.emit('contact', {
          domain: contact.instance.domain,
          id: contact.instance._id,
        });
      },
    );
    return this.contactsList;
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

  async getContactInvites(cb: (contactInvites: contacts.InviteMessage[]) => void) {
    const messages = await this.users.listInboxMessages();
    const privateKey = PrivateKey.fromString(this.identity.toString());
    this.contactInvitesList  = [];
    this.emitter.on('contactInvite', cb);
    for (const message of messages) {
      const body: contacts.InviteMessageBody = JSON.parse(
        new TextDecoder().decode(await privateKey.decrypt(message.body)),
      );
      if (body.type === 'ContactInvite') {
        this.contactInvitesList.push({ body, from: message.from, id: message.id });
      }
    }
    contacts.handleAcceptedInvites({
      identity: this.identity,
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
          this.emitter.emit('contactInvite', contactInviteMessage);
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
            identity: this.identity,
            client: this.client,
            threadId: this.threadId,
            users: this.users,
          });
        }
      }
    });
    return this.contactInvitesList;
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
      this.identity
    );
    await contacts.sendInviteAccepted({
      threadId: this.threadId,
      users: this.users,
      privateKey: privateKey,
      dbInfo,
      signer: this.signer,
      contactInviteMessage,
      domain: this.domain,
    });
    await messages.createContactIndex({
      threadId: this.threadId,
      contactPubKey,
      privateKey: privateKey,
      client: this.client,
      contactThreadId: contactInviteMessage.body.threadId,
      contactDbInfo: contactInviteMessage.body.dbInfo,
      identity: this.identity
    });
    await this.users.deleteInboxMessage(contactInviteMessage.id);
  }

  async declineContactInvite(contactInviteMessage: contacts.InviteMessage) {
    return this.users.deleteInboxMessage(contactInviteMessage.id);
  }

  async sendContactMessage(contactDomain: string, msg: string, index: number) {
    const contactPubKey = await getDomainPubKey(
      this.signer.provider!,
      contactDomain,
    );
    const msgIndex = await messages.getContactIndex({
      client: this.client,
      threadId: this.threadId,
      pubKey: contactPubKey,
    });
    const pubKey = PublicKey.fromString(msgIndex.encryptKey);
    const message: messages.Message = {
      time: Date.now(),
      body: await encrypt(pubKey, msg),
      owner: this.identity.public.toString(),
      domain: '',
      id: '',
    };
    return this.client.create(
      this.threadId,
      contactPubKey + '-' + index.toString(),
      [message],
    );
  }

  async _loadContactMessages(
    contactPubKey,
    client,
    pubKey,
    threadId,
    decryptKey,
    name,
    index,
  ) {
    const messageList: messages.Message[] = [];
    const collectionName = contactPubKey + '-' + index.toString();
    const q = new Where("owner").eq(pubKey);
    const msgs: any[] = await client.find(threadId, collectionName, q);
    for (const msg of msgs) {
      const decryptedBody = await decryptAndDecode(decryptKey, msg.body);
      messageList.push({
        body: decryptedBody,
        time: msg.time,
        owner: name,
        id: msg._id,
        domain: ''
      });
    }
    messageList.sort((a, b) => a.time - b.time);
    return messageList;
  }

  async _listenContactMessages(
    contactPubKey: string,
    client: Client,
    pubKey: string,
    threadId: ThreadID,
    decryptKey: PrivateKey,
    name: string,
    index: number,
    cb: (message: messages.Message) => void,
  ): Promise<{ close: () => void }> {
    const collectionName = contactPubKey + '-' + index.toString();
    return client.listen(threadId, [{ collectionName }], async (msg: any) => {
      if (!msg.instance || (msg.instance.owner !== pubKey)) {
        return;
      }
      const decryptedBody = await decryptAndDecode(
        decryptKey,
        msg.instance.body,
      );
      const message = {
        body: decryptedBody,
        time: msg.instance.time,
        owner: name,
        id: msg._id,
        domain: ''
      };
      cb(message);
    });
  }

  async loadContactMessages(
    contactDomain: string,
    index: number,
    cb: (message: messages.Message) => void,
  ): Promise<messages.Message[]> {
    if (this.activeContactListeners) {
      for (const listener of this.activeContactListeners) {
        listener.close();
      }
    }
    this.activeContactListeners = [];
    const _contactPubKey = await getDomainPubKey(
      this.signer.provider!,
      contactDomain,
    );
    const _messagesIndex = await messages.getContactIndex({
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
    const contactMessageIndex: messages.ContactMessagesIndex = await messages.getContactIndex(
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

    const messageList: messages.Message[] = [];
    const owner = [
      _contactPubKey,
      this.client,
      this.identity.public.toString(),
      this.threadId,
      ownerDecryptKey,
      this.domain,
      index,
    ];
    const contact = [
      this.identity.public.toString(),
      _contactClient,
      _contactPubKey,
      contactThreadId,
      readerDecryptKey,
      contactDomain,
      index,
    ];
    messageList.push(...(await this._loadContactMessages.apply(this, owner)));
    messageList.push(...(await this._loadContactMessages.apply(this, contact)));
    this.activeContactListeners.push(
      await this._listenContactMessages.apply(this, [...owner, cb]),
    );
    this.activeContactListeners.push(
      await this._listenContactMessages.apply(this, [...contact, cb]),
    );
    return messageList;

  };

  async archiveContactMessages(contactDomain, index, cb){
    const contactPubKey = await getDomainPubKey(
      this.signer.provider!,
      contactDomain
    );
    const ownerMessagesIndex = await messages.getContactIndex({
      client: this.client,
      threadId: this.threadId,
      pubKey: contactPubKey,
    });
    const contactClient = await Client.withUserAuth(this.userAuth);
    try {
      await contactClient.joinFromInfo(JSON.parse(ownerMessagesIndex.dbInfo));
    } catch (e) {
      if (e.message === "db already exists") {
      } else {
        throw new Error(e.message);
      }
    }
    const contactThreadId = ThreadID.fromString(ownerMessagesIndex.threadId);
    const contactMessageIndex: messages.ContactMessagesIndex = await messages.getContactIndex(
      {
        client: contactClient,
        threadId: contactThreadId,
        pubKey: this.identity.public.toString(),
      }
    )

    const archive: any = {
      members : {},
      msgs: []
    };
    archive.members[this.domain] = {
      pubKey : this.identity.public.toString(),
      ownerDecryptKey: ownerMessagesIndex.ownerDecryptKey,
      readerDecryptKey: ownerMessagesIndex.readerDecryptKey,
      threadId: this.threadId
    }
    archive.members[contactDomain] = {
      pubKey : contactPubKey,
      ownerDecryptKey: contactMessageIndex.ownerDecryptKey,
      readerDecryptKey: contactMessageIndex.readerDecryptKey,
      threadId: contactThreadId
    }

    const ownQ = new Where("owner").eq(this.identity.public.toString());
    const ownMsgs = (await this.client.find(this.threadId, contactPubKey + "-" + index.toString(), ownQ));
    const contactQ = new Where("owner").eq(contactPubKey);
    const contactMsgs = (await contactClient.find(contactThreadId, this.identity.public.toString() + "-" + index.toString(), contactQ));
    archive.msgs = [...ownMsgs, ...contactMsgs];
    archive.msgs.sort((a: any, b: any) => a.time - b.time);

    const buckets = Buckets.withUserAuth(this.userAuth)
    const bucketName = `chat-${this.identity.public.toString()}-${contactPubKey}-${index.toString()}`;
    const { root, threadID } = await buckets.getOrCreate(bucketName);
    const file = { path: '/index.html', content: JSON.stringify(archive) }
    const result = await buckets.pushPath(root!.key, 'index.html', file)
    console.log("ARCHIVE RESULT");
    console.log(result);
  }

  //CHANNELS
  async createChannel(channelName: string) {
    const dbInfo = await this.client.getDBInfo(this.threadId);
    const privateKey = PrivateKey.fromString(this.identity.toString());
    const encryptionWallet = PrivateKey.fromRandom();
    const ownerDecryptKey = (
      await privateKey.public.encrypt(encryptionWallet.seed)
    ).toString();
    const createdIndex = await this.client.create(this.threadId, "channelsIndex", [{ 
      name: channelName,
      owner: this.identity.public.toString(),
      threadId: this.threadId.toString(),
      dbInfo: JSON.stringify(dbInfo),
      encryptKey: encryptionWallet.public.toString()
    }]);
    console.log("CREATED CHANNEL INDEX");
    console.log(createdIndex);
    const indexId = createdIndex[0];
    this.client.find(this.threadId, `channel-${indexId}-members`, {}).catch(async () => {
      await this.client.newCollection(this.threadId, {
        name: `channel-${indexId}-members`,
        schema: schemas.channelMembers,
        //TODO: ONLY MEMBERS CAN ADD MEMBERS. ONLY OWNER CAN UPDATE
      });
      await this.client.create(this.threadId, `channel-${indexId}-members`, [{
        name: this.domain,
        pubKey: this.identity.public.toString(),
        decryptKey: ownerDecryptKey
      }]);
      await this.client.newCollection(this.threadId, {
        name: `channel-${indexId}-0`,
        schema: schemas.messages,
        //TODO: ONLY MEMBERS CAN ADD MESSAGES. 
      });
    });
    await this.client
    .create(this.threadId, "channels", [{ 
      name: channelName,
      indexId,
      owner: this.identity.public.toString(),
      threadId: this.threadId.toString(),
      dbInfo: JSON.stringify(dbInfo)
    }])
  }

  async deleteChannel(channelId: string) {
    const q = new Where('_id').eq(channelId);
    const channel: any = (
      await this.client.find(this.threadId, 'channels', q)
    )[0];
    if (channel) {
      return this.client.delete(this.threadId, 'channels', [channel._id]);
    }
  }

  async getChannels(cb: (channel: any) => void) {
    this.emitter.on('channel', cb);
    this.channelsList = [];
    const q = new Where("owner").eq(this.identity.public.toString());
    this.client.find(this.threadId, 'channels', q).then((result: any) => {
      result.map((channel) => {
        this.channelsList.push(channel);
      });
    });
    this.client.listen(
      this.threadId,
      [{ collectionName: 'channels' }],
      async (channel) => {
        if (!channel?.instance) {
          return;
        }
        this.emitter.emit('channel', channel.instance);
      },
    );
    return this.channelsList;
  }

  async sendChannelInvite(contactDomain: string, channel) {
    try {
      await this.client.joinFromInfo(JSON.parse(channel.dbInfo));
    } catch {

    }
    const q = new Where('_id').eq(channel.indexId);
    const channelIndex: any = (await this.client.find(
      ThreadID.fromString(channel.threadId),
      'channelsIndex',
      q
    ))[0];
    if(!channelIndex) return;
    const memberQ = new Where("pubKey").eq(this.identity.public.toString());
    const member: any= (await this.client.find(
      ThreadID.fromString(channel.threadId),
      `channel-${channel.indexId}-members`,
      memberQ
    ))[0];
    const privateKey = PrivateKey.fromString(this.identity.toString());
    const decryptKey = await decrypt(privateKey, member.decryptKey);
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
    const recDecryptKey = (
      await recipient.encrypt(decryptKey)
    ).toString();
    console.log(recDecryptKey);

    const channelInviteMessage: channels.InviteMessageBody = {
      type: 'ChannelInvite',
      sig,
      domain: this.domain,
      dbInfo: JSON.stringify(dbInfo),
      decryptKey: recDecryptKey,
      threadId: this.threadId.toString(),
      channelName: channelIndex.name,
      channelId: channelIndex._id,
      channelOwner: channelIndex.owner
    };
    return this.users.sendMessage(
      this.identity,
      recipient,
      new TextEncoder().encode(JSON.stringify(channelInviteMessage)),
    );
  }

  async getChannelInvites(cb: (channelInvites: channels.InviteMessage[]) => void) {
    const messages = await this.users.listInboxMessages();
    const privateKey = PrivateKey.fromString(this.identity.toString());
    this.channelInvitesList  = [];
    this.emitter.on('channelInvite', cb);
    for (const message of messages) {
      const body: channels.InviteMessageBody = JSON.parse(
        new TextDecoder().decode(await privateKey.decrypt(message.body)),
      );
      if (body.type === 'ChannelInvite') {
        this.channelInvitesList.push({ body, from: message.from, id: message.id });
      }
    }
    channels.handleAcceptedInvites({
      identity: this.identity,
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
        const body: channels.InviteMessageBody = JSON.parse(
          new TextDecoder().decode(await privateKey.decrypt(message.body)),
        );
        if (body.type === 'ChannelInvite') {
          const channelInviteMessage: channels.InviteMessage = {
            body,
            from: message.from,
            id: message.id,
          };
          this.emitter.emit('channelInvite', channelInviteMessage);
        }
        if (body.type === 'ChannelInviteAccepted') {
          const channelAcceptedMessage: channels.InviteMessage = {
            body,
            from: message.from,
            id: message.id,
          };
          channels.handleAcceptedInvite({
            signer: this.signer,
            channelAcceptedMessage,
            identity: this.identity,
            client: this.client,
            threadId: this.threadId,
            users: this.users,
          });
        }
      }
    });
    return this.channelInvitesList;
  }

  async acceptChannelInvite(channelInviteMessage: channels.InviteMessage) {
    console.log("ACCEPT CHANNEL INVITE");
    const dbInfo = await this.client.getDBInfo(this.threadId);
    const privateKey = PrivateKey.fromString(this.identity.toString());
    try {
      await channels.create(
        this.client,
        this.threadId,
        this.identity,
        channelInviteMessage.body,
      );
      console.log("CREATED CHANNEL");
    } catch(e) {
      console.log(e)
    }
    try {
      await this.client.joinFromInfo(JSON.parse(channelInviteMessage.body.dbInfo));
      console.log("JOINED DB")
    } catch(e) {
      console.log(e)
    }
    const threadId = ThreadID.fromString(channelInviteMessage.body.threadId);
    const q = new Where("pubKey").eq(this.identity.public.toString());
    try {
      await this.client.create(
        threadId,
        `channel-${channelInviteMessage.body.channelId}-members`,
        [{
          name: this.domain,
          pubKey: this.identity.public.toString(),
          decryptKey: channelInviteMessage.body.decryptKey
        }]
      )
      console.log("CREATED MEMBER");
    } catch(e) {
      console.log(e);
    }
    await channels.sendInviteAccepted({
      threadId: this.threadId,
      users: this.users,
      privateKey: privateKey,
      dbInfo: dbInfo,
      signer: this.signer,
      channelInviteMessage,
      domain: this.domain,
    });
    console.log("SEND BACK ACCEPTED")
    await this.users.deleteInboxMessage(channelInviteMessage.id);
    console.log("REMOVE INVITE MESSAGE");
  }

  async declineChannelInvite(channelInviteMessage: channels.InviteMessage) {
    return this.users.deleteInboxMessage(channelInviteMessage.id);
  }

  async sendChannelMessage(channel, msg: string, index: number) {
    try {
      await this.client.joinFromInfo(JSON.parse(channel.dbInfo));
    } catch {
    }
    const q = new Where('_id').eq(channel.indexId);
    const channelIndex: any = (await this.client.find(
      ThreadID.fromString(channel.threadId),
      'channelsIndex',
      q
    ))[0];
    if(!channelIndex) return;
    const pubKey = PublicKey.fromString(channelIndex.encryptKey);
    const message: messages.Message = {
      time: Date.now(),
      body: await encrypt(pubKey, msg),
      owner: this.identity.public.toString(),
      domain: this.domain,
      id: '',
    };
    return this.client.create(
      ThreadID.fromString(channel.threadId),
      `channel-${channel.indexId}-${index.toString()}`,
      [message],
    );
  }

  async _loadChannelMessages(
    channelIndex,
    decryptKey,
    index,
  ) {
    const messageList: messages.Message[] = [];
    const collectionName = 'channel-' + channelIndex._id + '-' + index.toString();
    const msgs: any[] = await this.client.find(ThreadID.fromString(channelIndex.threadId), collectionName, {});
    for (const msg of msgs) {
      const decryptedBody = await decryptAndDecode(decryptKey, msg.body);
      messageList.push({
        body: decryptedBody,
        time: msg.time,
        owner: msg.owner,
        domain: msg.domain,
        id: msg._id,
      });
    }
    messageList.sort((a, b) => a.time - b.time);
    return messageList;
  }

  async _listenChannelMessages(
    channelIndex,
    decryptKey,
    index: number,
    cb: (message: messages.Message | null) => void,
  ): Promise<{ close: () => void }> {
    const collectionName = 'channel-' + channelIndex._id + '-' + index.toString();
    return this.client.listen(ThreadID.fromString(channelIndex.threadId), [{ collectionName }], async (msg: any) => {
      if (!msg.instance) {
        return;
      }
      const decryptedBody = await decryptAndDecode(
        decryptKey,
        msg.instance.body,
      );
      const message = {
        body: decryptedBody,
        time: msg.instance.time,
        owner: msg.instance.owner,
        id: msg.instance._id,
        domain: msg.instance.domain
      };
      console.log(message);
      cb(message);
    });
  }

  async loadChannelMessages(
    channel,
    index: number,
    cb,
  ): Promise<messages.Message[]> {
    if (this.activeContactListeners) {
      for (const listener of this.activeContactListeners) {
        listener.close();
      }
    }
    this.activeContactListeners = [];
    const messageList: messages.Message[] = [];
    try {
      await this.client.joinFromInfo(JSON.parse(channel.dbInfo));
    } catch (e) {
      console.log(e);
    }
    const q = new Where('_id').eq(channel.indexId);
    console.log(channel.indexId);
    const channelIndex: any = (await this.client.find(
      ThreadID.fromString(channel.threadId),
      'channelsIndex',
      q
    ))[0];
    const memberQ = new Where("pubKey").eq(this.identity.public.toString());
    const member: any= (await this.client.find(
      ThreadID.fromString(channel.threadId),
      `channel-${channel.indexId}-members`,
      memberQ
    ))[0];
    const privateKey = PrivateKey.fromString(this.identity.toString());
    const decryptKey = new PrivateKey(
      await decrypt(privateKey, member.decryptKey),
    );
    if(channelIndex && member){
      messageList.push(...(await this._loadChannelMessages(channelIndex, decryptKey, index)));
      this.activeContactListeners.push(
        await this._listenChannelMessages(channelIndex, decryptKey, index, cb),
      );
      return messageList;
    } else{
      return [];
    }

  };

}
