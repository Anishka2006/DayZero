const API_BASE_URL = localStorage.getItem("dayzero_api_base") || "https://madap.onrender.com";

const LOADING_MESSAGES = [
  "Initializing workspace...",
  "Syncing teammates...",
  "Loading files...",
  "Connecting channels...",
  "Preparing simulation room...",
  "Reviewing architecture...",
  "Starting sprint...",
];

let currentMessageIndex = 0;
let messageInterval = null;
let progressInterval = null;
let startTime = Date.now();
let fallbackTimer = null;
let errorTimer = null;

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

function startMessageRotation() {
  rotateLoadingMessages();
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
    const raw = localStorage.getItem("dayzero_selected_task_details");
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return parsed && parsed.id === taskId ? parsed : null;
  } catch (error) {
    return null;
  }
}

async function initializeSession() {
  const taskId = sessionStorage.getItem("dayzero_task_id");
  const role = sessionStorage.getItem("dayzero_role");
  const difficulty = sessionStorage.getItem("dayzero_difficulty");
  const taskContext = selectedTaskContext(taskId);
  const backendTaskId = TASK_TO_BACKEND_TASK_ID[taskId] || taskId;

  if (!taskId) {
    showError("Missing task information. Please start from the dashboard.");
    return null;
  }

  localStorage.setItem("dayzero_task_id", taskId);
  resetStoredSimulationRun(taskId);

  try {
    // First, call health endpoint to wake up Render
    await fetch(`${API_BASE_URL}/health`, { method: "GET" });

    // Then create session
    const response = await fetch(`${API_BASE_URL}/api/sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        task_id: backendTaskId,
        role: role || "Frontend",
        difficulty: difficulty || "Medium",
        participant_name: localStorage.getItem("userName") || "Candidate",
        task_context: taskContext,
      }),
    });

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
  // Store session data in sessionStorage for simulation.html to use
  sessionStorage.setItem("dayzero_session_data", JSON.stringify(sessionData));

  // Navigate to simulation
  window.location.replace("simulation.html");
}

async function startLoadingSequence() {
  startMessageRotation();
  startProgressAnimation();

  // Show fallback after 8 seconds
  fallbackTimer = setTimeout(() => {
    showFallback("Render is waking up the simulation service...");
  }, 8000);

  // Show error after 20 seconds
  errorTimer = setTimeout(() => {
    showFallback("Still preparing the room. Retry connection");
  }, 20000);

  try {
    const sessionData = await initializeSession();

    if (sessionData) {
      cleanup();
      navigateToSimulation(sessionData);
    }
  } catch (error) {
    cleanup();
    hideFallback();
    showError("Could not initialize simulation. Please retry.");
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

if (retryBtn) {
  retryBtn.addEventListener("click", retryConnection);
}

if (errorRetryBtn) {
  errorRetryBtn.addEventListener("click", retryConnection);
}

// Start the loading sequence when page loads
document.addEventListener("DOMContentLoaded", startLoadingSequence);
