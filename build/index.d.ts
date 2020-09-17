import { Users, UserAuth, ThreadID, Client, Identity } from "@textile/hub";
import { Signer } from "ethers";
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
    constructor();
    join(domain: string): Promise<unknown>;
    deleteContacts(contactIds: string[]): Promise<void> | undefined;
    deleteAllContacts(): Promise<void>;
    getContacts(cb: any): Promise<void>;
    sendContactInvite(contactDomain: string): Promise<void>;
    getInvites(cb: any): Promise<void>;
    acceptContactInvite(contactInviteMessage: any): Promise<void>;
    declineInvite(contactInviteMessage: any): Promise<void>;
    sendMessage(contactPubKey: any, msg: any, msgIndex: any, index: any): Promise<string[] | undefined>;
    loadContactMessages(contactDomain: any, index: any, cb: any): Promise<void>;
}
