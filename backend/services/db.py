from __future__ import annotations

import os
import re
from contextlib import contextmanager
from datetime import date, datetime
from pathlib import Path
from typing import Any
from uuid import UUID, uuid4, uuid5, NAMESPACE_DNS

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import Json, RealDictCursor
from werkzeug.utils import secure_filename


PROJECT_ROOT = Path(__file__).resolve().parents[2]
UPLOAD_DIR = PROJECT_ROOT / "uploads"

load_dotenv(PROJECT_ROOT / ".env")

DIRECT_DB_URL = (
    os.getenv("DATABASE_URL")
    or os.getenv("SUPABASE_DB_URL")
    or os.getenv("SUPABASE_DATABASE_URL")
    or os.getenv("SUPABASE_POSTGRES_URL")
    or os.getenv("POSTGRES_URL")
    or os.getenv("POSTGRES_CONNECTION_STRING")
    or os.getenv("POSTGRES_URL_NON_POOLING")
    or os.getenv("POSTGRES_PRISMA_URL")
    or os.getenv("DB_URL")
)

DEFAULT_AGENTS = [
    {"name": "Asha", "role": "Product Manager"},
    {"name": "Ravi", "role": "Engineering Lead"},
    {"name": "Mira", "role": "Product Designer"},
    {"name": "Kenji", "role": "QA Engineer"},
    {"name": "Leah", "role": "Data Analyst"},
    {"name": "Quinn", "role": "Evaluator Agent"},
]

DEFAULT_TASKS = [
    {
        "company_name": "Northstar Pay",
        "title": "Fix the OTP onboarding before demo",
        "role": "frontend",
        "level": "beginner",
        "duration_type": "one_hour",
        "scenario": "The resend OTP flow has unclear loading states and weak validation right before an investor demo.",
        "skills_tested": ["UI state handling", "accessibility", "form validation"],
    },
    {
        "company_name": "ForgeAuth",
        "title": "Stabilize the login retry flow",
        "role": "backend",
        "level": "beginner",
        "duration_type": "one_hour",
        "scenario": "The login service is creating retry storms and unclear lockout behavior during peak traffic.",
        "skills_tested": ["API design", "rate limiting", "logging"],
    },
    {
        "company_name": "Pulse Metrics",
        "title": "Prioritize the launch scope",
        "role": "pm",
        "level": "beginner",
        "duration_type": "one_hour",
        "scenario": "Customer feedback conflicts with leadership scope. Decide what ships first and what waits.",
        "skills_tested": ["prioritization", "success metrics", "tradeoffs"],
    },
    {
        "company_name": "Orbit Ops",
        "title": "Clean up the KPI dashboard",
        "role": "data_analyst",
        "level": "beginner",
        "duration_type": "one_hour",
        "scenario": "Stakeholders disagree on conversion and retention definitions before a weekly business review.",
        "skills_tested": ["SQL thinking", "metric definitions", "data storytelling"],
    },
    {
        "company_name": "Wave Studio",
        "title": "Improve mobile signup UX",
        "role": "designer",
        "level": "beginner",
        "duration_type": "one_hour",
        "scenario": "New users are dropping during signup because the mobile flow feels unclear and unforgiving.",
        "skills_tested": ["UX clarity", "accessibility", "microcopy"],
    },
    {
        "company_name": "Beacon QA",
        "title": "Investigate a release blocker",
        "role": "qa",
        "level": "beginner",
        "duration_type": "one_hour",
        "scenario": "A same-day release has inconsistent recovery behavior and the team needs a clear ship, hold, or narrow call.",
        "skills_tested": ["edge cases", "validation", "release safety"],
    },
    {
        "company_name": "Astra Commerce",
        "title": "Migrate a legacy widget into the SPA",
        "role": "frontend",
        "level": "intermediate",
        "duration_type": "one_hour",
        "scenario": "A legacy checkout widget must move into the SPA shell without breaking browser history, loading states, or mobile performance.",
        "skills_tested": ["SPA architecture", "performance", "release planning"],
    },
    {
        "company_name": "Nimbus Queue",
        "title": "Repair the queue worker",
        "role": "backend",
        "level": "intermediate",
        "duration_type": "one_hour",
        "scenario": "Background jobs are retrying out of order and creating duplicate customer notifications.",
        "skills_tested": ["queues", "idempotency", "testing"],
    },
    {
        "company_name": "Lumen Labs",
        "title": "Turn feedback into a roadmap",
        "role": "pm",
        "level": "intermediate",
        "duration_type": "one_hour",
        "scenario": "Support, sales, and engineering disagree on what the next sprint should solve first.",
        "skills_tested": ["roadmapping", "stakeholder alignment", "risk framing"],
    },
    {
        "company_name": "Beacon Growth",
        "title": "Design an experiment readout",
        "role": "data_analyst",
        "level": "intermediate",
        "duration_type": "one_hour",
        "scenario": "A retention experiment has mixed results and the product team needs a clear recommendation.",
        "skills_tested": ["experimentation", "cohort analysis", "recommendation writing"],
    },
    {
        "company_name": "Nexa Health",
        "title": "Prototype a recovery flow",
        "role": "designer",
        "level": "intermediate",
        "duration_type": "one_hour",
        "scenario": "Users hit an error state during booking and need a calmer, clearer recovery path.",
        "skills_tested": ["interaction design", "error states", "handoff clarity"],
    },
    {
        "company_name": "Crimson Bank",
        "title": "Plan a safe schema change",
        "role": "backend",
        "level": "advanced",
        "duration_type": "one_hour",
        "scenario": "A high-risk data model change must ship while preserving user flows and rollback options.",
        "skills_tested": ["database changes", "rollback planning", "validation"],
    },
    {
        "company_name": "Spotify Studio",
        "title": "Recover creator retention",
        "role": "data_analyst",
        "level": "advanced",
        "duration_type": "one_hour",
        "scenario": "A redesign hurt creator retention. Use evidence to separate correlation from action.",
        "skills_tested": ["causal thinking", "segmentation", "executive narrative"],
    },
    {
        "company_name": "Astra AI",
        "title": "Set the next-quarter AI strategy",
        "role": "pm",
        "level": "advanced",
        "duration_type": "one_hour",
        "scenario": "Leadership needs a sharp strategy for an AI feature with trust, revenue, and adoption tension.",
        "skills_tested": ["strategy", "tradeoffs", "leadership communication"],
    },
    {
        "company_name": "Lumen Design",
        "title": "Lead a component library refresh",
        "role": "designer",
        "level": "advanced",
        "duration_type": "one_hour",
        "scenario": "A design system refresh must improve clarity without disrupting teams already shipping.",
        "skills_tested": ["design systems", "accessibility", "cross-team rollout"],
    },
    {
        "company_name": "MetaScale",
        "title": "Protect a high-risk frontend release",
        "role": "frontend",
        "level": "advanced",
        "duration_type": "one_hour",
        "scenario": "A large frontend release has performance risk, unclear fallback states, and tight launch pressure.",
        "skills_tested": ["frontend architecture", "risk management", "validation"],
    },
]

