import { Client, Users, PrivateKey, ThreadID, Identity } from '@textile/hub';
import { Signer } from 'ethers';
import { DBInfo } from '@textile/threads-client';
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
    channelName: string;
    channelId: string;
    decryptKey: string;
}
declare const deleteChannels: (client: Client, threadId: ThreadID, channelIds: string[]) => Promise<void>;
declare const getChannels: (client: Client, threadId: ThreadID) => Promise<{
    id: string;
    domain: string;
}[]>;
declare const sendInviteAccepted: ({ domain, channelInviteMessage, privateKey, users, dbInfo, threadId, }: {
    domain: string;
    channelInviteMessage: InviteMessage;
    privateKey: PrivateKey;
    signer: Signer;
    users: Users;
    dbInfo: DBInfo;
    threadId: ThreadID;
}) => Promise<import("@textile/hub").UserMessage>;
declare const configure: ({ identity, threadId, signer, users, client, }: {
    identity: Identity;
    threadId: ThreadID;
    signer: Signer;
    users: Users;
    client: Client;
}) => Promise<void>;
declare const handleAcceptedInvites: ({ identity, threadId, signer, users, client, }: {
    identity: Identity;
    threadId: ThreadID;
    signer: Signer;
    users: Users;
    client: Client;
}) => Promise<void>;
declare const handleAcceptedInvite: ({ signer, channelAcceptedMessage, client, threadId, users, identity }: {
    threadId: ThreadID;
    client: Client;
    signer: Signer;
    channelAcceptedMessage: InviteMessage;
    users: Users;
    identity: Identity;
}) => Promise<void>;
declare const create: (client: Client, threadId: ThreadID, identity: Identity, channelAcceptedMessage: InviteMessageBody) => Promise<void | string[]>;
declare const acceptInvite: ({ domain, identity, privateKey, threadId, signer, channelInviteMessage, users, client, dbInfo, }: {
    domain: string;
    identity: Identity;
    privateKey: PrivateKey;
    threadId: ThreadID;
    signer: Signer;
    channelInviteMessage: InviteMessage;
    users: Users;
    dbInfo: DBInfo;
    client: Client;
}) => Promise<void>;
declare const declineInvite: ({ channelInviteMessage, users, }: {
    channelInviteMessage: InviteMessage;
    users: Users;
}) => Promise<void>;
export { acceptInvite, declineInvite, sendInviteAccepted, configure, getChannels, deleteChannels, handleAcceptedInvite, handleAcceptedInvites, create, };
