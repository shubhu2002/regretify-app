import { NextResponse } from 'next/server';
import { supabase } from '@/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Resolve the canonical user id from the DB — never trust a fallback value
    const { data: user, error: userErr } = await supabase
      .from('regretify-users')
      .select('id')
      .eq('email', session.user.email)
      .single();

    if (userErr || !user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const userId = user.id as string;

    const { error: incError } = await supabase
      .from('regretify-incomes')
      .delete()
      .eq('user_id', userId);

    if (incError) throw incError;

    const { error: expError } = await supabase
      .from('regretify-expenses')
      .delete()
      .eq('user_id', userId);

    if (expError) throw expError;

    return NextResponse.json({ message: 'All financial data has been cleared.' }, { status: 200 });
  } catch (error) {
    console.error('Clear data error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
