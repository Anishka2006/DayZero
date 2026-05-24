const API_BASE_URL = localStorage.getItem("dayzero_api_base") || "http://127.0.0.1:5000";
const ORCHESTRATOR_STATE_KEY = "dayzero_orchestrator_state";
const WORKSPACE_FILES_MODULE_PATH = "../../../workspaceFiles.js";
let workspaceFilesModulePromise = null;

function refreshLucideIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function normalizeDashboardPanelTree() {
  const centerPanel = document.querySelector(".center-panel");
  if (!centerPanel) return;

  document.querySelectorAll(".view-panel").forEach((panel) => {
    if (panel.parentElement !== centerPanel) {
      centerPanel.appendChild(panel);
    }
  });
}

function activateDashboardPanel(targetId) {
  if (!targetId) return;
  normalizeDashboardPanelTree();

  document.querySelectorAll(".view-panel").forEach((panel) => {
    const isTarget = panel.id === targetId;
    panel.classList.toggle("hidden", !isTarget);
    panel.classList.toggle("active", isTarget);
  });

  document.querySelectorAll(".menu-item").forEach((item) => {
    item.classList.toggle("active", item.getAttribute("data-target") === targetId);
  });
}

document.addEventListener("click", (event) => {
  const menuItem = event.target.closest(".menu-item[data-target]");
  if (!menuItem) return;

  event.preventDefault();
  activateDashboardPanel(menuItem.getAttribute("data-target"));

  const sidebarEl = document.getElementById("sidebar");
  if (sidebarEl && window.innerWidth <= 960) {
    sidebarEl.classList.remove("show");
  }
}, true);

document.addEventListener("DOMContentLoaded", normalizeDashboardPanelTree);

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

async function hydrateDashboardWorkspaceFiles() {
  const mod = await loadWorkspaceFilesModule();
  const fileMap = (mod && (mod.default || mod.WORKSPACE_FILES)) || window.WORKSPACE_FILES || null;
  if (attachWorkspaceFilesToTaskDefinitions(fileMap)) {
    renderTaskGrid();
  }
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

const DEFAULT_CANDIDATE_ROLE = "Frontend Engineer";
const ROLE_ALIASES = {
  frontend: "Frontend Engineer",
  "frontend developer": "Frontend Engineer",
  "frontend engineer": "Frontend Engineer",
  backend: "Backend Engineer",
  "backend developer": "Backend Engineer",
  "backend engineer": "Backend Engineer",
  pm: "Product Manager",
  product: "Product Manager",
  "product manager": "Product Manager",
  data: "Data Analyst",
  analyst: "Data Analyst",
  "data analyst": "Data Analyst",
  qa: "QA Engineer",
  "qa engineer": "QA Engineer",
  quality: "QA Engineer",
  design: "Product Designer",
  designer: "Product Designer",
  "product designer": "Product Designer"
};

function normalizeCandidateRole(value) {
  const key = String(value || "").trim().toLowerCase();
  return ROLE_ALIASES[key] || (TASKS[String(value || "").trim()] ? String(value).trim() : DEFAULT_CANDIDATE_ROLE);
}

function getCandidateRole() {
  const role = normalizeCandidateRole(localStorage.getItem("userRole"));
  localStorage.setItem("userRole", role);
  return role;
}

function setCandidateRole(role) {
  const normalizedRole = normalizeCandidateRole(role);
  localStorage.setItem("userRole", normalizedRole);
  localStorage.setItem("candidateSetupComplete", "true");
  return normalizedRole;
}

function clearCandidateSimulationState() {
  localStorage.removeItem(ORCHESTRATOR_STATE_KEY);
  localStorage.removeItem("dayzero_task_id");
  localStorage.removeItem("selectedTaskId");
  localStorage.removeItem("dayzero_selected_task_details");
  sessionStorage.removeItem("dayzero_task_id");
  sessionStorage.removeItem("dayzero_role");
  sessionStorage.removeItem("dayzero_difficulty");
  sessionStorage.removeItem("dayzero_selected_task_details");
  sessionStorage.removeItem("dayzero_session_data");
}

function queueSimulationLoading(taskId, taskPayload) {
  if (!taskId) return;

  const payload = taskPayload && typeof taskPayload === "object" ? taskPayload : {};
  localStorage.setItem("dayzero_task_id", taskId);
  localStorage.setItem("selectedTaskId", taskId);
  sessionStorage.setItem("dayzero_task_id", taskId);
  sessionStorage.setItem("dayzero_role", payload.role || getCandidateRole());
  sessionStorage.setItem("dayzero_difficulty", payload.difficulty || localStorage.getItem("userExperience") || "Intermediate");
  sessionStorage.removeItem("dayzero_session_data");

  if (Object.keys(payload).length) {
    const serialized = JSON.stringify(payload);
    localStorage.setItem("dayzero_selected_task_details", serialized);
    sessionStorage.setItem("dayzero_selected_task_details", serialized);
  }
}

refreshLucideIcons();

const focusToggle = document.getElementById("focusToggle");
const collapseBtn = document.getElementById("collapseBtn");
const sidebar = document.getElementById("sidebar");
const mobileMenu = document.getElementById("mobileMenu");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const crisisPopup = document.getElementById("crisisPopup");
const closePopup = document.getElementById("closePopup");
const crisisOptions = document.querySelectorAll(".crisis-option");
const toast = document.getElementById("toast");
const submitBtn = document.getElementById("submitBtn");
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    const role = getCandidateRole();
    const orchestratorState = loadOrchestratorState();

    // Get submission text (adjust selector if needed)
    const submissionInput = document.querySelector("textarea");
    const submission = submissionInput ? submissionInput.value : "No input";

    fetch(`${API_BASE_URL}/submit-task`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        submission: submission,
        role: role,
        session_id: orchestratorState.session_id || null
      })
    })
    .then(res => res.json())
    .then(data => {
      localStorage.setItem("lastScore", data.score);
      localStorage.setItem("feedback", data.feedback);
      if (data.report) {
        const savedReport = window.DayZeroSkillRecords
          ? window.DayZeroSkillRecords.store(data.report, { source: "dashboard-submit" })
          : data.report;
        localStorage.setItem("lastEvaluationReport", JSON.stringify(savedReport));
      }

      showToast("AI Evaluation Complete ✅");

      setTimeout(() => {
        window.location.href = "results.html";
      }, 1500);
    })
    .catch(err => {
      console.error(err);
      showToast("Error submitting work ❌");
    });
  });
}

if (collapseBtn) {
  collapseBtn.addEventListener("click", () => {
    if (sidebar) sidebar.classList.toggle("collapsed");
  });
}

if (mobileMenu) {
  mobileMenu.addEventListener("click", () => {
    if (sidebar) sidebar.classList.toggle("show");
  });
}

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-tab");
    const targetContent = target ? document.getElementById(target) : null;

    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));

    button.classList.add("active");
    if (targetContent) targetContent.classList.add("active");
  });
});

// Sidebar Menu Interaction
const menuItems = document.querySelectorAll(".menu-item");

menuItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    activateDashboardPanel(item.getAttribute("data-target"));
    
    // Optional: On mobile, close sidebar after clicking a link
    if (sidebar && window.innerWidth <= 960) {
      sidebar.classList.remove("show");
    }
  });
});



// Crisis Events
const crisisEvents = [
  {
    title: "Engineering delayed release",
    desc: "A critical engineering dependency slipped by 3 days. What do you do?"
  },
  {
    title: "Budget reduced by 20%",
    desc: "Leadership cut the launch budget unexpectedly. Replan your rollout."
  },
  {
    title: "Competitor launched today",
    desc: "A competitor released a similar feature this morning. Respond fast."
  },
  {
    title: "CEO changed priority",
    desc: "The CEO wants retention over acquisition. Adjust your strategy."
  }
];

function showRandomCrisis() {
  const crisisTitle = document.getElementById("crisisTitle");
  const crisisDesc = document.getElementById("crisisDesc");
  if (!crisisTitle || !crisisDesc) return;

  const randomEvent = crisisEvents[Math.floor(Math.random() * crisisEvents.length)];
  crisisTitle.textContent = randomEvent.title;
  crisisDesc.textContent = randomEvent.desc;
  
  // Show the alert button in the corner instead of forcing the popup
  const alertBtn = document.getElementById("crisisAlertBtn");
  if (alertBtn) {
    alertBtn.classList.remove("hidden");
  }
}

// Show popup after 8 sec, then every 35 sec
setTimeout(showRandomCrisis, 8000);
setInterval(showRandomCrisis, 35000);

const crisisAlertBtn = document.getElementById("crisisAlertBtn");
if (crisisAlertBtn) {
  crisisAlertBtn.addEventListener("click", () => {
    if (crisisPopup) crisisPopup.classList.remove("hidden");
    crisisAlertBtn.classList.add("hidden");
  });
}

if (closePopup) {
  closePopup.addEventListener("click", () => {
    if (crisisPopup) crisisPopup.classList.add("hidden");
  });
}

