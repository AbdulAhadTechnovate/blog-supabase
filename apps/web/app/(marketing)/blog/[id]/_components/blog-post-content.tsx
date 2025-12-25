import Link from 'next/link';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

import { Button } from '@kit/ui/button';

import type { BlogPost } from '~/lib/graphql/types';

interface BlogPostContentProps {
  post: BlogPost & {
    author?: {
      name: string;
      email: string | null;
    };
  };
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  const publishedDate = post.published_at
    ? format(new Date(post.published_at), 'MMMM d, yyyy')
    : null;
  const authorName = post.author?.name || 'Unknown Author';

  return (
    <article className="prose prose-lg dark:prose-invert max-w-none">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to blog
          </Link>
        </Button>
      </div>

      <header className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 text-muted-foreground">
          <div>
            <span className="font-medium">By {authorName}</span>
          </div>
          {publishedDate && (
            <time dateTime={post.published_at || undefined} className="text-sm">
              {publishedDate}
            </time>
          )}
        </div>
      </header>

      <div className="blog-post-body whitespace-pre-wrap break-words text-lg leading-relaxed">
        {post.body}
      </div>
    </article>
  );
}

