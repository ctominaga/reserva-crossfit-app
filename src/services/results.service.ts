import { supabase, isSupabaseEnabled } from '../lib/supabase';
import type { AthleteResultRow, MovementLevel } from '../lib/database.types';

export interface AthleteResultPayload {
  athlete_id: string;
  wod_id: string;
  session_id: string;
  level: MovementLevel;
  result_value: string;
  movement_results: unknown[];
  notes?: string | null;
  recorded_by?: string | null;
}

export async function saveAthleteResult(
  result: AthleteResultPayload
): Promise<AthleteResultRow | AthleteResultPayload> {
  if (!isSupabaseEnabled) {
    const key = 'reserva-checkins';
    const stored = JSON.parse(localStorage.getItem(key) ?? '{}');
    stored[`${result.session_id}-${result.athlete_id}`] = result;
    localStorage.setItem(key, JSON.stringify(stored));
    return result;
  }
  const { data, error } = await supabase!
    .from('athlete_results')
    .upsert(result, { onConflict: 'athlete_id,session_id' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getSessionResults(sessionId: string) {
  if (!isSupabaseEnabled) {
    const stored = JSON.parse(localStorage.getItem('reserva-checkins') ?? '{}') as Record<string, unknown>;
    return Object.values(stored).filter((r: unknown) => {
      return typeof r === 'object' && r !== null && (r as { session_id?: string }).session_id === sessionId;
    });
  }
  const { data, error } = await supabase!
    .from('athlete_results')
    .select('*, profiles(full_name, avatar_color)')
    .eq('session_id', sessionId);
  if (error) return [];
  return data;
}
