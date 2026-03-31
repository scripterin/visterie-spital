# 💰 Visterie — Treasury Management System

Aplicație web completă pentru managementul vistierei, cu autentificare Discord OAuth2, whitelist, dashboard, și Discord webhooks.

---

## 🛠️ Stack

- **Next.js 15** (App Router)
- **NextAuth v5** (Discord OAuth2)
- **Prisma ORM** (PostgreSQL)
- **Tailwind CSS** (dark, modern UI)
- **Discord Webhooks**

---

## ⚙️ Setup

### 1. Instalare dependențe

```bash
npm install
```

### 2. Configurare variabile de mediu

Copiați `.env.example` în `.env` și completați:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://user:password@localhost:5432/visterie"
NEXTAUTH_SECRET="un-secret-random-lung"
NEXTAUTH_URL="http://localhost:3000"
DISCORD_CLIENT_ID="id-ul-aplicatiei-discord"
DISCORD_CLIENT_SECRET="secretul-aplicatiei-discord"
DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."
```

### 3. Configurare aplicație Discord

1. Mergi la https://discord.com/developers/applications
2. Creează o aplicație nouă
3. La **OAuth2 → Redirects**, adaugă: `http://localhost:3000/api/auth/callback/discord`
4. Copiază **Client ID** și **Client Secret** în `.env`

### 4. Setup baza de date

```bash
# Creează tabelele
npx prisma db push

# Generează clientul Prisma
npx prisma generate

# Seed-uiește datele inițiale (treasury + whitelist exemplu)
npm run db:seed
```

### 5. Adaugă utilizatori în whitelist

Editează `prisma/seed.ts` sau adaugă direct în baza de date:

```sql
INSERT INTO whitelist ("discordId", callsign, rol)
VALUES ('ID_DISCORD_AL_TAU', 'M-001', 'admin');
```

Sau folosind Prisma Studio:
```bash
npm run db:studio
```

### 6. Pornire

```bash
npm run dev
```

Accesează: http://localhost:3000

---

## 🗄️ Structura proiectului

```
visterie/
├── prisma/
│   ├── schema.prisma          # Schema baza de date
│   └── seed.ts                # Date inițiale
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts   # Auth handler
│   │   │   ├── transactions/route.ts          # GET, POST, DELETE tranzacții
│   │   │   ├── treasury/route.ts              # GET sold total
│   │   │   └── whitelist/route.ts             # Verificare whitelist
│   │   ├── dashboard/page.tsx                 # Pagina principală (protejată)
│   │   ├── access-denied/page.tsx             # Pagina acces interzis
│   │   ├── page.tsx                           # Login page
│   │   ├── layout.tsx                         # Layout global
│   │   └── globals.css                        # Stiluri globale
│   ├── auth.ts                                # Config NextAuth
│   ├── components/
│   │   ├── DashboardClient.tsx                # Dashboard principal
│   │   ├── LoginPage.tsx                      # Pagina login
│   │   ├── AccessDeniedPage.tsx               # Pagina acces interzis
│   │   ├── TransactionCard.tsx                # Card tranzacție
│   │   └── modals/
│   │       ├── TransactionModal.tsx           # Modal add/remove
│   │       └── ConfirmModal.tsx               # Modal confirmare
│   ├── lib/
│   │   ├── prisma.ts                          # Prisma singleton
│   │   ├── webhook.ts                         # Discord webhook
│   │   └── auth-guard.ts                      # Helper protecție API
│   └── types/
│       └── next-auth.d.ts                     # Tipuri extinse session
├── .env.example
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 🔐 Securitate

- Toate rutele API verifică sesiunea și whitelistul
- Ștergerea istoricului e restricționată la admini
- Validare input (suma > 0, motive obligatorii)
- Protecție CSRF prin NextAuth

---

## 📦 Deploy (Vercel + Neon)

1. Creează un proiect pe [Vercel](https://vercel.com)
2. Creează o baza de date PostgreSQL pe [Neon](https://neon.tech) (gratis)
3. Adaugă variabilele de mediu în Vercel Dashboard
4. La deploy, rulează `npx prisma db push` în build command:
   ```
   npx prisma generate && npx prisma db push && next build
   ```

---

## 🤖 Discord Webhook

La fiecare tranzacție se trimite automat un embed pe canalul Discord configurat.

Creează webhook:
1. Mergi pe server Discord → canal dorit → Settings → Integrations → Webhooks
2. Copiază URL-ul în `.env` ca `DISCORD_WEBHOOK_URL`
