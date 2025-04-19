"use client";
import { useState } from "react";
import NavbarOther from "../components/NavbarOther";
import Footer from "../components/Footer";
import { toast } from "@/hooks/use-toast";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        toast({
          title: "✅ Message envoyé",
          description: "Votre message a bien été envoyé.",
          duration: 4000,
        });

        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast({
          title: "❌ Erreur",
          description: data.error || "Une erreur est survenue.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Erreur front:", err);
      toast({
        title: "❌ Erreur",
        description: "Impossible d'envoyer votre message.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <NavbarOther />

      <div className="max-w-xl mx-auto mt-12 px-4">
        <h1 className="text-2xl font-bold mb-4 pt-20">📩 Contact</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Votre nom"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="email"
            type="email"
            placeholder="Votre email"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <input
            name="subject"
            placeholder="Sujet"
            value={form.subject}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2"
          />
          <textarea
            name="message"
            placeholder="Votre message"
            value={form.message}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 h-32"
          />
          <button
            type="submit"
            className="bg-[#d4967d] text-white px-4 py-2 rounded hover:bg-[#c1836a]"
          >
            Envoyer
          </button>
        </form>
      </div>

      <div className="mt-12">
        <Footer />
      </div>
    </>
  );
}
