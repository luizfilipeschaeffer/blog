import { Resend } from "resend";

function assertEmailConfig() {
  if (process.env.NODE_ENV !== "production") return;
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY must be set in production");
  }
  if (!process.env.EMAIL_FROM) {
    throw new Error("EMAIL_FROM must be set in production");
  }
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  assertEmailConfig();
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.EMAIL_FROM || "SSR Blog Kit <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[email:dev] Password reset link for", to, resetUrl);
    return { id: "dev-log" };
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject: "Redefinir senha — SSR Blog Kit",
    html: `
      <p>Olá ${name},</p>
      <p>Recebemos um pedido para redefinir sua senha no admin do blog.</p>
      <p><a href="${resetUrl}">Clique aqui para criar uma nova senha</a>.</p>
      <p>Este link expira em 1 hora. Se você não solicitou, ignore este e-mail.</p>
    `,
    text: `Olá ${name},\n\nRedefina sua senha: ${resetUrl}\n\nO link expira em 1 hora.`,
  });

  if (error) {
    throw new Error(error.message || "Falha ao enviar e-mail");
  }
  return data;
}
