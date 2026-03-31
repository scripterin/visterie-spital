import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      discordId?: string;
      username?: string;
      avatar?: string;
      callsign?: string;
      rol: string;
      name?: string | null;
      image?: string | null;
    };
  }
}