import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst();
    if (existingUser) {
      return NextResponse.json(
        { error: 'Database already initialized' },
        { status: 400 }
      );
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('Sharifi_1967', 10);
    await prisma.user.create({
      data: {
        email: 'nader@amsbouwers.nl',
        name: 'Nader Sharifi',
        password: hashedPassword,
      },
    });

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
      ],
    });

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      user: {
        email: 'nader@amsbouwers.nl',
        name: 'Nader Sharifi',
      },
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize database', details: String(error) },
      { status: 500 }
    );
  }
}

// GET endpoint to check initialization status
export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const settingsCount = await prisma.settings.count();

    return NextResponse.json({
      initialized: userCount > 0 && settingsCount > 0,
      users: userCount,
      settings: settingsCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check status', details: String(error) },
      { status: 500 }
    );
  }
}

