const API_BASE_URL = window.API_BASE_URL || "https://dayzero-backend-0n1y.onrender.com";
const WORKSPACE_FILES_MODULE_PATH = "../../../workspaceFiles.js";

const STORAGE_KEYS = {
  selectedMission: "dayzeroSelectedMissionKey",
  dashboardTask: "dayzero_task_id",
  selectedTaskDetails: "dayzero_selected_task_details",
  sessionPrefix: "dayzeroSimulationSession::",
  workspacePrefix: "dayzeroWorkspaceState::",
  timelinePrefix: "dayzeroTimelineState::",
  report: "lastEvaluationReport",
};

let workspaceFilesModulePromise = null;

function loadWorkspaceFilesModule() {
  if (window.getWorkspaceFiles || window.WORKSPACE_FILES) {
    return Promise.resolve({
      default: window.WORKSPACE_FILES || {},
      WORKSPACE_FILES: window.WORKSPACE_FILES || {},
      getWorkspaceFiles: window.getWorkspaceFiles,
    });
  }

  if (!workspaceFilesModulePromise) {
    workspaceFilesModulePromise = import(WORKSPACE_FILES_MODULE_PATH).catch((error) => {
      console.warn("Could not load workspaceFiles.js", error);
      workspaceFilesModulePromise = null;
      return null;
    });
  }
  return workspaceFilesModulePromise;
}

function normalizeWorkspaceFiles(files) {
  return (Array.isArray(files) ? files : [])
    .filter((file) => file && typeof file === "object")
    .map((file, index) => ({
      id: file.id || `file-${index}`,
      name: file.name || "Untitled",
      kind: file.type || file.kind || "code",
      content: file.content || "",
      language: file.language || "text",
    }));
}

function attachWorkspaceFilesToTaskDefinitions(fileMap) {
  if (!fileMap || typeof fileMap !== "object") {
    return false;
  }

  let attached = false;
  Object.values(TASKS).forEach((levels) => {
    Object.values(levels).forEach((tasks) => {
      tasks.forEach((task) => {
        const workspaceFiles = normalizeWorkspaceFiles(fileMap[task.id]);
        if (workspaceFiles.length) {
          task.workspaceFiles = workspaceFiles;
          task.files = workspaceFiles.map((file) => file.name);
          attached = true;
        }
      });
    });
  });
  return attached;
}

async function hydrateSimulationWorkspaceFiles() {
  const mod = await loadWorkspaceFilesModule();
  const fileMap = (mod && (mod.default || mod.WORKSPACE_FILES)) || window.WORKSPACE_FILES || null;
  attachWorkspaceFilesToTaskDefinitions(fileMap);
}

async function taskPayloadWithWorkspaceFiles(task) {
  if (!task) {
    return null;
  }

  if (Array.isArray(task.workspaceFiles) && task.workspaceFiles.length) {
    return task;
  }

  const mod = await loadWorkspaceFilesModule();
  const getter = (mod && mod.getWorkspaceFiles) || window.getWorkspaceFiles;
  const workspaceFiles = normalizeWorkspaceFiles(getter ? getter(task.id) : []);
  if (!workspaceFiles.length) {
    return task;
  }

  return {
    ...task,
    files: workspaceFiles.map((file) => file.name),
    workspaceFiles,
  };
}

const TASKS = {
  "Frontend": {
    "Beginner": [
      {
        id: "frontend-homeflow",
        company: "Shoply",
        logo: "S",
        label: "Shoply Onboarding UI",
        title: "Checkout Flow Improvements",
        description: "Optimize the checkout screen for faster conversions and smoother input validation.",
        role: "Frontend",
        time: "45 mins",
        difficulty: "Medium",
        teamSize: "3",
        skills: ["React UI", "Accessibility", "Form validation"]
      },
      {
        id: "frontend-dashboard",
        company: "Pulse",
        logo: "P",
        label: "Pulse Analytics Panel",
        title: "Dashboard Performance Fix",
        description: "Find the slow rendering issue in the analytics widget and make it fast for mobile users.",
        role: "Frontend",
        time: "35 mins",
        difficulty: "Beginner",
        teamSize: "2",
        skills: ["Performance", "CSS", "Debugging"]
      }
    ],
    "Intermediate": [
      {
        id: "frontend-product",
        company: "Wave",
        logo: "W",
        label: "Wave Product Launch",
        title: "Interactive Feature Banner",
        description: "Build a launch banner that updates dynamically based on user segment and AB test status.",
        role: "Frontend",
        time: "55 mins",
        difficulty: "Medium",
        teamSize: "4",
        skills: ["Component design", "State management", "A/B testing"]
      },
      {
        id: "frontend-accessibility",
        company: "Nexa",
        logo: "N",
        label: "Nexa Accessibility Audit",
        title: "Upgrade Keyboard Navigation",
        description: "Improve the app's keyboard and screen reader support for the main content flow.",
        role: "Frontend",
        time: "1 hour",
        difficulty: "Intermediate",
        teamSize: "3",
        skills: ["Accessibility", "UI/UX", "Documentation"]
      }
    ],
    "Advanced": [
      {
        id: "frontend-spa",
        company: "Astra",
        logo: "A",
        label: "Astra SPA Migration",
        title: "Migrate Widget to Single Page App",
        description: "Lead the frontend migration of a legacy widget into the new SPA shell without interrupting users.",
        role: "Frontend",
        time: "5 days",
        difficulty: "High",
        teamSize: "5",
        skills: ["Architecture", "Performance", "Release planning"]
      },
      {
        id: "frontend-visual",
        company: "Lumen",
        logo: "L",
        label: "Lumen Visual Refresh",
        title: "Revamp the Design System",
        description: "Execute a polished refresh of core UI components while preserving existing branding.",
        role: "Frontend",
        time: "5 days",
        difficulty: "Advanced",
        teamSize: "5",
        skills: ["Design system", "Component library", "Cross-team alignment"]
      }
    ]
  },
  "Backend": {
    "Beginner": [
      {
        id: "backend-api-health",
        company: "Orbit",
        logo: "O",
        label: "Orbit API Health",
        title: "Debug the API timeout path",
        description: "Investigate the outage in the public API and restore healthy responses fast.",
        role: "Backend",
        time: "40 mins",
        difficulty: "Medium",
        teamSize: "3",
        skills: ["Debugging", "Metrics", "API stability"]
      },
      {
        id: "backend-cache",
        company: "Beacon",
        logo: "B",
        label: "Beacon Cache Fix",
        title: "Stabilize the cache layer",
        description: "Resolve stale read issues with the cache invalidation strategy and document the behavior.",
        role: "Backend",
        time: "50 mins",
        difficulty: "Beginner",
        teamSize: "3",
        skills: ["Caching", "Data consistency", "Logging"]
      }
    ],
    "Intermediate": [
      {
        id: "backend-auth",
        company: "Forge",
        logo: "F",
        label: "Forge Auth Harden",
        title: "Stabilize the Login Service",
        description: "Fix the login retry flow so valid users can recover without getting blocked.",
        role: "Backend",
        time: "1 hour",
        difficulty: "Medium",
        teamSize: "4",
        skills: ["Session handling", "API design", "Reliability"]
      },
      {
        id: "backend-queue",
        company: "Altitude",
        logo: "A",
        label: "Altitude Queue Repair",
        title: "Recover the job queue",
        description: "Fix message ordering and retry behavior for the background worker pipeline.",
        role: "Backend",
        time: "55 mins",
        difficulty: "Intermediate",
        teamSize: "4",
        skills: ["Queueing", "Resiliency", "Testing"]
      }
    ],
    "Advanced": [
      {
        id: "backend-migration",
        company: "Crimson",
        logo: "C",
        label: "Crimson DB Migration",
        title: "Plan a safe schema change",
        description: "Plan a database change that preserves user flows while the team updates the schema.",
        role: "Backend",
        time: "5 days",
        difficulty: "High",
        teamSize: "5",
        skills: ["Database", "Release planning", "Rollback planning"]
      },
      {
        id: "backend-scaling",
        company: "Nimbus",
        logo: "N",
        label: "Nimbus Scale Event",
        title: "Build automatic scaling safeguards",
        description: "Create backend spike-handling rules that protect users during traffic surges.",
        role: "Backend",
        time: "5 days",
        difficulty: "Advanced",
        teamSize: "5",
        skills: ["Scalability", "Queue pressure", "Incident readiness"]
      }
    ]
  },
  "Product Manager": {
    "Beginner": [
      {
        id: "pm-priority",
        company: "Pulse",
        logo: "P",
        label: "Pulse Feature Prioritization",
        title: "Define the next sprint scope",
        description: "Review customer feedback and decide which features must ship first for the upcoming release.",
        role: "Product Manager",
        time: "45 mins",
        difficulty: "Medium",
        teamSize: "3",
        skills: ["Prioritization", "Stakeholder alignment", "Roadmapping"]
      },
      {
        id: "pm-metrics",
        company: "Beacon",
        logo: "B",
        label: "Beacon Metrics Review",
        title: "Validate launch KPIs",
        description: "Audit the product metrics dashboard and confirm the leading indicators for success.",
        role: "Product Manager",
        time: "40 mins",
        difficulty: "Beginner",
        teamSize: "3",
        skills: ["Metrics", "Analysis", "Communication"]
      }
    ],
    "Intermediate": [
      {
        id: "pm-goals",
        company: "Nexa",
        logo: "N",
        label: "Nexa GTM Plan",
        title: "Create a go-to-market brief",
        description: "Draft the launch plan and stakeholder messaging for a new mobile product.",
        role: "Product Manager",
        time: "1 hour",
        difficulty: "Medium",
        teamSize: "4",
        skills: ["Launch planning", "User research", "Communication"]
      },
      {
        id: "pm-feedback",
        company: "Lumen",
        logo: "L",
        label: "Lumen Feedback Loop",
        title: "Turn customer insights into action",
        description: "Translate qualitative user feedback into clear product changes and a follow-up plan.",
        role: "Product Manager",
        time: "55 mins",
        difficulty: "Intermediate",
        teamSize: "4",
        skills: ["Customer insight", "Prioritization", "Roadmap"]
      }
    ],
    "Advanced": [
      {
        id: "pm-strategy",
        company: "Astra",
        logo: "A",
        label: "Astra Strategy Sprint",
        title: "Set the next quarter strategy",
        description: "Define a compelling product strategy and leadership narrative for the upcoming quarter.",
        role: "Product Manager",
        time: "5 days",
        difficulty: "High",
        teamSize: "5",
        skills: ["Strategy", "Leadership", "Narrative"]
      },
      {
        id: "pm-launch",
        company: "Wave",
        logo: "W",
        label: "Wave Launch Execution",
        title: "Lead cross-functional launch readiness",
        description: "Ensure engineering, design, and marketing are aligned for a successful feature release.",
        role: "Product Manager",
        time: "5 days",
        difficulty: "Advanced",
        teamSize: "5",
        skills: ["Coordination", "Execution", "Risk management"]
      }
    ]
  },
  "Data Analyst": {
    "Beginner": [
      {
        id: "data-adhoc",
        company: "Orbit",
        logo: "O",
        label: "Orbit Ad-hoc Analysis",
        title: "Answer a growth question",
        description: "Produce a quick analysis of conversion and retention for the latest campaign.",
        role: "Data Analyst",
        time: "45 mins",
        difficulty: "Medium",
        teamSize: "3",
        skills: ["SQL", "Data storytelling", "Reporting"]
      },
      {
        id: "data-dashboard",
        company: "Forge",
        logo: "F",
        label: "Forge Reporting Update",
        title: "Clean up the metrics dashboard",
        description: "Fix metric definitions and clarify the dashboard for product and growth stakeholders.",
        role: "Data Analyst",
        time: "40 mins",
        difficulty: "Beginner",
        teamSize: "3",
        skills: ["Dashboarding", "Metrics", "Documentation"]
      }
    ],
    "Intermediate": [
      {
        id: "data-model",
        company: "Nimbus",
        logo: "N",
        label: "Nimbus Data Model",
        title: "Validate the reporting pipeline",
        description: "Audit the event model and ensure analytics are accurate for the product dashboard.",
        role: "Data Analyst",
        time: "1 hour",
        difficulty: "Medium",
        teamSize: "4",
        skills: ["Data modeling", "Validation", "Stakeholder sync"]
      },
      {
        id: "data-experiment",
        company: "Lumen",
        logo: "L",
        label: "Lumen Experiment",
        title: "Design a measurement plan",
        description: "Define the success metrics for a new retention experiment and present the analysis approach.",
        role: "Data Analyst",
        time: "55 mins",
        difficulty: "Intermediate",
        teamSize: "4",
        skills: ["Experimentation", "Analysis", "Communication"]
      }
    ],
    "Advanced": [
      {
        id: "data-forecast",
        company: "Crimson",
        logo: "C",
        label: "Crimson Forecast",
        title: "Build the next quarter forecast",
        description: "Develop a data-driven plan for revenue and retention that the executive team can trust.",
        role: "Data Analyst",
        time: "5 days",
        difficulty: "High",
        teamSize: "5",
        skills: ["Forecasting", "Executive reporting", "Scenario analysis"]
      },
      {
        id: "data-scaling",
        company: "Astra",
        logo: "A",
        label: "Astra Data Scale",
        title: "Scale analytics for growth",
        description: "Design the analytics controls needed to support a platform scaling from 100k to 1M users.",
        role: "Data Analyst",
        time: "5 days",
        difficulty: "Advanced",
        teamSize: "5",
        skills: ["Scale", "Data governance", "Architecture"]
      }
    ]
  },
  "Designer": {
    "Beginner": [
      {
        id: "design-prototype",
        company: "Wave",
        logo: "W",
        label: "Wave Microcopy Audit",
        title: "Improve the mobile signup flow",
        description: "Refine the screens and microcopy for a smoother onboarding experience.",
        role: "Product Designer",
        time: "45 mins",
        difficulty: "Beginner",
        teamSize: "3",
        skills: ["UX", "Copy", "Visual polish"]
      },
      {
        id: "design-style",
        company: "Pulse",
        logo: "P",
        label: "Pulse Style Update",
        title: "Refresh the product card library",
        description: "Align the existing cards with the brand system and improve legibility.",
        role: "Product Designer",
        time: "40 mins",
        difficulty: "Medium",
        teamSize: "3",
        skills: ["Design systems", "Brand", "UI"]
      }
    ],
    "Intermediate": [
      {
        id: "design-research",
        company: "Nexa",
        logo: "N",
        label: "Nexa User Research",
        title: "Synthesize feedback into design changes",
        description: "Collect user insights and turn them into actionable UI improvements.",
        role: "Product Designer",
        time: "1 hour",
        difficulty: "Medium",
        teamSize: "4",
        skills: ["Research", "Synthesis", "Wireframing"]
      },
      {
        id: "design-dashboard-prototype",
        company: "Lumen",
        logo: "L",
        label: "Lumen Prototype",
        title: "Prototype a new dashboard interaction",
        description: "Design and prototype a richer interaction for the metrics dashboard.",
        role: "Product Designer",
        time: "55 mins",
        difficulty: "Intermediate",
        teamSize: "4",
        skills: ["Interaction", "Prototyping", "Testing"]
      }
    ],
    "Advanced": [
      {
        id: "design-system",
        company: "Astra",
        logo: "A",
        label: "Astra Design System",
        title: "Lead the component library overhaul",
        description: "Drive a brand-consistent system upgrade across web and mobile interfaces.",
        role: "Product Designer",
        time: "5 days",
        difficulty: "High",
        teamSize: "5",
        skills: ["Design systems", "Leadership", "Cross-platform"]
      },
      {
        id: "design-ops",
        company: "Crimson",
        logo: "C",
        label: "Crimson Design Ops",
        title: "Create a design delivery framework",
        description: "Establish the process and tooling for faster, higher quality design handoffs.",
        role: "Product Designer",
        time: "5 days",
        difficulty: "Advanced",
        teamSize: "5",
        skills: ["Process", "Collaboration", "Quality"]
      }
    ]
  },
  "QA Engineer": {
    "Beginner": [
      {
        id: "qa-checkout-regression",
        company: "Shoply",
        logo: "S",
        label: "Shoply Regression Room",
        title: "Validate checkout recovery",
        description: "Find the riskiest checkout edge cases and decide what blocks release.",
        role: "QA Engineer",
        time: "40 mins",
        difficulty: "Beginner",
        teamSize: "4",
        skills: ["Regression testing", "Bug triage", "Release safety"]
      },
      {
        id: "qa-onboarding-mobile",
        company: "Wave",
        logo: "W",
        label: "Wave Mobile QA",
        title: "Test mobile onboarding under pressure",
        description: "Validate confusing onboarding states before a same-day product review.",
        role: "QA Engineer",
        time: "45 mins",
        difficulty: "Medium",
        teamSize: "4",
        skills: ["Mobile QA", "Edge cases", "Communication"]
      }
    ],
    "Intermediate": [
      {
        id: "qa-release-blocker",
        company: "Beacon",
        logo: "B",
        label: "Beacon Release Gate",
        title: "Investigate a release blocker",
        description: "QA found inconsistent recovery behavior. Work with the team to decide ship, hold, or narrow.",
        role: "QA Engineer",
        time: "55 mins",
        difficulty: "Intermediate",
        teamSize: "5",
        skills: ["Release blocking", "Validation strategy", "Risk communication"]
      },
      {
        id: "qa-analytics-mismatch",
        company: "Pulse",
        logo: "P",
        label: "Pulse Metrics QA",
        title: "Validate analytics mismatch",
        description: "Events are firing inconsistently and product needs confidence before quoting the numbers.",
        role: "QA Engineer",
        time: "1 hour",
        difficulty: "Medium",
        teamSize: "4",
        skills: ["Data QA", "Reproduction", "Stakeholder updates"]
      }
    ],
    "Advanced": [
      {
        id: "qa-sprint-signoff",
        company: "Astra",
        logo: "A",
        label: "Astra Signoff Sprint",
        title: "Lead release signoff under pressure",
        description: "Coordinate QA evidence, open risks, and team tradeoffs before a high-visibility release.",
        role: "QA Engineer",
        time: "5 days",
        difficulty: "Advanced",
        teamSize: "5",
        skills: ["Release judgment", "Risk ownership", "Cross-functional collaboration"]
      },
      {
        id: "qa-support-spike",
        company: "Lumen",
        logo: "L",
        label: "Lumen Support Spike",
        title: "Triage customer-reported failures",
        description: "Support tickets are rising after a rollout. Separate real regressions from noise and guide the room.",
        role: "QA Engineer",
        time: "5 days",
        difficulty: "High",
        teamSize: "5",
        skills: ["Bug triage", "Customer impact", "Escalation handling"]
      }
    ]
  }
};

