import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.discordId) {
    return NextResponse.json({ whitelisted: false });
  }

  const entry = await prisma.whitelist.findUnique({
    where: { discordId: session.user.discordId },
  });

  return NextResponse.json({
    whitelisted: !!entry,
    callsign: entry?.callsign,
    rol: entry?.rol,
  });
}
