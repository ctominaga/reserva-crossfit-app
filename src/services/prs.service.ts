import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { mockPRs } from '../data/mock';
import type { PersonalRecordRow, PRCategory } from '../lib/database.types';

export interface PRPayload {
  athlete_id: string;
  movement: string;
  value: string;
  unit: string;
  category: PRCategory;
  icon?: string;
  achieved_at: string;
}

export async function getAthletesPRs(athleteId: string) {
  if (!isSupabaseEnabled) return mockPRs;
  const { data, error } = await supabase!
    .from('personal_records')
    .select('*')
    .eq('athlete_id', athleteId)
    .order('achieved_at', { ascending: false });
  if (error || !data) return mockPRs;
  return data;
}

export async function savePR(pr: PRPayload): Promise<PersonalRecordRow | PRPayload> {
  if (!isSupabaseEnabled) return pr;
  const { data, error } = await supabase!
    .from('personal_records')
    .insert({ icon: '🏋️', ...pr })
    .select()
    .single();
  if (error) throw error;
  return data;
}
