import { Client, Users, PrivateKey, ThreadID, Identity } from "@textile/hub";
import { Signer } from "ethers";
import { DBInfo } from "@textile/threads-client";
export interface InviteMessage {
    from: string;
    id: string;
    body: InviteMessageBody;
}
export interface InviteMessageBody {
    type: "ContactInviteAccepted" | "ContactInvite";
    sig: string;
    domain: string;
    dbInfo: string;
    threadId: string;
}
declare const deleteContacts: (client: Client, threadId: ThreadID, contactIds: string[]) => Promise<void>;
declare const getContacts: (client: Client, threadId: ThreadID) => Promise<{
    id: string;
    domain: string;
}[]>;
declare const sendInvite: ({ domain, contactDomain, identity, signer, users, dbInfo, threadId, }: {
    domain: string;
    contactDomain: string;
    identity: PrivateKey;
    signer: Signer;
    users: Users;
    dbInfo: DBInfo;
    threadId: ThreadID;
}) => Promise<void>;
declare const sendInviteAccepted: ({ domain, contactInviteMessage, privateKey, users, dbInfo, threadId, }: {
    domain: string;
    contactInviteMessage: InviteMessage;
    privateKey: PrivateKey;
    signer: Signer;
    users: Users;
    dbInfo: DBInfo;
    threadId: ThreadID;
}) => Promise<import("@textile/hub").UserMessage>;
declare const configure: ({ identity, threadId, signer, users, client, }: {
    identity: PrivateKey;
    threadId: ThreadID;
    signer: Signer;
    users: Users;
    client: Client;
}) => Promise<void | unknown[]>;
declare const getInvites: (users: Users, identity: PrivateKey) => Promise<Array<InviteMessage>>;
declare const handleAcceptedInvites: ({ privateKey, identity, threadId, signer, users, client, }: {
    privateKey: PrivateKey;
    identity: Identity;
    threadId: ThreadID;
    signer: Signer;
    users: Users;
    client: Client;
}) => Promise<void>;
declare const handleAcceptedInvite: ({ signer, contactAcceptedMessage, privateKey, client, threadId, users, identity }: {
    threadId: ThreadID;
    client: Client;
    signer: Signer;
    privateKey: PrivateKey;
    contactAcceptedMessage: InviteMessage;
    users: Users;
    identity: Identity;
}) => Promise<void>;
declare const contactCreate: (client: Client, threadId: ThreadID, domain: string, identity: any) => Promise<void | string[]>;
declare const acceptInvite: ({ domain, identity, privateKey, threadId, signer, contactInviteMessage, users, client, dbInfo, }: {
    domain: string;
    identity: Identity;
    privateKey: PrivateKey;
    threadId: ThreadID;
    signer: Signer;
    contactInviteMessage: InviteMessage;
    users: Users;
    dbInfo: DBInfo;
    client: Client;
}) => Promise<void>;
declare const declineInvite: ({ contactInviteMessage, users, }: {
    contactInviteMessage: InviteMessage;
    users: Users;
}) => Promise<void>;
export { getInvites, acceptInvite, declineInvite, sendInvite, sendInviteAccepted, configure, getContacts, deleteContacts, handleAcceptedInvite, handleAcceptedInvites, contactCreate };
