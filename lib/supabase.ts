import { createClient } from '@supabase/supabase-js';

let supabaseClient: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[Supabase] Missing env vars - realtime sync disabled');
    return null;
  }
  
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  return supabaseClient;
}

export const supabase = {
  channel: (name: string) => {
    const client = getSupabaseClient();
    if (!client) return null as any;
    return client.channel(name);
  },
  removeChannel: (channel: any) => {
    const client = getSupabaseClient();
    if (client) client.removeChannel(channel);
  }
};
