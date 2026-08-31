import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createAdminClient } from '@/lib/supabase/admin';

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = signupSchema.parse(body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      app_metadata: { role: 'CUSTOMER' },
      user_metadata: { name: data.name },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    let user;
    try {
      user = await prisma.user.create({
        data: {
          name: data.name,
          email: data.email,
          role: 'CUSTOMER',
        },
      });
    } catch (e) {
      await supabase.auth.admin.deleteUser(authUser!.user!.id).catch(() => {});
      throw e;
    }

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err: any) {
    if (err.errors) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
