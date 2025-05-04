import nodemailer from "nodemailer";

export async function sendVolunteerWelcomeEmail({ email, firstName }) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,           
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Mur de Prière" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Merci pour votre inscription bénévole",
    text: `
Bonjour ${firstName},

Nous avons bien reçu votre demande d’inscription en tant que bénévole sur Mur de Prière.

Votre profil est actuellement à l’étude. Un membre de notre équipe vous contactera prochainement pour un entretien de validation. 
Si cet échange est concluant, votre compte sera activé et vous pourrez commencer à aider.
Dans le cas contraire, nous vous remercierons chaleureusement pour votre démarche.

Quoi qu’il en soit, merci pour votre cœur et votre volonté de servir.

L’équipe du Mur de Prière.
    `,
  };

  await transporter.sendMail(mailOptions);
}
