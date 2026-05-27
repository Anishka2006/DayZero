const API_BASE_URL = window.API_BASE_URL || ((["localhost", "127.0.0.1"].includes(window.location.hostname) || window.location.protocol === "file:") ? "http://127.0.0.1:5001" : "https://dayzero-2.onrender.com");
const DEFAULT_API_BASE_URL = API_BASE_URL;

const LOADING_MESSAGES = [
  "Initializing simulation workspace...",
  "Syncing teammates and project context...",
  "Loading company files, sprint board, and active blockers...",
  "AI teammates are reviewing the task brief...",
  "Preparing live work environment...",
  "Observer agent connected silently...",
  "Building your SkillRecord evaluation pipeline...",
  "Simulation room ready.",
];

let currentMessageIndex = 0;
let messageInterval = null;
let progressInterval = null;
let startTime = Date.now();
let fallbackTimer = null;
let errorTimer = null;
let loadingRunId = 0;

const statusText = document.getElementById("statusText");
const progressFill = document.getElementById("progressFill");
const fallbackSection = document.getElementById("fallbackSection");
const fallbackMessage = document.getElementById("fallbackMessage");
const retryBtn = document.getElementById("retryBtn");
const errorSection = document.getElementById("errorSection");
const errorMessage = document.getElementById("errorMessage");
const errorRetryBtn = document.getElementById("errorRetryBtn");

const TASK_TO_BACKEND_TASK_ID = {
  "frontend-homeflow": "mobile-growth",
  "frontend-dashboard": "fraud-dashboard",
  "frontend-product": "ai-copilot",
  "frontend-accessibility": "docs-update",
  "frontend-spa": "astra-spa-migration",
  "frontend-visual": "mobile-growth",
  "backend-api-health": "login-recovery",
  "backend-cache": "search-quality",
  "backend-auth": "login-recovery",
  "backend-queue": "video-encoding",
  "backend-migration": "search-quality",
  "backend-scaling": "search-quality",
  "pm-priority": "mobile-growth",
  "pm-metrics": "fraud-dashboard",
  "pm-goals": "mobile-growth",
  "pm-feedback": "mobile-growth",
  "pm-strategy": "fraud-dashboard",
  "pm-launch": "mobile-growth",
  "data-adhoc": "fraud-dashboard",
  "data-dashboard": "fraud-dashboard",
  "data-model": "fraud-dashboard",
  "data-experiment": "search-ranking",
  "data-forecast": "fraud-dashboard",
  "data-scaling": "search-quality",
  "design-prototype": "mobile-growth",
  "design-style": "mobile-growth",
  "design-research": "mobile-growth",
  "design-dashboard-prototype": "fraud-dashboard",
  "design-system": "mobile-growth",
  "design-ops": "docs-update",
  "qa-checkout-regression": "qa-release",
  "qa-onboarding-mobile": "qa-release",
  "qa-release-blocker": "qa-release",
  "qa-analytics-mismatch": "qa-release",
  "qa-sprint-signoff": "qa-release",
  "qa-support-spike": "qa-release",
  "spotify-creator-retention": "playlist-generator",
};

function rotateLoadingMessages() {
  if (!statusText) return;

  statusText.classList.add("fade-out");

  setTimeout(() => {
    statusText.textContent = LOADING_MESSAGES[currentMessageIndex];
    statusText.classList.remove("fade-out");
    statusText.classList.add("fade-in");
    currentMessageIndex = (currentMessageIndex + 1) % LOADING_MESSAGES.length;
  }, 300);
}

function setStatus(message) {
  if (!statusText || !message) return;
  statusText.textContent = message;
  statusText.classList.remove("fade-out");
  statusText.classList.add("fade-in");
}

function startMessageRotation() {
  currentMessageIndex = 0;
  setStatus(LOADING_MESSAGES[currentMessageIndex]);
  currentMessageIndex = 1;
  messageInterval = setInterval(rotateLoadingMessages, 2500);
}

function updateProgress() {
  if (!progressFill) return;

  const elapsed = Date.now() - startTime;
  const progress = Math.min((elapsed / 8000) * 100, 100);
  progressFill.style.width = `${progress}%`;
}

function startProgressAnimation() {
  progressInterval = setInterval(updateProgress, 100);
}

function showFallback(message) {
  if (fallbackSection) {
    fallbackSection.classList.add("visible");
    if (fallbackMessage && message) {
      fallbackMessage.textContent = message;
    }
  }
}

function showError(message) {
  if (errorSection) {
    errorSection.classList.add("visible");
    if (errorMessage && message) {
      errorMessage.textContent = message;
    }
  }
}

function hideFallback() {
  if (fallbackSection) {
    fallbackSection.classList.remove("visible");
  }
}

function hideError() {
  if (errorSection) {
    errorSection.classList.remove("visible");
  }
}

