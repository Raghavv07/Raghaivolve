-- Create profiles table (links to auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create strategies table
create table public.strategies (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  status text check (status in ('planned', 'executing', 'completed')) default 'planned',
  progress integer default 0,
  tasks_count integer default 0,
  summary text,
  estimated_duration text,
  tasks jsonb default '[]'::jsonb,
  versions jsonb default '[]'::jsonb,
  analysis jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  last_updated timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for strategies
alter table public.strategies enable row level security;

create policy "Users can view own strategies."
  on strategies for select
  using ( auth.uid() = user_id );

create policy "Users can insert own strategies."
  on strategies for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own strategies."
  on strategies for update
  using ( auth.uid() = user_id );

create policy "Users can delete own strategies."
  on strategies for delete
  using ( auth.uid() = user_id );

-- Create function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user signup
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
