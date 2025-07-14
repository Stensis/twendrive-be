import nodemailer from "nodemailer";
import { getVerifyEmailTemplate } from "./templates/verifyEmailTemplate"; // 👈 Add this line

const transporter = nodemailer.createTransport({
  service: "gmail", // or your provider
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendMail = async ({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text: string;
  html?: string;
}) => {
  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};

// ✅ Add this below sendMail
export const sendVerificationEmail = async (
  email: string,
  token: string,
  userName?: string
) => {
  const { text, html } = getVerifyEmailTemplate(userName || "User", token);

  await sendMail({
    to: email,
    subject: "Verify Your TwenDrive Email",
    text,
    html,
  });
};
