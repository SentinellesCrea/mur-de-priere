"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import VolunteerNavbar from "../../components/volunteers/VolunteerNavbar";
import { generateConversationId } from "@/lib/generateConversationId";
import { FiMail, FiPhoneCall, FiVideo, FiMessageSquare, FiArrowRightCircle } from "react-icons/fi";
import client from "@/lib/ably";
import useAblyChannel from "@/lib/useAblyChannel";
import { playNotificationSound, vibrateMobile } from "@/lib/notify";

export default function CallsPage() {
  const [prayer, setPrayer] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationVisible, setConversationVisible] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const storedPrayer = localStorage.getItem("selectedPrayer");
    if (storedPrayer) {
      const data = JSON.parse(storedPrayer);
      setPrayer(data);
      fetchConversations(data);
    } else {
      router.push("/volunteers/dashboard");
    }
  }, []);

  useEffect(() => {
    if (!activeConversationId) return;
    fetchMessages();
  }, [activeConversationId]);

  useAblyChannel(`conversation-${activeConversationId}`, (data) => {
  if (data.sender !== "volunteer") {
    playNotificationSound();
    vibrateMobile();
  }
  setMessages((prev) => [...prev, data]);
});


  const fetchConversations = async (prayerData = prayer) => {
    try {
      const res = await fetchApi("/api/conversations");
      setConversations(res);

      const match = res.find(
        conv =>
          conv.prayerEmail === prayerData.email ||
          conv.prayerPhone === prayerData.phone
      );

      if (match) {
        setConversationVisible(true);
        setGeneratedLink(`${window.location.origin}/conversation/${match.conversationId}`);
      }
    } catch (error) {
      console.error("Erreur récupération conversations :", error.message);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await fetchApi(`/api/messages/${activeConversationId}`);
      setMessages(res);
    } catch (error) {
      console.error("Erreur récupération messages :", error.message);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      conversationId: activeConversationId,
      sender: "volunteer",
      message: newMessage,
    };

    try {
      await fetchApi("/api/messages", {
        method: "POST",
        body: messageData,
        headers: { "Content-Type": "application/json" },
      });

      const channel = client.channels.get(`conversation-${activeConversationId}`);
      channel.publish("new-message", messageData);

      setNewMessage("");
    } catch (error) {
      console.error("Erreur envoi message :", error.message);
    }
  };

  const handleGenerateChat = async () => {
    const id = generateConversationId();
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/conversation/${id}`;

    const body = {
      conversationId: id,
      prayerName: prayer.name,
      prayerEmail: prayer.email,
      prayerPhone: prayer.phone,
    };

    try {
      const res = await fetchApi("/api/conversations", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
      });

      if (res.conversationId) {
        setActiveConversationId(res.conversationId);
        setGeneratedLink(`${baseUrl}/conversation/${res.conversationId}`);
      } else {
        setActiveConversationId(id);
        setGeneratedLink(link);
      }

      setConversationVisible(true);
      fetchConversations();

      if (prayer.email) {
        await fetchApi("/api/send-chat-link", {
          method: "POST",
          body: { email: prayer.email, name: prayer.name, link },
          headers: { "Content-Type": "application/json" },
        });
      }
    } catch (error) {
      console.error("Erreur création conversation :", error.message);
    }
  };

  if (!prayer) return <div className="p-6">Chargement...</div>;

  return (
    <div className="w-full mt-20">
      <VolunteerNavbar />
      <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        {/* Infos prière */}
        <div className="bg-white rounded shadow p-6 space-y-4">
          <h2 className="text-2xl font-bold">🙏 Demande de prière</h2>
          <p><strong>Nom :</strong> {prayer.name}</p>
          <p><strong>Email :</strong> {prayer.email || "Non fourni"}</p>
          <p><strong>Téléphone :</strong> {prayer.phone || "Non fourni"}</p>
          <p><strong>Catégorie :</strong> {prayer.category}</p>
          {prayer.subcategory && <p><strong>Sous-catégorie :</strong> {prayer.subcategory}</p>}
          {prayer.isUrgent && <p className="text-red-600 font-bold">🚨 Urgence</p>}
          <p className="text-sm italic">Reçue le : {new Date(prayer.datePublication).toLocaleDateString("fr-FR")}</p>
          <div className="mt-4 p-4 bg-gray-50 rounded">{prayer.prayerRequest}</div>

          <div className="flex flex-col gap-6 mt-6">
            <div className="flex flex-wrap gap-3">
              {prayer.email && (
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
                  onClick={() => window.open(`mailto:${prayer.email}`)}
                >
                  <FiMail /> Email
                </button>
              )}
              {prayer.phone && (
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
                  onClick={() => window.open(`https://wa.me/${prayer.phone.replace(/\s+/g, "")}`)}
                >
                  <FiPhoneCall /> WhatsApp
                </button>
              )}
              {prayer.email && (
                <button
                  className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 flex items-center gap-2"
                  onClick={() => window.open(`mailto:${prayer.email}?subject=Zoom`)}
                >
                  <FiVideo /> Zoom
                </button>
              )}
              <button
                className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center gap-2"
                onClick={handleGenerateChat}
              >
                <FiMessageSquare /> Messagerie
              </button>
            </div>

            {generatedLink && (
              <div className="mt-4 p-3 bg-gray-100 text-sm rounded">
                💬 Lien vers la messagerie :{" "}
                <a href={generatedLink} target="_blank" className="text-blue-600 underline">
                  {generatedLink}
                </a>
              </div>
            )}

            {conversationVisible && conversations.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Conversations précédentes</h3>
                <div className="flex flex-col gap-2">
                  {conversations
                    .filter((conv) => conv.prayerEmail === prayer.email || conv.prayerPhone === prayer.phone)
                    .map((conv) => (
                      <button
                        key={conv._id}
                        onClick={() => setActiveConversationId(conv.conversationId)}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:underline flex items-center gap-1 w-fit"
                      >
                        Continuer <FiArrowRightCircle />
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Messagerie */}
        <div className="bg-white rounded shadow p-6 flex flex-col">
          <h2 className="text-2xl font-bold mb-4">💬 Conversation</h2>
          {activeConversationId ? (
            <>
              <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[50vh]">
                {messages.map((msg, i) => (
                  <div key={i} className={`text-sm ${msg.sender === "volunteer" ? "text-right" : "text-left"}`}>
                    <span className={`inline-block px-3 py-2 rounded-lg whitespace-pre-line ${msg.sender === "volunteer" ? "bg-blue-100" : "bg-green-100"}`}>
                      {msg.message}
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 mt-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Votre message..."
                  className="flex-1 p-2 border rounded"
                />
                <button onClick={handleSendMessage} className="bg-blue-600 text-white px-4 rounded">Envoyer</button>
              </div>
            </>
          ) : (
            <p className="text-gray-500">Aucune conversation active</p>
          )}
        </div>
      </div>
    </div>
  );
}
