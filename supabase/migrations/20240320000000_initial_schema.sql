-- Active: 1735292501200@@127.0.0.1@5432@postgres@public
-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists moddatetime;

-- Create people table
create table people (
  id uuid primary key,
  email text unique not null,
  name text not null,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on people
alter table people enable row level security;

-- People policies
create policy "Users can insert their own profile"
  on people for insert
  with check (auth.uid() = id);

create policy "Users can view all people"
  on people for select
  to authenticated
  using (true);

create policy "Users can update their own profile"
  on people for update
  using (auth.uid() = id);

create policy "Users can't delete profiles"
  on people for delete
  using (false);

-- Create projects table
create table projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon text default '📁',
  color text default '#1976D2',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on projects
alter table projects enable row level security;

-- Create project memberships table first (before projects policies that depend on it)
create table project_memberships (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  person_id uuid references people(id) on delete cascade,
  role text not null check (role in ('admin', 'member')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, person_id)
);

-- Enable RLS on project memberships
alter table project_memberships enable row level security;

-- Project memberships policies
create policy "Users can view project memberships they are a member of"
  on project_memberships for select
  using (
    person_id = auth.uid() or 
    exists (
      select 1 from project_memberships pm
      where pm.project_id = project_memberships.project_id
      and pm.person_id = auth.uid()
    )
  );

create policy "Project admins can insert project memberships"
  on project_memberships for insert
  with check (
    -- Allow if user is an admin
    exists (
      select 1 from project_memberships pm
      where pm.project_id = project_memberships.project_id
      and pm.person_id = auth.uid()
      and pm.role = 'admin'
    )
    -- Or if this is the first member (becoming admin) of a new project
    or not exists (
      select 1 from project_memberships pm
      where pm.project_id = project_memberships.project_id
    )
  );

create policy "Project admins can update project memberships"
  on project_memberships for update
  using (
    exists (
      select 1 from project_memberships pm
      where pm.project_id = project_memberships.project_id
      and pm.person_id = auth.uid()
      and pm.role = 'admin'
    )
  );

create policy "Project admins can delete project memberships"
  on project_memberships for delete
  using (
    exists (
      select 1 from project_memberships pm
      where pm.project_id = project_memberships.project_id
      and pm.person_id = auth.uid()
      and pm.role = 'admin'
    )
  );

create policy "Project creators can manage their own membership"
  on project_memberships for all
  using (person_id = auth.uid())
  with check (person_id = auth.uid());

-- Now add projects policies that depend on project_memberships
create policy "Users can view projects they are members of"
  on projects for select
  using (
    exists (
      select 1 from project_memberships
      where project_id = id
      and person_id = auth.uid()
    )
  );

create policy "Project members can manage projects"
  on projects for all
  using (
    exists (
      select 1 from project_memberships
      where project_id = id
      and person_id = auth.uid()
      and role = 'admin'
    )
  );

-- Create task states table
create table task_states (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  description text,
  color text default '#1976D2',
  position integer not null,
  icon_name text default 'check',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, position)
);

-- Enable RLS on task states
alter table task_states enable row level security;

-- Task states policies
create policy "Users can view task states of their projects"
  on task_states for select
  using (
    exists (
      select 1 from project_memberships
      where project_id = task_states.project_id
      and person_id = auth.uid()
    )
  );

create policy "Project admins can manage task states"
  on task_states for all
  using (
    exists (
      select 1 from project_memberships
      where project_id = task_states.project_id
      and person_id = auth.uid()
      and role = 'admin'
    )
  );

-- Create task priorities table
create table task_priorities (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  name text not null,
  description text,
  color text default '#1976D2',
  position integer not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (project_id, position)
);

-- Enable RLS on task priorities
alter table task_priorities enable row level security;

-- Task priorities policies
create policy "Users can view task priorities of their projects"
  on task_priorities for select
  using (
    exists (
      select 1 from project_memberships
      where project_id = task_priorities.project_id
      and person_id = auth.uid()
    )
  );

create policy "Project admins can manage task priorities"
  on task_priorities for all
  using (
    exists (
      select 1 from project_memberships
      where project_id = task_priorities.project_id
      and person_id = auth.uid()
      and role = 'admin'
    )
  );

-- Create tasks table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  state_id uuid references task_states(id) on delete set null,
  priority_id uuid references task_priorities(id) on delete set null,
  assigned_to uuid references people(id) on delete set null,
  due_date timestamp with time zone,
  completed boolean default false,
  created_by uuid references people(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on tasks
alter table tasks enable row level security;

-- Tasks policies
create policy "Users can view tasks of their projects"
  on tasks for select
  using (
    exists (
      select 1 from project_memberships
      where project_id = tasks.project_id
      and person_id = auth.uid()
    )
  );

create policy "Project members can manage tasks"
  on tasks for all
  using (
    exists (
      select 1 from project_memberships
      where project_id = tasks.project_id
      and person_id = auth.uid()
    )
  );

-- Create updated_at triggers for all tables
create trigger handle_updated_at before update on people
  for each row execute procedure moddatetime (updated_at);

create trigger handle_updated_at before update on projects
  for each row execute procedure moddatetime (updated_at);

create trigger handle_updated_at before update on project_memberships
  for each row execute procedure moddatetime (updated_at);

create trigger handle_updated_at before update on task_states
  for each row execute procedure moddatetime (updated_at);

create trigger handle_updated_at before update on task_priorities
  for each row execute procedure moddatetime (updated_at);

create trigger handle_updated_at before update on tasks
  for each row execute procedure moddatetime (updated_at); 