import { Client, ThreadID } from "@textile/hub";
import * as contacts from "./contacts";
declare const getChatThreadId: (client: Client) => Promise<ThreadID>;
export { getChatThreadId, contacts };
