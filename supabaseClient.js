import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !url.startsWith('https://') || !url.includes('.supabase.co')) {
  console.error(
    `[Estanza] VITE_SUPABASE_URL looks wrong: "${url}". It must look like https://xxxxx.supabase.co — not an API key.`
  );
}
if (!key || key.length < 20) {
  console.error('[Estanza] VITE_SUPABASE_ANON_KEY is missing or looks too short.');
}

export const supabase = createClient(url, key);
