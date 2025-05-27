import { useEffect } from "react";
import client from "./ably";

export default function useAblyChannel(channelName, onMessageReceived) {
  useEffect(() => {
    if (!channelName) return;

    const channel = client.channels.get(channelName);
    channel.subscribe("new-message", (message) => {
      onMessageReceived(message.data);
    });

    return () => {
      channel.unsubscribe("new-message");
    };
  }, [channelName, onMessageReceived]);
}