ROLE_ALIASES = {
    "frontend": "frontend",
    "frontend developer": "frontend",
    "backend": "backend",
    "backend developer": "backend",
    "pm": "pm",
    "product": "pm",
    "product manager": "pm",
    "data": "data_analyst",
    "analyst": "data_analyst",
    "data analyst": "data_analyst",
    "data_analyst": "data_analyst",
    "qa": "qa",
    "qa engineer": "qa",
    "quality": "qa",
    "design": "designer",
    "designer": "designer",
    "product designer": "designer",
}

LEVEL_ALIASES = {
    "beginner": "beginner",
    "intermediate": "intermediate",
    "advanced": "advanced",
}

_schema_ready = False


class DatabaseNotConfigured(RuntimeError):
    pass


def jsonable(value: Any) -> Any:
    if isinstance(value, dict):
        return {key: jsonable(val) for key, val in value.items()}
    if isinstance(value, list):
        return [jsonable(item) for item in value]
    if isinstance(value, tuple):
        return [jsonable(item) for item in value]
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, UUID):
        return str(value)
    return value


def normalize_role(value: str | None) -> str | None:
    if value is None:
        return None
    return ROLE_ALIASES.get(str(value).strip().lower(), str(value).strip().lower())


def normalize_level(value: str | None) -> str | None:
    if value is None:
        return None
    return LEVEL_ALIASES.get(str(value).strip().lower(), str(value).strip().lower())


def _valid_uuid(value: Any) -> str | None:
    if not value:
        return None
    try:
        return str(UUID(str(value)))
    except (TypeError, ValueError):
        return None


@contextmanager
def db_connection():
    if not DIRECT_DB_URL and not _has_db_parts():
        raise DatabaseNotConfigured(
            "Database is not connected. Add DATABASE_URL, or set DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD in .env."
        )

    if DIRECT_DB_URL:
        kwargs: dict[str, Any] = {"cursor_factory": RealDictCursor}
        if "supabase" in DIRECT_DB_URL and "sslmode=" not in DIRECT_DB_URL:
            kwargs["sslmode"] = "require"
        conn = psycopg2.connect(DIRECT_DB_URL, **kwargs)
    else:
        conn = psycopg2.connect(cursor_factory=RealDictCursor, **_db_parts())

    try:
        yield conn
    finally:
        conn.close()


def _has_db_parts() -> bool:
    return all(
        os.getenv(key)
        for key in ("DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD")
    )


def _db_parts() -> dict[str, Any]:
    host = os.getenv("DB_HOST", "")
    parts: dict[str, Any] = {
        "host": host,
        "port": int(os.getenv("DB_PORT") or 5432),
        "dbname": os.getenv("DB_NAME"),
        "user": os.getenv("DB_USER"),
        "password": os.getenv("DB_PASSWORD"),
    }
    sslmode = os.getenv("DB_SSLMODE")
    if sslmode:
        parts["sslmode"] = sslmode
    elif "supabase" in host or os.getenv("SUPABASE_URL"):
        parts["sslmode"] = "require"
    return parts