function cleanup() {
  if (messageInterval) clearInterval(messageInterval);
  if (progressInterval) clearInterval(progressInterval);
  if (fallbackTimer) clearTimeout(fallbackTimer);
  if (errorTimer) clearTimeout(errorTimer);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      cache: "no-store",
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function resetStoredSimulationRun(taskId) {
  if (!taskId) return;

  [
    "dayzeroSimulationSession::",
    "dayzeroWorkspaceState::",
    "dayzeroTimelineState::",
  ].forEach((prefix) => {
    localStorage.removeItem(`${prefix}${taskId}`);
  });

  localStorage.removeItem("dayzero_orchestrator_state");
  sessionStorage.removeItem("dayzero_session_data");
}

function selectedTaskContext(taskId) {
  try {
    const raw = sessionStorage.getItem("dayzero_selected_task_details") || localStorage.getItem("dayzero_selected_task_details");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed && parsed.id === taskId ? parsed : null;
  } catch (error) {
    return null;
  }
}

async function wakeBackendService() {
  const maxAttempts = 10;
  const timeoutMs = 5000;
  const delayMs = 1500;
  let lastError = null;

  setStatus("Connecting to backend server...");

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      if (attempt > 1) {
        setStatus(`Server is warming up. Waking it up (Attempt ${attempt}/${maxAttempts})...`);
      }

      const response = await fetchWithTimeout(`${API_BASE_URL}/health`, { method: "GET" }, timeoutMs);
      if (response.ok) {
        setStatus("Preparing live work environment...");
        hideFallback();
        return true;
      }
      lastError = new Error(`Health check returned ${response.status}`);
    } catch (error) {
      lastError = error;
      console.warn(`Wake attempt ${attempt} failed:`, error.message || error);
    }

    if (attempt < maxAttempts) {
      await sleep(delayMs);
    }
  }

  throw lastError || new Error("Backend health check failed after multiple wake attempts.");
}

function loadingRoleDomain(value) {
  const text = String(value || "").toLowerCase();
  if (/\b(qa|quality|tester|testing|test engineer)\b/.test(text)) return "qa";
  if (/\b(data|analyst|analytics|metric|forecast|experiment|sql|dashboard)\b/.test(text)) return "data";
  if (/\b(design|designer|ux|ui|accessibility|prototype|microcopy|frontend|front-end|react|component|mobile|css|screen)\b/.test(text)) return "designer";
  if (/\b(backend|api|server|cache|queue|database|migration|scaling|worker)\b/.test(text)) return "backend";
  if (/\b(product|pm|launch|priority|roadmap|stakeholder|strategy)\b/.test(text)) return "pm";
  return "pm";
}

function localOpeningMessagesForRole(role, taskId) {
  const candidateAgentId = loadingRoleDomain(role);
  const profiles = [
    {
      id: "pm",
      speaker_name: "Asha",
      speaker_title: "Product Manager",
      avatar: "A",
      message: taskId && taskId.includes("spotify")
        ? "Let's pin the retention decision first, then name the metric caveat before we widen scope."
        : "Let's scope the smallest safe room decision first, then say what waits.",
    },
    {
      id: "backend",
      speaker_name: "Ravi",
      speaker_title: "Engineering Lead",
      avatar: "R",
      message: "I will watch the system contract and rollback path; keep the implementation risk explicit.",
    },
    {
      id: "designer",
      speaker_name: "Mira",
      speaker_title: "Product Designer",
      avatar: "M",
      message: "I will keep the user-facing state calm: clear loading, error, retry, and accessibility behavior.",
    },
    {
      id: "qa",
      speaker_name: "Kenji",
      speaker_title: "QA Engineer",
      avatar: "K",
      message: "I will push on release proof: one messy edge case, one retest path, and a clear ship or hold call.",
    },
    {
      id: "data",
      speaker_name: "Leah",
      speaker_title: "Data Analyst",
      avatar: "L",
      message: "I will keep the success signal honest: metric, segment, trend, and caveat.",
    },
  ];

  return profiles
    .filter((profile) => profile.id !== candidateAgentId)
    .slice(0, 2)
    .map((profile) => ({
      ...profile,
      role: "agent",
      channel: "team",
      created_at: new Date().toISOString(),
    }));
}

