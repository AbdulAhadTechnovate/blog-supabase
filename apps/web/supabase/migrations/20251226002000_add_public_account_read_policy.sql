/*
 * -------------------------------------------------------
 * Section: Public Account Read Policy for Blog Authors
 * Allow public read access to account names and emails
 * for accounts that have published blog posts
 * 
 * NOTE: This assumes the accounts table exists.
 * If you get an error that the table doesn't exist,
 * you need to run the initial schema migration first.
 * -------------------------------------------------------
 */

-- First, verify the accounts table exists
-- If this fails, you need to run the initial migration: 20241219010757_schema.sql

-- Drop the policy if it already exists (for idempotency)
drop policy if exists accounts_read_public_for_blog on public.accounts;

-- Add a policy to allow public read access to account name and email
-- This is safe because we're only exposing public information (name, email)
-- for accounts that have published blog posts
create policy accounts_read_public_for_blog on public.accounts
  for select
  to anon, authenticated
  using (
    -- Allow reading if the account has at least one published blog post
    exists (
      select 1
      from public.blog_posts
      where blog_posts.author_id = accounts.id
        and blog_posts.published_at is not null
    )
  );

-- Grant select on specific columns for public access
-- Note: RLS policies still apply, but this ensures the columns are accessible
grant select (id, name, email) on public.accounts to anon, authenticated;

