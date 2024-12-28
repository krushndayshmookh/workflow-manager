-- Function to create a default project for new users
create or replace function create_default_project(user_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  project_id uuid;
  state_id_backlog uuid;
  state_id_todo uuid;
  priority_id_medium uuid;
  priority_id_high uuid;
begin
  -- Create default project
  insert into projects (name, description, icon, color)
  values (
    'Getting Started',
    'Welcome to your first project! This project will help you learn how to use the platform.',
    '🚀',
    '#1976D2'
  )
  returning id into project_id;

  -- Add user as admin
  insert into project_memberships (project_id, person_id, role)
  values (project_id, user_id, 'admin');

  -- Create default states
  insert into task_states (project_id, name, description, color, position, icon_name)
  values
    (project_id, 'Backlog', 'Tasks to be worked on', '#718096', 0, 'check')
    returning id into state_id_backlog;

  insert into task_states (project_id, name, description, color, position, icon_name)
  values
    (project_id, 'Todo', 'Tasks ready to start', '#3182CE', 1, 'check')
    returning id into state_id_todo;

  insert into task_states (project_id, name, description, color, position, icon_name)
  values
    (project_id, 'In Progress', 'Tasks being worked on', '#805AD5', 2, 'check');

  insert into task_states (project_id, name, description, color, position, icon_name)
  values
    (project_id, 'Done', 'Completed tasks', '#38A169', 3, 'check');

  -- Create default priorities
  insert into task_priorities (project_id, name, description, color, position, icon_name)
  values
    (project_id, 'Low', 'Tasks that can wait', '#718096', 0, 'check');

  insert into task_priorities (project_id, name, description, color, position, icon_name)
  values
    (project_id, 'Medium', 'Tasks to do soon', '#3182CE', 1, 'check')
    returning id into priority_id_medium;

  insert into task_priorities (project_id, name, description, color, position, icon_name)
  values
    (project_id, 'High', 'Important tasks', '#805AD5', 2, 'check')
    returning id into priority_id_high;

  insert into task_priorities (project_id, name, description, color, position, icon_name)
  values
    (project_id, 'Urgent', 'Critical tasks', '#E53E3E', 3, 'check');

  -- Create onboarding tasks
  insert into tasks (
    project_id,
    title,
    description,
    state_id,
    priority_id,
    assigned_to,
    created_by
  )
  values
    (
      project_id,
      'Welcome to your project!',
      'This is your first project. Here are some things you can do:
      
      1. Create new tasks using the + button
      2. Drag and drop tasks between states
      3. Assign tasks to team members
      4. Set priorities and due dates
      5. Customize project settings',
      state_id_backlog,
      priority_id_medium,
      user_id,
      user_id
    ),
    (
      project_id,
      'Invite your team',
      'Click the "Invite Members" button to add your team to this project.',
      state_id_todo,
      priority_id_high,
      user_id,
      user_id
    ),
    (
      project_id,
      'Customize your workflow',
      'Go to project settings to customize task states and priorities.',
      state_id_todo,
      priority_id_medium,
      user_id,
      user_id
    );

  return project_id;
end;
$$; 