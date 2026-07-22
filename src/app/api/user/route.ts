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

    // Validate before writing — only profile fields, with sane caps
    if (typeof name !== 'string' || !name.trim() || name.length > 100) {
      return NextResponse.json({ message: 'Invalid name' }, { status: 400 });
    }
    const parsedAge = age ? parseInt(age, 10) : null;
    if (parsedAge !== null && (Number.isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120)) {
      return NextResponse.json({ message: 'Invalid age' }, { status: 400 });
    }
    if (gender != null && (typeof gender !== 'string' || gender.length > 20)) {
      return NextResponse.json({ message: 'Invalid gender' }, { status: 400 });
    }
    if (profile != null && (typeof profile !== 'string' || profile.length > 500)) {
      return NextResponse.json({ message: 'Invalid profile URL' }, { status: 400 });
    }
    if (
      contact_number != null &&
      (typeof contact_number !== 'string' || contact_number.length > 20)
    ) {
      return NextResponse.json({ message: 'Invalid contact number' }, { status: 400 });
    }

    const { error } = await supabase
      .from('regretify-users')
      .update({
        name: name.trim(),
        age: parsedAge,
        gender: gender ?? null,
        profile: profile ?? null,
        contact_number: contact_number ?? null
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
