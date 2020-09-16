import { ethers } from "ethers";
import { PrivateKey, UserAuth, ThreadID, Client, Query, PublicKey } from "@textile/hub";
declare const getIdentity: (signer: ethers.Signer) => Promise<PrivateKey>;
declare const configureDomain: (textileId: PrivateKey, domain: string, signer: ethers.Signer) => Promise<void>;
declare const getDomainPubKey: (provider: ethers.providers.Provider, domain: string) => Promise<any>;
declare const getAndVerifyDomainPubKey: (provider: ethers.providers.Provider, domain: string, pubKey: string) => Promise<string>;
declare const auth: (textileId: PrivateKey, domain: string, signer: ethers.Signer) => Promise<UserAuth>;
declare const findOrCreateCollection: ({ threadId, client, collectionName, schema, query, }: {
    threadId: ThreadID;
    client: Client;
    collectionName: string;
    schema: Object;
    query?: Query | undefined;
}) => Promise<void | import("@textile/threads-client").InstanceList<any>>;
declare const decryptAndDecode: (identity: PrivateKey, message: string) => Promise<string>;
declare const encrypt: (pubKey: PublicKey, message: string) => Promise<string>;
declare const decrypt: (identity: PrivateKey, message: string) => Promise<Uint8Array>;
export { encrypt, decrypt, decryptAndDecode, findOrCreateCollection, getIdentity, configureDomain, auth, getAndVerifyDomainPubKey, getDomainPubKey, };
