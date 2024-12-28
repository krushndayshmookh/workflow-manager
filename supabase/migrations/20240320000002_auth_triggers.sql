-- Create a trigger to create a default project when a new user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  name_from_metadata text;
begin
  -- Get name from metadata or fallback to email username
  name_from_metadata := (new.raw_user_meta_data->>'name');
  if name_from_metadata is null then
    name_from_metadata := split_part(new.email, '@', 1);
  end if;

  -- Create person record with security definer to bypass RLS
  insert into people (id, email, name)
  values (new.id, new.email, name_from_metadata);

  -- Create default project
  perform create_default_project(new.id);

  return new;
end;
$$;

-- Create the trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user(); 