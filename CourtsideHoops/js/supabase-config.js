// js/supabase-config.js
const SUPABASE_URL = 'https://gaqekdspovcprscseduu.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_xZcQXBEyR8d6ZLdgUoLiAw_zurH_X3w';

// Initialize Supabase client
const supabase = window.supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) || 
                 supabase?.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Export for use in other files
if (typeof window !== 'undefined') {
    window.supabase = supabase;
}