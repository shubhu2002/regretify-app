import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

async function getSessionUser() {
	const session = await getServerSession(authOptions);
	if (!session?.user) return null;

	const { data: user, error } = await supabase
		.from('regretify-users')
		.select('id')
		.eq('email', session.user.email)
		.single();

	if (error || !user) return null;
	return user;
}

// GET /api/notes
export async function GET() {
	try {
		const user = await getSessionUser();
		if (!user) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const { data, error } = await supabase
			.from('regretify-notes')
			.select('*')
			.eq('user_id', user.id)
			.order('pinned', { ascending: false })
			.order('updated_at', { ascending: false });

		if (error) throw error;

		return NextResponse.json({ notes: data || [] });
	} catch (error: any) {
		console.error('GET /api/notes error:', error);
		return NextResponse.json(
			{ message: error.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

// POST /api/notes  { title, content, pinned }
export async function POST(req: NextRequest) {
	try {
		const user = await getSessionUser();
		if (!user) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { title, content, pinned } = body;

		const { data, error } = await supabase
			.from('regretify-notes')
			.insert({
				user_id: user.id,
				title: title?.trim() || 'New Note',
				content: content || null,
				pinned: !!pinned,
			})
			.select()
			.single();

		if (error) throw error;

		return NextResponse.json(
			{ message: 'Created successfully', note: data },
			{ status: 201 },
		);
	} catch (error: any) {
		console.error('POST /api/notes error:', error);
		return NextResponse.json(
			{ message: error.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

// PATCH /api/notes  { id, ...payload }
export async function PATCH(req: NextRequest) {
	try {
		const user = await getSessionUser();
		if (!user) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const body = await req.json();
		const { id, title, content, pinned } = body;

		if (!id) {
			return NextResponse.json({ message: 'Missing id' }, { status: 400 });
		}

		const payload: Record<string, any> = { updated_at: new Date().toISOString() };
		if (title !== undefined) payload.title = title.trim() || 'New Note';
		if (content !== undefined) payload.content = content || null;
		if (pinned !== undefined) payload.pinned = !!pinned;

		const { error } = await supabase
			.from('regretify-notes')
			.update(payload)
			.eq('id', id)
			.eq('user_id', user.id);

		if (error) throw error;

		return NextResponse.json({ message: 'Updated successfully' });
	} catch (error: any) {
		console.error('PATCH /api/notes error:', error);
		return NextResponse.json(
			{ message: error.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}

// DELETE /api/notes?id=xxx
export async function DELETE(req: NextRequest) {
	try {
		const user = await getSessionUser();
		if (!user) {
			return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
		}

		const { searchParams } = new URL(req.url);
		const id = searchParams.get('id');

		if (!id) {
			return NextResponse.json({ message: 'Missing id' }, { status: 400 });
		}

		const { error } = await supabase
			.from('regretify-notes')
			.delete()
			.eq('id', id)
			.eq('user_id', user.id);

		if (error) throw error;

		return NextResponse.json({ message: 'Deleted successfully' });
	} catch (error: any) {
		console.error('DELETE /api/notes error:', error);
		return NextResponse.json(
			{ message: error.message || 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
