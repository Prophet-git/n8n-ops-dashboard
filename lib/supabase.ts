import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  if (typeof window === 'undefined') {
    console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing');
  }
}

export const supabase = createClient(url || '', serviceKey || '', {
  db: { schema: 'monitor' },
  auth: { persistSession: false },
});
