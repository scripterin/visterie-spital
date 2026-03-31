import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { sendDiscordWebhook } from "@/lib/webhook";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;

  const transactions = await prisma.transaction.findMany({
    orderBy: { date: "desc" },
    include: {
      user: {
        select: { username: true, callsign: true },
      },
    },
  });

  return NextResponse.json(transactions);
}

export async function POST(req: NextRequest) {
  const { error, session, whitelist } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const { type, amount, reason, callsign } = body;

  // Validation
  if (!["add", "remove"].includes(type)) {
    return NextResponse.json({ error: "Tip invalid" }, { status: 400 });
  }
  if (!amount || isNaN(amount) || Number(amount) <= 0) {
    return NextResponse.json({ error: "Suma trebuie să fie mai mare de 0" }, { status: 400 });
  }
  if (!reason?.trim()) {
    return NextResponse.json({ error: "Motivul este obligatoriu" }, { status: 400 });
  }
  if (!callsign?.trim()) {
    return NextResponse.json({ error: "Callsign-ul este obligatoriu" }, { status: 400 });
  }

  const numericAmount = Number(amount);
  const formattedCallsign = callsign.startsWith("M-") ? callsign : `M-${callsign}`;

  // Get treasury and check funds for removal
  let treasury = await prisma.treasury.findFirst();
  if (!treasury) {
    treasury = await prisma.treasury.create({ data: { totalAmount: 0 } });
  }

  if (type === "remove" && treasury.totalAmount < numericAmount) {
    return NextResponse.json({ error: "Fonduri insuficiente în visterie" }, { status: 400 });
  }

  // Get user DB id
  const dbUser = await prisma.user.findUnique({
    where: { discordId: session!.user.discordId },
  });

  if (!dbUser) {
    return NextResponse.json({ error: "Utilizatorul nu a fost găsit" }, { status: 404 });
  }

  // Create transaction + update treasury atomically
  const [transaction] = await prisma.$transaction([
    prisma.transaction.create({
      data: {
        type,
        amount: numericAmount,
        reason: reason.trim(),
        callsign: formattedCallsign,
        createdBy: dbUser.id,
      },
    }),
    prisma.treasury.update({
      where: { id: treasury.id },
      data: {
        totalAmount:
          type === "add"
            ? treasury.totalAmount + numericAmount
            : treasury.totalAmount - numericAmount,
      },
    }),
  ]);

// Send Discord webhook
await sendDiscordWebhook({
  type,
  username: session!.user.username ?? "Necunoscut",
  callsign: formattedCallsign, // <-- era whitelist!.callsign
  amount: numericAmount,
  reason: reason.trim(),
  date: new Date().toLocaleString("ro-RO"),
  discordId: session!.user.discordId ?? null,
});

  return NextResponse.json(transaction, { status: 201 });
}

export async function DELETE() {
  const { error, session } = await requireAuth();
  if (error) return error;

  // Only admins can delete
  const dbUser = await prisma.user.findUnique({
    where: { discordId: session!.user.discordId },
  });

  if (dbUser?.rol !== "admin") {
    return NextResponse.json({ error: "Acces interzis. Doar adminii pot șterge istoricul." }, { status: 403 });
  }

  await prisma.transaction.deleteMany({});
  return NextResponse.json({ success: true });
}
