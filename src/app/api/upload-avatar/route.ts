import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/supabase';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ message: 'Only image files are allowed' }, { status: 400 });
    }

    // Limit file size to 5MB
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ message: 'File size must be under 5MB' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = file.type === 'image/png' ? 'png' : 'jpg';
    const filename = `avatar-${Date.now()}.${ext}`;
    const filePath = `public/registration/${filename}`;

    const { error: uploadError } = await supabase.storage
      .from('regretify-avatars')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { message: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    const { data: urlData } = supabase.storage
      .from('regretify-avatars')
      .getPublicUrl(filePath);

    return NextResponse.json({ url: urlData.publicUrl }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
    console.error('Avatar upload route error:', error);
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
