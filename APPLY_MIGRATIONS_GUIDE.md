# How to Apply Migrations to Remote Supabase Project

Since you're using Supabase Web UI, you need to manually apply the migrations. Here's how:

## Step 1: Verify Current State

1. Open Supabase Dashboard → Table Editor
2. Check if the `accounts` table exists
3. Check if the `blog_posts` table exists

## Step 2: Apply Initial Schema Migration (if accounts table doesn't exist)

If the `accounts` table doesn't exist, you need to apply the initial schema migration first.

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of: `apps/web/supabase/migrations/20241219010757_schema.sql`
3. Paste it into the SQL Editor
4. Click "Run"
5. Verify the `accounts` table is created

## Step 3: Apply Blog Posts Migration (if blog_posts table doesn't exist)

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of: `apps/web/supabase/migrations/20251225224935_create_blog_posts.sql`
3. Paste it into the SQL Editor
4. Click "Run"
5. Verify the `blog_posts` table is created

## Step 4: Apply Public Account Read Policy

1. Open Supabase Dashboard → SQL Editor
2. Copy the entire contents of: `apps/web/supabase/migrations/20251226002000_add_public_account_read_policy.sql`
3. Paste it into the SQL Editor
4. Click "Run"
5. Verify the policy is created

## Quick Check: Verify Tables Exist

Run this query in SQL Editor to check:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('accounts', 'blog_posts')
ORDER BY table_name;
```

You should see both tables listed.

## Alternative: Use Supabase CLI (if you have it set up)

If you have Supabase CLI linked to your project:

```bash
cd apps/web
pnpm supabase db push
```

This will push all migrations to your remote project.

