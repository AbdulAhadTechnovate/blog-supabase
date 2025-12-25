/*
 * -------------------------------------------------------
 * Simplified Accounts Table Creation
 * This creates the accounts table without superuser commands
 * Run this in Supabase SQL Editor if accounts table doesn't exist
 * -------------------------------------------------------
 */

-- Create kit schema if it doesn't exist
create schema if not exists kit;

-- Create accounts table
create table if not exists public.accounts (
    id uuid unique not null default gen_random_uuid(),
    name varchar(255) not null,
    email varchar(320) unique,
    updated_at timestamp with time zone,
    created_at timestamp with time zone,
    created_by uuid references auth.users,
    updated_by uuid references auth.users,
    picture_url varchar(1000),
    public_data jsonb default '{}'::jsonb not null,
    primary key (id)
);

-- Enable RLS on the accounts table
alter table public.accounts enable row level security;

-- SELECT(accounts): Users can read their own accounts
drop policy if exists accounts_read on public.accounts;
create policy accounts_read on public.accounts
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- UPDATE(accounts): Users can update their own accounts
drop policy if exists accounts_update on public.accounts;
create policy accounts_update on public.accounts
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Grant permissions
grant select, insert, update, delete on table public.accounts to authenticated, service_role;

-- Create trigger function for new user setup
create or replace function kit.new_user_created_setup() returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
    user_name text;
    picture_url text;
begin
    if new.raw_user_meta_data ->> 'name' is not null then
        user_name := new.raw_user_meta_data ->> 'name';
    end if;

    if user_name is null and new.email is not null then
        user_name := split_part(new.email, '@', 1);
    end if;

    if user_name is null then
        user_name := '';
    end if;

    if new.raw_user_meta_data ->> 'avatar_url' is not null then
        picture_url := new.raw_user_meta_data ->> 'avatar_url';
    else
        picture_url := null;
    end if;

    insert into public.accounts(id, name, picture_url, email)
    values (new.id, user_name, picture_url, new.email);

    return new;
end;
$$;

-- Create trigger for new user creation (drop first if exists)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row
execute procedure kit.new_user_created_setup();

