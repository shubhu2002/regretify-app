import { NextResponse } from 'next/server';
import { supabase } from '@/supabase';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, age, gender, profile, contact_number, email, password } = body;

    // Validate email and password
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
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

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user into database
    const { data: newUser, error } = await supabase
      .from('regretify-users')
      .insert([
        {
          name: name || '',
          age: age ? parseInt(age) : null,
          gender: gender || '',
          profile: profile || '',
          contact_number: contact_number || '',
          email: email,
          password: hashedPassword,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Registration insertion error:', error);
      return NextResponse.json(
        { message: 'Internal Server Error' },
        { status: 500 }
      );
    }

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
