import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const lastBilant = await prisma.bilant.findFirst({
      orderBy: { date: "desc" },
    });

    const lastDate = lastBilant?.date ?? new Date(0); // dacă nu există, luăm epoch

    const transactions = await prisma.transaction.findMany({
      where: { date: { gt: lastDate } },
    });

    let baniBagati = 0;
    let baniScosi = 0;

    for (const tx of transactions) {
      if (tx.type === "add") baniBagati += tx.amount;
      if (tx.type === "remove") baniScosi += tx.amount;
    }

    const treasury = await prisma.treasury.findFirst();
    const totalVisterie = treasury?.totalAmount ?? 0;

    const profit = baniBagati - baniScosi;

    const currentDate = new Date();
    const bilant = await prisma.bilant.create({
      data: {
        baniBagati,
        baniScosi,
        totalVisterie,
        profit,
        date: currentDate,
      },
    });

    return NextResponse.json({
      bilant,
      lastDate,
      currentDate,
      baniBagati,
      baniScosi,
      totalVisterie,
      profit,
    });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}