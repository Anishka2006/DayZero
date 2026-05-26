const API_BASE_URL = window.API_BASE_URL || "https://dayzero-backend-0n1y.onrender.com";
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
  const attempts = [
    { timeout: 1500, delay: 0 }
  ];

  let lastError = null;

  for (let index = 0; index < attempts.length; index += 1) {
    const attempt = attempts[index];
    try {
      const response = await fetchWithTimeout(`${API_BASE_URL}/health`, { method: "GET" }, attempt.timeout);
      if (response.ok) {
        setStatus("Preparing live work environment...");
        hideFallback();
        return true;
      }
      lastError = new Error(`Health check returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Backend health check failed.");
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
    initialMessages = [
      {
        speaker_name: "Sarah (Product Manager)",
        speaker_title: "Product Lead",
        avatar: "S",
        role: "agent",
        channel: "team",
        message: "Welcome to the Stripe/Spotify sprint room! We need to analyze why creator retention metrics fell 12% in the last cohort. Let's inspect the dataset in the workspace.",
        created_at: new Date().toISOString()
      },
      {
        speaker_name: "Kenji (QA Engineer)",
        speaker_title: "QA Lead",
        avatar: "K",
        role: "agent",
        channel: "team",
        message: "I've checked the telemetry. It looks like the experimental analytics logger might have been double-counting active sessions or duplicating events. I've left the files in the workspace.",
        created_at: new Date().toISOString()
      }
    ];
  } else {
    headline = "Sprint Room Optimization";
    summary = "Execute task decisions rapidly, resolve blocker items, and verify metrics.";
    initialMessages = [
      {
        speaker_name: "Sarah (Product Manager)",
        speaker_title: "Product Lead",
        avatar: "S",
        role: "agent",
        channel: "team",
        message: `Welcome team! Let's get the ${role} requirements scoped and execute on this issue immediately. Check the files list in the workspace.`,
        created_at: new Date().toISOString()
      },
      {
        speaker_name: "Kenji (QA Engineer)",
        speaker_title: "QA Lead",
        avatar: "K",
        role: "agent",
        channel: "team",
        message: "Hey! Ready to review and validate our changes. Let's make sure our checkout validation is covered.",
        created_at: new Date().toISOString()
      }
    ];
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
    showError("Server temporarily unavailable. You can launch in Offline Demo Mode.");
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
