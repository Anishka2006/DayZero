-- USER PROFILES
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    full_name text not null,

    email text unique not null,

    role text default 'user'
    check (role in ('user', 'recruiter')),

    created_at timestamptz default now()
);

-- CANDIDATE SUBMISSIONS
create table submissions (
    id bigint generated always as identity primary key,

    user_id uuid references profiles(id) on delete cascade,

    task_id text,

    submission_text text,

    score int,

    feedback text,

    status text default 'on-track',

    created_at timestamptz default now()
);

-- DEMO REQUESTS
create table demo_requests (
    id bigint generated always as identity primary key,

    name text not null,

    phone text not null,

    created_at timestamptz default now()
);