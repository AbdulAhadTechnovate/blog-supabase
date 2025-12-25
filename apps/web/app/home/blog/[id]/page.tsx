import { notFound } from 'next/navigation';

import { PageBody, PageHeader } from '@kit/ui/page';

import { BlogPostContent } from '~/(marketing)/blog/[id]/_components/blog-post-content';

import {
  getBlogPostByIdServer,
  enrichBlogPostsWithAuthors,
} from '~/lib/graphql/server';
import { withI18n } from '~/lib/i18n/with-i18n';

interface BlogPostPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps) {
  const { id } = await params;
  const post = await getBlogPostByIdServer(id);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  // Get excerpt (first 200 characters)
  const excerpt = post.body.length > 200 
    ? post.body.substring(0, 200).trim() + '...'
    : post.body;

  return {
    title: post.title,
    description: excerpt,
  };
}

async function BlogPostPage({ params }: BlogPostPageProps) {
  const { id } = await params;

  // Fetch blog post by ID
  const post = await getBlogPostByIdServer(id);

  if (!post) {
    notFound();
  }

  // Enrich post with author information
  const postsWithAuthors = await enrichBlogPostsWithAuthors([post]);
  const postWithAuthor = postsWithAuthors[0];

  if (!postWithAuthor) {
    notFound();
  }

  return (
    <>
      <PageHeader
        title={postWithAuthor.title}
        description={`By ${postWithAuthor.author?.name || 'Unknown'}`}
      />

      <PageBody>
        <div className="max-w-4xl">
          <BlogPostContent post={postWithAuthor} />
        </div>
      </PageBody>
    </>
  );
}

export default withI18n(BlogPostPage);

// ISR: Revalidate every 60 seconds (bonus feature)
export const revalidate = 60;

// ISR: Generate static params for popular posts (bonus feature)
// Pre-render the first 10 most recent posts at build time
export async function generateStaticParams() {
  try {
    const { getBlogPostsServer } = await import('~/lib/graphql/server');
    
    // Fetch first 10 posts to pre-render
    const postsCollection = await getBlogPostsServer({
      page: 1,
      pageSize: 10,
    });

    // Return array of params for static generation
    return postsCollection.edges.map((edge) => ({
      id: edge.node.id,
    }));
  } catch (error) {
    // If GraphQL fails at build time, return empty array
    // Pages will be generated on-demand
    console.error('Error generating static params:', error);
    return [];
  }
}