def ensure_runtime_schema() -> None:
    global _schema_ready
    if _schema_ready:
        return

    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto;")
            cur.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS skills_tested TEXT[] DEFAULT '{}'::TEXT[];")
            cur.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;")
            cur.execute("ALTER TABLE tasks ADD COLUMN IF NOT EXISTS workspace_files JSONB DEFAULT '[]'::JSONB;")
            cur.execute("ALTER TABLE simulation_sessions ADD COLUMN IF NOT EXISTS ended_at TIMESTAMPTZ;")
            cur.execute("ALTER TABLE submissions ADD COLUMN IF NOT EXISTS session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE;")
            cur.execute("ALTER TABLE submissions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'on-track';")
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS uploaded_files (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
                  channel_id UUID REFERENCES channels(id) ON DELETE SET NULL,
                  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
                  file_name TEXT NOT NULL,
                  file_url TEXT NOT NULL,
                  content_type TEXT,
                  visibility TEXT DEFAULT 'team' CHECK (visibility IN ('team', 'agent')),
                  target_agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
                  created_at TIMESTAMPTZ DEFAULT NOW()
                );
                """
            )
            cur.execute(
                """
                CREATE TABLE IF NOT EXISTS observer_notes (
                  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                  session_id UUID REFERENCES simulation_sessions(id) ON DELETE CASCADE,
                  agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
                  note TEXT NOT NULL,
                  note_type TEXT DEFAULT 'observation' CHECK (note_type IN ('observation', 'feedback', 'evaluation')),
                  created_at TIMESTAMPTZ DEFAULT NOW()
                );
                """
            )
            cur.execute("CREATE INDEX IF NOT EXISTS idx_observer_notes_session ON observer_notes(session_id);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_tasks_role ON tasks(role);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_tasks_level ON tasks(level);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_tasks_active ON tasks(active);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_channels_session_id ON channels(session_id);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_messages_channel_created_at ON messages(channel_id, created_at);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_uploaded_files_session ON uploaded_files(session_id);")
            cur.execute("CREATE INDEX IF NOT EXISTS idx_uploaded_files_channel ON uploaded_files(channel_id);")
            _seed_agents(cur)
            _deactivate_legacy_seed_tasks(cur)
            _seed_tasks_if_empty(cur)
        conn.commit()

    _schema_ready = True


def _seed_agents(cur) -> None:
    for agent in DEFAULT_AGENTS:
        cur.execute(
            """
            INSERT INTO agents (name, role)
            SELECT %s, %s
            WHERE NOT EXISTS (
              SELECT 1 FROM agents WHERE LOWER(name) = LOWER(%s)
            );
            """,
            (agent["name"], agent["role"], agent["name"]),
        )


def _seed_tasks_if_empty(cur) -> None:
    for task in DEFAULT_TASKS:
        task_id = uuid5(
            NAMESPACE_DNS,
            f"dayzero:{task['company_name']}:{task['title']}:{task['role']}:{task['level']}",
        )
        workspace_files = _default_workspace_files(task)
        cur.execute(
            """
            INSERT INTO tasks (
              id, company_name, title, role, level, duration_type, scenario,
              skills_tested, workspace_files, active
            )
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, TRUE)
            ON CONFLICT (id) DO UPDATE
            SET company_name = EXCLUDED.company_name,
                title = EXCLUDED.title,
                role = EXCLUDED.role,
                level = EXCLUDED.level,
                duration_type = EXCLUDED.duration_type,
                scenario = EXCLUDED.scenario,
                skills_tested = EXCLUDED.skills_tested,
                workspace_files = EXCLUDED.workspace_files,
                active = TRUE;
            """,
            (
                str(task_id),
                task["company_name"],
                task["title"],
                task["role"],
                task["level"],
                task["duration_type"],
                task["scenario"],
                task["skills_tested"],
                Json(workspace_files),
            ),
        )


def _deactivate_legacy_seed_tasks(cur) -> None:
    cur.execute(
        """
        UPDATE tasks
        SET active = FALSE
        WHERE title = ANY(%s);
        """,
        (
            [
                "Fix OTP Onboarding Before Demo",
                "Secure Login Retry Flow",
                "Prioritize the Launch Scope",
                "Clean Up the KPI Dashboard",
                "Improve Mobile Signup UX",
                "Migrate a Legacy Widget",
                "Stabilize the Queue Worker",
                "Turn Feedback Into a Roadmap",
                "Design an Experiment Readout",
                "Prototype a Recovery Flow",
                "Plan a Safe Schema Change",
                "Recover Creator Retention",
                "Set the Next Quarter Strategy",
                "Lead a Component Library Refresh",
                "Protect a Frontend Release",
            ],
        ),
    )


def _default_workspace_files(task: dict[str, Any]) -> list[dict[str, str]]:
    skills = "\n".join(f"- {skill}" for skill in task.get("skills_tested") or [])
    return [
        {
            "id": "task-brief",
            "name": "task_brief.md",
            "kind": "brief",
            "content": (
                f"# {task['title']}\n\n"
                f"Company: {task['company_name']}\n"
                f"Role: {task['role']}\n"
                f"Level: {task['level']}\n\n"
                f"## Scenario\n{task['scenario']}\n\n"
                f"## Skills tested\n{skills}\n\n"
                "## Final handoff should include\n"
                "- First decision\n"
                "- Tradeoff\n"
                "- Validation plan\n"
                "- Owner or next step\n"
            ),
        },
        {
            "id": "notes",
            "name": "candidate_notes.md",
            "kind": "brief",
            "content": "# Candidate notes\n\n- Decision:\n- Evidence:\n- Risk:\n- Next step:\n",
        },
    ]


def _fetch_one(cur, query: str, params: tuple[Any, ...]) -> dict[str, Any] | None:
    cur.execute(query, params)
    row = cur.fetchone()
    return dict(row) if row else None


def list_tasks(role: str | None = None, level: str | None = None) -> list[dict[str, Any]]:
    ensure_runtime_schema()
    role = normalize_role(role)
    level = normalize_level(level)

    filters = ["COALESCE(active, TRUE) = TRUE"]
    params: list[Any] = []
    if role:
        filters.append("LOWER(role) = %s")
        params.append(role)
    if level:
        filters.append("LOWER(level) = %s")
        params.append(level)

    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                f"""
                SELECT
                  id::TEXT, company_name, title, role, level, duration_type,
                  scenario, COALESCE(skills_tested, '{{}}'::TEXT[]) AS skills_tested,
                  COALESCE(workspace_files, '[]'::JSONB) AS workspace_files,
                  created_at
                FROM tasks
                WHERE {' AND '.join(filters)}
                ORDER BY created_at DESC, title ASC
                LIMIT 60;
                """,
                tuple(params),
            )
            return jsonable([dict(row) for row in cur.fetchall()])


def get_task(task_id: str, cur=None) -> dict[str, Any] | None:
    query = """
        SELECT
          id::TEXT, company_name, title, role, level, duration_type, scenario,
          COALESCE(skills_tested, '{}'::TEXT[]) AS skills_tested,
          COALESCE(workspace_files, '[]'::JSONB) AS workspace_files,
          created_at
        FROM tasks
        WHERE id = %s;
    """
    if cur:
        return jsonable(_fetch_one(cur, query, (task_id,)))

    ensure_runtime_schema()
    with db_connection() as conn:
        with conn.cursor() as local_cur:
            return jsonable(_fetch_one(local_cur, query, (task_id,)))


def _user_from_payload(payload: dict[str, Any]) -> dict[str, Any]:
    raw_user = payload.get("user") if isinstance(payload.get("user"), dict) else {}
    return {
        "id": payload.get("user_id") or raw_user.get("id"),
        "name": payload.get("user_name") or raw_user.get("name") or raw_user.get("full_name"),
        "email": payload.get("user_email") or raw_user.get("email"),
        "role": payload.get("profile_role") or raw_user.get("role") or "user",
    }


def ensure_profile(payload: dict[str, Any]) -> str | None:
    user = _user_from_payload(payload)
    user_id = _valid_uuid(user.get("id"))
    if not user_id:
        return None

    name = str(user.get("name") or "Candidate").strip() or "Candidate"
    email = str(user.get("email") or f"{user_id}@dayzero.local").strip().lower()
    role = "recruiter" if str(user.get("role")).lower() == "recruiter" else "user"

    try:
        with db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO profiles (id, full_name, email, role)
                    VALUES (%s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE
                    SET full_name = EXCLUDED.full_name,
                        email = EXCLUDED.email,
                        role = EXCLUDED.role;
                    """,
                    (user_id, name, email, role),
                )
            conn.commit()
        return user_id
    except psycopg2.Error:
        return None


def _core_agents(cur) -> list[dict[str, Any]]:
    cur.execute(
        """
        SELECT id::TEXT, name, role
        FROM agents
        WHERE LOWER(name) IN ('asha', 'ravi', 'mira', 'kenji', 'leah')
                ORDER BY CASE LOWER(name)
                    WHEN 'asha' THEN 1
                    WHEN 'ravi' THEN 2
                    WHEN 'mira' THEN 3
                    WHEN 'kenji' THEN 4
                    WHEN 'leah' THEN 5
                    ELSE 6
                END;
        """
    )
    return jsonable([dict(row) for row in cur.fetchall()])


def _task_specific_agents(cur, task: dict[str, Any]) -> list[dict[str, Any]]:
    domain = task.get("domain") or ""
    company = task.get("company") or ""
    role = task.get("role") or ""
    
    agent_selection = {
        "backend": ["Asha", "Ravi", "Kenji", "Mira", "Leah"],
        "frontend": ["Asha", "Mira", "Ravi", "Kenji", "Leah"],
        "design": ["Asha", "Mira", "Kenji", "Ravi", "Leah"],
        "data": ["Asha", "Leah", "Ravi", "Kenji", "Mira"],
        "pm": ["Asha", "Mira", "Leah", "Ravi", "Kenji"],
        "ai": ["Asha", "Ravi", "Mira", "Kenji", "Leah"],
    }.get(domain, ["Asha", "Ravi", "Mira", "Kenji", "Leah"])
    
    agent_lookup = [name.lower() for name in agent_selection]
    placeholders = ",".join(["%s"] * len(agent_lookup))
    cur.execute(
        f"""
        SELECT id::TEXT, name, role
        FROM agents
        WHERE LOWER(name) IN ({placeholders})
        ORDER BY array_position(ARRAY[{placeholders}]::TEXT[], LOWER(name));
        """,
        agent_lookup + agent_lookup,
    )
    return jsonable([dict(row) for row in cur.fetchall()])


