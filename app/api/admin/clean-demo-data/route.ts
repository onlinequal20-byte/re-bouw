import { NextResponse } from "next/server";
import { getSession } from "@/lib/simple-auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🧹 Starting cleanup of demo data...');

    // Delete in correct order (respecting foreign key constraints)
    
    const expenses = await prisma.expense.deleteMany({});
    console.log(`✅ Deleted ${expenses.count} expenses`);

    const factuurItems = await prisma.factuurItem.deleteMany({});
    console.log(`✅ Deleted ${factuurItems.count} factuur items`);

    const facturen = await prisma.factuur.deleteMany({});
    console.log(`✅ Deleted ${facturen.count} facturen`);

    const offerteItems = await prisma.offerteItem.deleteMany({});
    console.log(`✅ Deleted ${offerteItems.count} offerte items`);

    const offertes = await prisma.offerte.deleteMany({});
    console.log(`✅ Deleted ${offertes.count} offertes`);

    const klanten = await prisma.klant.deleteMany({});
    console.log(`✅ Deleted ${klanten.count} klanten`);

    // Keep prijslijst - don't delete it
    console.log('✅ Prijslijst behouden (niet verwijderd)');

    console.log('✨ Cleanup complete!');

    return NextResponse.json({
      success: true,
      message: "Demo data successfully deleted",
      summary: {
        klanten: klanten.count,
        offertes: offertes.count,
        facturen: facturen.count,
        expenses: expenses.count,
        prijslijst: "behouden",
      }
    });

  } catch (error: any) {
    console.error('❌ Error during cleanup:', error);
    return NextResponse.json(
      { error: error.message || "Cleanup failed" },
      { status: 500 }
    );
  }
}

