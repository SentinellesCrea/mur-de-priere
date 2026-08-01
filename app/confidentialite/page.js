import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Confidentialite() {
  return (
  <div>
    <div className="max-w-3xl mx-auto px-4 py-10 mt-20">
    <Navbar />
      <h1 className="text-2xl font-bold mb-6">🔒 Politique de Confidentialité</h1>
      <p className="mb-4">


Conformément au Règlement (UE) 2016/679 (RGPD) et à la loi Informatique et Libertés du 6 janvier 1978 modifiée.<br />

---<br />

### 1. Responsable du traitement<br />

Sentinelles Créa  <br />
Email : sentinelles.crea@gmail.com  <br />
Le site *Mur de Prière* collecte des données personnelles uniquement dans le cadre de ses finalités.<br />

---<br />

### 2. Données collectées<br />

Les données suivantes peuvent être collectées :<br />
- Données d’identification : prénom, email, téléphone (le cas échéant)  <br />
- Données de contenu : texte de prière, témoignage  <br />
- Données techniques : cookies de session, adresse IP, logs de connexion <br /> 
- Données de profil : rôle (bénévole, superviseur), photo de profil<br />

---<br />

### 3. Finalités<br />

Les données sont traitées pour :<br />
- permettre la publication de prières et témoignages ;<br />
- attribuer des missions à des bénévoles ;<br />
- assurer la sécurité des accès au site (authentification par cookies) ;<br />
- informer les utilisateurs par email, sous réserve de consentement.<br />

---<br />

### 4. Base légale<br />

Conformément à l’article 6 du RGPD :<br />
- le consentement est requis pour les formulaires ;<br />
- l’intérêt légitime s’applique à la modération et au fonctionnement du site ;<br />
- les obligations légales peuvent s’appliquer (réponse à une injonction judiciaire).<br />

---<br />

### 5. Durée de conservation<br />

- Les prières et témoignages : 3 ans à compter de la publication.  <br />
- Les données de compte : jusqu’à la suppression ou l’inactivité pendant 24 mois.  <br />
- Les logs techniques : 12 mois maximum.<br />

---<br />

### 6. Vos droits<br />

Vous disposez des droits suivants :<br />
- **Accès** à vos données<br />
- **Rectification**<br />
- **Effacement (droit à l’oubli)**<br />
- **Opposition** <br />
- **Limitation du traitement** <br />
- **Portabilité** <br />

Vous pouvez exercer vos droits par email à **contact.murdepriere@gmail.com**. Réponse dans un délai de 30 jours.<br />

---<br />

### 7. Sécurité<br />

Les données sont stockées dans MongoDB Atlas et hébergées sur Vercel.  <br />
Toutes les communications sont chiffrées via HTTPS.  <br />
Les accès sont protégés par cookies sécurisés (`HttpOnly`, `Secure`, `SameSite=Strict`). <br />

---<br />

### 8. Transferts hors UE<br />

Des données techniques peuvent transiter via Vercel (USA). Le traitement est encadré par des clauses contractuelles types conformes aux exigences de la CNIL et de la Commission européenne.<br />

---<br />

### 9. Cookies<br />

Le site utilise :<br />
- des cookies strictement nécessaires (authentification, sécurité) ;<br />
- aucun cookie publicitaire ni tiers.<br />

Consentement non requis pour les cookies essentiels conformément à la directive ePrivacy.<br />

---<br />

### 10. Réclamation<br />

En cas de litige, vous pouvez déposer une réclamation auprès de la CNIL :  <br />
[www.cnil.fr](https://www.cnil.fr) – ou par courrier : 3 Place de Fontenoy, 75007 Paris <br />

      </p>

    </div>

      <Footer />
    </div>
  );
}
