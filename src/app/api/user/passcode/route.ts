import { NextResponse } from 'next/server';
import { supabase } from '@/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('regretify-users')
      .select('passcode_hash, passcode_length')
      .eq('email', session.user.email)
      .single();

    if (error) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      enabled: !!data.passcode_hash,
      length: data.passcode_length || null,
    }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { passcode } = await req.json();

    if (!passcode || !/^\d{4}$|^\d{6}$/.test(passcode)) {
      return NextResponse.json(
        { message: 'Passcode must be 4 or 6 digits' },
        { status: 400 },
      );
    }

    const hashedPasscode = await bcrypt.hash(passcode, 10);

    const { error } = await supabase
      .from('regretify-users')
      .update({ passcode_hash: hashedPasscode, passcode_length: passcode.length })
      .eq('email', session.user.email);

    if (error) throw error;

    return NextResponse.json({ message: 'Passcode set successfully' }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
      .from('regretify-users')
      .update({ passcode_hash: null, passcode_length: null })
      .eq('email', session.user.email);

    if (error) throw error;

    return NextResponse.json({ message: 'Passcode removed' }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