crisisOptions.forEach(option => {
  option.addEventListener("click", async () => {
    if (crisisPopup) crisisPopup.classList.add("hidden");

    try {
      let orchestratorState = loadOrchestratorState();
      if (!orchestratorState.session_id) {
        orchestratorState = await initializeLiveSimulation(true);
      }

      const candidateResponse = option.textContent.trim();
      if (teamChatHistory && candidateResponse) {
        appendTeamChatMessage("You", "Candidate", candidateResponse, "user");
      }

      const response = await fetch(`${API_BASE_URL}/api/agent/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: orchestratorState.session_id,
          event_type: "crisis_triggered",
          candidate_message: candidateResponse,
          memory: orchestratorState.memory || {},
          scores: orchestratorState.scores || {},
          phase: orchestratorState.phase || "planning"
        })
      });
      const data = await response.json();
      saveOrchestratorState({
        session_id: data.session_id,
        task: data.task || orchestratorState.task || null,
        memory: data.memory || {},
        scores: data.scores || {},
        role: getCandidateRole(),
        phase: data.phase || "crisis"
      });
      appendTeamChatMessage(
        data.agent && data.agent.name ? data.agent.name : "Asha",
        data.agent && data.agent.role ? data.agent.role : "Product Manager",
        data.message || "We need a tighter scope right now."
      );
      showToast("Crisis recorded. The team is reacting live.");
    } catch (error) {
      console.error("Crisis routing error:", error);
      showToast("Crisis recorded, but the live PM response failed.");
    }
  });
});

// Submit Button
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    showToast("Submission successful. Score updated.");
  });
}

function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

function updateCandidateSummary() {
  const role = getCandidateRole();
  const level = localStorage.getItem("userExperience") || "Intermediate";
  const simType = localStorage.getItem("simulationType") || "1-hour Task";
  const summary = document.getElementById("candidateSummary");
  const roleButtons = document.querySelectorAll(".candidate-role-btn");
  const levelButtons = document.querySelectorAll(".candidate-level-btn");
  const typeButtons = document.querySelectorAll(".candidate-simtype-btn");

  roleButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.role === role);
  });
  levelButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.level === level);
  });
  typeButtons.forEach((button) => {
    button.classList.toggle("active", button.dataset.simtype === simType);
  });

  if (summary) {
    summary.innerHTML = `Current profile: <strong>${role}</strong> candidate, <strong>${level}</strong> level, running a <strong>${simType}</strong>. Select a task card to open your unique simulation room.`;
  }

  const topbarBadge = document.getElementById("topbarRoleBadge");
  if (topbarBadge) {
    topbarBadge.innerText = `${role} · ${level}`;
    topbarBadge.innerText = `${role} - ${level}`;
  }

  renderTaskGrid();
}

function getTasksForCurrentProfile() {
  const role = getCandidateRole();
  const level = localStorage.getItem("userExperience") || "Intermediate";
  return (TASKS[role] && TASKS[role][level]) || [];
}

function renderTaskGrid() {
  const taskGrid = document.getElementById("taskGrid");
  if (!taskGrid) return;

  const simType = localStorage.getItem("simulationType") || "1-hour Task";
  const tasks = getTasksForCurrentProfile();

  taskGrid.innerHTML = "";

  if (!tasks.length) {
    taskGrid.innerHTML = `<div class="card" style="padding: 28px; grid-column: span 2;">No tasks available for this profile yet.</div>`;
    return;
  }

  tasks.forEach((task) => {
    const taskTime = simType === "5-day Sprint" ? "5 days" : task.time;

    const card = document.createElement("div");
    card.className = "card task-card";
    card.dataset.taskId = task.id;
    card.style.minHeight = "320px";
    card.style.display = "flex";
    card.style.flexDirection = "column";
    card.style.justifyContent = "space-between";

    card.innerHTML = `
      <div>
        <div class="company-header">
          <div class="company-logo">${task.logo}</div>
          <span class="company-name">${task.company}</span>
        </div>
        <p class="task-label">${task.label}</p>
        <h2>${task.title}</h2>
        <p class="task-desc">${task.description}</p>
      </div>
      <div>
        <div class="task-meta">
          <div class="meta-box"><span>Role</span><strong>${task.role}</strong></div>
          <div class="meta-box"><span>Time</span><strong>${taskTime}</strong></div>
          <div class="meta-box"><span>Difficulty</span><strong>${task.difficulty}</strong></div>
          <div class="meta-box"><span>Team</span><strong>${task.teamSize}</strong></div>
        </div>
        <div class="requirement-list">
          ${task.skills.map(skill => `<div class="req">${skill}</div>`).join("")}
        </div>
      </div>
      <button class="primary-btn start-sim" data-task-id="${task.id}" style="margin-top:18px;">Start Room</button>
    `;

    taskGrid.appendChild(card);
  });

  taskGrid.querySelectorAll('.start-sim').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const taskId = btn.dataset.taskId;
      const selectedTask = tasks.find((task) => task.id === taskId);
      const originalText = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Preparing Room...";
      try {
        const taskPayload = await taskPayloadWithWorkspaceFiles(selectedTask);
        if (taskPayload) {
          queueSimulationLoading(taskId, taskPayload);
        } else {
          queueSimulationLoading(taskId, selectedTask);
        }
        window.location.href = 'loading.html';
      } catch (error) {
        console.warn("Could not attach workspace files to selected task", error);
        if (selectedTask) {
          queueSimulationLoading(taskId, selectedTask);
        } else {
          queueSimulationLoading(taskId);
        }
        window.location.href = 'loading.html';
      } finally {
        btn.disabled = false;
        btn.textContent = originalText;
      }
    });
  });
}

function bindCandidateProfileSelections() {
  document.querySelectorAll(".candidate-role-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const previousRole = getCandidateRole();
      const nextRole = setCandidateRole(btn.dataset.role);
      if (nextRole !== previousRole) {
        clearCandidateSimulationState();
      }
      updateCandidateSummary();
      showToast(`Role set to ${btn.dataset.role}`);
    });
  });

  document.querySelectorAll(".candidate-level-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const previousLevel = localStorage.getItem("userExperience") || "Intermediate";
      localStorage.setItem("userExperience", btn.dataset.level || "Intermediate");
      if ((btn.dataset.level || "Intermediate") !== previousLevel) {
        clearCandidateSimulationState();
      }
      updateCandidateSummary();
      showToast(`Experience set to ${btn.dataset.level}`);
    });
  });

  document.querySelectorAll(".candidate-simtype-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const previousType = localStorage.getItem("simulationType") || "1-hour Task";
      localStorage.setItem("simulationType", btn.dataset.simtype || "1-hour Task");
      if ((btn.dataset.simtype || "1-hour Task") !== previousType) {
        clearCandidateSimulationState();
      }
      updateCandidateSummary();
      showToast(`Simulation type set to ${btn.dataset.simtype}`);
    });
  });
}

function initializeCandidateProfile() {
  setCandidateRole(localStorage.getItem("userRole"));
  if (!localStorage.getItem("userExperience")) {
    localStorage.setItem("userExperience", "Intermediate");
  }
  if (!localStorage.getItem("simulationType")) {
    localStorage.setItem("simulationType", "1-hour Task");
  }
  if (!localStorage.getItem("userName")) {
    localStorage.setItem("userName", "Candidate");
  }
  bindCandidateProfileSelections();
  updateCandidateSummary();
  hydrateDashboardWorkspaceFiles();
}

// Live-feeling teammate nudges for the dashboard feed.
const teamFeed = document.querySelector(".team-feed");
const feedMessages = [
  { role: `<i data-lucide="code" class="icon-sm"></i> Ravi`, text: "Quick gut check: are we fixing the risky path first, or still trying to polish the whole flow?" },
  { role: `<i data-lucide="pen-tool" class="icon-sm"></i> Mira`, text: "I can simplify the screen today, but I need to know which user state we are protecting." },
  { role: `<i data-lucide="shield-check" class="icon-sm"></i> Kenji`, text: "I need the recovery path validated before this feels shippable." },
  { role: `<i data-lucide="megaphone" class="icon-sm"></i> Asha`, text: "Leadership will ask for a crisp call. Give me the tradeoff in one sentence when you can." }
];

setInterval(() => {
  if (!teamFeed) return;
  const msg = feedMessages[Math.floor(Math.random() * feedMessages.length)];
  const item = document.createElement("div");
  item.className = "feed-item";
  
  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  item.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:6px; align-items:center;">
      <span style="font-weight:600; font-size:13px;">${msg.role}</span>
      <small style="color:var(--text-muted); font-size:11px;">${timeStr}</small>
    </div>
    <p style="margin-bottom:12px;">${msg.text}</p>
    <div class="feed-actions" style="display:flex; gap:8px;">
      <button class="secondary-btn small reply-feed-btn" style="flex:1;">Reply</button>
      <button class="secondary-btn small resolve-feed-btn" style="flex:1;">Resolve</button>
    </div>
  `;
  teamFeed.prepend(item);
  refreshLucideIcons();

  const actionsDiv = item.querySelector('.feed-actions');
  const replyBtn = item.querySelector('.reply-feed-btn');
  const resolveBtn = item.querySelector('.resolve-feed-btn');

  replyBtn.addEventListener('click', () => {
    // Show chat input
    actionsDiv.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px; width:100%;">
        <textarea class="reply-input" placeholder="Type your reply..." rows="2" style="width:100%; padding:8px; border-radius:6px; border:1px solid var(--border); font-family:inherit; font-size:13px; resize:none; outline:none;"></textarea>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="secondary-btn small cancel-reply-btn">Cancel</button>
          <button class="primary-btn small send-reply-btn">Send</button>
        </div>
      </div>
    `;
    
    // Focus the input
    const input = actionsDiv.querySelector('.reply-input');
    input.focus();

    // Handle Send
    actionsDiv.querySelector('.send-reply-btn').addEventListener('click', () => {
      const replyText = input.value.trim() || "Okay, I'll look into it.";
      item.style.background = "var(--bg)";
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-weight:600; font-size:13px;">${msg.role}</span>
          <small style="color:var(--text-muted); font-size:11px;">${timeStr}</small>
        </div>
        <p style="margin-bottom:12px; color:var(--text-muted);">${msg.text}</p>
        <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:10px; border-radius:6px; margin-top:10px;">
          <strong style="font-size:12px; color:var(--blue);">You:</strong>
          <p style="font-size:13px; margin-top:4px;">${replyText}</p>
        </div>
        <div style="margin-top:10px; text-align:right;">
          <span style="color:var(--green); font-size:12px; font-weight:600;">Replied ✓</span>
        </div>
      `;
      if (typeof addTimelineEvent === 'function') addTimelineEvent('Replied to Teammate');
    });

    // Handle Cancel
    actionsDiv.querySelector('.cancel-reply-btn').addEventListener('click', () => {
      actionsDiv.innerHTML = `
        <button class="secondary-btn small reply-feed-btn" style="flex:1;">Reply</button>
        <button class="secondary-btn small resolve-feed-btn" style="flex:1;">Resolve</button>
      `;
      // Re-attach listeners is complex, so we just grey it out or we could just mark it resolved.
      // Easiest is just to restore original behavior via page refresh, but for a mockup, let's just make it look resolved if cancelled.
      actionsDiv.innerHTML = `<button class="secondary-btn small" disabled style="width:100%;">Cancelled</button>`;
    });
  });
  
  resolveBtn.addEventListener('click', () => {
    item.style.opacity = '0.6';
    actionsDiv.innerHTML = `
      <button class="secondary-btn small" disabled style="flex:1; background:var(--green); color:white; border:none;">Resolved ✓</button>
    `;
    if (typeof addTimelineEvent === 'function') addTimelineEvent('Resolved Teammate Request');
  });

  if (teamFeed.children.length > 5) {
    teamFeed.removeChild(teamFeed.lastElementChild);
  }
}, 12000);

// AI Conflict Engine
setTimeout(() => {
  if (!teamFeed) return;
  const item = document.createElement("div");
  item.className = "feed-item";
  item.style.borderColor = "var(--amber)";
  item.innerHTML = `
    <span><i data-lucide="code" class="icon-sm"></i> Ravi</span>
    <p>I can make the core fix today. The broader cleanup is more like three weeks. Do we scope down or move the date?</p>
    <div style="margin-top: 12px; display: flex; gap: 8px;">
      <button class="primary-btn small" onclick="this.parentElement.innerHTML='<i>Accepted delay.</i>'; showToast('Adaptability +2');">Delay Launch</button>
      <button class="secondary-btn small" onclick="this.parentElement.innerHTML='<i>Negotiating scope...</i>'; showToast('Leadership +5');">Negotiate Scope</button>
    </div>
  `;
  teamFeed.prepend(item);
  refreshLucideIcons();
  if (teamFeed.children.length > 5) {
    teamFeed.removeChild(teamFeed.lastElementChild);
  }
}, 15000);

// Interview Modal Logic
const interviewPopup = document.getElementById("interviewPopup");
const closeInterview = document.getElementById("closeInterview");
const exitBtn = document.querySelector(".exit-btn");

if (closeInterview) {
  closeInterview.addEventListener("click", () => {
    if (interviewPopup) interviewPopup.classList.add("hidden");
  });
}

if (exitBtn) {
  exitBtn.addEventListener("click", () => {
    // Show the Live Interview overlay instead of exiting
    if (interviewPopup) interviewPopup.classList.remove("hidden");
  });
}

// Re-initialize icons just in case new html needs it
refreshLucideIcons();

// Sprint console logic.
const SPRINT_CONSOLE_MODEL = "x-ai/grok-4.3";

const managerStyleSelect = document.getElementById("managerStyleSelect");
const managerMsgs = document.getElementById("managerMsgs");
const managerActions = document.querySelectorAll(".console-chip");
const typingIndicator = document.getElementById("typingIndicator");
const managerInput = document.getElementById("aiManagerInput");
const managerSendBtn = document.getElementById("aiManagerSendBtn");

const systemPrompts = {
  "Strict": "You are a direct but human sprint coach in a live work simulation. Speak like a busy teammate on Slack: concise, specific, and practical. Ask for the next decision, owner, or proof. Do not use corporate filler.",
  "Supportive": "You are a supportive sprint coach in a live work simulation. Sound like a real coworker: warm, concise, and specific. Acknowledge the user's move, then suggest the next practical step.",
  "Startup Founder": "You are a startup founder in a tense sprint. Sound energetic but real, like someone in the room trying to make a call. Be brief, concrete, and avoid buzzword parody.",
  "Corporate VP": "You are a senior VP in a product review. Sound polished but still human. Keep it brief, name the business risk, and ask for one clear next step."
};

function localHumanManagerReply(userMessage, style) {
  const text = String(userMessage || "").toLowerCase();
  if (text.includes("hint") || text.includes("help")) {
    return "Start with the smallest decision the team can act on. Name the risky path, the file or metric you checked, and what you would validate next.";
  }
  if (text.includes("pressure") || text.includes("urgent") || text.includes("crisis")) {
    return "Okay, then make it smaller. Tell the room what we are protecting right now, what we are deliberately not fixing, and who owns the next check.";
  }
  if (text.includes("review") || text.includes("feedback")) {
    return "You are close, but make the evidence sharper. I would add one line on the tradeoff and one line on how QA knows this is safe.";
  }
  if (style === "Strict") {
    return "Good, but make the call explicit. What ships now, what waits, and what proof closes the risk?";
  }
  if (style === "Startup Founder") {
    return "I like the direction. Cut it down to the move that changes the outcome today, then tell the team exactly what to do next.";
  }
  if (style === "Corporate VP") {
    return "This is useful. Tie it back to customer impact and give me a clear owner for the next milestone.";
  }
  return "That is a reasonable start. I would make the tradeoff explicit, then ask Ravi or QA for the one check that proves the plan is safe.";
}

function addManagerMessage(text, isUser = false) {
  if (!managerMsgs) return;
  const msg = document.createElement("div");
  msg.className = "console-msg-card " + (isUser ? "user" : "default");
  
  let iconHtml = isUser ? '' : '<div class="msg-icon"><i data-lucide="message-square" class="icon-sm"></i></div>';
  
  // Convert markdown bold to simple html
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  msg.innerHTML = `
    ${iconHtml}
    <div class="msg-content">
      <p>${formattedText}</p>
    </div>
  `;
  
  if (typingIndicator) {
  managerMsgs.insertBefore(msg, typingIndicator);
  } else {
    managerMsgs.appendChild(msg);
  }
  refreshLucideIcons();
  managerMsgs.scrollTop = managerMsgs.scrollHeight; // Scroll to bottom
}

function addAiAlert(type, text) {
  const msg = document.createElement("div");
  msg.className = "console-msg-card " + type;
  
  let iconName = 'lightbulb';
  if (type === 'approval') iconName = 'check-circle';
  if (type === 'risk') iconName = 'alert-triangle';
  
  msg.innerHTML = `
    <div class="msg-icon"><i data-lucide="${iconName}" class="icon-sm"></i></div>
    <div class="msg-content">
      <p>${text}</p>
    </div>
  `;
  
  const managerMsgs = document.getElementById("managerMsgs");
  const typingIndicator = document.getElementById("typingIndicator");
  if (managerMsgs) {
    if (typingIndicator) {
      managerMsgs.insertBefore(msg, typingIndicator);
    } else {
      managerMsgs.appendChild(msg);
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
    managerMsgs.scrollTop = managerMsgs.scrollHeight;
  }
}

function addTimelineEvent(actionText) {
  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  
  const shortText = actionText.length > 35 ? actionText.substring(0, 35) + '...' : actionText;

  document.querySelectorAll(".timeline").forEach(timeline => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${timeStr}</span> ${shortText}`;
    timeline.appendChild(li);
    
    if (timeline.children.length > 8) {
      timeline.removeChild(timeline.firstElementChild);
    }
  });
  
  // Dynamically generate AI Alert based on the action
  if (typeof addAiAlert === 'function') {
    const textLower = actionText.toLowerCase();
    // Do not generate AI alerts for literal chat prompts
    if (textLower.includes('ai prompt:')) return;

    let type = 'hint';
    let alertMsg = `Noted: ${shortText}`;
    
    if (textLower.includes('replied') || textLower.includes('resolved')) {
       type = 'approval';
       alertMsg = 'Good communication. Team alignment improved.';
    } else if (textLower.includes('started task')) {
       type = 'hint';
       alertMsg = 'Task tracking initiated. Watch your time blocks.';
    } else if (textLower.includes('override') || textLower.includes('high pressure') || textLower.includes('critical')) {
       type = 'risk';
       alertMsg = 'Warning: Pressure levels elevated. Monitor team stress.';
    } else if (textLower.includes('synced') || textLower.includes('submitted')) {
       type = 'approval';
       alertMsg = 'Submission received. Analyzing deliverables...';
    } else if (textLower.includes('provisioning') || textLower.includes('established')) {
       type = 'hint';
       alertMsg = 'Workspace active. KPI tracking started.';
    }
    
    // Slight delay to make it feel like AI is reacting
    setTimeout(() => {
      addAiAlert(type, alertMsg);
    }, 1500);
  }
}

function advanceCalendarProgress() {
  const panel = document.getElementById("panel-calendar");
  if (!panel) return;
  const inProgressFill = panel.querySelector(".progress-bar-fill.pulse");
  if (inProgressFill) {
    let width = parseInt(inProgressFill.style.width) || 30;
    if (width < 100) {
      width = Math.min(100, width + 35);
      inProgressFill.style.width = width + "%";
      const textSpan = inProgressFill.closest(".progress-wrap").querySelector(".timeline-progress-text");
      if (textSpan) {
        textSpan.innerText = width === 100 ? "Completed" : "In Progress (" + width + "%)";
      }
      if (width === 100) {
        inProgressFill.classList.remove("pulse");
        inProgressFill.style.background = "var(--green)";
      }
    }
  }
}

async function loadProfile() {
  const response = await fetch("http://127.0.0.1:5000/api/user-profile");
  const data = await response.json();

  document.getElementById("candidateName").innerText = data.name;

  document.getElementById("candidateRole").innerText = data.role;

  document.getElementById("candidateAvatar").innerText =
      data.name
          .split(" ")
          .map(word => word[0])
          .join("");
}

loadProfile();

async function simulateAiResponse(userMessage) {
  advanceCalendarProgress();
  addTimelineEvent('AI Prompt: ' + userMessage);
  // Consistency update (replaces AI prompts)
  const consistEl = document.getElementById("statConsistency");
  if (consistEl) {
    consistEl.innerText = "Excellent";
  }

  if (typingIndicator) {
    typingIndicator.classList.remove("hidden");
    if (managerMsgs) managerMsgs.scrollTop = managerMsgs.scrollHeight;
  }
  
  const style = managerStyleSelect ? managerStyleSelect.value : "Supportive";
  const basePrompt = systemPrompts[style] || systemPrompts["Supportive"];
  const systemPrompt = basePrompt + " Reply in 1-2 short sentences. Use contractions naturally. Avoid phrases like 'action logged', 'as an AI', 'I will continue to evaluate', 'synergy', or 'deliverables'. IMPORTANT: At the very end of your response, provide exactly 2 short quick-reply suggestions for the user. Format them exactly like this: [Suggestion: I will name the owner] [Suggestion: I need one more signal]";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: SPRINT_CONSOLE_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();
    clearTimeout(timeoutId);
    if (typingIndicator) typingIndicator.classList.add("hidden");

    if (data.choices && data.choices.length > 0) {
      let reply = data.choices[0].message.content;
      
      const suggestions = [];
      const regex = /\[Suggestion:\s*(.*?)\]/g;
      let match;
      while ((match = regex.exec(reply)) !== null) {
        suggestions.push(match[1]);
      }
      reply = reply.replace(/\[Suggestion:\s*(.*?)\]/g, '').trim();
      
      addManagerMessage(reply);
      if (suggestions.length > 0) {
        updateManagerActions(suggestions);
      }
    } else {
      console.error("API Error:", data);
      addManagerMessage(localHumanManagerReply(userMessage, style), false);
    }
  } catch (err) {
    if (typingIndicator) typingIndicator.classList.add("hidden");
    console.error("Network Error:", err);
    addManagerMessage(localHumanManagerReply(userMessage, style), false);
  }
}

// Ensure typing indicator is hidden by default
if (typingIndicator) {
  typingIndicator.classList.add("hidden");
}

// Button actions
managerActions.forEach(btn => {
  btn.addEventListener("click", () => {
    addManagerMessage(btn.textContent, true);
    simulateAiResponse(btn.textContent);
  });
});

// Inline Chat Input
if (managerSendBtn && managerInput) {
  const sendInputMsg = () => {
    const text = managerInput.value.trim();
    if (text) {
      addManagerMessage(text, true);
      simulateAiResponse(text);
      managerInput.value = "";
    }
  };
  managerSendBtn.addEventListener("click", sendInputMsg);
  managerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendInputMsg();
  });
}

function openRequestedSprintConsole() {
  if (localStorage.getItem("dayzero_open_sprint_console") !== "true") return;
  localStorage.removeItem("dayzero_open_sprint_console");

  const consoleCard = document.querySelector(".console-card");
  if (consoleCard) {
    consoleCard.classList.add("console-focus");
    consoleCard.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => consoleCard.classList.remove("console-focus"), 1800);
  }

  if (managerInput) {
    setTimeout(() => managerInput.focus(), 350);
  }
}

openRequestedSprintConsole();

// Style change event
if (managerStyleSelect) {
  managerStyleSelect.addEventListener("change", () => {
    addManagerMessage(`System Notice: AI Mentor personality reconfigured to [${managerStyleSelect.value}].`, false);
    simulateAiResponse(`Reply in a ${managerStyleSelect.value} tone with one task-focused next step. Do not ask for personal background.`);
  });
}

function updateManagerActions(suggestions) {
  const container = document.getElementById("managerActionsContainer");
  if (!container) return;
  container.innerHTML = "";
  suggestions.forEach(sugg => {
    const btn = document.createElement("button");
    btn.className = "console-chip";
    btn.textContent = sugg;
    btn.addEventListener("click", () => {
      addManagerMessage(sugg, true);
      simulateAiResponse(sugg);
    });
    container.appendChild(btn);
  });
}

// Focus Mode Logic
if (focusToggle) {
  focusToggle.addEventListener("change", (e) => {
    const rightPanel = document.querySelector(".right-panel");
    if (e.target.checked) {
      document.body.classList.add("focus-mode");
      if (rightPanel) rightPanel.style.display = "none";
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log("Error attempting to enable full-screen mode:", err.message);
        });
      }
    } else {
      document.body.classList.remove("focus-mode");
      if (rightPanel) rightPanel.style.display = "";
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.log("Error attempting to disable full-screen mode:", err.message);
        });
      }
    }
  });

  // Handle ESC key or browser exiting full screen manually
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      focusToggle.checked = false;
      document.body.classList.remove("focus-mode");
      const rightPanel = document.querySelector(".right-panel");
      if (rightPanel) rightPanel.style.display = "";
    }
  });

  // Simulation boot is handled later by initializeLiveSimulation().
}

// Collapsible Cards Logic
const collapsibleHeaders = document.querySelectorAll(".collapsible-header");
collapsibleHeaders.forEach(header => {
  header.addEventListener("click", () => {
    const parent = header.parentElement;
    parent.classList.toggle("expanded");
  });
});

// ==========================================
// SKILL AUTHENTICATION & EMERGENCY LOGIC
// ==========================================
const authSkillBtn = document.getElementById("authSkillBtn");
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const authTimerEl = document.getElementById("authTimer");
const authCbs = document.querySelectorAll(".auth-cb");
const submitAuthBtn = document.getElementById("submitAuthBtn");
const authStatus = document.getElementById("authStatus");

let authInterval;
let authTimeLeft = 60;

if (authSkillBtn && authModal) {
  authSkillBtn.addEventListener("click", () => {
    authModal.classList.remove("hidden");
    authTimeLeft = 60;
    authTimerEl.textContent = `${authTimeLeft}s`;
    
    // Start rapid timer
    clearInterval(authInterval);
    authInterval = setInterval(() => {
      authTimeLeft--;
      authTimerEl.textContent = `${authTimeLeft}s`;
      
      if (authTimeLeft <= 10) {
        authTimerEl.style.animation = "pulseRed 1s infinite";
      }
      
      if (authTimeLeft <= 0) {
        clearInterval(authInterval);
        alert("Time expired! Your execution speed was too slow for this crisis.");
        authModal.classList.add("hidden");
      }
    }, 1000);
  });

  closeAuthModal.addEventListener("click", () => {
    authModal.classList.add("hidden");
    clearInterval(authInterval);
  });
  
  // Validation logic: exactly 2 items must be checked
  authCbs.forEach(cb => {
    cb.addEventListener("change", () => {
      const checkedCount = document.querySelectorAll(".auth-cb:checked").length;
      if (checkedCount === 2) {
        submitAuthBtn.disabled = false;
        submitAuthBtn.style.opacity = "1";
        authStatus.textContent = "Ready to submit";
        authStatus.style.color = "var(--green)";
      } else {
        submitAuthBtn.disabled = true;
        submitAuthBtn.style.opacity = "0.5";
        authStatus.textContent = `Select exactly 2 (${checkedCount}/2)`;
        authStatus.style.color = "inherit";
      }
    });
  });
  
  submitAuthBtn.addEventListener("click", () => {
    clearInterval(authInterval);
    authModal.classList.add("hidden");
    
    // Show success toast
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = "Authentication Successful! Skill verified.";
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 3000);
    }
    
    // Change the emergency button to verified state
    authSkillBtn.textContent = "✓ Skill Verified";
    authSkillBtn.style.background = "var(--green)";
    authSkillBtn.style.borderColor = "var(--green)";
    authSkillBtn.classList.remove("pulse");
    authSkillBtn.disabled = true;
  });
}

// ==========================================
// SUBMISSION BAR AI BUTTONS
// ==========================================
const requestHintBtn = document.getElementById("requestHintBtn");
const askAiMentorBtn = document.getElementById("askAiMentorBtn");

if (requestHintBtn) {
  requestHintBtn.addEventListener("click", () => {
    addManagerMessage("System Notice: Simulation hint requested.", false);
    simulateAiResponse("I need a helpful, actionable hint for the current task: 'Launch New Feature for Mobile Users'. Please analyze the work required and provide a specific suggestion.");
  });
}

if (askAiMentorBtn) {
  askAiMentorBtn.addEventListener("click", () => {
    addManagerMessage("System Notice: AI Mentor review requested.", false);
    simulateAiResponse("Please act as my AI Mentor. Review my current simulation progress and give me a piece of constructive feedback or advice on how to improve my performance.");
  });
}

// ==========================================
// VOICE RECORDING & ANALYSIS LOGIC
// ==========================================
const startVoiceBtn = document.getElementById("startVoiceBtn");
const interviewActions = document.getElementById("interviewActions");
const recordingState = document.getElementById("recordingState");
const stopVoiceBtn = document.getElementById("stopVoiceBtn");
const recordTimer = document.getElementById("recordTimer");
const analysisState = document.getElementById("analysisState");
const analysisIcon = document.getElementById("analysisIcon");
const analysisStatus = document.getElementById("analysisStatus");


let voiceTimerInterval;
let voiceSeconds = 0;

if (startVoiceBtn && recordingState) {
  startVoiceBtn.addEventListener("click", () => {
    interviewActions.classList.add("hidden");
    recordingState.classList.remove("hidden");
    
    voiceSeconds = 0;
    recordTimer.textContent = "00:00";
    
    voiceTimerInterval = setInterval(() => {
      voiceSeconds++;
      const m = String(Math.floor(voiceSeconds / 60)).padStart(2, '0');
      const s = String(voiceSeconds % 60).padStart(2, '0');
      recordTimer.textContent = `${m}:${s}`;
    }, 1000);
  });

  stopVoiceBtn.addEventListener("click", () => {
    clearInterval(voiceTimerInterval);
    recordingState.classList.add("hidden");
    analysisState.classList.remove("hidden");
    
    // Simulate AI voice analysis delay
    setTimeout(() => {
      // Human verified state
      if(analysisIcon) {
        analysisIcon.innerHTML = '<i data-lucide="shield-check" class="icon-lg" style="color: var(--green);"></i>';
        refreshLucideIcons();
      }
      analysisStatus.textContent = "Voice signature verified: 100% Human.";
      analysisStatus.style.color = "var(--green)";
      
      // Auto-submit after verification
      setTimeout(() => {
        analysisState.classList.add("hidden");
        interviewActions.classList.remove("hidden");
        if(interviewPopup) {
          interviewPopup.classList.add("hidden");
        }
        
        // Show success and simulate AI processing the answer
        const toast = document.getElementById("toast");
        if (toast) {
          toast.textContent = "Audio response submitted successfully.";
          toast.classList.remove("hidden");
          setTimeout(() => toast.classList.add("hidden"), 3000);
        }
        
        // Update Skill Points based on Voice Recording
        const commVal = document.getElementById("val-communication");
        const commBar = document.getElementById("bar-communication");
        if (commVal && commBar) {
          let currentScore = parseInt(commVal.textContent);
          if (currentScore < 100) {
            let newScore = Math.min(100, currentScore + 4);
            commVal.textContent = newScore;
            commBar.style.width = newScore + "%";
            commBar.style.background = "var(--green)"; // Highlight update
            setTimeout(() => {
              commBar.style.background = ""; // Revert to default
            }, 2000);
          }
        }
        
        const confVal = document.getElementById("statConfidence");
        if (confVal) {
          confVal.textContent = "94%";
          confVal.style.color = "var(--green)";
        }
        
        addManagerMessage("System Notice: Audio response submitted (Human Verified). +4 Communication.", false);
        simulateAiResponse("I just listened to your audio response regarding user retention. That makes sense, focusing on the core user base during a budget cut is a solid strategy.");
        
        // Reset analysis state for next time
        setTimeout(() => {
          if(analysisIcon) {
            analysisIcon.innerHTML = '<i data-lucide="cpu" class="icon-lg pulse" style="color: var(--indigo);"></i>';
          }
          analysisStatus.textContent = "Analyzing voice signature for AI generation...";
          analysisStatus.style.color = "inherit";
        }, 1000);
        
      }, 2000);
      
    }, 3000);
  });
}

// ==========================================
// TOPBAR INTERACTIVITY LOGIC
// ==========================================
const pressureMeter = document.getElementById("pressureMeter");
const pressureText = document.getElementById("pressureText");
const autoSaveBtn = document.getElementById("autoSaveBtn");

if (pressureMeter && pressureText) {
  const states = [
    { class: "low", text: "Pressure: Low", color: "var(--green)" },
    { class: "medium", text: "Pressure: Medium", color: "var(--yellow)" },
    { class: "high", text: "Pressure: High", color: "var(--red)" }
  ];
  let currentStateIdx = 1; // Starts at medium
  document.body.classList.add('pressure-medium');

  pressureMeter.addEventListener("click", () => {
    // Remove old class
    pressureMeter.classList.remove(states[currentStateIdx].class);
    document.body.classList.remove(`pressure-${states[currentStateIdx].class}`);
    
    // Cycle to next state
    currentStateIdx = (currentStateIdx + 1) % states.length;
    const nextState = states[currentStateIdx];
    
    // Add new class and update text
    pressureMeter.classList.add(nextState.class);
    document.body.classList.add(`pressure-${nextState.class}`);
    pressureText.textContent = nextState.text;
    
    // Quick pulse animation to show feedback
    pressureMeter.style.transform = "scale(0.95)";
    setTimeout(() => {
      pressureMeter.style.transform = "scale(1)";
    }, 100);
    
    // Optional: Log an event to the AI Manager
    addManagerMessage(`System Notice: Simulation pressure manually overridden to ${nextState.text.split(': ')[1]}.`, false);
    if(nextState.class === 'high') {
      simulateAiResponse("I see you've increased the pressure. Let's focus on rapid execution and prioritization.");
    }
  });
}

if (autoSaveBtn) {
  let isSaving = false;
  autoSaveBtn.addEventListener("click", () => {
    if (isSaving) return;
    isSaving = true;
    
    // Stats update
    const revEl = document.getElementById("statRevisions");
    if (revEl) {
      let revs = parseInt(revEl.innerText, 10) || 6;
      revs++;
      revEl.innerText = revs < 10 ? `0${revs}` : revs;
    }
    
    autoSaveBtn.innerHTML = '↻ Saving...';
    autoSaveBtn.style.color = "var(--text-color)";
    autoSaveBtn.classList.remove("pulse");
    
    // Simulate network delay
    setTimeout(() => {
      autoSaveBtn.innerHTML = '● Auto Saved';
      autoSaveBtn.style.color = "var(--green)";
      autoSaveBtn.classList.add("pulse");
      isSaving = false;
      
      const toast = document.getElementById("toast");
      if (toast) {
        toast.textContent = "Manual save completed successfully.";
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 3000);
      }
    }, 1200);
  });
}

// ==========================================
// PROJECT CARD INTERACTIVITY
// ==========================================
document.querySelectorAll(".project-card").forEach(card => {
  const applyBtn = card.querySelector(".primary-btn");
  const viewBtn = card.querySelector(".secondary-btn");
  
  if (applyBtn && applyBtn.textContent.includes("Apply")) {
    applyBtn.addEventListener("click", () => {
      const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Evan", "Fiona", "George", "Hannah", "Ian", "Julia"];
      const lastNames = ["Smith", "Jones", "Chen", "Lee", "Wright", "Patel", "Kim", "Nguyen", "Garcia", "Martinez"];
      const t1 = `${firstNames[Math.floor(Math.random()*firstNames.length)]} ${lastNames[Math.floor(Math.random()*lastNames.length)]}`;
      const t2 = `${firstNames[Math.floor(Math.random()*firstNames.length)]} ${lastNames[Math.floor(Math.random()*lastNames.length)]}`;
      const e1 = t1.split(" ")[0].toLowerCase() + "@dayzero.io";
      const e2 = t2.split(" ")[0].toLowerCase() + "@dayzero.io";

      // Create Overlay
      const overlay = document.createElement("div");
      overlay.className = "onboarding-overlay";
      overlay.innerHTML = `
        <div class="onboard-modal">
          <h2 style="margin-bottom:20px; color:var(--text);">Initializing Workspace...</h2>
          <ul class="onboard-steps">
            <li id="step1"><i data-lucide="loader-2" class="icon-sm pulse"></i> Opens a project workspace...</li>
            <li id="step2" class="hidden"><i data-lucide="loader-2" class="icon-sm pulse"></i> Creates team room...</li>
            <li id="step3" class="hidden"><i data-lucide="loader-2" class="icon-sm pulse"></i> Assigns roles...</li>
            <li id="step4" class="hidden"><i data-lucide="loader-2" class="icon-sm pulse"></i> Signing in ${t1} (Backend) & ${t2} (QA) with email...</li>
            <li id="step5" class="hidden"><i data-lucide="loader-2" class="icon-sm pulse"></i> Assigns tasks to everyone...</li>
          </ul>
        </div>
      `;
      document.body.appendChild(overlay);
      if (typeof lucide !== 'undefined') lucide.createIcons();

      // Inject CSS once
      if (!document.getElementById("onboardCss")) {
        const style = document.createElement("style");
        style.id = "onboardCss";
        style.innerHTML = `
          .onboarding-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(248, 250, 252, 0.9);
            backdrop-filter: blur(10px);
            z-index: 9999;
            display: flex; justify-content: center; align-items: center;
          }
          .onboard-modal {
            background: #fff; border: 1px solid var(--border); border-radius: 16px;
            padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); width: 450px;
          }
          .onboard-steps { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 15px; }
          .onboard-steps li { display: flex; align-items: center; gap: 12px; color: var(--subtext); font-weight: 500; font-size: 14px; }
          .onboard-steps li.done { color: var(--text); }
          .onboard-steps li.done i { color: var(--green); }
          .onboard-steps li i { margin-top: 0; }
        `;
        document.head.appendChild(style);
      }

      // Step Runner
      const runStep = (stepNum, delay) => {
        return new Promise(resolve => setTimeout(() => {
          const li = document.getElementById(`step${stepNum}`);
          if (li) {
            li.classList.remove("hidden");
            if (stepNum > 1) {
               const prev = document.getElementById(`step${stepNum-1}`);
               prev.classList.add("done");
               prev.innerHTML = `<i data-lucide="check-circle" class="icon-sm"></i> ` + prev.innerText;
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
          }
          resolve();
        }, delay));
      };

      const title = card.querySelector(".proj-title") ? card.querySelector(".proj-title").textContent : "New Project";

      runStep(1, 0)
        .then(() => runStep(2, 600))
        .then(() => runStep(3, 600))
        .then(() => runStep(4, 800))
        .then(() => runStep(5, 800))
        .then(() => new Promise(r => setTimeout(r, 800)))
        .then(() => {
          const prev = document.getElementById(`step5`);
          prev.classList.add("done");
          prev.innerHTML = `<i data-lucide="check-circle" class="icon-sm"></i> ` + prev.innerText;
          if (typeof lucide !== 'undefined') lucide.createIcons();
          
          setTimeout(() => {
            overlay.remove();
            
            // RESTRUCTURE WORKSPACE
            const workspace = document.getElementById("panel-workspace");
            workspace.innerHTML = `
              <div class="section-title-row" style="margin-bottom:20px;">
                <h3 id="workspaceProjTitle">${title} - Collaboration Workspace</h3>
                <span class="section-sub">Your centralized team room and project dashboard</span>
              </div>
            `;
            
            // 1. Team Members
            const teamRow = document.createElement("div");
            teamRow.className = "card collab-score-card";
            teamRow.style.marginBottom = "20px";
            teamRow.innerHTML = `
              <h4>Team Roster & Roles</h4>
              <div style="display:flex; gap:15px; margin-top:10px;">
                <div class="coop-user" style="display:flex; align-items:center; gap:8px;"><div class="avatar blue">Y</div><span style="display:flex; flex-direction:column; line-height:1.2;"><strong>You (PM)</strong><small style="color:var(--text-muted); font-size:11px;">you@dayzero.io</small></span></div>
                <div class="coop-user" style="display:flex; align-items:center; gap:8px;"><div class="avatar purple">${t1[0]}</div><span style="display:flex; flex-direction:column; line-height:1.2;"><strong>${t1} (Backend)</strong><small style="color:var(--text-muted); font-size:11px;">${e1}</small></span></div>
                <div class="coop-user" style="display:flex; align-items:center; gap:8px;"><div class="avatar green">${t2[0]}</div><span style="display:flex; flex-direction:column; line-height:1.2;"><strong>${t2} (QA)</strong><small style="color:var(--text-muted); font-size:11px;">${e2}</small></span></div>
                <div class="coop-user" style="display:flex; align-items:center; gap:8px;"><div class="avatar dark">Q</div><span style="display:flex; flex-direction:column; line-height:1.2;"><strong>Quinn (Evaluator)</strong><small style="color:var(--text-muted); font-size:11px;">hidden until SkillRecord</small></span></div>
              </div>
            `;
            workspace.appendChild(teamRow);

            // 2. Task Board (Kanban)
            const kanbanCard = document.querySelector(".kanban-card");
            if (kanbanCard) {
              kanbanCard.style.marginBottom = "20px";
              
              const smallTags = kanbanCard.querySelectorAll(".k-meta small");
              if(smallTags.length >= 2) {
                smallTags[0].innerText = t1;
                smallTags[1].innerText = t2;
                const devRoles = kanbanCard.querySelectorAll(".k-meta .role");
                if (devRoles.length >= 3) {
                  devRoles[1].innerText = "Backend";
                  devRoles[2].innerText = "QA";
                }
              }
              workspace.appendChild(kanbanCard);
            }

            // 3. Work Timeline (from Insights)
            const timelineCard = document.querySelector(".bottom-analytics");
            if (timelineCard) {
              timelineCard.style.marginBottom = "20px";
              workspace.appendChild(timelineCard);
            }

            // 4. Project Files & Environment
            const filesCard = document.createElement("div");
            filesCard.className = "card";
            filesCard.innerHTML = `
              <div class="section-title-row" style="display:flex; justify-content:space-between; align-items:center;">
                <h4>Project Files & Tools</h4>
                <select class="secondary-btn" style="appearance: auto; padding-right: 24px; cursor: pointer;">
                  <option value="" disabled selected>Open with...</option>
                  <option value="vscode">VS Code Remote</option>
                  <option value="codespaces">GitHub Codespaces</option>
                  <option value="jupyter">JupyterLab</option>
                  <option value="tableau">Tableau Server</option>
                  <option value="figma">Figma</option>
                  <option value="jira">Jira / Notion</option>
                </select>
              </div>
              <div class="placeholder-box" style="min-height:80px; margin-top:10px; display:flex; gap:10px;">
                <button class="secondary-btn file-btn"><i data-lucide="file-text" class="icon-sm"></i> Architecture.pdf</button>
                <button class="secondary-btn file-btn"><i data-lucide="file-text" class="icon-sm"></i> User_Stories.docx</button>
              </div>
            `;
            workspace.appendChild(filesCard);

            filesCard.querySelectorAll('.file-btn').forEach(btn => {
              btn.addEventListener('click', () => {
                const originalHtml = btn.innerHTML;
                const fileName = btn.textContent.trim();
                
                btn.innerHTML = `<i data-lucide="loader-2" class="icon-sm pulse"></i> Opening...`;
                btn.disabled = true;
                if (typeof lucide !== 'undefined') lucide.createIcons();

                setTimeout(() => {
                  btn.innerHTML = originalHtml;
                  btn.disabled = false;
                  if (typeof lucide !== 'undefined') lucide.createIcons();

                  const toast = document.getElementById("toast");
                  if (toast) {
                    toast.textContent = `Opened ${fileName}.`;
                    toast.classList.remove("hidden");
                    setTimeout(() => toast.classList.add("hidden"), 3000);
                  }

                  if (typeof addTimelineEvent === 'function') {
                    addTimelineEvent(`Reviewed ${fileName}`);
                  }
                }, 1200);
              });
            });

            // Switch to Workspace Tab
            document.querySelectorAll(".view-panel").forEach(p => {
              p.classList.add("hidden");
              p.classList.remove("active");
            });
            workspace.classList.remove("hidden");
            workspace.classList.add("active");
            
            document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
            const wsLink = document.querySelector('[data-target="panel-workspace"]');
            if (wsLink) wsLink.classList.add("active");

            // Notify AI
            addManagerMessage(`System Notice: Team formed for ${title}. AI Teammates assigned.`, false);
            simulateAiResponse(`I've provisioned the workspace and assigned the AI Backend and QA engineers. The task board is ready, what's our first move?`);
          }, 800);
        });
    });
  }

  if (applyBtn && applyBtn.textContent.includes("Start 5-Day Sprint")) {
    applyBtn.addEventListener("click", () => {
      // Create Overlay
      const overlay = document.createElement("div");
      overlay.className = "onboarding-overlay";
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.zIndex = "9999";
      overlay.style.background = "#ffffff";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";

      overlay.innerHTML = `
        <div class="onboard-modal sprint-modal-full" style="width: 100vw; height: 100vh; padding: 0; overflow-x: hidden; overflow-y: auto; background: #ffffff; border-radius: 0; border: none; box-shadow: none;">
          <!-- Content dynamically updated -->
        </div>
      `;
      document.body.appendChild(overlay);

      const modalContent = overlay.querySelector('.onboard-modal');

      const title = card.querySelector(".proj-title") ? card.querySelector(".proj-title").textContent : "Simulation";

      const sprintData = [
        {
          day: 1,
          header: "DAY 1 OF 5 · TASK BRIEF",
          title: "Welcome to DayZero – Let's Ship Something",
          desc: "Your deliverable: a one-page decision brief on whether we should build a native mobile app (iOS/Android) or invest in a progressive web app (PWA) for our next quarter. Our engineering bandwidth is limited—we have 2 developers and can only pursue one path. Include: (1) a recommendation with reasoning, (2) three key risks for your chosen path, (3) success metrics we should track, and (4) a rough timeline estimate. Base your decision on our context: 60% of user sessions are on mobile web, our competitors just launched mobile apps, and our runway is 18 months. Don't overthink it—I value clear thinking over perfection.",
          teammateName: "Maya Chen",
          teammateRole: "SENIOR DESIGNER",
          teammateAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Maya",
          teammateMsg: "Hey! Excited to work with you. Just a heads up—I've been getting user complaints about our mobile web experience. The navigation is clunky on small screens and users keep asking for offline access. I have some mockups I did last quarter to see what a mobile experience could look like. Let me know what you need from design!"
        },
        {
          day: 2,
          header: "DAY 2 OF 5 · TASK BRIEF",
          title: "Prioritize the MVP Scope",
          desc: "We are moving forward with the Native App. Review the proposed feature list and prioritize the top 3 features for our MVP launch. Explain your rationale.",
          teammateName: "Alex",
          teammateRole: "ENGINEERING MANAGER",
          teammateAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex",
          teammateMsg: "If we want to hit the deadline, we need to cut scope aggressively. The auth module alone will take 2 weeks."
        },
        {
          day: 3,
          header: "DAY 3 OF 5 · TASK BRIEF",
          title: "Handling the Latency Crisis",
          desc: "Our primary API is experiencing severe latency under load. Draft a quick communication to stakeholders and decide whether to halt the rollout.",
          teammateName: "Sam",
          teammateRole: "BACKEND ENGINEER",
          teammateAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sam",
          teammateMsg: "The database indices aren't scaling. I need 4 hours to rebuild them, which means downtime."
        },
        {
          day: 4,
          header: "DAY 4 OF 5 · TASK BRIEF",
          title: "Competitor Response",
          desc: "A major competitor just released a feature identical to our core offering, but cheaper. Outline a 3-point strategy to retain our enterprise clients.",
          teammateName: "Riley Park",
          teammateRole: "CEO",
          teammateAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Riley",
          teammateMsg: "I just saw the news. We can't panic, but we need a solid response for our enterprise accounts by tomorrow."
        },
        {
          day: 5,
          header: "DAY 5 OF 5 · TASK BRIEF",
          title: "Finalizing Launch Metrics",
          desc: "We are ready to launch. Define the top 2 KPI metrics we will track in the first 48 hours to measure success.",
          teammateName: "Jordan",
          teammateRole: "DATA ANALYST",
          teammateAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Jordan",
          teammateMsg: "Analytics pipeline is set up. Just give me the specific events you want dashboarded."
        }
      ];

      let currentDayIndex = -1; // -1 represents the onboarding screen
      window.sprintSubmissions = window.sprintSubmissions || [];
      window.simulationUser = window.simulationUser || { name: "", role: "" };
      window.activityLog = [];
      window.analyticsData = { scores: [], timestamps: [] };

      window.drawAnalyticsChart = () => {
        const chartContainer = document.getElementById('analyticsChartContainer');
        if (!chartContainer) return;
        const canvas = document.getElementById('analyticsChart');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const data = window.analyticsData.scores;
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0,0,w,h);
        const grd = ctx.createLinearGradient(0,0,0,h);
        grd.addColorStop(0, '#eff6ff');
        grd.addColorStop(1, '#bfdbfe');
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,w,h);
        if (data.length < 2) return;
        const maxScore = Math.max(...data, 100);
        const minScore = Math.min(...data, 0);
        const stepX = w / (data.length-1);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((v,i)=>{
          const x = i*stepX;
          const y = h - ((v-minScore)/(maxScore-minScore))*h;
          if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        });
        ctx.stroke();
        ctx.fillStyle = '#1d4ed8';
        data.forEach((v,i)=>{
          const x = i*stepX;
          const y = h - ((v-minScore)/(maxScore-minScore))*h;
          ctx.beginPath();
          ctx.arc(x,y,4,0,2*Math.PI);
          ctx.fill();
        });
      };

      const updateActivitySummary = () => {
        const list = document.getElementById('activityList');
        if (!list) return;
        list.innerHTML = '';
        window.activityLog.forEach(entry => {
          const card = document.createElement('div');
          card.style = 'background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px; margin-bottom:12px; font-size:14px;';
          card.innerHTML = `
            <div style="font-weight:700; color:#0f172a; margin-bottom:8px;">Day ${entry.day} – Company: ${entry.project}</div>
            <div style="color:#475569; margin-bottom:4px;"><strong>AI Prompt:</strong> ${entry.prompt}</div>
            <div style="color:#64748b; margin-bottom:4px;"><em>Your Submission:</em> ${entry.userSubmission.slice(0, 60)}...</div>
            <div style="color:#3b82f6; margin-bottom:4px;"><strong>Teammate:</strong> ${entry.teammateReply}</div>
            <div style="color:#86198f;"><strong>Manager (${entry.pressure}):</strong> ${entry.managerReply}</div>
            <div style="margin-top:6px;">${'⭐'.repeat(entry.starRating)}</div>
          `;
          list.appendChild(card);
        });
      };

      const logActivity = (day, prompt, project, userSubmission, teammateReply, managerReply, pressure, starRating) => {
        window.activityLog.push({ day, timestamp: Date.now(), prompt, project, userSubmission, teammateReply, managerReply, pressure, starRating });
        const overallScoreEl = document.querySelector('.score-value');
        if (overallScoreEl) {
          const currentScore = parseInt(overallScoreEl.textContent) || 0;
          const newScore = Math.max(40, Math.min(99, currentScore + (starRating - 3) * 5));
          overallScoreEl.textContent = newScore;
          window.analyticsData.scores.push(newScore);
          window.analyticsData.timestamps.push(Date.now());
          drawAnalyticsChart();
        }
      };

      const renderInteractiveDay = async () => {
        if (currentDayIndex === -1) {
          // Onboarding Screen
          modalContent.innerHTML = `
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;">
              <div style="background: #ffffff; border-radius: 24px; padding: 60px 48px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); border: 1px solid #ffffff; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; overflow: hidden;">
                
                <!-- Decorative shapes -->
                <div style="position: absolute; top: -60px; right: -60px; width: 160px; height: 160px; background: #eff6ff; border-radius: 50%; z-index: 0;"></div>
                <div style="position: absolute; bottom: -40px; left: -40px; width: 120px; height: 120px; background: #f8fafc; border-radius: 50%; z-index: 0;"></div>
                
                <div style="position: relative; z-index: 1; width: 100%;">
                  <div style="width: 64px; height: 64px; background: #eff6ff; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #3b82f6;">
                    <i data-lucide="rocket" style="width: 32px; height: 32px;"></i>
                  </div>
                  <h1 style="font-size: 32px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 12px; color: #0f172a;">Simulation Entry</h1>
                  <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">Initialize your profile to begin the intensive product sprint. Your performance will be strictly monitored.</p>
                  
                  <div style="width: 100%; text-align: left; margin-bottom: 32px;">
                    <label style="display: block; font-size: 12px; letter-spacing: 1px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase;">Full Name</label>
                    <input type="text" id="simNameInput" placeholder="e.g. Jane Doe" style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; font-size: 15px; outline: none; transition: border-color 0.2s; margin-bottom: 20px; box-sizing: border-box;">
                    
                    <label style="display: block; font-size: 12px; letter-spacing: 1px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase;">Target Role</label>
                    <input type="text" id="simRoleInput" placeholder="e.g. Senior Product Manager" style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; font-size: 15px; outline: none; transition: border-color 0.2s; box-sizing: border-box;">
                  </div>

                  <button id="simStartBtn" style="width: 100%; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; padding: 16px; font-weight: 600; font-size: 16px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: background 0.2s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                    Initiate Sequence <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
          if (typeof lucide !== 'undefined') lucide.createIcons();

          document.getElementById("simStartBtn").addEventListener("click", () => {
            const n = document.getElementById("simNameInput").value.trim() || "Participant";
            const r = document.getElementById("simRoleInput").value.trim() || "Candidate";
            window.simulationUser = { name: n, role: r };
            currentDayIndex++;
            renderInteractiveDay();
          });
          return;
        }

        if (currentDayIndex >= sprintData.length) {
          // Analysis Loader
          modalContent.innerHTML = `
            <div style="background: #ffffff; color: #0f172a; padding: 60px 40px; text-align: center; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <i data-lucide="loader-2" class="icon-lg pulse" style="color: #3b82f6; margin-bottom: 24px; width: 48px; height: 48px;"></i>
              <h2 style="margin: 0 0 12px; font-size: 24px; font-weight: 600;">Analyzing Final Performance...</h2>
              <p id="analysisStatusText" style="color: #64748b; font-size: 15px;">Evaluating your strategic reasoning and deliverables.</p>
            </div>
          `;
          if (typeof lucide !== 'undefined') lucide.createIcons();

          // Final Review
          let passed = true;
          let finalVerdict = "Excellent work. You handled the challenges well and delivered on all metrics.";
          let missingSkills = [];
          let starRating = 5;
          
          try {
            const res = await fetch(`${API_BASE_URL}/api/chat`, {
              method: "POST", 
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: SPRINT_CONSOLE_MODEL,
                response_format: { type: "json_object" },
                messages: [
                  { role: "system", content: "You are a strict AI manager. Evaluate the user's simulation submissions. Return JSON: { \"passed\": boolean, \"verdict\": \"Professional and thorough 2-3 sentence verdict explaining the reasoning.\", \"missingSkills\": [\"skill1\", \"skill2\", \"skill3\", \"skill4\", \"skill5\"], \"stars\": number_between_1_and_5 }. ALWAYS provide at least 4-5 specific, professional missing skills." },
                  { role: "user", content: "My submissions across 5 days: " + window.sprintSubmissions.join(" | ") }
                ]
              })
            });
            const data = await res.json();
            if (data.choices && data.choices.length > 0) {
              const parsed = JSON.parse(data.choices[0].message.content);
              if (parsed.passed !== undefined) passed = parsed.passed;
              if (parsed.verdict) finalVerdict = parsed.verdict;
              if (parsed.missingSkills) missingSkills = parsed.missingSkills;
              if (parsed.stars !== undefined) starRating = parsed.stars;
            }
          } catch(e) { console.error(e); }

          const statusText = document.getElementById("analysisStatusText");
          if(statusText) statusText.innerHTML = `<strong style="color: ${passed ? 'var(--green)' : 'var(--red)'};">Manager Verdict:</strong> ${finalVerdict}`;

          setTimeout(() => {
            renderCertificate(passed, finalVerdict, missingSkills, starRating);
          }, 3500);
          return;
        }

        const data = sprintData[currentDayIndex];
        const nextDayLabel = currentDayIndex < 4 ? `Submit & advance to Day ${currentDayIndex + 2}` : "Submit & Complete Simulation";

        const topbarDayBadge = document.getElementById("topbarDayBadge");
        if(topbarDayBadge) topbarDayBadge.innerText = `Phase ${currentDayIndex + 1} of 5`;
        const topbarRoleBadge = document.getElementById("topbarRoleBadge");
        if(topbarRoleBadge) topbarRoleBadge.innerText = `${window.simulationUser.role || 'Enterprise'} Simulation`;

        modalContent.innerHTML = `
          <div style="background: #f8fafc; color: #0f172a; text-align: left; font-family: 'Inter', sans-serif; display: flex; flex-direction: column; height: 100vh; overflow: hidden;">
            
            <!-- Top / Task Brief Section -->
            <div class="sprint-header-pane" style="padding: 40px 60px; border-bottom: 1px solid rgba(79, 70, 229, 0.15); background: linear-gradient(135deg, #ffffff 0%, #f4f6ff 100%); flex-shrink: 0; box-shadow: 0 4px 20px rgba(0,0,0,0.03); position: relative; z-index: 10; display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
              <p style="color: var(--blue); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px;"><i data-lucide="target" style="width: 16px; height: 16px;"></i> ${data.header}</p>
              <h1 style="font-size: 36px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 16px; color: #0f172a; line-height: 1.2;">${data.title}</h1>
              <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0; max-width: none; width: 100%;">${data.desc}</p>
            </div>

            <div class="sprint-split-view">
              <!-- Left side: Submission Area -->
              <div class="sprint-left-pane">
                <p style="color: #64748b; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; font-weight: 700;">YOUR SUBMISSION</p>
                <textarea id="sprintSubmissionText" placeholder="Write your PRD / deliverable... or post your code here" style="flex: 1; min-height: 200px; width: 100%; background: #fafbfe; border: 1px solid rgba(79, 70, 229, 0.2); border-radius: 12px; color: #0f172a; padding: 24px; font-family: inherit; font-size: 15px; resize: none; outline: none; margin-bottom: 24px; box-shadow: inset 0 2px 8px rgba(79, 70, 229, 0.03); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="if(document.activeElement !== this) { this.style.boxShadow='inset 0 2px 8px rgba(79, 70, 229, 0.03), 0 4px 12px rgba(79, 70, 229, 0.08)'; this.style.borderColor='rgba(79, 70, 229, 0.4)'; this.style.transform='translateY(-2px)' }" onmouseout="if(document.activeElement !== this) { this.style.boxShadow='inset 0 2px 8px rgba(79, 70, 229, 0.03)'; this.style.borderColor='rgba(79, 70, 229, 0.2)'; this.style.transform='translateY(0)' }" onfocus="this.style.boxShadow='0 0 0 4px rgba(79, 70, 229, 0.15), 0 8px 24px rgba(79, 70, 229, 0.1)'; this.style.borderColor='var(--blue)'; this.style.background='#ffffff'; this.style.transform='translateY(-2px)'" onblur="this.style.boxShadow='inset 0 2px 8px rgba(79, 70, 229, 0.03)'; this.style.borderColor='rgba(79, 70, 229, 0.2)'; this.style.background='#fafbfe'; this.style.transform='translateY(0)'"></textarea>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
                    <button id="uploadCodeBtn" style="background: linear-gradient(135deg, #eff6ff, #e0e7ff); color: #3730a3; border: 1px solid #c7d2fe; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.boxShadow='0 6px 16px rgba(55,48,163,0.15)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0)'"><i data-lucide="upload" style="width:16px; height:16px; margin-right:8px;"></i> Upload Code / Zip</button>
                    <button id="addLinkBtn" style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: #166534; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.boxShadow='0 6px 16px rgba(22,101,52,0.15)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0)'"><i data-lucide="link" style="width:16px; height:16px; margin-right:8px;"></i> Add Project Link</button>
                    <button style="background: linear-gradient(135deg, #fdf4ff, #fae8ff); color: #86198f; border: 1px solid #fbcfe8; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.boxShadow='0 6px 16px rgba(134,25,143,0.15)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='none'; this.style.transform='translateY(0)'" onclick="alert('File browser opened to upload assets')"><i data-lucide="image" style="width:16px; height:16px; margin-right:8px;"></i> Creative Assets</button>
                  </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0;">
                  <span id="charCountSpan" style="color: #64748b; font-size: 13px; font-family: monospace;">0 chars</span>
                  <div style="display: flex; gap: 12px; align-items: center;">
                    <button id="sprintProceedBtn" style="display: none; background: #ffffff; color: #4f46e5; border: 2px solid #4f46e5; border-radius: 8px; padding: 12px 24px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s ease;">
                      Proceed Immediately
                    </button>
                    <button id="sprintSubmitBtn" style="background: linear-gradient(135deg, #4f46e5, #3730a3); color: #ffffff; border: none; border-radius: 8px; padding: 14px 28px; font-weight: 600; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 24px rgba(79, 70, 229, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(79, 70, 229, 0.3)'">
                      ${nextDayLabel} <i data-lucide="send" style="width: 18px; height: 18px;"></i>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Right side: Teammate Feed -->
              <div class="sprint-right-pane" id="teamFeedContainer">
                <p style="color: #64748b; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 24px; font-weight: 700;">TEAMMATES</p>
                
                <div class="team-msg-card" style="display: flex; gap: 16px; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(15,23,42,0.03); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.transform='translateY(-4px) scale(1.01)'; this.style.boxShadow='0 16px 32px -8px rgba(79, 70, 229, 0.2)'; this.style.borderColor='rgba(79, 70, 229, 0.4)'; this.style.background='#f4f6ff';" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 12px rgba(15,23,42,0.03)'; this.style.borderColor='#e2e8f0'; this.style.background='#ffffff';">
                  <img src="${data.teammateAvatar}" alt="Avatar" style="width: 48px; height: 48px; border-radius: 50%; border: 1px solid rgba(79, 70, 229, 0.2); background: linear-gradient(135deg, #f8fafc, #f1f5f9); flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: transform 0.3s ease;" onmouseover="this.style.transform='rotate(5deg) scale(1.1)'" onmouseout="this.style.transform='rotate(0) scale(1)'">
                  <div>
                    <div style="margin-bottom: 8px;">
                      <span style="font-weight: 700; font-size: 15px; color: #0f172a; margin-right: 8px;">${data.teammateName}</span>
                      <span style="font-size: 12px; color: #64748b; letter-spacing: 1px; font-weight: 600;">${data.teammateRole}</span>
                    </div>
                    <div style="color: #334155; font-size: 15px; line-height: 1.6;">
                      ${data.teammateMsg}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        const textArea = document.getElementById("sprintSubmissionText");
        const charCountSpan = document.getElementById("charCountSpan");
        textArea.addEventListener("input", () => {
          charCountSpan.textContent = textArea.value.length + " chars";
        });

        // Setup real file uploader
        document.getElementById("uploadCodeBtn").addEventListener("click", () => {
          const fileInput = document.createElement("input");
          fileInput.type = "file";
          fileInput.onchange = (e) => {
            if (e.target.files.length > 0) {
              textArea.value += `\n[Uploaded File: ${e.target.files[0].name}]`;
              charCountSpan.textContent = textArea.value.length + " chars";
            }
          };
          fileInput.click();
        });

        // Setup custom link modal
        document.getElementById("addLinkBtn").addEventListener("click", () => {
          const linkModal = document.createElement("div");
          linkModal.innerHTML = `
            <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);">
              <div style="background:#fff; padding:32px; border-radius:16px; width:400px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); animation: fadeIn 0.2s ease-out;">
                <h3 style="margin:0 0 16px; color:#0f172a; font-family:'Inter', sans-serif;">Add Project Link</h3>
                <input type="text" id="customLinkInput" placeholder="https://github.com/..." style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:24px; font-family:inherit; outline:none; box-sizing:border-box;" />
                <div style="display:flex; justify-content:flex-end; gap:12px;">
                  <button id="cancelLinkBtn" style="padding:10px 16px; background:#f1f5f9; border:none; border-radius:8px; cursor:pointer; color:#475569; font-weight:600;">Cancel</button>
                  <button id="confirmLinkBtn" style="padding:10px 16px; background:var(--blue); border:none; border-radius:8px; cursor:pointer; color:#fff; font-weight:600;">Add Link</button>
                </div>
              </div>
            </div>
          `;
          document.body.appendChild(linkModal);
          document.getElementById('cancelLinkBtn').onclick = () => linkModal.remove();
          document.getElementById('confirmLinkBtn').onclick = () => {
             const l = document.getElementById('customLinkInput').value.trim();
             if(l) {
                textArea.value += `\n[Project Link: ${l}]`;
                charCountSpan.textContent = textArea.value.length + " chars";
             }
             linkModal.remove();
          };
          document.getElementById('customLinkInput').focus();
        });

        document.getElementById("sprintSubmitBtn").addEventListener("click", async () => {
          const val = textArea.value.trim();
          if(val.length < 5) {
             alert("Please provide a submission, upload code, or paste a link.");
             return;
          }
          // Store by index so resubmissions overwrite instead of pushing duplicates
          window.sprintSubmissions[currentDayIndex] = val;

          const btn = document.getElementById("sprintSubmitBtn");
          btn.innerHTML = `<i data-lucide="loader-2" class="icon-sm pulse"></i> Reviewing...`;
          if (typeof lucide !== 'undefined') lucide.createIcons();
          btn.disabled = true;

          const currentPressure = document.body.className.includes("pressure-high") ? "High" : document.body.className.includes("pressure-low") ? "Low" : "Medium";
          
          let reply = "Solid update. Let's proceed to the next phase.";
          let skillAnalysis = "Submission logged. Tracking consistency and accuracy.";
          try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s for review
              const res = await fetch(`${API_BASE_URL}/api/chat`, {
                method: "POST", 
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                  model: SPRINT_CONSOLE_MODEL,
                  message: "Review my submission: " + val,
                  system_prompt: `You are evaluating a tech simulation. Act as two entities: 1. ${data.teammateName}, a ${data.teammateRole}. 2. Quinn, the hidden evaluator. Current pressure: ${currentPressure}. Review their latest submission. If the submission is short, wrong, or gibberish, ${data.teammateName} should act stressed/impatient. Quinn must perform a micro skill analysis based on their exact text. Return ONLY JSON: { "teammate_reply": "1-2 conversational sentences", "quinn_analysis": "1-2 sentences of professional skill analysis grading their actual code/text." }`
                })
              });
              const rd = await res.json();
              if (rd.choices && rd.choices.length > 0) {
                 const parsed = JSON.parse(rd.choices[0].message.content);
                 if (parsed.teammate_reply) reply = parsed.teammate_reply;
                 if (parsed.quinn_analysis || parsed.console_analysis) skillAnalysis = parsed.quinn_analysis || parsed.console_analysis;
              }
              clearTimeout(timeoutId);
          } catch(e) {
              console.error("Sprint review error:", e);
          }


          const feed = document.getElementById("teamFeedContainer");
          if(feed) {
             feed.innerHTML += `
              <div class="team-msg-card" style="display: flex; gap: 16px; padding: 20px; background: #fdf4ff; border: 1px solid #fbcfe8; border-radius: 12px; box-shadow: 0 4px 6px rgba(217,70,239,0.05); margin-top: 24px; animation: fadeIn 0.3s ease; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 10px 15px -3px rgba(217,70,239,0.1)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 6px rgba(217,70,239,0.05)'">
                <img src="${data.teammateAvatar}" alt="${data.teammateName}" style="width: 48px; height: 48px; border-radius: 50%; border: 1px solid #fbcfe8; background: #ffffff; flex-shrink: 0;">
                <div style="flex: 1;">
                  <div style="margin-bottom: 8px;">
                    <span style="font-weight: 700; font-size: 15px; color: #0f172a; margin-right: 8px;">${data.teammateName}</span>
                    <span style="font-size: 12px; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">${data.teammateRole}</span>
                  </div>
                  <div style="color: #86198f; font-size: 15px; line-height: 1.6; font-weight: 500;">
                    ${reply}
                  </div>
                </div>
              </div>

              <!-- Evaluator Review Below Teammate -->
              <div class="team-msg-card" style="display: flex; gap: 16px; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(15,23,42,0.02); margin-top: 16px; animation: fadeIn 0.5s ease; cursor: pointer;">
                <div style="width: 48px; height: 48px; border-radius: 50%; border: 1px solid #cbd5e1; background: #0f172a; color:#fff; display:grid; place-items:center; font-weight:800; flex-shrink: 0;">Q</div>
                <div style="flex: 1;">
                  <div style="margin-bottom: 8px;">
                    <span style="font-weight: 700; font-size: 15px; color: #0f172a; margin-right: 8px;">Quinn</span>
                    <span style="font-size: 12px; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">EVALUATOR</span>
                  </div>
                  <div style="color: #334155; font-size: 14px; line-height: 1.6;">
                    <strong>Skill Analysis:</strong> ${skillAnalysis}
                  </div>
                </div>
              </div>
             `;
          }

          if (typeof logActivity === 'function') {
            logActivity(currentDayIndex + 1, window.currentDayPrompt || data.desc, data.title, val, reply, skillAnalysis, currentPressure, 3);
            updateActivitySummary();
          }

          btn.disabled = false;
          let timeLeft = 30;
          
          if (window.sprintTimerInterval) clearInterval(window.sprintTimerInterval);
          if (window.sprintTimeout) clearTimeout(window.sprintTimeout);
          
          btn.innerHTML = `Advance (${timeLeft}s) or Update <i data-lucide="refresh-cw" style="width: 18px; height: 18px;"></i>`;
          if (typeof lucide !== 'undefined') lucide.createIcons();
          
          const proceedBtn = document.getElementById("sprintProceedBtn");
          if(proceedBtn) {
            proceedBtn.style.display = "block";
            proceedBtn.onclick = () => {
              if (window.sprintTimerInterval) clearInterval(window.sprintTimerInterval);
              if (window.sprintTimeout) clearTimeout(window.sprintTimeout);
              currentDayIndex++;
              renderInteractiveDay();
            };
          }

          window.sprintTimerInterval = setInterval(() => {
             timeLeft--;
             if(timeLeft > 0) {
               btn.innerHTML = `Advance (${timeLeft}s) or Update <i data-lucide="refresh-cw" style="width: 18px; height: 18px;"></i>`;
             } else {
               clearInterval(window.sprintTimerInterval);
             }
          }, 1000);

          window.sprintTimeout = setTimeout(() => {
            currentDayIndex++;
            renderInteractiveDay();
          }, 30000);
        });
      };

      // Start the interactive sprint
      renderInteractiveDay();

      const renderCertificate = (passed = true, finalVerdict = "", missingSkills = [], starRating = 5) => {
        const uName = window.simulationUser ? window.simulationUser.name : "Participant";
        const uRole = window.simulationUser ? window.simulationUser.role : "Candidate";
        const overallScore = Math.max(25, Math.min(96, passed ? 58 + (starRating * 8) : 24 + (starRating * 7)));
        const dashboardReport = {
          mode: "dashboard_sprint",
          status: "completed",
          overall_score: overallScore,
          scores: {
            communication: Math.max(20, Math.min(99, overallScore + 2)),
            leadership: Math.max(20, Math.min(99, overallScore + (passed ? 4 : -4))),
            ownership: Math.max(20, Math.min(99, overallScore + (passed ? 3 : -6))),
            prioritization: Math.max(20, Math.min(99, overallScore + 1)),
            technicalDepth: Math.max(20, Math.min(99, overallScore - 2)),
          },
          recommendation: passed ? "Strong simulation signal" : "Needs more evidence",
          summary: finalVerdict || (passed ? "Simulation completed with a strong DayZero signal." : "Simulation completed, but the final signal needs more concrete evidence."),
          strengths: passed
            ? ["Completed the sprint flow and responded to team pressure.", "Created a saved SkillRecord with score and evaluator feedback."]
            : ["Completed the simulation attempt and created a saved SkillRecord."],
          weaknesses: missingSkills,
          next_steps: missingSkills.length ? missingSkills : ["Practice a sharper final handoff with clear evidence and ownership."],
          task: {
            title: title || "Dashboard sprint simulation",
            company: title || "DayZero",
            role: uRole,
            duration: "Dashboard sprint",
          },
          user_name: uName,
          user_role: uRole,
          submitted_at: new Date().toISOString(),
        };
        const savedDashboardReport = window.DayZeroSkillRecords
          ? window.DayZeroSkillRecords.store(dashboardReport, { source: "dashboard-certificate" })
          : dashboardReport;
        hydrateDashboardSkillRecord();
        
        let starsHtml = '';
        for(let i=1; i<=5; i++) {
           if(i <= starRating) {
             starsHtml += `<i data-lucide="star" style="width: 28px; height: 28px; fill: #fbbf24; color: #fbbf24;"></i>`;
           } else {
             starsHtml += `<i data-lucide="star" style="width: 28px; height: 28px; color: #cbd5e1;"></i>`;
           }
        }
        if (passed) {
          modalContent.innerHTML = `
            <div class="cert-wrapper">
              <div class="cert-card">
                
                <div class="cert-header">
                  <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                  <div style="width: 80px; height: 80px; background: #fffbeb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 0 0 8px rgba(251, 191, 36, 0.2);">
                    <i data-lucide="award" style="width: 40px; height: 40px; color: #d97706;"></i>
                  </div>
                  <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">Certificate of Excellence</h1>
                  <p style="margin: 0; font-size: 16px; color: #cbd5e1; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600;">Simulation Successfully Completed</p>
                </div>
                
                <div style="text-align: center; margin-bottom: 40px;">
                  <h2 style="color: #0f172a; font-size: 32px; margin: 0 0 8px; font-weight: 800;">${uName}</h2>
                  <p style="color: #475569; font-size: 18px; margin: 0;">Completed as: <strong>${uRole}</strong></p>
                </div>
                
                <div style="display: flex; gap: 24px; margin-bottom: 40px; flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 200px; background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
                    <p style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0 0 12px;"><i data-lucide="briefcase" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> Target Company</p>
                    <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 700;">${title}</p>
                  </div>
                  <div style="flex: 1; min-width: 200px; background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
                    <p style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0 0 12px;">Final Rating</p>
                    <div style="display: flex; justify-content: center; gap: 4px;">
                      ${starsHtml}
                    </div>
                  </div>
                </div>

                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; margin-bottom: 40px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                      <div style="width:48px; height:48px; border-radius:50%; background:#0f172a; color:#fff; border:1px solid #cbd5e1; display:grid; place-items:center; font-weight:800;">Q</div>
                      <div>
                        <p style="font-weight: 700; font-size: 16px; margin: 0; color: #0f172a;">Quinn</p>
                        <p style="color: #64748b; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">SkillRecord Evaluator</p>
                      </div>
                    </div>
                    <div style="width: 60px; height: 60px; border-radius: 50%; border: 3px dashed #fbbf24; display: flex; align-items: center; justify-content: center; background: #fffbeb;">
                      <span style="color: #b45309; font-weight: 800; font-size: 12px; text-align: center; line-height: 1;">TOP<br>5%</span>
                    </div>
                  </div>
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0; font-style: italic;">"${finalVerdict}"</p>
                </div>

                <div style="margin-bottom: 40px;">
                  <p style="font-size: 14px; color: #0f172a; font-weight: 700; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">Live Performance Analytics</p>
                  <div id="analyticsChartContainer" style="width: 100%; height: 180px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <canvas id="analyticsChart" width="700" height="180"></canvas>
                  </div>
                </div>
                
                <div style="display: flex; gap: 16px; width: 100%; flex-wrap: wrap;">
                  <button id="downloadReportBtn" style="flex: 1; padding: 16px; font-size: 16px; border-radius: 12px; border: 2px solid #e2e8f0; background: #ffffff; color: #475569; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; gap: 8px;" onmouseover="this.style.borderColor='var(--blue)'; this.style.color='var(--blue)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#475569';">
                    <i data-lucide="download" style="width: 20px; height: 20px;"></i> Save as PDF
                  </button>
                  <button id="viewSkillRecordBtn" style="flex: 2; padding: 16px; font-size: 16px; border-radius: 12px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-weight: 600; border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); display: flex; align-items: center; justify-content: center; gap: 8px;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='translateY(0)';">
                    Return to Dashboard <i data-lucide="arrow-right" style="width: 20px; height: 20px;"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        } else {
          modalContent.innerHTML = `
            <div class="cert-wrapper">
              <div class="cert-card">
                
                <div class="cert-fail-header">
                  <div style="width: 80px; height: 80px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 0 0 8px rgba(220, 38, 38, 0.1);">
                    <i data-lucide="alert-triangle" style="width: 40px; height: 40px; color: #dc2626;"></i>
                  </div>
                  <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; color: #991b1b;">Performance Report</h1>
                  <p style="margin: 0; font-size: 16px; color: #dc2626; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700;">Simulation Failed</p>
                </div>

                <div style="text-align: center; margin-bottom: 40px;">
                  <h2 style="color: #0f172a; font-size: 32px; margin: 0 0 8px; font-weight: 800;">${uName}</h2>
                  <p style="color: #475569; font-size: 18px; margin: 0;">Target Company: <strong>${title}</strong></p>
                </div>
                
                <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 32px; padding: 16px; background: #f8fafc; border-radius: 12px;">
                  ${starsHtml}
                </div>

                <div style="background: #fff5f5; border: 1px solid #fecaca; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                  <p style="color: #991b1b; font-size: 16px; line-height: 1.6; margin: 0; font-weight: 500;"><strong>Manager Feedback:</strong> "${finalVerdict}"</p>
                </div>
                
                <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 40px;">
                  <p style="font-weight: 700; color: #0f172a; margin-bottom: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;"><i data-lucide="target" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Identified Skill Gaps</p>
                  <ul style="color: #dc2626; margin: 0; padding-left: 20px; font-size: 15px; font-weight: 500; line-height: 1.8;">
                    ${missingSkills.length > 0 ? missingSkills.map(s => `<li>${s}</li>`).join('') : `<li>Poor problem solving</li><li>Code quality issues</li>`}
                  </ul>
                </div>

                <div style="display: flex; gap: 16px; width: 100%; flex-wrap: wrap;">
                  <button id="downloadReportBtn" style="flex: 1; padding: 16px; font-size: 16px; border-radius: 12px; border: 2px solid #fecaca; background: #ffffff; color: #b91c1c; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; gap: 8px;" onmouseover="this.style.background='#fef2f2';" onmouseout="this.style.background='#ffffff';">
                    <i data-lucide="download" style="width: 20px; height: 20px;"></i> Download PDF
                  </button>
                  <button id="viewSkillRecordBtn" style="flex: 2; padding: 16px; font-size: 16px; border-radius: 12px; background: #0f172a; color: #ffffff; font-weight: 600; border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 12px rgba(15,23,42,0.1); display: flex; align-items: center; justify-content: center; gap: 8px;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='translateY(0)';">
                    Return to Dashboard <i data-lucide="arrow-right" style="width: 20px; height: 20px;"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }

        
        // Add PDF download logic
        const dlBtn = document.getElementById("downloadReportBtn");
        if(dlBtn) {
          dlBtn.addEventListener("click", () => {
             if (window.DayZeroSkillRecords) {
               window.DayZeroSkillRecords.downloadPdf(savedDashboardReport);
               showToast("SkillRecord PDF downloaded.");
               return;
             }

             window.print();
          });
        }

        document.getElementById("viewSkillRecordBtn").addEventListener("click", () => {
          overlay.remove();
          
          // Populate the Main Dashboard Skill Record
          const missingSkillsContainer = document.getElementById("missingSkillsContainer");
          if (missingSkillsContainer && missingSkills && missingSkills.length > 0) {
             missingSkillsContainer.innerHTML = '';
             missingSkills.forEach(s => {
               missingSkillsContainer.innerHTML += `<div class="skill-pill missing" style="border:1px solid #fecaca; background:#fff5f5; color:#b91c1c; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:600;"><i data-lucide="x" style="width:12px; height:12px; margin-right:4px;"></i> ${s}</div>`;
             });
             if (typeof lucide !== 'undefined') lucide.createIcons();
          }

          // Switch to Skill Record Tab
          document.querySelectorAll(".view-panel").forEach(p => {
            p.classList.add("hidden");
            p.classList.remove("active");
          });
          const skillPanel = document.getElementById("panel-skillrecord");
          if (skillPanel) {
            skillPanel.classList.remove("hidden");
            skillPanel.classList.add("active");
          }
          
          document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
          const skillLink = document.querySelector('[data-target="panel-skillrecord"]');
          if (skillLink) skillLink.classList.add("active");

          // Update Skill Record Data
          const overallScoreValue = document.querySelector(".score-value");
          let finalTargetScore = 85;
          if (overallScoreValue) {
            let currentScore = parseInt(overallScoreValue.textContent);
            if (!isNaN(currentScore)) {
              let scoreBump = 0;
              if (starRating === 1) scoreBump = -15;
              else if (starRating === 2) scoreBump = -5;
              else if (starRating === 3) scoreBump = 0;
              else if (starRating === 4) scoreBump = 5;
              else if (starRating === 5) scoreBump = 12;

              finalTargetScore = currentScore + scoreBump; 
              if(finalTargetScore > 99) finalTargetScore = 99;
              if(finalTargetScore < 40) finalTargetScore = 40;

              let direction = finalTargetScore > currentScore ? 1 : -1;
              const scoreInterval = setInterval(() => {
                if(currentScore !== finalTargetScore) {
                  currentScore += direction;
                  overallScoreValue.textContent = currentScore;
                } else {
                  clearInterval(scoreInterval);
                }
              }, 50);
            }
            
            // update ring fill
            const ringFill = document.querySelector(".ring-fill");
            if (ringFill) {
              ringFill.style.transition = "stroke-dashoffset 1s ease-out";
              ringFill.style.strokeDashoffset = "20"; // visually increase it
            }
          }
          
          // Update Skill bars visually based on star rating
          const skillRows = document.querySelectorAll(".skill-row");
          skillRows.forEach(row => {
            const strong = row.querySelector("strong");
            const fill = row.querySelector(".skill-bar-fill");
            if(strong && fill) {
               // Calculate dynamic score: Base 60 + (stars * 7) + up to 8 points random variance
               let baseScore = 60 + (starRating * 7) + Math.floor(Math.random() * 8);
               if(baseScore > 99) baseScore = 99;
               
               strong.textContent = baseScore;
               fill.style.transition = "width 1.5s ease-out";
               fill.style.width = baseScore + "%";
            }
          });

  
          const badgesRow = document.querySelector(".badges-row");
          if (badgesRow) {
            const newBadge = document.createElement("div");
            newBadge.className = "ach-badge";
            newBadge.style.borderColor = "var(--blue)";
            newBadge.style.color = "var(--blue)";
            newBadge.innerHTML = `<i data-lucide="award" class="icon-sm"></i> Premium Sprint Completed`;
            badgesRow.appendChild(newBadge);
            if (typeof lucide !== 'undefined') lucide.createIcons();
          }
          
          // Save report HTML to localStorage for viewing from the Skill section
          localStorage.setItem('lastSimulationReport', modalContent.innerHTML);
          
          // Optional Toast
          const toast = document.getElementById("toast");
          if (toast) {
            toast.textContent = "Simulation completed. Skill Record updated.";
            toast.classList.remove("hidden");
            setTimeout(() => toast.classList.add("hidden"), 4000);
          }
        });
      };
    });
  }

  if (viewBtn && viewBtn.textContent.includes("View Details")) {
    // Inject details div dynamically
    const detailsDiv = document.createElement("div");
    detailsDiv.className = "proj-details hidden";
    detailsDiv.style.marginTop = "12px";
    detailsDiv.style.paddingTop = "12px";
    detailsDiv.style.borderTop = "1px solid var(--border)";
    detailsDiv.style.fontSize = "13px";
    detailsDiv.style.color = "var(--text-muted)";
    detailsDiv.style.lineHeight = "1.5";
    
    const title = card.querySelector(".proj-title") ? card.querySelector(".proj-title").textContent : "this project";
    detailsDiv.innerHTML = `
      <strong>Tech Stack:</strong> Standard Enterprise Stack<br>
      <strong>Commitment:</strong> 10-15 hrs/week<br>
      <strong>Objective:</strong> Core contribution to ${title}.
    `;
    
    // Insert right before the button
    viewBtn.parentNode.insertBefore(detailsDiv, viewBtn);
    viewBtn.style.marginTop = "12px";

    viewBtn.addEventListener("click", () => {
      if (detailsDiv.classList.contains("hidden")) {
        detailsDiv.classList.remove("hidden");
        viewBtn.textContent = "Hide Details";
      } else {
        detailsDiv.classList.add("hidden");
        viewBtn.textContent = "View Details";
      }
    });
  }
});

// ==========================================
// TASK CARD INTERACTIVITY
// ==========================================
document.querySelectorAll(".task-card").forEach(card => {
  const startBtn = card.querySelector(".primary-btn");
  const secondaryBtn = card.querySelector(".secondary-btn"); // Could be "Continue" or "Start When Ready"
  
  // Handle primary "Start Task" button
  if (startBtn && startBtn.textContent.includes("Start")) {
    startBtn.addEventListener("click", () => {
      startBtn.innerHTML = '<i data-lucide="play-circle" class="icon-sm"></i> In Progress';
      startBtn.style.backgroundColor = "var(--green)";
      startBtn.style.borderColor = "var(--green)";
      startBtn.style.pointerEvents = "none";
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      const title = card.querySelector("h2") ? card.querySelector("h2").textContent : "a new task";
      addManagerMessage(`System Notice: Task started - [${title}].`, false);
      simulateAiResponse(`Great, let's focus on execution for: ${title}. Let me know if you need strategic guidance.`);
    });
  }

  // Handle secondary "Start When Ready" button on low pressure tasks
  if (secondaryBtn && secondaryBtn.textContent.includes("Start When Ready")) {
    secondaryBtn.addEventListener("click", () => {
      secondaryBtn.innerHTML = '<i data-lucide="play-circle" class="icon-sm"></i> In Progress';
      secondaryBtn.style.backgroundColor = "var(--green)";
      secondaryBtn.style.borderColor = "var(--green)";
      secondaryBtn.style.color = "white";
      secondaryBtn.style.pointerEvents = "none";
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      const title = card.querySelector("h2") ? card.querySelector("h2").textContent : "backlog task";
      addManagerMessage(`System Notice: Task started - [${title}].`, false);
      simulateAiResponse("I see you're picking up a backlog task. Excellent time management.");
    });
  }

  // Handle "Continue" button
  if (secondaryBtn && secondaryBtn.textContent.includes("Continue")) {
    secondaryBtn.addEventListener("click", () => {
      const originalText = secondaryBtn.textContent;
      secondaryBtn.innerHTML = '<i data-lucide="check" class="icon-sm"></i> Continued';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      // Scroll to workspace
      const workspace = document.querySelector(".workspace-card");
      if (workspace) {
        workspace.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setTimeout(() => {
        secondaryBtn.textContent = originalText;
      }, 2000);
    });
  }
});

