import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://Yzdtnlfkyklfgcvyjigcs.supabase.co';
const supabaseAnonKey = 'sb_publishable_lHn2QSvG2IFMrPccC5eQnQ_aLx_73tZ';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createProfiles() {
  const profiles = [
    { name: 'Blauw', emoji: '🔵', color: '#3b82f6' },
    { name: 'Pink', emoji: '💗', color: '#ec4899' },
  ];

  for (const profile of profiles) {
    const { error } = await supabase.from('profiles').insert(profile);
    if (error) {
      console.error('Error inserting profile:', profile.name, error);
    } else {
      console.log('Created profile:', profile.name);
    }
  }
}

createProfiles();
