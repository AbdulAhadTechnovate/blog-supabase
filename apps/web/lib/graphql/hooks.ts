'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSupabase } from '@kit/supabase/hooks/use-supabase';

import { createGraphQLClient } from './client';
import { GET_BLOG_POSTS, GET_BLOG_POST_BY_ID } from './queries';
import { CREATE_BLOG_POST } from './mutations';
import type {
  PaginatedBlogPostsResponse,
  BlogPostByIdResponse,
  CreateBlogPostResponse,
  BlogPost,
} from './types';

/**
 * Hook to fetch paginated blog posts
 */
export function useBlogPosts(options?: {
  page?: number;
  pageSize?: number;
  enabled?: boolean;
}) {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 5;
  const enabled = options?.enabled ?? true;

  const queryFn = async () => {
    const client = createGraphQLClient();
    
    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;
    
    // For Supabase GraphQL, we use first/after for cursor-based pagination
    // But for simplicity, we'll use offset-based with first
    const response = await client.request<PaginatedBlogPostsResponse>(
      GET_BLOG_POSTS,
      {
        first: pageSize,
        filter: {
          published_at: {
            is: 'NOT_NULL',
          },
        },
        orderBy: [
          {
            published_at: 'DescNullsLast',
          },
        ],
      },
    );

    if (!response.data) {
      throw new Error('No data returned from GraphQL query');
    }

    return response.data.blog_postsCollection;
  };

  return useQuery({
    queryKey: ['blog-posts', page, pageSize],
    queryFn,
    enabled,
    staleTime: 60 * 1000, // 1 minute
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Hook to fetch a single blog post by ID
 */
export function useBlogPost(id: string | null, enabled = true) {
  const queryFn = async () => {
    if (!id) {
      return null;
    }

    const client = createGraphQLClient();
    
    const response = await client.request<BlogPostByIdResponse>(
      GET_BLOG_POST_BY_ID,
      {
        id,
      },
    );

    if (!response.data) {
      throw new Error('No data returned from GraphQL query');
    }

    const edges = response.data.blog_postsCollection.edges;
    
    if (edges.length === 0 || !edges[0]) {
      return null;
    }

    return edges[0].node;
  };

  return useQuery({
    queryKey: ['blog-post', id],
    queryFn,
    enabled: enabled && !!id,
    staleTime: 60 * 1000,
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Hook to create a new blog post
 */
export function useCreateBlogPost() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: {
      title: string;
      body: string;
    }) => {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User must be authenticated to create a post');
      }

      // Get access token for authenticated request
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No access token available');
      }

      const client = createGraphQLClient();
      
      const response = await client.authenticatedRequest<CreateBlogPostResponse>(
        CREATE_BLOG_POST,
        session.access_token,
        {
          title: input.title,
          body: input.body,
          author_id: user.id,
          published_at: new Date().toISOString(), // Publish immediately
        },
      );

      if (!response.data) {
        throw new Error('No data returned from GraphQL mutation');
      }

      const records = response.data.insertIntoblog_postsCollection?.records;
      
      if (!records || records.length === 0) {
        throw new Error('Failed to create blog post');
      }

      return records[0];
    },
    onSuccess: (newPost) => {
      if (newPost) {
        // Optimistic UI: Add the new post to the cache immediately
        queryClient.setQueryData(['blog-post', newPost.id], newPost);
      }
      
      // Invalidate blog posts queries to refetch
      queryClient.invalidateQueries({ queryKey: ['blog-posts'] });
    },
    onError: (error) => {
      // Error is already handled in the form component via toast
      console.error('Error creating blog post:', error);
    },
    retry: 1, // Retry failed mutations once
  });
}

