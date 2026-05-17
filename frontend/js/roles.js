const ROLE_ALIASES = {
  frontend: "Frontend",
  "frontend developer": "Frontend",
  backend: "Backend",
  "backend developer": "Backend",
  pm: "Product Manager",
  product: "Product Manager",
  "product manager": "Product Manager",
  data: "Data Analyst",
  analyst: "Data Analyst",
  "data analyst": "Data Analyst",
  design: "Designer",
  designer: "Designer"
};

function normalizeRole(value) {
  const key = String(value || "").trim().toLowerCase();
  return ROLE_ALIASES[key] || "Frontend";
}

const profile = {
  role: normalizeRole(localStorage.getItem("userRole")),
  level: localStorage.getItem("userExperience") || "Intermediate",
  type: localStorage.getItem("simulationType") || "1-hour Task"
};

const profilePreview = document.getElementById("profilePreview");
const continueBtn = document.getElementById("continueBtn");

function setActive(containerId, value) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll(".option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.value === value);
  });
}

function updatePreview() {
  if (profilePreview) {
    profilePreview.textContent = `${profile.role} - ${profile.level} - ${profile.type}`;
  }

  localStorage.setItem("userRole", profile.role);
  localStorage.setItem("userExperience", profile.level);
  localStorage.setItem("simulationType", profile.type);

  setActive("roleOptions", profile.role);
  setActive("levelOptions", profile.level);
  setActive("typeOptions", profile.type);
}

function bindOptions(containerId, key) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.querySelectorAll(".option").forEach((btn) => {
    btn.addEventListener("click", () => {
      profile[key] = key === "role" ? normalizeRole(btn.dataset.value) : btn.dataset.value;
      updatePreview();
    });
  });
}

function clearCandidateSimulationState() {
  localStorage.removeItem("dayzero_orchestrator_state");
  localStorage.removeItem("dayzero_task_id");
  localStorage.removeItem("selectedTaskId");
  localStorage.removeItem("dayzero_selected_task_details");
}

bindOptions("roleOptions", "role");
bindOptions("levelOptions", "level");
bindOptions("typeOptions", "type");

if (continueBtn) {
  continueBtn.addEventListener("click", () => {
    localStorage.setItem("candidateSetupComplete", "true");
    clearCandidateSimulationState();
    window.location.href = "dashboard.html";
  });
}

updatePreview();
