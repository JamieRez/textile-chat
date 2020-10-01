import { Client, ThreadID } from '@textile/hub';
import * as contacts from './contacts';

const getChatThreadId = async (client: Client): Promise<ThreadID> => {
  const threads = await client.listThreads();
  for (const thread of threads.listList) {
    if (thread.name === 'chat') {
      return ThreadID.fromString(thread.id);
    }
  }
  const threadId = ThreadID.fromRandom();
  return client.newDB(threadId, 'chat');
};

export { getChatThreadId, contacts };
