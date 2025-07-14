// utils/templates/verifyEmailTemplate.ts

export const getVerifyEmailTemplate = (userName: string, token: string): { text: string; html: string } => {
  const verifyUrl = `http://localhost:8080/verify-email?token=${token}`;

  const text = `Hello ${userName}, click this link to verify your email as a TwenDrive user: ${verifyUrl}`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Hello ${userName},</h2>
      <p>Thank you for registering with <strong>TwenDrive</strong>.</p>
      <p>Please click the button below to verify your email address:</p>
      <a href="${verifyUrl}" 
         style="display: inline-block; padding: 12px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px;">
         Verify Email
      </a>
      <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
      <p>${verifyUrl}</p>
      <hr />
      <small>If you did not sign up for TwenDrive, please ignore this email.</small>
    </div>
  `;

  return { text, html };
};
