import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function MentionsLegales() {
  return (
    <div>
    <div className="max-w-3xl mx-auto px-4 py-10 mt-20">
    <Navbar />
      <h1 className="text-2xl font-bold mb-6">📜 Mentions Légales</h1>
      <p className="mb-4">
  <strong>Nom du site :</strong> Mur de Prière<br />
  <strong>URL :</strong> https://murdepriere.fr (à adapter)<br />
  <strong>Propriétaire :</strong> Sentinelles Créa<br />
  Entreprise individuelle – Numéro SIRET : [à compléter]<br />
  Adresse : [adresse postale complète]<br />
  Email de contact : contact@sentinelles-crea.fr<br />
  Responsable de publication : [Nom et prénom du responsable légal]<br />
  <br />
  <strong>Hébergeur</strong><br />
  <strong>Nom :</strong> Vercel Inc.<br />
  Adresse : 340 S Lemon Ave #4133, Walnut, CA 91789, USA<br />
  Site web : <a href="https://vercel.com" target="_blank" rel="noopener noreferrer">https://vercel.com</a><br />
  Vercel assure l’hébergement de l’application web sur des serveurs sécurisés situés en Europe et/ou aux États-Unis dans le cadre de clauses contractuelles types validées par la Commission européenne.<br />
  <br />
  <strong>Développement</strong><br />
  Ce site a été conçu et développé par Sentinelles Créa, entreprise de création artistique et numérique.<br />
  <br />
  <strong>Propriété intellectuelle</strong><br />
  Tous les contenus présents sur le site Mur de Prière, incluant, de façon non limitative, les textes, logos, graphismes, images, vidéos, icônes, sons et logiciels sont la propriété exclusive de Sentinelles Créa, sauf mentions contraires.<br />
  Toute reproduction, distribution, modification, adaptation, retransmission ou publication, même partielle, de ces différents éléments est strictement interdite sans l’accord préalable écrit de Sentinelles Créa.<br />
  <br />
  <strong>Responsabilité</strong><br />
  L’éditeur du site décline toute responsabilité :<br />
  - pour toute interruption du site ou bugs éventuels,<br />
  - pour toute inexactitude ou omission portant sur des informations disponibles sur le site,<br />
  - pour tout dommage résultant d’une intrusion frauduleuse d’un tiers ayant entraîné une modification des informations mises à disposition.<br />
  <br />
  <strong>Signalement d’abus</strong><br />
  Tout signalement de contenu illicite ou abusif peut être adressé à : <strong>contact@sentinelles-crea.fr</strong>, en précisant le motif, l’URL et des justificatifs si nécessaire. Le contenu litigieux sera examiné dans un délai raisonnable.
</p>

    </div>
  <Footer />
    </div>
  );
}
