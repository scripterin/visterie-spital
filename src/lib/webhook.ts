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
  // Folosim pătrate colorate pentru un aspect mai robust
  const statusIcon = isAdd ? "🟢" : "🔴"; 
  const typeTitle = isAdd ? "ADĂUGARE VISTERIE" : "RETRAGERE VISTERIE";
  const amountStr = `$${payload.amount.toLocaleString("ro-RO")}`;
  const userTag = payload.discordId ? `<@${payload.discordId}>` : payload.username;

  // Construim mesajul folosind separatoare de tip bară grea (▬)
  // Acest design este 100% text normal, deci totul este indexat perfect de Search
  const message = [
    `**▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬**`,
    `${statusIcon} **${typeTitle}**`,
    `**▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬**`,
    `> **EFECTUAT DE:** ${userTag}`,
    `> **CALLSIGN:** ${payload.callsign}`,
    `> **SUMĂ:** ${amountStr}`,
    `> **MOTIV:** ${payload.reason}`,
    `> **DATA:** ${payload.date}`,
  ].join("\n");

  try {
    await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: message,
        // Permitem mențiunile pentru ca @user să apară albastru și să fie clickabil
        allowed_mentions: { parse: ["users"] } 
      }),
    });
  } catch (err) {
    console.error("Webhook error:", err);
  }
}