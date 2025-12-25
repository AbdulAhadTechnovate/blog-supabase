import Link from 'next/link';

import { Button } from '@kit/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BlogPaginationProps {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export function BlogPagination({
  currentPage,
  hasNextPage,
  hasPreviousPage,
}: BlogPaginationProps) {
  const previousPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = hasNextPage ? currentPage + 1 : null;

  return (
    <div className="flex items-center justify-between gap-4 pt-4 pb-8">
      <div>
        {hasPreviousPage && previousPage ? (
          <Button asChild variant="outline">
            <Link href={previousPage === 1 ? '/home' : `/home?page=${previousPage}`}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Link>
          </Button>
        ) : (
          <div /> // Spacer to keep layout consistent
        )}
      </div>

      <div className="text-sm text-muted-foreground">
        Page {currentPage}
      </div>

      <div>
        {hasNextPage && nextPage ? (
          <Button asChild variant="outline">
            <Link href={`/home?page=${nextPage}`}>
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div /> // Spacer to keep layout consistent
        )}
      </div>
    </div>
  );
}