TASKS["Frontend Engineer"] = TASKS.Frontend;
TASKS["Backend Engineer"] = TASKS.Backend;
TASKS["Product Designer"] = TASKS.Designer;

const AGENT_PROFILES = [
  {
    id: "pm",
    dmKey: "asha",
    name: "Asha",
    title: "Product Manager",
    kind: "pm",
    avatar: "A",
    lane: "product scope, priority, user impact, business impact, and stakeholder updates",
  },
  {
    id: "backend",
    dmKey: "ravi",
    name: "Ravi",
    title: "Engineering Lead",
    kind: "eng",
    avatar: "R",
    lane: "backend logic, APIs, feasibility, data flow, scaling risk, and rollback",
  },
  {
    id: "designer",
    dmKey: "mira",
    name: "Mira",
    title: "Product Designer",
    kind: "design",
    avatar: "M",
    lane: "UX clarity, onboarding friction, accessibility, visual consistency, and customer confusion",
  },
  {
    id: "qa",
    dmKey: "kenji",
    name: "Kenji",
    title: "QA Engineer",
    kind: "qa",
    avatar: "K",
    lane: "bugs, edge cases, testing, rollback risk, and release proof",
  },
  {
    id: "data",
    dmKey: "leah",
    name: "Leah",
    title: "Data Analyst",
    kind: "data",
    avatar: "L",
    lane: "metrics, trends, conversion drops, retention analysis, and experiment insight",
  },
];

const DM_MESSAGE_KEYS = ["asha", "ravi", "mira", "kenji", "leah"];

const TEAM_ORDER_BY_DOMAIN = {
  frontend: ["pm", "designer", "backend", "qa", "data"],
  backend: ["pm", "backend", "qa", "designer", "data"],
  data: ["pm", "data", "backend", "qa", "designer"],
  design: ["pm", "designer", "qa", "backend", "data"],
  qa: ["pm", "qa", "backend", "designer", "data"],
  pm: ["pm", "designer", "data", "backend", "qa"],
};

function roleDomain(value) {
  const text = String(value || "").toLowerCase();
  if (/\b(qa|quality|tester|testing|test engineer)\b/.test(text)) return "qa";
  if (/\b(data|analyst|analytics|metric|forecast|experiment|sql|dashboard)\b/.test(text)) return "data";
  if (/\b(design|designer|ux|ui|accessibility|prototype|microcopy)\b/.test(text)) return "design";
  if (/\b(frontend|front-end|react|component|mobile|css|keyboard|screen)\b/.test(text)) return "frontend";
  if (/\b(backend|api|server|cache|queue|database|migration|scaling|worker)\b/.test(text)) return "backend";
  if (/\b(product|pm|launch|priority|roadmap|stakeholder|go-to-market|strategy)\b/.test(text)) return "pm";
  return "pm";
}

function agentIdForRoleDomain(domain) {
  return {
    frontend: "designer",
    design: "designer",
    backend: "backend",
    data: "data",
    qa: "qa",
    pm: "pm",
  }[domain] || null;
}

function candidateAgentIdForMission(mission) {
  const explicitRole = localStorage.getItem("userRole") || "";
  const fallbackRole = mission && (mission.candidateRole || mission.role || mission.headline || mission.summary);
  return agentIdForRoleDomain(roleDomain(explicitRole || fallbackRole || ""));
}

function backendTaskIdForTask(task) {
  const combined = [
    task && task.role,
    task && task.title,
    task && task.description,
    task && task.label,
    ...(Array.isArray(task && task.skills) ? task.skills : []),
  ].join(" ");
  const domain = roleDomain(combined);
  if (domain === "backend") return "login-recovery";
  if (domain === "qa") return "qa-release";
  if (domain === "data") return "fraud-dashboard";
  if (domain === "design") return "docs-update";
  return "mobile-growth";
}

const TASK_TO_BACKEND_TASK_ID = Object.values(TASKS).reduce((acc, levels) => {
  Object.values(levels).forEach((tasks) => {
    tasks.forEach((task) => {
      acc[task.id] = backendTaskIdForTask(task);
    });
  });
  return acc;
}, {});

function findTaskDefinitionById(taskId) {
  if (!taskId) return null;
  for (const role of Object.values(TASKS)) {
    for (const level of Object.values(role)) {
      const task = level.find((entry) => entry.id === taskId);
      if (task) return task;
    }
  }
  return null;
}

function defaultTaskForCurrentRole() {
  const role = localStorage.getItem("userRole") || "";
  if (!role) {
    return findTaskDefinitionById("frontend-homeflow") || TASKS.Frontend.Beginner[0];
  }
  const domain = roleDomain(role);
  const byDomain = {
    frontend: "frontend-homeflow",
    backend: "backend-api-health",
    data: "data-adhoc",
    design: "design-prototype",
    qa: "qa-release-blocker",
    pm: "pm-priority",
  };
  return findTaskDefinitionById(byDomain[domain] || "frontend-homeflow") || TASKS.Frontend.Beginner[0];
}

function createEmptyDmMessages() {
  return DM_MESSAGE_KEYS.reduce((stores, key) => {
    stores[key] = [];
    return stores;
  }, {});
}


const state = {
  missionKey: null,
  mission: null,
  sessionId: null,
  workspace: null,
  timeline: [],
  countdownHandle: null,
  countdownEndsAt: 0,
  saveTimer: null,
  toastTimer: null,
  messageKeys: new Set(),
  timelineKeys: new Set(),
  triggeredBeats: new Set(),
  dynamicTimers: [],
  userMessageCount: 0,
  usingLiveBackend: false,
  submissionInFlight: false,
  roomLocked: false,
  allowNavigationAway: false,
  currentChannel: 'team',
  agents: [],
  teamMessages: [],
  dmMessages: createEmptyDmMessages(),
  messages: [],
};

