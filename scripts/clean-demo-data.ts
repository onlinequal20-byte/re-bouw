import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanDemoData() {
  console.log('🧹 Starting cleanup of demo data...\n');

  try {
    // Delete in correct order (respecting foreign key constraints)
    
    console.log('🗑️  Deleting expenses...');
    const expenses = await prisma.expense.deleteMany({});
    console.log(`   ✅ Deleted ${expenses.count} expenses\n`);

    console.log('🗑️  Deleting factuur items...');
    const factuurItems = await prisma.factuurItem.deleteMany({});
    console.log(`   ✅ Deleted ${factuurItems.count} factuur items\n`);

    console.log('🗑️  Deleting facturen...');
    const facturen = await prisma.factuur.deleteMany({});
    console.log(`   ✅ Deleted ${facturen.count} facturen\n`);

    console.log('🗑️  Deleting offerte items...');
    const offerteItems = await prisma.offerteItem.deleteMany({});
    console.log(`   ✅ Deleted ${offerteItems.count} offerte items\n`);

    console.log('🗑️  Deleting offertes...');
    const offertes = await prisma.offerte.deleteMany({});
    console.log(`   ✅ Deleted ${offertes.count} offertes\n`);

    console.log('🗑️  Deleting klanten...');
    const klanten = await prisma.klant.deleteMany({});
    console.log(`   ✅ Deleted ${klanten.count} klanten\n`);

    console.log('🗑️  Deleting prijslijst items...');
    const prijslijst = await prisma.prijslijst.deleteMany({});
    console.log(`   ✅ Deleted ${prijslijst.count} prijslijst items\n`);

    console.log('✨ Cleanup complete! Your dashboard is ready to use.\n');
    console.log('📊 Summary:');
    console.log(`   - ${klanten.count} klanten verwijderd`);
    console.log(`   - ${offertes.count} offertes verwijderd`);
    console.log(`   - ${facturen.count} facturen verwijderd`);
    console.log(`   - ${expenses.count} bonnetjes verwijderd`);
    console.log(`   - ${prijslijst.count} prijslijst items verwijderd`);
    console.log('\n🎉 Je kunt nu beginnen met je eigen data!\n');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanDemoData()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

