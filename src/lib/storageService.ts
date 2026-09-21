import { supabase } from './supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const BUCKET = 'drink-images';

/**
 * Uploads a File to Supabase Storage and returns the public URL.
 * Falls back gracefully if storage is unavailable.
 */
export async function uploadDrinkImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg';
  const fileName = `drink-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    console.error('Supabase Storage upload error:', error.message);
    throw new Error(`Image upload failed: ${error.message}`);
  }

  // Return the public URL
  const { data: urlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Deletes a drink image from Supabase Storage given its full public URL.
 */
export async function deleteDrinkImage(publicUrl: string): Promise<void> {
  try {
    // Extract the file path from the URL
    const bucketPrefix = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;
    if (!publicUrl.startsWith(bucketPrefix)) return; // Not a Supabase URL
    const filePath = publicUrl.replace(bucketPrefix, '');

    const { error } = await supabase.storage.from(BUCKET).remove([filePath]);
    if (error) {
      console.warn('Storage delete notice:', error.message);
    }
  } catch (err) {
    console.warn('Failed to delete image from storage:', err);
  }
}
