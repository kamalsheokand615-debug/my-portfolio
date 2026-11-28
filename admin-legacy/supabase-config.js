// Supabase Configuration
export const SUPABASE_URL = 'https://zmzaagojbcdzrpmakddf.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InptemFhZ29qYmNkenJwbWFrZGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTU0OTE3NDksImV4cCI6MjExMTA2Nzc0OX0.88AW5A6ClEvFz4pDlR6y-ll6CUaOvBNftvJ4Ub-ytVE';

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);