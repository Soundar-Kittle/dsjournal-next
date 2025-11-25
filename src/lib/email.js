import nodemailer from "nodemailer";

export async function sendEmail({ to, subject, text, from }) {
  const transporter = nodemailer.createTransport({
    service: "gmail", // or your SMTP provider
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    text
  });
}