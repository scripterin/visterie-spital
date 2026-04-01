import NextAuth from "next-auth";
import Discord from "next-auth/providers/discord";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Discord({
      clientId: process.env.DISCORD_CLIENT_ID!,
      clientSecret: process.env.DISCORD_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { discordId: true, callsign: true, rol: true, username: true, avatar: true },
        });
        if (dbUser) {
          session.user.discordId = dbUser.discordId ?? undefined;
          session.user.callsign = dbUser.callsign ?? undefined;
          session.user.rol = dbUser.rol;
          session.user.username = dbUser.username ?? undefined;
          session.user.avatar = dbUser.avatar ?? undefined;
        }
      }
      return session;
    },
    async signIn({ account, profile }) {
      if (account?.provider === "discord" && profile) {
        const discordProfile = profile as {
          id: string;
          username: string;
          avatar: string | null;
          discriminator: string;
        };
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
  events: {
    async createUser({ user }) {
      await prisma.user.update({
        where: { id: user.id },
        data: { email: null, emailVerified: null },
      });
    },
  },
  pages: {
    signIn: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
});