import { supabase, isSupabaseEnabled } from '../lib/supabase';
import type { ProfileRow, UserRole } from '../lib/database.types';

export async function signIn(email: string, password: string) {
  if (!isSupabaseEnabled) throw new Error('Supabase não configurado');
  const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  role: UserRole = 'athlete'
) {
  if (!isSupabaseEnabled) throw new Error('Supabase não configurado');
  const { data, error } = await supabase!.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, role } },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  if (!isSupabaseEnabled) return;
  await supabase!.auth.signOut();
}

export async function getSession() {
  if (!isSupabaseEnabled) return null;
  const { data } = await supabase!.auth.getSession();
  return data.session;
}

export async function getCurrentProfile(): Promise<ProfileRow | null> {
  if (!isSupabaseEnabled) return null;
  const { data: userData } = await supabase!.auth.getUser();
  const user = userData.user;
  if (!user) return null;
  const { data, error } = await supabase!
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  if (error) return null;
  return data;
}
