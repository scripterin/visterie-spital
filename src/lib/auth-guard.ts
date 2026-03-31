import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await auth();

  if (!session?.user?.discordId) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), session: null, whitelist: null };
  }

  const whitelist = await prisma.whitelist.findUnique({
    where: { discordId: session.user.discordId },
  });

  if (!whitelist) {
    return { error: NextResponse.json({ error: "Not whitelisted" }, { status: 403 }), session: null, whitelist: null };
  }

  return { error: null, session, whitelist };
}
