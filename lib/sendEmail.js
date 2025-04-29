// /lib/sendEmail.js

import nodemailer from "nodemailer";

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,   // 🔥 Ton Gmail
      pass: process.env.GMAIL_APP_PASSWORD,   // 🔥 Ton mot de passe d'application
    },
  });

  const mailOptions = {
    from: `"Mur de Prière" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};
