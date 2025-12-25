'use client';

import { useAuthChangeListener } from '@kit/supabase/hooks/use-auth-change-listener';

import pathsConfig from '~/config/paths.config';

export function AuthProvider(props: React.PropsWithChildren) {
  // Only protect specific routes, not the entire /home prefix
  // This allows public access to /home (blog list) and /home/blog/* (blog details)
  // while still protecting /home/blog/create and /home/settings
  useAuthChangeListener({
    appHomePath: pathsConfig.app.home,
    privatePathPrefixes: [
      '/home/blog/create',
      '/home/settings',
      '/update-password',
    ],
  });

  return props.children;
}
