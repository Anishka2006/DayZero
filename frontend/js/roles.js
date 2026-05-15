const profile = {
  role: localStorage.getItem("userRole") || "Frontend",
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
  profilePreview.textContent = `${profile.role} · ${profile.level} · ${profile.type}`;

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
      profile[key] = btn.dataset.value;
      updatePreview();
    });
  });
}

bindOptions("roleOptions", "role");
bindOptions("levelOptions", "level");
bindOptions("typeOptions", "type");

continueBtn.addEventListener("click", () => {
  localStorage.setItem("candidateSetupComplete", "true");
  window.location.href = "dashboard.html";
});

updatePreview();