import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@kit/ui/alert';
import { Button } from '@kit/ui/button';

interface BlogErrorStateProps {
  error?: Error | string;
  onRetry?: () => void;
}

export function BlogErrorState({ error, onRetry }: BlogErrorStateProps) {
  const errorMessage =
    error instanceof Error ? error.message : error || 'An unexpected error occurred';

  return (
    <div className="container py-12">
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error Loading Blog Posts</AlertTitle>
        <AlertDescription className="mt-2">
          {errorMessage}
        </AlertDescription>
        {onRetry && (
          <div className="mt-4">
            <Button onClick={onRetry} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        )}
      </Alert>
    </div>
  );
}

