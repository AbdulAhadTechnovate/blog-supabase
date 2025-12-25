# Blog Application - Assignment README

A fully functional blog application built with Next.js, Makerkit, and Supabase, featuring authentication, blog post management, and GraphQL integration.

## 📋 Assignment Requirements Status

### ✅ Core Features - All Implemented

- **Homepage**: Paginated list (5 per page) with title, excerpt (200 chars), published date, and author name
- **Post Details Page**: Full blog post view with title, body, author, and published date
- **Create Post Page**: Authenticated users can create posts with title and body (author auto-filled)
- **GraphQL Integration**: All queries and mutations use Supabase GraphQL API
- **Authentication**: Email/password, Google OAuth, and Email OTP (bonus)
- **Access Control**: Protected routes for creating posts

### ✅ Bonus Features - All Implemented

1. **ISR (Incremental Static Regeneration)**: Implemented with `revalidate = 60` and `generateStaticParams`
2. **Form Validation**: Zod + React Hook Form with real-time validation
3. **Email OTP Login**: Passwordless authentication via Supabase
4. **Optimistic UI Updates**: Immediate UI updates after post creation
5. **Profile Dropdown**: User profile with logout and settings in sidebar

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or later
- Docker (for local Supabase)
- PNPM
- Supabase account (for production)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd blog-supabase
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create `.env.local` in `apps/web/`:
   ```env
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Start the development server**
   ```bash
   pnpm run dev
   ```

   The application will be available at `http://localhost:3000`

## 🔗 Linking to Supabase Project

