interface WebhookPayload {
  type: "add" | "remove";
  username: string;
  callsign: string;
  amount: number;
  reason: string;
  date: string;
  discordId: string | null;
}

export async function sendDiscordWebhook(payload: WebhookPayload) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL not set, skipping webhook.");
    return;
  }

  const isAdd = payload.type === "add";
  const color = isAdd ? 0x00e5a0 : 0xff4d6d;
  const title = isAdd ? "💰 Adăugare în visterie" : "💸 Retragere din visterie";
  const amountStr = `$${payload.amount.toLocaleString()}`;
  const mention = payload.discordId ? `<@${payload.discordId}>` : payload.username;

  const embed = {
    title,
    color,
    fields: [
      { name: "Efectuat de", value: mention, inline: false },
      { name: "Callsign", value: payload.callsign, inline: false },
      { name: "Sumă", value: amountStr, inline: false },
      { name: "Motiv", value: payload.reason, inline: false },
      { name: "Data", value: payload.date, inline: false },
    ],
    footer: { text: "Visterie System" },
    timestamp: new Date().toISOString(),
  };

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
      }),
    });
  } catch (err) {
    console.error("Webhook error:", err);
  }
}