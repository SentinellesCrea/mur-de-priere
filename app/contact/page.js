"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiHeart,
  FiMail,
  FiMessageCircle,
  FiSend,
  FiShield,
} from "react-icons/fi";
import { toast } from "react-toastify";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const CONTACT_EMAIL = "contact.murdepriere@gmail.com";
const initialForm = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    if (feedback) setFeedback(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Une erreur est survenue.");
      }

      setForm(initialForm);
      setFeedback({
        type: "success",
        message: "Votre message a bien été envoyé. Merci de nous avoir écrit.",
      });
      toast.success("Votre message a bien été envoyé 🙏");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Impossible d’envoyer votre message pour le moment.";
      setFeedback({ type: "error", message });
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldClassName =
    "mt-1.5 w-full rounded-xl border border-[#ded9d4] bg-white px-4 py-3 text-sm text-[#2f2a26] outline-none transition placeholder:text-gray-400 focus:border-[#d8947c] focus:ring-4 focus:ring-[#d8947c]/15";

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#f7f5f2] text-[#2f2a26]">
        <section
          className="bg-[#253047] px-4 py-7 text-white sm:py-9"
          aria-labelledby="contact-title"
        >
          <div className="mx-auto max-w-[1200px]">
            <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#efb8a3]">
              <FiMessageCircle aria-hidden="true" />
              Nous sommes à votre écoute
            </p>
            <h1
              id="contact-title"
              className="text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl"
            >
              Comment pouvons-nous vous aider ?
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
              Une question sur Mur de Prière, un témoignage ou une difficulté
              technique ? Écrivez-nous simplement.
            </p>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1200px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-8 lg:py-10">
          <aside className="order-2 space-y-5 lg:order-1">
            <div className="rounded-2xl border border-[#e8e2dc] bg-white p-6 shadow-sm">
              <div className="flex size-11 items-center justify-center rounded-xl bg-[#8b1e3f]/10 text-xl text-[#8b1e3f]">
                <FiMail aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-lg font-bold">Nous écrire directement</h2>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Vous pouvez aussi nous contacter depuis votre messagerie.
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-4 inline-flex max-w-full items-center gap-2 break-all text-sm font-bold text-[#8b1e3f] transition hover:text-[#d8947c]"
              >
                {CONTACT_EMAIL}
                <FiArrowRight className="shrink-0" aria-hidden="true" />
              </a>
            </div>

            <div className="rounded-2xl bg-[#f0e7df] p-6">
              <div className="flex items-start gap-3">
                <FiHeart
                  className="mt-0.5 shrink-0 text-xl text-[#8b1e3f]"
                  aria-hidden="true"
                />
                <div>
                  <h2 className="font-bold">Vous avez besoin de prière ?</h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-700">
                    Le formulaire de contact ne publie pas de demande sur le
                    mur. Déposez votre sujet depuis l’espace dédié pour que la
                    communauté puisse prier avec vous.
                  </p>
                  <Link
                    href="/#PrayerWallSection"
                    className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#8b1e3f] hover:text-[#d8947c]"
                  >
                    Déposer une demande
                    <FiArrowRight aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="flex items-start gap-3 rounded-xl border border-[#e8e2dc] bg-white p-4">
                <FiClock
                  className="mt-0.5 shrink-0 text-lg text-[#d8947c]"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-bold">Une réponse humaine</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    Chaque message est lu avec attention et nous répondons dès
                    que possible.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-[#e8e2dc] bg-white p-4">
                <FiShield
                  className="mt-0.5 shrink-0 text-lg text-[#d8947c]"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-bold">Vos données respectées</p>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">
                    Vos coordonnées servent uniquement à traiter votre message
                    et à vous répondre.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          <div className="order-1 rounded-2xl border border-[#e8e2dc] bg-white p-5 shadow-[0_16px_45px_rgba(37,48,71,0.08)] sm:p-7 lg:order-2">
            <div className="mb-6">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#8b1e3f]">
                Formulaire de contact
              </p>
              <h2 className="mt-1 text-xl font-bold sm:text-2xl">
                Envoyez-nous votre message
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Tous les champs sont obligatoires.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label
                  htmlFor="contact-name"
                  className="text-sm font-semibold text-gray-700"
                >
                  Nom ou prénom
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Votre nom"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={100}
                    required
                    className={fieldClassName}
                  />
                </label>

                <label
                  htmlFor="contact-email"
                  className="text-sm font-semibold text-gray-700"
                >
                  Adresse e-mail
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="vous@exemple.fr"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className={fieldClassName}
                  />
                </label>
              </div>

              <label
                htmlFor="contact-subject"
                className="block text-sm font-semibold text-gray-700"
              >
                Sujet
                <input
                  id="contact-subject"
                  name="subject"
                  type="text"
                  placeholder="Ex. Une question sur ma demande de prière"
                  value={form.subject}
                  onChange={handleChange}
                  maxLength={200}
                  required
                  className={fieldClassName}
                />
              </label>

              <label
                htmlFor="contact-message"
                className="block text-sm font-semibold text-gray-700"
              >
                Message
                <textarea
                  id="contact-message"
                  name="message"
                  placeholder="Expliquez-nous comment nous pouvons vous aider…"
                  value={form.message}
                  onChange={handleChange}
                  rows={7}
                  maxLength={5000}
                  required
                  className={`${fieldClassName} resize-y`}
                />
                <span className="mt-1.5 block text-right text-xs font-normal text-gray-400">
                  {form.message.length} / 5 000
                </span>
              </label>

              {feedback && (
                <div
                  role={feedback.type === "error" ? "alert" : "status"}
                  className={`flex items-start gap-2 rounded-xl p-3 text-sm font-semibold ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {feedback.type === "success" && (
                    <FiCheckCircle
                      className="mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                  {feedback.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#d8947c] px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#c6816a] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                <FiSend aria-hidden="true" />
                {isSubmitting ? "Envoi en cours…" : "Envoyer le message"}
              </button>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
