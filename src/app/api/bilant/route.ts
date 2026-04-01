import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

async function sendBilantWebhook({
  perioadaStart,
  perioadaSfarsit,
  totalVisterie,
  baniBagati,
  baniScosi,
  profit,
  generatDe,
}: {
  perioadaStart: string;
  perioadaSfarsit: string;
  totalVisterie: number;
  baniBagati: number;
  baniScosi: number;
  profit: number;
  generatDe: string;
}) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  const isProfit = profit >= 0;

  const embed = {
    title: "📊 Bilanț Financiar",
    color: isProfit ? 0x57f287 : 0xed4245,
    fields: [
      {
        name: "Perioadă",
        value: `${perioadaStart} → ${perioadaSfarsit}`,
        inline: false,
      },
      {
        name: "Total Visterie",
        value: `$${totalVisterie.toLocaleString("ro-RO")}`,
        inline: true,
      },
      {
        name: "Bani Adăugați",
        value: `$${baniBagati.toLocaleString("ro-RO")}`,
        inline: true,
      },
      {
        name: "Bani Scoși",
        value: `$${baniScosi.toLocaleString("ro-RO")}`,
        inline: true,
      },
      {
        name: isProfit ? "📈 Profit perioadă" : "📉 Pierdere perioadă",
        value: `$${Math.abs(profit).toLocaleString("ro-RO")}`,
        inline: false,
      },
    ],
    footer: {
      text: `Generat de ${generatDe} • ${perioadaSfarsit}`,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
  } catch (err) {
    console.error("Webhook bilant error:", err);
  }
}

const formatDate = (d: Date): string =>
  `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const generatDe = session?.user?.username ?? session?.user?.name ?? "Necunoscut";

    const lastBilant = await prisma.bilant.findFirst({
      orderBy: { date: "desc" },
    });

    const lastDate: Date | null = lastBilant?.date ?? null;

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

    const perioadaStart = lastDate ? formatDate(lastDate) : "început";
    const perioadaSfarsit = formatDate(currentDate);

    // Fire-and-forget — nu blocăm răspunsul
    sendBilantWebhook({
      perioadaStart,
      perioadaSfarsit,
      totalVisterie,
      baniBagati,
      baniScosi,
      profit,
      generatDe,
    });

    return NextResponse.json({
      lastDate: lastDate ? lastDate.toISOString() : null,
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