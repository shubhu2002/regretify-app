import { NextResponse } from 'next/server';
import { supabase } from '@/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
	
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

	
    const { data: user, error } = await supabase
      .from('regretify-users')
      .select('name, age, gender, profile, contact_number, email, id')
      .eq('email', session.user.email)
      .single();

    if (error) {
      return NextResponse.json({ message: 'User not found in DB' }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Fetch user error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, age, gender, profile, contact_number } = await req.json();

    const { error } = await supabase
      .from('regretify-users')
      .update({
        name,
        age: age ? parseInt(age) : null,
        gender,
        profile,
        contact_number
      })
      .eq('email', session.user.email);

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: 'Profile updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
