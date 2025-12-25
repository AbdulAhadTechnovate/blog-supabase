/**
 * GraphQL utilities for blog posts
 * 
 * This module provides:
 * - GraphQL client for making requests
 * - Query and mutation strings
 * - React Query hooks for client components
 * - Server-side functions for server components
 * - TypeScript types
 */

// Client
export { createGraphQLClient, GraphQLClient } from './client';

// Queries
export { GET_BLOG_POSTS, GET_BLOG_POST_BY_ID, GET_BLOG_POSTS_WITH_AUTHOR } from './queries';

// Mutations
export { CREATE_BLOG_POST, UPDATE_BLOG_POST, DELETE_BLOG_POST } from './mutations';

// Types
export type {
  BlogPost,
  BlogPostWithAuthor,
  BlogPostEdge,
  BlogPostConnection,
  GraphQLResponse,
  PaginatedBlogPostsResponse,
  BlogPostByIdResponse,
  CreateBlogPostResponse,
} from './types';

// Hooks (client-side only)
export {
  useBlogPosts,
  useBlogPost,
  useCreateBlogPost,
} from './hooks';

// Server functions (server-side only)
export {
  getBlogPostsServer,
  getBlogPostByIdServer,
  enrichBlogPostsWithAuthors,
} from './server';

