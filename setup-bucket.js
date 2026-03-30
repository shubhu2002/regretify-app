import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://qniqjhhdtnjercjspgst.supabase.co';
const supabaseKey = "***REMOVED***";
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
