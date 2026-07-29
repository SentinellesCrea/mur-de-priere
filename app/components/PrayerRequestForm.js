"use client";

import { useState } from "react";
import { toast } from 'react-toastify';
import { TiInfoLarge } from "react-icons/ti";
import { RiEdit2Line } from "react-icons/ri";
import { fetchApi } from "@/lib/fetchApi";

import CategorySelector from "./prayer/CategorySelector";


const PrayerRequestForm = ({
  onNewPrayer,
  mode = "create",
  initialData,
  onPrayerUpdated,
  onCancel,
  embedded = false,
}) => {
  const isEditMode = mode === "edit";
  const editableData = initialData?.editableData || initialData || {};
  const initialName = editableData.name || initialData?.name || "";
  const formId = isEditMode ? `edit-prayer-${initialData?._id || "request"}` : "create-prayer";

  const [name, setName] = useState(initialName === "Anonyme" ? "" : initialName);
  const [isAnonymous, setIsAnonymous] = useState(initialName === "Anonyme");
  const [email, setEmail] = useState(editableData.email || "");
  const [phone, setPhone] = useState(editableData.phone || "");
  const [prayerRequest, setPrayerRequest] = useState(editableData.prayerRequest || "");
  const [notify, setNotify] = useState(editableData.notify === true);
  const [wantsVolunteer, setWantsVolunteer] = useState(editableData.wantsVolunteer === true);
  const [isUrgent, setIsUrgent] = useState(editableData.isUrgent === true);
  const [shareOption, setShareOption] = useState("Partager cette demande");
  const [date, setDate] = useState(new Date().toISOString());
  const [category, setCategory] = useState(editableData.category || "");
  const [subcategory, setSubcategory] = useState(editableData.subcategory || "");
  const [allowComments, setAllowComments] = useState(editableData.allowComments !== false);
  const [publicationConsent, setPublicationConsent] = useState(isEditMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Empêche double clic
    if (isSubmitting) return;

    if ((!name && !isAnonymous) || !prayerRequest || !category) return;

    setIsSubmitting(true);

    const requestData = {
      name: isAnonymous ? "Anonyme" : name,
      email: wantsVolunteer || notify ? email : "",
      phone: wantsVolunteer ? phone : "",
      prayerRequest,
      isUrgent,
      notify,
      wantsVolunteer,
      shareOption,
      date,
      category,
      subcategory,
      allowComments,
    };

    try {
      const data = await fetchApi(
        isEditMode
          ? `/api/prayerRequests/${initialData._id}`
          : "/api/prayerRequests/create",
        {
          method: isEditMode ? "PUT" : "POST",
          body: requestData,
        }
      );

      if (isEditMode) {
        toast.success("Votre demande de prière a été modifiée.");
        if (typeof onPrayerUpdated === "function") {
          onPrayerUpdated(data.prayer);
        }
        return;
      }

      toast.success("🙏 Votre demande de prière est publiée sur le mur !");

      if (typeof onNewPrayer === "function") {
        onNewPrayer(data);
      }

      setTimeout(() => {
        const target = document.getElementById("PrayerWallSection");
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);

      window.dispatchEvent(new Event("prayer:created"));

      // reset form
      setName("");
      setEmail("");
      setPhone("");
      setPrayerRequest("");
      setNotify(false);
      setWantsVolunteer(false);
      setIsUrgent(false);
      setDate(new Date().toISOString());
      setCategory("");
      setSubcategory("");
      setIsAnonymous(false);

    } catch (error) {

      toast.error(error.message || (isEditMode ? "La modification a échoué." : "Erreur lors de l'envoi."));

    } finally {

      // ✅ Réactive le formulaire même en cas d'erreur
      setIsSubmitting(false);

    }
  };


  return (
    <section 
      id={isEditMode ? `PrayerRequestForm-${initialData?._id}` : "PrayerRequestForm"}
      className={
        embedded
          ? "w-full"
          : "flex flex-col md:flex-row items-center justify-center px-8 py-10 mx-auto w-full"
      }
    >
      <div
        className={`w-full max-w-4xl p-6 bg-white rounded-xl ${
          embedded ? "max-h-[85vh] overflow-y-auto" : "overflow-visible"
        } ${
          embedded ? "" : "shadow-lg"
        }`}
      >
        <h3 className="text-xl font-bold flex items-center text-gray-900 mb-4 gap-2"> 
          <RiEdit2Line className="text-[#d8947c]" />         
          {isEditMode ? "Modifier votre demande de prière" : "Partagez vos sujets de prière"}<br />
        </h3>

        {isEditMode && (
          <p className="mb-4 text-xs text-gray-500">
            Tous les champs peuvent être modifiés pendant 48 heures après la publication.
          </p>
        )}

        {!isEditMode && (
          <>
            <div
              id={`${formId}-publication-help`}
              className="mb-4 rounded-lg border border-[#d8947c]/25 bg-[#FAF7F4] p-4 text-sm leading-relaxed text-gray-700"
            >
              <p className="flex items-start gap-2">
                <TiInfoLarge
                  className="mt-0.5 shrink-0 text-lg text-[#b8755e]"
                  aria-hidden="true"
                />
                <span>
                  <strong>Votre texte sera visible publiquement</strong> sur le
                  Mur de Prière. Votre e-mail et votre téléphone ne seront jamais
                  affichés. Évitez les noms complets, adresses et informations
                  permettant d’identifier une autre personne.
                </span>
              </p>
            </div>

            <p className="mb-4 text-sm text-gray-600">
              Pour recevoir un accompagnement, cochez « Je souhaite être
              recontacté par un bénévole ». Les demandes ne sont pas suivies en
              temps réel et ce service ne remplace pas les services d’urgence.
            </p>
          </>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>

          {/* 🔹 Prénom, facultatif si anonyme */}
          <label
            htmlFor={`${formId}-name`}
            className="block text-sm font-semibold text-gray-800"
          >
            Prénom {!isAnonymous && <span className="text-red-600">*</span>}
          </label>
          <input
            id={`${formId}-name`}
            type="text"
            placeholder={isAnonymous ? "Publication anonyme activée" : "Votre prénom"}
            className="w-full rounded-md border p-3 focus:border-[#d8947c] focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30 disabled:bg-gray-100"
            value={name}
            maxLength={80}
            onChange={(e) => setName(e.target.value.slice(0, 80))}
            required={!isAnonymous}
            disabled={isAnonymous}
          />

          {/* ✅ Case Anonyme */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`${formId}-anonymous`}
              checked={isAnonymous}
              onChange={() => setIsAnonymous(!isAnonymous)}
              className="mr-2"
            />
            <label htmlFor={`${formId}-anonymous`} className="text-gray-700">
              Je souhaite rester anonyme
            </label>
          </div>

          <CategorySelector
            idPrefix={formId}
            category={category}
            setCategory={setCategory}
            subcategory={subcategory}
            setSubcategory={setSubcategory}
          />


          <label
            htmlFor={`${formId}-request`}
            className="block text-sm font-semibold text-gray-800"
          >
            Sujet de prière <span className="text-red-600">*</span>
          </label>
          <textarea
            id={`${formId}-request`}
            rows="5"
            placeholder="Écrivez votre sujet sans information permettant d’identifier une autre personne."
            className="w-full rounded-md border p-3 focus:border-[#d8947c] focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30"
            value={prayerRequest}
            maxLength={5000}
            onChange={(e) => setPrayerRequest(e.target.value.slice(0, 5000))}
            aria-describedby={`${formId}-publication-help`}
            required
          ></textarea>

          {/* Autres options inchangées */}
          <fieldset className="space-y-3 rounded-lg border border-gray-200 p-4">
            <legend className="px-1 text-sm font-semibold text-gray-800">
              Préférences
            </legend>
          <div className="flex items-start">
            <input
              type="checkbox"
              id={`${formId}-allow-comments`}
              checked={allowComments}
              onChange={() => setAllowComments(!allowComments)}
              className="mr-2"
            />
            <label htmlFor={`${formId}-allow-comments`} className="text-gray-700">
              Autoriser les commentaires d’encouragement
            </label>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id={`${formId}-notify`}
              checked={notify}
              onChange={() => setNotify(!notify)}
              className="mr-2"
            />
            <label htmlFor={`${formId}-notify`} className="text-gray-700">
              Me notifier quand quelqu&apos;un prie pour moi
            </label>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id={`${formId}-volunteer`}
              checked={wantsVolunteer}
              onChange={() => setWantsVolunteer(!wantsVolunteer)}
              className="mr-2"
            />
            <label htmlFor={`${formId}-volunteer`} className="text-gray-700">
              Je souhaite être recontacté par un bénévole
            </label>
          </div>
          </fieldset>

          {(notify || wantsVolunteer) && (
            <div>
              <label
                htmlFor={`${formId}-email`}
                className="mb-2 block text-sm font-semibold text-gray-800"
              >
                Adresse e-mail <span className="text-red-600">*</span>
              </label>
              <input
                id={`${formId}-email`}
                type="email"
                autoComplete="email"
                placeholder="vous@exemple.fr"
                className="w-full rounded-md border p-3 focus:border-[#d8947c] focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30"
                value={email}
                maxLength={254}
                onChange={(e) => setEmail(e.target.value.slice(0, 254))}
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Cette adresse reste privée et sert uniquement au suivi demandé.
              </p>
            </div>
          )}

          {wantsVolunteer && (
            <div className="space-y-4">
              <label
                htmlFor={`${formId}-phone`}
                className="block text-sm font-semibold text-gray-800"
              >
                Téléphone <span className="font-normal text-gray-500">(optionnel)</span>
              </label>
              <input
                id={`${formId}-phone`}
                type="tel"
                autoComplete="tel"
                placeholder="Votre numéro de téléphone"
                className="w-full rounded-md border p-3 focus:border-[#d8947c] focus:outline-none focus:ring-2 focus:ring-[#d8947c]/30"
                value={phone}
                maxLength={30}
                onChange={(e) => setPhone(e.target.value.slice(0, 30))}
              />

              <div className="flex items-center">
                <button
                  type="button"
                  className={`p-3 font-semibold transition ${
                    isUrgent ? "bg-red-600 text-white" : "bg-gray-200 text-gray-700 rounded-md"
                  }`}
                  onClick={() => setIsUrgent(!isUrgent)}
                >
                  {isUrgent ? "🚨 Demande marquée comme urgente" : "Cliquez ici si la demande est urgente !"}
                </button>
              </div>
            </div>
          )}

          {!isEditMode && (
            <div className="flex items-start rounded-lg bg-gray-50 p-3">
              <input
                type="checkbox"
                id={`${formId}-publication-consent`}
                checked={publicationConsent}
                onChange={() => setPublicationConsent(!publicationConsent)}
                className="mr-2 mt-1"
                required
              />
              <label
                htmlFor={`${formId}-publication-consent`}
                className="text-sm leading-relaxed text-gray-700"
              >
                J’ai compris que mon sujet de prière sera publié sur un espace
                accessible au public. <span className="text-red-600">*</span>
              </label>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {isEditMode && (
              <button
                type="button"
                onClick={onCancel}
                disabled={isSubmitting}
                className="rounded-full bg-gray-100 p-3 font-semibold text-gray-700 transition hover:bg-gray-200 disabled:opacity-60"
              >
                Annuler
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`
                bg-[#d3947c]
                text-white
                p-3
                font-semibold
                rounded-full
                transition
                duration-300
                ${
                  isSubmitting
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:bg-[#c77a5b] hover:-translate-y-1 hover:scale-[1.02]"
                }
              `}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  {isEditMode ? "Enregistrement..." : "Envoi en cours..."}
                </span>
              ) : (
                isEditMode ? "Enregistrer les modifications" : "Envoyer mon sujet"
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default PrayerRequestForm;
