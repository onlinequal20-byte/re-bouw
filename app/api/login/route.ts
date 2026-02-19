import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as bcrypt from 'bcryptjs';
import { createSession } from '@/lib/simple-auth';
import { loginSchema } from '@/lib/validations/login';
import { handleApiError, validationError } from '@/lib/api-error';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      return validationError(
        Object.fromEntries(
          Object.entries(result.error.flatten().fieldErrors).map(([k, v]) => [k, v ?? []])
        )
      );
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Onjuiste inloggegevens' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Onjuiste inloggegevens' },
        { status: 401 }
      );
    }

    // Create session
    await createSession(user.id, user.email, user.name || '');

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error: unknown) {
    return handleApiError(error, "login");
  }
}
