/// <reference types="node" />
import { PrivateKey, Users, UserAuth, ThreadID, Client, Identity } from "@textile/hub";
import ethers, { Signer } from "ethers";
import { EventEmitter } from 'events';
import * as contacts from './helpers/contacts';
import * as messages from './helpers/messages';
export declare type Events = 'contacts' | 'invites' | 'messages';
export declare type EventCallbackParams = {
    invites: contacts.InviteMessage[];
    contacts: {
        domain: string;
        id: string;
    }[];
    messages: messages.Message[];
};
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
    provider: ethers.providers.Web3Provider;
    emitter: EventEmitter;
    activeContactListeners: Array<{
        close: () => void;
    }>;
    textileSocketUrl: string;
    constructor(domain: string, textileSocketUrl: string, web3Provider: ethers.providers.Web3Provider);
    init(): Promise<void>;
    deleteContact(contactDomain: string): Promise<void>;
    getContacts(cb: (contact: {
        domain: string;
        id: string;
    }) => void): Promise<{
        domain: string;
        id: string;
    }[]>;
    sendContactInvite(contactDomain: string): Promise<import("@textile/hub").UserMessage>;
    getInvites(cb: (contactInvites: contacts.InviteMessage[]) => void): Promise<contacts.InviteMessage[]>;
    acceptContactInvite(contactInviteMessage: contacts.InviteMessage): Promise<void>;
    declineInvite(contactInviteMessage: contacts.InviteMessage): Promise<void>;
    sendMessage(contactDomain: string, msg: string, index: number): Promise<string[]>;
    loadMessages(pubKey: string, client: Client, threadId: ThreadID, decryptKey: PrivateKey, name: string, index: number): Promise<messages.Message[]>;
    listenMessages(pubKey: string, client: Client, threadId: ThreadID, decryptKey: PrivateKey, name: string, index: number, cb: (message: messages.Message) => void): Promise<{
        close: () => void;
    }>;
    loadContactMessages(contactDomain: string, index: number, cb: (message: messages.Message) => void): Promise<messages.Message[]>;
}
