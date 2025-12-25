# Blog Application Implementation Plan

## Overview
This document outlines the detailed plan to implement the remaining features for the blog application assignment using Next.js, Makerkit, and Supabase.

## ✅ Completed Features
- Email/password authentication (Makerkit default)
- Google OAuth via Supabase
- Email OTP login (bonus task)
- Profile dropdown with logout (already exists in Makerkit)

## 📋 Remaining Tasks

### Phase 1: Database Setup & GraphQL Configuration

#### 1.1 Create Blog Posts Table
**Location:** `apps/web/supabase/migrations/`

**Action:**
- Create a new migration file for blog posts table
- Table name: `blog_posts`
- Required columns:
  - `id` (UUID, primary key)
  - `title` (VARCHAR, NOT NULL)
  - `body` (TEXT, NOT NULL)
  - `author_id` (UUID, foreign key to `auth.users`)
  - `published_at` (TIMESTAMP, nullable - for draft support)
  - `created_at` (TIMESTAMP)
  - `updated_at` (TIMESTAMP)
- Add indexes on `published_at` and `author_id` for performance
- Set up Row Level Security (RLS) policies:
  - Public read access for published posts
  - Authenticated users can create posts
  - Users can only update/delete their own posts

**SQL Migration Structure:**
```sql
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies
-- Public can read published posts
-- Authenticated users can create posts
-- Users can update/delete their own posts
```

#### 1.2 Enable Supabase GraphQL
**Action:**
- In Supabase Web UI: Go to Project Settings → API → Enable GraphQL
- Verify GraphQL endpoint is accessible at: `{SUPABASE_URL}/graphql/v1`
- Test GraphQL introspection query

**Note:** Since you're using Supabase Web UI, GraphQL should be enabled by default, but we need to verify it's working.

#### 1.3 Update Database Types
**Action:**
- Run `pnpm run supabase:typegen` to regenerate TypeScript types
- Verify `blog_posts` table appears in `database.types.ts`

---

### Phase 2: GraphQL Client Setup

#### 2.1 Install GraphQL Dependencies
**Action:**
- Check if we need to install `@apollo/client` or use native fetch
- Since assignment mentions "Apollo Client or native GraphQL hooks", we'll use native fetch with React Query (already installed)
- Create GraphQL utility functions for making queries/mutations

#### 2.2 Create GraphQL Client Utilities
**Location:** `apps/web/lib/graphql/`

**Files to create:**
- `client.ts` - GraphQL client setup using Supabase GraphQL endpoint
- `queries.ts` - GraphQL query strings
- `mutations.ts` - GraphQL mutation strings
- `types.ts` - TypeScript types for GraphQL responses

**GraphQL Queries Needed:**
1. **Get Paginated Posts**
   ```graphql
   query GetBlogPosts($limit: Int!, $offset: Int!) {
     blogPostsCollection(
       limit: $limit
       offset: $offset
       orderBy: { published_at: DescNullsLast }
       filter: { published_at: { is: NOT_NULL } }
     ) {
       edges {
         node {
           id
           title
           body
           published_at
           author: accountsCollection {
             edges {
               node {
                 name
               }
             }
           }
         }
       }
       pageInfo {
         hasNextPage
         hasPreviousPage
       }
     }
   }
   ```

2. **Get Post by ID**
   ```graphql
   query GetBlogPost($id: UUID!) {
     blogPostsCollection(filter: { id: { eq: $id } }) {
       edges {
         node {
           id
           title
           body
           published_at
           author: accountsCollection {
             edges {
               node {
                 name
               }
             }
           }
         }
       }
     }
   }
   ```

3. **Create Post Mutation**
   ```graphql
   mutation CreateBlogPost($title: String!, $body: String!, $author_id: UUID!) {
     insertIntoblogPostsCollection(objects: {
       title: $title
       body: $body
       author_id: $author_id
       published_at: "now()"
     }) {
       records {
         id
         title
         body
         published_at
       }
     }
   }
   ```

---

### Phase 3: Homepage - Blog Posts List

#### 3.1 Update Homepage Route
**Location:** `apps/web/app/(marketing)/page.tsx` or create new route

**Decision:** Based on assignment, homepage should show blog posts. We have two options:
- **Option A:** Replace current marketing page with blog list
- **Option B:** Create `/blog` route and redirect homepage

