"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import NavbarSimple from "../../components/NavbarSimple";
import Footer from "../../components/Footer";
import { fetchApi } from "@/lib/fetchApi";
import { FiUserCheck, FiTwitch } from "react-icons/fi";

export default function ConversationPage() {
  const { id } = useParams();
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [conversations, conversationMessages] = await Promise.all([
          fetchApi("/api/conversations").catch(() => []),
          fetchApi(`/api/messages/${id}`),
        ]);
        setConversation(conversations.find((conv) => conv.conversationId === id) || null);
        setMessages(conversationMessages);
      } catch (error) {
        console.error("Erreur chargement conversation :", error.message);
      }
    };
    load();
    const interval = window.setInterval(async () => {
      try {
        setMessages(await fetchApi(`/api/messages/${id}`));
      } catch (error) {
        console.error("Erreur récupération messages :", error.message);
      }
    }, 3000);
    return () => window.clearInterval(interval);
  }, [id]);

  const fetchMessages = async () => {
    try {
      const res = await fetchApi(`/api/messages/${id}`);
      setMessages(res);
    } catch (error) {
      console.error("Erreur récupération messages :", error.message);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;
    try {
      const messageData = {
        conversationId: id,
        sender: "guest",
        message: newMessage,
      };

      await fetchApi("/api/messages", {
        method: "POST",
        body: messageData,
        headers: { "Content-Type": "application/json" },
      });

      setNewMessage("");
      await fetchMessages();
    } catch (error) {
      console.error("Erreur envoi message :", error.message);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <NavbarSimple />

      <div className="min-h-screen bg-gradient-to-br from-[#fffaf2] to-[#f6f0e4] p-6">
        <div className="max-w-2xl mx-auto bg-white shadow-xl rounded-lg p-6 space-y-6">
          <h1 className="text-3xl font-bold text-center text-gray-800">Bienvenue dans votre espace de discussion 🙏</h1>

          <p className="text-center text-gray-600 text-sm leading-relaxed">
            Vous êtes en lien avec un bénévole de l&apos;équipe <strong className="text-gray-800">Mur de Prière</strong>. <br />
            Ici, vous pouvez échanger librement, dans un cadre bienveillant. <br />
            <span className="italic text-gray-500">Tout est sécurisé et confidentiel.</span>
          </p>

          {conversation && (
            <div className="bg-gray-100 p-4 rounded-md shadow-sm text-gray-700 space-y-1 text-sm">
              <p className="flex items-center gap-2">
                <FiUserCheck className="text-blue-600" />
                <span><strong>Bénévole :</strong> {conversation.volunteerId?.firstName} {conversation.volunteerId?.lastName}</span>
              </p>
              <p className="flex items-center gap-2">
                <FiTwitch className="text-purple-600" />
                <span><strong>Demandeur :</strong> {conversation.prayerName}</span>
              </p>
            </div>
          )}

          <div className="h-84 overflow-y-auto border rounded p-3 bg-gray-50">
            {messages.map((msg, i) => (
              <div key={i} className={`mb-2 ${msg.sender === 'guest' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block px-3 py-2 rounded-lg whitespace-pre-line ${msg.sender === 'guest' ? 'bg-blue-100' : 'bg-green-100'}`}>
                  {msg.message}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-end gap-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = e.target.scrollHeight + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder="Votre message ici..."
              className="flex-1 p-2 border rounded overflow-hidden resize-none min-h-[40px] max-h-48"
              rows={1}
            />

            <button
              onClick={handleSend}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Envoyer
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