def create_session(payload: dict[str, Any]) -> dict[str, Any]:
    ensure_runtime_schema()
    task_id = _valid_uuid(payload.get("task_id"))
    if not task_id:
        raise ValueError("A valid task_id is required.")

    user_id = ensure_profile(payload)

    with db_connection() as conn:
        with conn.cursor() as cur:
            task = get_task(task_id, cur=cur)
            if not task:
                raise LookupError("Task not found.")

            cur.execute(
                """
                INSERT INTO simulation_sessions (user_id, task_id, status)
                VALUES (%s, %s, 'active')
                RETURNING id::TEXT;
                """,
                (user_id, task_id),
            )
            session_id = cur.fetchone()["id"]
            task_domain = task.get("domain") or "pm"
            agents = [agent for agent in _task_specific_agents(cur, task) if agent.get("name")]
            agent_by_name = {agent["name"]: agent for agent in agents}

            channels: list[dict[str, Any]] = []
            cur.execute(
                """
                INSERT INTO channels (session_id, type, name, agent_id)
                VALUES (%s, 'team', 'Team Channel', NULL)
                RETURNING id::TEXT, session_id::TEXT, type, name, agent_id::TEXT, created_at;
                """,
                (session_id,),
            )
            channels.append(dict(cur.fetchone()))

            for agent in agents:
                cur.execute(
                    """
                    INSERT INTO channels (session_id, type, name, agent_id)
                    VALUES (%s, 'dm', %s, %s)
                    RETURNING id::TEXT, session_id::TEXT, type, name, agent_id::TEXT, created_at;
                    """,
                    (session_id, f"DM - {agent['name']}", agent["id"]),
                )
                channels.append(dict(cur.fetchone()))

            team_channel = channels[0]
            _insert_message(
                cur,
                session_id=session_id,
                channel_id=team_channel["id"],
                sender_type="system",
                message=f"Simulation started for {task['company_name']}: {task['title']}.",
            )

            for agent in agents:
                _insert_message(
                    cur,
                    session_id=session_id,
                    channel_id=team_channel["id"],
                    sender_type="agent",
                    agent_id=agent["id"],
                    message=_welcome_message(agent, task),
                )

            for channel in channels[1:]:
                agent = next((item for item in agents if item["id"] == channel["agent_id"]), None)
                if agent:
                    _insert_message(
                        cur,
                        session_id=session_id,
                        channel_id=channel["id"],
                        sender_type="agent",
                        agent_id=agent["id"],
                        message=_dm_welcome_message(agent, task),
                    )

        conn.commit()

    return get_session(session_id)


def get_session(session_id: str) -> dict[str, Any]:
    ensure_runtime_schema()
    session_uuid = _valid_uuid(session_id)
    if not session_uuid:
        raise ValueError("A valid session_id is required.")

    with db_connection() as conn:
        with conn.cursor() as cur:
            session = _fetch_one(
                cur,
                """
                SELECT
                  s.id::TEXT, s.user_id::TEXT, s.task_id::TEXT, s.status, s.started_at, s.ended_at,
                  t.company_name, t.title, t.role, t.level, t.duration_type, t.scenario,
                  COALESCE(t.skills_tested, '{}'::TEXT[]) AS skills_tested,
                  COALESCE(t.workspace_files, '[]'::JSONB) AS workspace_files
                FROM simulation_sessions s
                JOIN tasks t ON t.id = s.task_id
                WHERE s.id = %s;
                """,
                (session_uuid,),
            )
            if not session:
                raise LookupError("Session not found.")

            cur.execute(
                """
                SELECT id::TEXT, session_id::TEXT, type, name, agent_id::TEXT, created_at
                FROM channels
                WHERE session_id = %s
                ORDER BY CASE WHEN type = 'team' THEN 0 ELSE 1 END, created_at ASC;
                """,
                (session_uuid,),
            )
            channels = jsonable([dict(row) for row in cur.fetchall()])
            cur.execute(
                """
                SELECT id::TEXT, name, role
                FROM agents
                WHERE NULLIF(TRIM(name), '') IS NOT NULL
                  AND LOWER(role) <> 'evaluator'
                ORDER BY name ASC;
                """
            )
            agents = jsonable([dict(row) for row in cur.fetchall()])
            cur.execute(
                """
                SELECT id::TEXT, session_id::TEXT, channel_id::TEXT, user_id::TEXT,
                       file_name, file_url, content_type, visibility,
                       target_agent_id::TEXT, created_at
                FROM uploaded_files
                WHERE session_id = %s
                ORDER BY created_at DESC
                LIMIT 80;
                """,
                (session_uuid,),
            )
            files = jsonable([dict(row) for row in cur.fetchall()])

    team_channel = next((channel for channel in channels if channel["type"] == "team"), channels[0] if channels else None)
    messages = get_channel_messages(team_channel["id"]) if team_channel else []
    task = {
        "id": session["task_id"],
        "company_name": session["company_name"],
        "title": session["title"],
        "role": session["role"],
        "level": session["level"],
        "duration_type": session["duration_type"],
        "scenario": session["scenario"],
        "skills_tested": session["skills_tested"],
        "workspace_files": session["workspace_files"],
    }

    return jsonable(
        {
            "session_id": session["id"],
            "session": {
                "id": session["id"],
                "user_id": session["user_id"],
                "task_id": session["task_id"],
                "status": session["status"],
                "started_at": session["started_at"],
                "ended_at": session["ended_at"],
            },
            "task": task,
            "channels": channels,
            "agents": agents,
            "messages": messages,
            "files": files,
        }
    )


