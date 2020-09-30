import { ethers } from "ethers";
import {
  PrivateKey,
  Users,
  UserAuth,
  ThreadID,
  Client,
  Query,
  PublicKey,
  CollectionConfig
} from "@textile/hub";
import { setRecord, getRecord } from ".";
import { fromHexString } from ".";

const getIdentityFromSignature = (signature: string) => {
  const hex = Buffer.from(signature, "utf8");
  const privateKey = ethers.utils.sha256(hex).replace("0x", "");
  return new PrivateKey(fromHexString(privateKey));
};

const loginWithChallenge = (
  domain: string,
  signer: ethers.Signer,
  id: PrivateKey
): Promise<UserAuth> => {
  return new Promise((resolve, reject) => {
    const socketUrl = `ws://localhost:8080/ws/textile-auth`;

    const socket = new WebSocket(socketUrl);

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          domain,
          pubkey: id.public.toString(),
          type: "token",
        })
      );

      socket.onmessage = async (event) => {
        const data = JSON.parse(event.data);
        switch (data.type) {
          case "error": {
            reject(data.value);
            break;
          }
          case "challenge": {
            const buf = Buffer.from(data.value);
            const signed = await id.sign(buf);

            socket.send(
              JSON.stringify({
                type: "challenge",
                sig: Buffer.from(signed).toJSON(),
              })
            );
            break;
          }
          case "token": {
            resolve({ ...data.value, key: "bk44oyenlgauefar67jn56p7edm" });
            break;
          }
        }
      };
    };
  });
};

const getIdentity = async (signer: ethers.Signer) => {
  const identificationSignature = await signer.signMessage(
    "*****ONLY SIGN ON TRUSTED APPS*****: By signing this message you will create your Textile identification used for decentralized chat on ThreadsDB"
  );
  return getIdentityFromSignature(identificationSignature);
};

const configureDomain = async (
  textileId: PrivateKey,
  domain: string,
  signer: ethers.Signer
): Promise<void> => {
  return setRecord(signer, domain, {
    key: "social.textile.pubkey",
    value: textileId.public.toString(),
  });
};

const getDomainPubKey = (
  provider: ethers.providers.Provider,
  domain: string
) => {
  return getRecord(provider, domain, "social.textile.pubkey");
};

const getAndVerifyDomainPubKey = async (
  provider: ethers.providers.Provider,
  domain: string,
  pubKey: string
) => {
  const domainPubKey: string = await getDomainPubKey(provider, domain);
  if (!domainPubKey) {
    throw new Error("Domain does not have chat configured");
  }
  if (domainPubKey !== pubKey) {
    throw new Error("Message does not match domain pubkey");
  }
  return domainPubKey;
};

const auth = async (
  textileId: PrivateKey,
  domain: string,
  signer: ethers.Signer
): Promise<UserAuth> => {
  const userAuth = await loginWithChallenge(domain, signer, textileId);
  return userAuth;
};

const findOrCreateCollection = ({
  threadId,
  client,
  collectionName,
  schema,
  query,
  writeValidator
}: {
  threadId: ThreadID;
  client: Client;
  collectionName: string;
  schema: Object;
  query?: Query;
  writeValidator: ((writer: string, event: any, instance: any) => boolean) | string;
}) => {
  return client.find(threadId, collectionName, query || {}).catch((e) => {
    return client.newCollection(threadId, {
      name: collectionName, 
      schema,
      writeValidator
    });
  });
};

const decryptAndDecode = async (identity: PrivateKey, message: string) => {
  return new TextDecoder().decode(
    await identity.decrypt(Uint8Array.from(message.split(",").map(Number)))
  );
};

const encrypt = async (pubKey: PublicKey, message: string) => {
  return (await pubKey.encrypt(new TextEncoder().encode(message))).toString();
};

const decrypt = async (identity: PrivateKey, message: string) => {
  return await identity.decrypt(
    Uint8Array.from(message.split(",").map(Number))
  );
};

export {
  encrypt,
  decrypt,
  decryptAndDecode,
  findOrCreateCollection,
  getIdentity,
  configureDomain,
  auth,
  getAndVerifyDomainPubKey,
  getDomainPubKey,
};
