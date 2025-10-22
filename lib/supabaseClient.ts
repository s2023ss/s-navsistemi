import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://supabasetest.dokploy.digitalalem.com';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6InN1cGFiYXNlIiwiaWF0IjoxNzU5NjExNjAwLCJleHAiOjE5MTczNzgwMDB9.ezW_xWXx1t8RYZT4fUTlvIoMemk2erkKLHIuFTtSTZE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
