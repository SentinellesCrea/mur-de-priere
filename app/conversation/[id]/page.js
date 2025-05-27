'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ConversationPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  const fetchMessages = async () => {
    try {
      const res = await fetch(`/api/messages/${id}`);
      const data = await res.json();
      setMessages(data);
    } catch (error) {
      console.error("Erreur fetch messages:", error);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: id,
          sender: "guest",
          message: newMessage,
        }),
      });
      setNewMessage("");
      fetchMessages(); // recharge
    } catch (error) {
      console.error("Erreur envoi:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // polling
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-xl border p-4 rounded shadow">
        <h2 className="text-2xl font-bold mb-4">Discussion avec un bénévole</h2>
        <div className="h-64 overflow-y-auto mb-4 border rounded p-2 bg-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`mb-2 ${msg.sender === 'guest' ? 'text-right' : 'text-left'}`}>
              <div className={`inline-block px-3 py-2 rounded-lg ${msg.sender === 'guest' ? 'bg-blue-100' : 'bg-green-100'}`}>
                {msg.message}
              </div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Écrire un message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 border rounded"
          />
          <button onClick={handleSend} className="px-4 py-2 bg-blue-500 text-white rounded">Envoyer</button>
        </div>
      </div>
    </div>
  );
}
