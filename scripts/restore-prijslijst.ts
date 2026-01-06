import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function restorePrijslijst() {
  console.log('📋 Restoring prijslijst...\n');

  try {
    const prijslijstItems = [
      // Badkamer
      { categorie: 'Badkamer', omschrijving: 'Toilet vervangen', eenheid: 'stuk', prijsPerEenheid: 450 },
      { categorie: 'Badkamer', omschrijving: 'Wastafel plaatsen', eenheid: 'stuk', prijsPerEenheid: 350 },
      { categorie: 'Badkamer', omschrijving: 'Douche installeren', eenheid: 'stuk', prijsPerEenheid: 1200 },
      { categorie: 'Badkamer', omschrijving: 'Bad plaatsen', eenheid: 'stuk', prijsPerEenheid: 1500 },
      { categorie: 'Badkamer', omschrijving: 'Tegels plaatsen', eenheid: 'm²', prijsPerEenheid: 65 },
      { categorie: 'Badkamer', omschrijving: 'Vloerverwarming', eenheid: 'm²', prijsPerEenheid: 85 },
      { categorie: 'Badkamer', omschrijving: 'Radiator plaatsen', eenheid: 'stuk', prijsPerEenheid: 280 },
      { categorie: 'Badkamer', omschrijving: 'Ventilatie systeem', eenheid: 'stuk', prijsPerEenheid: 450 },
      { categorie: 'Badkamer', omschrijving: 'Leidingwerk', eenheid: 'meter', prijsPerEenheid: 45 },
      { categorie: 'Badkamer', omschrijving: 'Afvoer aanleggen', eenheid: 'meter', prijsPerEenheid: 55 },

      // Keuken
      { categorie: 'Keuken', omschrijving: 'Keuken plaatsen (standaard)', eenheid: 'stuk', prijsPerEenheid: 3500 },
      { categorie: 'Keuken', omschrijving: 'Keuken plaatsen (luxe)', eenheid: 'stuk', prijsPerEenheid: 6500 },
      { categorie: 'Keuken', omschrijving: 'Werkblad plaatsen', eenheid: 'meter', prijsPerEenheid: 250 },
      { categorie: 'Keuken', omschrijving: 'Spoelbak installeren', eenheid: 'stuk', prijsPerEenheid: 180 },
      { categorie: 'Keuken', omschrijving: 'Kookplaat aansluiten', eenheid: 'stuk', prijsPerEenheid: 150 },
      { categorie: 'Keuken', omschrijving: 'Afzuigkap plaatsen', eenheid: 'stuk', prijsPerEenheid: 280 },
      { categorie: 'Keuken', omschrijving: 'Vaatwasser aansluiten', eenheid: 'stuk', prijsPerEenheid: 120 },
      { categorie: 'Keuken', omschrijving: 'Koelkast inbouwen', eenheid: 'stuk', prijsPerEenheid: 150 },
      { categorie: 'Keuken', omschrijving: 'Oven inbouwen', eenheid: 'stuk', prijsPerEenheid: 180 },
      { categorie: 'Keuken', omschrijving: 'Keukenkastjes ophangen', eenheid: 'stuk', prijsPerEenheid: 65 },

      // Stucwerk
      { categorie: 'Stucwerk', omschrijving: 'Wanden stucen (glad)', eenheid: 'm²', prijsPerEenheid: 35 },
      { categorie: 'Stucwerk', omschrijving: 'Wanden stucen (spachtelputz)', eenheid: 'm²', prijsPerEenheid: 45 },
      { categorie: 'Stucwerk', omschrijving: 'Plafond stucen', eenheid: 'm²', prijsPerEenheid: 40 },
      { categorie: 'Stucwerk', omschrijving: 'Sierpleister aanbrengen', eenheid: 'm²', prijsPerEenheid: 55 },
      { categorie: 'Stucwerk', omschrijving: 'Scheuren herstellen', eenheid: 'meter', prijsPerEenheid: 25 },
      { categorie: 'Stucwerk', omschrijving: 'Hoeken herstellen', eenheid: 'stuk', prijsPerEenheid: 35 },
      { categorie: 'Stucwerk', omschrijving: 'Vochtplekken behandelen', eenheid: 'm²', prijsPerEenheid: 45 },
      { categorie: 'Stucwerk', omschrijving: 'Gipsplaten plaatsen', eenheid: 'm²', prijsPerEenheid: 32 },

      // Schilderwerk
      { categorie: 'Schilderwerk', omschrijving: 'Wanden schilderen (1 laag)', eenheid: 'm²', prijsPerEenheid: 12 },
      { categorie: 'Schilderwerk', omschrijving: 'Wanden schilderen (2 lagen)', eenheid: 'm²', prijsPerEenheid: 18 },
      { categorie: 'Schilderwerk', omschrijving: 'Plafond schilderen', eenheid: 'm²', prijsPerEenheid: 15 },
      { categorie: 'Schilderwerk', omschrijving: 'Kozijnen schilderen', eenheid: 'stuk', prijsPerEenheid: 85 },
      { categorie: 'Schilderwerk', omschrijving: 'Deuren schilderen', eenheid: 'stuk', prijsPerEenheid: 75 },
      { categorie: 'Schilderwerk', omschrijving: 'Radiatoren schilderen', eenheid: 'stuk', prijsPerEenheid: 45 },
      { categorie: 'Schilderwerk', omschrijving: 'Plinten schilderen', eenheid: 'meter', prijsPerEenheid: 8 },
      { categorie: 'Schilderwerk', omschrijving: 'Behang verwijderen', eenheid: 'm²', prijsPerEenheid: 10 },
      { categorie: 'Schilderwerk', omschrijving: 'Behang aanbrengen', eenheid: 'm²', prijsPerEenheid: 22 },

      // Timmerwerk
      { categorie: 'Timmerwerk', omschrijving: 'Deur plaatsen', eenheid: 'stuk', prijsPerEenheid: 280 },
      { categorie: 'Timmerwerk', omschrijving: 'Kozijn vervangen', eenheid: 'stuk', prijsPerEenheid: 450 },
      { categorie: 'Timmerwerk', omschrijving: 'Plint plaatsen', eenheid: 'meter', prijsPerEenheid: 12 },
      { categorie: 'Timmerwerk', omschrijving: 'Vloer leggen (laminaat)', eenheid: 'm²', prijsPerEenheid: 35 },
      { categorie: 'Timmerwerk', omschrijving: 'Vloer leggen (parket)', eenheid: 'm²', prijsPerEenheid: 55 },
      { categorie: 'Timmerwerk', omschrijving: 'Trap renoveren', eenheid: 'stuk', prijsPerEenheid: 1200 },
      { categorie: 'Timmerwerk', omschrijving: 'Kast op maat maken', eenheid: 'meter', prijsPerEenheid: 350 },
      { categorie: 'Timmerwerk', omschrijving: 'Plafond verlagen', eenheid: 'm²', prijsPerEenheid: 65 },
      { categorie: 'Timmerwerk', omschrijving: 'Dakkapel plaatsen', eenheid: 'stuk', prijsPerEenheid: 4500 },

      // Elektra
      { categorie: 'Elektra', omschrijving: 'Stopcontact plaatsen', eenheid: 'stuk', prijsPerEenheid: 45 },
      { categorie: 'Elektra', omschrijving: 'Lichtpunt plaatsen', eenheid: 'stuk', prijsPerEenheid: 55 },
      { categorie: 'Elektra', omschrijving: 'Lamp ophangen', eenheid: 'stuk', prijsPerEenheid: 35 },
      { categorie: 'Elektra', omschrijving: 'Groepenkast uitbreiden', eenheid: 'groep', prijsPerEenheid: 120 },
      { categorie: 'Elektra', omschrijving: 'Aardlekschakelaar plaatsen', eenheid: 'stuk', prijsPerEenheid: 85 },
      { categorie: 'Elektra', omschrijving: 'Dimmer installeren', eenheid: 'stuk', prijsPerEenheid: 65 },
      { categorie: 'Elektra', omschrijving: 'Buitenverlichting', eenheid: 'stuk', prijsPerEenheid: 95 },
      { categorie: 'Elektra', omschrijving: 'Deurbel systeem', eenheid: 'stuk', prijsPerEenheid: 150 },

      // Loodgieterwerk
      { categorie: 'Loodgieterwerk', omschrijving: 'CV-ketel vervangen', eenheid: 'stuk', prijsPerEenheid: 1800 },
      { categorie: 'Loodgieterwerk', omschrijving: 'Radiator vervangen', eenheid: 'stuk', prijsPerEenheid: 350 },
      { categorie: 'Loodgieterwerk', omschrijving: 'Kraan vervangen', eenheid: 'stuk', prijsPerEenheid: 85 },
      { categorie: 'Loodgieterwerk', omschrijving: 'Leiding repareren', eenheid: 'meter', prijsPerEenheid: 45 },
      { categorie: 'Loodgieterwerk', omschrijving: 'Afvoer ontstoppen', eenheid: 'stuk', prijsPerEenheid: 95 },
      { categorie: 'Loodgieterwerk', omschrijving: 'Boiler plaatsen', eenheid: 'stuk', prijsPerEenheid: 650 },
      { categorie: 'Loodgieterwerk', omschrijving: 'Waterleiding aanleggen', eenheid: 'meter', prijsPerEenheid: 35 },

      // Metselwerk
      { categorie: 'Metselwerk', omschrijving: 'Muur metselen', eenheid: 'm²', prijsPerEenheid: 85 },
      { categorie: 'Metselwerk', omschrijving: 'Schutting plaatsen', eenheid: 'meter', prijsPerEenheid: 120 },
      { categorie: 'Metselwerk', omschrijving: 'Gevel herstellen', eenheid: 'm²', prijsPerEenheid: 95 },
      { categorie: 'Metselwerk', omschrijving: 'Voegwerk vernieuwen', eenheid: 'm²', prijsPerEenheid: 35 },
      { categorie: 'Metselwerk', omschrijving: 'Schoorsteenreparatie', eenheid: 'stuk', prijsPerEenheid: 450 },
      { categorie: 'Metselwerk', omschrijving: 'Fundering aanleggen', eenheid: 'meter', prijsPerEenheid: 180 },

      // Dakwerk
      { categorie: 'Dakwerk', omschrijving: 'Dakpannen vervangen', eenheid: 'm²', prijsPerEenheid: 65 },
      { categorie: 'Dakwerk', omschrijving: 'Dakgoot vervangen', eenheid: 'meter', prijsPerEenheid: 45 },
      { categorie: 'Dakwerk', omschrijving: 'Dakisolatie aanbrengen', eenheid: 'm²', prijsPerEenheid: 55 },
      { categorie: 'Dakwerk', omschrijving: 'Lekdetectie en reparatie', eenheid: 'uur', prijsPerEenheid: 75 },
      { categorie: 'Dakwerk', omschrijving: 'Zonnepanelen plaatsen', eenheid: 'stuk', prijsPerEenheid: 350 },
      { categorie: 'Dakwerk', omschrijving: 'Dakraam plaatsen', eenheid: 'stuk', prijsPerEenheid: 850 },

      // Overig
      { categorie: 'Overig', omschrijving: 'Sloopwerk', eenheid: 'uur', prijsPerEenheid: 45 },
      { categorie: 'Overig', omschrijving: 'Puin afvoeren', eenheid: 'm³', prijsPerEenheid: 85 },
      { categorie: 'Overig', omschrijving: 'Bouwplaats inrichten', eenheid: 'dag', prijsPerEenheid: 150 },
      { categorie: 'Overig', omschrijving: 'Materiaal transport', eenheid: 'rit', prijsPerEenheid: 95 },
      { categorie: 'Overig', omschrijving: 'Uurtarief vakman', eenheid: 'uur', prijsPerEenheid: 55 },
      { categorie: 'Overig', omschrijving: 'Uurtarief leerling', eenheid: 'uur', prijsPerEenheid: 35 },
    ];

    for (const item of prijslijstItems) {
      await prisma.prijslijst.create({ data: item });
    }
    const created = { count: prijslijstItems.length };

    console.log(`✅ ${created.count} prijslijst items restored\n`);
    console.log('🎉 Prijslijst is terug!\n');

  } catch (error) {
    console.error('❌ Error restoring prijslijst:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

restorePrijslijst()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