// ==========================================
// OPEN WITH... DROPDOWN LOGIC
// ==========================================
const toolUrls = {
  "vscode": ["VS Code Remote", "https://vscode.dev"],
  "codespaces": ["GitHub Codespaces", "https://github.com/codespaces"],
  "jupyter": ["JupyterLab", "https://jupyter.org/try"],
  "tableau": ["Tableau Server", "https://public.tableau.com/"],
  "figma": ["Figma", "https://www.figma.com"],
  "jira": ["Jira / Notion", "https://www.atlassian.com/software/jira"]
};

document.addEventListener("change", (e) => {
  if (e.target.tagName === 'SELECT' && e.target.classList.contains('secondary-btn') && e.target.options[0].text === "Open with...") {
    const val = e.target.value;
    if (toolUrls[val]) {
      const [toolName, toolUrl] = toolUrls[val];
      
      const toast = document.getElementById("toast");
      if (toast) {
        toast.textContent = `Connecting to ${toolName}...`;
        toast.classList.remove("hidden");
      }
      
      if (typeof addManagerMessage === 'function') {
        addManagerMessage(`System Notice: Connecting ${toolName} to the sprint workspace...`, false);
      }
      
      e.target.disabled = true;

      setTimeout(() => {
        if (toast) {
          toast.textContent = `Connection established. Opening ${toolName}.`;
        }
        if (typeof addManagerMessage === 'function') {
          addManagerMessage(`System Notice: Connection established. ${toolName} environment is active.`, false);
        }
        if (typeof simulateAiResponse === 'function') {
          simulateAiResponse(`Your ${toolName} environment is ready. You can switch to that window to complete your task.`);
        }
        
        window.open(toolUrl, "_blank");
        e.target.disabled = false;
        e.target.selectedIndex = 0; // Reset
        setTimeout(() => { if (toast) toast.classList.add("hidden"); }, 3000);
      }, 2500);
    }
  }
});

