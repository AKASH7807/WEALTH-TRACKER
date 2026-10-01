"use server";

import { Resend } from "resend";

export async function sendEmail({ to, subject, react, attachments = [] }) {
  const resend = new Resend(process.env.RESEND_API_KEY || "");

  try {
    const payload = {
      from: "Wealth ERP <onboarding@resend.dev>",
      to,
      subject,
      react,
    };

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments;
    }

    const data = await resend.emails.send(payload);

    return { success: true, data };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error };
  }
}
