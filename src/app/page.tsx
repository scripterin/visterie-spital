import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LoginPage from "@/components/LoginPage";

export default async function Home() {
  const session = await auth();

  if (session?.user?.discordId) {
    const whitelist = await prisma.whitelist.findUnique({
      where: { discordId: session.user.discordId },
    });
    if (whitelist) {
      redirect("/dashboard");
    } else {
      redirect("/access-denied");
    }
  }

  return <LoginPage />;
}
