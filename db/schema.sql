-- USER PROFILES
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    full_name text not null,

    email text unique not null,

    role text default 'user'
    check (role in ('user', 'recruiter')),

    recruiter_verified boolean default false,

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

-- APPROVED RECRUITER DOMAINS
create table approved_recruiter_domains (
    id bigint generated always as identity primary key,

    domain text unique not null,

    company_name text,

    created_at timestamptz default now()
);

-- Insert approved domains
insert into approved_recruiter_domains (domain, company_name) values
('google.com', 'Google'),
('microsoft.com', 'Microsoft'),
('amazon.com', 'Amazon'),
('apple.com', 'Apple'),
('meta.com', 'Meta'),
('facebook.com', 'Facebook'),
('netflix.com', 'Netflix'),
('adobe.com', 'Adobe'),
('tesla.com', 'Tesla'),
('linkedin.com', 'LinkedIn'),
('uber.com', 'Uber'),
('airbnb.com', 'Airbnb'),
('spotify.com', 'Spotify'),
('slack.com', 'Slack'),
('salesforce.com', 'Salesforce'),
('ibm.com', 'IBM'),
('oracle.com', 'Oracle'),
('cisco.com', 'Cisco'),
('intel.com', 'Intel'),
('qualcomm.com', 'Qualcomm'),
('vmware.com', 'VMware'),
('redhat.com', 'Red Hat');
