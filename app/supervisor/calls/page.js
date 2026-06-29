"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchApi } from "@/lib/fetchApi";
import SupervisorNavbar from "../../components/supervisor/SupervisorNavbar";
import { generateConversationId } from "@/lib/generateConversationId";
import { FiArrowLeft, FiArrowRightCircle, FiMail, FiMessageSquare, FiPhoneCall, FiVideo } from "react-icons/fi";

export default function SupervisorCallsPage() {
  const [prayer, setPrayer] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [conversationVisible, setConversationVisible] = useState(false);
  const [generatedLink, setGeneratedLink] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const load = async () => {
      const storedPrayer = localStorage.getItem("selectedSupervisorPrayer");
      if (!storedPrayer) {
        router.push("/supervisor/dashboard");
        return;
      }

      const data = JSON.parse(storedPrayer);
      setPrayer(data);

      try {
        const res = await fetchApi("/api/conversations");
        const list = Array.isArray(res) ? res : [];
        setConversations(list);

        const match = list.find(
          (conv) =>
            conv.prayerRequestId === data._id ||
            conv.prayerEmail === data.email ||
            conv.prayerPhone === data.phone
        );

        if (match) {
          setConversationVisible(true);
          setGeneratedLink(`${window.location.origin}/conversation/${match.conversationId}`);
        }
      } catch (error) {
        console.error("Erreur récupération conversations :", error.message);
      }
    };

    load();
  }, [router]);

  useEffect(() => {
    if (!activeConversationId) return;

    const loadMessages = async () => {
      try {
        setMessages(await fetchApi(`/api/messages/${activeConversationId}`));
      } catch (error) {
        console.error("Erreur récupération messages :", error.message);
      }
    };

    loadMessages();
    const interval = window.setInterval(loadMessages, 3000);
    return () => window.clearInterval(interval);
  }, [activeConversationId]);

  const fetchMessages = async () => {
    if (!activeConversationId) return;
    setMessages(await fetchApi(`/api/messages/${activeConversationId}`));
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeConversationId) return;

    await fetchApi("/api/messages", {
      method: "POST",
      body: {
        conversationId: activeConversationId,
        message: newMessage,
      },
    });

    setNewMessage("");
    await fetchMessages();
  };

  const handleGenerateChat = async () => {
    const id = generateConversationId();
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/conversation/${id}`;

    try {
      const res = await fetchApi("/api/conversations", {
        method: "POST",
        body: {
          conversationId: id,
          prayerRequestId: prayer._id,
        },
      });

      const conversationId = res.conversationId || id;
      setActiveConversationId(conversationId);
      setGeneratedLink(`${baseUrl}/conversation/${conversationId}`);
      setConversationVisible(true);

      if (prayer.email) {
        await fetchApi("/api/send-chat-link", {
          method: "POST",
          body: { email: prayer.email, name: prayer.name, link },
        });
      }
    } catch (error) {
      console.error("Erreur création conversation :", error.message);
    }
  };

  if (!prayer) {
    return <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center text-gray-500">Chargement...</div>;
  }

  return (
    <main className="min-h-screen bg-[#f6f6f8]">
      <SupervisorNavbar />

      <section className="max-w-[1200px] mx-auto px-6 lg:px-20 pt-32 pb-16 space-y-8">
        <button
          type="button"
          onClick={() => router.push("/supervisor/dashboard")}
          className="inline-flex items-center gap-2 text-sm font-bold text-[#5c40e7] hover:underline"
        >
          <FiArrowLeft /> Retour au dashboard
        </button>

        <div className="bg-white rounded-[2rem] border border-white/70 shadow-sm p-6 lg:p-8">
          <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-[#5c40e7] mb-3">
            Contact de suivi
          </p>
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">
            Contacter {prayer.name || "la personne"}
          </h1>
          <p className="text-sm text-gray-600">
            Choisis le canal le plus adapté pour accompagner cette demande de prière.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2rem] border border-white/70 shadow-sm p-6 space-y-5">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4">🙏 Demande de prière</h2>
              <Info label="Nom" value={prayer.name || "Anonyme"} />
              <Info label="Email" value={prayer.email || "Non fourni"} />
              <Info label="Téléphone" value={prayer.phone || "Non fourni"} />
              <Info label="Catégorie" value={prayer.category || "Non renseignée"} />
              {prayer.subcategory && <Info label="Sous-catégorie" value={prayer.subcategory} />}
              {prayer.isUrgent && (
                <span className="inline-flex mt-2 px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-extrabold">
                  Urgence
                </span>
              )}
            </div>

            <div className="rounded-[1.5rem] bg-[#F7F7FB] p-5 text-sm text-gray-700 leading-7 whitespace-pre-wrap">
              {prayer.prayerRequest}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {prayer.email && <ActionButton icon={<FiMail />} label="Email" onClick={() => window.open(`mailto:${prayer.email}`)} />}
              {prayer.phone && <ActionButton icon={<FiPhoneCall />} label="WhatsApp" onClick={() => window.open(`https://wa.me/${prayer.phone.replace(/\s+/g, "")}`)} />}
              {prayer.email && <ActionButton icon={<FiVideo />} label="Proposer Zoom" onClick={() => window.open(`mailto:${prayer.email}?subject=Proposition de rendez-vous Zoom`)} />}
              <ActionButton icon={<FiMessageSquare />} label="Messagerie" onClick={handleGenerateChat} />
            </div>

            {generatedLink && (
              <div className="rounded-2xl bg-[#F1EEFF] p-4 text-sm text-gray-700">
                Lien de messagerie :{" "}
                <a href={generatedLink} target="_blank" className="text-[#5c40e7] font-bold underline">
                  {generatedLink}
                </a>
              </div>
            )}

            {conversationVisible && conversations.length > 0 && (
              <div>
                <h3 className="font-extrabold mb-3 text-gray-900">Conversations précédentes</h3>
                <div className="flex flex-col gap-2">
                  {conversations
                    .filter((conv) => conv.prayerRequestId === prayer._id || conv.prayerEmail === prayer.email || conv.prayerPhone === prayer.phone)
                    .map((conv) => (
                      <button
                        key={conv._id}
                        onClick={() => setActiveConversationId(conv.conversationId)}
                        className="bg-green-600 text-white px-4 py-3 rounded-2xl font-bold flex items-center gap-2 w-fit"
                      >
                        Continuer <FiArrowRightCircle />
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-[2rem] border border-white/70 shadow-sm p-6 flex flex-col">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-4">💬 Conversation</h2>
            {activeConversationId ? (
              <>
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 max-h-[50vh] rounded-[1.5rem] bg-[#F7F7FB] p-4">
                  {messages.map((msg, index) => (
                    <div key={index} className={`text-sm ${msg.sender === "volunteer" ? "text-right" : "text-left"}`}>
                      <span className={`inline-block px-3 py-2 rounded-2xl whitespace-pre-line ${msg.sender === "volunteer" ? "bg-[#F1EEFF]" : "bg-white"}`}>
                        {msg.message}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(event) => setNewMessage(event.target.value)}
                    placeholder="Votre message..."
                    className="flex-1 p-3 border border-gray-200 rounded-2xl"
                  />
                  <button onClick={handleSendMessage} className="bg-[#5c40e7] text-white px-5 rounded-2xl font-bold">
                    Envoyer
                  </button>
                </div>
              </>
            ) : (
              <div className="rounded-[1.5rem] bg-[#F7F7FB] p-8 text-center text-gray-500">
                Génère ou choisis une conversation pour commencer.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }) {
  return (
    <p className="text-sm text-gray-700 mb-2">
      <strong>{label} :</strong> {value}
    </p>
  );
}

function ActionButton({ icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 bg-[#5c40e7] text-white px-4 py-3 rounded-2xl font-extrabold text-sm hover:scale-[1.01] transition"
    >
      {icon} {label}
    </button>
  );
}
