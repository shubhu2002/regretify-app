import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'node:crypto';
import { supabase } from '@/supabase';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Raster formats only — no SVG (can carry scripts), no spoofable extensions.
const ALLOWED_TYPES: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp',
};

// Magic-byte sniffing so a renamed file can't lie about its type
function sniffImageType(buf: Buffer): string | null {
	if (buf.length < 12) return null;
	if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff)
		return 'image/jpeg';
	if (
		buf[0] === 0x89 &&
		buf[1] === 0x50 &&
		buf[2] === 0x4e &&
		buf[3] === 0x47
	)
		return 'image/png';
	if (
		buf.subarray(0, 4).toString('ascii') === 'RIFF' &&
		buf.subarray(8, 12).toString('ascii') === 'WEBP'
	)
		return 'image/webp';
	return null;
}

export async function POST(req: NextRequest) {
	try {
		// Uploads are for signed-in users only. (The sign-up flow uploads the
		// avatar after registration signs the user in.)
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json(
				{ message: 'Unauthorized' },
				{ status: 401 },
			);
		}

		const formData = await req.formData();
		const file = formData.get('file') as File | null;

		if (!file) {
			return NextResponse.json(
				{ message: 'No file provided' },
				{ status: 400 },
			);
		}

		if (file.size > 5 * 1024 * 1024) {
			return NextResponse.json(
				{ message: 'File size must be under 5MB' },
				{ status: 400 },
			);
		}

		const buffer = Buffer.from(await file.arrayBuffer());

		const sniffed = sniffImageType(buffer);
		if (!sniffed || !ALLOWED_TYPES[sniffed]) {
			return NextResponse.json(
				{ message: 'Only JPEG, PNG or WebP images are allowed' },
				{ status: 400 },
			);
		}

		const filename = `avatar-${randomUUID()}.${ALLOWED_TYPES[sniffed]}`;
		const filePath = `public/registration/${filename}`;

		const { error: uploadError } = await supabase.storage
			.from('regretify-avatars')
			.upload(filePath, buffer, {
				contentType: sniffed,
				upsert: false,
			});

		if (uploadError) {
			console.error('Supabase upload error:', uploadError);
			return NextResponse.json(
				{ message: 'Upload failed' },
				{ status: 500 },
			);
		}

		const { data: urlData } = supabase.storage
			.from('regretify-avatars')
			.getPublicUrl(filePath);

		return NextResponse.json({ url: urlData.publicUrl }, { status: 200 });
	} catch (error: unknown) {
		console.error('Avatar upload route error:', error);
		return NextResponse.json(
			{ message: 'Internal Server Error' },
			{ status: 500 },
		);
	}
}
