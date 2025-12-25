/**
 * GraphQL queries for blog posts
 */

/**
 * Get paginated blog posts
 * Returns published posts ordered by published_at (descending)
 */
export const GET_BLOG_POSTS = `
  query GetBlogPosts($first: Int, $after: String, $filter: blog_postsFilter, $orderBy: [blog_postsOrderBy!]) {
    blog_postsCollection(
      first: $first
      after: $after
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        node {
          id
          title
          body
          published_at
          created_at
          updated_at
          author_id
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

/**
 * Get a single blog post by ID
 */
export const GET_BLOG_POST_BY_ID = `
  query GetBlogPostById($id: UUID!) {
    blog_postsCollection(filter: { id: { eq: $id } }) {
      edges {
        node {
          id
          title
          body
          published_at
          created_at
          updated_at
          author_id
        }
      }
    }
  }
`;

/**
 * Get blog posts with author information
 * Note: This requires joining with accounts table via author_id
 */
export const GET_BLOG_POSTS_WITH_AUTHOR = `
  query GetBlogPostsWithAuthor($first: Int, $after: String, $filter: blog_postsFilter, $orderBy: [blog_postsOrderBy!]) {
    blog_postsCollection(
      first: $first
      after: $after
      filter: $filter
      orderBy: $orderBy
    ) {
      edges {
        node {
          id
          title
          body
          published_at
          created_at
          updated_at
          author_id
        }
      }
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
    }
  }
`;

