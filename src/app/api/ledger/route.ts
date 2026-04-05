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

// GET /api/ledger — list books, accounts + their entries
export async function GET(req: NextRequest) {
	try {
		const userId = await getUserId();
		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const bookId = searchParams.get('book_id');

		// Always fetch books
		const { data: books, error: bookErr } = await supabase
			.from('regretify-ledger-books')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (bookErr) throw bookErr;

		// If a specific book is requested, fetch its accounts + per-account balances
		if (bookId) {
			const { data: accounts, error: accErr } = await supabase
				.from('regretify-ledger')
				.select('*')
				.eq('user_id', userId)
				.eq('ledger_book_id', bookId)
				.order('created_at', { ascending: false });

			if (accErr) throw accErr;

			const accountIds = (accounts || []).map((a: any) => a.id);

			// Compute balances per account from entries (amount + type only)
			const balances: Record<number, number> = {};
			if (accountIds.length > 0) {
				const { data: entryData, error: entErr } = await supabase
					.from('regretify-ledger-entries')
					.select('ledger_id, amount, type')
					.eq('user_id', userId)
					.in('ledger_id', accountIds);

				if (entErr) throw entErr;

				for (const e of entryData || []) {
					if (!balances[e.ledger_id]) balances[e.ledger_id] = 0;
					if (e.type === 'give') balances[e.ledger_id] -= Number(e.amount);
					else balances[e.ledger_id] += Number(e.amount);
				}
			}

			return NextResponse.json({
				books: books || [],
				accounts: accounts || [],
				balances,
			});
		}

		return NextResponse.json({ books: books || [], accounts: [], balances: {} });
	} catch (error: any) {
		console.error('GET /api/ledger error:', error);
		return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
	}
}

// POST /api/ledger  { action: 'create_book' | 'create_account' | 'create_entry', ...payload }
export async function POST(req: NextRequest) {
	try {
		const userId = await getUserId();
		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { action, ...payload } = body;

		if (action === 'create_book') {
			const { name, description } = payload;
			if (!name) {
				return NextResponse.json({ message: 'Name is required' }, { status: 400 });
			}

			const { data, error } = await supabase
				.from('regretify-ledger-books')
				.insert({ user_id: userId, name, description: description || null })
				.select()
				.single();

			if (error) throw error;
			return NextResponse.json({ book: data }, { status: 201 });
		}

		if (action === 'create_account') {
			const { name, contact_number, ledger_book_id } = payload;
			if (!name) {
				return NextResponse.json({ message: 'Name is required' }, { status: 400 });
			}
			if (!ledger_book_id) {
				return NextResponse.json({ message: 'Ledger book is required' }, { status: 400 });
			}

			const { data, error } = await supabase
				.from('regretify-ledger')
				.insert({ user_id: userId, name, contact_number: contact_number || null, ledger_book_id })
				.select()
				.single();

			if (error) throw error;
			return NextResponse.json({ account: data }, { status: 201 });
		}

		if (action === 'create_entry') {
			const { ledger_id, amount, description, date, type } = payload;
			if (!ledger_id || !amount || !type || !date) {
				return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
			}
			if (!['give', 'take'].includes(type)) {
				return NextResponse.json({ message: 'Type must be give or take' }, { status: 400 });
			}

			const { data, error } = await supabase
				.from('regretify-ledger-entries')
				.insert({ ledger_id, user_id: userId, amount, description: description || null, date, type })
				.select()
				.single();

			if (error) throw error;
			return NextResponse.json({ entry: data }, { status: 201 });
		}

		return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
	} catch (error: any) {
		console.error('POST /api/ledger error:', error);
		return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
	}
}

// PATCH /api/ledger  { action: 'update_book' | 'update_account' | 'update_entry' | 'toggle_star', id, ...payload }
export async function PATCH(req: NextRequest) {
	try {
		const userId = await getUserId();
		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { action, id, ...payload } = body;

		if (!id) {
			return NextResponse.json({ message: 'Missing id' }, { status: 400 });
		}

		if (action === 'update_book') {
			const { name, description } = payload;
			if (!name) {
				return NextResponse.json({ message: 'Name is required' }, { status: 400 });
			}

			const { error } = await supabase
				.from('regretify-ledger-books')
				.update({ name, description: description || null })
				.eq('id', id)
				.eq('user_id', userId);

			if (error) throw error;
			return NextResponse.json({ message: 'Ledger updated' });
		}

		if (action === 'update_account') {
			const { name, contact_number } = payload;
			if (!name) {
				return NextResponse.json({ message: 'Name is required' }, { status: 400 });
			}

			const { error } = await supabase
				.from('regretify-ledger')
				.update({ name, contact_number: contact_number || null })
				.eq('id', id)
				.eq('user_id', userId);

			if (error) throw error;
			return NextResponse.json({ message: 'Account updated' });
		}

		if (action === 'toggle_star') {
			const { data: entry, error: fetchErr } = await supabase
				.from('regretify-ledger-entries')
				.select('starred, ledger_id')
				.eq('id', id)
				.eq('user_id', userId)
				.single();

			if (fetchErr || !entry) {
				return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
			}

			if (entry.starred) {
				const { error } = await supabase
					.from('regretify-ledger-entries')
					.update({ starred: false })
					.eq('id', id)
					.eq('user_id', userId);

				if (error) throw error;
				return NextResponse.json({ message: 'Unstarred' });
			}

			const { count, error: countErr } = await supabase
				.from('regretify-ledger-entries')
				.select('id', { count: 'exact', head: true })
				.eq('ledger_id', entry.ledger_id)
				.eq('user_id', userId)
				.eq('starred', true);

			if (countErr) throw countErr;

			if ((count ?? 0) >= 3) {
				return NextResponse.json({ message: 'Maximum 3 starred entries per account' }, { status: 400 });
			}

			const { error } = await supabase
				.from('regretify-ledger-entries')
				.update({ starred: true })
				.eq('id', id)
				.eq('user_id', userId);

			if (error) throw error;
			return NextResponse.json({ message: 'Starred' });
		}

		if (action === 'update_entry') {
			const { amount, description, date, type } = payload;
			if (!amount || !type || !date) {
				return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
			}
			if (!['give', 'take'].includes(type)) {
				return NextResponse.json({ message: 'Type must be give or take' }, { status: 400 });
			}

			const { error } = await supabase
				.from('regretify-ledger-entries')
				.update({ amount, description: description || null, date, type })
				.eq('id', id)
				.eq('user_id', userId);

			if (error) throw error;
			return NextResponse.json({ message: 'Entry updated' });
		}

		return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
	} catch (error: any) {
		console.error('PATCH /api/ledger error:', error);
		return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
	}
}

// DELETE /api/ledger?id=xxx&type=book|account|entry
export async function DELETE(req: NextRequest) {
	try {
		const userId = await getUserId();
		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id');
		const type = searchParams.get('type');

		if (!id || !type) {
			return NextResponse.json({ message: 'Missing id or type' }, { status: 400 });
		}

		const tableMap: Record<string, string> = {
			book: 'regretify-ledger-books',
			account: 'regretify-ledger',
			entry: 'regretify-ledger-entries',
		};

		const table = tableMap[type];
		if (!table) {
			return NextResponse.json({ message: 'Invalid type' }, { status: 400 });
		}

		const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId);

		if (error) throw error;

		return NextResponse.json({ message: 'Deleted successfully' });
	} catch (error: any) {
		console.error('DELETE /api/ledger error:', error);
		return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
	}
}
