import { Client, PrivateKey, ThreadID, Identity } from '@textile/hub';
export interface ContactMessagesIndex {
    currentLength: number;
    limit: number;
    readerDecryptKey: string;
    ownerDecryptKey: string;
    threadId: string;
    dbInfo: string;
    encryptKey: string;
    owner: string;
    _id: 'index';
}
export interface Message {
    body: string;
    time: number;
    owner: string | null;
    id: string | null;
    domain: string | null;
}
declare const createContactIndex: ({ threadId, contactPubKey, client, privateKey, contactThreadId, contactDbInfo, identity }: {
    threadId: ThreadID;
    contactPubKey: string;
    client: Client;
    privateKey: PrivateKey;
    contactThreadId: string;
    contactDbInfo: string;
    identity: Identity;
}) => Promise<ContactMessagesIndex>;
declare const getContactIndex: ({ client, threadId, pubKey, }: {
    threadId: ThreadID;
    client: Client;
    pubKey: string;
}) => Promise<ContactMessagesIndex>;
declare const collectionCreate: ({ indexNumber, client, threadId, contactPubKey, }: {
    threadId: ThreadID;
    indexNumber: number;
    client: Client;
    contactPubKey: string;
}) => Promise<void | unknown[]>;
export { getContactIndex, createContactIndex, collectionCreate, };
