import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AccessDeniedPage from "@/components/AccessDeniedPage";

export default async function AccessDenied() {
  const session = await auth();
  if (!session) redirect("/");
  return <AccessDeniedPage session={session} />;
}
