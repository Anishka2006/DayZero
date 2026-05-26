"""
Database Models for DayZero Two-Sided Marketplace

- Recruiters: Post projects, view candidates
- Candidates: Browse projects, complete simulations, get SkillRecords
- Projects: Real work scenarios from recruiters
- Experts: Real humans evaluating SkillRecords
- AI Agents: Simulate teammates
"""

from datetime import datetime
from typing import Optional, List
from enum import Enum

# ============================================================
# ENUMS
# ============================================================

class ProjectStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ACTIVE = "active"
    CLOSED = "closed"

class SimulationStatus(str, Enum):
    STARTED = "started"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    EVALUATING = "evaluating"
    COMPLETED = "completed"
    EXPIRED = "expired"

class SkillRecordStatus(str, Enum):
    DRAFT = "draft"
    PENDING_EXPERT_REVIEW = "pending_expert_review"
    REVIEWED = "reviewed"
    VERIFIED = "verified"

# ============================================================
# RECRUITER & PROJECT MODELS
# ============================================================

class Recruiter:
    """A recruiter/hiring manager who posts projects"""
    _id: str
    email: str
    company: str
    name: str
    avatar: str
    created_at: datetime
    
    # Projects they've posted
    projects: List[str]  # List of project IDs


class Project:
    """A real work scenario posted by a recruiter"""
    _id: str
    recruiter_id: str
    
    # Basic info
    title: str
    description: str
    company: str
    role: str  # PM, Engineer, Designer, QA, Data
    
    # Task details
    problem_statement: str
    requirements: List[str]
    workspace_files: List[dict]
    duration_minutes: int
    difficulty: str  # "Beginner", "Intermediate", "Advanced"
    
    # Expert assignment
    expert_id: str  # Real person evaluating this project's submissions
    expert_name: str
    expert_title: str
    
    # AI Teammates (default if not customized)
    teammates: List[dict]  # AI agent configurations
    
    # Metadata
    status: ProjectStatus
    created_at: datetime
    published_at: Optional[datetime]
    
    # Recruiting info
    open_positions: int
    target_skills: List[str]
    
    # Statistics
    total_submissions: int
    qualified_candidates: int  # Score >= 70


class ProjectAnalytics:
    """Analytics for each project"""
    project_id: str
    total_started: int
    total_completed: int
    completion_rate: float
    average_score: float
    score_distribution: dict  # {60-70: 5, 70-80: 12, 80-90: 8, 90+: 3}
    top_candidates: List[str]  # Top 5 candidate IDs with scores


# ============================================================
# CANDIDATE & SIMULATION MODELS
# ============================================================

class Candidate:
    """A candidate using DayZero"""
    _id: str
    email: str
    name: str
    avatar: str
    resume_url: Optional[str]
    target_role: str
    
    created_at: datetime
    
    # Simulation history
    simulations: List[str]  # List of simulation IDs
    skillrecords: List[str]  # List of SkillRecord IDs


class Simulation:
    """A candidate attempting a recruiter's project"""
    _id: str
    candidate_id: str
    project_id: str
    
    # Session info
    status: SimulationStatus
    started_at: datetime
    submitted_at: Optional[datetime]
    completed_at: Optional[datetime]
    
    # Time tracking
    duration_seconds: int
    days_completed: int  # 0-5
    
    # Workspace & work
    workspace_state: dict  # Current files and state
    submission_text: str
    submission_files: List[dict]
    
    # Interaction history
    messages: List[dict]  # Chat history with AI teammates
    timeline: List[dict]  # Key events during simulation
    
    # Expert assigned
    expert_id: str  # Real human evaluating this submission
    
    # Scores (incremental, filled as evaluation progresses)
    layer1_ai_scores: Optional[dict]  # AI Scoring
    layer2_teammate_ratings: Optional[dict]  # AI Teammate Feedback
    layer3_expert_review: Optional[dict]  # Real Expert Assessment
    
    overall_score: Optional[int]  # 0-100