### Option 1: Using Supabase Web UI (Recommended for Assignment)

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Apply database migrations**:
   - Go to Supabase Dashboard → SQL Editor
   - Run the migration files in order:
     - `apps/web/supabase/migrations/20241219010757_schema.sql`
     - `apps/web/supabase/migrations/20251225224935_create_blog_posts.sql`
     - `apps/web/supabase/migrations/20251226002001_create_accounts_table_simplified.sql` (if accounts table doesn't exist)
     - `apps/web/supabase/migrations/20251226002000_add_public_account_read_policy.sql`

3. **Enable GraphQL**:
   - Go to Supabase Dashboard → API → GraphQL
   - GraphQL is automatically enabled for Supabase projects

4. **Get your credentials**:
   - Go to Supabase Dashboard → Settings → API
   - Copy `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

5. **Configure Google OAuth** (optional):
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add your Google OAuth credentials

### Option 2: Using Supabase CLI

```bash
# Link to your Supabase project
cd apps/web
pnpm supabase link --project-ref your-project-ref

# Push migrations
pnpm supabase db push
```

## 🔐 Authentication Configuration

### Email/Password Authentication

Enabled by default in Makerkit. No additional configuration needed.

### Google OAuth

1. **Get Google OAuth credentials**:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`

2. **Configure in Supabase**:
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add Client ID and Client Secret

### Email OTP (Passwordless) - Bonus Feature

1. **Enable in environment variables**:
   ```env
   NEXT_PUBLIC_AUTH_EMAIL_OTP=true
   ```

2. **Configure email template in Supabase**:
   - Go to Supabase Dashboard → Authentication → Email Templates
   - Customize the Magic Link template to show OTP code: `{{ .Token }}`

3. **Test the flow**:
   - Navigate to `/auth/sign-in`
   - Enter email and click "Send Code"
   - Enter 6-digit code from email

## 📁 Project Structure

```
apps/web/
├── app/
│   ├── (marketing)/          # Public marketing pages
│   │   ├── blog/[id]/        # Blog post detail pages
│   │   └── _components/      # Blog components
│   ├── home/                 # Protected app pages
│   │   ├── page.tsx          # Blog homepage (with sidebar)
│   │   └── blog/
│   │       ├── [id]/         # Blog detail pages
│   │       └── create/       # Create post page (protected)
│   └── auth/                 # Authentication pages
├── lib/
│   └── graphql/              # GraphQL client, queries, mutations, hooks
├── supabase/
│   └── migrations/           # Database migrations
└── config/                    # App configuration

packages/
├── ui/                        # Shared UI components
└── features/                  # Feature packages
```

## 🎯 Key Features Explained

### GraphQL Integration

All blog operations use Supabase's GraphQL API:

- **Queries**: `GET_BLOG_POSTS`, `GET_BLOG_POST_BY_ID`
- **Mutations**: `CREATE_BLOG_POST`, `UPDATE_BLOG_POST`, `DELETE_BLOG_POST`
- **Client**: Custom GraphQL client in `apps/web/lib/graphql/client.ts`
- **Hooks**: React Query hooks for client-side data fetching

### Pagination

- Server-side pagination with 5 posts per page
- URL-based pagination (`/home?page=2`)
- Previous/Next navigation buttons
- ISR revalidation every 60 seconds

### ISR (Incremental Static Regeneration) - Bonus

- **Homepage**: `revalidate = 60` - regenerates every 60 seconds
- **Post Details**: `revalidate = 60` + `generateStaticParams` for first 10 posts
- **Benefits**: Fast page loads with fresh content

### Form Validation - Bonus

- **Zod Schema**: Validates title (1-255 chars) and body (10-10,000 chars)
- **React Hook Form**: Real-time validation with `mode: 'onChange'`
- **Character Counters**: Visual feedback for field limits
- **Error Messages**: Clear, inline error messages

### Optimistic UI Updates - Bonus

- Posts appear immediately in the list after creation
- React Query optimistic updates in `useCreateBlogPost` hook
- Smooth user experience with instant feedback

### Access Control

- **Public Routes**: `/home`, `/home/blog/[id]` - accessible without authentication
- **Protected Routes**: `/home/blog/create`, `/home/settings` - require authentication
- **Middleware**: Handles route protection at the edge
- **RLS Policies**: Database-level security via Supabase Row Level Security

## 🧪 Testing

See `MANUAL_TESTING_GUIDE.md` for comprehensive testing instructions.

Quick test checklist:
- [ ] Sign up with email/password
- [ ] Sign in with Google OAuth
- [ ] Sign in with Email OTP
- [ ] View blog posts on homepage
- [ ] Navigate pagination
- [ ] View post details
- [ ] Create a new post (authenticated)
- [ ] Verify form validation
- [ ] Test as unauthenticated user (can view, cannot create)

## 📝 Database Schema

### `blog_posts` Table

```sql
- id (UUID, primary key)
- title (VARCHAR 255)
- body (TEXT)
- author_id (UUID, references auth.users)
- published_at (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### RLS Policies

- **Public Read**: Anyone can read published posts (`published_at IS NOT NULL`)
- **Authenticated Create**: Authenticated users can create posts
- **Author Update/Delete**: Users can only modify their own posts

## 🐛 Troubleshooting

### Posts not appearing

- Verify `published_at` is set (not null)
- Check RLS policies are enabled
- Verify GraphQL is enabled in Supabase

### Cannot create post

- Ensure you're logged in
- Check RLS policies allow authenticated insert
- Verify form validation passes

### Author names not showing

- Ensure `accounts` table exists and has records
- Verify RLS policy `accounts_read_public_for_blog` is applied
- Check that `author_id` matches user IDs in `accounts` table

### GraphQL errors

- Verify GraphQL is enabled in Supabase Dashboard
- Check environment variables are set correctly
- Test queries directly in Supabase GraphQL explorer

## 📚 Additional Documentation

- `MANUAL_TESTING_GUIDE.md` - Comprehensive testing guide
- `QUICK_TEST_CHECKLIST.md` - Quick testing checklist
- `IMPLEMENTATION_PLAN.md` - Implementation details
- `EMAIL_OTP_SETUP.md` - Email OTP configuration guide

## 🎓 Assignment Deliverables

✅ Complete project with all features  
✅ Detailed README with setup instructions  
✅ Auth configuration documented  
✅ Bonus features explained  
✅ Error handling and validation  
✅ Clean UI with good UX  
✅ TypeScript throughout  
✅ GraphQL integration  
✅ ISR implementation  

## 📧 Contact

GitHub: [ahsang](https://github.com/ahsang)

---

**Built with**: Next.js 15, Makerkit, Supabase, TypeScript, GraphQL, React Query, Zod, React Hook Form