const companyName = document.getElementById("companyName");
const sprintLabel = document.getElementById("sprintLabel");
const channelList = document.getElementById("channelList");
const teammateList = document.getElementById("teammateList");
const currentUserName = document.getElementById("currentUserName");
const currentUserRole = document.getElementById("currentUserRole");
const selfAvatar = document.getElementById("selfAvatar");
const channelTitle = document.getElementById("channelTitle");
const countdownTimer = document.getElementById("countdownTimer");
const priorityBadge = document.getElementById("priorityBadge");
const crisisStatus = document.getElementById("crisisStatus");
const phaseLabel = document.getElementById("phaseLabel");
const scenarioTitle = document.getElementById("scenarioTitle");
const scenarioSummary = document.getElementById("scenarioSummary");
const taskDeadline = document.getElementById("taskDeadline");
const taskOutput = document.getElementById("taskOutput");
const taskRequirements = document.getElementById("taskRequirements");
const taskAcceptance = document.getElementById("taskAcceptance");
const taskUpdate = document.getElementById("taskUpdate");
const teamChat = document.getElementById("teamChat");
const typingIndicator = document.getElementById("typingIndicator");
const quickPrompts = document.getElementById("quickPrompts");
const candidateMessageInput = document.getElementById("candidateMessageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const workspaceJumpBtn = document.getElementById("workspaceJumpBtn");
const refreshSceneBtn = document.getElementById("refreshSceneBtn");
const notifySceneBtn = document.getElementById("notifySceneBtn");
const peopleBtn = document.getElementById("peopleBtn");
const closeWorkspaceBtn = document.getElementById("closeWorkspaceBtn");
const workspaceTitle = document.getElementById("workspaceTitle");
const workspaceHelper = document.getElementById("workspaceHelper");
const saveStatus = document.getElementById("saveStatus");
const testStatus = document.getElementById("testStatus");
const workspaceTabs = document.getElementById("workspaceTabs");
const activeFileName = document.getElementById("activeFileName");
const wordCount = document.getElementById("wordCount");
const codeEditor = document.getElementById("codeEditor");
const workspaceTip = document.getElementById("workspaceTip");
const workspaceShareLabel = document.getElementById("workspaceShareLabel");
const workspacePeopleAvatars = document.getElementById("workspacePeopleAvatars");
const timelineList = document.getElementById("timelineList");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const insertOutlineBtn = document.getElementById("insertOutlineBtn");
const runTestsBtn = document.getElementById("runTestsBtn");
const shareWorkspaceBtn = document.getElementById("shareWorkspaceBtn");
const requestCritiqueBtn = document.getElementById("requestCritiqueBtn");
const submitBtn = document.getElementById("submitBtn");
const submitSceneBtn = document.getElementById("submitSceneBtn");
const submitWorkspaceBtn = document.getElementById("submitWorkspaceBtn");
const triggerCrisisBtn = document.getElementById("triggerCrisisBtn");
const crisisModal = document.getElementById("crisisModal");
const closeCrisisModalBtn = document.getElementById("closeCrisisModalBtn");
const confirmCrisisBtn = document.getElementById("confirmCrisisBtn");
const cancelCrisisBtn = document.getElementById("cancelCrisisBtn");
const crisisModalText = document.getElementById("crisisModalText");
const toast = document.getElementById("toast");
const submitActionButtons = [submitBtn, submitSceneBtn, submitWorkspaceBtn].filter(Boolean);

function channelItemsForMission(mission) {
  const defaults = {

  };

  return defaults[mission.key] || [mission.channel, "product", "engineering", "design"];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function selectedDashboardTask() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEYS.selectedTaskDetails) || localStorage.getItem(STORAGE_KEYS.selectedTaskDetails);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function getCurrentTaskFromSessionStorage() {
  const dashboardTaskId = sessionStorage.getItem(STORAGE_KEYS.dashboardTask) || localStorage.getItem(STORAGE_KEYS.dashboardTask);
  const storedTask = selectedDashboardTask();
  const taskDefinition = (storedTask && storedTask.id ? storedTask : null)
    || findTaskDefinitionById(dashboardTaskId)
    || (state.mission ? findTaskDefinitionById(state.mission.taskId) : null)
    || defaultTaskForCurrentRole();
  const workspaceFiles = missionFiles().map((file) => file.name).filter(Boolean);
  const declaredFiles = normalizeWorkspaceFiles(taskDefinition.workspaceFiles || taskDefinition.workspace_files)
    .map((file) => file.name)
    .filter(Boolean);
  const rawFiles = Array.isArray(taskDefinition.files)
    ? taskDefinition.files.map((file) => (typeof file === "string" ? file : file && (file.name || file.path))).filter(Boolean)
    : [];
  const files = Array.from(new Set([...(workspaceFiles.length ? workspaceFiles : []), ...declaredFiles, ...rawFiles]));

  return {
    ...taskDefinition,
    id: state.mission ? state.mission.taskId : taskDefinition.id,
    title: state.mission ? state.mission.headline : taskDefinition.title,
    company: state.mission ? state.mission.company : taskDefinition.company,
    role: state.mission ? state.mission.role : taskDefinition.role,
    scenario: state.mission ? state.mission.summary : (taskDefinition.scenario || taskDefinition.description || ""),
    skills: state.mission ? state.mission.requirements : (taskDefinition.skills || []),
    files,
  };
}

function loadWorkspaceFilesModule() {
  if (window.getWorkspaceFiles || window.WORKSPACE_FILES) {
    return Promise.resolve({
      default: window.WORKSPACE_FILES || {},
      WORKSPACE_FILES: window.WORKSPACE_FILES || {},
      getWorkspaceFiles: window.getWorkspaceFiles,
    });
  }

  if (!workspaceFilesModulePromise) {
    workspaceFilesModulePromise = import(WORKSPACE_FILES_MODULE_PATH).catch((error) => {
      console.warn("Could not load workspaceFiles.js", error);
      workspaceFilesModulePromise = null;
      return null;
    });
  }
  return workspaceFilesModulePromise;
}

function workspaceFileId(name, index) {
  const slug = String(name || `workspace-file-${index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${index + 1}-${slug || "workspace-file"}`;
}

function normalizeWorkspaceFiles(files) {
  return (Array.isArray(files) ? files : [])
    .filter((file) => file && typeof file === "object")
    .map((file, index) => {
      const name = String(file.name || file.path || `workspace_file_${index + 1}.md`);
      return {
        id: file.id || workspaceFileId(name, index),
        name,
        kind: file.kind || file.type || "brief",
        type: file.type || file.kind || "brief",
        language: file.language || "",
        content: String(file.content || ""),
      };
    });
}

async function hydrateSelectedDashboardTaskWorkspaceFiles() {
  const taskId = sessionStorage.getItem(STORAGE_KEYS.dashboardTask) || localStorage.getItem(STORAGE_KEYS.dashboardTask);
  const selectedTask = selectedDashboardTask() || (taskId ? { id: taskId } : null);
  if (!selectedTask || !selectedTask.id || (Array.isArray(selectedTask.workspaceFiles) && selectedTask.workspaceFiles.length)) {
    return;
  }

  const mod = await loadWorkspaceFilesModule();
  const getter = (mod && mod.getWorkspaceFiles) || window.getWorkspaceFiles;
  const workspaceFiles = normalizeWorkspaceFiles(getter ? getter(selectedTask.id) : []);
  if (!workspaceFiles.length) {
    return;
  }

  const serialized = JSON.stringify({
      ...selectedTask,
      files: workspaceFiles.map((file) => file.name),
      workspaceFiles,
    });
  localStorage.setItem(STORAGE_KEYS.selectedTaskDetails, serialized);
  sessionStorage.setItem(STORAGE_KEYS.selectedTaskDetails, serialized);
}

function slugifyTask(text) {
  return String(text || "simulation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36) || "simulation";
}

function uniqueWorkspaceFiles(files) {
  const seen = new Set();
  return files.filter((file) => {
    const key = String(file && file.name || "").trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

function simulationArtifactsForMission({ company, headline, summary, role, domain, channel, skills }) {
  const slug = slugifyTask(headline || channel || "sprint");
  const metricName = domain === "data"
    ? "trusted_metric_rate"
    : domain === "backend"
      ? "p95_latency_ms"
      : domain === "design" || domain === "frontend"
        ? "flow_completion_rate"
        : "customer_impact_score";
  const primarySkill = Array.isArray(skills) && skills.length ? skills[0] : "prioritization";

  return [
    {
      id: `${slug}-incident-brief`,
      name: `${slug}_incident_brief.md`,
      kind: "brief",
      type: "brief",
      language: "markdown",
      content: [
        `# ${company} Sprint Brief`,
        "",
        `Situation: ${summary}`,
        `Candidate role: ${role}`,
        `Room channel: #${channel}`,
        "",
        "## What the team needs",
        "- A first decision that reduces user or business risk.",
        "- A tradeoff: what ships now and what waits.",
        "- A validation gate the room can trust.",
        "- A short stakeholder update if pressure escalates.",
        "",
        "## Current tension",
        `The team is testing ${primarySkill}, but the real signal is how well the room handles changing information.`,
      ].join("\n"),
    },
    {
      id: `${slug}-live-metrics`,
      name: `${slug}_live_metrics.csv`,
      kind: "data",
      type: "data",
      language: "csv",
      content: [
        "timestamp,segment,metric,value,notes",
        `09:05,mobile,${metricName},72,baseline before sprint room opened`,
        `09:18,mobile,${metricName},64,drop after latest rollout`,
        `09:31,enterprise,${metricName},58,support mentions rising confusion`,
        `09:44,all,${metricName},55,leadership asks for ETA and recovery confidence`,
      ].join("\n"),
    },
    {
      id: `${slug}-support-tickets`,
      name: `${slug}_support_tickets.md`,
      kind: "brief",
      type: "brief",
      language: "markdown",
      content: [
        `# Support Tickets - ${company}`,
        "",
        "## Ticket DZ-1041",
        "Customer says the flow looks stuck after retrying. Support cannot tell if the action succeeded.",
        "",
        "## Ticket DZ-1047",
        "Account team needs a customer-safe update before the next check-in.",
        "",
        "## Ticket DZ-1052",
        "QA can reproduce the risky path on a slower network. Recovery behavior is unclear.",
      ].join("\n"),
    },
    {
      id: `${slug}-release-report`,
      name: `${slug}_release_readiness_report.md`,
      kind: "brief",
      type: "brief",
      language: "markdown",
      content: [
        `# Release Readiness Report - ${headline}`,
        "",
        "Release state: partial rollout",
        "Rollback owner: unassigned",
        "Known risk: validation evidence is incomplete",
        "Watch window: next 30 minutes",
        "",
        "## Open Questions",
        "- What is the smallest safe fix?",
        "- What metric or test proves the fix works?",
        "- What will the team intentionally defer?",
      ].join("\n"),
    },
    {
      id: `${slug}-screenshot-notes`,
      name: `${slug}_screenshot_notes.png`,
      kind: "image-note",
      type: "image-note",
      language: "text",
      content: [
        "Screenshot artifact notes",
        "",
        "Frame: mobile flow during the risky state",
        "Visible issue: primary action and recovery message compete for attention",
        "Customer confusion: user cannot tell whether retry is safe",
        "Accessibility note: status change needs clearer text announcement",
      ].join("\n"),
    },
  ];
}

function personalizeMissionForDashboardTask(mission, task) {
  const sourceTask = (task && task.id ? task : null) || (mission && mission.id ? mission : null) || defaultTaskForCurrentRole();
  const baseMission = mission && !mission.id ? mission : {};
  const skills = Array.isArray(sourceTask.skills) && sourceTask.skills.length
    ? sourceTask.skills
    : Array.isArray(baseMission.requirements) && baseMission.requirements.length
      ? baseMission.requirements
      : ["Prioritization", "Communication", "Validation"];
  const taskWorkspaceFiles = normalizeWorkspaceFiles(sourceTask.workspaceFiles || sourceTask.workspace_files);
  const existingWorkspaceFiles = normalizeWorkspaceFiles(baseMission.workspaceFiles);
  const role = sourceTask.role || baseMission.role || currentRole();
  const headline = sourceTask.title || baseMission.headline || "Live work simulation";
  const summary = sourceTask.description || baseMission.summary || "Work with the team to make a clear, evidence-backed decision.";
  const company = sourceTask.company || baseMission.company || "DayZero";
  const channel = slugifyTask(sourceTask.label || headline || sourceTask.id);
  const timeMatch = String(sourceTask.time || "").match(/\d+/);
  const timeText = String(sourceTask.time || "").toLowerCase();
  const deadlineMinutes = timeMatch
    ? Number(timeMatch[0]) * (timeText.includes("day") ? 24 * 60 : timeText.includes("hour") ? 60 : 1)
    : Number(baseMission.deadlineMinutes || 45);
  const domain = roleDomain([role, headline, summary, ...skills].join(" "));

  const brief = [
    `# ${headline}`,
    "",
    `Company: ${company}`,
    `Role: ${role}`,
    `Channel: #${channel}`,
    `Scenario: ${summary}`,
    "",
    "## Skills the room will test",
    ...skills.map((skill) => `- ${skill}`),
    "",
    "## Candidate handoff",
    "- State the first decision.",
    "- Explain the tradeoff.",
    "- Name the validation evidence.",
    "- Assign the next owner or follow-up.",
  ].join("\n");

  const providedWorkspaceFiles = taskWorkspaceFiles.length ? taskWorkspaceFiles : existingWorkspaceFiles;
  const workspaceFiles = uniqueWorkspaceFiles([
    { id: "task-brief", name: "task_brief.md", kind: "brief", type: "brief", language: "markdown", content: brief },
    ...providedWorkspaceFiles,
    ...simulationArtifactsForMission({ company, headline, summary, role, domain, channel, skills }),
  ]);

  const nextMission = {
    ...baseMission,
    key: sourceTask.id || baseMission.key || channel,
    taskId: sourceTask.id || baseMission.taskId || channel,
    company,
    channel,
    sprint: sourceTask.label || baseMission.sprint || `${company} live simulation`,
    role,
    domain,
    priority: sourceTask.difficulty || baseMission.priority || "Live",
    deadlineMinutes: Number.isFinite(deadlineMinutes) && deadlineMinutes > 0 ? deadlineMinutes : 45,
    headline,
    summary,
    output: `${role} simulation handoff`,
    crisisStatus: baseMission.crisisStatus || "Interview room active",
    latestChange: baseMission.latestChange || "",
    workspaceTitle: `${company} shared workspace`,
    workspaceHelper: workspaceFiles.length > 1
      ? "Use the task-specific files to show your thinking, then explain the decision and evidence to the team."
      : "Use the workspace to show your thinking, then explain the decision and evidence to the team.",
    workspaceTip: "Tip: Team Channel is visible to everyone. DMs stay with the selected agent, but they still expect task-specific files and evidence.",
    requirements: skills,
    acceptance: skills.map((skill) => `${skill} is demonstrated with a concrete decision or evidence.`),
    crisisPrompt: "The room is adding pressure to test adaptability. Do you want to handle the change now?",
    workspaceFiles,
  };

  nextMission.teammates = agentsForMission(nextMission);
  nextMission.pressureBeats = buildPressureBeats(nextMission);
  return nextMission;
}

function getMissionConfigByKey(key) {
  const selectedTask = selectedDashboardTask();
  if (selectedTask && (!key || selectedTask.id === key)) {
    return selectedTask;
  }

  const legacyRedirects = {
    netflix: "backend-api-health",
    linkedin: "frontend-homeflow",
    spotify: "data-adhoc",
    openai: "backend-auth",
    mobile: "frontend-homeflow",
    backend: "backend-api-health",
    ops: "data-dashboard",
  };
  const normalizedKey = legacyRedirects[key] || key;
  return findTaskDefinitionById(normalizedKey) || selectedTask || defaultTaskForCurrentRole();
}

function candidateName() {
  return localStorage.getItem("userName") || "You";
}

function currentRole() {
  return localStorage.getItem("userRole") || (state.mission ? state.mission.role : "Candidate");
}

function missionKeyFromRole() {
  const role = currentRole().toLowerCase();
  if (role.includes("backend")) {
    return "backend";
  }
  if (role.includes("data") || role.includes("analyst")) {
    return "ops";
  }
  if (role.includes("product") || role.includes("frontend")) {
    return "mobile";
  }
  return "mobile";
}

function selectedMissionKey() {
  const dashboardTaskId = sessionStorage.getItem(STORAGE_KEYS.dashboardTask) || localStorage.getItem(STORAGE_KEYS.dashboardTask);
  const selectedTask = selectedDashboardTask();
  if (dashboardTaskId && (findTaskDefinitionById(dashboardTaskId) || (selectedTask && selectedTask.id === dashboardTaskId))) {
    return dashboardTaskId;
  }
  const stored = localStorage.getItem(STORAGE_KEYS.selectedMission);
  return stored && (findTaskDefinitionById(stored) || getMissionConfigByKey(stored)) ? stored : missionKeyFromRole();
}

function activeTaskId() {
  const dashboardTaskId = sessionStorage.getItem(STORAGE_KEYS.dashboardTask) || localStorage.getItem(STORAGE_KEYS.dashboardTask);
  const selectedTask = selectedDashboardTask();
  if (dashboardTaskId && (findTaskDefinitionById(dashboardTaskId) || (selectedTask && selectedTask.id === dashboardTaskId))) {
    return dashboardTaskId;
  }
  return state.mission ? state.mission.taskId : "mobile-onboarding";
}

function activeBackendTaskId() {
  const uiTaskId = activeTaskId();
  return TASK_TO_BACKEND_TASK_ID[uiTaskId] || uiTaskId;
}

function sessionStorageKey() {
  return `${STORAGE_KEYS.sessionPrefix}${activeTaskId()}`;
}

function workspaceStorageKey() {
  return `${STORAGE_KEYS.workspacePrefix}${activeTaskId()}`;
}

function timelineStorageKey() {
  return `${STORAGE_KEYS.timelinePrefix}${activeTaskId()}`;
}

function getInitials(name) {
  return String(name || "AI")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "AI";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatClock(msRemaining) {
  const safe = Math.max(0, Math.floor(msRemaining / 1000));
  const mins = String(Math.floor(safe / 60)).padStart(2, "0");
  const secs = String(safe % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function formatTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return "Now";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function refreshIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function autoResizeComposer() {
  if (!candidateMessageInput) {
    return;
  }
  candidateMessageInput.style.height = "32px";
  candidateMessageInput.style.height = `${Math.min(candidateMessageInput.scrollHeight, 120)}px`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    toast.classList.add("hidden");
  }, 2600);
}

function shouldGuardSimulationExit() {
  return Boolean(state.mission) && !state.allowNavigationAway;
}

function allowSimulationExit() {
  state.allowNavigationAway = true;
}

function preventAccidentalRefresh(event) {
  if (!shouldGuardSimulationExit()) {
    return;
  }

  const key = String(event.key || "").toLowerCase();
  const wantsRefresh = event.key === "F5" || ((event.ctrlKey || event.metaKey) && key === "r");
  if (!wantsRefresh) {
    return;
  }

  event.preventDefault();
  showToast("Simulation is still live. Submit the room before refreshing.");
}

function handleBeforeUnload(event) {
  if (!shouldGuardSimulationExit()) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
}

function navigateToResults() {
  allowSimulationExit();
  window.location.replace("results.html");
}

function setRoomLocked(locked, reason) {
  state.roomLocked = locked;

  if (candidateMessageInput) {
    candidateMessageInput.disabled = locked;
    if (locked && reason) {
      candidateMessageInput.placeholder = reason;
    } else if (!locked && state.mission) {
      const agent = agentForChannel(state.currentChannel);
      candidateMessageInput.placeholder = agent ? `Message ${agent.name} privately...` : "Message Team Channel";
    }
  }
  if (sendMessageBtn) sendMessageBtn.disabled = locked;
  if (codeEditor) codeEditor.disabled = locked;
  if (saveDraftBtn) saveDraftBtn.disabled = locked;
  if (insertOutlineBtn) insertOutlineBtn.disabled = locked;
  if (runTestsBtn) runTestsBtn.disabled = locked;
  if (shareWorkspaceBtn) shareWorkspaceBtn.disabled = locked;
  if (requestCritiqueBtn) requestCritiqueBtn.disabled = locked;
  if (refreshSceneBtn) refreshSceneBtn.disabled = locked;
  if (notifySceneBtn) notifySceneBtn.disabled = locked;
  submitActionButtons.forEach((button) => {
    button.disabled = locked;
  });
  if (triggerCrisisBtn) triggerCrisisBtn.disabled = locked;
  if (workspaceTabs) {
    workspaceTabs.style.pointerEvents = locked ? "none" : "";
    workspaceTabs.style.opacity = locked ? "0.6" : "";
  }

  if (locked && reason) {
    markSaved(reason);
  }
}

function normalizeRoleKind(title) {
  const lowered = String(title || "").toLowerCase();
  if (lowered.includes("product") || lowered.includes("incident")) return "pm";
  if (lowered.includes("frontend") || lowered.includes("ux") || lowered.includes("design")) return "design";
  if (lowered.includes("engineer") || lowered.includes("engineering")) return "eng";
  if (lowered.includes("qa")) return "qa";
  if (lowered.includes("data") || lowered.includes("analyst")) return "data";
  if (lowered.includes("executive") || lowered.includes("vp") || lowered.includes("sponsor")) return "exec";
  return "pm";
}

function isHiddenEvaluatorPayload(message) {
  const role = String(message && message.role || "").trim().toLowerCase();
  if (role === "system" || role === "user") {
    return false;
  }

  const speaker = String(message && (message.speaker_name || message.name || "") || "").trim().toLowerCase();
  const title = String(message && (message.speaker_title || message.title || message.agent_role || "") || "").trim().toLowerCase();
  const looksLikeEvaluator = title.includes("evaluator") || title.includes("observer");
  return looksLikeEvaluator || speaker === "evaluator" || speaker === "simulation evaluator" || speaker === "observer" || speaker === "quinn";
}

function agentDmKey(agent) {
  const raw = agent && (agent.dmKey || agent.name || agent.id);
  return String(raw || "asha").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "asha";
}

function agentById(agentId) {
  const id = String(agentId || "").toLowerCase();
  return AGENT_PROFILES.find((agent) => {
    const name = String(agent.name || "").toLowerCase();
    return agent.id === id || agentDmKey(agent) === id || name === id || slugifyTask(name) === id;
  }) || null;
}

function agentsForMission(mission) {
  const domain = mission && mission.domain
    ? mission.domain
    : roleDomain([mission && mission.role, mission && mission.headline, mission && mission.summary].join(" "));
  const order = TEAM_ORDER_BY_DOMAIN[domain] || TEAM_ORDER_BY_DOMAIN.pm;
  const candidateAgentId = candidateAgentIdForMission(mission);
  return order
    .map((id) => agentById(id))
    .filter(Boolean)
    .filter((agent) => agent.id !== candidateAgentId)
    .slice(0, 5)
    .map((agent) => ({ ...agent }));
}

function isVisibleCoworker(agent) {
  if (!agent || agent.hidden) {
    return false;
  }
  const name = String(agent.name || agent.agent_name || "").trim();
  const title = String(agent.title || agent.role || "").toLowerCase();
  const candidateAgentId = candidateAgentIdForMission(state.mission);
  return Boolean(name) && agent.id !== candidateAgentId && !title.includes("evaluator") && !title.includes("observer");
}

function agentChannelId(agent) {
  return `dm:${agentDmKey(agent)}`;
}

function normalizeChannelId(channelId) {
  const raw = String(channelId || "team").trim();
  if (!raw || raw === "team" || (state.mission && raw === state.mission.channel)) {
    return "team";
  }
  if (raw.startsWith("dm:")) {
    const agentId = raw.slice(3).toLowerCase();
    const visibleAgents = state.agents || [];
    const agent = visibleAgents.find((person) => {
      const name = String(person.name || "").toLowerCase();
      return person.id === agentId || agentDmKey(person) === agentId || name === agentId || slugifyTask(name) === agentId;
    }) || (!visibleAgents.length ? agentById(agentId) : null);
    return agent ? agentChannelId(agent) : raw;
  }
  if (raw.startsWith("dm-")) {
    const legacy = raw.slice(3).toLowerCase();
    const agent = (state.agents || []).find((person) => {
      const name = String(person.name || "").toLowerCase();
      return person.id === legacy || agentDmKey(person) === legacy || name === legacy || slugifyTask(name) === legacy;
    });
    return agent ? agentChannelId(agent) : `dm:${legacy}`;
  }
  return raw;
}

function isTeamChannel(channelId) {
  return normalizeChannelId(channelId) === "team";
}

function agentForChannel(channelId) {
  const normalized = normalizeChannelId(channelId);
  if (!normalized.startsWith("dm:")) return null;
  const agentId = normalized.slice(3);
  return (state.agents || []).find((agent) => agent.id === agentId || agentDmKey(agent) === agentId) || null;
}

function agentForSpeakerName(name) {
  const normalized = String(name || "").trim().toLowerCase();
  return (state.agents || []).find((agent) => String(agent.name || "").toLowerCase() === normalized)
    || agentById(normalized);
}

function dmKeyFromChannel(channelId) {
  const normalized = normalizeChannelId(channelId);
  if (!normalized.startsWith("dm:")) {
    return null;
  }
  const agent = agentForChannel(normalized);
  return agent ? agentDmKey(agent) : normalized.slice(3);
}

function ensureDmStore(dmKey) {
  const key = DM_MESSAGE_KEYS.includes(dmKey) ? dmKey : agentDmKey(agentById(dmKey) || { dmKey });
  if (!state.dmMessages[key]) {
    state.dmMessages[key] = [];
  }
  return state.dmMessages[key];
}

function messageStoreForChannel(channelId) {
  if (isTeamChannel(channelId)) {
    return state.teamMessages;
  }
  return ensureDmStore(dmKeyFromChannel(channelId) || "asha");
}

function visibleMessageStore() {
  return messageStoreForChannel(state.currentChannel || "team");
}

function agentMentionedIn(text) {
  const lowered = String(text || "").toLowerCase();
  return (state.agents || []).find((agent) => {
    const name = String(agent.name || "").trim().toLowerCase();
    return name && (lowered.includes(`@${name}`) || new RegExp(`\\b${name}\\b`, "i").test(lowered));
  }) || null;
}

function missionFiles() {
  return Array.isArray(state.workspace && state.workspace.files) && state.workspace.files.length
    ? state.workspace.files
    : Array.isArray(state.mission && state.mission.workspaceFiles)
      ? state.mission.workspaceFiles
      : [];
}

function allowedTaskFileNames() {
  const currentTask = getCurrentTaskFromSessionStorage();
  return Array.from(new Set((currentTask.files || [])
    .map((name) => String(name || "").trim())
    .filter(Boolean)));
}

function fileBaseName(path) {
  return String(path || "").split(/[\\/]/).filter(Boolean).pop() || "";
}

function isAllowedFileReference(reference, allowedFiles) {
  const normalized = String(reference || "").trim().replace(/[.,;:!?)]$/, "").toLowerCase();
  if (!normalized) {
    return true;
  }
  return allowedFiles.some((file) => {
    const lowered = file.toLowerCase();
    return normalized === lowered || normalized === fileBaseName(lowered);
  });
}

function replaceUnavailableFileReferences(text) {
  const allowedFiles = allowedTaskFileNames();
  if (!allowedFiles.length) {
    return String(text || "");
  }

  const fallbackFile = allowedFiles[0];
  const filePattern = /\b(?:[\w.-]+[\\/])*[\w.-]+\.(?:js|jsx|ts|tsx|py|md|css|html|json|sql|csv|log|txt)\b/g;
  return String(text || "").replace(filePattern, (match) => (
    isAllowedFileReference(match, allowedFiles) ? match : fallbackFile
  ));
}

function bestFileForAgent(agent) {
  const files = missionFiles();
  const active = state.workspace && Array.isArray(state.workspace.files) ? getActiveFile() : null;
  const kind = agent && agent.kind;
  const keywords = {
    pm: ["brief", "risk", "plan", "roadmap", "stakeholder", "support"],
    eng: ["api", "service", "server", "cache", "queue", "auth", "jsx", "js", "py", "sql", "log"],
    design: ["ui", "screen", "flow", "copy", "style", "design", "component", "onboarding"],
    qa: ["test", "qa", "risk", "release", "log", "bug", "check"],
    data: ["metric", "analytics", "dashboard", "csv", "sql", "forecast", "report", "experiment"],
  }[kind] || [];

  const match = files.find((file) => {
    const name = String(file.name || "").toLowerCase();
    const type = String(file.kind || file.type || "").toLowerCase();
    return keywords.some((keyword) => name.includes(keyword) || type.includes(keyword));
  });

  return match || active || files[0] || { name: "task_brief.md", content: "" };
}

function buildPressureBeats(mission) {
  const team = agentsForMission(mission);
  const byId = (id) => team.find((agent) => agent.id === id);
  const pm = byId("pm") || team[0] || agentById("pm");
  const anchor = byId(mission.domain === "data" ? "data" : mission.domain === "design" || mission.domain === "frontend" ? "designer" : "backend")
    || team.find((agent) => agent.id !== (pm && pm.id))
    || pm;
  const qa = byId("qa") || team.find((agent) => agent.id !== (pm && pm.id) && agent.id !== (anchor && anchor.id)) || anchor;
  const firstFile = (mission.workspaceFiles || [])[1] || (mission.workspaceFiles || [])[0] || { name: "task_brief.md" };
  return [
    {
      id: `${mission.taskId}-first-message`,
      trigger: "first-message",
      crisis: "Scope decision needed",
      update: `${mission.company} needs a clear first move for ${mission.headline}.`,
      messages: [
        { speaker_name: pm.name, speaker_title: pm.title, avatar: pm.avatar, channel: "team", message: `For ${mission.headline}, stabilize the user-impacting path first and leave polish for later.` },
        { speaker_name: qa.name, speaker_title: qa.title, avatar: qa.avatar, channel: "team", message: `I will use ${firstFile.name} to check the risky path before we call it safe.` },
      ],
    },
    {
      id: `${mission.taskId}-manual-crisis`,
      trigger: "manual-crisis",
      crisis: "Pressure spike",
      update: "The room needs a smaller, safer recommendation with an owner and validation signal.",
      messages: [
        { speaker_name: pm.name, speaker_title: pm.title, avatar: pm.avatar, channel: "team", message: "Time just got tighter. Give me the smallest version we can stand behind." },
        { speaker_name: anchor.name, speaker_title: anchor.title, avatar: anchor.avatar, channel: "team", message: `I am looking at ${firstFile.name}; lock down the exact behavior we trust before this ships.` },
      ],
    },
    {
      id: `${mission.taskId}-metrics-worsened`,
      trigger: "metrics-worsened",
      crisis: "Metrics worsening",
      update: "Live metrics moved against the team. The room needs a smaller decision and a clear proof point.",
      messages: [
        { speaker_name: pm.name, speaker_title: pm.title, avatar: pm.avatar, channel: "team", message: "Metrics just moved the wrong way. I need the cut line now." },
        { speaker_name: qa.name, speaker_title: qa.title, avatar: qa.avatar, channel: "team", message: `Do not broaden scope. Prove the risky path in ${firstFile.name} first.` },
      ],
    },
    {
      id: `${mission.taskId}-leadership-eta`,
      trigger: "leadership-eta",
      crisis: "Leadership ETA request",
      update: "Leadership wants an ETA and rollback confidence before the next stakeholder update.",
      messages: [
        { speaker_name: pm.name, speaker_title: pm.title, avatar: pm.avatar, channel: "team", message: "Leadership wants an ETA. Give me owner, validation gate, and what waits." },
        { speaker_name: anchor.name, speaker_title: anchor.title, avatar: anchor.avatar, channel: "team", message: "Quick patch is fine only if the rollback path is explicit." },
      ],
    },
    {
      id: `${mission.taskId}-hidden-issue`,
      trigger: "hidden-issue",
      crisis: "Hidden issue found",
      update: "QA found a second risky path. The room needs to adapt without losing the first priority.",
      messages: [
        { speaker_name: qa.name, speaker_title: qa.title, avatar: qa.avatar, channel: "team", message: `I found a second path tied to ${firstFile.name}. I am not comfortable shipping until recovery is named.` },
        { speaker_name: pm.name, speaker_title: pm.title, avatar: pm.avatar, channel: "team", message: "Keep the main call intact. Adjust scope, do not restart the whole sprint." },
      ],
    },
    {
      id: `${mission.taskId}-draft-80`,
      trigger: "draft-80",
      crisis: "Draft review pressure",
      update: "The workspace has enough shape for the room to challenge the riskiest assumption.",
      messages: [
        { speaker_name: qa.name, speaker_title: qa.title, avatar: qa.avatar, channel: "team", message: "Draft is real enough to test. Name the ugly case before polishing it." },
        { speaker_name: anchor.name, speaker_title: anchor.title, avatar: anchor.avatar, channel: "team", message: `Tie the draft back to ${firstFile.name}; otherwise it reads like a plan without proof.` },
      ],
    },
    {
      id: `${mission.taskId}-critique`,
      trigger: "critique",
      crisis: "Draft needs sharper evidence",
      update: "The team wants the current workspace tied back to a file, a decision, and a validation gate.",
      messages: [
        { speaker_name: qa.name, speaker_title: qa.title, avatar: qa.avatar, channel: "team", message: `Your draft should say what proves ${firstFile.name} is no longer the risky path.` },
        { speaker_name: pm.name, speaker_title: pm.title, avatar: pm.avatar, channel: "team", message: "Then make the tradeoff explicit so nobody mistakes this for a broad redesign." },
      ],
    },
  ];
}

function defaultWorkspaceForMission(mission) {
  return {
    activeTabId: mission.workspaceFiles[0].id,
    files: mission.workspaceFiles.map((file) => ({ ...file })),
  };
}

function loadWorkspaceState() {
  const defaults = defaultWorkspaceForMission(state.mission);
  const raw = localStorage.getItem(workspaceStorageKey());
  if (!raw) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);
    const files = defaults.files.map((file) => {
      const saved = Array.isArray(parsed.files) ? parsed.files.find((entry) => entry.id === file.id) : null;
      return saved ? { ...file, ...saved } : file;
    });
    const activeTabId = files.some((file) => file.id === parsed.activeTabId) ? parsed.activeTabId : files[0].id;
    return { activeTabId, files };
  } catch (error) {
    return defaults;
  }
}

function saveWorkspaceState() {
  localStorage.setItem(workspaceStorageKey(), JSON.stringify(state.workspace));
}

function loadTimelineState() {
  const raw = localStorage.getItem(timelineStorageKey());
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function saveTimelineState() {
  localStorage.setItem(timelineStorageKey(), JSON.stringify(state.timeline));
}

function getActiveFile() {
  return state.workspace.files.find((file) => file.id === state.workspace.activeTabId) || state.workspace.files[0];
}

function setActiveFile(tabId) {
  state.workspace.activeTabId = tabId;
  const file = getActiveFile();
  activeFileName.textContent = file.name;
  codeEditor.value = file.content;
  renderWorkspaceTabs();
  updateEditorStats();
  saveWorkspaceState();
}

function updateCurrentFileContent(nextContent) {
  const file = getActiveFile();
  file.content = nextContent;
  updateEditorStats();
}

function updateEditorStats() {
  const content = codeEditor.value || "";
  const lines = content ? content.split("\n").length : 0;
  const chars = content.length;
  wordCount.textContent = `${lines} lines - ${chars} chars`;
}

function renderWorkspaceTabs() {
  workspaceTabs.innerHTML = state.workspace.files
    .map(
      (file) => `
        <button type="button" class="${file.id === state.workspace.activeTabId ? "active" : ""}" data-tab-id="${escapeHtml(file.id)}">
          <strong>${escapeHtml(file.name)}</strong>
        </button>
      `
    )
    .join("");

  workspaceTabs.querySelectorAll("[data-tab-id]").forEach((button) => {
    button.addEventListener("click", () => setActiveFile(button.getAttribute("data-tab-id")));
  });
}

function renderLists() {
  taskRequirements.innerHTML = state.mission.requirements.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  taskAcceptance.innerHTML = state.mission.acceptance.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderQuickPrompts() {
  quickPrompts.innerHTML = "";
  quickPrompts.classList.add("hidden");
}

function renderChannelList() {
  const teamChannelBtn = document.getElementById("teamChannelBtn");
  if (teamChannelBtn) {
    teamChannelBtn.classList.toggle("active", isTeamChannel(state.currentChannel));
    const title = teamChannelBtn.querySelector("strong");
    const subtitle = teamChannelBtn.querySelector("small");
    if (title) title.textContent = `#${state.mission.channel}`;
    if (subtitle) subtitle.textContent = "Visible to the whole room";
    teamChannelBtn.onclick = () => {
      switchToChannel('team');
    };
  }
}

function renderTeammates() {
  const agents = (state.agents || state.mission.teammates || []).filter(isVisibleCoworker);
  teammateList.innerHTML = agents
    .map((person) => {
      const roleKind = person.kind || normalizeRoleKind(person.title || person.role);
      const agentName = person.name || person.agent_name || "Agent";
      const agentRole = person.title || person.role || "Team Member";
      const initial = getInitials(agentName);
      const isActive = normalizeChannelId(state.currentChannel) === agentChannelId(person);
      return `
        <button class="teammate-row ${isActive ? "active" : ""}" type="button" data-channel="${escapeHtml(agentChannelId(person))}" data-agent-id="${escapeHtml(person.id || "")}">
          <span class="teammate-row-main">
            <span class="member-avatar ${escapeHtml(roleKind)}">${escapeHtml(initial)}</span>
            <span class="member-copy">
              <strong>${escapeHtml(agentName)}</strong>
              <p>${escapeHtml(agentRole)}</p>
            </span>
          </span>
          <span class="dm-pill">DM</span>
        </button>
      `;
    })
    .join("");

  const dmButtons = teammateList.querySelectorAll(".teammate-row[data-channel]");
  dmButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const channel = btn.dataset.channel;
      switchToChannel(channel);
    });
  });
}

function renderWorkspacePeople() {
  if (!workspacePeopleAvatars) {
    return;
  }

  const agents = (state.agents || state.mission.teammates || []).filter(isVisibleCoworker);
  const agentAvatars = agents
    .map((person) => {
      const roleKind = person.kind || normalizeRoleKind(person.title || person.role);
      const agentName = person.name || person.agent_name || "Agent";
      return `<span class="mini-avatar avatar-${escapeHtml(roleKind)}" title="${escapeHtml(agentName)}">${escapeHtml(getInitials(agentName))}</span>`;
    })
    .join("");

  workspacePeopleAvatars.innerHTML = `${agentAvatars}<span class="mini-avatar avatar-user" title="${escapeHtml(candidateName())}">${escapeHtml(getInitials(candidateName()))}</span>`;
}

function switchToChannel(channelId) {
  const normalized = normalizeChannelId(channelId);
  state.currentChannel = normalized;

  const channelTitleEl = document.getElementById("channelTitle");
  const channelIconEl = document.getElementById("channelIcon");

  if (isTeamChannel(normalized)) {
    channelTitleEl.textContent = `#${state.mission.channel}`;
    channelIconEl.textContent = "#";
    candidateMessageInput.placeholder = "Message Team Channel";
    scenarioTitle.textContent = state.mission.headline;
    if (workspaceShareLabel) workspaceShareLabel.textContent = "team visible";
  } else {
    const agent = agentForChannel(normalized);
    const agentName = agent ? agent.name : "Agent";
    const agentRole = agent ? agent.title : "Private thread";
    channelTitleEl.textContent = agentName;
    channelIconEl.textContent = "@";
    candidateMessageInput.placeholder = `Message ${agentName} privately...`;
    scenarioTitle.textContent = agent ? agentRole : state.mission.headline;
    if (workspaceShareLabel) workspaceShareLabel.textContent = "dm visible";
  }

  renderChannelList();
  renderTeammates();
  loadChannelMessages(channelId);
}

function loadChannelMessages(channelId) {
  state.currentChannel = normalizeChannelId(channelId);
  rerenderChat();
}

function renderMission() {
  document.title = `DayZero | ${state.mission.company} - ${state.mission.channel}`;
  companyName.textContent = state.mission.company;
  sprintLabel.textContent = state.mission.sprint;
  currentUserName.textContent = candidateName();
  currentUserRole.textContent = currentRole();
  selfAvatar.textContent = getInitials(candidateName());

  channelTitle.textContent = `#${state.mission.channel}`;
  priorityBadge.textContent = state.mission.priority;
  crisisStatus.textContent = state.mission.crisisStatus;
  phaseLabel.textContent = "Live Sprint";
  scenarioTitle.textContent = state.mission.headline;
  scenarioSummary.textContent = state.mission.summary;
  taskDeadline.textContent = `${state.mission.deadlineMinutes} mins`;
  taskOutput.textContent = state.mission.output;
  taskUpdate.textContent = state.mission.latestChange;
  workspaceTitle.textContent = "Workspace";
  workspaceHelper.textContent = state.mission.workspaceHelper;
  workspaceTip.textContent = state.mission.workspaceTip;
  crisisModalText.textContent = state.mission.crisisPrompt;
  testStatus.textContent = "Checks not run";
  saveStatus.textContent = "Saved";

  renderChannelList();
  renderTeammates();
  renderWorkspacePeople();
  renderLists();
  renderQuickPrompts();
  renderWorkspaceTabs();
  setActiveFile(state.workspace.activeTabId);
  switchToChannel(state.currentChannel || "team");
  autoResizeComposer();
  refreshIcons();
}

function clearChat() {
  teamChat.innerHTML = "";
  state.messageKeys = new Set();
  state.teamMessages = [];
  state.dmMessages = createEmptyDmMessages();
  state.messages = [];
}

function clearTimeline() {
  timelineList.innerHTML = "";
  state.timelineKeys = new Set();
}

function uniqueMessageKey(message) {
  return [
    normalizeChannelId(message.channel || message.channel_id || message.channelId || "team"),
    message.speaker_name || message.name || "speaker",
    message.message || message.content || "",
    message.created_at || message.createdAt || "",
    message.role || "",
  ].join("::");
}

function uniqueTimelineKey(entry) {
  return [entry.title || "", entry.description || "", entry.created_at || ""].join("::");
}

function sanitizeRoomMessage(rawMessage) {
  const aliases = {
    Maya: { name: "Asha", title: "Product Manager" },
    Anika: { name: "Asha", title: "Product Manager" },
    Sofia: { name: "Asha", title: "Product Manager" },
    Iris: { name: "Asha", title: "Product Manager" },
    Dante: { name: "Ravi", title: "Engineering Lead" },
    Marcus: { name: "Ravi", title: "Engineering Lead" },
    Oskar: { name: "Ravi", title: "Engineering Lead" },
    Noah: { name: "Ravi", title: "Engineering Lead" },
    Priya: { name: "Kenji", title: "QA Engineer" },
    Nora: { name: "Kenji", title: "QA Engineer" },
    Farah: { name: "Kenji", title: "QA Engineer" },
    Elena: { name: "Mira", title: "Product Designer" },
    Jules: { name: "Mira", title: "Product Designer" },
    Mina: { name: "Mira", title: "Product Designer" },
    Tessa: { name: "Mira", title: "Product Designer" },
    Reed: { name: "Asha", title: "Product Manager" },
    Vikram: { name: "Asha", title: "Product Manager" },
    Gabe: { name: "Asha", title: "Product Manager" },
    Sam: { name: "Asha", title: "Product Manager" },
    Leo: { name: "Asha", title: "Product Manager" },
  };
  const message = { ...rawMessage };
  const originalName = message.speaker_name || message.name;
  const alias = aliases[originalName];
  if (alias) {
    message.speaker_name = alias.name;
    message.name = alias.name;
    message.speaker_title = alias.title;
    message.title = alias.title;
  }

  const oldNames = Object.keys(aliases).join("|");
  const namePattern = new RegExp(`\\b(${oldNames})\\b`, "g");
  if (typeof message.message === "string") {
    message.message = message.message.replace(namePattern, (name) => aliases[name].name);
  }
  if (typeof message.content === "string") {
    message.content = message.content.replace(namePattern, (name) => aliases[name].name);
  }

  return message;
}

function normalizeMessage(message) {
  message = sanitizeRoomMessage(message);
  const speakerName = message.speaker_name || message.name || "Room update";
  const speakerTitle = message.speaker_title || message.title || message.role || "";
  const body = message.message || message.content || "";
  const createdAt = message.created_at || message.createdAt || new Date().toISOString();
  const isUser = String(message.role || "").toLowerCase() === "user" || speakerName === candidateName();
  const isSystem = String(message.role || "").toLowerCase() === "system" || speakerName === "System";
  return {
    speakerName,
    speakerTitle,
    body,
    createdAt,
    avatar: message.avatar || getInitials(speakerName),
    kind: normalizeRoleKind(speakerTitle || speakerName),
    type: isSystem ? "system" : isUser ? "user" : "agent",
    channel: normalizeChannelId(message.channel || message.channel_id || message.channelId || "team"),
  };
}

function shouldShowMessage(rawMessage) {
  const messageChannel = normalizeChannelId(rawMessage.channel || rawMessage.channel_id || rawMessage.channelId || "team");
  const currentChannel = normalizeChannelId(state.currentChannel || "team");
  return messageChannel === currentChannel;
}

function renderChatMessage(rawMessage) {
  const safeMessage = sanitizeRoomMessage(rawMessage);
  const message = normalizeMessage(safeMessage);
  const item = document.createElement("article");

  if (message.type === "system") {
    item.className = "chat-row system";
    item.innerHTML = `
      <div></div>
      <div class="chat-card">
        <div class="chat-meta">
          <strong>Room update</strong>
          <span>${escapeHtml(formatTime(message.createdAt))}</span>
        </div>
        <p class="chat-body">${escapeHtml(message.body)}</p>
      </div>
    `;
  } else {
    item.className = `chat-row ${message.type} role-${message.kind}`;
    item.innerHTML = `
      <div class="chat-avatar">${escapeHtml(message.avatar)}</div>
      <div class="chat-card">
        <div class="chat-meta">
          <strong>${escapeHtml(message.speakerName)}</strong>
          <span>${escapeHtml(message.speakerTitle || (message.type === "user" ? "You" : "Teammate"))}</span>
          <span>${escapeHtml(formatTime(message.createdAt))}</span>
        </div>
        <p class="chat-body">${escapeHtml(message.body)}</p>
      </div>
    `;
  }

  teamChat.appendChild(item);
}

function rerenderChat() {
  teamChat.innerHTML = "";
  const visibleMessages = visibleMessageStore().filter(shouldShowMessage);
  if (!visibleMessages.length) {
    const emptyState = document.createElement("div");
    emptyState.className = "chat-empty-state";
    emptyState.textContent = isTeamChannel(state.currentChannel)
      ? "Task loaded. Send the first work update when you are ready."
      : "No private messages yet. Start the conversation.";
    teamChat.appendChild(emptyState);
    return;
  }
  visibleMessages.forEach(renderChatMessage);
  scrollChatToBottom();
}

function appendChatMessage(rawMessage) {
  const safeMessage = sanitizeRoomMessage({
    ...rawMessage,
    channel: normalizeChannelId(rawMessage.channel || rawMessage.channel_id || rawMessage.channelId || state.currentChannel || "team"),
  });
  if (isHiddenEvaluatorPayload(safeMessage)) {
    return;
  }
  const isUser = String(safeMessage.role || "").toLowerCase() === "user" || (safeMessage.speaker_name || safeMessage.name) === candidateName();
  if (!isUser) {
    safeMessage.message = replaceUnavailableFileReferences(safeMessage.message || safeMessage.content || "");
    safeMessage.content = safeMessage.message;
  }
  const key = uniqueMessageKey(safeMessage);
  if (state.messageKeys.has(key)) {
    return;
  }

  state.messageKeys.add(key);
  messageStoreForChannel(safeMessage.channel).push(safeMessage);
  state.messages = [...state.teamMessages, ...Object.values(state.dmMessages).flat()];
  if (shouldShowMessage(safeMessage)) {
    const emptyState = teamChat.querySelector(".chat-empty-state");
    if (emptyState) {
      emptyState.remove();
    }
    renderChatMessage(safeMessage);
    scrollChatToBottom();
  }
}

function addTimelineEvent(entry) {
  const safeEntry = {
    title: entry.title || "Timeline event",
    description: entry.description || "",
    created_at: entry.created_at || new Date().toISOString(),
  };
  const key = uniqueTimelineKey(safeEntry);
  if (state.timelineKeys.has(key)) {
    return;
  }

  state.timelineKeys.add(key);
  state.timeline.push(safeEntry);
  saveTimelineState();
  renderTimeline();
}

function renderTimeline() {
  const items = state.timeline.slice().reverse();
  timelineList.innerHTML = items.length
    ? items
        .map(
          (entry) => `
            <article class="timeline-item">
              <strong>${escapeHtml(entry.title)}</strong>
              <span>${escapeHtml(formatTime(entry.created_at))}</span>
              <p>${escapeHtml(entry.description)}</p>
            </article>
          `
        )
        .join("")
    : `
      <article class="timeline-item">
        <strong>Simulation ready</strong>
        <span>${escapeHtml(formatTime(new Date().toISOString()))}</span>
        <p>Send a message or start editing the workspace to move the room forward.</p>
      </article>
    `;
}

function markSaved(text) {
  saveStatus.textContent = text;
}

function saveDraft(showFeedback) {
  saveWorkspaceState();
  markSaved("Saved");
  if (showFeedback) {
    showToast("Workspace saved locally.");
  }
}

function scheduleAutoSave() {
  window.clearTimeout(state.saveTimer);
  markSaved("Saving...");
  state.saveTimer = window.setTimeout(() => saveDraft(false), 400);
}

function resetCountdown(payload) {
  window.clearInterval(state.countdownHandle);
  let endsAtMs = payload && payload.ends_at ? new Date(payload.ends_at).getTime() : Number.NaN;
  if (!Number.isFinite(endsAtMs)) {
    endsAtMs = Date.now() + state.mission.deadlineMinutes * 60 * 1000;
  }

  state.countdownEndsAt = endsAtMs;
  state.countdownHandle = window.setInterval(() => {
    const remaining = state.countdownEndsAt - Date.now();
    countdownTimer.textContent = formatClock(remaining);
    if (remaining <= 0) {
      window.clearInterval(state.countdownHandle);
      countdownTimer.textContent = "00:00";
      crisisStatus.textContent = "Time expired";
      if (!state.submissionInFlight) {
        handleCountdownExpiry();
      }
    }
  }, 1000);
  countdownTimer.textContent = formatClock(Math.max(0, state.countdownEndsAt - Date.now()));
}

async function handleCountdownExpiry() {
  if (state.submissionInFlight) {
    return;
  }
  setRoomLocked(true, "Time ended - generating SkillRecord...");
  showToast("Time ended - generating SkillRecord...");
  await submitSimulation("expired");
}

function openCrisisModal() {
  crisisModal.classList.remove("hidden");
  crisisModal.setAttribute("aria-hidden", "false");
}

function closeCrisisModal() {
  crisisModal.classList.add("hidden");
  crisisModal.setAttribute("aria-hidden", "true");
}

function showTyping(label) {
  typingIndicator.textContent = label;
  typingIndicator.classList.remove("hidden");
}

function hideTyping() {
  typingIndicator.classList.add("hidden");
  typingIndicator.textContent = "";
}

function scrollChatToBottom() {
  teamChat.scrollTop = teamChat.scrollHeight;
}

function appendMessagesSequentially(messages, startDelay = 180, stepDelay = 520) {
  messages.forEach((message, index) => {
    window.setTimeout(() => appendChatMessage(message), startDelay + index * stepDelay);
  });
}

function buildSubmission() {
  const sections = state.workspace.files
    .map((file) => `### ${file.name}\n${file.content.trim()}`)
    .join("\n\n");
  return [
    `Task: ${state.mission.headline}`,
    `Role: ${state.mission.role}`,
    `Channel: #${state.mission.channel}`,
    "",
    sections,
  ].join("\n");
}

function workspaceSnapshot() {
  return state.workspace.files
    .map((file) => `${file.name}\n${file.content.trim().slice(0, 900)}`)
    .join("\n\n");
}

function workspaceFilesForPayload() {
  return state.workspace.files.map((file) => ({
    id: file.id,
    name: file.name,
    path: file.name,
    type: file.type || file.kind,
    kind: file.kind || file.type,
    language: file.language || "",
    content: String(file.content || ""),
  }));
}

function chatTaskContext(selectedChannel, selectedAgent) {
  const currentTask = getCurrentTaskFromSessionStorage();
  return {
    taskTitle: currentTask.title,
    company: currentTask.company,
    role: currentTask.role,
    scenario: currentTask.scenario,
    skills: currentTask.skills,
    files: currentTask.files,
    selectedChannel,
    candidateRole: currentRole(),
    selectedAgent: selectedAgent
      ? {
          id: agentDmKey(selectedAgent),
          backendId: selectedAgent.id,
          name: selectedAgent.name,
          role: selectedAgent.title,
        }
      : null,
  };
}

function isTransientBackendErrorMessage(message) {
  const text = String(message && (message.message || message.content || "") || "").trim();
  return text.includes("Switching to local teammate mode");
}

function normalizeIncomingAgentMessages(messages, channel, targetAgent = null) {
  const normalizedChannel = normalizeChannelId(channel);
  const dmMode = !isTeamChannel(normalizedChannel);
  return (Array.isArray(messages) ? messages : [])
    .map((message) => sanitizeRoomMessage(message))
    .filter((message) => !isHiddenEvaluatorPayload(message))
    .filter((message) => !isTransientBackendErrorMessage(message))
    .filter((message) => {
      const speaker = agentForSpeakerName(message.speaker_name || message.name);
      if (String(message.role || "").toLowerCase() === "user") {
        return false;
      }
      if (dmMode) {
        return targetAgent && speaker && agentDmKey(speaker) === agentDmKey(targetAgent);
      }
      return !speaker || (state.agents || []).some((agent) => agent.id === speaker.id || agentDmKey(agent) === agentDmKey(speaker));
    })
    .map((message) => ({
      ...message,
      channel: dmMode && targetAgent ? agentChannelId(targetAgent) : "team",
      message: replaceUnavailableFileReferences(message.message || message.content || ""),
    }));
}

function triggerPressureBeat(trigger, options = {}) {
  if (state.usingLiveBackend && !options.forceLocal) {
    return false;
  }

  const beat = state.mission.pressureBeats.find((entry) => entry.trigger === trigger && !state.triggeredBeats.has(entry.id));
  if (!beat) {
    return false;
  }

  state.triggeredBeats.add(beat.id);
  crisisStatus.textContent = beat.crisis;
  taskUpdate.textContent = beat.update;
  showToast(beat.crisis);
  addTimelineEvent({
    title: beat.crisis,
    description: beat.update,
    created_at: new Date().toISOString(),
  });
  appendMessagesSequentially(beat.messages.map((message) => ({ ...message, created_at: new Date().toISOString() })), 240);
  return true;
}

function clearDynamicTimers() {
  (state.dynamicTimers || []).forEach((timerId) => window.clearTimeout(timerId));
  state.dynamicTimers = [];
}

function scheduleDynamicEvent(trigger, delayMs) {
  const timerId = window.setTimeout(() => {
    triggerDynamicEscalation(trigger);
  }, delayMs);
  state.dynamicTimers.push(timerId);
}

function scheduleDynamicEvents() {
  clearDynamicTimers();
  scheduleDynamicEvent("metrics-worsened", 45000);
  scheduleDynamicEvent("leadership-eta", 105000);
}

async function triggerDynamicEscalation(trigger) {
  if (state.roomLocked || state.submissionInFlight) {
    return false;
  }

  const triggerKey = `dynamic:${trigger}`;
  if (state.triggeredBeats.has(triggerKey)) {
    return false;
  }
  state.triggeredBeats.add(triggerKey);

  if (!(state.usingLiveBackend || state.sessionId)) {
    return triggerPressureBeat(trigger, { forceLocal: true });
  }

  showTyping("Room is reacting to new information...");
  try {
    const sessionId = await ensureSession();
    const response = await fetch(`${API_BASE_URL}/api/agent/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        session_id: sessionId,
        event_type: "crisis_triggered",
        crisis_trigger: trigger,
        mode: "team",
        taskId: activeTaskId(),
        candidate_name: candidateName(),
        active_file: getActiveFile().name,
        currentTask: chatTaskContext("team", null),
        task_context: backendTaskContext(),
        workspaceFiles: workspaceFilesForPayload(),
        workspace_snapshot: workspaceSnapshot(),
        code: codeEditor.value,
      }),
    });
    const payload = await response.json();
    hideTyping();

    if (!response.ok) {
      throw new Error(payload.error || "Dynamic event failed.");
    }

    setLiveBackendMode(true);
    if (payload.crisis_event) {
      crisisStatus.textContent = payload.crisis_event.severity || "Pressure spike";
      taskUpdate.textContent = payload.crisis_event.impact || payload.crisis_event.message || "";
    }
    updatePhase(payload.phase);
    if (payload.timeline_event) {
      addTimelineEvent(payload.timeline_event);
    }
    appendMessagesSequentially(normalizeIncomingAgentMessages(payload.new_messages, "team", null), 160, 260);
    return true;
  } catch (error) {
    console.error("Dynamic escalation backend error:", error);
    hideTyping();
    setLiveBackendMode(false);
    return triggerPressureBeat(trigger, { forceLocal: true });
  }
}

function maybeTriggerDraftBeat() {
  const content = codeEditor.value.trim();
  if (content.split(/\s+/).filter(Boolean).length >= 80) {
    if (state.usingLiveBackend || state.sessionId) {
      triggerDynamicEscalation("draft-80");
    } else {
      triggerPressureBeat("draft-80");
    }
  }
}

function persistEvaluation(report) {
  const finalReport = {
    ...report,
    session_id: report.session_id || state.sessionId || "",
    user_name: candidateName(),
    user_role: currentRole(),
    task: report.task || {
      title: state.mission.headline,
      role: state.mission.role,
      company: state.mission.company,
      duration: `${state.mission.deadlineMinutes} mins`,
    },
  };

  const savedReport = window.DayZeroSkillRecords
    ? window.DayZeroSkillRecords.store(finalReport, {
        session_id: finalReport.session_id,
        source: "simulation",
      })
    : finalReport;

  localStorage.setItem(STORAGE_KEYS.report, JSON.stringify(finalReport));
  localStorage.setItem("lastEvaluationReport", JSON.stringify(savedReport));
  localStorage.setItem("lastTaskTitle", savedReport.task.title || state.mission.headline);
  localStorage.setItem("lastScore", String(savedReport.overall_score || 0));
  localStorage.setItem("feedback", savedReport.summary || "");
}

function recommendationForScore(score) {
  if (score >= 84) return "Strong hire signal";
  if (score >= 72) return "Promising with follow-up";
  return "Needs more evidence";
}

function buildLocalEvaluationReport(reason = "submitted") {
  const checklist = evaluationChecklist();
  const passed = checklist.passed.length;
  const failed = checklist.failed.length;
  const snapshot = workspaceSnapshot().toLowerCase();
  const defaultSnapshot = defaultWorkspaceForMission(state.mission)
    .files
    .map((file) => `${file.name}\n${String(file.content || "").trim().slice(0, 900)}`)
    .join("\n\n")
    .toLowerCase();
  const workspaceChanged = snapshot.trim() !== defaultSnapshot.trim();
  const changedWordCount = workspaceChanged ? snapshot.split(/\s+/).filter(Boolean).length : 0;
  const explicitTradeoff =
    snapshot.includes("defer") ||
    snapshot.includes("not shipping") ||
    snapshot.includes("rollback") ||
    snapshot.includes("guardrail");
  const timedPenalty = reason === "expired" ? 4 : 0;
  let rawScore = 66 + passed * 7 - failed * 5 + Math.min(state.userMessageCount, 3) * 3 + (explicitTradeoff ? 3 : 0) - timedPenalty;
  if (!workspaceChanged && state.userMessageCount === 0) {
    rawScore = Math.min(rawScore, 32);
  } else if (!workspaceChanged) {
    rawScore = Math.min(rawScore, 44);
  } else if (changedWordCount < 25) {
    rawScore = Math.min(rawScore, 48);
  }
  const overallScore = clampScore(rawScore);

  const scores = {
    leadership: clampScore(overallScore + (state.userMessageCount > 0 ? 2 : -4)),
    communication: clampScore(overallScore + (state.userMessageCount >= 2 ? 3 : -2)),
    ownership: clampScore(overallScore + (codeEditor.value.trim() ? 3 : -5)),
    prioritization: clampScore(overallScore + (explicitTradeoff ? 4 : -3)),
    adaptability: clampScore(overallScore + Math.min((state.triggeredBeats && state.triggeredBeats.size) || 0, 4)),
    technicalDepth: clampScore(overallScore + passed * 2 - failed * 3),
    technicalReasoning: clampScore(overallScore + passed * 2 - failed * 2),
    collaboration: clampScore(overallScore + (state.userMessageCount >= 2 ? 4 : -3)),
    stakeholderManagement: clampScore(overallScore + (snapshot.includes("eta") || snapshot.includes("leadership") || snapshot.includes("customer") || snapshot.includes("enterprise") ? 4 : -2)),
  };

  const pm = state.mission.teammates.find((person) => person.kind === "pm");
  const qa = state.mission.teammates.find((person) => person.kind === "qa");

  return {
    mode: "workspace",
    status: "completed",
    completion_reason: reason === "expired" ? "expired" : "submitted",
    overall_score: overallScore,
    scores,
    rubric: scores,
    recommendation: recommendationForScore(overallScore),
    summary: failed
      ? `Local SkillRecord generated from the workspace and room activity. Strong progress is visible, but ${failed === 1 ? "one area still needs tightening" : `${failed} areas still need tightening`} before this would feel final.`
      : "Local SkillRecord generated from the workspace and room activity. The solution covered the core flow and landed with a believable final recommendation.",
    strengths: checklist.passed.length ? checklist.passed : ["The workspace moved forward with concrete task-aligned changes."],
    weaknesses: checklist.failed,
    observer_notes: [
      "Local evaluation was used to keep the room moving during submission.",
      state.userMessageCount
        ? `The room saw ${state.userMessageCount} candidate update${state.userMessageCount === 1 ? "" : "s"} before submission.`
        : "The final delivery leaned more on workspace edits than room narration.",
    ],
    team_notes: [
      pm
        ? {
            speaker_name: pm.name,
            speaker_title: pm.title,
            strength: checklist.passed[0] || "The recommendation stayed tied to the task.",
            risk: checklist.failed[0] || "The room could still use sharper proof language.",
            score: scores.leadership,
          }
        : null,
      qa
        ? {
            speaker_name: qa.name,
            speaker_title: qa.title,
            strength: checklist.passed[1] || checklist.passed[0] || "Coverage improved through the draft.",
            risk: checklist.failed[1] || checklist.failed[0] || "Residual risk should be called out more explicitly.",
            score: scores.technicalDepth,
          }
        : null,
    ].filter(Boolean),
    next_steps: [
      checklist.failed[0] || "Keep the final recommendation as explicit as the workspace itself.",
      checklist.failed[1] || "Run one more pass that names the remaining risk out loud.",
      "Open another simulation and practice making the final call faster under pressure.",
    ],
    timeline: state.timeline.slice(),
    task: {
      id: activeTaskId(),
      title: state.mission.headline,
      company: state.mission.company,
      role: state.mission.role,
      difficulty: state.mission.priority,
      duration: `${state.mission.deadlineMinutes} mins`,
    },
    submitted_at: new Date().toISOString(),
  };
}

function evaluationChecklist() {
  const snapshot = workspaceSnapshot().toLowerCase();
  switch (state.mission.key) {
    case "netflix":
      return {
        passed: [
          snapshot.includes("rollback") ? "Rollback state is investigated and named." : "",
          snapshot.includes("cache") || snapshot.includes("retry") ? "Cache or retry failure mode is addressed." : "",
          snapshot.includes("eta") || snapshot.includes("leadership") ? "Leadership communication includes timing or executive context." : "",
          snapshot.includes("eu-west") || snapshot.includes("region") ? "Regional impact is considered." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("playback") ? "" : "Playback impact is not connected clearly to the backend incident.",
          snapshot.includes("owner") || snapshot.includes("dante") || snapshot.includes("priya") ? "" : "Owners and validation responsibilities are still unclear.",
          snapshot.includes("circuit") || snapshot.includes("backoff") || snapshot.includes("disable") ? "" : "Mitigation does not yet reduce retry/cache pressure.",
        ].filter(Boolean),
      };
    case "linkedin":
      return {
        passed: [
          snapshot.includes("limited beta") || snapshot.includes("delay") || snapshot.includes("full launch") ? "Launch decision path is explicit." : "",
          snapshot.includes("mobile") ? "Mobile launch risk is acknowledged." : "",
          snapshot.includes("qa") || snapshot.includes("blocker") ? "QA blockers are considered." : "",
          snapshot.includes("cache") || snapshot.includes("guardrail") || snapshot.includes("confidence") ? "AI consistency or guardrail issue is addressed." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("tomorrow") || snapshot.includes("launch") ? "" : "The public launch deadline is not shaping the decision.",
          snapshot.includes("accessibility") || snapshot.includes("onboarding") ? "" : "Onboarding or accessibility risk remains underspecified.",
          snapshot.includes("marketing") || snapshot.includes("leadership") || snapshot.includes("vikram") ? "" : "Stakeholder messaging is not yet leadership-ready.",
        ].filter(Boolean),
      };
    case "spotify":
      return {
        passed: [
          snapshot.includes("retention") || snapshot.includes("day7") || snapshot.includes("day-7") ? "Retention impact is central to the analysis." : "",
          snapshot.includes("onboarding") || snapshot.includes("analytics") ? "Creator workflow friction is considered." : "",
          snapshot.includes("experiment") || snapshot.includes("ab") ? "Experiment conflict is acknowledged." : "",
          snapshot.includes("owner") || snapshot.includes("metric") ? "Recovery plan includes ownership or metrics." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("creator") ? "" : "The affected creator segment is not clear.",
          snapshot.includes("rollback") || snapshot.includes("hotfix") || snapshot.includes("rebalance") ? "" : "Recovery action is not decisive enough.",
          snapshot.includes("conflict") || snapshot.includes("cohort") ? "" : "Conflicting evidence is not handled explicitly.",
        ].filter(Boolean),
      };
    case "openai":
      return {
        passed: [
          snapshot.includes("memory") ? "Memory risk is identified." : "",
          snapshot.includes("sanitize") || snapshot.includes("binding") || snapshot.includes("tenant") ? "Mitigation addresses unsafe memory handling." : "",
          snapshot.includes("restricted demo") || snapshot.includes("go/no-go") || snapshot.includes("delay") ? "Demo decision is explicit." : "",
          snapshot.includes("repro") || snapshot.includes("qa") || snapshot.includes("validation") ? "Validation gate is named." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("leak") || snapshot.includes("prompt") ? "" : "Prompt leakage source is not named clearly.",
          snapshot.includes("rollback") || snapshot.includes("disable") ? "" : "Rollback or emergency mitigation path is missing.",
          snapshot.includes("enterprise") || snapshot.includes("customer") || snapshot.includes("demo") ? "" : "Enterprise stakeholder communication remains too vague.",
        ].filter(Boolean),
      };
    case "mobile":
      return {
        passed: [
          snapshot.includes("retryafter") ? "Resend path accounts for retry timing." : "",
          snapshot.includes("loading") ? "Loading state is represented." : "",
          snapshot.includes("disabled") || snapshot.includes("wrong length") ? "Invalid input or button lockout is handled." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("\\d{6}") ? "" : "OTP validation still does not clearly enforce a six-digit code.",
          snapshot.includes("resend") ? "" : "Resend behavior is still not described clearly.",
        ].filter(Boolean),
      };
    case "login":
      return {
        passed: [
          snapshot.includes("rollback") ? "Rollback path is present." : "",
          snapshot.includes("monitor") || snapshot.includes("logging") ? "Monitoring or audit language exists." : "",
          snapshot.includes("customer") || snapshot.includes("status") ? "Customer-safe communication is covered." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("rollback") ? "" : "Rollback trigger is still missing.",
          snapshot.includes("scope") || snapshot.includes("thin") ? "" : "Fix scope is not yet constrained explicitly.",
        ].filter(Boolean),
      };
    case "ops":
      return {
        passed: [
          snapshot.includes("first user") || snapshot.includes("candidate user") ? "A first user is named." : "",
          snapshot.includes("stale") ? "Stale-data trust is acknowledged." : "",
          snapshot.includes("metric") ? "A launch metric is called out." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("executive") && snapshot.includes("operator") ? "The brief still sounds broad enough to serve too many audiences." : "",
          snapshot.includes("exception") ? "" : "The exception-first view is still not explicit enough.",
        ].filter(Boolean),
      };
    case "wallet":
      return {
        passed: [
          snapshot.includes("idempot") || snapshot.includes("lockout") ? "Duplicate retry protection is described." : "",
          snapshot.includes("reconciliation") ? "Reconciliation follow-up is captured." : "",
          snapshot.includes("support") || snapshot.includes("banner") ? "Customer or support communication is covered." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("duplicate") ? "" : "The duplicate payout risk is still not named clearly in the workspace.",
          snapshot.includes("cut-off") || snapshot.includes("payroll") ? "" : "The cut-off constraint still is not shaping the plan enough.",
        ].filter(Boolean),
      };
    case "copilot":
      return {
        passed: [
          snapshot.includes("fallback") ? "Fallback behavior is defined." : "",
          snapshot.includes("confidence") ? "Confidence handling is described." : "",
          snapshot.includes("retrieval") || snapshot.includes("ground") ? "Grounding or retrieval risk is acknowledged." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("refuse") || snapshot.includes("refusal") ? "" : "The refusal path is still underspecified.",
          snapshot.includes("human") ? "" : "The human escalation path is not yet explicit.",
        ].filter(Boolean),
      };
    case "migration":
      return {
        passed: [
          snapshot.includes("reopen") ? "Traffic reopen rule exists." : "",
          snapshot.includes("rollback") ? "Rollback path is defined." : "",
          snapshot.includes("validate") || snapshot.includes("integrity") ? "Data validation is covered." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("freeze") ? "" : "Write freeze timing still is not explicit enough.",
          snapshot.includes("stale") || snapshot.includes("read") ? "" : "The stale-read risk is not tied clearly to the cutover sequence.",
        ].filter(Boolean),
      };
    default:
      const activeNames = missionFiles().map((file) => String(file.name || "").toLowerCase());
      const firstRequirement = String((state.mission.requirements || [])[0] || "task requirement").toLowerCase();
      return {
        passed: [
          snapshot.includes("decision") || snapshot.includes("first") || snapshot.includes("priority") ? "Decision path is visible." : "",
          snapshot.includes("tradeoff") || snapshot.includes("defer") || snapshot.includes("scope") ? "Tradeoff or scope is named." : "",
          snapshot.includes("test") || snapshot.includes("validate") || snapshot.includes("metric") || snapshot.includes("evidence") ? "Validation evidence is included." : "",
          activeNames.some((name) => snapshot.includes(name)) ? "Workspace references a provided task file." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes(firstRequirement.split(/\s+/)[0]) || snapshot.includes("decision") ? "" : `The handoff is not clearly tied to ${state.mission.requirements[0] || "the first requirement"}.`,
          snapshot.includes("owner") || snapshot.includes("next") ? "" : "Next owner or follow-up is still missing.",
          snapshot.includes("risk") || snapshot.includes("edge") || snapshot.includes("rollback") || snapshot.includes("caveat") ? "" : "Residual risk is not named clearly.",
        ].filter(Boolean),
      };
  }
}

function updatePhase(nextPhase) {
  const rawPhase = String(nextPhase || "").trim().toLowerCase();
  if (!rawPhase) return;
  const normalizedPhase = rawPhase === "intro" ? "planning" : rawPhase;
  phaseLabel.textContent = normalizedPhase
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function storeSessionId(sessionId) {
  state.sessionId = sessionId;
  if (sessionId) {
    localStorage.setItem(sessionStorageKey(), sessionId);
  } else {
    localStorage.removeItem(sessionStorageKey());
  }
}

function setLiveBackendMode(isLive) {
  state.usingLiveBackend = Boolean(isLive);
}

function backendTaskContext() {
  const selectedTask = selectedDashboardTask() || {};
  const currentTask = getCurrentTaskFromSessionStorage();
  return {
    ...selectedTask,
    id: state.mission.taskId,
    company: state.mission.company,
    label: state.mission.sprint,
    title: state.mission.headline,
    taskTitle: state.mission.headline,
    description: state.mission.summary,
    scenario: state.mission.summary,
    role: state.mission.role,
    candidateRole: currentRole(),
    difficulty: state.mission.priority,
    time: `${state.mission.deadlineMinutes} mins`,
    skills: currentTask.skills || state.mission.requirements,
    crisis: state.mission.crisisStatus,
    files: currentTask.files,
    workspaceFiles: workspaceFilesForPayload().map((file) => ({
      id: file.id,
      name: file.name,
      type: file.type || file.kind,
      kind: file.kind || file.type,
      language: file.language,
      content: file.content,
    })),
  };
}

async function createSession() {
  let email = "";
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const userObj = JSON.parse(userStr);
      email = userObj.email || "";
    }
  } catch (e) {
    console.warn("Failed to parse user from localStorage in createSession", e);
  }

  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task_id: activeBackendTaskId(),
      role: currentRole(),
      participant_name: candidateName(),
      task_context: backendTaskContext(),
      email: email,
      candidateEmail: email,
    }),
  });

  if (!response.ok) {
    throw new Error("Could not create session.");
  }
  return response.json();
}

async function fetchSession(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
  if (!response.ok) {
    throw new Error("Could not resume session.");
  }
  return response.json();
}

function consumePreparedSession() {
  const raw = sessionStorage.getItem("dayzero_session_data");
  if (!raw) {
    return null;
  }

  try {
    const payload = JSON.parse(raw);
    if (!payload || !payload.session_id) {
      return null;
    }
    sessionStorage.removeItem("dayzero_session_data");
    return payload;
  } catch (error) {
    sessionStorage.removeItem("dayzero_session_data");
    return null;
  }
}

function hydrateFromSession(payload) {
  if (payload.report && payload.status === "completed") {
    window.clearInterval(state.countdownHandle);
    countdownTimer.textContent = "00:00";
    crisisStatus.textContent = "Completed";
    setRoomLocked(true, "Simulation completed");
    persistEvaluation(payload.report);
    localStorage.removeItem(sessionStorageKey());
    showToast("SkillRecord ready. Opening results...");
    window.setTimeout(() => {
      navigateToResults();
    }, 500);
    return;
  }

  setRoomLocked(false, "");
  clearChat();
  clearTimeline();
  state.timeline = Array.isArray(payload.memory && payload.memory.timeline) ? payload.memory.timeline.slice() : loadTimelineState();
  state.timeline.forEach((entry) => state.timelineKeys.add(uniqueTimelineKey(entry)));
  renderTimeline();
  updatePhase(payload.phase || (payload.memory && payload.memory.phase) || "planning");
  resetCountdown(payload);

  const messages = payload.messages || payload.initial_messages || [];
  if (messages.length) {
    const hasCandidateMessage = messages.some((message) => String(message.role || "").toLowerCase() === "user");
    const openingOnly = !hasCandidateMessage && messages.length <= 5;
    if (openingOnly) {
      appendMessagesSequentially(messages, 350, 850);
    } else {
      messages.forEach(appendChatMessage);
    }
  } else {
    rerenderChat();
  }
}

function openingMessagesForMission() {
  const agents = state.agents && state.agents.length ? state.agents : agentsForMission(state.mission);
  const byId = (id) => agents.find((mate) => mate.id === id) || null;
  const pm = byId("pm") || agents[0] || agentById("pm");
  const anchorId = state.mission.domain === "data"
      ? "data"
      : state.mission.domain === "backend"
        ? "backend"
      : state.mission.domain === "design" || state.mission.domain === "frontend"
        ? "designer"
        : "pm";
  const anchor = byId(anchorId) || agents.find((mate) => mate.id !== (pm && pm.id)) || pm;
  const qa = byId("qa") || agents.find((mate) => mate.id !== (pm && pm.id) && mate.id !== (anchor && anchor.id)) || anchor;
  const firstFile = (state.workspace && state.workspace.files && state.workspace.files[1]) || (state.workspace && state.workspace.files && state.workspace.files[0]) || { name: "task_brief.md" };

  return [
    {
      speaker_name: pm.name,
      speaker_title: pm.title,
      avatar: pm.avatar,
      channel: "team",
      message: `${state.mission.headline}: stabilize the main user-impacting path first, then leave polish for later.`,
    },
    {
      speaker_name: anchor.name,
      speaker_title: anchor.title,
      avatar: anchor.avatar,
      channel: "team",
      message: `Starting with ${firstFile.name}. That should show where the risky behavior lives.`,
    },
    {
      speaker_name: qa.name,
      speaker_title: qa.title,
      avatar: qa.avatar,
      channel: "team",
      message: `Keeping release risk visible. The first thing to prove is: ${state.mission.summary}`,
    },
  ].slice(0, 2);
}

function localAgentForMessage(text, targetAgent = null) {
  if (targetAgent) {
    return targetAgent;
  }

  const mentioned = agentMentionedIn(text);
  if (mentioned) {
    return mentioned;
  }

  const lowered = String(text || "").toLowerCase();
  let preferredId = "pm";
  if (/\b(test|bug|fail|edge|qa|rollback|proof|validate|check)\b/.test(lowered)) {
    preferredId = "qa";
  } else if (/\b(data|metric|analytics|dashboard|sql|csv|experiment|score|report)\b/.test(lowered)) {
    preferredId = "data";
  } else if (/\b(ui|ux|design|screen|copy|mobile|layout|loading|state)\b/.test(lowered)) {
    preferredId = "designer";
  } else if (/\b(api|backend|server|database|retry|token|endpoint|error|code|patch|cache|queue)\b/.test(lowered)) {
    preferredId = "backend";
  }

  const visibleAgents = state.agents && state.agents.length ? state.agents : agentsForMission(state.mission);
  return visibleAgents.find((agent) => agent.id === preferredId)
    || visibleAgents[0]
    || agentById("pm");
}

function localReplyForAgent(agent, text) {
  const focusFile = bestFileForAgent(agent);
  const fileName = focusFile.name || "task_brief.md";
  const lowered = String(text || "").toLowerCase();
  const needsHelp = /\b(help|what should i do|what do i do|where to start|how to start|next step)\b/.test(lowered);

  if (needsHelp) {
    return `Start with ${fileName}. Make one task-specific decision, name the tradeoff, and give the room one proof point.`;
  }

  switch (agent && agent.id) {
    case "backend":
      return `Use ${fileName} to pin down the failing request, error, retry, or rollback path. Smallest safe behavior first; cleanup can wait.`;
    case "designer":
      return `In ${fileName}, make the confusing state obvious: what happened, what the user can do next, and why the flow is safe.`;
    case "qa":
      return `For ${fileName}, prove the messy path before signoff. I want one edge case, the retest signal, and the rollback watch item.`;
    case "data":
      return `Tie the call to one signal in ${fileName}. Name the caveat too, so the room does not overclaim the metric.`;
    case "pm":
    default:
      return `Keep the scope tight for ${state.mission.headline}. Make the first decision, say what waits, and attach one proof point.`;
  }
}

function localFallbackMessagesFor(text, channel, targetAgent = null) {
  const normalizedChannel = normalizeChannelId(channel || "team");
  const primary = localAgentForMessage(text, targetAgent);
  const messageChannel = targetAgent ? agentChannelId(targetAgent) : normalizedChannel;
  const messages = [
    {
      speaker_name: primary.name,
      speaker_title: primary.title,
      avatar: primary.avatar,
      role: "agent",
      channel: messageChannel,
      message: localReplyForAgent(primary, text),
      created_at: new Date().toISOString(),
    },
  ];

  const needsSecondVoice = isTeamChannel(normalizedChannel)
    && /\b(risk|safe|ship|demo|deadline|blocked|bug|fail|rollback|urgent|proof|validate)\b/.test(String(text || "").toLowerCase());
  if (needsSecondVoice) {
    const qa = (state.agents || []).find((agent) => agent.id === "qa") || agentById("qa");
    if (qa && qa.id !== primary.id) {
      messages.push({
        speaker_name: qa.name,
        speaker_title: qa.title,
        avatar: qa.avatar,
        role: "agent",
        channel: "team",
        message: localReplyForAgent(qa, text),
        created_at: new Date().toISOString(),
      });
    }
  }

  return messages.slice(0, 2);
}

function seedLocalRoom() {
  setRoomLocked(false, "");
  clearChat();
  clearTimeline();
  state.timeline = loadTimelineState();
  if (!state.timeline.length) {
    state.timeline = [
      {
        title: "Simulation started",
        description: `${state.mission.company} opened a live sprint around ${state.mission.headline.toLowerCase()}`,
        created_at: new Date().toISOString(),
      },
    ];
  }
  state.timeline.forEach((entry) => state.timelineKeys.add(uniqueTimelineKey(entry)));
  renderTimeline();
  appendMessagesSequentially(
    openingMessagesForMission().map((message) => ({ ...message, created_at: new Date().toISOString() })),
    350,
    850
  );
  resetCountdown();
}

async function startOrResumeSession() {
  const preparedSession = consumePreparedSession();
  if (preparedSession) {
    try {
      storeSessionId(preparedSession.session_id);
      setLiveBackendMode(true);
      hydrateFromSession(preparedSession);
      scrollChatToBottom();
      showToast("Room ready.");
      return;
    } catch (error) {
      storeSessionId(null);
    }
  }

  const storedSessionId = localStorage.getItem(sessionStorageKey());
  try {
    let payload;
    if (storedSessionId) {
      try {
        payload = await fetchSession(storedSessionId);
        storeSessionId(storedSessionId);
      } catch (resumeError) {
        storeSessionId(null);
        payload = await createSession();
        storeSessionId(payload.session_id);
      }
    } else {
      payload = await createSession();
      storeSessionId(payload.session_id);
    }
    setLiveBackendMode(true);
    hydrateFromSession(payload);
    scrollChatToBottom();
    showToast("Room ready.");
  } catch (error) {
    storeSessionId(null);
    setLiveBackendMode(false);
    seedLocalRoom();
    scrollChatToBottom();
    showToast("Running in local simulation mode.");
  }
}

async function ensureSession() {
  if (state.sessionId) {
    return state.sessionId;
  }
  const payload = await createSession();
  storeSessionId(payload.session_id);
  setLiveBackendMode(true);
  return state.sessionId;
}

async function sendRoomMessage(rawText, targetChannel = null) {
  if (state.roomLocked) return;
  const text = String(rawText || "").trim();
  if (!text) return;

  const channel = normalizeChannelId(targetChannel || state.currentChannel || "team");
  const targetAgent = agentForChannel(channel);
  const mode = isTeamChannel(channel) ? "team" : "dm";
  const taskContext = chatTaskContext(channel, targetAgent);

  appendChatMessage({
    speaker_name: candidateName(),
    speaker_title: "You",
    role: "user",
    avatar: "Y",
    message: text,
    created_at: new Date().toISOString(),
    channel: channel,
  });
  candidateMessageInput.value = "";
  autoResizeComposer();

  state.userMessageCount += 1;

  showTyping(targetAgent ? `${targetAgent.name} is typing...` : "Team is typing...");

  try {
    const sessionId = await ensureSession();
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        mode,
        agentId: targetAgent ? agentDmKey(targetAgent) : null,
        taskId: activeTaskId(),
        candidate_name: candidateName(),
        active_file: getActiveFile().name,
        currentTask: taskContext,
        task_context: backendTaskContext(),
        workspaceFiles: workspaceFilesForPayload(),
        workspace_snapshot: workspaceSnapshot(),
        code: codeEditor.value,
        channel_id: channel,
        target_agent_id: targetAgent ? targetAgent.id : null,
      }),
    });
    const payload = await response.json();
    hideTyping();

    if (!response.ok) {
      throw new Error(payload.error || "Chat failed.");
    }

    updatePhase(payload.phase);
    if (payload.timeline_event) {
      addTimelineEvent(payload.timeline_event);
    }

    const newMessages = normalizeIncomingAgentMessages(payload.new_messages, channel, targetAgent);
    if (newMessages.length) {
      appendMessagesSequentially(newMessages);
    }
    if (state.userMessageCount === 2 && isTeamChannel(channel)) {
      window.setTimeout(() => triggerDynamicEscalation("hidden-issue"), 1800);
    }
  } catch (error) {
    console.error("Room chat backend error:", error);
    hideTyping();
    setLiveBackendMode(false);
    appendMessagesSequentially(localFallbackMessagesFor(text, channel, targetAgent), 180, 420);
    addTimelineEvent({
      title: "Local teammate fallback",
      description: "The room used task-specific local teammate replies.",
      created_at: new Date().toISOString(),
    });
    showToast("Using local teammate replies.");
  }
}

async function runChecks() {
  if (state.roomLocked) return;
  const results = evaluationChecklist();
  const hasFailures = results.failed.length > 0;
  testStatus.textContent = hasFailures ? `Checks found ${results.failed.length} issue(s)` : "Checks are green";
  showToast(hasFailures ? "Checks finished with open issues." : "Checks passed.");

  const summary = hasFailures
    ? `I ran the latest checks. These issues are still open: ${results.failed.join(" ")}`
    : `I ran the latest checks. Core coverage is green: ${results.passed.join(" ")}`;

  addTimelineEvent({
    title: hasFailures ? "Checks surfaced open issues" : "Checks passed",
    description: hasFailures ? results.failed.join(" ") : results.passed.join(" "),
    created_at: new Date().toISOString(),
  });

  const channel = normalizeChannelId(state.currentChannel);
  const targetAgent = agentForChannel(channel);
  const mode = isTeamChannel(channel) ? "team" : "dm";
  const taskContext = chatTaskContext(channel, targetAgent);
  showTyping(targetAgent ? `${targetAgent.name} is checking this...` : "Ravi and Kenji are checking this...");

  try {
    const sessionId = await ensureSession();
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: summary,
        mode,
        agentId: targetAgent ? agentDmKey(targetAgent) : null,
        taskId: activeTaskId(),
        candidate_name: candidateName(),
        active_file: getActiveFile().name,
        currentTask: taskContext,
        task_context: backendTaskContext(),
        workspaceFiles: workspaceFilesForPayload(),
        workspace_snapshot: workspaceSnapshot(),
        code: codeEditor.value,
        test_results: results,
        channel_id: channel,
        target_agent_id: targetAgent ? targetAgent.id : null,
      }),
    });
    const payload = await response.json();
    hideTyping();

    if (!response.ok) {
      throw new Error(payload.error || "Checks failed to send.");
    }

    updatePhase(payload.phase);
    if (payload.timeline_event) {
      addTimelineEvent(payload.timeline_event);
    }
    appendMessagesSequentially(normalizeIncomingAgentMessages(payload.new_messages, channel, targetAgent));
  } catch (error) {
    console.error("Run checks backend error:", error);
    hideTyping();
    setLiveBackendMode(false);
    appendMessagesSequentially(localFallbackMessagesFor(summary, channel, targetAgent), 180, 420);
    showToast("Checks handled locally.");
  }
}

function insertOutline() {
  const file = getActiveFile();
  const outline = file.kind === "brief"
      ? [
        "# Decision",
        "",
        "- Current failure:",
        "- First move:",
        "- Deferred on purpose:",
        "- Ship check:",
      ].join("\n")
    : [
        "// Plan",
        "// 1. Protect the broken path first.",
        "// 2. Make the user-facing state explicit.",
        "// 3. Name the residual risk and what we are deferring.",
      ].join("\n");

  const nextValue = codeEditor.value.trim() ? `${codeEditor.value.trim()}\n\n${outline}` : outline;
  codeEditor.value = nextValue;
  updateCurrentFileContent(nextValue);
  scheduleAutoSave();
  maybeTriggerDraftBeat();
  codeEditor.focus();
}

function shareWorkspace() {
  if (state.roomLocked) return;
  const excerpt = codeEditor.value.trim().slice(0, 900);
  if (!excerpt) {
    showToast("Edit the active file before sharing it with the room.");
    return;
  }

  let message;
  let targetChannel = normalizeChannelId(state.currentChannel);

  if (isTeamChannel(targetChannel)) {
    message = `I updated ${getActiveFile().name}. Review this direction:\n\n${excerpt}`;
    showToast("Shared with team.");
  } else {
    const agent = agentForChannel(targetChannel);
    const agentName = agent ? agent.name : "agent";
    message = `I updated ${getActiveFile().name}. Here's what I changed:\n\n${excerpt}`;
    showToast(`Shared with ${agentName}.`);
  }

  sendRoomMessage(message, targetChannel);
}

function requestCritique() {
  if (state.roomLocked) return;
  const excerpt = codeEditor.value.trim().slice(0, 1200);
  if (!excerpt) {
    showToast("Write something in the workspace first so the team has something to critique.");
    return;
  }
  if (isTeamChannel(state.currentChannel)) {
    triggerPressureBeat("critique");
  }
  sendRoomMessage(`Review my current ${getActiveFile().name} draft and tell me what breaks first:\n\n${excerpt}`);
}

async function triggerCrisis() {
  if (state.roomLocked) return;

  if (state.usingLiveBackend || state.sessionId) {
    showTyping("Team is reacting...");
    try {
      const sessionId = await ensureSession();
      const response = await fetch(`${API_BASE_URL}/api/agent/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          event_type: "crisis_triggered",
          crisis_trigger: "manual-crisis",
          mode: "team",
          taskId: activeTaskId(),
          candidate_name: candidateName(),
          active_file: getActiveFile().name,
          currentTask: chatTaskContext("team", null),
          task_context: backendTaskContext(),
          workspaceFiles: workspaceFilesForPayload(),
          workspace_snapshot: workspaceSnapshot(),
          code: codeEditor.value,
        }),
      });
      const payload = await response.json();
      hideTyping();

      if (!response.ok) {
        throw new Error(payload.error || "Crisis failed to send.");
      }

      setLiveBackendMode(true);
      if (payload.crisis_event) {
        crisisStatus.textContent = payload.crisis_event.severity || "Pressure spike";
        taskUpdate.textContent = payload.crisis_event.impact || payload.crisis_event.message || "";
      }
      updatePhase(payload.phase);
      if (payload.timeline_event) {
        addTimelineEvent(payload.timeline_event);
      }
      appendMessagesSequentially(normalizeIncomingAgentMessages(payload.new_messages, "team", null));
      return;
    } catch (error) {
      hideTyping();
      setLiveBackendMode(false);
    }
  }

  triggerPressureBeat("manual-crisis", { forceLocal: true });
}

async function submitSimulation(reason = "submitted") {
  if (state.roomLocked && reason === "submitted") {
    return;
  }
  if (state.submissionInFlight) {
    return;
  }

  const submission = buildSubmission();
  state.submissionInFlight = true;
  clearDynamicTimers();
  setRoomLocked(true, reason === "expired" ? "Time ended - generating SkillRecord..." : "Submitting...");
  showToast(reason === "expired" ? "Time ended - generating SkillRecord..." : "Submitting simulation for evaluation...");

  try {
    const sessionId = await ensureSession();
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submission,
        reason,
        mode: "team",
        taskId: activeTaskId(),
        candidate_name: candidateName(),
        active_file: getActiveFile().name,
        currentTask: chatTaskContext("team", null),
        task_context: backendTaskContext(),
        workspaceFiles: workspaceFilesForPayload(),
        workspace_snapshot: workspaceSnapshot(),
        code: submission,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Submit failed.");
    }

    persistEvaluation(payload.report || payload);
    localStorage.removeItem(sessionStorageKey());
    showToast("Evaluation complete. Opening results...");
    window.setTimeout(() => {
      navigateToResults();
    }, 700);
    return;
  } catch (error) {
    try {
      const fallbackResponse = await fetch(`${API_BASE_URL}/submit-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission,
          role: state.mission.role,
          session_id: state.sessionId,
          reason,
        }),
      });
      const fallbackPayload = await fallbackResponse.json();
      if (!fallbackResponse.ok) {
        throw new Error(fallbackPayload.error || "Fallback submit failed.");
      }
      persistEvaluation(fallbackPayload.report || fallbackPayload);
      localStorage.removeItem(sessionStorageKey());
      showToast("Evaluation complete. Opening results...");
      window.setTimeout(() => {
        navigateToResults();
      }, 700);
    } catch (fallbackError) {
      addTimelineEvent({
        title: "Local SkillRecord generated",
        description: "DayZero created a local evaluation from the current workspace state.",
        created_at: new Date().toISOString(),
      });
      persistEvaluation(buildLocalEvaluationReport(reason));
      storeSessionId(null);
      showToast("Opening local SkillRecord...");
      window.setTimeout(() => {
        navigateToResults();
      }, 700);
    }
  }
}