function generateLocalMockSession(taskId) {
  const role = sessionStorage.getItem("dayzero_role") || localStorage.getItem("userRole") || "Frontend";
  const difficulty = sessionStorage.getItem("dayzero_difficulty") || localStorage.getItem("userExperience") || "Medium";
  const name = localStorage.getItem("userName") || "Developer";

  let headline = "Optimize Sprint Room";
  let summary = "Ensure task-specific decisions are made quickly and evidence is clear.";
  let initialMessages = [];
  
  if (taskId && taskId.includes("spotify")) {
    headline = "Creator Retention Campaign";
    summary = "Address conflicting metrics regarding creator retention versus user acquisition.";
    initialMessages = localOpeningMessagesForRole(role, taskId);
  } else {
    headline = "Sprint Room Optimization";
    summary = "Execute task decisions rapidly, resolve blocker items, and verify metrics.";
    initialMessages = localOpeningMessagesForRole(role, taskId);
  }

  return {
    session_id: "local-session-" + taskId + "-" + Date.now(),
    phase: "planning",
    status: "active",
    task_id: taskId,
    role: role,
    difficulty: difficulty,
    participant_name: name,
    messages: initialMessages,
    memory: {
      phase: "planning",
      timeline: [
        {
          title: "Sprint Room Initiated",
          description: `Collaborative offline workspace initialized for task "${taskId}".`,
          created_at: new Date().toISOString()
        }
      ]
    }
  };
}

async function initializeSession() {
  const taskId = sessionStorage.getItem("dayzero_task_id") || localStorage.getItem("dayzero_task_id");
  const role = sessionStorage.getItem("dayzero_role") || localStorage.getItem("userRole");
  const difficulty = sessionStorage.getItem("dayzero_difficulty") || localStorage.getItem("userExperience");
  const taskContext = selectedTaskContext(taskId);
  const backendTaskId = TASK_TO_BACKEND_TASK_ID[taskId] || taskId;

  if (!taskId) {
    showError("Missing task information. Please start from the dashboard.");
    return null;
  }

  localStorage.setItem("dayzero_task_id", taskId);
  sessionStorage.setItem("dayzero_task_id", taskId);
  resetStoredSimulationRun(taskId);

  try {
    await wakeBackendService();

    const response = await fetchWithTimeout(`${API_BASE_URL}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_id: backendTaskId,
        role: role || "Frontend",
        difficulty: difficulty || "Medium",
        participant_name: localStorage.getItem("userName") || "Candidate",
        task_context: taskContext,
      }),
    }, 8000);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Session initialization error:", error);
    throw error;
  }
}

function navigateToSimulation(sessionData) {
  sessionStorage.setItem("dayzero_session_data", JSON.stringify(sessionData));
  window.location.replace("simulation.html");
}

async function startLoadingSequence() {
  cleanup();
  const runId = ++loadingRunId;
  startMessageRotation();
  startProgressAnimation();

  // Show fallback options after 2.5 seconds
  fallbackTimer = setTimeout(() => {
    showFallback("Connecting to live simulation server... Or launch in Demo Mode immediately.");
  }, 2500);

  // Show error / demo mode option after 6 seconds
  errorTimer = setTimeout(() => {
    showError("You can launch in Offline Demo Mode.");
  }, 6000);

  try {
    const sessionData = await initializeSession();

    if (sessionData && runId === loadingRunId) {
      cleanup();
      setStatus("Simulation room ready.");
      if (progressFill) {
        progressFill.style.width = "100%";
      }
      await sleep(450);
      navigateToSimulation(sessionData);
    }
  } catch (error) {
    if (runId !== loadingRunId) return;
    console.warn("Could not connect to live backend, falling back to local simulation mode.", error);
    cleanup();
    setStatus("Active backend not detected. Booting Offline Demo Workspace...");
    if (progressFill) {
      progressFill.style.width = "100%";
    }
    
    const taskId = sessionStorage.getItem("dayzero_task_id") || localStorage.getItem("dayzero_task_id") || "spotify-creator-retention";
    const mockSession = generateLocalMockSession(taskId);
    
    await sleep(800);
    navigateToSimulation(mockSession);
  }
}

function retryConnection() {
  hideFallback();
  hideError();
  startTime = Date.now();
  currentMessageIndex = 0;
  progressFill.style.width = "0%";
  startLoadingSequence();
}

function launchDemoMode() {
  cleanup();
  setStatus("Launching local simulation room...");
  if (progressFill) progressFill.style.width = "100%";
  
  const taskId = sessionStorage.getItem("dayzero_task_id") || localStorage.getItem("dayzero_task_id") || "spotify-creator-retention";
  const mockSession = generateLocalMockSession(taskId);
  
  setTimeout(() => {
    navigateToSimulation(mockSession);
  }, 600);
}

if (retryBtn) {
  retryBtn.addEventListener("click", retryConnection);
}

if (errorRetryBtn) {
  errorRetryBtn.addEventListener("click", retryConnection);
}

const demoBtn = document.getElementById("demoBtn");
const errorDemoBtn = document.getElementById("errorDemoBtn");

if (demoBtn) {
  demoBtn.addEventListener("click", launchDemoMode);
}
if (errorDemoBtn) {
  errorDemoBtn.addEventListener("click", launchDemoMode);
}

document.addEventListener("DOMContentLoaded", startLoadingSequence);
