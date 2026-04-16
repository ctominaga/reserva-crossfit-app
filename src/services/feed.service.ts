import { supabase, isSupabaseEnabled } from '../lib/supabase';
import { mockPosts } from '../data/mock';

export async function getFeedPosts(limit = 20) {
  if (!isSupabaseEnabled) return mockPosts;
  const { data, error } = await supabase!
    .from('posts')
    .select('*, profiles(full_name, avatar_color, role), post_comments(count), post_likes(count)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) return mockPosts;
  return data;
}

export async function toggleLike(postId: string, userId: string) {
  if (!isSupabaseEnabled) return;
  const { data: existing } = await supabase!
    .from('post_likes')
    .select('post_id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existing) {
    await supabase!
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
  } else {
    await supabase!.from('post_likes').insert({ post_id: postId, user_id: userId });
  }
}

export async function addComment(postId: string, authorId: string, content: string) {
  if (!isSupabaseEnabled) return;
  const { error } = await supabase!
    .from('post_comments')
    .insert({ post_id: postId, author_id: authorId, content });
  if (error) throw error;
}

export async function createPost(
  authorId: string,
  payload: { content: string; type?: 'text' | 'image' | 'achievement' | 'announcement'; image_url?: string; tags?: string[] }
) {
  if (!isSupabaseEnabled) return null;
  const { data, error } = await supabase!
    .from('posts')
    .insert({
      author_id: authorId,
      content: payload.content,
      type: payload.type ?? 'text',
      image_url: payload.image_url ?? null,
      tags: payload.tags ?? [],
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
