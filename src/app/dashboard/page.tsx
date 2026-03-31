import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DashboardClient from "@/components/DashboardClient";

export default async function Dashboard() {
  const session = await auth();

  if (!session?.user?.discordId) {
    redirect("/");
  }

  const whitelist = await prisma.whitelist.findUnique({
    where: { discordId: session.user.discordId },
  });

  if (!whitelist) {
    redirect("/access-denied");
  }

  // Attach whitelist data to session user
  const enrichedSession = {
    ...session,
    user: {
      ...session.user,
      callsign: whitelist.callsign,
      rol: whitelist.rol,
    },
  };

  return <DashboardClient session={enrichedSession} />;
}