**Recommendation:** Replace homepage with blog list (as per assignment requirements)

**Action:**
- Modify `apps/web/app/(marketing)/page.tsx` to show paginated blog posts
- Implement pagination (5 posts per page)
- Display: title, excerpt (first 200 chars), published date, author name
- Add pagination controls (Previous/Next buttons)

#### 3.2 Create Blog Post Components
**Location:** `apps/web/app/(marketing)/_components/`

**Components to create:**
- `blog-post-card.tsx` - Individual post card component
- `blog-posts-list.tsx` - List container with pagination
- `blog-pagination.tsx` - Pagination controls

#### 3.3 Implement Pagination Logic
**Action:**
- Use URL search params for page number (`?page=1`)
- Calculate offset: `(page - 1) * 5`
- Fetch posts using GraphQL query
- Handle loading and error states
- Implement ISR (bonus) using `generateStaticParams` and `revalidate`

---

### Phase 4: Post Details Page

#### 4.1 Create Post Details Route
**Location:** `apps/web/app/(marketing)/blog/[id]/page.tsx`

**Action:**
- Create dynamic route for individual blog posts
- Fetch post by ID using GraphQL
- Display: full title, full body, author name, published date
- Add "Back to blog" link
- Handle 404 for non-existent posts
- Implement ISR (bonus) using `generateStaticParams`

#### 4.2 Create Post Details Component
**Location:** `apps/web/app/(marketing)/blog/[id]/_components/`

**Components:**
- `blog-post-content.tsx` - Full post display
- `blog-post-header.tsx` - Title, author, date
- `blog-post-body.tsx` - Full body content

---

### Phase 5: Create Post Page (Auth Required)

#### 5.1 Create Create Post Route
**Location:** `apps/web/app/home/blog/create/page.tsx`

**Action:**
- Create route in protected `home` directory (already requires auth)
- Create form with title and body fields
- Auto-fill author from logged-in user
- Use GraphQL mutation to submit post
- Redirect to new post after successful creation
- Implement optimistic UI updates (bonus)

#### 5.2 Create Post Form Component
**Location:** `apps/web/app/home/blog/create/_components/`

**Components:**
- `create-post-form.tsx` - Main form component
- Use React Hook Form + Zod for validation (bonus)
- Form fields:
  - Title (required, max 255 chars)
  - Body (required, min 10 chars)
- Submit button with loading state
- Error handling and success messages

#### 5.3 Form Validation (Bonus)
**Action:**
- Create Zod schema for post validation
- Integrate with React Hook Form using `@hookform/resolvers`
- Show validation errors inline
- Disable submit button when form is invalid

#### 5.4 Optimistic UI Updates (Bonus)
**Action:**
- After form submission, immediately show new post in list
- Use React Query's optimistic updates
- Rollback on error

---

### Phase 6: Navigation & Routing Updates

#### 6.1 Update Paths Config
**Location:** `apps/web/config/paths.config.ts`

**Action:**
- Add blog-related paths:
  - `blog: '/blog'` or `home: '/'` (if homepage is blog)
  - `blogPost: '/blog/[id]'`
  - `createPost: '/home/blog/create'`

#### 6.2 Update Navigation
**Location:** `apps/web/config/navigation.config.tsx`

**Action:**
- Add "Blog" link to navigation (if not using homepage)
- Add "Create Post" link for authenticated users

#### 6.3 Update Site Header
**Location:** `apps/web/app/(marketing)/_components/site-header.tsx`

**Action:**
- Add blog link to navigation menu
- Ensure profile dropdown is visible (already exists)

---

### Phase 7: ISR Implementation (Bonus)

#### 7.1 Homepage ISR
**Location:** `apps/web/app/(marketing)/page.tsx`

**Action:**
- Use `generateStaticParams` for first few pages
- Set `revalidate` to 60 seconds (or appropriate interval)
- Implement `getStaticProps` equivalent using Next.js 15 App Router patterns

#### 7.2 Post Details ISR
**Location:** `apps/web/app/(marketing)/blog/[id]/page.tsx`

**Action:**
- Use `generateStaticParams` to pre-render popular posts
- Set `revalidate` for incremental regeneration
- Fallback to server-side rendering for new posts

---

### Phase 8: Error Handling & Edge Cases

