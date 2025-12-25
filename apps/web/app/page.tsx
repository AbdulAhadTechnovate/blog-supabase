import { redirect } from 'next/navigation';

/**
 * Root page redirects to /home (blog page with sidebar)
 */
export default function RootPage() {
  redirect('/home');
}

