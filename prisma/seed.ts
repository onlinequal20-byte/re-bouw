import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@amsbouwers.nl' },
    update: {},
    create: {
      email: 'admin@amsbouwers.nl',
      name: 'AMS Bouwers Admin',
      password: hashedPassword,
    },
  });
  console.log('✅ Admin user created');

  // Create demo clients
  const klanten = await Promise.all([
    prisma.klant.create({
      data: {
        naam: 'Johannes van der Berg',
        email: 'j.vandenberg@gmail.com',
        telefoon: '0612345678',
        adres: 'Prinsengracht 263',
        postcode: '1016 GV',
        plaats: 'Amsterdam',
        kvkNummer: '12345678',
        notities: 'Reguliere klant voor renovatieprojecten',
      },
    }),
    prisma.klant.create({
      data: {
        naam: 'Sophie de Vries',
        email: 'sophie.devries@hotmail.com',
        telefoon: '0623456789',
        adres: 'Keizersgracht 456',
        postcode: '1017 EG',
        plaats: 'Amsterdam',
        notities: 'Interesse in badkamerrenovatie',
      },
    }),
    prisma.klant.create({
      data: {
        naam: 'Peter Jansen',
        email: 'p.jansen@yahoo.com',
        telefoon: '0634567890',
        adres: 'Overtoom 78',
        postcode: '1054 HN',
        plaats: 'Amsterdam',
        kvkNummer: '23456789',
      },
    }),
    prisma.klant.create({
      data: {
        naam: 'Maria Bakker',
        email: 'maria.bakker@outlook.com',
        telefoon: '0645678901',
        adres: 'Jan van Galenstraat 12',
        postcode: '1051 KL',
        plaats: 'Amsterdam',
        notities: 'Keukenaanbouw gepland voor voorjaar',
      },
    }),
    prisma.klant.create({
      data: {
        naam: 'Erik Mulder',
        email: 'erik.mulder@gmail.com',
        telefoon: '0656789012',
        adres: 'Sloterweg 234',
        postcode: '1066 CD',
        plaats: 'Amsterdam',
      },
    }),
    prisma.klant.create({
      data: {
        naam: 'Linda Smit',
        email: 'l.smit@live.nl',
        telefoon: '0667890123',
        adres: 'Amstelveenseweg 500',
        postcode: '1081 KL',
        plaats: 'Amsterdam',
        kvkNummer: '34567890',
        notities: 'VIP klant - voorrang geven',
      },
    }),
    prisma.klant.create({
      data: {
        naam: 'Thomas Visser',
        email: 'thomas.visser@gmail.com',
        telefoon: '0678901234',
        adres: 'Hoofdweg 876',
        postcode: '1055 AA',
        plaats: 'Amsterdam',
      },
    }),
    prisma.klant.create({
      data: {
        naam: 'Anna de Groot',
        email: 'anna.degroot@ziggo.nl',
        telefoon: '0689012345',
        adres: 'Postjesweg 45',
        postcode: '1057 DT',
        plaats: 'Amsterdam',
        notities: 'Meerdere panden - corporatieklant',
      },
    }),
    prisma.klant.create({
      data: {
        naam: 'Robert Peters',
        email: 'r.peters@kpnmail.nl',
        telefoon: '0690123456',
        adres: 'Haarlemmerweg 321',
        postcode: '1051 LH',
        plaats: 'Amsterdam',
        kvkNummer: '45678901',
      },
    }),
    prisma.klant.create({
      data: {
        naam: 'Nicole Hendriks',
        email: 'nicole.hendriks@hotmail.nl',
        telefoon: '0601234567',
        adres: 'Mercatorplein 88',
        postcode: '1056 PT',
        plaats: 'Amsterdam',
        notities: 'Nieuwe klant via referral',
      },
    }),
  ]);
  console.log('✅ 10 demo clients created');

  // Create price list items
  const prijslijst = await Promise.all([
    // Badkamer
    prisma.prijslijst.create({
      data: {
        categorie: 'Badkamer',
        omschrijving: 'Complete badkamerrenovatie (standaard)',
        prijsPerEenheid: 450,
        eenheid: 'm²',
        materiaalKosten: 200,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Badkamer',
        omschrijving: 'Luxe badkamerrenovatie',
        prijsPerEenheid: 750,
        eenheid: 'm²',
        materiaalKosten: 400,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Badkamer',
        omschrijving: 'Badkamertegels plaatsen',
        prijsPerEenheid: 85,
        eenheid: 'm²',
        materiaalKosten: 35,
        actief: true,
      },
    }),
    // Keuken
    prisma.prijslijst.create({
      data: {
        categorie: 'Keuken',
        omschrijving: 'Keukenrenovatie compleet',
        prijsPerEenheid: 550,
        eenheid: 'm²',
        materiaalKosten: 250,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Keuken',
        omschrijving: 'Keukenaanbouw',
        prijsPerEenheid: 850,
        eenheid: 'm²',
        materiaalKosten: 400,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Keuken',
        omschrijving: 'Keukenwand betegelen',
        prijsPerEenheid: 75,
        eenheid: 'm²',
        materiaalKosten: 30,
        actief: true,
      },
    }),
    // Stucwerk
    prisma.prijslijst.create({
      data: {
        categorie: 'Stucwerk',
        omschrijving: 'Wanden stucen (glad)',
        prijsPerEenheid: 35,
        eenheid: 'm²',
        materiaalKosten: 8,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Stucwerk',
        omschrijving: 'Plafond stucen',
        prijsPerEenheid: 42,
        eenheid: 'm²',
        materiaalKosten: 10,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Stucwerk',
        omschrijving: 'Sierpleister aanbrengen',
        prijsPerEenheid: 65,
        eenheid: 'm²',
        materiaalKosten: 25,
        actief: true,
      },
    }),
    // Schilderwerk
    prisma.prijslijst.create({
      data: {
        categorie: 'Schilderwerk',
        omschrijving: 'Binnenschilderwerk (wanden)',
        prijsPerEenheid: 28,
        eenheid: 'm²',
        materiaalKosten: 8,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Schilderwerk',
        omschrijving: 'Plafond schilderen',
        prijsPerEenheid: 32,
        eenheid: 'm²',
        materiaalKosten: 9,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Schilderwerk',
        omschrijving: 'Kozijnen schilderen',
        prijsPerEenheid: 125,
        eenheid: 'stuks',
        materiaalKosten: 35,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Schilderwerk',
        omschrijving: 'Buitenschilderwerk',
        prijsPerEenheid: 45,
        eenheid: 'm²',
        materiaalKosten: 15,
        actief: true,
      },
    }),
    // Timmerwerk
    prisma.prijslijst.create({
      data: {
        categorie: 'Timmerwerk',
        omschrijving: 'Algemeen timmerwerk',
        prijsPerEenheid: 65,
        eenheid: 'uur',
        materiaalKosten: 0,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Timmerwerk',
        omschrijving: 'Kozijnen plaatsen',
        prijsPerEenheid: 450,
        eenheid: 'stuks',
        materiaalKosten: 200,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Timmerwerk',
        omschrijving: 'Deuren ophangen',
        prijsPerEenheid: 185,
        eenheid: 'stuks',
        materiaalKosten: 80,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Timmerwerk',
        omschrijving: 'Kasten op maat maken',
        prijsPerEenheid: 850,
        eenheid: 'stuks',
        materiaalKosten: 350,
        actief: true,
      },
    }),
    // Aanbouw
    prisma.prijslijst.create({
      data: {
        categorie: 'Aanbouw',
        omschrijving: 'Aanbouw realiseren (compleet)',
        prijsPerEenheid: 1500,
        eenheid: 'm²',
        materiaalKosten: 800,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Aanbouw',
        omschrijving: 'Dakopbouw realiseren',
        prijsPerEenheid: 1200,
        eenheid: 'm²',
        materiaalKosten: 600,
        actief: true,
      },
    }),
    // Vloeren
    prisma.prijslijst.create({
      data: {
        categorie: 'Vloeren',
        omschrijving: 'Laminaat leggen',
        prijsPerEenheid: 45,
        eenheid: 'm²',
        materiaalKosten: 20,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Vloeren',
        omschrijving: 'Parket leggen',
        prijsPerEenheid: 75,
        eenheid: 'm²',
        materiaalKosten: 40,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Vloeren',
        omschrijving: 'Vloertegels leggen',
        prijsPerEenheid: 65,
        eenheid: 'm²',
        materiaalKosten: 30,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Vloeren',
        omschrijving: 'Vloerverwarming installeren',
        prijsPerEenheid: 95,
        eenheid: 'm²',
        materiaalKosten: 50,
        actief: true,
      },
    }),
    // Loodgieter
    prisma.prijslijst.create({
      data: {
        categorie: 'Loodgieter',
        omschrijving: 'Loodgieterswerk per uur',
        prijsPerEenheid: 75,
        eenheid: 'uur',
        materiaalKosten: 0,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Loodgieter',
        omschrijving: 'CV-ketel installeren',
        prijsPerEenheid: 2500,
        eenheid: 'stuks',
        materiaalKosten: 1800,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Loodgieter',
        omschrijving: 'Sanitair installeren',
        prijsPerEenheid: 450,
        eenheid: 'stuks',
        materiaalKosten: 250,
        actief: true,
      },
    }),
    // Elektra
    prisma.prijslijst.create({
      data: {
        categorie: 'Elektra',
        omschrijving: 'Elektriciteitswerk per uur',
        prijsPerEenheid: 70,
        eenheid: 'uur',
        materiaalKosten: 0,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Elektra',
        omschrijving: 'Groepenkast vervangen',
        prijsPerEenheid: 1200,
        eenheid: 'stuks',
        materiaalKosten: 650,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Elektra',
        omschrijving: 'Stopcontacten/schakelaars plaatsen',
        prijsPerEenheid: 45,
        eenheid: 'stuks',
        materiaalKosten: 15,
        actief: true,
      },
    }),
    prisma.prijslijst.create({
      data: {
        categorie: 'Elektra',
        omschrijving: 'Verlichting installeren',
        prijsPerEenheid: 85,
        eenheid: 'stuks',
        materiaalKosten: 35,
        actief: true,
      },
    }),
  ]);
  console.log('✅ 30 price list items created');

  // Create sample quotations
  const currentYear = new Date().getFullYear();
  
  const offerte1 = await prisma.offerte.create({
    data: {
      offerteNummer: `OFF-${currentYear}-001`,
      datum: new Date('2025-01-02'),
      geldigTot: new Date('2025-02-01'),
      klantId: klanten[0].id,
      projectNaam: 'Badkamerrenovatie',
      projectLocatie: 'Prinsengracht 263, Amsterdam',
      subtotaal: 6750,
      btwPercentage: 21,
      btwBedrag: 1417.50,
      totaal: 8167.50,
      status: 'Verzonden',
      emailVerzonden: true,
      items: {
        create: [
          {
            omschrijving: 'Complete badkamerrenovatie (standaard)',
            aantal: 15,
            eenheid: 'm²',
            prijsPerEenheid: 450,
            totaal: 6750,
            volgorde: 1,
          },
        ],
      },
    },
  });

  const offerte2 = await prisma.offerte.create({
    data: {
      offerteNummer: `OFF-${currentYear}-002`,
      datum: new Date('2025-01-03'),
      geldigTot: new Date('2025-02-02'),
      klantId: klanten[3].id,
      projectNaam: 'Keukenaanbouw',
      projectLocatie: 'Jan van Galenstraat 12, Amsterdam',
      subtotaal: 17000,
      btwPercentage: 21,
      btwBedrag: 3570,
      totaal: 20570,
      status: 'Verzonden',
      emailVerzonden: true,
      items: {
        create: [
          {
            omschrijving: 'Keukenaanbouw',
            aantal: 20,
            eenheid: 'm²',
            prijsPerEenheid: 850,
            totaal: 17000,
            volgorde: 1,
          },
        ],
      },
    },
  });

  const offerte3 = await prisma.offerte.create({
    data: {
      offerteNummer: `OFF-${currentYear}-003`,
      datum: new Date('2025-01-04'),
      geldigTot: new Date('2025-02-03'),
      klantId: klanten[1].id,
      projectNaam: 'Schilderwerk woonkamer en slaapkamer',
      projectLocatie: 'Keizersgracht 456, Amsterdam',
      subtotaal: 3920,
      btwPercentage: 21,
      btwBedrag: 823.20,
      totaal: 4743.20,
      status: 'Concept',
      emailVerzonden: false,
      items: {
        create: [
          {
            omschrijving: 'Binnenschilderwerk (wanden)',
            aantal: 80,
            eenheid: 'm²',
            prijsPerEenheid: 28,
            totaal: 2240,
            volgorde: 1,
          },
          {
            omschrijving: 'Plafond schilderen',
            aantal: 50,
            eenheid: 'm²',
            prijsPerEenheid: 32,
            totaal: 1600,
            volgorde: 2,
          },
          {
            omschrijving: 'Kozijnen schilderen',
            aantal: 8,
            eenheid: 'stuks',
            prijsPerEenheid: 125,
            totaal: 1000,
            volgorde: 3,
          },
        ],
      },
    },
  });

  const offerte4 = await prisma.offerte.create({
    data: {
      offerteNummer: `OFF-${currentYear}-004`,
      datum: new Date('2025-01-05'),
      geldigTot: new Date('2025-02-04'),
      klantId: klanten[6].id,
      projectNaam: 'Laminaatvloer woning',
      projectLocatie: 'Hoofdweg 876, Amsterdam',
      subtotaal: 3150,
      btwPercentage: 9,
      btwBedrag: 283.50,
      totaal: 3433.50,
      status: 'Concept',
      emailVerzonden: false,
      items: {
        create: [
          {
            omschrijving: 'Laminaat leggen',
            aantal: 70,
            eenheid: 'm²',
            prijsPerEenheid: 45,
            totaal: 3150,
            volgorde: 1,
          },
        ],
      },
    },
  });

  const offerte5 = await prisma.offerte.create({
    data: {
      offerteNummer: `OFF-${currentYear}-005`,
      datum: new Date('2024-12-20'),
      geldigTot: new Date('2025-01-19'),
      klantId: klanten[5].id,
      projectNaam: 'Complete woonhuisrenovatie',
      projectLocatie: 'Amstelveenseweg 500, Amsterdam',
      subtotaal: 45250,
      btwPercentage: 21,
      btwBedrag: 9502.50,
      totaal: 54752.50,
      status: 'Geaccepteerd',
      emailVerzonden: true,
      notities: 'Klant heeft offerte geaccepteerd, start project februari',
      items: {
        create: [
          {
            omschrijving: 'Complete badkamerrenovatie (standaard)',
            aantal: 12,
            eenheid: 'm²',
            prijsPerEenheid: 450,
            totaal: 5400,
            volgorde: 1,
          },
          {
            omschrijving: 'Keukenrenovatie compleet',
            aantal: 18,
            eenheid: 'm²',
            prijsPerEenheid: 550,
            totaal: 9900,
            volgorde: 2,
          },
          {
            omschrijving: 'Binnenschilderwerk (wanden)',
            aantal: 200,
            eenheid: 'm²',
            prijsPerEenheid: 28,
            totaal: 5600,
            volgorde: 3,
          },
          {
            omschrijving: 'Parket leggen',
            aantal: 95,
            eenheid: 'm²',
            prijsPerEenheid: 75,
            totaal: 7125,
            volgorde: 4,
          },
          {
            omschrijving: 'Algemeen timmerwerk',
            aantal: 120,
            eenheid: 'uur',
            prijsPerEenheid: 65,
            totaal: 7800,
            volgorde: 5,
          },
          {
            omschrijving: 'Elektriciteitswerk per uur',
            aantal: 80,
            eenheid: 'uur',
            prijsPerEenheid: 70,
            totaal: 5600,
            volgorde: 6,
          },
          {
            omschrijving: 'CV-ketel installeren',
            aantal: 1,
            eenheid: 'stuks',
            prijsPerEenheid: 2500,
            totaal: 2500,
            volgorde: 7,
          },
          {
            omschrijving: 'Groepenkast vervangen',
            aantal: 1,
            eenheid: 'stuks',
            prijsPerEenheid: 1200,
            totaal: 1200,
            volgorde: 8,
          },
        ],
      },
    },
  });

  console.log('✅ 5 sample quotations created');

  // Create sample invoices
  const factuur1 = await prisma.factuur.create({
    data: {
      factuurNummer: `FACT-${currentYear}-001`,
      datum: new Date('2024-12-15'),
      vervaldatum: new Date('2025-01-14'),
      klantId: klanten[2].id,
      projectNaam: 'Stucwerk en schilderwerk',
      projectLocatie: 'Overtoom 78, Amsterdam',
      subtotaal: 5880,
      btwPercentage: 21,
      btwBedrag: 1234.80,
      totaal: 7114.80,
      status: 'Betaald',
      betaaldBedrag: 7114.80,
      emailVerzonden: true,
      items: {
        create: [
          {
            omschrijving: 'Wanden stucen (glad)',
            aantal: 120,
            eenheid: 'm²',
            prijsPerEenheid: 35,
            totaal: 4200,
            volgorde: 1,
          },
          {
            omschrijving: 'Binnenschilderwerk (wanden)',
            aantal: 60,
            eenheid: 'm²',
            prijsPerEenheid: 28,
            totaal: 1680,
            volgorde: 2,
          },
        ],
      },
    },
  });

  const factuur2 = await prisma.factuur.create({
    data: {
      factuurNummer: `FACT-${currentYear}-002`,
      datum: new Date('2025-01-02'),
      vervaldatum: new Date('2025-02-01'),
      klantId: klanten[4].id,
      projectNaam: 'Kozijnen en deuren',
      projectLocatie: 'Sloterweg 234, Amsterdam',
      subtotaal: 3255,
      btwPercentage: 21,
      btwBedrag: 683.55,
      totaal: 3938.55,
      status: 'Onbetaald',
      betaaldBedrag: 0,
      emailVerzonden: true,
      items: {
        create: [
          {
            omschrijving: 'Kozijnen plaatsen',
            aantal: 5,
            eenheid: 'stuks',
            prijsPerEenheid: 450,
            totaal: 2250,
            volgorde: 1,
          },
          {
            omschrijving: 'Deuren ophangen',
            aantal: 3,
            eenheid: 'stuks',
            prijsPerEenheid: 185,
            totaal: 555,
            volgorde: 2,
          },
          {
            omschrijving: 'Algemeen timmerwerk',
            aantal: 7,
            eenheid: 'uur',
            prijsPerEenheid: 65,
            totaal: 455,
            volgorde: 3,
          },
        ],
      },
    },
  });

  const factuur3 = await prisma.factuur.create({
    data: {
      factuurNummer: `FACT-${currentYear}-003`,
      datum: new Date('2025-01-03'),
      vervaldatum: new Date('2025-02-02'),
      klantId: klanten[7].id,
      projectNaam: 'Elektrawerkzaamheden',
      projectLocatie: 'Postjesweg 45, Amsterdam',
      subtotaal: 2480,
      btwPercentage: 21,
      btwBedrag: 520.80,
      totaal: 3000.80,
      status: 'Onbetaald',
      betaaldBedrag: 0,
      emailVerzonden: true,
      items: {
        create: [
          {
            omschrijving: 'Elektriciteitswerk per uur',
            aantal: 24,
            eenheid: 'uur',
            prijsPerEenheid: 70,
            totaal: 1680,
            volgorde: 1,
          },
          {
            omschrijving: 'Stopcontacten/schakelaars plaatsen',
            aantal: 12,
            eenheid: 'stuks',
            prijsPerEenheid: 45,
            totaal: 540,
            volgorde: 2,
          },
          {
            omschrijving: 'Verlichting installeren',
            aantal: 8,
            eenheid: 'stuks',
            prijsPerEenheid: 85,
            totaal: 680,
            volgorde: 3,
          },
        ],
      },
    },
  });

  console.log('✅ 3 sample invoices created');

  // Create settings
  await prisma.settings.upsert({
    where: { key: 'bedrijfsnaam' },
    update: {},
    create: { key: 'bedrijfsnaam', value: 'AMS Bouwers B.V.' },
  });

  await prisma.settings.upsert({
    where: { key: 'kvk_nummer' },
    update: {},
    create: { key: 'kvk_nummer', value: '80195466' },
  });

  await prisma.settings.upsert({
    where: { key: 'btw_nummer' },
    update: {},
    create: { key: 'btw_nummer', value: 'NL123456789B01' },
  });

  await prisma.settings.upsert({
    where: { key: 'adres' },
    update: {},
    create: { key: 'adres', value: 'Sloterweg 1160, 1066 CV Amsterdam' },
  });

  await prisma.settings.upsert({
    where: { key: 'telefoon' },
    update: {},
    create: { key: 'telefoon', value: '0642959565' },
  });

  await prisma.settings.upsert({
    where: { key: 'email' },
    update: {},
    create: { key: 'email', value: 'info@amsbouwers.nl' },
  });

  await prisma.settings.upsert({
    where: { key: 'website' },
    update: {},
    create: { key: 'website', value: 'amsbouwers.nl' },
  });

  await prisma.settings.upsert({
    where: { key: 'iban' },
    update: {},
    create: { key: 'iban', value: 'NL91ABNA0417164300' },
  });

  await prisma.settings.upsert({
    where: { key: 'betalingsvoorwaarden' },
    update: {},
    create: {
      key: 'betalingsvoorwaarden',
      value: 'Betaling binnen 30 dagen na factuurdatum. Bij te late betaling zijn wij genoodzaakt rente in rekening te brengen.',
    },
  });

  await prisma.settings.upsert({
    where: { key: 'email_handtekening' },
    update: {},
    create: {
      key: 'email_handtekening',
      value:
        'Met vriendelijke groet,\n\nAMS Bouwers B.V.\nSloterweg 1160\n1066 CV Amsterdam\nTel: 0642959565\nEmail: info@amsbouwers.nl\nWeb: amsbouwers.nl\n\nKVK: 80195466\nBTW: NL123456789B01',
    },
  });

  await prisma.settings.upsert({
    where: { key: 'offerte_geldigheid_dagen' },
    update: {},
    create: { key: 'offerte_geldigheid_dagen', value: '30' },
  });

  await prisma.settings.upsert({
    where: { key: 'laatste_offerte_nummer' },
    update: {},
    create: { key: 'laatste_offerte_nummer', value: '5' },
  });

  await prisma.settings.upsert({
    where: { key: 'laatste_factuur_nummer' },
    update: {},
    create: { key: 'laatste_factuur_nummer', value: '3' },
  });

  console.log('✅ Settings created');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

