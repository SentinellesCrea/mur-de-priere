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
    subject: "Bienvenue dans l’aventure du Mur de Prière",
    text: `
Bonjour ${firstName},

Merci beaucoup pour votre inscription en tant que bénévole sur le Mur de Prière.

Nous sommes vraiment heureux de voir votre désir de servir, d’écouter et de porter les autres dans la prière.

Votre inscription a bien été reçue. Notre équipe va maintenant la consulter avec attention, puis un responsable pourra revenir vers vous pour faire connaissance et vous accompagner dans la suite.

Dès que votre compte sera validé, vous recevrez l’accès à votre espace bénévole et vous pourrez commencer à participer aux suivis de prière.

Encore merci pour votre cœur disponible. C’est précieux, et nous sommes reconnaissants de vous voir rejoindre cette belle mission.

L’équipe du Mur de Prière.
    `,
  };

  await transporter.sendMail(mailOptions);
}
