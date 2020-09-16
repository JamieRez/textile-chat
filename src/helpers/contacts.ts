import {
  Client,
  Users,
  PrivateKey,
  ThreadID,
  PublicKey,
  Private,
} from "@textile/hub";
import {
  getAndVerifyDomainPubKey,
  getDomainPubKey,
  decryptAndDecode,
  encrypt,
} from ".";
import { Signer } from "ethers";
import { DBInfo } from "@textile/threads-client";
import schemas from "./schemas";
import * as messages from "./messages";

const CONTACT_INDEX_LIMIT = 50;
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

const deleteContacts = (
  client: Client,
  threadId: ThreadID,
  contactIds: string[]
) => {
  return client.delete(threadId, "contacts", contactIds);
};

const deleteAllContacts = async (client: Client, threadId: ThreadID) => {
  const contacts = await client.find(threadId, "contacts", {});
  deleteContacts(
    client,
    threadId,
    contacts.instancesList.map((contact) => contact._id)
  );
};

const getContacts = async (
  client: Client,
  threadId: ThreadID
): Promise<{ id: string; domain: string }[]> => {
  return client.find(threadId, "contacts", {}).then((result) => {
    return result.instancesList.map((contact) => {
      return { domain: contact.domain, id: contact._id };
    });
  });
};

const sendInvite = async ({
  domain,
  contactDomain,
  identity,
  signer,
  users,
  dbInfo,
  threadId,
}: {
  domain: string;
  contactDomain: string;
  identity: PrivateKey;
  signer: Signer;
  users: Users;
  dbInfo: DBInfo;
  threadId: ThreadID;
}) => {
  const domainPubKey = await getDomainPubKey(signer.provider!, contactDomain);
  if (!domainPubKey) {
    throw new Error("Domain does not have pubkey set");
  }
  const recipient = PublicKey.fromString(domainPubKey);
  const sig = await encrypt(identity.public, domainPubKey);
  const contactInviteMessage: InviteMessageBody = {
    type: "ContactInvite",
    sig,
    domain: domain,
    dbInfo: JSON.stringify(dbInfo),
    threadId: threadId.toString(),
  };
  await users.sendMessage(
    identity,
    recipient,
    new TextEncoder().encode(JSON.stringify(contactInviteMessage))
  );
};

const sendInviteAccepted = ({
  domain,
  contactInviteMessage,
  identity,
  users,
  dbInfo,
  threadId,
}: {
  domain: string;
  contactInviteMessage: InviteMessage;
  identity: PrivateKey;
  signer: Signer;
  users: Users;
  dbInfo: DBInfo;
  threadId: ThreadID;
}) => {
  const body: InviteMessageBody = {
    type: "ContactInviteAccepted",
    sig: contactInviteMessage.body.sig,
    domain: domain,
    dbInfo: JSON.stringify(dbInfo),
    threadId: threadId.toString(),
  };
  const recipient = PublicKey.fromString(contactInviteMessage.from);
  return users.sendMessage(
    identity,
    recipient,
    new TextEncoder().encode(JSON.stringify(body))
  );
};

