interface WebhookPayload {
  type: "add" | "remove";
  username: string;
  callsign: string;
  amount: number;
  reason: string;
  date: string;
  discordId: string | null;
}

function getRomanianDateTime(): string {
  return new Date().toLocaleString("ro-RO", {
    timeZone: "Europe/Bucharest",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export async function sendDiscordWebhook(payload: WebhookPayload) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL not set, skipping webhook.");
    return;
  }

  const isAdd = payload.type === "add";
  const color = isAdd ? 0x57f287 : 0xed4245; // Verde / Roșu
  const statusIcon = isAdd ? "🟢" : "🔴";
  const typeTitle = isAdd ? "Adăugare în Visterie" : "Retragere din Visterie";
  const amountStr = `$${payload.amount.toLocaleString("ro-RO")}`;
  const userTag = payload.discordId ? `<@${payload.discordId}>` : payload.username;

  const embed = {
    title: `${statusIcon} ${typeTitle}`,
    color,
    fields: [
      {
        name: "Efectuat de",
        value: userTag,
        inline: false,
      },
      {
        name: "Callsign",
        value: payload.callsign,
        inline: false,
      },
      {
        name: "Sumă",
        value: amountStr,
        inline: false,
      },
      {
        name: "Motiv",
        value: payload.reason,
        inline: false,
      },
    ],
    footer: {
      text: `Visterie System • ${getRomanianDateTime()}`,
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
        allowed_mentions: { parse: ["users"] },
      }),
    });
  } catch (err) {
    console.error("Webhook error:", err);
  }
}