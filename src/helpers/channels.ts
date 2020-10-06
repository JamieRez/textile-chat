import {
  Client,
  Users,
  PrivateKey,
  ThreadID,
  PublicKey,
  Private,
  Identity
} from '@textile/hub';
import {
  getAndVerifyDomainPubKey,
  getDomainPubKey,
  decryptAndDecode,
  encrypt,
} from '.';
import { Signer } from 'ethers';
import { DBInfo } from '@textile/threads-client';
import schemas from './schemas';
import * as messages from './messages';
import ChatError, { ChatErrorCode } from '../errors';

const CHANNEL_INDEX_LIMIT = 50;

export interface InviteMessage {
  from: string;
  id: string;
  body: InviteMessageBody;
}

export interface InviteMessageBody {
  type: 'ChannelInviteAccepted' | 'ChannelInvite';
  sig: string;
  domain: string;
  dbInfo: string;
  threadId: string;
  channelOwner: string;
  channelName: string,
  channelId: string;
  decryptKey: string;
}

const deleteChannels = (
  client: Client,
  threadId: ThreadID,
  channelIds: string[],
) => {
  return client.delete(threadId, 'channels', channelIds);
};

const deleteAllChannels = async (client: Client, threadId: ThreadID) => {
  const channels: any[] = await client.find(threadId, 'channels', {});
  return deleteChannels(
    client,
    threadId,
    channels.map((channel) => channel._id),
  );
};

const getChannels = async (
  client: Client,
  threadId: ThreadID,
): Promise<{ id: string; domain: string }[]> => {
  return client.find(threadId, 'channels', {}).then((result) => {
    return result.map((channel: any) => {
      return { domain: channel.domain, id: channel._id };
    });
  })
};

const sendInviteAccepted = ({
  domain,
  channelInviteMessage,
  privateKey,
  users,
  dbInfo,
  threadId,
}: {
  domain: string;
  channelInviteMessage: InviteMessage;
  privateKey: PrivateKey;
  signer: Signer;
  users: Users;
  dbInfo: DBInfo;
  threadId: ThreadID;
}) => {
  const body: InviteMessageBody = {
    type: 'ChannelInviteAccepted',
    sig: channelInviteMessage.body.sig,
    domain: domain,
    dbInfo: JSON.stringify(dbInfo),
    threadId: threadId.toString(),
    channelName: channelInviteMessage.body.channelName,
    channelId: channelInviteMessage.body.channelId,
    channelOwner: channelInviteMessage.body.channelOwner
  };
  const recipient = PublicKey.fromString(channelInviteMessage.from);
  return users.sendMessage(
    privateKey,
    recipient,
    new TextEncoder().encode(JSON.stringify(body)),
  );
};

const configure = async ({
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
}) => {

  return client
    .find(threadId, 'channels', {})
    .catch(() => {
      return client.newCollection(threadId, {
        name: 'channels',
        schema: schemas.channels,
      });
    })
    .then(() => {
      return handleAcceptedInvites({
        identity,
        threadId,
        signer,
        users,
        client,
      });
    });
};

const handleAcceptedInvites = async ({
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
  const privateKey = PrivateKey.fromString(identity.toString());
  const messages = await users.listInboxMessages();
  for (const message of messages) {
    const body: InviteMessageBody = JSON.parse(
      new TextDecoder().decode(await privateKey.decrypt(message.body)),
    );
    if (body.type === 'ChannelInviteAccepted') {
      const channelAcceptedMessage: InviteMessage = {
        body,
        id: message.id,
        from: message.from,
      };
      await handleAcceptedInvite({
        channelAcceptedMessage,
        signer,
        threadId,
        client,
        identity,
        users,
      });
    }
  }
};

const handleAcceptedInvite = async ({
  signer,
  channelAcceptedMessage,
  client,
  threadId,
  users,
  identity
}: {
  threadId: ThreadID;
  client: Client;
  signer: Signer;
  channelAcceptedMessage: InviteMessage;
  users: Users;
  identity: Identity;
}) => {
  const contactPubKey = await getAndVerifyDomainPubKey(
    signer.provider!,
    channelAcceptedMessage.body.domain,
    channelAcceptedMessage.from,
  );
  const privateKey = PrivateKey.fromString(identity.toString());
  const sig = await decryptAndDecode(privateKey, channelAcceptedMessage.body.sig);
  if (sig !== contactPubKey) {
    throw new ChatError(ChatErrorCode.InvalidSigature, {
      signature: sig,
      pubKey: identity.public.toString(),
    });
  }
  await users.deleteInboxMessage(channelAcceptedMessage.id);
};

const create = (
  client: Client,
  threadId: ThreadID,
  identity: Identity,
  channelAcceptedMessage: InviteMessageBody
) => {
  return client
    .create(threadId, "channels", [{ 
      name: channelAcceptedMessage.channelName,
      indexId: channelAcceptedMessage.channelId,
      owner: identity.public.toString(),
      threadId: channelAcceptedMessage.threadId,
      dbInfo: channelAcceptedMessage.dbInfo
    }])
    .catch((e) => {
      if (e.message === "can't create already existing instance") {
        // Contact already created - ignore error
      } else {
        throw new ChatError(ChatErrorCode.UnknownError, {
          errorMessage: e.message,
        });
      }
    });
};

const acceptInvite = async ({
  domain,
  identity,
  privateKey,
  threadId,
  signer,
  channelInviteMessage,
  users,
  client,
  dbInfo,
}: {
  domain: string;
  identity: Identity;
  privateKey: PrivateKey
  threadId: ThreadID;
  signer: Signer;
  channelInviteMessage: InviteMessage;
  users: Users;
  dbInfo: DBInfo;
  client: Client;
}) => {
  const contactPubKey: string = await getAndVerifyDomainPubKey(
    signer.provider!,
    channelInviteMessage.body.domain,
    channelInviteMessage.from,
  );
  await create(
    client,
    threadId,
    identity,
    channelInviteMessage.body
  );
  await sendInviteAccepted({
    threadId,
    users,
    privateKey,
    dbInfo,
    signer,
    channelInviteMessage,
    domain,
  });
  await users.deleteInboxMessage(channelInviteMessage.id);
};

const declineInvite = async ({
  channelInviteMessage,
  users,
}: {
  channelInviteMessage: InviteMessage;
  users: Users;
}) => {
  return users.deleteInboxMessage(channelInviteMessage.id);
};

export {
  acceptInvite,
  declineInvite,
  sendInviteAccepted,
  configure,
  getChannels,
  deleteChannels,
  handleAcceptedInvite,
  handleAcceptedInvites,
  create,
};
