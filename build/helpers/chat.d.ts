import { Client, Users, ThreadID } from '@textile/hub';
import * as contacts from './contacts';
declare const getChatThreadId: (users: Users, client: Client) => Promise<ThreadID>;
export { getChatThreadId, contacts };
