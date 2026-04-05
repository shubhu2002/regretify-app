/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getUserId() {
	const session = await getServerSession(authOptions);
	if (!session?.user) return null;

	const { data: user, error } = await supabase
		.from('regretify-users')
		.select('id')
		.eq('email', session.user.email)
		.single();

	if (error || !user) return null;
	return user.id as string;
}

// GET /api/ledger/entries?account_id=xxx&page=1&per_page=10
export async function GET(req: NextRequest) {
	try {
		const userId = await getUserId();
		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const accountId = searchParams.get('account_id');
		const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
		const perPage = Math.min(50, Math.max(1, parseInt(searchParams.get('per_page') || '10', 10)));

		if (!accountId) {
			return NextResponse.json({ message: 'account_id is required' }, { status: 400 });
		}

		const from = (page - 1) * perPage;
		const to = from + perPage - 1;

		// Fetch total count
		const { count: totalCount, error: countErr } = await supabase
			.from('regretify-ledger-entries')
			.select('id', { count: 'exact', head: true })
			.eq('user_id', userId)
			.eq('ledger_id', accountId);

		if (countErr) throw countErr;

		// Fetch paginated entries — starred first, then by date desc
		const { data: entries, error: entErr } = await supabase
			.from('regretify-ledger-entries')
			.select('*')
			.eq('user_id', userId)
			.eq('ledger_id', accountId)
			.order('starred', { ascending: false })
			.order('date', { ascending: false })
			.range(from, to);

		if (entErr) throw entErr;

		// Compute balance from ALL entries (not just current page)
		const { data: balanceData, error: balErr } = await supabase
			.from('regretify-ledger-entries')
			.select('amount, type')
			.eq('user_id', userId)
			.eq('ledger_id', accountId);

		if (balErr) throw balErr;

		let balance = 0;
		for (const e of balanceData || []) {
			if (e.type === 'give') balance -= Number(e.amount);
			else balance += Number(e.amount);
		}

		const total = totalCount ?? 0;
		const totalPages = Math.max(1, Math.ceil(total / perPage));

		return NextResponse.json({
			entries: entries || [],
			balance,
			pagination: {
				page,
				per_page: perPage,
				total,
				total_pages: totalPages,
			},
		});
	} catch (error: any) {
		console.error('GET /api/ledger/entries error:', error);
		return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
	}
}
