import 'server-only';

import { getSupabaseServerClient } from '@kit/supabase/server-client';
import { getSupabaseServerAdminClient } from '@kit/supabase/server-admin-client';

import { createGraphQLClient } from './client';
import { GET_BLOG_POSTS, GET_BLOG_POST_BY_ID } from './queries';
import type {
  PaginatedBlogPostsResponse,
  BlogPostByIdResponse,
  BlogPost,
} from './types';

/**
 * Server-side function to fetch paginated blog posts
 * Note: For simplicity, we fetch a reasonable number of posts and paginate in memory
 * In production, this should use proper cursor-based pagination
 */
export async function getBlogPostsServer(options?: {
  page?: number;
  pageSize?: number;
}) {
  try {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 5;

    const client = createGraphQLClient();
    
    // Fetch enough posts to cover current page + check for next page
    // We'll fetch up to 50 posts max to avoid performance issues
    const maxFetch = 50;
    const fetchSize = Math.min(pageSize * page + 1, maxFetch);
    
    const response = await client.request<PaginatedBlogPostsResponse>(
      GET_BLOG_POSTS,
      {
        first: fetchSize,
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

    const allEdges = response.data.blog_postsCollection.edges;
    
    // Calculate pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedEdges = allEdges.slice(startIndex, endIndex);
    const hasNextPage = allEdges.length > endIndex;
    const hasPreviousPage = page > 1;

    return {
      edges: paginatedEdges,
      pageInfo: {
        hasNextPage,
        hasPreviousPage,
      },
    };
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    // Return empty result on error instead of throwing
    // This allows the page to render with an empty state
    return {
      edges: [],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

/**
 * Simple UUID validation function
 * Validates if a string is a valid UUID format
 */
function isValidUUID(id: string): boolean {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

/**
 * Server-side function to fetch a single blog post by ID
 */
export async function getBlogPostByIdServer(id: string): Promise<BlogPost | null> {
  // Validate UUID format before making the request
  if (!isValidUUID(id)) {
    // Invalid UUID format - return null without logging error
    // This is expected for invalid URLs like /blog/invalid-id-12345
    return null;
  }

  try {
    const client = createGraphQLClient();
    
    const response = await client.request<BlogPostByIdResponse>(
      GET_BLOG_POST_BY_ID,
      {
        id,
      },
    );

    if (!response.data) {
      // Don't log error for missing data - it's a valid case
      return null;
    }

    const edges = response.data.blog_postsCollection.edges;
    
    if (edges.length === 0 || !edges[0]) {
      return null;
    }

    return edges[0].node;
  } catch (error) {
    // Only log actual errors (network issues, etc.), not invalid UUIDs
    // Invalid UUIDs are caught by validation above
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Check if it's a UUID validation error from GraphQL
    if (errorMessage.includes('invalid input syntax for type uuid')) {
      // This is expected for invalid UUIDs - return null silently
      return null;
    }
    
    // Log actual unexpected errors
    console.error('Error fetching blog post by ID:', id, error);
    return null;
  }
}

/**
 * Server-side function to get author information for blog posts
 * This fetches author names from the accounts table
 */
export async function enrichBlogPostsWithAuthors(
  posts: BlogPost[],
): Promise<Array<BlogPost & { author?: { name: string; email: string | null } }>> {
  if (posts.length === 0) {
    return [];
  }

  try {
    // Use regular server client - RLS policy allows reading account names/emails
    // for accounts that have published blog posts
    const supabase = getSupabaseServerClient();
    
    // Get unique author IDs
    const authorIds = [...new Set(posts.map((post) => post.author_id))];
    
    if (authorIds.length === 0) {
      return posts;
    }
    
    // Fetch accounts for these author IDs
    // The RLS policy will allow this if the accounts have published posts
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('id, name, email')
      .in('id', authorIds);

    if (error) {
      console.error('Error fetching authors:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      console.error('Author IDs attempted:', authorIds);
      // Return posts without author info on error
      return posts;
    }

    // Log if some accounts are missing
    if (accounts && accounts.length < authorIds.length) {
      const foundIds = new Set(accounts.map((acc) => acc.id));
      const missingIds = authorIds.filter((id) => !foundIds.has(id));
      if (missingIds.length > 0) {
        console.warn(
          `Some author accounts not found in database:`,
          missingIds,
        );
        console.warn(
          'Note: Accounts are created automatically when users sign up. If you manually created blog posts, ensure the corresponding accounts exist.',
        );
      }
    }

    // Create a map of author_id to account
    const authorMap = new Map(
      accounts?.map((account) => [account.id, account]) ?? [],
    );

    // Enrich posts with author information
    return posts.map((post) => ({
      ...post,
      author: authorMap.get(post.author_id)
        ? {
            name: authorMap.get(post.author_id)!.name,
            email: authorMap.get(post.author_id)!.email,
          }
        : undefined,
    }));
  } catch (error) {
    console.error('Error enriching posts with authors:', error);
    // Return posts without author info on error
    return posts;
  }
}

