import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const lastBilant = await prisma.bilant.findFirst({
      orderBy: { date: "desc" },
    });

    // Data de start: ultima generare sau null dacă e primul bilanț
    const lastDate: Date | null = lastBilant?.date ?? null;

    // Filtrăm tranzacțiile doar din intervalul (lastDate, acum]
    const transactions = await prisma.transaction.findMany({
      where: lastDate ? { date: { gt: lastDate } } : undefined,
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

    await prisma.bilant.create({
      data: {
        baniBagati,
        baniScosi,
        totalVisterie,
        profit,
        date: currentDate,
      },
    });

    return NextResponse.json({
      lastDate: lastDate ? lastDate.toISOString() : null, // null = primul bilanț
      currentDate: currentDate.toISOString(),
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

// Returnează data ultimului bilanț generat (pentru inițializarea clientului)
export async function GET() {
  try {
    const lastBilant = await prisma.bilant.findFirst({
      orderBy: { date: "desc" },
      select: { date: true },
    });

    return NextResponse.json({
      lastDate: lastBilant?.date.toISOString() ?? null,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}