#### 8.1 Error Handling
**Action:**
- Handle GraphQL errors gracefully
- Show user-friendly error messages
- Implement retry logic for failed requests
- Handle network errors

#### 8.2 Edge Cases
**Action:**
- Empty state when no posts exist
- Loading states for all async operations
- 404 handling for invalid post IDs
- Auth state handling (redirect if not logged in)

---

### Phase 9: Testing & Polish

#### 9.1 Manual Testing Checklist
- [ ] Homepage shows paginated blog posts
- [ ] Clicking a post navigates to details page
- [ ] Create post page requires authentication
- [ ] Form validation works correctly
- [ ] GraphQL queries return correct data
- [ ] GraphQL mutations create posts successfully
- [ ] Pagination works correctly
- [ ] ISR regenerates pages appropriately
- [ ] Optimistic updates work
- [ ] Error states are handled

#### 9.2 Code Quality
- [ ] Run `pnpm run lint`
- [ ] Run `pnpm run typecheck`
- [ ] Run `pnpm run format:fix`
- [ ] Verify all TypeScript types are correct
- [ ] Ensure RLS policies are secure

---

## Implementation Order (Recommended)

1. **Phase 1** - Database setup (migration + GraphQL enable)
2. **Phase 2** - GraphQL client utilities
3. **Phase 3** - Homepage blog list
4. **Phase 4** - Post details page
5. **Phase 5** - Create post page
6. **Phase 6** - Navigation updates
7. **Phase 7** - ISR implementation
8. **Phase 8** - Error handling
9. **Phase 9** - Testing & polish

## Technical Decisions

### GraphQL vs REST
- **Decision:** Use Supabase GraphQL API as required by assignment
- **Implementation:** Native fetch with React Query (no Apollo Client needed)

### Pagination Strategy
- **Decision:** Offset-based pagination (simple, works with GraphQL)
- **Implementation:** URL search params (`?page=1`)

### ISR Strategy
- **Decision:** Use Next.js 15 App Router ISR patterns
- **Implementation:** `generateStaticParams` + `revalidate` option

### Form Validation
- **Decision:** Zod + React Hook Form (already in dependencies)
- **Implementation:** `@hookform/resolvers/zod`

## Files to Create/Modify

### New Files
```
apps/web/supabase/migrations/[timestamp]_create_blog_posts.sql
apps/web/lib/graphql/client.ts
apps/web/lib/graphql/queries.ts
apps/web/lib/graphql/mutations.ts
apps/web/lib/graphql/types.ts
apps/web/app/(marketing)/_components/blog-post-card.tsx
apps/web/app/(marketing)/_components/blog-posts-list.tsx
apps/web/app/(marketing)/_components/blog-pagination.tsx
apps/web/app/(marketing)/blog/[id]/page.tsx
apps/web/app/(marketing)/blog/[id]/_components/blog-post-content.tsx
apps/web/app/home/blog/create/page.tsx
apps/web/app/home/blog/create/_components/create-post-form.tsx
```

### Modified Files
```
apps/web/app/(marketing)/page.tsx (replace with blog list)
apps/web/config/paths.config.ts (add blog paths)
apps/web/config/navigation.config.tsx (add blog nav)
apps/web/lib/database.types.ts (regenerate after migration)
packages/supabase/src/database.types.ts (regenerate after migration)
```

## Notes

1. **Supabase GraphQL:** The GraphQL API in Supabase uses PostgREST GraphQL which has specific syntax. We'll need to adapt queries to match Supabase's GraphQL implementation.

2. **RLS Policies:** Ensure Row Level Security is properly configured to allow:
   - Public read access to published posts
   - Authenticated users to create posts
   - Users to update/delete only their own posts

3. **Author Relationship:** We'll need to join `blog_posts` with `accounts` table to get author name. This might require a view or a GraphQL query that handles the relationship.

4. **Date Formatting:** Use `date-fns` (already installed) for formatting dates in the UI.

5. **Excerpt Generation:** Extract first 200 characters from body, truncate with ellipsis if longer.

## Next Steps

1. Start with Phase 1 - Create the database migration
2. Test GraphQL endpoint in Supabase Studio
3. Build GraphQL utilities
4. Implement homepage blog list
5. Continue with remaining phases

---

**Last Updated:** [Current Date]
**Status:** Ready for Implementation

