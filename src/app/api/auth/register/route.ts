import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rateLimit';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    // Throttle account creation per IP
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const { allowed } = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { message: 'Too many sign-up attempts. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await req.json();
    const { name, age, gender, profile, contact_number, password } = body;
    const email =
      typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

    // Server-side validation — never trust the client's checks
    if (!email || !EMAIL_RE.test(email) || email.length > 254) {
      return NextResponse.json(
        { message: 'A valid email is required' },
        { status: 400 },
      );
    }
    if (
      typeof password !== 'string' ||
      password.length < 8 ||
      password.length > 100
    ) {
      return NextResponse.json(
        { message: 'Password must be 8–100 characters' },
        { status: 400 },
      );
    }
    if (typeof name === 'string' && name.length > 100) {
      return NextResponse.json({ message: 'Name is too long' }, { status: 400 });
    }
    const parsedAge = age ? parseInt(age, 10) : null;
    if (parsedAge !== null && (Number.isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120)) {
      return NextResponse.json({ message: 'Invalid age' }, { status: 400 });
    }
    if (typeof gender === 'string' && gender.length > 20) {
      return NextResponse.json({ message: 'Invalid gender' }, { status: 400 });
    }
    if (typeof contact_number === 'string' && contact_number.length > 20) {
      return NextResponse.json(
        { message: 'Invalid contact number' },
        { status: 400 },
      );
    }
    if (typeof profile === 'string' && profile.length > 500) {
      return NextResponse.json(
        { message: 'Invalid profile URL' },
        { status: 400 },
      );
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('regretify-users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { message: 'User already exists' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: newUser, error } = await supabase
      .from('regretify-users')
      .insert([
        {
          name: typeof name === 'string' ? name.trim() : '',
          age: parsedAge,
          gender: typeof gender === 'string' ? gender : '',
          profile: typeof profile === 'string' ? profile : '',
          contact_number:
            typeof contact_number === 'string' ? contact_number : '',
          email,
          password: hashedPassword,
        },
      ])
      .select('id, name, email, profile')
      .single();

    if (error) {
      console.error('Registration insertion error:', error);
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }

    // Only safe fields — never echo back the password hash
    return NextResponse.json(
      { message: 'User registered successfully', user: newUser },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
