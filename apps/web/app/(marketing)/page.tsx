import { Suspense } from 'react';

import { SitePageHeader } from '~/(marketing)/_components/site-page-header';
import { BlogPostsList } from '~/(marketing)/_components/blog-posts-list';

import {
  getBlogPostsServer,
  enrichBlogPostsWithAuthors,
} from '~/lib/graphql/server';
import { withI18n } from '~/lib/i18n/with-i18n';

interface HomePageProps {
  searchParams: Promise<{ page?: string }>;
}

async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const currentPage = parseInt(params.page || '1', 10) || 1;

  try {
    // Fetch blog posts
    const postsCollection = await getBlogPostsServer({
      page: currentPage,
      pageSize: 5,
    });

    // Extract posts from edges
    const posts = postsCollection.edges.map((edge) => edge.node);

    // Enrich posts with author information
    const postsWithAuthors = await enrichBlogPostsWithAuthors(posts);

    return (
      <div className="flex flex-col space-y-8">
        <SitePageHeader
          title="Blog"
          subtitle="Latest posts and updates"
        />

        <div className="container pb-16">
          <Suspense fallback={<BlogPostsLoadingSkeleton />}>
            <BlogPostsList
              posts={postsWithAuthors}
              currentPage={currentPage}
              hasNextPage={postsCollection.pageInfo?.hasNextPage ?? false}
              hasPreviousPage={postsCollection.pageInfo?.hasPreviousPage ?? false}
            />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    // Error is already handled in getBlogPostsServer, but we can add additional handling here
    console.error('Error in HomePage:', error);
    
    // Return page with empty state (getBlogPostsServer returns empty array on error)
    return (
      <div className="flex flex-col space-y-8">
        <SitePageHeader
          title="Blog"
          subtitle="Latest posts and updates"
        />

        <div className="container pb-16">
          <BlogPostsList
            posts={[]}
            currentPage={currentPage}
            hasNextPage={false}
            hasPreviousPage={false}
          />
        </div>
      </div>
    );
  }
}

function BlogPostsLoadingSkeleton() {
  return (
    <div className="space-y-8">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-48 animate-pulse rounded-xl border bg-muted"
        />
      ))}
    </div>
  );
}

export default withI18n(HomePage);

// ISR: Revalidate every 60 seconds (bonus feature)
// This will regenerate the homepage with fresh blog posts every 60 seconds
export const revalidate = 60;
