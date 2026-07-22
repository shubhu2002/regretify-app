/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getUserId() {
	const session = await getServerSession(authOptions);
	if (!session?.user?.email) return null;

	const { data: user, error } = await supabase
		.from('regretify-users')
		.select('id')
		.eq('email', session.user.email)
		.single();

	if (error || !user) return null;
	return user.id as string;
}

const isValidAmount = (v: unknown): v is number =>
	typeof v === 'number' && Number.isFinite(v) && v > 0 && v <= 1_000_000_000;

const isValidDate = (v: unknown): v is string =>
	typeof v === 'string' && !Number.isNaN(new Date(v).getTime());

const str = (v: unknown, max: number) =>
	typeof v === 'string' && v.trim().length > 0 && v.length <= max;

// Build a whitelisted row for the given type; returns null if invalid.
function sanitizeTransaction(type: string, payload: any) {
	if (!isValidAmount(payload.amount) || !isValidDate(payload.date)) {
		return null;
	}

	if (type === 'income') {
		if (!str(payload.source, 100)) return null;
		return {
			source: payload.source.trim(),
			amount: payload.amount,
			date: payload.date,
		};
	}

	// expense
	if (!str(payload.name, 200) || !str(payload.category, 100)) return null;
	return {
		name: payload.name.trim(),
		category: payload.category.trim(),
		payment_type:
			str(payload.payment_type, 100) ? payload.payment_type.trim() : null,
		amount: payload.amount,
		date: payload.date,
	};
}

// GET /api/transactions?month=all|0-11
export async function GET(req: NextRequest) {
	try {
		const userId = await getUserId();
		if (!userId) {
			return NextResponse.json(
				{ message: 'Unauthorized' },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(req.url);
		const month = searchParams.get('month') || 'all';
		let incQuery = supabase
			.from('regretify-incomes')
			.select('*')
			.eq('user_id', userId);
		let expQuery = supabase
			.from('regretify-expenses')
			.select('*')
			.eq('user_id', userId);

		if (month !== 'all') {
			const monthNum = parseInt(month, 10);
			if (Number.isNaN(monthNum) || monthNum < 0 || monthNum > 11) {
				return NextResponse.json(
					{ message: 'Invalid month' },
					{ status: 400 },
				);
			}
			const year = new Date().getFullYear();
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
			{ message: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

// POST /api/transactions  { type, ...payload }
export async function POST(req: NextRequest) {
	try {
		const userId = await getUserId();
		if (!userId) {
			return NextResponse.json(
				{ message: 'Unauthorized' },
				{ status: 401 },
			);
		}

		const body = await req.json();
		const { type, ...payload } = body;

		if (!type || !['income', 'expense'].includes(type)) {
			return NextResponse.json(
				{ message: 'Invalid transaction type' },
				{ status: 400 },
			);
		}

		const row = sanitizeTransaction(type, payload);
		if (!row) {
			return NextResponse.json(
				{ message: 'Invalid transaction data' },
				{ status: 400 },
			);
		}

		const table =
			type === 'expense' ? 'regretify-expenses' : 'regretify-incomes';
		// user_id always comes from the session — never from the client
		const { error } = await supabase
			.from(table)
			.insert({ ...row, user_id: userId });

		if (error) throw error;

		return NextResponse.json(
			{ message: 'Created successfully' },
			{ status: 201 },
		);
	} catch (error: any) {
		console.error('POST /api/transactions error:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

// PATCH /api/transactions  { type, id, ...payload }
export async function PATCH(req: NextRequest) {
	try {
		const userId = await getUserId();
		if (!userId) {
			return NextResponse.json(
				{ message: 'Unauthorized' },
				{ status: 401 },
			);
		}

		const body = await req.json();
		const { type, id, ...payload } = body;

		if (!type || !['income', 'expense'].includes(type) || !id) {
			return NextResponse.json(
				{ message: 'Missing type or id' },
				{ status: 400 },
			);
		}

		const row = sanitizeTransaction(type, payload);
		if (!row) {
			return NextResponse.json(
				{ message: 'Invalid transaction data' },
				{ status: 400 },
			);
		}

		const table =
			type === 'expense' ? 'regretify-expenses' : 'regretify-incomes';
		// Scoped to the caller's rows — updating someone else's id is a no-op
		const { error } = await supabase
			.from(table)
			.update(row)
			.eq('id', id)
			.eq('user_id', userId);

		if (error) throw error;

		return NextResponse.json({ message: 'Updated successfully' });
	} catch (error: any) {
		console.error('PATCH /api/transactions error:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

// DELETE /api/transactions?id=xxx&type=expense|income
export async function DELETE(req: NextRequest) {
	try {
		const userId = await getUserId();
		if (!userId) {
			return NextResponse.json(
				{ message: 'Unauthorized' },
				{ status: 401 },
			);
		}

		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id');
		const type = searchParams.get('type');

		if (!id || !type || !['income', 'expense'].includes(type)) {
			return NextResponse.json(
				{ message: 'Missing id or type' },
				{ status: 400 },
			);
		}

		const table =
			type === 'income' ? 'regretify-incomes' : 'regretify-expenses';
		const { error } = await supabase
			.from(table)
			.delete()
			.eq('id', id)
			.eq('user_id', userId);

		if (error) throw error;

		return NextResponse.json({ message: 'Deleted successfully' });
	} catch (error: any) {
		console.error('DELETE /api/transactions error:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
