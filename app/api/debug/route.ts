import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    
    // Get the admin user
    const adminUser = await prisma.user.findUnique({
      where: { email: 'nader@amsbouwers.nl' },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
      }
    });

    // Test password verification
    let passwordTest = null;
    if (adminUser?.password) {
      const testPassword = 'Sharifi_1967';
      passwordTest = await bcrypt.compare(testPassword, adminUser.password);
    }

    return NextResponse.json({
      success: true,
      database: {
        connected: true,
        userCount,
      },
      adminUser: adminUser ? {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        hasPassword: !!adminUser.password,
        passwordLength: adminUser.password?.length,
        passwordTest,
      } : null,
      env: {
        hasDbUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nodeEnv: process.env.NODE_ENV,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

