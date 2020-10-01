import { Client, Users, ThreadID } from '@textile/hub';
import * as contacts from './contacts';

const getChatThreadId = async (
  users: Users,
  client: Client,
): Promise<ThreadID> => {
  let threadId: ThreadID = ThreadID.fromRandom();
  try {
    const thread = await users.getThread('chat');
    if (thread) {
      threadId = ThreadID.fromString(thread.id);
    }
  } catch {
    threadId = await client.newDB(ThreadID.fromRandom(), 'chat');
  }
  return threadId;
};

export { getChatThreadId, contacts };