def get_channel_messages(channel_id: str, limit: int = 80) -> list[dict[str, Any]]:
    ensure_runtime_schema()
    channel_uuid = _valid_uuid(channel_id)
    if not channel_uuid:
        raise ValueError("A valid channel_id is required.")

    safe_limit = max(1, min(int(limit or 80), 200))
    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT
                  m.id::TEXT, m.session_id::TEXT, m.channel_id::TEXT, m.sender_type,
                  m.user_id::TEXT, m.agent_id::TEXT, m.message, m.created_at,
                  a.name AS agent_name, a.role AS agent_role,
                  p.full_name AS user_name
                FROM messages m
                LEFT JOIN agents a ON a.id = m.agent_id
                LEFT JOIN profiles p ON p.id = m.user_id
                WHERE m.channel_id = %s
                ORDER BY m.created_at ASC, m.id ASC
                LIMIT %s;
                """,
                (channel_uuid, safe_limit),
            )
            return jsonable([_message_payload(dict(row)) for row in cur.fetchall()])


def post_message(payload: dict[str, Any]) -> dict[str, Any]:
    ensure_runtime_schema()
    session_id = _valid_uuid(payload.get("session_id"))
    channel_id = _valid_uuid(payload.get("channel_id"))
    text = str(payload.get("message") or "").strip()
    if not session_id or not channel_id or not text:
        raise ValueError("session_id, channel_id, and message are required.")

    user_id = ensure_profile(payload)

    with db_connection() as conn:
        with conn.cursor() as cur:
            session = _session_task_for_agent(cur, session_id)
            channel = _fetch_one(
                cur,
                """
                SELECT id::TEXT, session_id::TEXT, type, name, agent_id::TEXT
                FROM channels
                WHERE id = %s AND session_id = %s;
                """,
                (channel_id, session_id),
            )
            if not session or not channel:
                raise LookupError("Session or channel not found.")

            user_message = _insert_message(
                cur,
                session_id=session_id,
                channel_id=channel_id,
                sender_type="user",
                user_id=user_id,
                message=text,
            )

            agents = [agent for agent in _task_specific_agents(cur, session) if agent.get("name")]
            selected_agents = _agents_for_message(channel, agents, text)
            replies = []
            for agent in selected_agents:
                replies.append(
                    _insert_message(
                        cur,
                        session_id=session_id,
                        channel_id=channel_id,
                        sender_type="agent",
                        agent_id=agent["id"],
                        message=_agent_reply(agent, text, session),
                    )
                )

        conn.commit()

    messages = get_channel_messages(channel_id)
    return jsonable(
        {
            "saved_message": user_message,
            "new_messages": replies,
            "messages": messages,
        }
    )


def save_observer_note(payload: dict[str, Any]) -> dict[str, Any]:
    ensure_runtime_schema()
    session_id = _valid_uuid(payload.get("session_id"))
    if not session_id:
        raise ValueError("session_id is required.")
    
    note_text = str(payload.get("note") or "").strip()
    if not note_text:
        raise ValueError("note is required.")
    
    note_type = payload.get("note_type") or "observation"
    agent_id = _valid_uuid(payload.get("agent_id"))
    
    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO observer_notes (session_id, agent_id, note, note_type)
                VALUES (%s, %s, %s, %s)
                RETURNING id::TEXT, session_id::TEXT, agent_id::TEXT, note, note_type, created_at;
                """,
                (session_id, agent_id, note_text, note_type),
            )
            row = dict(cur.fetchone())
        conn.commit()
    
    return jsonable(row)


