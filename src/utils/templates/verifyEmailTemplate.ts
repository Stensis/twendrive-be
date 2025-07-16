// utils/templates/verifyEmailTemplate.ts

export const getVerifyEmailTemplate = (
  userName: string,
  token: string
): { text: string; html: string } => {
  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

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

export const getResetPasswordTemplate = (
  userName: string,
  token: string
): { text: string; html: string } => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const text = `Hello ${userName},\n\nYou requested to reset your password.\nClick this link to reset your password (valid for 15 minutes):\n${resetUrl}\n\nIf you didn’t request this, please ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2>Hello ${userName},</h2>
      <p>You recently requested to reset your password for your <strong>TwenDrive</strong> account.</p>
      <p>Click the button below to reset your password. This link is valid for <strong>15 minutes</strong>.</p>
      <a href="${resetUrl}" 
         style="display: inline-block; padding: 12px 20px; background-color: #f97316; color: white; text-decoration: none; border-radius: 5px;">
         Reset Password
      </a>
      <p style="margin-top: 20px;">Or copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <hr />
      <small>If you did not request a password reset, please ignore this email or contact support if you have concerns.</small>
    </div>
  `;

  return { text, html };
};
