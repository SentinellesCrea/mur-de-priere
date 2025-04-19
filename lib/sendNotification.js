// /lib/sendNotification.js
import nodemailer from "nodemailer";

export default async function sendNotification(email, name) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,           // ✅ ton email : sentinelles.crea@gmail.com
      pass: process.env.GMAIL_APP_PASSWORD,   // ✅ ton mot de passe d’application
    },
  });

  const mailOptions = {
    from: `"Mur de Prière" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Quelqu’un prie pour vous 🙏",
    html: ` 
      <p>Bonjour ${name},</p>
      <p>Un(e) participant(e) vient de cliquer sur “Je prie pour toi” pour votre demande.</p>
      <p>Vous êtes soutenu(e) dans la prière. Que Dieu vous fortifie !</p>
      <p><em>L’équipe du Mur de Prière</em></p>
    `
  };

  await transporter.sendMail(mailOptions);
}
