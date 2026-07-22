import { NextResponse } from 'next/server';
import { supabase } from '@/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { rateLimit, resetRateLimit } from '@/lib/rateLimit';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // A 4-digit passcode only has 10k combinations — throttle attempts hard.
    const limiterKey = `passcode:${session.user.email}`;
    const { allowed, retryAfterSec } = rateLimit(limiterKey, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { message: `Too many attempts. Try again in ${Math.ceil(retryAfterSec / 60)} min.` },
        { status: 429 },
      );
    }

    const { passcode } = await req.json();

    if (!passcode || typeof passcode !== 'string' || passcode.length > 6) {
      return NextResponse.json({ message: 'Passcode required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('regretify-users')
      .select('passcode_hash')
      .eq('email', session.user.email)
      .single();

    if (error || !data?.passcode_hash) {
      return NextResponse.json({ message: 'No passcode set' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(passcode, data.passcode_hash);

    if (!isValid) {
      return NextResponse.json({ verified: false, message: 'Incorrect passcode' }, { status: 401 });
    }

    // Successful unlock clears the attempt counter
    resetRateLimit(limiterKey);
    return NextResponse.json({ verified: true }, { status: 200 });
  } catch {
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
