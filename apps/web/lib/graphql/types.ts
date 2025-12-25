/**
 * TypeScript types for GraphQL responses
 */

export interface BlogPost {
  id: string;
  title: string;
  body: string;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  author_id: string;
}

export interface BlogPostWithAuthor extends BlogPost {
  author?: {
    name: string;
    email: string | null;
  };
}

export interface BlogPostEdge {
  node: BlogPost;
}

export interface BlogPostConnection {
  edges: BlogPostEdge[];
  pageInfo?: {
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    startCursor?: string;
    endCursor?: string;
  };
}

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    locations?: Array<{
      line: number;
      column: number;
    }>;
    path?: Array<string | number>;
  }>;
}

export interface PaginatedBlogPostsResponse {
  blog_postsCollection: BlogPostConnection;
}

export interface BlogPostByIdResponse {
  blog_postsCollection: {
    edges: Array<{
      node: BlogPost;
    }>;
  };
}

export interface CreateBlogPostResponse {
  insertIntoblog_postsCollection: {
    records: BlogPost[];
  };
}