const submitToolWorkBtn = document.getElementById("submitToolWorkBtn");
const toolConnectedArea = document.getElementById("toolConnectedArea");
const toolSelectionArea = document.getElementById("toolSelectionArea");

if (submitToolWorkBtn) {
  submitToolWorkBtn.addEventListener("click", () => {
    if (toolConnectedArea) toolConnectedArea.classList.add("hidden");
    if (toolSelectionArea) toolSelectionArea.classList.remove("hidden");
    
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = "Work submitted for review successfully.";
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 3000);
    }
    
    addManagerMessage(`System Notice: External workspace code/data synced and submitted.`, false);
    simulateAiResponse("I've received your submission from the external workspace. I will review the metrics and code quality shortly.");
  });
}

// ==========================================
// SIMULATION SCHEDULE INTERACTIVITY
// ==========================================
const scheduleEvents = document.querySelectorAll(".premium-event");

scheduleEvents.forEach(event => {
  event.addEventListener("click", () => {
    // Toggle the expanded class on the clicked event
    event.classList.toggle("expanded");
  });
});

// ==========================================
// PROFILE ACTION BUTTONS INTERACTIVITY
// ==========================================
const shareProfileBtn = document.getElementById("shareProfileBtn");
const downloadResumeBtn = document.getElementById("downloadResumeBtn");
const fullReportBtn = document.getElementById("fullReportBtn");

function escapeDashboardHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function hydrateDashboardSkillRecord() {
  const panel = document.getElementById("panel-skillrecord");
  if (!panel || !window.DayZeroSkillRecords) return;

  const record = window.DayZeroSkillRecords.latest();
  const user = window.DayZeroSkillRecords.currentUser();
  const nameEl = panel.querySelector(".profile-identity h2");
  const titleEl = panel.querySelector(".profile-title");
  const locationEl = panel.querySelector(".profile-location");
  const avatarEl = panel.querySelector(".profile-avatar-premium");
  const scoreEl = panel.querySelector(".score-value");
  const ringEl = panel.querySelector(".ring-fill");
  const summaryEl = panel.querySelector(".professional-summary p");
  const skillsGridEl = panel.querySelector(".skills-grid");
  const badgesEl = panel.querySelector(".badges-row");
  const rolesEl = panel.querySelector(".roles-row");
  const footerEl = panel.querySelector(".stamp-details p");
  const publicLinkEl = panel.querySelector(".public-link");

  const initials = String(user.name || "Candidate")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "C";

  if (nameEl) nameEl.textContent = user.name || "Candidate";
  if (avatarEl) avatarEl.textContent = initials;

  if (!record) {
    if (titleEl) titleEl.textContent = `${user.role || "Candidate"} | No SkillRecord yet`;
    if (locationEl) locationEl.innerHTML = `<i data-lucide="badge-check" class="icon-xs"></i> Complete a simulation to generate your first saved record`;
    if (scoreEl) scoreEl.textContent = "0";
    if (ringEl) ringEl.style.strokeDashoffset = "283";
    if (summaryEl) summaryEl.textContent = "Your completed simulations will be saved here automatically with PDF download and LinkedIn posting tools.";
    if (skillsGridEl) {
      skillsGridEl.innerHTML = `
        <div class="skill-row"><div class="skill-info"><span>Communication</span><strong>0</strong></div><div class="skill-bar-wrap"><div class="skill-bar-fill" style="width: 0%;"></div></div></div>
        <div class="skill-row"><div class="skill-info"><span>Execution</span><strong>0</strong></div><div class="skill-bar-wrap"><div class="skill-bar-fill" style="width: 0%;"></div></div></div>
      `;
    }
    if (badgesEl) badgesEl.innerHTML = `<div class="ach-badge"><i data-lucide="clock" class="icon-sm"></i> Awaiting first simulation</div>`;
    if (rolesEl) rolesEl.innerHTML = `<span class="role-tag">${escapeDashboardHtml(user.role || "Candidate")}</span>`;
    if (footerEl) footerEl.textContent = "Issued by DayZero Simulation OS | Assessment Date: Pending";
    if (publicLinkEl) publicLinkEl.textContent = "dayzero.ai/your-profile";
    if (typeof lucide !== "undefined") lucide.createIcons();
    return;
  }

  const task = record.task || {};
  const score = Number(record.overall_score) || 0;
  const ringOffset = 283 * (1 - score / 100);

  if (titleEl) titleEl.textContent = `${task.role || user.role || "Candidate"} Candidate`;
  if (locationEl) {
    locationEl.innerHTML = `<i data-lucide="briefcase" class="icon-xs"></i> ${escapeDashboardHtml(task.company || task.company_name || "DayZero")} &nbsp;|&nbsp; <i data-lucide="calendar-days" class="icon-xs"></i> ${escapeDashboardHtml(task.title || "Latest simulation")}`;
  }
  if (scoreEl) scoreEl.textContent = String(score);
  if (ringEl) ringEl.style.strokeDashoffset = String(ringOffset);
  if (summaryEl) summaryEl.textContent = record.summary || record.score_summary || "Latest SkillRecord is ready.";
  if (skillsGridEl) {
    skillsGridEl.innerHTML = window.DayZeroSkillRecords.scoreEntries(record)
      .slice(0, 8)
      .map(([label, value]) => `
        <div class="skill-row"><div class="skill-info"><span>${escapeDashboardHtml(label)}</span><strong>${escapeDashboardHtml(value)}</strong></div><div class="skill-bar-wrap"><div class="skill-bar-fill" style="width: ${Number(value) || 0}%;"></div></div></div>
      `)
      .join("");
  }
  if (badgesEl) {
    const badges = (Array.isArray(record.strengths) && record.strengths.length ? record.strengths : ["Completed DayZero simulation"]).slice(0, 4);
    badgesEl.innerHTML = badges
      .map((badge, index) => `<div class="ach-badge${index === 1 ? " gold" : ""}"><i data-lucide="${index === 1 ? "star" : "check-circle"}" class="icon-sm"></i> ${escapeDashboardHtml(badge)}</div>`)
      .join("");
  }
  if (rolesEl) {
    rolesEl.innerHTML = [task.role || user.role || "Candidate", record.recommendation || "SkillRecord ready", "Simulation-ready profile"]
      .map((role) => `<span class="role-tag">${escapeDashboardHtml(role)}</span>`)
      .join("");
  }
  if (footerEl) {
    const date = new Date(record.submitted_at || record.created_at || Date.now()).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    footerEl.textContent = `Issued by DayZero Simulation OS | Assessment Date: ${date}`;
  }
  if (publicLinkEl) {
    publicLinkEl.textContent = window.DayZeroSkillRecords.publicUrl(record).replace(/^https?:\/\//, "");
  }
  if (typeof lucide !== "undefined") lucide.createIcons();
}

hydrateDashboardSkillRecord();

if (shareProfileBtn) {
  shareProfileBtn.addEventListener("click", () => {
    const latestRecord = window.DayZeroSkillRecords ? window.DayZeroSkillRecords.latest() : null;
    if (!latestRecord) {
      showToast("Complete a simulation first to create a SkillRecord.");
      return;
    }
    const originalText = shareProfileBtn.innerHTML;
    const result = window.DayZeroSkillRecords.openLinkedInPost(latestRecord);
    shareProfileBtn.innerHTML = '<i data-lucide="check" class="icon-sm"></i> LinkedIn Opened';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    showToast(result.opened ? "LinkedIn opened. Post text copied." : "Post text copied. Allow popups to open LinkedIn.");
    
    setTimeout(() => {
      shareProfileBtn.innerHTML = originalText;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 2000);
  });
}

if (downloadResumeBtn) {
  downloadResumeBtn.addEventListener("click", () => {
    const latestRecord = window.DayZeroSkillRecords ? window.DayZeroSkillRecords.latest() : null;
    if (!latestRecord) {
      showToast("Complete a simulation first to download a SkillRecord.");
      return;
    }
    const originalText = downloadResumeBtn.innerHTML;
    downloadResumeBtn.innerHTML = '<i data-lucide="loader-2" class="icon-sm pulse"></i> Downloading...';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    showToast("Downloading SkillRecord PDF...");
    
    setTimeout(() => {
      window.DayZeroSkillRecords.downloadPdf(latestRecord);
      downloadResumeBtn.innerHTML = '<i data-lucide="check" class="icon-sm"></i> Downloaded';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      setTimeout(() => {
        downloadResumeBtn.innerHTML = originalText;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 2000);
    }, 1500);
  });
}

if (fullReportBtn) {
  fullReportBtn.addEventListener("click", () => {
    const reportHTML = localStorage.getItem('lastSimulationReport');
    if (!reportHTML) {
      showToast("No simulation report found. Complete a simulation first!");
      return;
    }
    
    const overlay = document.getElementById("overlay");
    if (!overlay) return;
    
    overlay.classList.remove("hidden");
    overlay.innerHTML = `
      <div class="sprint-modal" style="width: 900px; max-height: 90vh; overflow-y: auto; padding: 0; background: white; border-radius: 24px; position: relative; animation: slideInUp 0.4s ease;">
        <button id="closeReportModal" style="position: absolute; top: 20px; right: 20px; z-index: 100; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
          <i data-lucide="x" style="width: 20px; height: 20px; color: #64748b;"></i>
        </button>
        <div id="reportContainer" class="cert-wrapper" style="padding:0; margin:0;">
          ${reportHTML}
        </div>
      </div>
    `;
    
    document.getElementById("closeReportModal").onclick = () => {
      overlay.classList.add("hidden");
      overlay.innerHTML = "";
    };
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof window.drawAnalyticsChart === 'function') {
      setTimeout(window.drawAnalyticsChart, 100);
    }
    
    showToast("Opening Full Performance Report...");
  });
}

// ==========================================
// TEAM CHAT INTERACTIVITY
// ==========================================
const teamChatInput = document.getElementById("teamChatInput");
const teamChatSend = document.getElementById("teamChatSend");
const teamChatHistory = document.getElementById("teamChatHistory");

function loadOrchestratorState() {
  try {
    return JSON.parse(localStorage.getItem(ORCHESTRATOR_STATE_KEY) || "{}");
  } catch (error) {
    return {};
  }
}

function saveOrchestratorState(nextState) {
  const merged = {
    ...loadOrchestratorState(),
    ...nextState
  };
  localStorage.setItem(ORCHESTRATOR_STATE_KEY, JSON.stringify(merged));
  return merged;
}

function escapeChatHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function appendTeamChatMessage(name, role, message, type = "agent") {
  if (!teamChatHistory) return;
  const msg = document.createElement("div");
  msg.className = `chat-msg ${type}`;
  msg.innerHTML = `<strong>${escapeChatHtml(name)}${role ? ` (${escapeChatHtml(role)})` : ""}:</strong> ${escapeChatHtml(message)}`;
  teamChatHistory.appendChild(msg);
  teamChatHistory.scrollTop = teamChatHistory.scrollHeight;
}

function updateTaskFromSimulation(task) {
  if (!task) return;
  const taskTitleEl = document.querySelector(".task-card h2");
  const taskDescEl = document.querySelector(".task-card .task-desc");
  const metaStrongEls = document.querySelectorAll(".task-card .task-meta strong");
  const reqEls = document.querySelectorAll(".requirement-list .req");

  if (taskTitleEl && task.title) {
    taskTitleEl.innerText = task.title;
  }
  if (taskDescEl && task.summary) {
    taskDescEl.innerText = task.summary;
  }
  if (metaStrongEls[0] && task.deadline_minutes) {
    metaStrongEls[0].innerText = `${task.deadline_minutes} mins`;
  }
  if (metaStrongEls[1] && task.deadline_minutes) {
    metaStrongEls[1].innerText = `${task.deadline_minutes}m left`;
  }
  if (metaStrongEls[2] && task.priority) {
    metaStrongEls[2].innerText = task.priority;
  }
  if (reqEls.length && Array.isArray(task.requirements)) {
    reqEls.forEach((node, index) => {
      node.innerText = task.requirements[index] ? `✓ ${task.requirements[index]}` : "";
    });
  }
}

function hydrateCoopRoster() {
  const labels = document.querySelectorAll(".coop-user span:first-of-type");
  const roster = [
    "You (Candidate)",
    "Asha (PM)",
    "Rohan (Backend)",
    "Mira (Design)",
    "Dev (QA)"
  ];
  labels.forEach((node, index) => {
    if (roster[index]) {
      node.innerText = roster[index];
    }
  });
}

function predictTypingName(userText, phase) {
  const lowered = String(userText || "").toLowerCase();
  if (lowered.includes("api") || lowered.includes("backend") || lowered.includes("retry") || lowered.includes("payload") || lowered.includes("token") || lowered.includes("error")) {
    return "Rohan";
  }
  if (lowered.includes("mobile") || lowered.includes("design") || lowered.includes("ui") || lowered.includes("ux") || lowered.includes("loading") || lowered.includes("spacing") || lowered.includes("copy")) {
    return "Mira";
  }
  if (lowered.includes("test") || lowered.includes("bug") || lowered.includes("edge case") || lowered.includes("validate")) {
    return "Dev";
  }
  if (phase === "validation") {
    return "Dev";
  }
  return "Asha";
}

async function initializeLiveSimulation(forceRefresh = false) {
  if (!teamChatHistory) return loadOrchestratorState();

  const role = getCandidateRole();
  const cached = loadOrchestratorState();
  if (cached.session_id && !forceRefresh && cached.role === role) {
    if (cached.task) {
      updateTaskFromSimulation(cached.task);
    }
    if (Array.isArray(cached.initial_messages) && cached.initial_messages.length) {
      teamChatHistory.innerHTML = "";
      cached.initial_messages.forEach((entry) => {
        appendTeamChatMessage(entry.speaker_name || entry.name, entry.speaker_title || entry.role, entry.message || entry.content || "");
      });
    }
    return cached;
  }

  const response = await fetch(`${API_BASE_URL}/api/simulation/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role })
  });
  const data = await response.json();

  const nextState = saveOrchestratorState({
    session_id: data.session_id,
    task: data.task || null,
    memory: data.memory || {},
    scores: data.scores || {},
    phase: data.phase || "planning",
    role,
    initial_messages: data.initial_messages || []
  });

  updateTaskFromSimulation(data.task);
  hydrateCoopRoster();
  teamChatHistory.innerHTML = "";
  (data.initial_messages || []).forEach((entry) => {
    appendTeamChatMessage(entry.speaker_name, entry.speaker_title, entry.message);
  });

  return nextState;
}

async function handleTeamChatSend() {
  if (!teamChatInput || !teamChatInput.value.trim() || !teamChatHistory) return;
  
  // Stats update
  advanceCalendarProgress();
  const collabEl = document.getElementById("statCollab");
  if (collabEl) {
    let collab = parseInt(collabEl.innerText.replace('%',''), 10) || 89;
    if (collab < 99) collab += 1;
    collabEl.innerText = collab + "%";
  }
  
  const userText = teamChatInput.value.trim();
  
  appendTeamChatMessage("You", "Candidate", userText, "user");
  
  teamChatInput.value = "";
  let orchestratorState = loadOrchestratorState();
  if (!orchestratorState.session_id) {
    orchestratorState = await initializeLiveSimulation(true);
  }

  // Show Typing Indicator
  const typingMsg = document.createElement("div");
  typingMsg.className = "chat-msg typing-indicator";
  typingMsg.innerHTML = `<em>${escapeChatHtml(predictTypingName(userText, orchestratorState.phase))} is typing...</em>`;
  teamChatHistory.appendChild(typingMsg);
  teamChatHistory.scrollTop = teamChatHistory.scrollHeight;

  try {
      const response = await fetch(`${API_BASE_URL}/api/agent/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: orchestratorState.session_id,
          event_type: "candidate_message",
          candidate_message: userText,
          memory: orchestratorState.memory || {},
          scores: orchestratorState.scores || {},
          phase: orchestratorState.phase || "planning",
          role: getCandidateRole()
        })
      });

      const data = await response.json();
      typingMsg.remove();
      saveOrchestratorState({
        session_id: data.session_id,
        task: data.task || orchestratorState.task || null,
        memory: data.memory || {},
        scores: data.scores || {},
        role: getCandidateRole(),
        phase: data.phase || "planning"
      });
      updateTaskFromSimulation(data.task);
      appendTeamChatMessage(
        data.agent && data.agent.name ? data.agent.name : "AI teammate",
        data.agent && data.agent.role ? data.agent.role : "",
        data.message || "I'm here."
      );

  } catch (error) {
    console.error("Team Chat Error:", error);
    typingMsg.remove();
    appendTeamChatMessage(
      "System",
      "Backend",
      `Backend chat failed: ${error.message || "unknown error"}. Check Flask logs; no hardcoded teammate reply was used.`,
      "system"
    );
  }
}

