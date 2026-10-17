import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth, { type DefaultSession } from "next-auth";
import type { Role } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { SITE_NAME } from "@/lib/site";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"];
  }
}

const adminEmail = () => process.env.ADMIN_EMAIL?.trim().toLowerCase() || null;

/** El email de ADMIN_EMAIL siempre entra como administrador. */
async function ensureAdminRole(user: { id?: string; email?: string | null }) {
  if (!user.id || !user.email || user.email.toLowerCase() !== adminEmail()) return;
  await db.user.update({ where: { id: user.id }, data: { role: "ADMIN" } });
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // El adaptador espera el cliente estándar de Prisma; el nuestro es equivalente.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(db as any),
  session: { strategy: "database", maxAge: 30 * 24 * 60 * 60 },
  trustHost: true,
  pages: { signIn: "/entrar", verifyRequest: "/entrar/revisa-tu-email", error: "/entrar" },
  providers: [
    {
      id: "email",
      type: "email",
      name: "Email",
      from: process.env.EMAIL_FROM || `${SITE_NAME} <no-reply@example.com>`,
      maxAge: 15 * 60,
      options: {},
      async sendVerificationRequest({ identifier, url }) {
        await sendEmail({
          to: identifier,
          subject: `Tu enlace para entrar en ${SITE_NAME}`,
          paragraphs: [
            "Hola:",
            `Pulsa el botón para entrar en ${SITE_NAME}. El enlace caduca en 15 minutos y solo sirve una vez.`,
            "Si no lo has pedido tú, ignora este email.",
          ],
          action: { label: "Entrar", url },
        });
      },
    },
  ],
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id;
      session.user.role = (user as unknown as { role: Role }).role;
      return session;
    },
  },
  events: {
    createUser: ({ user }) => ensureAdminRole(user),
    signIn: ({ user }) => ensureAdminRole(user),
  },
});
