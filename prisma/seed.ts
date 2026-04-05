import { prisma } from "../src/lib/prisma";

async function main() {
  // Creează Treasury dacă nu există
  const treasury = await prisma.treasury.findFirst();
  if (!treasury) {
    await prisma.treasury.create({ data: { totalAmount: 0 } });
  }

  const whitelistUsers = [
    { discordId: "702150314643554304", callsign: "M-001", rol: "admin", name: "Darrin Rodriguez" },
    { discordId: "285446821533188101", callsign: "M-002", rol: "user", name: "Shades Antonio" },
    { discordId: "838419996556001341", callsign: "M-003", rol: "user", name: "Alex Tudorescu" },
    { discordId: "", callsign: "M-004", rol: "user", name: "N/A" },
    { discordId: "323874759962132502", callsign: "M-005", rol: "user", name: "Brown Allanon" },
    { discordId: "377076232254390273", callsign: "M-006", rol: "user", name: "Neiconi Petrica" },
    { discordId: "556128906357374996", callsign: "M-007", rol: "user", name: "Mihail Parvu" },
    { discordId: "", callsign: "M-008", rol: "user", name: "N/A" },
    { discordId: "889089062844137532", callsign: "M-009", rol: "user", name: "Rares Barbu" },
    { discordId: "1142522913510146129", callsign: "M-010", rol: "user", name: "Paduraru David" },
    { discordId: "793944399913680916", callsign: "M-011", rol: "user", name: "Marius Mark" },
    { discordId: "", callsign: "M-012", rol: "user", name: "N/A" },

  ];

  for (const user of whitelistUsers) {
    if (!user.discordId) continue; 
    await prisma.whitelist.upsert({
      where: { discordId: user.discordId },
      update: {},
      create: user,
    });
  }

  console.log("Seed complet.");
}

main()
  .catch(console.error)
  .finally(async () => prisma.$disconnect());