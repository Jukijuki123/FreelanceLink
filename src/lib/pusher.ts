import PusherServer from "pusher";

// Dummy credentials for now, wait for user to configure .env
const PUSHER_APP_ID = process.env.PUSHER_APP_ID || "2136815";
const PUSHER_KEY = process.env.NEXT_PUBLIC_PUSHER_KEY || "b68395877aae94f0b56c";
const PUSHER_SECRET = process.env.PUSHER_SECRET || "a7dd5ae16c13da1d8acb";
const PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

export const pusherServer = new PusherServer({
  appId: PUSHER_APP_ID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
  useTLS: true,
});
