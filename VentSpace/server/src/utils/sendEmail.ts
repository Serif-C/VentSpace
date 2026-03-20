import { Resend } from "resend";
import { env } from "../env.js";

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${env.APP_URL}/verify-email?token=${token}`;

  console.log("Sending email to:", email);
  console.log("Verification link:", verificationLink);

  await resend.emails.send({
    from: "VentSpace <onboarding@resend.dev>",
    to: email,
    subject: "Verify your VentSpace account",
    html: `
      <h2>Welcome to VentSpace 🌿</h2>
      <p>Please verify your email to activate your account.</p>

      <p>
        <a href="${verificationLink}" 
           style="
           background:#6366f1;
           color:white;
           padding:10px 16px;
           border-radius:6px;
           text-decoration:none;
           font-weight:500;
           ">
           Verify Email
        </a>
      </p>

      <p>If the button doesn't work, use this link:</p>
      <p>${verificationLink}</p>

      <p>This link expires in 24 hours.</p>
    `,
  });
}