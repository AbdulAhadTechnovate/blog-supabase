/*
 * -------------------------------------------------------
 * Section: Blog Posts
 * We create the schema for blog posts. Blog posts allow authenticated users
 * to create and manage their own blog entries.
 * -------------------------------------------------------
 */

-- Create kit schema if it doesn't exist (required for trigger function)
create schema if not exists kit;

-- Blog Posts table
create table if not exists
    public.blog_posts
(
    id          uuid unique  not null default extensions.uuid_generate_v4(),
    title       varchar(255) not null,
    body        text         not null,
    author_id   uuid         not null references auth.users(id) on delete cascade,
    published_at timestamp with time zone,
    created_at  timestamp with time zone default now(),
    updated_at  timestamp with time zone default now(),
    primary key (id)
);

comment on table public.blog_posts is 'Blog posts created by authenticated users';

comment on column public.blog_posts.id is 'Unique identifier for the blog post';

comment on column public.blog_posts.title is 'Title of the blog post';

comment on column public.blog_posts.body is 'Full body content of the blog post';

comment on column public.blog_posts.author_id is 'Reference to the user who created the post';

comment on column public.blog_posts.published_at is 'Timestamp when the post was published. NULL means draft';

comment on column public.blog_posts.created_at is 'Timestamp when the post was created';

comment on column public.blog_posts.updated_at is 'Timestamp when the post was last updated';

-- Create indexes for better query performance
create index if not exists blog_posts_published_at_idx on public.blog_posts(published_at desc nulls last);

create index if not exists blog_posts_author_id_idx on public.blog_posts(author_id);

create index if not exists blog_posts_created_at_idx on public.blog_posts(created_at desc);

-- Enable RLS on the blog_posts table
alter table "public"."blog_posts"
    enable row level security;

-- SELECT(blog_posts):
-- Public can read published posts (where published_at is not null)
-- Authenticated users can read their own posts (published or draft)
create policy blog_posts_read_public on public.blog_posts for
    select
    to anon, authenticated using (
        published_at is not null
    );

create policy blog_posts_read_own on public.blog_posts for
    select
    to authenticated using (
        (select auth.uid()) = author_id
    );

-- INSERT(blog_posts):
-- Authenticated users can create posts
create policy blog_posts_insert on public.blog_posts for
    insert
    to authenticated with check (
        (select auth.uid()) = author_id
    );

-- UPDATE(blog_posts):
-- Users can only update their own posts
create policy blog_posts_update on public.blog_posts for
    update
    to authenticated using (
        (select auth.uid()) = author_id
    )
    with check (
        (select auth.uid()) = author_id
    );

-- DELETE(blog_posts):
-- Users can only delete their own posts
create policy blog_posts_delete on public.blog_posts for
    delete
    to authenticated using (
        (select auth.uid()) = author_id
    );

-- Grant permissions
grant
    select,
    insert,
    update,
    delete on table public.blog_posts to authenticated,
    service_role;

-- Function to automatically update updated_at timestamp
create
    or replace function kit.handle_blog_post_updated_at() returns trigger
    language plpgsql
    security definer
    set
        search_path = '' as
$$
begin
    new.updated_at = now();
    return new;
end;
$$;

-- Trigger to automatically update updated_at on blog post updates
create trigger blog_posts_updated_at
    before
        update
    on public.blog_posts
    for each row
execute function kit.handle_blog_post_updated_at();

