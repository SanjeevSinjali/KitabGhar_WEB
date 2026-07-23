import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendPasswordChangeCode(to: string, code: string) {
  await transporter.sendMail({
    from: `"KitabGhar" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your KitabGhar password change code",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#1E3A5F;">Confirm your password change</h2>
        <p>Use the code below to confirm changing your KitabGhar password. This code expires in 10 minutes.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background:#f8fafc; padding: 16px; text-align:center; border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color:#64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });
}

export async function sendForgotPasswordCode(to: string, code: string) {
  await transporter.sendMail({
    from: `"KitabGhar" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Reset your KitabGhar password",
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#1E3A5F;">Reset your password</h2>
        <p>We received a request to reset your KitabGhar password. Use the code below to continue. This code expires in 10 minutes.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; background:#f8fafc; padding: 16px; text-align:center; border-radius: 8px; margin: 20px 0;">
          ${code}
        </div>
        <p style="color:#64748b; font-size: 13px;">If you didn't request this, you can safely ignore this email — your password won't be changed.</p>
      </div>
    `,
  });
}