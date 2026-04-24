/**
 * @module actions/contact
 * @category Actions
 *
 * Server Action for the public contact / support form.
 * Validates input via Zod, then sends an e-mail directly to the support
 * address using Resend. No DB storage — no migration required.
 *
 * Required env var:
 *   RESEND_API_KEY  — Resend dashboard → API Keys
 */
"use server"

import { Resend } from "resend"
import { ContactSchema, CONTACT_SUBJECTS, type ContactInput } from "@/lib/validators/contact"

const SUPPORT_EMAIL = "contact@waitlight.fr"

// Resend client — instantiated per request to pick up env at runtime
function getResend() {
    const key = process.env.RESEND_API_KEY
    if (!key) throw new Error("RESEND_API_KEY is not set")
    return new Resend(key)
}

function subjectLabel(value: string): string {
    return CONTACT_SUBJECTS.find((s) => s.value === value)?.label ?? value
}

/** Build a clean HTML e-mail body */
function buildHtml(input: ContactInput): string {
    return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /></head>
<body style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;padding:32px 24px;color:#111827;background:#fff">
  <div style="margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #6366F1">
    <span style="font-size:22px;font-weight:900;color:#111827">Wait-Light</span>
    <span style="margin-left:8px;font-size:13px;color:#6B7280">Contact & Support</span>
  </div>

  <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
    <tr>
      <td style="padding:8px 0;color:#6B7280;font-size:13px;font-weight:600;width:120px">Nom</td>
      <td style="padding:8px 0;font-size:14px;font-weight:700">${input.name}</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#6B7280;font-size:13px;font-weight:600">E-mail</td>
      <td style="padding:8px 0;font-size:14px">
        <a href="mailto:${input.email}" style="color:#4F46E5">${input.email}</a>
      </td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#6B7280;font-size:13px;font-weight:600">Sujet</td>
      <td style="padding:8px 0;font-size:14px">${subjectLabel(input.subject)}</td>
    </tr>
  </table>

  <div style="background:#F8F9FA;border-left:4px solid #6366F1;border-radius:4px;padding:16px 20px;margin-bottom:24px">
    <p style="margin:0;font-size:13px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px">Message</p>
    <p style="margin:0;font-size:15px;line-height:1.6;white-space:pre-wrap">${input.message.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
  </div>

  <p style="font-size:12px;color:#9CA3AF;margin:0">
    Envoyé depuis le formulaire de contact de waitlight.fr
  </p>
</body>
</html>`
}

/**
 * Submit a contact / support message.
 *
 * Sends an e-mail directly to {@link SUPPORT_EMAIL} via Resend.
 * The `reply-to` header is set to the sender's address so you can
 * reply to them directly from your e-mail client.
 *
 * @param input - Validated by {@link ContactSchema}
 * @returns `{ data: null }` on success, `{ error: string }` on failure.
 */
export async function sendContactMessageAction(
    input: ContactInput,
): Promise<{ data: null } | { error: string }> {
    const parsed = ContactSchema.safeParse(input)

    if (!parsed.success) {
        return {
            error: parsed.error.issues[0]?.message ?? "Données invalides.",
        }
    }

    const { name, email, subject, message } = parsed.data

    let resend: Resend
    try {
        resend = getResend()
    } catch {
        console.error("[contact] RESEND_API_KEY missing")
        return { error: "Service d'envoi non configuré. Contactez-nous directement à contact@waitlight.fr" }
    }

    const { error } = await resend.emails.send({
        from: "Wait-Light Contact <no-reply@waitlight.fr>",
        to: SUPPORT_EMAIL,
        replyTo: `${name} <${email}>`,
        subject: `[Contact] ${subjectLabel(subject)} — ${name}`,
        html: buildHtml({ name, email, subject, message, consent: true }),
    })

    if (error) {
        console.error("[contact] Resend error:", error)
        return {
            error: "Impossible d'envoyer le message. Réessayez plus tard.",
        }
    }

    return { data: null }
}
