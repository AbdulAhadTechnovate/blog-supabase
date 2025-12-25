import Link from 'next/link';
import { format } from 'date-fns';

import { Card, CardContent, CardHeader, CardTitle } from '@kit/ui/card';

import type { BlogPost } from '~/lib/graphql/types';

interface BlogPostCardProps {
  post: BlogPost & {
    author?: {
      name: string;
      email: string | null;
    };
  };
}

/**
 * Extract excerpt from body (first 200 characters)
 */
function getExcerpt(body: string, maxLength = 200): string {
  if (body.length <= maxLength) {
    return body;
  }
  return body.substring(0, maxLength).trim() + '...';
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const excerpt = getExcerpt(post.body);
  const publishedDate = post.published_at
    ? format(new Date(post.published_at), 'MMMM d, yyyy')
    : null;
  const authorName = post.author?.name || 'Unknown Author';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <Link href={`/home/blog/${post.id}`}>
        <CardHeader>
          <CardTitle className="line-clamp-2 text-xl font-semibold hover:text-primary transition-colors">
            {post.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground line-clamp-3">{excerpt}</p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>By {authorName}</span>
            {publishedDate && <time dateTime={post.published_at || undefined}>{publishedDate}</time>}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

