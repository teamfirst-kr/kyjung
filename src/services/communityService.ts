import { supabase, isSupabaseConfigured } from '../lib/supabase';

export interface CommunityPost {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar: string;
  category: '맛집추천' | '빵레시피' | '자유수다' | '빵질문' | '인증샷';
  title: string;
  content: string;
  image_urls: string[];
  likes: number;
  comment_count: number;
  created_at: string;
  is_liked?: boolean;
}

/**
 * 게시글 목록 조회
 */
export async function fetchPosts(category?: string): Promise<CommunityPost[]> {
  if (!isSupabaseConfigured()) return [];

  let query = supabase
    .from('community_posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (category && category !== '전체') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) return [];
  return data as CommunityPost[];
}

/**
 * 게시글 작성
 */
export async function createPost(post: Omit<CommunityPost, 'id' | 'likes' | 'comment_count' | 'created_at'>) {
  if (!isSupabaseConfigured()) {
    console.log('[데모] 게시글 작성:', post);
    return { error: null };
  }

  const { error } = await supabase.from('community_posts').insert([{
    ...post,
    likes: 0,
    comment_count: 0,
    created_at: new Date().toISOString(),
  }]);

  return { error: error?.message || null };
}

/**
 * 좋아요 토글
 */
export async function togglePostLike(postId: string, userId: string) {
  if (!isSupabaseConfigured()) return { liked: true, error: null };

  const { data: existing } = await supabase
    .from('post_likes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .single();

  if (existing) {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    await supabase.rpc('decrement_post_likes', { post_id: postId });
    return { liked: false, error: null };
  } else {
    await supabase.from('post_likes').insert([{ post_id: postId, user_id: userId }]);
    await supabase.rpc('increment_post_likes', { post_id: postId });
    return { liked: true, error: null };
  }
}
