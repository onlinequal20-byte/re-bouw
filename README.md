# AMS Bouwers B.V. - Dashboard

Een compleet offerte en factuur beheer systeem speciaal ontwikkeld voor AMS Bouwers B.V.

## ✨ Functionaliteiten

- 📊 **Dashboard** - Overzicht van omzet, openstaande facturen en recente activiteiten
- 👥 **Klantenbeheer** - Volledige CRUD voor klantgegevens
- 📄 **Offertes** - Maak professionele offertes met automatische nummering
- 🧾 **Facturen** - Genereer facturen met BTW berekening en betalingsstatus
- 💰 **Prijslijst** - Beheer prijzen per categorie (Badkamer, Keuken, Stucwerk, etc.)
- ⚙️ **Instellingen** - Configureer bedrijfsgegevens en Zoho Mail integratie
- 📧 **Email** - Verstuur offertes en facturen via Zoho Mail
- 📱 **Responsive** - Werkt perfect op desktop, tablet en mobiel
- 🔐 **Authenticatie** - Beveiligd met NextAuth.js

## 🚀 Installatie

### Vereisten

- Node.js 18+ 
- npm of yarn

### Stappen

1. **Clone de repository (of download het project)**

```bash
cd "amsbouwer dashboard"
```

2. **Installeer dependencies**

```bash
npm install
```

3. **Database migreren en seeden**

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Dit creëert de database met:
- 10 demo klanten
- 30 prijslijst items
- 5 voorbeeld offertes
- 3 voorbeeld facturen
- Standaard instellingen

4. **Start de development server**

```bash
npm run dev
```

5. **Open de applicatie**

Ga naar [http://localhost:3000](http://localhost:3000)

## 🔑 Inloggen

Gebruik de volgende inloggegevens:

- **Email:** nader@amsbouwers.nl
- **Wachtwoord:** Sharifi_1967

## 📁 Project Structuur

```
├── app/
│   ├── (dashboard)/          # Dashboard layout en pagina's
│   │   ├── klanten/          # Klantenbeheer
│   │   ├── offertes/         # Offertebeheer
│   │   ├── facturen/         # Factuurbeheer
│   │   ├── prijzen/          # Prijslijstbeheer
│   │   └── instellingen/     # Instellingen
│   ├── api/                  # API routes
│   │   ├── auth/             # NextAuth endpoints
│   │   ├── klanten/          # Klanten API
│   │   ├── offertes/         # Offertes API
│   │   └── facturen/         # Facturen API
│   └── login/                # Login pagina
├── components/
│   ├── ui/                   # shadcn/ui componenten
│   ├── sidebar.tsx           # Desktop navigatie
│   └── mobile-sidebar.tsx    # Mobiele navigatie
├── lib/
│   ├── auth.ts               # NextAuth configuratie
│   ├── prisma.ts             # Prisma client
│   ├── utils.ts              # Helper functies
│   └── number-generator.ts   # Offerte/Factuur nummering
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Seed script met demo data
└── public/                   # Statische bestanden
```

## 🗄️ Database

Het project gebruikt SQLite voor development. De database wordt automatisch aangemaakt bij de eerste migratie.

### Migreren naar PostgreSQL (voor productie)

1. Update `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/amsbouwers"
```

2. Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Voer migratie uit:

```bash
npx prisma migrate deploy
npx prisma db seed
```

## 📧 Zoho Mail Configuratie

Om emails te kunnen versturen via Zoho Mail:

1. Log in op het dashboard
2. Ga naar **Instellingen**
3. Klik op de **Zoho Mail** tab
4. Voer de volgende gegevens in:
   - Client ID
   - Client Secret
   - Refresh Token
   - Account ID
5. Test de verbinding

### Zoho Mail Credentials Verkrijgen

1. Ga naar [Zoho API Console](https://api-console.zoho.com/)
2. Maak een nieuwe "Server-based Application"
3. Noteer de Client ID en Client Secret
4. Genereer een Refresh Token met de juiste scopes
5. Vind je Account ID in Zoho Mail instellingen

## 🏢 Bedrijfsgegevens

De standaard bedrijfsgegevens staan in de database en kunnen via **Instellingen** worden aangepast:

- **Bedrijfsnaam:** AMS Bouwers B.V.
- **KVK:** 80195466
- **Adres:** Sloterweg 1160, 1066 CV Amsterdam
- **Telefoon:** 0642959565
- **Email:** info@amsbouwers.nl
- **Website:** amsbouwers.nl

## 📄 Offertes & Facturen

### Automatische Nummering

- **Offertes:** OFF-2025-001, OFF-2025-002, etc.
- **Facturen:** FACT-2025-001, FACT-2025-002, etc.

Nummering reset automatisch per jaar op 1 januari.

### BTW Tarieven

- 21% (standaard)
- 9% (verlaagd tarief)

### PDF Generatie

PDFs worden automatisch gegenereerd bij het bekijken/downloaden van een offerte of factuur. De PDFs bevatten:

- Bedrijfslogo en gegevens
- Klantgegevens
- Projectinformatie
- Gedetailleerde item lijst
- BTW berekening
- Betalingsvoorwaarden
- Bankgegevens

## 🎨 Prijslijst Categorieën

Het systeem ondersteunt de volgende categorieën:

1. **Badkamer** - Badkamerrenovaties, tegels, sanitair
2. **Keuken** - Keukenrenovaties, aanbouw
3. **Stucwerk** - Muren en plafonds stucen
4. **Schilderwerk** - Binnen- en buitenschilderwerk
5. **Timmerwerk** - Kozijnen, deuren, kasten op maat
6. **Aanbouw** - Complete aanbouw projecten
7. **Vloeren** - Laminaat, parket, tegels, vloerverwarming
8. **Loodgieter** - CV-ketels, sanitair installaties
9. **Elektra** - Groepenkast, stopcontacten, verlichting

## 📱 Mobiele Toegang

De applicatie is volledig responsive en werkt perfect op mobiele apparaten. Ideaal voor gebruik op de bouwplaats.

## 🚢 Deployment (Vercel)

1. Push code naar GitHub repository
2. Ga naar [Vercel](https://vercel.com)
3. Import het project
4. Voeg environment variabelen toe:
   ```
   DATABASE_URL=your_postgresql_url
   NEXTAUTH_URL=https://your-domain.vercel.app
   NEXTAUTH_SECRET=your_secret_key
   ```
5. Deploy!

Voor productie wordt PostgreSQL aangeraden (zie "Migreren naar PostgreSQL").

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build voor productie
npm run start        # Start productie server
npm run lint         # Run ESLint
npm run db:seed      # Seed database met demo data
```

### Prisma Commands

```bash
npx prisma studio              # Open Prisma Studio (database GUI)
npx prisma generate            # Genereer Prisma Client
npx prisma migrate dev         # Maak nieuwe migratie
npx prisma migrate deploy      # Deploy migraties (productie)
npx prisma db seed             # Seed database
```

## 🔧 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **ORM:** Prisma
- **Authentication:** NextAuth.js v5
- **Forms:** React Hook Form + Zod
- **PDF Generation:** @react-pdf/renderer
- **Email:** Zoho Mail API + Nodemailer
- **Icons:** Lucide React
- **Date Formatting:** date-fns

## 📝 Licentie

Dit project is ontwikkeld voor AMS Bouwers B.V.

## 🤝 Support

Voor vragen of problemen, neem contact op met de systeembeheerder.

---

**Gemaakt met ❤️ voor AMS Bouwers B.V.**

