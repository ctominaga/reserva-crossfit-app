import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { mockWOD } from '../data/mock';
import type { WODRow, WODType } from '../lib/database.types';

export interface WODPayload {
  date: string;
  type: WODType;
  title: string;
  duration_minutes?: number | null;
  warmup: string[];
  movements: unknown[];
  scaling_rx: string;
  scaling_scaled: string;
  scaling_beginner: string;
  cooldown: string[];
  published_by?: string | null;
}

export async function getWODByDate(date: string): Promise<WODRow | typeof mockWOD> {
  if (!isSupabaseEnabled) return mockWOD;
  const { data, error } = await supabase!
    .from('wods')
    .select('*')
    .eq('date', date)
    .maybeSingle();
  if (error || !data) return mockWOD;
  return data;
}

export async function publishWOD(wod: WODPayload): Promise<WODRow | WODPayload> {
  if (!isSupabaseEnabled) {
    localStorage.setItem('reserva-wod-custom', JSON.stringify(wod));
    return wod;
  }
  const { data, error } = await supabase!
    .from('wods')
    .upsert(wod, { onConflict: 'date' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
