"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { toast } from "react-toastify";

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
        toast.success("Votre message a bien été envoyé 🙏");

        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        toast.error("Une erreur est survenue.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Impossible d'envoyer votre message.");
    }
  };

  return (
    <>
      <Navbar />

      {/* ================= PAGE WRAPPER ================= */}
      <main className="min-h-screen bg-[#f7f7f6] flex items-center justify-center px-4 pt-24 pb-32">
        <div className="w-full max-w-xl">

          {/* ================= CARD ================= */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sm:p-10">

            {/* HEADER */}
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Nous contacter
              </h1>
              <p className="text-sm text-gray-500">
                Une question, un témoignage, un besoin de prière ?
                <br className="hidden sm:block" />
                Écrivez-nous, nous vous lirons avec attention.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Nom
                </label>
                <input
                  name="name"
                  placeholder="Votre nom"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#d8947c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#d8947c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Sujet
                </label>
                <input
                  name="subject"
                  placeholder="Sujet de votre message"
                  value={form.subject}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-[#d8947c] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-600 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  placeholder="Écrivez votre message ici…"
                  value={form.message}
                  onChange={handleChange}
                  rows={5}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm resize-none focus:ring-2 focus:ring-[#d8947c] focus:outline-none"
                />
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                className="
                  w-full mt-4
                  bg-[#d8947c]
                  text-white
                  py-3
                  rounded-full
                  font-bold
                  text-sm
                  hover:bg-[#c6816a]
                  hover:shadow-lg
                  transition
                "
              >
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
