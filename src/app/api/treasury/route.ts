import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const treasury = await prisma.treasury.findFirst();
  return NextResponse.json({ totalAmount: treasury?.totalAmount ?? 0 });
}
