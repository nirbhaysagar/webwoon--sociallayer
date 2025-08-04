import { supabase } from './supabase';

export interface PostInteraction {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface PostShare extends PostInteraction {
  share_platform: string;
}

export class PostInteractionService {
  // Like/Unlike a post
  static async toggleLike(userId: string, postId: string): Promise<{ isLiked: boolean; likesCount: number }> {
    try {
      // Check if already liked
      const { data: existingLike, error: checkError } = await supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing like:', checkError);
        throw new Error('Failed to check like status');
      }

      if (existingLike) {
        // Unlike: remove the like
        const { error: deleteError } = await supabase
          .from('post_likes')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);

        if (deleteError) {
          console.error('Error removing like:', deleteError);
          throw new Error('Failed to unlike post');
        }

        // Get updated likes count
        const { count: newCount } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        return { isLiked: false, likesCount: newCount || 0 };
      } else {
        // Like: add the like
        const { error: insertError } = await supabase
          .from('post_likes')
          .insert({
            user_id: userId,
            post_id: postId,
          });

        if (insertError) {
          console.error('Error adding like:', insertError);
          throw new Error('Failed to like post');
        }

        // Get updated likes count
        const { count: newCount } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        return { isLiked: true, likesCount: newCount || 0 };
      }
    } catch (error) {
      console.error('Error in toggleLike:', error);
      throw error;
    }
  }

  // Save/Unsave a post
  static async toggleSave(userId: string, postId: string): Promise<{ isSaved: boolean; savesCount: number }> {
    try {
      // Check if already saved
      const { data: existingSave, error: checkError } = await supabase
        .from('post_saves')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing save:', checkError);
        throw new Error('Failed to check save status');
      }

      if (existingSave) {
        // Unsave: remove the save
        const { error: deleteError } = await supabase
          .from('post_saves')
          .delete()
          .eq('user_id', userId)
          .eq('post_id', postId);

        if (deleteError) {
          console.error('Error removing save:', deleteError);
          throw new Error('Failed to unsave post');
        }

        // Get updated saves count
        const { count: newCount } = await supabase
          .from('post_saves')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        return { isSaved: false, savesCount: newCount || 0 };
      } else {
        // Save: add the save
        const { error: insertError } = await supabase
          .from('post_saves')
          .insert({
            user_id: userId,
            post_id: postId,
          });

        if (insertError) {
          console.error('Error adding save:', insertError);
          throw new Error('Failed to save post');
        }

        // Get updated saves count
        const { count: newCount } = await supabase
          .from('post_saves')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId);

        return { isSaved: true, savesCount: newCount || 0 };
      }
    } catch (error) {
      console.error('Error in toggleSave:', error);
      throw error;
    }
  }

  // Share a post
  static async sharePost(userId: string, postId: string, platform: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('post_shares')
        .insert({
          user_id: userId,
          post_id: postId,
          share_platform: platform,
        });

      if (error) {
        console.error('Error sharing post:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in sharePost:', error);
      return false;
    }
  }

  // Get user's liked posts
  static async getUserLikedPosts(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user liked posts:', error);
        return [];
      }

      return data?.map(item => item.post_id) || [];
    } catch (error) {
      console.error('Error in getUserLikedPosts:', error);
      return [];
    }
  }

  // Get user's saved posts
  static async getUserSavedPosts(userId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('post_saves')
        .select('post_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user saved posts:', error);
        return [];
      }

      return data?.map(item => item.post_id) || [];
    } catch (error) {
      console.error('Error in getUserSavedPosts:', error);
      return [];
    }
  }

  // Check if user has liked a post
  static async hasUserLiked(userId: string, postId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('post_likes')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking like status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in hasUserLiked:', error);
      return false;
    }
  }

  // Check if user has saved a post
  static async hasUserSaved(userId: string, postId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('post_saves')
        .select('id')
        .eq('user_id', userId)
        .eq('post_id', postId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking save status:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error in hasUserSaved:', error);
      return false;
    }
  }

  // Get post interaction counts
  static async getPostInteractionCounts(postId: string): Promise<{
    likesCount: number;
    savesCount: number;
    sharesCount: number;
  }> {
    try {
      const [likesResult, savesResult, sharesResult] = await Promise.all([
        supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId),
        supabase
          .from('post_saves')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId),
        supabase
          .from('post_shares')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', postId),
      ]);

      return {
        likesCount: likesResult.count || 0,
        savesCount: savesResult.count || 0,
        sharesCount: sharesResult.count || 0,
      };
    } catch (error) {
      console.error('Error in getPostInteractionCounts:', error);
      return {
        likesCount: 0,
        savesCount: 0,
        sharesCount: 0,
      };
    }
  }

  // Get posts with interaction status for a user
  static async getPostsWithInteractionStatus(userId: string, postIds: string[]): Promise<{
    [postId: string]: {
      isLiked: boolean;
      isSaved: boolean;
      likesCount: number;
      savesCount: number;
      sharesCount: number;
    };
  }> {
    try {
      const [likedPosts, savedPosts, interactionCounts] = await Promise.all([
        this.getUserLikedPosts(userId),
        this.getUserSavedPosts(userId),
        Promise.all(postIds.map(postId => this.getPostInteractionCounts(postId))),
      ]);

      const result: any = {};
      postIds.forEach((postId, index) => {
        result[postId] = {
          isLiked: likedPosts.includes(postId),
          isSaved: savedPosts.includes(postId),
          ...interactionCounts[index],
        };
      });

      return result;
    } catch (error) {
      console.error('Error in getPostsWithInteractionStatus:', error);
      return {};
    }
  }
} 