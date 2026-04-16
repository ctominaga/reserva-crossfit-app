import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { buildWeekSchedule } from '../data/mock';
import type { BookingRow, ClassSessionRow } from '../lib/database.types';

export async function getWeekSessions(
  startDate: string,
  endDate: string
): Promise<ClassSessionRow[] | ReturnType<typeof buildWeekSchedule>> {
  if (!isSupabaseEnabled) {
    return buildWeekSchedule(new Date(startDate + 'T12:00:00'));
  }
  const { data, error } = await supabase!
    .from('class_sessions')
    .select('*, coaches(profile_id, profiles(full_name))')
    .gte('date', startDate)
    .lte('date', endDate)
    .eq('is_cancelled', false)
    .order('date')
    .order('time');
  if (error || !data) return buildWeekSchedule(new Date(startDate + 'T12:00:00'));
  return data as unknown as ClassSessionRow[];
}

export async function createBooking(
  sessionId: string,
  athleteId: string
): Promise<BookingRow | { id: string; status: 'confirmed' }> {
  if (!isSupabaseEnabled) {
    return { id: sessionId, status: 'confirmed' };
  }
  const { data, error } = await supabase!
    .from('bookings')
    .insert({ session_id: sessionId, athlete_id: athleteId, status: 'confirmed' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function cancelBooking(sessionId: string, athleteId: string) {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase!
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('session_id', sessionId)
    .eq('athlete_id', athleteId);
  if (error) throw error;
}

export async function checkIn(bookingId: string) {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase!
    .from('bookings')
    .update({ status: 'attended', checked_in_at: new Date().toISOString() })
    .eq('id', bookingId);
  if (error) throw error;
}
