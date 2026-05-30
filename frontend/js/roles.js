if (localStorage.getItem("role") === "invited candidate") {
  window.location.href = "dashboard.html";
}

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

function normalizeRole(value) {
  const key = String(value || "").trim().toLowerCase();
  return ROLE_ALIASES[key] || "Frontend Engineer";
}

const profile = {
  role: normalizeRole(localStorage.getItem("userRole")),
  level: localStorage.getItem("userExperience") || "Intermediate"
};

const continueBtn = document.getElementById("continueBtn");

function setActive(containerId, value) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll(".role-card, .level-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === value);
  });
}

function updateSelection() {
  localStorage.setItem("userRole", profile.role);
  localStorage.setItem("userExperience", profile.level);

  setActive("roleOptions", profile.role);
  setActive("levelOptions", profile.level);
}

function bindRoleCards() {
  const container = document.getElementById("roleOptions");
  if (!container) return;

  container.querySelectorAll(".role-card").forEach((btn) => {
    btn.addEventListener("click", () => {
      profile.role = normalizeRole(btn.dataset.value);
      updateSelection();
    });
  });
}

function bindLevelButtons() {
  const container = document.getElementById("levelOptions");
  if (!container) return;

  container.querySelectorAll(".level-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      profile.level = btn.dataset.value;
      updateSelection();
    });
  });
}

function clearCandidateSimulationState() {
  localStorage.removeItem("dayzero_orchestrator_state");
  localStorage.removeItem("dayzero_task_id");
  localStorage.removeItem("selectedTaskId");
  localStorage.removeItem("dayzero_selected_task_details");
}

bindRoleCards();
bindLevelButtons();

if (continueBtn) {
  continueBtn.addEventListener("click", () => {
    let user = {};
    try {
      user = JSON.parse(localStorage.getItem("user")) || {};
    } catch (e) {
      console.warn("Could not parse user from localStorage", e);
    }
    
    // Standardize user object matching requirements
    user.selectedRole = profile.role;
    user.experienceLevel = profile.level;
    user.role = "demo user";
    user.accountType = "demo_user";
    
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("userRole", profile.role);
    localStorage.setItem("userExperience", profile.level);
    localStorage.setItem("role", "demo user");
    localStorage.setItem("candidateSetupComplete", "true");
    
    clearCandidateSimulationState();
    window.location.href = "dashboard.html";
  });
}

updateSelection();