def get_observer_notes(session_id: str) -> list[dict[str, Any]]:
    ensure_runtime_schema()
    session_uuid = _valid_uuid(session_id)
    if not session_uuid:
        return []
    
    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT 
                  on.id::TEXT, on.session_id::TEXT, on.agent_id::TEXT, 
                  on.note, on.note_type, on.created_at,
                  a.name AS agent_name, a.role AS agent_role
                FROM observer_notes on
                LEFT JOIN agents a ON a.id = on.agent_id
                WHERE on.session_id = %s
                ORDER BY on.created_at ASC;
                """,
                (session_uuid,),
            )
            notes = [dict(row) for row in cur.fetchall()]
    
    return jsonable(notes)


def save_upload(file_storage, payload: dict[str, Any]) -> dict[str, Any]:
    ensure_runtime_schema()
    session_id = _valid_uuid(payload.get("session_id"))
    channel_id = _valid_uuid(payload.get("channel_id"))
    if not session_id or not channel_id:
        raise ValueError("session_id and channel_id are required.")
    if not file_storage or not file_storage.filename:
        raise ValueError("A file is required.")

    user_id = ensure_profile(payload)
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    original_name = secure_filename(file_storage.filename) or "upload.bin"
    stored_name = f"{uuid4()}-{original_name}"
    target_path = UPLOAD_DIR / stored_name
    file_storage.save(target_path)
    file_url = f"/uploads/{stored_name}"

    with db_connection() as conn:
        with conn.cursor() as cur:
            channel = _fetch_one(
                cur,
                "SELECT type, agent_id::TEXT FROM channels WHERE id = %s AND session_id = %s;",
                (channel_id, session_id),
            )
            if not channel:
                raise LookupError("Channel not found.")

            visibility = "team" if channel["type"] == "team" else "agent"
            target_agent_id = None if visibility == "team" else channel["agent_id"]
            cur.execute(
                """
                INSERT INTO uploaded_files (
                  session_id, channel_id, user_id, file_name, file_url,
                  content_type, visibility, target_agent_id
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id::TEXT, session_id::TEXT, channel_id::TEXT, user_id::TEXT,
                          file_name, file_url, content_type, visibility,
                          target_agent_id::TEXT, created_at;
                """,
                (
                    session_id,
                    channel_id,
                    user_id,
                    original_name,
                    file_url,
                    file_storage.mimetype,
                    visibility,
                    target_agent_id,
                ),
            )
            row = dict(cur.fetchone())
        conn.commit()

    return jsonable(row)


def create_submission(payload: dict[str, Any]) -> dict[str, Any]:
    ensure_runtime_schema()
    session_id = _valid_uuid(payload.get("session_id"))
    if not session_id:
        raise ValueError("A valid session_id is required.")

    submission_text = str(payload.get("submission_text") or payload.get("submission") or "").strip()
    user_id = ensure_profile(payload)

    existing = get_skill_record(session_id)
    if existing:
        return {"skill_record": existing, "reused": True}

    with db_connection() as conn:
        with conn.cursor() as cur:
            session = _session_task_for_agent(cur, session_id)
            if not session:
                raise LookupError("Session not found.")
            if not user_id:
                user_id = session.get("user_id")

            cur.execute(
                """
                INSERT INTO submissions (session_id, user_id, task_id, submission_text, status)
                VALUES (%s, %s, %s, %s, 'submitted')
                RETURNING id::TEXT;
                """,
                (session_id, user_id, session["task_id"], submission_text),
            )
            submission_id = cur.fetchone()["id"]
            cur.execute(
                "UPDATE simulation_sessions SET status = 'submitted' WHERE id = %s;",
                (session_id,),
            )

        conn.commit()

    context = _evaluation_context(session_id, submission_text, payload.get("workspace_snapshot") or "")
    record = _generate_skill_record(context)
    record["submission_id"] = submission_id
    saved = _insert_skill_record(record)
    return {"skill_record": saved, "reused": False}


def get_skill_record(session_id: str) -> dict[str, Any] | None:
    ensure_runtime_schema()
    session_uuid = _valid_uuid(session_id)
    if not session_uuid:
        return None

    with db_connection() as conn:
        with conn.cursor() as cur:
            row = _fetch_one(
                cur,
                """
                SELECT
                  sr.id::TEXT, sr.session_id::TEXT, sr.user_id::TEXT, sr.task_id::TEXT,
                  sr.role, sr.overall_score, sr.summary, sr.strengths, sr.risks, sr.improvement_plan,
                  sr.communication_score, sr.problem_solving_score, sr.collaboration_score,
                  sr.execution_score, sr.role_skill_score, sr.evaluator_summary,
                  sr.linkedin_post, sr.messages, sr.files_shared, sr.dm_history,
                  sr.team_history, sr.agent_feedback, sr.submission, sr.rubric_scores,
                  sr.created_at,
                  t.company_name, t.title, t.role AS task_role, t.level, t.duration_type, t.scenario
                FROM skill_records sr
                LEFT JOIN tasks t ON t.id = sr.task_id
                WHERE sr.session_id = %s
                ORDER BY sr.created_at DESC
                LIMIT 1;
                """,
                (session_uuid,),
            )
            if not row:
                return None

    task = {
        "id": row["task_id"],
        "company_name": row.get("company_name"),
        "title": row.get("title"),
        "role": row.get("task_role"),
        "level": row.get("level"),
        "duration_type": row.get("duration_type"),
        "scenario": row.get("scenario"),
    }
    row["task"] = task
    return jsonable(row)


def _insert_message(
    cur,
    *,
    session_id: str,
    channel_id: str,
    sender_type: str,
    message: str,
    user_id: str | None = None,
    agent_id: str | None = None,
) -> dict[str, Any]:
    cur.execute(
        """
        INSERT INTO messages (session_id, channel_id, sender_type, user_id, agent_id, message)
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id::TEXT, session_id::TEXT, channel_id::TEXT, sender_type,
                  user_id::TEXT, agent_id::TEXT, message, created_at;
        """,
        (session_id, channel_id, sender_type, user_id, agent_id, message),
    )
    return jsonable(dict(cur.fetchone()))


def _message_payload(row: dict[str, Any]) -> dict[str, Any]:
    sender_type = row.get("sender_type")
    if sender_type == "agent":
        speaker_name = row.get("agent_name") or "Teammate"
        speaker_title = row.get("agent_role") or "Agent"
    elif sender_type == "system":
        speaker_name = "System"
        speaker_title = "Room update"
    else:
        speaker_name = row.get("user_name") or "You"
        speaker_title = "Candidate"

    return {
        **row,
        "role": sender_type,
        "speaker_name": speaker_name,
        "speaker_title": speaker_title,
        "content": row.get("message"),
    }


def _session_task_for_agent(cur, session_id: str) -> dict[str, Any] | None:
    return _fetch_one(
        cur,
        """
        SELECT
          s.id::TEXT AS session_id, s.user_id::TEXT, s.task_id::TEXT, s.status,
          t.company_name, t.title, t.role, t.level, t.duration_type, t.scenario,
          COALESCE(t.skills_tested, '{}'::TEXT[]) AS skills_tested
        FROM simulation_sessions s
        JOIN tasks t ON t.id = s.task_id
        WHERE s.id = %s;
        """,
        (session_id,),
    )


def _welcome_message(agent: dict[str, str], task: dict[str, Any]) -> str:
    name = agent["name"]
    title = task["title"]
    if name == "Asha":
        return f"For {title}, user impact, priority, and the success metric need to stay visible."
    if name == "Ravi":
        return "Engineering is watching feasibility, implementation risk, and the smallest change that can safely ship."
    if name == "Mira":
        return "Design is watching for clear frontend states, readable UX, and accessible handoff details."
    if name == "Leah":
        return "Metrics, trends, and experiment caveats need to stay honest."
    return "QA will press on edge cases, validation, and rollback before we call the work done."


def _dm_welcome_message(agent: dict[str, str], task: dict[str, Any]) -> str:
    if agent["name"] == "Asha":
        return f"DM me when you need help narrowing scope or picking the metric for {task['title']}."
    if agent["name"] == "Ravi":
        return "Send me the implementation path or risk you are worried about. I will sanity-check it."
    if agent["name"] == "Mira":
        return "Send me the user-facing state or flow. I will help make it clearer."
    if agent["name"] == "Leah":
        return "Send me the metric, dashboard, or experiment caveat. I will help tighten the evidence."
    return "Send me the test path, edge case, or rollback concern. I will poke holes in it."


def _agents_for_message(channel: dict[str, Any], agents: list[dict[str, Any]], text: str) -> list[dict[str, Any]]:
    if channel["type"] == "dm":
        return [agent for agent in agents if agent["id"] == channel["agent_id"]][:1]

    lowered = text.lower()
    if _is_greeting(lowered):
        names = [agents[0]["name"]] if agents else []
    else:
        scores = {agent["name"]: 1 for agent in agents}
        if re.search(r"\b(user|customer|priority|scope|metric|launch|tradeoff|impact|goal)\b", lowered):
            for agent in agents:
                if "product" in agent["role"].lower() or "pm" in agent["role"].lower():
                    scores[agent["name"]] += 4
        if re.search(r"\b(api|backend|frontend|code|bug|cache|queue|database|implementation)\b", lowered):
            for agent in agents:
                if "engineering" in agent["role"].lower() or "backend" in agent["role"].lower():
                    scores[agent["name"]] += 4
        if re.search(r"\b(data|metric|analytics|dashboard|sql|csv|experiment|cohort|retention|conversion|forecast|evidence)\b", lowered):
            for agent in agents:
                if "data" in agent["role"].lower() or "analyst" in agent["role"].lower():
                    scores[agent["name"]] += 5
        if re.search(r"\b(ui|ux|design|screen|copy|layout|mobile|accessibility|state)\b", lowered):
            for agent in agents:
                if "design" in agent["role"].lower() or "ux" in agent["role"].lower() or "frontend" in agent["role"].lower():
                    scores[agent["name"]] += 4
        if re.search(r"\b(test|qa|edge|rollback|validate|failure|risk|monitor|regression)\b", lowered):
            for agent in agents:
                if "qa" in agent["role"].lower() or "test" in agent["role"].lower():
                    scores[agent["name"]] += 4
        names = [name for name, _score in sorted(scores.items(), key=lambda item: item[1], reverse=True)]
        names = names[: 3 if len(text.split()) > 28 else 2]

    by_name = {agent["name"]: agent for agent in agents}
    return [by_name[name] for name in names if name in by_name]


def _is_greeting(lowered: str) -> bool:
    cleaned = re.sub(r"[^a-z\s]", "", lowered).strip()
    return cleaned in {"hi", "hello", "hey", "hey team", "hi team", "hello team"}


def _agent_reply(agent: dict[str, Any], user_text: str, task: dict[str, Any]) -> str:
    name = agent["name"]
    title = task["title"]
    scenario = task["scenario"]
    lowered = user_text.lower()
    if _is_greeting(lowered):
        if name == "Asha":
            return f"Hey, welcome in. Start with your read on {title}: what matters most for the user?"
        if name == "Ravi":
            return "Hey. Once you have a direction, send the smallest implementation path you trust."
        if name == "Mira":
            return "Hi. I am watching the frontend states, especially anything confusing on mobile or in copy."
        if name == "Leah":
            return "Hi. I will watch the metric and the caveat so we do not overclaim the evidence."
        return "Hey. I will be the annoying but useful test voice. Name the edge case early."

    if name == "Asha":
        return f"Good direction. Tie it back to impact: for {scenario.lower()} what is the one priority and metric we should protect?"
    if name == "Ravi":
        return "Implementation-wise, keep this narrow. Name the changed path, the dependency risk, and how you would roll it back."
    if name == "Mira":
        return "From the UX side, make the state obvious. What does the user see before, during, and after the fix?"
    if name == "Kenji":
        return "I would test the happy path, one failure path, and rollback. Tell me what evidence proves this is safe enough."
    if name == "Leah":
        return "From data, pick one signal we trust, explain what direction it should move, and name the caveat."
    return "Keep the next move concrete and tied to the active task."


def _evaluation_context(session_id: str, submission_text: str, workspace_snapshot: str) -> dict[str, Any]:
    with db_connection() as conn:
        with conn.cursor() as cur:
            session = _session_task_for_agent(cur, session_id)
            cur.execute(
                """
                SELECT
                  c.name AS channel_name, c.type AS channel_type,
                  m.sender_type, m.message, m.created_at,
                  a.name AS agent_name, a.role AS agent_role
                FROM messages m
                JOIN channels c ON c.id = m.channel_id
                LEFT JOIN agents a ON a.id = m.agent_id
                WHERE m.session_id = %s
                ORDER BY m.created_at ASC
                LIMIT 400;
                """,
                (session_id,),
            )
            messages = [dict(row) for row in cur.fetchall()]
            cur.execute(
                """
                SELECT file_name, file_url, visibility, target_agent_id::TEXT, created_at
                FROM uploaded_files
                WHERE session_id = %s
                ORDER BY created_at ASC
                LIMIT 80;
                """,
                (session_id,),
            )
            files = [dict(row) for row in cur.fetchall()]

    team_messages = [m for m in messages if m.get("channel_type") == "team"]
    dm_messages = [m for m in messages if m.get("channel_type") == "dm"]

    agent_feedback = {}
    for agent_name in ["Asha", "Ravi", "Mira", "Kenji"]:
        agent_msgs = [m for m in messages if m.get("agent_name") == agent_name]
        if agent_msgs:
            agent_feedback[agent_name] = {
                "message_count": len(agent_msgs),
                "last_message": agent_msgs[-1].get("message", "") if agent_msgs else "",
            }

    rubric_scores = {
        "leadership": 0,
        "communication": 0,
        "ownership": 0,
        "prioritization": 0,
        "adaptability": 0,
        "technicalDepth": 0,
    }

    return jsonable(
        {
            "session": session,
            "messages": messages,
            "files": files,
            "submission_text": submission_text,
            "workspace_snapshot": workspace_snapshot,
            "team_history": team_messages,
            "dm_history": dm_messages,
            "agent_feedback": agent_feedback,
            "rubric_scores": rubric_scores,
        }
    )


def _words(text: str) -> list[str]:
    return re.findall(r"[a-zA-Z][a-zA-Z0-9_-]*", text.lower())


def _keyword_hits(text: str, terms: list[str]) -> int:
    lowered = text.lower()
    return sum(1 for term in terms if term in lowered)


def _generate_skill_record(context: dict[str, Any]) -> dict[str, Any]:
    session = context["session"]
    messages = context["messages"]
    submission = context["submission_text"]
    workspace_snapshot = context.get("workspace_snapshot") or ""
    user_messages = [m for m in messages if m.get("sender_type") == "user"]
    agent_messages = [m for m in messages if m.get("sender_type") == "agent"]
    user_text = "\n".join(m.get("message") or "" for m in user_messages)
    combined = "\n".join([user_text, submission, workspace_snapshot])
    words = _words(combined)
    submission_words = _words(submission)
    meaningful_user_messages = [m for m in user_messages if len(_words(m.get("message") or "")) >= 4 and not _is_greeting((m.get("message") or "").lower())]
    channels_used = {m.get("channel_name") for m in user_messages if m.get("channel_name")}
    uploaded_count = len(context.get("files") or [])
    team_history = context.get("team_history", [])
    dm_history = context.get("dm_history", [])
    agent_feedback = context.get("agent_feedback", {})
    rubric_scores = context.get("rubric_scores", {})

    concrete_terms = [
        "because",
        "tradeoff",
        "metric",
        "test",
        "validate",
        "rollback",
        "risk",
        "owner",
        "priority",
        "user",
        "customer",
        "ship",
        "monitor",
        "edge",
        "success",
    ]
    role_terms = {
        "frontend": ["state", "ui", "accessibility", "loading", "component", "mobile"],
        "backend": ["api", "database", "queue", "cache", "idempotent", "latency", "retry"],
        "pm": ["priority", "metric", "scope", "tradeoff", "launch", "stakeholder"],
        "data_analyst": ["metric", "cohort", "sql", "segment", "experiment", "dashboard"],
        "designer": ["ux", "layout", "copy", "accessibility", "flow", "prototype"],
    }.get(session.get("role"), [])

    concrete_hit_score = min(28, _keyword_hits(combined, concrete_terms) * 3)
    role_hit_score = min(30, _keyword_hits(combined, role_terms) * 5)
    message_score = min(24, len(meaningful_user_messages) * 6)
    submission_score = min(34, len(submission_words) * 0.9)
    channel_score = min(18, len(channels_used) * 6)
    upload_score = min(8, uploaded_count * 4)

    communication = _clamp(10 + message_score + min(20, len(words) * 0.08) + _keyword_hits(combined, ["because", "tradeoff", "owner", "next"]) * 4)
    problem_solving = _clamp(8 + submission_score + concrete_hit_score)
    collaboration = _clamp(8 + message_score + channel_score + min(12, len(agent_messages) * 1.5))
    execution = _clamp(6 + submission_score + _keyword_hits(combined, ["ship", "test", "validate", "rollback", "monitor", "owner"]) * 5 + upload_score)
    role_skill = _clamp(8 + role_hit_score + min(22, len(submission_words) * 0.45) + _keyword_hits(combined, [session.get("title", "").lower()[:20]]) * 2)

    only_greeting = not submission_words and not meaningful_user_messages
    if only_greeting:
        communication, problem_solving, collaboration, execution, role_skill = 12, 5, 10, 3, 5
    elif len(submission_words) < 18:
        problem_solving = min(problem_solving, 38)
        execution = min(execution, 34)
        role_skill = min(role_skill, 42)
    elif len(submission_words) < 45:
        execution = min(execution, 58)

    overall = _clamp((communication + problem_solving + collaboration + execution + role_skill) / 5)

    strengths = _strengths(overall, communication, problem_solving, collaboration, execution, role_skill)
    risks = _risks(overall, submission_words, meaningful_user_messages, concrete_hit_score)
    improvement_plan = _improvement_plan(overall, session.get("role"))

    title = session.get("title") or "DayZero simulation"
    company = session.get("company_name") or "DayZero"
    summary = (
        f"Submitted work for {company}'s {title} scored {overall}/100 based on saved chat activity, "
        f"final submission detail, channel usage, and uploaded evidence."
    )
    if overall < 25:
        summary = (
            f"The session for {company}'s {title} had very little usable work. The score is intentionally low "
            "because the saved activity and final submission did not show a concrete plan."
        )

    evaluator_summary = (
        f"An evaluation process reviewed {len(user_messages)} user message(s), {len(agent_messages)} agent reply/observation(s), "
        f"{uploaded_count} uploaded file(s), and the final submission. This SkillRecord was saved once after submission."
    )

    linkedin_post = (
        f"I completed a DayZero work simulation for {company}: {title}. "
        f"SkillRecord score: {overall}/100. Key focus: {', '.join(strengths[:2])}. "
        "I practiced making decisions with AI teammates across product, engineering, design, and QA."
    )
    if overall < 40:
        linkedin_post = (
            f"I attempted a DayZero work simulation for {company}: {title}. "
            "The SkillRecord showed clear gaps, especially around submitting a concrete plan and validation evidence. "
            "Next step: practice writing a sharper handoff before sharing this publicly."
        )

    return {
        "session_id": session["session_id"],
        "user_id": session.get("user_id"),
        "task_id": session["task_id"],
        "role": session.get("role"),
        "overall_score": overall,
        "summary": summary,
        "strengths": strengths,
        "risks": risks,
        "improvement_plan": improvement_plan,
        "communication_score": communication,
        "problem_solving_score": problem_solving,
        "collaboration_score": collaboration,
        "execution_score": execution,
        "role_skill_score": role_skill,
        "evaluator_summary": evaluator_summary,
        "linkedin_post": linkedin_post,
        "messages": messages[:100],
        "files_shared": context.get("files", [])[:50],
        "dm_history": dm_history[:50],
        "team_history": team_history[:100],
        "agent_feedback": agent_feedback,
        "submission": submission,
        "rubric_scores": rubric_scores,
    }


def _clamp(value: float) -> int:
    return max(0, min(100, round(value)))


def _strengths(overall: int, communication: int, problem_solving: int, collaboration: int, execution: int, role_skill: int) -> list[str]:
    strengths = []
    if communication >= 60:
        strengths.append("Communicated decisions and context clearly in the room.")
    if problem_solving >= 60:
        strengths.append("Connected the solution to concrete risks and tradeoffs.")
    if collaboration >= 60:
        strengths.append("Used team and DM channels to gather role-specific input.")
    if execution >= 60:
        strengths.append("Provided a practical handoff with validation or rollout details.")
    if role_skill >= 60:
        strengths.append("Showed role-relevant thinking for the selected task.")
    if not strengths:
        strengths.append("Started the simulation and created an initial record of activity.")
    if overall < 30:
        strengths = strengths[:1]
    return strengths[:4]


def _risks(overall: int, submission_words: list[str], meaningful_messages: list[dict[str, Any]], concrete_hit_score: int) -> list[str]:
    risks = []
    if not submission_words:
        risks.append("Final submission was empty, so execution evidence is missing.")
    if len(submission_words) < 35:
        risks.append("Final answer needs more concrete detail, sequencing, and ownership.")
    if not meaningful_messages:
        risks.append("Chat activity did not show enough collaboration beyond basic messages.")
    if concrete_hit_score < 12:
        risks.append("Validation, rollback, metric, or user-impact evidence was too thin.")
    if overall >= 70:
        risks.append("Could still sharpen the tradeoff and launch-readiness language.")
    return risks[:4]


def _improvement_plan(overall: int, role: str | None) -> list[str]:
    role_tip = {
        "frontend": "Name the exact UI state, component risk, and accessibility check.",
        "backend": "Name the API/data path, failure mode, retry behavior, and rollback trigger.",
        "pm": "Name the priority, metric, tradeoff, stakeholder impact, and launch call.",
        "data_analyst": "Name the metric definition, segment, caveat, and recommended action.",
        "designer": "Name the user flow, confusing state, accessibility issue, and handoff detail.",
    }.get(role or "", "Name the decision, evidence, risk, and next owner.")
    if overall < 30:
        return [
            "Write a real final handoff before submitting.",
            "Ask at least two role-specific teammates for input.",
            role_tip,
            "Include one validation step and one risk you are intentionally accepting.",
        ]
    return [
        "Make the first decision explicit in the opening lines.",
        role_tip,
        "Add one measurable success signal and one rollback or follow-up trigger.",
        "Use DM channels when a specialist can unblock a specific risk.",
    ]


def _insert_skill_record(record: dict[str, Any]) -> dict[str, Any]:
    with db_connection() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO skill_records (
                  session_id, user_id, task_id, role, overall_score, summary,
                  strengths, risks, improvement_plan, communication_score,
                  problem_solving_score, collaboration_score, execution_score,
                  role_skill_score, evaluator_summary, linkedin_post,
                  messages, files_shared, dm_history, team_history,
                  agent_feedback, submission, rubric_scores
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING
                  id::TEXT, session_id::TEXT, user_id::TEXT, task_id::TEXT,
                  overall_score, summary, strengths, risks, improvement_plan,
                  communication_score, problem_solving_score, collaboration_score,
                  execution_score, role_skill_score, evaluator_summary,
                  linkedin_post, messages, files_shared, dm_history, team_history,
                  agent_feedback, submission, rubric_scores, created_at;
                """,
                (
                    record["session_id"],
                    record.get("user_id"),
                    record["task_id"],
                    record.get("role"),
                    record["overall_score"],
                    record["summary"],
                    record["strengths"],
                    record["risks"],
                    record["improvement_plan"],
                    record["communication_score"],
                    record["problem_solving_score"],
                    record["collaboration_score"],
                    record["execution_score"],
                    record["role_skill_score"],
                    record["evaluator_summary"],
                    record["linkedin_post"],
                    Json(record.get("messages", [])),
                    Json(record.get("files_shared", [])),
                    Json(record.get("dm_history", [])),
                    Json(record.get("team_history", [])),
                    Json(record.get("agent_feedback", {})),
                    record.get("submission", ""),
                    Json(record.get("rubric_scores", {})),
                ),
            )
            row = dict(cur.fetchone())
    return jsonable(row)
