import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-guard";
import { sendDiscordWebhook } from "@/lib/webhook";

export async function GET() {
  try {
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
  } catch (err) {
    console.error("GET /transactions error:", err);
    return NextResponse.json(
      { error: "Eroare la încărcarea tranzacțiilor" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    if (!session?.user?.discordId) {
      return NextResponse.json(
        { error: "Sesiune invalidă" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, amount, reason, callsign } = body;

    // Validation
    if (!["add", "remove"].includes(type)) {
      return NextResponse.json({ error: "Tip invalid" }, { status: 400 });
    }

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return NextResponse.json(
        { error: "Suma trebuie să fie mai mare de 0" },
        { status: 400 }
      );
    }

    if (!reason?.trim()) {
      return NextResponse.json(
        { error: "Motivul este obligatoriu" },
        { status: 400 }
      );
    }

    if (!callsign?.trim()) {
      return NextResponse.json(
        { error: "Callsign-ul este obligatoriu" },
        { status: 400 }
      );
    }

    const numericAmount = Number(amount);
    const formattedCallsign = callsign.startsWith("M-")
      ? callsign
      : `M-${callsign}`;

    // Treasury
    let treasury = await prisma.treasury.findFirst();

    if (!treasury) {
      treasury = await prisma.treasury.create({
        data: { totalAmount: 0 },
      });
    }

    if (type === "remove" && treasury.totalAmount < numericAmount) {
      return NextResponse.json(
        { error: "Fonduri insuficiente în visterie" },
        { status: 400 }
      );
    }

    // User DB
    const dbUser = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "Utilizatorul nu a fost găsit" },
        { status: 404 }
      );
    }

    // Transaction
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

    // Webhook (safe)
    try {
      await sendDiscordWebhook({
        type,
        username: session.user.username ?? "Necunoscut",
        callsign: formattedCallsign,
        amount: numericAmount,
        reason: reason.trim(),
        date: new Date().toLocaleString("ro-RO"),
        discordId: session.user.discordId ?? null,
      });
    } catch (e) {
      console.error("Webhook error:", e);
    }

    return NextResponse.json(transaction, { status: 201 });
  } catch (err) {
    console.error("POST /transactions error:", err);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: String(err),
      },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const { error, session } = await requireAuth();
    if (error) return error;

    if (!session?.user?.discordId) {
      return NextResponse.json(
        { error: "Sesiune invalidă" },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { discordId: session.user.discordId },
    });

    if (dbUser?.rol !== "admin") {
      return NextResponse.json(
        {
          error: "Acces interzis. Doar adminii pot șterge istoricul.",
        },
        { status: 403 }
      );
    }

    await prisma.transaction.deleteMany({});

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /transactions error:", err);
    return NextResponse.json(
      { error: "Eroare la ștergere" },
      { status: 500 }
    );
  }
}

