import { prisma } from './prisma';

export async function generateOfferteNummer(): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  // Get the last offerte number from settings
  const lastNumberSetting = await prisma.settings.findUnique({
    where: { key: 'laatste_offerte_nummer' },
  });

  let lastNumber = lastNumberSetting ? parseInt(lastNumberSetting.value) : 0;
  
  // Check if we need to reset for new year
  const lastOfferte = await prisma.offerte.findFirst({
    orderBy: { offerteNummer: 'desc' },
  });

  if (lastOfferte) {
    const lastYear = parseInt(lastOfferte.offerteNummer.split('-')[1]);
    if (lastYear < currentYear) {
      lastNumber = 0; // Reset for new year
    }
  }

  const nextNumber = lastNumber + 1;
  const offerteNummer = `OFF-${currentYear}-${String(nextNumber).padStart(3, '0')}`;

  // Update the last number in settings
  await prisma.settings.upsert({
    where: { key: 'laatste_offerte_nummer' },
    update: { value: String(nextNumber) },
    create: { key: 'laatste_offerte_nummer', value: String(nextNumber) },
  });

  return offerteNummer;
}

export async function generateFactuurNummer(): Promise<string> {
  const currentYear = new Date().getFullYear();
  
  // Get the last factuur number from settings
  const lastNumberSetting = await prisma.settings.findUnique({
    where: { key: 'laatste_factuur_nummer' },
  });

  let lastNumber = lastNumberSetting ? parseInt(lastNumberSetting.value) : 0;
  
  // Check if we need to reset for new year
  const lastFactuur = await prisma.factuur.findFirst({
    orderBy: { factuurNummer: 'desc' },
  });

  if (lastFactuur) {
    const lastYear = parseInt(lastFactuur.factuurNummer.split('-')[1]);
    if (lastYear < currentYear) {
      lastNumber = 0; // Reset for new year
    }
  }

  const nextNumber = lastNumber + 1;
  const factuurNummer = `FACT-${currentYear}-${String(nextNumber).padStart(3, '0')}`;

  // Update the last number in settings
  await prisma.settings.upsert({
    where: { key: 'laatste_factuur_nummer' },
    update: { value: String(nextNumber) },
    create: { key: 'laatste_factuur_nummer', value: String(nextNumber) },
  });

  return factuurNummer;
}