if (teamChatSend) {
  teamChatSend.addEventListener("click", handleTeamChatSend);
}

if (teamChatInput) {
  teamChatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleTeamChatSend();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initializeCandidateProfile();
  initializeLiveSimulation().catch((error) => {
    console.error("Simulation init error:", error);
  });
});

// ==========================================
// GLOBAL BEHAVIORAL ANALYTICS TRACKING
// ==========================================
let thinkingTime = 18;
let activityCount = 0;

setInterval(() => {
  const timeEl = document.getElementById("statThinking");
  if (timeEl) {
    thinkingTime++;
    timeEl.innerText = `${thinkingTime}m`;
  }
  
  // Decay activity
  if (activityCount > 0) activityCount = Math.floor(activityCount / 2);
}, 60000);

// Global interaction tracker
document.addEventListener("click", (e) => {
  activityCount++;
  
  // Track prioritization (Clicking buttons in task cards)
  if (e.target.closest('.task-card') && e.target.classList.contains('primary-btn')) {
    const priorEl = document.getElementById("statPrioritization");
    if (priorEl) priorEl.innerText = "Excellent";
    
    const confEl = document.getElementById("statConfidence");
    if (confEl) {
      let conf = parseInt(confEl.innerText) || 82;
      if (conf < 99) conf += 2;
      confEl.innerText = `${conf}%`;
    }
  }
  
  // Update consistency based on activity rate
  const consistEl = document.getElementById("statConsistency");
  if (consistEl) {
    if (activityCount > 10) consistEl.innerText = "Excellent";
    else if (activityCount > 4) consistEl.innerText = "High";
  }
});

