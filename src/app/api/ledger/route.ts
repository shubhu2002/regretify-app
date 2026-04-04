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

// GET /api/ledger — list accounts + their entries
export async function GET() {
	try {
		const userId = await getUserId();
		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const { data: accounts, error: accErr } = await supabase
			.from('regretify-ledger')
			.select('*')
			.eq('user_id', userId)
			.order('created_at', { ascending: false });

		if (accErr) throw accErr;

		const { data: entries, error: entErr } = await supabase
			.from('regretify-ledger-entries')
			.select('*')
			.eq('user_id', userId)
			.order('date', { ascending: false });

		if (entErr) throw entErr;

		return NextResponse.json({ accounts: accounts || [], entries: entries || [] });
	} catch (error: any) {
		console.error('GET /api/ledger error:', error);
		return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
	}
}

// POST /api/ledger  { action: 'create_account' | 'create_entry', ...payload }
export async function POST(req: NextRequest) {
	try {
		const userId = await getUserId();
		if (!userId) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { action, ...payload } = body;

		if (action === 'create_account') {
			const { name, contact_number } = payload;
			if (!name) {
				return NextResponse.json({ message: 'Name is required' }, { status: 400 });
			}

			const { data, error } = await supabase
				.from('regretify-ledger')
				.insert({ user_id: userId, name, contact_number: contact_number || null })
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

// PATCH /api/ledger  { action: 'update_account' | 'update_entry', id, ...payload }
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
			// Check current state
			const { data: entry, error: fetchErr } = await supabase
				.from('regretify-ledger-entries')
				.select('starred, ledger_id')
				.eq('id', id)
				.eq('user_id', userId)
				.single();

			if (fetchErr || !entry) {
				return NextResponse.json({ message: 'Entry not found' }, { status: 404 });
			}

			// If unstarring, just do it
			if (entry.starred) {
				const { error } = await supabase
					.from('regretify-ledger-entries')
					.update({ starred: false })
					.eq('id', id)
					.eq('user_id', userId);

				if (error) throw error;
				return NextResponse.json({ message: 'Unstarred' });
			}

			// If starring, check max 3 per account
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

// DELETE /api/ledger?id=xxx&type=account|entry
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

		const table = type === 'account' ? 'regretify-ledger' : 'regretify-ledger-entries';
		const { error } = await supabase.from(table).delete().eq('id', id).eq('user_id', userId);

		if (error) throw error;

		return NextResponse.json({ message: 'Deleted successfully' });
	} catch (error: any) {
		console.error('DELETE /api/ledger error:', error);
		return NextResponse.json({ message: error.message || 'Internal Server Error' }, { status: 500 });
	}
}
