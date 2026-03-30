import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qniqjhhdtnjercjspgst.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuaXFqaGhkdG5qZXJjanNwZ3N0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDgwOTkzMiwiZXhwIjoyMDkwMzg1OTMyfQ.WnI7RJtlNuUqFtswSBJvUIofEceBC4mLuYJrC_J9d2s";
const supabase = createClient(supabaseUrl, supabaseKey);

async function setup() {
  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error listing buckets:', error);
    return;
  }
  
  if (!buckets.some(b => b.name === 'regretify-avatars')) {
    const { data, error: createError } = await supabase.storage.createBucket('regretify-avatars', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });
    if (createError) {
      console.error('Error creating bucket:', createError);
    } else {
      console.log('Bucket created successfully:', data);
    }
  } else {
    console.log('Bucket already exists.');
    // Ensure it's public
    await supabase.storage.updateBucket('regretify-avatars', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
      fileSizeLimit: 5242880
    });
  }
}

setup();
