/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET /api/transactions?month=all|0-11
// export async
export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ message: 'Unauthorized' },
				{ status: 401 },
			);
		}

		const { data: user, error } = await supabase
			.from('regretify-users')
			.select('name, age, gender, profile, contact_number, email, id')
			.eq('email', session.user.email)
			.single();

		if (error) {
			return NextResponse.json(
				{ message: 'User not found in DB' },
				{ status: 404 },
			);
		}

		const { searchParams } = new URL(req.url);
		const month = searchParams.get('month') || 'all';
		let incQuery = supabase
			.from('regretify-incomes')
			.select('*')
			.eq('user_id', user.id);
		let expQuery = supabase
			.from('regretify-expenses')
			.select('*')
			.eq('user_id', user.id);

		if (month !== 'all') {
			const year = new Date().getFullYear();
			const monthNum = parseInt(month);
			const start = new Date(year, monthNum, 1).toISOString();
			const end = new Date(year, monthNum + 1, 1).toISOString();
			incQuery = incQuery.gte('date', start).lt('date', end);
			expQuery = expQuery.gte('date', start).lt('date', end);
		}

		const [incRes, expRes] = await Promise.all([incQuery, expQuery]);

		if (incRes.error) throw incRes.error;
		if (expRes.error) throw expRes.error;

		return NextResponse.json({
			incomes: incRes.data || [],
			expenses: expRes.data || [],
		});
	} catch (error: any) {
		console.error('GET /api/transactions error:', error);
		return NextResponse.json(
			{ message: error.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

// POST /api/transactions  { type, ...payload }
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, ...payload } = body;

    if (!type || !['income', 'expense'].includes(type)) {
      return NextResponse.json({ message: 'Invalid transaction type' }, { status: 400 });
    }

    const table = type === 'expense' ? 'regretify-expenses' : 'regretify-incomes';
    const { error } = await supabase.from(table).insert(payload);

    if (error) throw error;

    return NextResponse.json({ message: 'Created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/transactions error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/transactions  { type, id, ...payload }
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { type, id, ...payload } = body;

    if (!type || !id) {
      return NextResponse.json({ message: 'Missing type or id' }, { status: 400 });
    }

    const table = type === 'expense' ? 'regretify-expenses' : 'regretify-incomes';
    const { error } = await supabase.from(table).update(payload).eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Updated successfully' });
  } catch (error: any) {
    console.error('PATCH /api/transactions error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/transactions?id=xxx&type=expense|income
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ message: 'Missing id or type' }, { status: 400 });
    }

    const table = type === 'income' ? 'regretify-incomes' : 'regretify-expenses';
    const { error } = await supabase.from(table).delete().eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: any) {
    console.error('DELETE /api/transactions error:', error);
    return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