class SimulationMessage:
    """A message in the simulation (candidate or AI teammate)"""
    _id: str
    simulation_id: str
    
    speaker_type: str  # "candidate", "designer", "engineer", "qa", "pm"
    speaker_name: str
    message: str
    
    created_at: datetime
    channel: str  # "team" or "dm:{agent_name}"


# ============================================================
# EVALUATION & SKILLRECORD MODELS
# ============================================================

class SkillRecord:
    """The final credential generated from a simulation"""
    _id: str
    simulation_id: str
    candidate_id: str
    project_id: str
    expert_id: str
    
    # Identification
    status: SkillRecordStatus
    record_number: str  # e.g., "SR-2026-05-001"
    
    # Task context
    task: dict  # {title, role, company, duration}
    
    # 3-Layer Evaluation
    evaluation: dict
        # layer1_ai_score
        # layer2_teammate_feedback
        # layer3_expert_review
    
    overall_score: int  # 0-100
    hiring_recommendation: str  # "Strong Hire", "Hire", "Lean Hire", "No Hire"
    
    # Skills breakdown
    skills: dict  # {problem_solving: 85, communication: 78, ...}
    
    # Evidence
    summary: str
    strengths: List[str]
    weaknesses: List[str]
    evidence: List[str]
    
    # Portability
    public_url: str  # Shareable link
    verification_token: str  # For third-party verification
    is_verified: bool
    verified_at: Optional[datetime]
    
    # Timestamps
    created_at: datetime
    expert_reviewed_at: Optional[datetime]


class ExpertReview:
    """Real expert evaluation of a SkillRecord"""
    _id: str
    expert_id: str
    skillrecord_id: str
    simulation_id: str
    
    # Expert assessment (Layer 3)
    behavioral_signal: int  # 0-100
    pressure_handling: int
    communication_quality: int
    risk_awareness: int
    
    expert_summary: str  # Written assessment
    expert_notes: str  # Internal notes
    
    hiring_recommendation: str
    confidence_level: str  # "High", "Medium", "Low"
    
    created_at: datetime
    reviewed_at: datetime


# ============================================================
# EXPERT MANAGEMENT
# ============================================================

class Expert:
    """A real person evaluating SkillRecords"""
    _id: str
    email: str
    name: str
    title: str
    company: str
    
    # Expertise
    roles: List[str]  # Roles they can evaluate: ["PM", "Engineer", "Designer"]
    bio: str
    
    # Performance tracking
    projects_assigned: List[str]
    skillrecords_reviewed: int
    average_review_quality: float
    
    # Account
    is_active: bool
    created_at: datetime


# ============================================================
# AI AGENT MODELS
# ============================================================

class AITeammate:
    """Configuration for AI agent in a simulation"""
    _id: str
    project_id: str
    
    role: str  # "Designer", "Engineer", "QA", "PM"
    name: str
    avatar: str
    title: str
    bio: str
    
    # Agent behavior
    personality_tokens: List[str]
    expertise_focus: List[str]
    response_style: str  # "collaborative", "critical", "technical", "strategic"
    
    # Model config
    llm_model: str  # "gpt-4", "gpt-3.5", etc.
    temperature: float
    max_tokens: int
    
    created_at: datetime


# ============================================================
# IMPORTANT: DATABASE IMPLEMENTATION NOTES
# ============================================================

"""
USE MONGODB for this architecture because:

1. Flexible schema (projects vary by role)
2. Nested documents (simulation with messages array)
3. Easy scaling for millions of simulations
4. Good for time-series data (messages, timeline)

Collections needed:
- recruiters
- projects
- project_analytics
- candidates
- simulations
- simulation_messages
- skillrecords
- expert_reviews
- experts
- ai_teammates

Indexes:
- projects.recruiter_id (find recruiter's projects)
- projects.status (find published projects)
- projects.expert_id (find projects assigned to expert)
- simulations.candidate_id (find candidate's simulations)
- simulations.project_id (find submissions for a project)
- simulations.status (find in-progress simulations)
- simulations.expert_id (find submissions for expert)
- skillrecords.expert_id (find expert's SkillRecords)
- skillrecords.public_url (verify SkillRecords)
"""
