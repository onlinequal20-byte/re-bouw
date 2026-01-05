import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

// This endpoint initializes the database with required data
// It's safe to call multiple times - it won't duplicate data

export async function GET() {
  try {
    // Check if admin user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'nader@amsbouwers.nl' }
    });

    if (existingUser) {
      return NextResponse.json({
        success: true,
        message: 'Database already initialized',
        userExists: true,
      });
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Sharifi_1967', 10);
    const user = await prisma.user.create({
      data: {
        email: 'nader@amsbouwers.nl',
        name: 'Nader Sharifi',
        password: hashedPassword,
      },
    });

    // Check if settings exist
    const settingsCount = await prisma.settings.count();
    
    if (settingsCount === 0) {
      // Add initial settings
      await prisma.settings.createMany({
        data: [
          { key: 'bedrijfsnaam', value: 'AMS Bouwers B.V.' },
          { key: 'adres', value: 'Nieuwe Hemweg 6C' },
          { key: 'postcode', value: '1013 BG' },
          { key: 'plaats', value: 'Amsterdam' },
          { key: 'telefoon', value: '+31 20 123 4567' },
          { key: 'email', value: 'info@amsbouwers.nl' },
          { key: 'website', value: 'www.amsbouwers.nl' },
          { key: 'kvk_nummer', value: '80195466' },
          { key: 'btw_nummer', value: 'NL123456789B01' },
          { key: 'iban', value: 'NL91ABNA0417164300' },
          { key: 'betalingsvoorwaarden', value: 'Betaling binnen 14 dagen na factuurdatum' },
          { key: 'btw_percentage', value: '21' },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully!',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to initialize database', 
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

