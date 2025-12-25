import { BlogPostCard } from './blog-post-card';
import { BlogPagination } from './blog-pagination';

import type { BlogPost } from '~/lib/graphql/types';

interface BlogPostsListProps {
  posts: Array<
    BlogPost & {
      author?: {
        name: string;
        email: string | null;
      };
    }
  >;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function BlogPostsList({
  posts,
  currentPage,
  hasNextPage,
  hasPreviousPage,
}: BlogPostsListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No blog posts found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {posts.map((post) => (
          <BlogPostCard key={post.id} post={post} />
        ))}
      </div>

      <BlogPagination
        currentPage={currentPage}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
      />
    </div>
  );
}