const configure = async ({
  identity,
  threadId,
  signer,
  users,
  client,
}: {
  identity: PrivateKey;
  threadId: ThreadID;
  signer: Signer;
  users: Users;
  client: Client;
}) => {
  return client
    .find(threadId, "contacts", {})
    .catch(() => {
      return client.newCollection(threadId, "contacts", schemas.contacts);
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

const getInvites = async (
  users: Users,
  identity: PrivateKey
): Promise<Array<InviteMessage>> => {
  const messages = await users.listInboxMessages();
  const contactInvites: InviteMessage[] = (
    await Promise.all(
      messages.map(async (message) => {
        const body: InviteMessageBody = JSON.parse(
          new TextDecoder().decode(await identity.decrypt(message.body))
        );
        if (body.type === "ContactInvite") {
          return { body, from: message.from, id: message.id };
        }
        return null;
      })
    )
  ).filter((x): x is InviteMessage => x !== null);
  return contactInvites;
};

const handleAcceptedInvites = async ({
  identity,
  threadId,
  signer,
  users,
  client,
}: {
  identity: PrivateKey;
  threadId: ThreadID;
  signer: Signer;
  users: Users;
  client: Client;
}): Promise<void> => {
  const messages = await users.listInboxMessages();
  await Promise.all(
    messages.map(async (message) => {
      const body: InviteMessageBody = JSON.parse(
        new TextDecoder().decode(await identity.decrypt(message.body))
      );
      if (body.type === "ContactInviteAccepted") {
        const contactAcceptedMessage: InviteMessage = {
          body,
          id: message.id,
          from: message.from,
        };
        return handleAcceptedInvite({
          contactAcceptedMessage,
          signer,
          threadId,
          client,
          identity,
          users,
        });
      }
      return null;
    })
  );
};


const handleAcceptedInvite = async ({
  signer,
  contactAcceptedMessage,
  identity,
  client,
  threadId,
  users,
}: {
  threadId: ThreadID;
  client: Client;
  signer: Signer;
  identity: PrivateKey;
  contactAcceptedMessage: InviteMessage;
  users: Users;
}) => {
  const contactPubKey = await getAndVerifyDomainPubKey(
    signer.provider!,
    contactAcceptedMessage.body.domain,
    contactAcceptedMessage.from
  );
  const sig = await decryptAndDecode(identity, contactAcceptedMessage.body.sig);
  if (sig !== contactPubKey) {
    throw new Error("Signature does not match domainPubKey");
  }
  await contactCreate(client, threadId, contactAcceptedMessage.body.domain);
  await messages.createIndex({
    threadId,
    contactPubKey,
    client,
    identity,
    contactDbInfo: contactAcceptedMessage.body.dbInfo,
    contactThreadId: contactAcceptedMessage.body.threadId,
  });
  await users.deleteInboxMessage(contactAcceptedMessage.id);
};

const contactCreate = (client: Client, threadId: ThreadID, domain: string) => {
  return client
    .create(threadId, "contacts", [{ domain: domain, _id: domain }])
    .catch((e) => {
      if (e.message === "can't create already existing instance") {
        // Contact already created - ignore error
      } else {
        throw Error(e.message);
      }
    });
};

const acceptInvite = async ({
  domain,
  identity,
  threadId,
  signer,
  contactInviteMessage,
  users,
  client,
  dbInfo,
}: {
  domain: string;
  identity: PrivateKey;
  threadId: ThreadID;
  signer: Signer;
  contactInviteMessage: InviteMessage;
  users: Users;
  dbInfo: DBInfo;
  client: Client;
}) => {
  const contactPubKey: string = await getAndVerifyDomainPubKey(
    signer.provider!,
    contactInviteMessage.body.domain,
    contactInviteMessage.from
  );
  await contactCreate(client, threadId, contactInviteMessage.body.domain);
  await sendInviteAccepted({
    threadId,
    users,
    identity,
    dbInfo,
    signer,
    contactInviteMessage,
    domain,
  });
  await messages.createIndex({
    threadId,
    contactPubKey,
    identity,
    client,
    contactThreadId: contactInviteMessage.body.threadId,
    contactDbInfo: contactInviteMessage.body.dbInfo,
  });
  await users.deleteInboxMessage(contactInviteMessage.id);
};

const declineInvite = async ({
  contactInviteMessage,
  users,
}: {
  contactInviteMessage: InviteMessage;
  users: Users;
}) => {
  await users.deleteInboxMessage(contactInviteMessage.id);
};

export {
  getInvites,
  acceptInvite,
  declineInvite,
  sendInvite,
  sendInviteAccepted,
  configure,
  getContacts,
  deleteContacts,
  handleAcceptedInvite,
  handleAcceptedInvites,
  contactCreate
};