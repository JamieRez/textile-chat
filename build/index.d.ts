import { Users, UserAuth, ThreadID, Client, Identity } from "@textile/hub";
import { Signer } from "ethers";
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
    constructor();
    join(domain: string): Promise<unknown>;
    deleteContact(contactDomain: string): Promise<void>;
    getContacts(cb: any): Promise<void>;
    sendContactInvite(contactDomain: string): Promise<void>;
    getInvites(cb: any): Promise<void>;
    acceptContactInvite(contactInviteMessage: any): Promise<void>;
    declineInvite(contactInviteMessage: any): Promise<void>;
    sendMessage(contactDomain: any, msg: any, index: any): Promise<string[] | undefined>;
    loadContactMessages(contactDomain: any, index: any, cb: any): Promise<void>;
    archiveContactMessages(contactDomain: any, index: any, cb: any): Promise<void>;
}
