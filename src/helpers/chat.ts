import { Client, Users, ThreadID } from '@textile/hub';
import * as contacts from './contacts';

const getChatThreadId = async (
  users: Users,
  client: Client,
): Promise<ThreadID> => {
  try {
    const thread = await users.getThread('unstoppable-chat');
    if (thread) {
      return thread.id;
    }
  } catch {}
  return client.newDB(ThreadID.fromRandom(), 'unstoppable-chat');
};

export { getChatThreadId, contacts };
