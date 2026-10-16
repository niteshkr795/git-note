import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export interface FileUrlResult {
  url: string | null;
  error?: string;
  isSigned?: boolean;
  cleanUp?: () => void;
}

/**
 * Resolves a secure previewable/downloadable URL for a resource file from Supabase Storage.
 * 1. Checks storage_path (looks up in DB if missing).
 * 2. Generates a secure, short-lived signed URL (300 seconds).
 * 3. Falls back to downloading as Blob (Object URL) if signed URL is unavailable.
 * 4. Falls back to getPublicUrl if bucket is configured as public.
 */
export async function getResourceFileUrl(resource: {
  id?: string;
  storagePath?: string;
}): Promise<FileUrlResult> {
  let storagePath = resource.storagePath;

  // 1. Look up storage_path from database if missing from the client object
  if (!storagePath && isSupabaseConfigured && resource.id && !resource.id.startsWith('res-')) {
    try {
      const { data: dbItem } = await supabase
        .from('resources')
        .select('storage_path')
        .eq('id', resource.id)
        .maybeSingle();

      if (dbItem?.storage_path) {
        storagePath = dbItem.storage_path;
      }
    } catch (err) {
      console.warn('[GitNote] Failed to query storage_path:', err);
    }
  }

  if (!storagePath) {
    return {
      url: null,
      error: 'No document storage path is linked with this academic resource.',
    };
  }

  if (!isSupabaseConfigured) {
    return {
      url: null,
      error: 'Supabase storage is not configured. Please check your environment variables.',
    };
  }

  // 2. Try creating a short-lived signed URL (5 minutes) from study-resources, then academic-resources
  try {
    let signed = await supabase.storage.from('study-resources').createSignedUrl(storagePath, 300);
    if (signed.error) {
      signed = await supabase.storage.from('academic-resources').createSignedUrl(storagePath, 300);
    }

    if (signed.data?.signedUrl) {
      return {
        url: signed.data.signedUrl,
        isSigned: true,
      };
    }
  } catch (err) {
    console.warn('[GitNote] Signed URL generation failed, attempting blob fallback:', err);
  }

  // 3. Fallback: Download file blob and create an in-memory Object URL
  try {
    let dl = await supabase.storage.from('study-resources').download(storagePath);
    if (dl.error) {
      dl = await supabase.storage.from('academic-resources').download(storagePath);
    }

    if (dl.data && !dl.error) {
      const blobUrl = URL.createObjectURL(dl.data);
      return {
        url: blobUrl,
        isSigned: false,
        cleanUp: () => URL.revokeObjectURL(blobUrl),
      };
    }
  } catch (err) {
    console.warn('[GitNote] Blob download fallback failed:', err);
  }

  // 4. Fallback: Public URL
  try {
    const pub = supabase.storage.from('study-resources').getPublicUrl(storagePath);
    if (pub.data?.publicUrl) {
      return {
        url: pub.data.publicUrl,
        isSigned: false,
      };
    }
  } catch {
    // ignore
  }

  return {
    url: null,
    error: 'The file could not be retrieved from storage. Please verify permissions or sign in.',
  };
}
