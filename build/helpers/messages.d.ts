import { Client, PrivateKey, ThreadID } from '@textile/hub';
export interface MessagesIndex {
    currentLength: number;
    limit: number;
    readerDecryptKey: string;
    ownerDecryptKey: string;
    threadId: string;
    dbInfo: string;
    encryptKey: string;
    _id: 'index';
}
export interface Message {
    body: string;
    time: number;
    owner: string | null;
    id: string;
}
declare const createIndex: ({ threadId, contactPubKey, client, identity, contactThreadId, contactDbInfo, }: {
    threadId: ThreadID;
    contactPubKey: string;
    client: Client;
    identity: PrivateKey;
    contactThreadId: string;
    contactDbInfo: string;
}) => Promise<MessagesIndex>;
declare const getIndex: ({ client, threadId, pubKey, }: {
    threadId: ThreadID;
    client: Client;
    pubKey: string;
}) => Promise<MessagesIndex>;
declare const collectionCreate: ({ indexNumber, client, threadId, contactPubKey, }: {
    threadId: ThreadID;
    indexNumber: number;
    client: Client;
    contactPubKey: string;
}) => Promise<void | unknown[]>;
declare const sendMessage: ({ messagesIndex, client, threadId, index, contactPubKey, msg, }: {
    msg: string;
    threadId: ThreadID;
    identity: PrivateKey;
    messagesIndex: MessagesIndex;
    index: number;
    client: Client;
    contactPubKey: string;
}) => Promise<string[]>;
declare const loadMessages: ({ pubKey, client, threadId, decryptKey, name, index, }: {
    index: number;
    pubKey: string;
    client: Client;
    threadId: ThreadID;
    decryptKey: PrivateKey;
    name: string;
}) => Promise<Message[]>;
declare const listenForMessages: ({ pubKey, client, threadId, decryptKey, name, index, cb, }: {
    index: number;
    pubKey: string;
    client: Client;
    threadId: ThreadID;
    decryptKey: PrivateKey;
    name: string;
    cb: (msgs: Message[]) => void;
}) => Promise<void>;
export { listenForMessages, loadMessages, getIndex, createIndex, collectionCreate, sendMessage, };