// ==========================================
// HEATMAP GENERATION
// ==========================================
const heatmapContainer = document.getElementById('productivityHeatmap');
if (heatmapContainer) {
  // Generate 20 weeks * 7 days = 140 squares
  for (let i = 0; i < 140; i++) {
    const square = document.createElement('div');
    square.classList.add('heat');
    
    // Assign random activity levels to make it look realistic
    const rand = Math.random();
    if (rand > 0.92) square.classList.add('level-4');
    else if (rand > 0.8) square.classList.add('level-3');
    else if (rand > 0.65) square.classList.add('level-2');
    else if (rand > 0.4) square.classList.add('level-1');
    else square.classList.add('empty');
    
    // Optional: add a tooltip with mock date/contribution
    square.title = `${Math.floor(Math.random() * 12)} contributions on this day`;
    
    heatmapContainer.appendChild(square);
  }
}

// ==========================================
// WELCOME TUTORIAL LOGIC
// ==========================================
const welcomePopup = document.getElementById("welcomePopup");
const closeWelcome = document.getElementById("closeWelcome");
const startSimBtn = document.getElementById("startSimBtn");

if (welcomePopup) {
  // Show welcome popup on load if not seen before
  if (!localStorage.getItem('dayzero_welcome_seen')) {
    welcomePopup.classList.remove("hidden");
  }

  const dismissWelcome = () => {
    welcomePopup.classList.add("hidden");
    localStorage.setItem('dayzero_welcome_seen', 'true');
    // Start simulation timer or first crisis
    setTimeout(showRandomCrisis, 12000);
  };

  if (closeWelcome) closeWelcome.addEventListener("click", dismissWelcome);
  if (startSimBtn) startSimBtn.addEventListener("click", dismissWelcome);
}
window.addEventListener("DOMContentLoaded", () => {

    const studentData = {
        name: "Saavi Patel",
        role: "Frontend Developer"
    };

    localStorage.setItem(
        "student",
        JSON.stringify(studentData)
    );

    const student =
        JSON.parse(localStorage.getItem("student"));

    if(student){

        const initials = student.name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase();

        document.getElementById("studentAvatar").innerText =
            initials;
    }

});
