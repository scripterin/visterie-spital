import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // 1. Forțăm strategia JWT pentru a putea controla cookie-ul mai ușor
  session: { 
    strategy: "jwt",
    maxAge: 0, // Aceasta este cheia pentru "Session Cookie"
  },
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
      // 2. Obligăm utilizatorul să dea click pe "Authorize" de fiecare dată
      authorization: { params: { prompt: "consent" } },
    }),
  ],
  callbacks: {
    // 3. Adăugăm callback-ul JWT pentru a injecta datele din DB în token
    async jwt({ token, user, trigger }) {
      if (user) {
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { discordId: true, callsign: true, rol: true, username: true, avatar: true },
        });
        if (dbUser) {
          token.id = user.id;
          token.discordId = dbUser.discordId;
          token.callsign = dbUser.callsign;
          token.rol = dbUser.rol;
          token.username = dbUser.username;
          token.avatar = dbUser.avatar;
        }
      }
      return token;
    },
    // 4. Actualizăm session() să citească din token (nu din user, pt că e JWT)
    async session({ session, token }) {
      if (session.user && token) {
        session.user.id = token.id as string;
        session.user.discordId = token.discordId as string;
        session.user.callsign = token.callsign as string;
        session.user.rol = token.rol as string;
        session.user.username = token.username as string;
        session.user.avatar = token.avatar as string;
      }
      return session;
    },
    async signIn({ account, profile }) {
      if (account?.provider === "discord" && profile) {
        const discordProfile = profile as any;
        const discordId = discordProfile.id;
        
        const username = discordProfile.discriminator === "0"
          ? `@${discordProfile.username}`
          : `@${discordProfile.username}#${discordProfile.discriminator}`;
        
        const avatar = discordProfile.avatar
          ? `https://cdn.discordapp.com/avatars/${discordId}/${discordProfile.avatar}.png`
          : `https://cdn.discordapp.com/embed/avatars/0.png`;

        const whitelist = await prisma.whitelist.findUnique({
          where: { discordId },
        });

        // Verificăm dacă există deja userul
        const existingUser = await prisma.user.findFirst({
          where: {
            accounts: {
              some: {
                provider: "discord",
                providerAccountId: discordId,
              },
            },
          },
        });

        if (existingUser) {
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              discordId,
              username,
              avatar,
              callsign: whitelist?.callsign ?? null,
              rol: whitelist?.rol ?? "user",
            },
          });
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
});