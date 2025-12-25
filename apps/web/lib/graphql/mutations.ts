/**
 * GraphQL mutations for blog posts
 */

/**
 * Create a new blog post
 */
export const CREATE_BLOG_POST = `
  mutation CreateBlogPost($title: String!, $body: String!, $author_id: UUID!, $published_at: Datetime) {
    insertIntoblog_postsCollection(
      objects: {
        title: $title
        body: $body
        author_id: $author_id
        published_at: $published_at
      }
    ) {
      records {
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
`;

/**
 * Update an existing blog post
 */
export const UPDATE_BLOG_POST = `
  mutation UpdateBlogPost($id: UUID!, $title: String, $body: String, $published_at: Datetime) {
    updateblog_postsCollection(
      filter: { id: { eq: $id } }
      set: {
        title: $title
        body: $body
        published_at: $published_at
      }
    ) {
      records {
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
`;

/**
 * Delete a blog post
 */
export const DELETE_BLOG_POST = `
  mutation DeleteBlogPost($id: UUID!) {
    deleteFromblog_postsCollection(filter: { id: { eq: $id } }) {
      records {
        id
      }
    }
  }
`;