function resetMissionState(nextMissionKey) {
  clearDynamicTimers();
  const missionConfig = getMissionConfigByKey(nextMissionKey) || getMissionConfigByKey("mobile");
  state.missionKey = nextMissionKey;
  state.mission = personalizeMissionForDashboardTask(clone(missionConfig), selectedDashboardTask());
  state.agents = agentsForMission(state.mission);
  state.mission.teammates = state.agents;
  state.workspace = loadWorkspaceState();
  state.timeline = loadTimelineState();
  state.triggeredBeats = new Set();
  state.dynamicTimers = [];
  state.userMessageCount = 0;
  state.submissionInFlight = false;
  state.allowNavigationAway = false;
  state.currentChannel = "team";
  clearChat();
  clearTimeline();
  renderMission();
  renderTimeline();
  setRoomLocked(false, "");
  startOrResumeSession();
  scheduleDynamicEvents();
}

function switchMission(nextMissionKey) {
  localStorage.setItem(STORAGE_KEYS.selectedMission, nextMissionKey);
  resetMissionState(nextMissionKey);
}

function bindEvents() {
  sendMessageBtn.addEventListener("click", () => sendRoomMessage(candidateMessageInput.value));

  if (workspaceJumpBtn) {
    workspaceJumpBtn.addEventListener("click", () => {
      const workspaceSurface = document.getElementById("workspaceSurface");
      if (document.body.classList.contains("workspace-hidden")) {
        document.body.classList.remove("workspace-hidden");
        showToast("Workspace reopened.");
      }
      if (workspaceSurface) {
        workspaceSurface.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      codeEditor.focus();
    });
  }

  if (refreshSceneBtn) {
    refreshSceneBtn.addEventListener("click", async () => {
      showToast("Refreshing room...");
      await startOrResumeSession();
    });
  }

  if (notifySceneBtn) {
    notifySceneBtn.addEventListener("click", () => openCrisisModal());
  }

  if (peopleBtn) {
    peopleBtn.addEventListener("click", () => {
      document.body.classList.remove("team-glow");
      void document.body.offsetWidth;
      document.body.classList.add("team-glow");
      window.setTimeout(() => document.body.classList.remove("team-glow"), 1300);
      const names = (state.agents || []).map((agent) => agent.name).filter(Boolean).join(", ");
      showToast(`${names || "The team"} and ${candidateName()} are here.`);
    });
  }

  if (closeWorkspaceBtn) {
    closeWorkspaceBtn.addEventListener("click", () => {
      document.body.classList.add("workspace-hidden");
      showToast("Workspace hidden. Use the Workspace button to open it again.");
      candidateMessageInput.focus();
    });
  }

  candidateMessageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendRoomMessage(candidateMessageInput.value);
    }
  });

  candidateMessageInput.addEventListener("input", autoResizeComposer);

  document.addEventListener("keydown", (event) => {
    preventAccidentalRefresh(event);

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveDraft(true);
      return;
    }

    if (event.key === "Escape" && !crisisModal.classList.contains("hidden")) {
      closeCrisisModal();
    }
  });

  window.addEventListener("beforeunload", handleBeforeUnload);

  codeEditor.addEventListener("input", () => {
    updateCurrentFileContent(codeEditor.value);
    scheduleAutoSave();
    maybeTriggerDraftBeat();
  });

  saveDraftBtn.addEventListener("click", () => saveDraft(true));
  insertOutlineBtn.addEventListener("click", insertOutline);
  runTestsBtn.addEventListener("click", runChecks);
  shareWorkspaceBtn.addEventListener("click", shareWorkspace);
  requestCritiqueBtn.addEventListener("click", requestCritique);
  if (submitBtn) submitBtn.addEventListener("click", submitSimulation);
  if (submitSceneBtn) submitSceneBtn.addEventListener("click", submitSimulation);
  if (submitWorkspaceBtn) submitWorkspaceBtn.addEventListener("click", submitSimulation);

  triggerCrisisBtn.addEventListener("click", openCrisisModal);
  closeCrisisModalBtn.addEventListener("click", closeCrisisModal);
  cancelCrisisBtn.addEventListener("click", closeCrisisModal);
  confirmCrisisBtn.addEventListener("click", () => {
    closeCrisisModal();
    triggerCrisis();
  });

  crisisModal.addEventListener("click", (event) => {
    if (event.target === crisisModal) {
      closeCrisisModal();
    }
  });
}

async function init() {
  const role = localStorage.getItem("role") || "candidate";
  const taskId = sessionStorage.getItem(STORAGE_KEYS.dashboardTask) || localStorage.getItem(STORAGE_KEYS.dashboardTask) || "spotify-creator-retention";
  const hasPreparedSession = Boolean(sessionStorage.getItem("dayzero_session_data"));
  
  // Unauthenticated user protection
  const user = localStorage.getItem("user");
  if (!user && role !== "demo user") {
    window.location.href = "../../index.html?auth=false";
    return;
  }

  // Demo user restricted tasks protection
  if (role === "demo user" && !hasPreparedSession) {
    const allowedDemoRooms = ["frontend-homeflow", "spotify-creator-retention"];
    if (allowedDemoRooms.indexOf(taskId) === -1) {
      window.location.href = "dashboard.html?demo=true&locked=true";
      return;
    }
  }

  await hydrateSimulationWorkspaceFiles();
  await hydrateSelectedDashboardTaskWorkspaceFiles();
  bindEvents();
  resetMissionState(selectedMissionKey());
  refreshIcons();
}

init().catch((error) => {
  console.error("Simulation init failed:", error);
  bindEvents();
  resetMissionState(selectedMissionKey());
  refreshIcons();
});
