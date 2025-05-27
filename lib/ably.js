import Ably from "ably/promises";

const client = new Ably.Realtime({ key: process.env.NEXT_PUBLIC_ABLY_API_KEY });

export default client;
