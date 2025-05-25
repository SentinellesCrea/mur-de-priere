import nodemailer from "nodemailer";

export default async function sendVolunteerNotificationEmail({ prenom, email, telephone, prayerRequest }) {
  const transporter = nodemailer.createTransport({
    host: process.env.GMAIL_HOST,
    port: process.env.GMAIL_PORT,
    secure: true,
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: `"Mur de Prière" <${process.env.GMAIL_USER}>`,
    to: "sentinelles.crea@gmail.com", // email temporaire
    subject: "📬 Nouvelle demande avec suivi bénévole",
    text: `
Une nouvelle demande de prière a été déposée avec demande de contact :

👤 Prénom : ${name}
📧 Email : ${email || "Non fourni"}
📞 Téléphone : ${phone || "Non fourni"}
💬 Prière : ${prayerRequest}
${isUrgent ? "🚨 URGENCE : OUI" : ""}

➡️ Connecte-toi à l’espace superviseur pour l’attribuer à un bénévole.
    `,
  });
}
