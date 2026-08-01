"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCheck,
  FiClock,
  FiGlobe,
  FiInfo,
  FiMail,
  FiMapPin,
  FiShield,
  FiUsers,
} from "react-icons/fi";
import { FaChurch } from "react-icons/fa";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { fetchApi } from "@/lib/fetchApi";
import { CHURCH_DENOMINATIONS, CHURCH_TRADITIONS } from "@/data/churchOptions";

const STEPS = [
  {
    title: "Votre église",
    shortTitle: "Identité",
    description: "Son nom et sa famille chrétienne",
  },
  {
    title: "Localisation",
    shortTitle: "Adresse",
    description: "Les informations utilisées pour la carte",
  },
  {
    title: "Vie de l’église",
    shortTitle: "Communauté",
    description: "Ce qui aidera les visiteurs à vous connaître",
  },
  {
    title: "Contact et vérification",
    shortTitle: "Vérification",
    description: "Un dernier regard avant l’envoi",
  },
];

const inputClassName =
  "mt-1.5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[#d8947c] focus:ring-4 focus:ring-[#d8947c]/15";

export default function AjouterEglisePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [stepError, setStepError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    postalCode: "",
    country: "France",
    email: "",
    phone: "",
    website: "",
    tradition: "Évangélique",
    denomination: "",
    languages: "Français",
    serviceTimes: "",
    description: "",
    accessibility: false,
    childrenWelcome: false,
  });

  const handleChange = (event) => {
    const value =
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value;

    setFormData((current) => ({
      ...current,
      [event.target.name]: value,
    }));
    setStepError("");
  };

  const validateStep = (step) => {
    if (step === 0 && !formData.name.trim()) {
      return "Indiquez le nom de l’église pour continuer.";
    }

    if (
      step === 1 &&
      (!formData.address.trim() ||
        !formData.city.trim() ||
        !formData.country.trim())
    ) {
      return "Renseignez l’adresse, la ville et le pays pour positionner correctement l’église.";
    }

    if (step === 3 && !confirmed) {
      return "Confirmez que les informations peuvent être vérifiées et publiées.";
    }

    return "";
  };

  const scrollToForm = () => {
    document
      .getElementById("church-submission-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const goToNextStep = () => {
    const error = validateStep(currentStep);
    if (error) {
      setStepError(error);
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, STEPS.length - 1));
    setStepError("");
    window.setTimeout(scrollToForm, 0);
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
    setStepError("");
    window.setTimeout(scrollToForm, 0);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const firstInvalidStep = [0, 1, 3].find((step) => validateStep(step));
    if (firstInvalidStep !== undefined) {
      setCurrentStep(firstInvalidStep);
      setStepError(validateStep(firstInvalidStep));
      window.setTimeout(scrollToForm, 0);
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchApi("/api/churches", {
        method: "POST",
        body: formData,
      });

      toast.success(
        "Merci ! La fiche a été reçue et sera visible après vérification."
      );
      router.push("/trouver-eglise");
    } catch (error) {
      toast.error(
        error.message || "L’envoi a échoué. Vérifiez les informations et réessayez."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f5f2] text-gray-900">
      <Navbar />

      <main>
        <section className="bg-[#253047] px-4 py-6 text-white sm:py-8">
          <div className="mx-auto max-w-[1200px]">
            <Link
              href="/trouver-eglise"
              className="mb-3 inline-flex items-center gap-2 text-xs font-semibold text-white/70 transition hover:text-white sm:text-sm"
            >
              <FiArrowLeft aria-hidden="true" />
              Retour à la recherche
            </Link>
            <div className="max-w-3xl">
              <p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#efb8a3]">
                <FaChurch aria-hidden="true" />
                Enrichir l’annuaire
              </p>
              <h1 className="text-2xl font-bold leading-tight sm:text-3xl">
                Faire connaître votre église
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
                Aidez les personnes de votre région à trouver une communauté où
                prier et grandir. Le formulaire prend seulement quelques minutes
                et la fiche est vérifiée avant sa publication.
              </p>
            </div>
          </div>
        </section>

        <div className="mx-auto grid max-w-[1200px] gap-6 px-4 py-6 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:px-6 lg:py-8">
          <aside className="order-2 space-y-5 lg:order-1 lg:sticky lg:top-28">
            <div className="rounded-2xl border border-[#ead8ca] bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-900">
                Avant de commencer
              </h2>
              <ul className="mt-5 space-y-4 text-sm leading-relaxed text-gray-600">
                <li className="flex gap-3">
                  <FiClock
                    className="mt-0.5 shrink-0 text-lg text-[#b8755e]"
                    aria-hidden="true"
                  />
                  <span>
                    Prévoyez environ <strong>3 à 5 minutes</strong>. Les champs
                    facultatifs peuvent être complétés plus tard.
                  </span>
                </li>
                <li className="flex gap-3">
                  <FiMapPin
                    className="mt-0.5 shrink-0 text-lg text-[#b8755e]"
                    aria-hidden="true"
                  />
                  <span>
                    L’adresse sert à placer précisément l’église sur la carte de
                    l’annuaire.
                  </span>
                </li>
                <li className="flex gap-3">
                  <FiShield
                    className="mt-0.5 shrink-0 text-lg text-[#b8755e]"
                    aria-hidden="true"
                  />
                  <span>
                    Chaque proposition est <strong>vérifiée par l’équipe</strong>{" "}
                    avant d’être rendue publique.
                  </span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-[#fff1e9] p-5 text-sm leading-relaxed text-[#724836]">
              <p className="flex items-start gap-2 font-semibold">
                <FiInfo className="mt-0.5 shrink-0" aria-hidden="true" />
                Vous n’avez pas besoin d’être le responsable officiel pour
                proposer une église, mais les informations doivent être
                publiques et vérifiables.
              </p>
            </div>
          </aside>

          <form
            id="church-submission-form"
            onSubmit={handleSubmit}
            className="order-1 scroll-mt-24 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl lg:order-2"
            noValidate
          >
            <div className="border-b border-gray-100 bg-gray-50/80 px-5 py-5 sm:px-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#b8755e]">
                    Étape {currentStep + 1} sur {STEPS.length}
                  </p>
                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    {STEPS[currentStep].title}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {STEPS[currentStep].description}
                  </p>
                </div>
                <span className="hidden rounded-full bg-white px-3 py-1 text-sm font-bold text-gray-600 shadow-sm sm:block">
                  {Math.round(((currentStep + 1) / STEPS.length) * 100)} %
                </span>
              </div>

              <div
                className="mt-5 h-2 overflow-hidden rounded-full bg-gray-200"
                aria-hidden="true"
              >
                <div
                  className="h-full rounded-full bg-[#d8947c] transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / STEPS.length) * 100}%`,
                  }}
                />
              </div>

              <ol className="mt-4 hidden grid-cols-4 gap-2 text-xs sm:grid">
                {STEPS.map((step, index) => (
                  <li
                    key={step.shortTitle}
                    className={`font-semibold ${
                      index <= currentStep ? "text-[#9f624c]" : "text-gray-400"
                    }`}
                    aria-current={index === currentStep ? "step" : undefined}
                  >
                    {index + 1}. {step.shortTitle}
                  </li>
                ))}
              </ol>
            </div>

            <div className="p-5 sm:p-8">
              {currentStep === 0 && (
                <fieldset className="space-y-5">
                  <legend className="sr-only">Identité de l’église</legend>

                  <label className="block text-sm font-semibold text-gray-800">
                    Nom public de l’église <span className="text-red-600">*</span>
                    <input
                      name="name"
                      required
                      placeholder="Ex. Église Source de Vie"
                      className={inputClassName}
                      onChange={handleChange}
                      value={formData.name}
                      autoFocus
                    />
                    <span className="mt-1.5 block text-xs font-normal text-gray-500">
                      Utilisez le nom affiché sur le bâtiment, le site ou les
                      réseaux sociaux.
                    </span>
                  </label>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Famille d’église
                      <select
                        name="tradition"
                        value={formData.tradition}
                        onChange={handleChange}
                        className={inputClassName}
                      >
                        {CHURCH_TRADITIONS.map((tradition) => (
                          <option key={tradition}>{tradition}</option>
                        ))}
                      </select>
                    </label>

                    <label className="block text-sm font-semibold text-gray-800">
                      Dénomination{" "}
                      <span className="font-normal text-gray-500">(facultatif)</span>
                      <input
                        name="denomination"
                        list="church-denominations-public"
                        placeholder="Ex. Assemblées de Dieu"
                        className={inputClassName}
                        onChange={handleChange}
                        value={formData.denomination}
                      />
                    </label>
                  </div>

                  <datalist id="church-denominations-public">
                    {CHURCH_DENOMINATIONS.map((denomination) => (
                      <option key={denomination} value={denomination} />
                    ))}
                  </datalist>
                </fieldset>
              )}

              {currentStep === 1 && (
                <fieldset className="space-y-5">
                  <legend className="sr-only">Adresse de l’église</legend>

                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-relaxed text-blue-900">
                    <p className="flex items-start gap-2">
                      <FiMapPin className="mt-0.5 shrink-0" aria-hidden="true" />
                      Indiquez l’adresse du lieu de rassemblement principal.
                      Elle sera utilisée pour positionner l’église sur la carte.
                    </p>
                  </div>

                  <label className="block text-sm font-semibold text-gray-800">
                    Adresse <span className="text-red-600">*</span>
                    <input
                      name="address"
                      required
                      placeholder="Numéro et nom de la voie"
                      className={inputClassName}
                      onChange={handleChange}
                      value={formData.address}
                      autoComplete="street-address"
                      autoFocus
                    />
                  </label>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Ville <span className="text-red-600">*</span>
                      <input
                        name="city"
                        required
                        placeholder="Ex. Bordeaux"
                        className={inputClassName}
                        onChange={handleChange}
                        value={formData.city}
                        autoComplete="address-level2"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-gray-800">
                      Code postal{" "}
                      <span className="font-normal text-gray-500">(facultatif)</span>
                      <input
                        name="postalCode"
                        placeholder="Ex. 33000"
                        className={inputClassName}
                        onChange={handleChange}
                        value={formData.postalCode}
                        autoComplete="postal-code"
                      />
                    </label>
                  </div>

                  <label className="block text-sm font-semibold text-gray-800">
                    Pays <span className="text-red-600">*</span>
                    <input
                      name="country"
                      required
                      placeholder="Pays"
                      className={inputClassName}
                      onChange={handleChange}
                      value={formData.country}
                      autoComplete="country-name"
                    />
                  </label>
                </fieldset>
              )}

              {currentStep === 2 && (
                <fieldset className="space-y-5">
                  <legend className="sr-only">
                    Informations sur la vie de l’église
                  </legend>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      Langues parlées
                      <input
                        name="languages"
                        placeholder="Ex. Français, anglais"
                        className={inputClassName}
                        onChange={handleChange}
                        value={formData.languages}
                      />
                    </label>

                    <label className="block text-sm font-semibold text-gray-800">
                      Horaires des cultes
                      <input
                        name="serviceTimes"
                        placeholder="Ex. Dimanche à 10 h 30"
                        className={inputClassName}
                        onChange={handleChange}
                        value={formData.serviceTimes}
                      />
                    </label>
                  </div>

                  <label className="block text-sm font-semibold text-gray-800">
                    Présentation de la communauté
                    <textarea
                      name="description"
                      rows={5}
                      maxLength={1500}
                      placeholder="Présentez en quelques phrases l’église, sa vision et l’accueil proposé aux nouveaux visiteurs."
                      className={inputClassName}
                      onChange={handleChange}
                      value={formData.description}
                    />
                    <span className="mt-1.5 block text-right text-xs font-normal text-gray-400">
                      {formData.description.length}/1500
                    </span>
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-[#d8947c]/50">
                      <input
                        type="checkbox"
                        name="childrenWelcome"
                        checked={formData.childrenWelcome}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <span>
                        <span className="flex items-center gap-2 font-semibold text-gray-800">
                          <FiUsers aria-hidden="true" />
                          Accueil des enfants
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                          Un accueil ou une activité est proposé aux enfants.
                        </span>
                      </span>
                    </label>

                    <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-[#d8947c]/50">
                      <input
                        type="checkbox"
                        name="accessibility"
                        checked={formData.accessibility}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <span>
                        <span className="font-semibold text-gray-800">
                          Accessible aux personnes à mobilité réduite
                        </span>
                        <span className="mt-1 block text-xs leading-relaxed text-gray-500">
                          L’entrée et les espaces principaux sont accessibles.
                        </span>
                      </span>
                    </label>
                  </div>
                </fieldset>
              )}

              {currentStep === 3 && (
                <fieldset className="space-y-6">
                  <legend className="sr-only">
                    Contact et vérification des informations
                  </legend>

                  <div>
                    <h3 className="flex items-center gap-2 font-bold text-gray-900">
                      <FiMail className="text-[#b8755e]" aria-hidden="true" />
                      Comment contacter l’église ?
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Ces informations sont facultatives, mais elles permettent
                      aux visiteurs de préparer leur venue.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-gray-800">
                      E-mail public
                      <input
                        name="email"
                        type="email"
                        placeholder="contact@eglise.fr"
                        className={inputClassName}
                        onChange={handleChange}
                        value={formData.email}
                        autoComplete="email"
                      />
                    </label>
                    <label className="block text-sm font-semibold text-gray-800">
                      Téléphone public
                      <input
                        name="phone"
                        type="tel"
                        placeholder="Ex. 01 23 45 67 89"
                        className={inputClassName}
                        onChange={handleChange}
                        value={formData.phone}
                        autoComplete="tel"
                      />
                    </label>
                  </div>

                  <label className="block text-sm font-semibold text-gray-800">
                    Site internet
                    <span className="relative block">
                      <FiGlobe
                        className="absolute left-4 top-1/2 z-10 -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        name="website"
                        type="url"
                        placeholder="https://www.votre-eglise.fr"
                        className={`${inputClassName} pl-11`}
                        onChange={handleChange}
                        value={formData.website}
                      />
                    </span>
                  </label>

                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <h3 className="font-bold text-gray-900">
                      Vérifiez les informations principales
                    </h3>
                    <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Église
                        </dt>
                        <dd className="mt-1 font-semibold text-gray-800">
                          {formData.name || "Non renseigné"}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Famille
                        </dt>
                        <dd className="mt-1 font-semibold text-gray-800">
                          {[formData.tradition, formData.denomination]
                            .filter(Boolean)
                            .join(" · ")}
                        </dd>
                      </div>
                      <div className="sm:col-span-2">
                        <dt className="text-xs font-bold uppercase tracking-wide text-gray-400">
                          Adresse
                        </dt>
                        <dd className="mt-1 font-semibold text-gray-800">
                          {[
                            formData.address,
                            formData.postalCode,
                            formData.city,
                            formData.country,
                          ]
                            .filter(Boolean)
                            .join(", ") || "Non renseignée"}
                        </dd>
                      </div>
                    </dl>
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentStep(0);
                        setStepError("");
                        window.setTimeout(scrollToForm, 0);
                      }}
                      className="mt-4 text-sm font-bold text-[#9f624c] underline underline-offset-4"
                    >
                      Modifier les informations
                    </button>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-[#d8947c]/30 bg-[#fff7f2] p-4">
                    <input
                      type="checkbox"
                      checked={confirmed}
                      onChange={(event) => {
                        setConfirmed(event.target.checked);
                        setStepError("");
                      }}
                      className="mt-1"
                    />
                    <span className="text-sm leading-relaxed text-gray-700">
                      Je confirme que ces informations sont publiques, exactes à
                      ma connaissance, et qu’elles peuvent être vérifiées puis
                      affichées dans l’annuaire.{" "}
                      <span className="text-red-600">*</span>
                    </span>
                  </label>
                </fieldset>
              )}

              {stepError && (
                <p
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700"
                  role="alert"
                >
                  {stepError}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-gray-100 bg-gray-50/70 px-5 py-4 sm:px-8">
              <button
                type="button"
                onClick={goToPreviousStep}
                disabled={currentStep === 0 || isSubmitting}
                className="inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold text-gray-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FiArrowLeft aria-hidden="true" />
                Précédent
              </button>

              {currentStep < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="inline-flex items-center gap-2 rounded-full bg-[#d8947c] px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#c6816a]"
                >
                  Suivant
                  <FiArrowRight aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 rounded-full bg-[#d8947c] px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#c6816a] disabled:cursor-wait disabled:opacity-60"
                >
                  <FiCheck aria-hidden="true" />
                  {isSubmitting ? "Envoi en cours…" : "Envoyer la proposition"}
                </button>
              )}
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
