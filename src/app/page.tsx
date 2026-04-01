import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import LoginPage from "@/components/LoginPage";

export default async function Home() {
  const session = await auth();

  // Daca avem sesiune, verificam whitelist-ul
  if (session?.user?.discordId) {
    try {
      const whitelist = await prisma.whitelist.findUnique({
        where: { discordId: session.user.discordId },
      });

      if (whitelist) {
        return redirect("/dashboard");
      } else {
        return redirect("/access-denied");
      }
    } catch (error) {
      console.error("Eroare la verificarea whitelist:", error);
      // In caz de eroare la DB, nu redirecta infinit, lasa-l pe login sau da-i eroare
    }
  }

  // Daca NU exista sesiune, afisam pagina de login
  return <LoginPage />;
}