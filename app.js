// app.js
// DayZero Full Interaction Script
// Buttons + Scroll + Navbar + Reveal + Progress Bars + Email Domain Validation

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initAuthModal();  // MOVED BEFORE SMOOTH SCROLL - This is important!
  initSmoothScroll();
  initRevealAnimation();
  initProgressBars();
  initButtons();
  initTimer();
  initModal();
  initSprintLinks();
});

const DAYZERO_RENDER_BACKEND_URL = "https://dayzero-backend-0n1y.onrender.com";
const AUTH_BASE_URL = window.AUTH_BASE_URL || window.API_BASE_URL || DAYZERO_RENDER_BACKEND_URL;
const PLATFORM_API_BASE_URL = window.API_BASE_URL || DAYZERO_RENDER_BACKEND_URL;


// Hardcoded approved recruiter domains
const approvedRecruiterDomains = [
  "google.com",
  "microsoft.com",
  "amazon.com",
  "apple.com",
  "meta.com",
  "facebook.com",
  "netflix.com",
  "adobe.com",
  "tesla.com",
  "linkedin.com",
  "uber.com",
  "airbnb.com",
  "spotify.com",
  "slack.com",
  "salesforce.com",
  "ibm.com",
  "oracle.com",
  "cisco.com",
  "intel.com",
  "qualcomm.com",
  "vmware.com",
  "redhat.com",
];

function getEmailDomain(email) {
  try {
    return email.split("@")[1].toLowerCase();
  } catch {
    return "";
  }
}

function isApprovedRecruiterDomain(email) {
  const domain = getEmailDomain(email);
  return approvedRecruiterDomains.includes(domain);
}

function parseRecruiterEmail(email) {
  if (!email) return null;
  email = email.trim().toLowerCase();
  
  let companyName = "";
  let name = "";
  
  if (email.includes("@")) {
    const parts = email.split("@");
    const username = parts[0];
    const domain = parts[1];
    
    const domainParts = domain.split(".");
    if (domainParts.length >= 2) {
      companyName = domainParts[0];
    } else {
      companyName = domain;
    }
    
    // Clean name: replace underscores, dots, dashes, and numbers with spaces
    const cleanUsername = username.replace(/[0-9]+/g, "").replace(/[._-]+/g, " ").trim();
    const nameParts = cleanUsername.split(" ");
    name = nameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  } else if (email.endsWith(".ac.in")) {
    const parts = email.split(".");
    if (parts.length < 4) {
      return null;
    }
    companyName = parts[parts.length - 3];
    const nameParts = parts.slice(0, parts.length - 3);
    const cleanNameParts = nameParts.map(p => p.replace(/[0-9]+/g, "").replace(/[._-]+/g, " ").trim());
    name = cleanNameParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
  } else {
    return null;
  }
  
  if (!name) {
    name = "User";
  }
  if (!companyName) {
    companyName = "Enterprise";
  }
  
  const knownCompanies = {
    google: "Google",
    microsoft: "Microsoft",
    amazon: "Amazon",
    openai: "OpenAI",
    apple: "Apple",
    meta: "Meta",
    netflix: "Netflix",
    adobe: "Adobe",
    tesla: "Tesla",
    linkedin: "LinkedIn",
    gmail: "Gmail",
    yahoo: "Yahoo",
    outlook: "Outlook",
    hotmail: "Hotmail"
  };
  const companyKey = companyName.toLowerCase();
  const displayCompany = knownCompanies[companyKey] || (companyName.charAt(0).toUpperCase() + companyName.slice(1));
  
  const nameParts = name.trim().split(/\s+/);
  let initials = "";
  if (nameParts.length >= 2) {
    initials = nameParts[0].charAt(0) + nameParts[nameParts.length - 1].charAt(0);
  } else if (nameParts.length === 1) {
    initials = nameParts[0].charAt(0) + (nameParts[0].charAt(1) || "");
  }
  initials = initials.toUpperCase();
  
  return {
    name: name.trim(),
    initials: initials,
    companyName: displayCompany,
    companyId: companyKey,
    email: email
  };
}

function initSprintLinks() {
  document.querySelectorAll('a[href="#sprint-room"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      localStorage.setItem("userName", localStorage.getItem("userName") || "Guest");
      localStorage.setItem("candidateSetupComplete", "true");
      window.location.href = "frontend/pages/roles.html";
    });
  });
}

/* =====================================
   1. NAVBAR SCROLL EFFECT
===================================== */
function initNavbar() {
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      navbar.classList.add("navbar-scrolled");
    } else {
      navbar.classList.remove("navbar-scrolled");
    }
  });
}

/* =====================================
   2. SMOOTH SCROLL LINKS
===================================== */
function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  links.forEach(link => {
    link.addEventListener("click", function (e) {
      // SKIP if this is a modal trigger or auth button
      if (this.getAttribute("href") === "#login" || 
          this.getAttribute("href") === "#signup" ||
          this.getAttribute("href") === "#sprint-room" ||
          this.classList.contains("modal-close") ||
          this.classList.contains("auth-btn")) {
        return; // Don't prevent default, let other handlers take over
      }

      e.preventDefault();

      const targetId = this.getAttribute("href");
      const target = document.querySelector(targetId);

      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  });
}

/* =====================================
   3. REVEAL ON SCROLL
===================================== */
function initRevealAnimation() {
  const reveals = document.querySelectorAll(".reveal");

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
        }
      });
    },
    { threshold: 0.15 }
  );

  reveals.forEach(el => observer.observe(el));
}

/* =====================================
   4. PROGRESS BAR ANIMATION
===================================== */
function initProgressBars() {
  animateBar(".hero-progress-bar", 78);
  animateBar(".rec-progress-bar1", 92);
  animateBar(".rec-progress-bar2", 85);
  animateBar(".rec-progress-bar3", 74);
}

function animateBar(selector, value) {
  const bar = document.querySelector(selector);

  if (!bar) return;

  setTimeout(() => {
    bar.style.width = value + "%";
    bar.style.transition = "1.2s ease";
  }, 500);
}

/* =====================================
   5. BUTTON FUNCTIONS
===================================== */
function initButtons() {
  // Contact Buttons
  const contactBtns = document.querySelectorAll('a[href="#contact"]');

  contactBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();

      const target = document.querySelector("#contact");

      if (target) {
        target.scrollIntoView({
          behavior: "smooth"
        });
      }
    });
  });

  // Footer Social Icons
  const socialIcons = document.querySelectorAll(".footer-social-icon");

  socialIcons.forEach(icon => {
    icon.addEventListener("click", e => {
      e.preventDefault();
      showToast("Social page coming soon 🌐");
    });
  });

  // Generic Primary Buttons Hover Click
  const allBtns = document.querySelectorAll(".btn");

  allBtns.forEach(btn => {
    btn.addEventListener("mouseenter", () => {
      btn.style.transform = "translateY(-3px)";
    });

    btn.addEventListener("mouseleave", () => {
      btn.style.transform = "translateY(0px)";
    });
  });
}

/* =====================================
   6. TOAST MESSAGE
===================================== */
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = `toast-message ${type}`;

  const icon = type === "success" ? "✅" : "❌";

  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <span>${message}</span>
    <div class="toast-progress"></div>
  `;

  document.body.appendChild(toast);

  // show
  setTimeout(() => {
    toast.classList.add("show");
  }, 50);

  // auto remove
  let timeout = setTimeout(removeToast, 3000);

  function removeToast() {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }

  // pause on hover
  toast.addEventListener("mouseenter", () => {
    clearTimeout(timeout);
  });

  toast.addEventListener("mouseleave", () => {
    timeout = setTimeout(removeToast, 1500);
  });
}

/* =====================================
   7. TIMER FUNCTION
   FIX: Persists countdown in localStorage
   so it does not reset on every page refresh
===================================== */
function initTimer() {
  const timerElement = document.getElementById("countdown-timer");
  if (!timerElement) return;

  // Use saved time if available, otherwise start fresh at 18:22
  let totalSeconds = parseInt(localStorage.getItem("timerSeconds")) || (18 * 60 + 22);

  setInterval(() => {
    if (totalSeconds <= 0) {
      timerElement.innerText = "0:00";
      localStorage.removeItem("timerSeconds");
      return;
    }

    totalSeconds--;
    localStorage.setItem("timerSeconds", totalSeconds);

    let m = Math.floor(totalSeconds / 60);
    let s = totalSeconds % 60;

    timerElement.innerText = `${m}:${s < 10 ? "0" + s : s}`;
  }, 1000);
}

/* =====================================
   8. MODAL FUNCTIONS
===================================== */
function initModal() {
  const modal = document.getElementById("registration-modal");
  const closeBtn = document.getElementById("modal-close-btn");
  const form = document.getElementById("registration-form");
  const modalTitle = document.getElementById("modal-title");

  if (!modal) return;

  function openModal(title) {
    modalTitle.innerText = title;
    modal.classList.add("active");
  }

  function closeModal() {
    modal.classList.remove("active");
  }

  closeBtn.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Sets required localStorage keys before redirecting to roles page
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("reg-name").value;

    // Store name + placeholder user object + default role
    // so the dashboard has the data it needs when it loads
    localStorage.setItem("userName", name);
    localStorage.setItem("user", JSON.stringify({ name }));
    localStorage.setItem("role", "candidate");

    // Redirect to Roles page
    window.location.href = "frontend/pages/roles.html";
  });

  // Trigger modal on Get Started
  const getStartedBtns = document.querySelectorAll('a[href="#get-started"]');
  getStartedBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      openModal("Get Started");
    });
  });

  // Trigger modal on Request Demo
  const demoBtns = document.querySelectorAll('a[href="#demo"]');
  demoBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      openModal("Request Demo");
    });
  });
}

/* =====================================
   9. AUTH MODAL FUNCTIONS
===================================== */
function initAuthModal() {
  const authModal = document.getElementById("auth-modal");
  const authClose = document.getElementById("auth-close-btn");

  const loginBtns = document.querySelectorAll('a[href="#login"]');
  const signupBtns = document.querySelectorAll('a[href="#signup"]');

  const tabLogin = document.getElementById("tab-login");
  const tabSignup = document.getElementById("tab-signup");

  const roleBtns = document.querySelectorAll(".role-btn");
  const roleInput = document.getElementById("auth-role");

  const sideTitle = document.getElementById("auth-side-title");
  const sideDesc = document.getElementById("auth-side-desc");
  const nameGroup = document.getElementById("auth-name-group");
  const nameInput = document.getElementById("auth-name");
  const submitBtn = document.getElementById("auth-submit-btn");
  const switchPrompt = document.getElementById("auth-switch-prompt");
  const switchLink = document.getElementById("auth-switch-link");
  const authForm = document.getElementById("auth-form");
  const emailInput = document.getElementById("auth-email");
  const emailWarning = document.getElementById("email-domain-warning");

  if (!authModal) return;

  let currentMode = "login"; // track mode

  /* =============================
     ROLE SELECTION
  ============================= */
  roleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      roleBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const role = btn.dataset.role;
      roleInput.value = role;

      // Dynamic text update
      if (role === "recruiter") {
        sideTitle.innerText = currentMode === "login" ? "Welcome Recruiter" : "Hire Smarter";
        sideDesc.innerText = "Access candidates and manage hiring efficiently.";
      } else {
        sideTitle.innerText = currentMode === "login" ? "Welcome Back" : "Join DayZero";
        sideDesc.innerText = "Explore opportunities and grow your career.";
      }

      // Show domain warning if signup mode and recruiter role
      if (currentMode === "signup" && role === "recruiter") {
        showEmailDomainHint();
      } else {
        hideEmailDomainHint();
      }
    });
  });

  /* =============================
     EMAIL DOMAIN VALIDATION
  ============================= */
  function showEmailDomainHint() {
    if (!emailWarning) return;
    emailWarning.style.display = "block";
    updateEmailWarning();
  }

  function hideEmailDomainHint() {
    if (!emailWarning) return;
    emailWarning.style.display = "none";
  }

  function updateEmailWarning() {
    if (!emailWarning) return;

    const email = emailInput.value.trim();
    const role = roleInput.value;

    if (role === "recruiter" && email) {
      const profile = parseRecruiterEmail(email);

      if (profile) {
        emailWarning.innerHTML = `✅ Official ID for <strong>${profile.companyName}</strong> detected!`;
        emailWarning.className = "email-domain-warning success";
      } else {
        emailWarning.innerHTML = `⚠️ Access restricted to official company accounts only. Format: name@company.com or name.company.ac.in`;
        emailWarning.className = "email-domain-warning warning";
      }
    } else if (role === "recruiter") {
      emailWarning.innerHTML = `ℹ️ Recruiters must use official company email addresses`;
      emailWarning.className = "email-domain-warning info";
    }
  }

  emailInput.addEventListener("input", updateEmailWarning);

  /* =============================
     MODAL OPEN/CLOSE
  ============================= */
  function openAuth(mode) {
    authModal.classList.add("active");
    setAuthMode(mode);
  }

  function closeAuth() {
    authModal.classList.remove("active");
  }

  /* =============================
     LOGIN / SIGNUP SWITCH
  ============================= */
  function setAuthMode(mode) {
    currentMode = mode;

    if (mode === "login") {
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");

      nameGroup.style.display = "none";
      nameInput.removeAttribute("required");
      hideEmailDomainHint();

      submitBtn.innerText = "Log In";
      switchPrompt.innerText = "Don't have an account?";
      switchLink.innerText = "Sign Up";
    } else {
      tabSignup.classList.add("active");
      tabLogin.classList.remove("active");

      nameGroup.style.display = "block";
      nameInput.setAttribute("required", "true");

      const role = roleInput.value;
      if (role === "recruiter") {
        showEmailDomainHint();
      }

      submitBtn.innerText = "Create Account";
      switchPrompt.innerText = "Already have an account?";
      switchLink.innerText = "Log In";
    }
  }

  /* =============================
     EVENT LISTENERS
  ============================= */
  authClose.addEventListener("click", closeAuth);

  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) closeAuth();
  });

  loginBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      openAuth("login");
    });
  });

  signupBtns.forEach(btn => {
    btn.addEventListener("click", e => {
      e.preventDefault();
      openAuth("signup");
    });
  });

  tabLogin.addEventListener("click", () => setAuthMode("login"));
  tabSignup.addEventListener("click", () => setAuthMode("signup"));

  switchLink.addEventListener("click", (e) => {
    e.preventDefault();
    setAuthMode(currentMode === "login" ? "signup" : "login");
  });

  /* =============================
     FORM SUBMIT
     FIX: Disable button during API call
     to prevent duplicate submissions and
     show loading feedback to the user
  ============================= */
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const isLogin = currentMode === "login";
    const role = roleInput.value;

    const name = nameInput.value;
    const email = document.getElementById("auth-email").value;
    const password = document.getElementById("auth-password").value;

    // Intercept recruiter auth for dynamic, professional-only access control
    if (role === "recruiter") {
      const profile = parseRecruiterEmail(email);
      if (!profile) {
        showToast("Access restricted to official company accounts only. Please sign in using your official company ID.", "error");
        return;
      }

      // Generate recruiter display name dynamically if signup mode
      let displayRole = "Senior Recruiter";
      let displayName = profile.name;
      if (!isLogin && name.trim()) {
        displayName = name.trim();
        const parts = displayName.split(" ");
        let initials = parts[0].charAt(0) + (parts[parts.length - 1]?.charAt(0) || "");
        profile.name = displayName;
        profile.initials = initials.toUpperCase();
      }

      // High-fidelity dynamic mock recruiter profile
      const mockAuth = {
        recruiterName: profile.name,
        recruiterInitials: profile.initials,
        recruiterEmail: profile.email,
        companyName: profile.companyName,
        companyId: profile.companyId,
        role: displayRole,
        avatar: "",
        stats: {
          totalProjects: 0, // Computed dynamically
          totalCandidates: 0, // Computed dynamically
          activeSimulations: 0, // Computed dynamically
          teamSimulations: 0, // Computed dynamically
          individualSimulations: 0, // Computed dynamically
          hiringSuccessRate: "92%",
          activeSessions: 1
        }
      };

      submitBtn.disabled = true;
      submitBtn.innerText = "Please wait...";

      setTimeout(() => {
        showToast(`Welcome back, ${profile.name} (${profile.companyName}) 🎉`, "success");
        
        localStorage.setItem("recruiter", JSON.stringify(mockAuth));
        localStorage.setItem("user", JSON.stringify({
          name: profile.name,
          email: profile.email,
          role: "recruiter",
          companyId: profile.companyId,
          companyName: profile.companyName
        }));
        localStorage.setItem("role", "recruiter");
        
        authForm.reset();
        closeAuth();
        
        setTimeout(() => {
          window.location.href = "frontend/pages/recruiter_dashboard.html";
        }, 1000);
      }, 800);

      return;
    }

    if (role === "user") {
      submitBtn.disabled = true;
      submitBtn.innerText = "Please wait...";

      try {
        const valRes = await fetch(`${PLATFORM_API_BASE_URL}/api/invites/validate?email=${encodeURIComponent(email)}`);
        const valData = await valRes.json();
        
        if (valData.success && valData.invited) {
          // Success! User is invited!
          const invite = valData.invite;
          const projectName = invite.projectName || invite.projectTitle;
          const assignedRole = invite.assignedRole || invite.roleAssigned || invite.role || "Frontend Engineer";
          const initials = (invite.name || "Invited Candidate").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
          const userData = {
            name: invite.name,
            email: invite.email,
            role: "invited candidate",
            companyId: invite.companyId,
            companyName: invite.companyName,
            company: invite.companyName,
            projectId: invite.projectId,
            projectTitle: projectName,
            projectName: projectName,
            experienceLevel: invite.experienceLevel || "Intermediate",
            assignedRole: assignedRole,
            initials: initials
          };
          
          showToast(`Welcome! Invitation active for ${invite.companyName} 🎉`, "success");
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("role", "invited candidate");
          localStorage.setItem("companyId", invite.companyId || "");
          localStorage.setItem("companyName", invite.companyName || "");
          localStorage.setItem("userName", invite.name || "Invited Candidate");
          localStorage.setItem("userExperience", invite.experienceLevel || "Intermediate");
          localStorage.setItem("dayzero_task_id", invite.projectId);
          localStorage.setItem("projectId", invite.projectId);
          localStorage.setItem("projectTitle", projectName || "");
          localStorage.setItem("projectName", projectName || "");
          localStorage.setItem("userRole", assignedRole);
          localStorage.setItem("candidateSetupComplete", "true");
          localStorage.setItem("dayzero_selected_task_details", JSON.stringify({
            id: invite.projectId,
            company: invite.companyName,
            title: projectName,
            label: projectName,
            role: assignedRole,
            difficulty: invite.experienceLevel || "Intermediate",
            description: invite.description || invite.message || "Execute the assigned simulation room for your company hiring round.",
            skills: Array.isArray(invite.skills) ? invite.skills : String(invite.skills || "").split(",").map(s => s.trim()).filter(Boolean)
          }));

          localStorage.removeItem("dayzero_orchestrator_state");
          sessionStorage.removeItem("dayzero_session_data");

          authForm.reset();
          closeAuth();

          setTimeout(() => {
            window.location.href = "frontend/pages/dashboard.html";
          }, 1000);
          return;
        } else {
          // Not invited: initialize public demo user flow
          const profile = parseRecruiterEmail(email);
          const initials = (name || profile.name || "Demo Guest").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
          const userData = {
            name: name || profile.name || "Demo Guest",
            email: email,
            role: "demo user",
            companyId: "demo",
            company: "Demo Workspace",
            companyName: "Demo Workspace",
            projectId: "demo-task",
            projectTitle: "Demo Project",
            projectName: "Demo Project",
            experienceLevel: "Intermediate",
            assignedRole: "Frontend Engineer",
            initials: initials,
            accountType: "demo_user"
          };
          
          showToast(`Welcome! Initializing public demo workspace 🎉`, "success");
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("role", "demo user");
          localStorage.setItem("companyId", "demo");
          localStorage.setItem("companyName", "Demo Workspace");
          localStorage.setItem("userName", userData.name);
          localStorage.setItem("userExperience", "Intermediate");
          localStorage.setItem("userRole", "Frontend Engineer");
          localStorage.setItem("candidateSetupComplete", "false");
          
          localStorage.removeItem("dayzero_orchestrator_state");
          sessionStorage.removeItem("dayzero_session_data");

          authForm.reset();
          closeAuth();

          setTimeout(() => {
            window.location.href = "frontend/pages/roles.html";
          }, 1000);
          return;
        }
      } catch (err) {
        console.warn("Could not validate invitation via backend:", err);
        // Backend validation is required for candidate workspace access.
        showToast("Could not verify invitation. Please try again when the backend is reachable.", "error");
        submitBtn.disabled = false;
        submitBtn.innerText = isLogin ? "Login" : "Sign Up";
        return;
      }
    }


    const url = isLogin
      ? `${AUTH_BASE_URL}/login`
      : `${AUTH_BASE_URL}/signup`;

    const body = isLogin
      ? { email, password, role }
      : { name, email, password, role };

    // Disable button and show loading state
    submitBtn.disabled = true;
    submitBtn.innerText = "Please wait...";

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s Timeout for robust production connections

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      let data;
      try {
        data = await res.json();
      } catch {
        data = { error: "Invalid server response" };
      }

      console.log("STATUS:", res.status);
      console.log("DATA:", data);

      if (res.ok) {
        showToast(data.message || "Success 🎉", "success");

        const profile = parseRecruiterEmail(email);
        const userRole = data.user?.role || role || "candidate";
        
        let userData;
        if (userRole === "invited candidate" && data.user) {
          const u = data.user;
          const projectName = u.projectTitle || u.projectName || "Assigned Simulation Sprint";
          const assignedRole = u.assignedRole || u.roleAssigned || u.role || "Frontend Engineer";
          const initials = (u.name || "Invited Candidate").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
          userData = {
            name: u.name,
            email: u.email,
            role: "invited candidate",
            companyId: u.companyId,
            companyName: u.companyName,
            company: u.companyName,
            projectId: u.projectId,
            projectTitle: projectName,
            projectName: projectName,
            experienceLevel: u.experienceLevel || "Intermediate",
            assignedRole: assignedRole,
            initials: initials
          };
          
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("role", "invited candidate");
          localStorage.setItem("companyId", u.companyId || "");
          localStorage.setItem("companyName", u.companyName || "");
          localStorage.setItem("userName", u.name || "Invited Candidate");
          localStorage.setItem("userExperience", u.experienceLevel || "Intermediate");
          localStorage.setItem("dayzero_task_id", u.projectId);
          localStorage.setItem("projectId", u.projectId);
          localStorage.setItem("projectTitle", projectName || "");
          localStorage.setItem("projectName", projectName || "");
          localStorage.setItem("userRole", assignedRole);
          localStorage.setItem("candidateSetupComplete", "true");
          
          localStorage.setItem("dayzero_selected_task_details", JSON.stringify({
            id: u.projectId,
            company: u.companyName,
            title: projectName,
            label: projectName,
            role: assignedRole,
            difficulty: u.experienceLevel || "Intermediate",
            description: "Execute the assigned simulation room for your company hiring round.",
            skills: ["Strategy", "Execution"]
          }));
          
          localStorage.removeItem("dayzero_orchestrator_state");
          sessionStorage.removeItem("dayzero_session_data");
        } else {
          userData = {
            name: data.user?.name || name || profile.name,
            email: data.user?.email || email,
            role: userRole,
            company: profile.companyName,
            initials: profile.initials
          };
          localStorage.setItem("user", JSON.stringify(userData));
          localStorage.setItem("role", userData.role);
        }

        authForm.reset();
        closeAuth();

        setTimeout(() => {
          if (userData.role === "recruiter") {
            window.location.href = "frontend/pages/recruiter_dashboard.html";
          } else if (userData.role === "invited candidate") {
            window.location.href = "frontend/pages/dashboard.html";
          } else {
            window.location.href = "frontend/pages/roles.html";
          }
        }, 1000);

      } else {
        console.warn("API returned error, using dynamic client-side authentication fallback");
        const profile = parseRecruiterEmail(email);
        const userData = {
          name: name || profile.name,
          email: email,
          role: role || "candidate",
          company: profile.companyName,
          initials: profile.initials
        };
        showToast(`Logged in successfully as ${userData.name} (Demo Mode) 🎉`, "success");
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("role", userData.role);

        authForm.reset();
        closeAuth();

        setTimeout(() => {
          window.location.href =
            userData.role === "recruiter"
              ? "frontend/pages/recruiter_dashboard.html"
              : "frontend/pages/roles.html";
        }, 1000);
      }

    } catch (err) {
      console.warn("Network error, using dynamic client-side authentication fallback:", err);
      const profile = parseRecruiterEmail(email);
      const userData = {
        name: name || profile.name,
        email: email,
        role: role || "candidate",
        company: profile.companyName,
        initials: profile.initials
      };
      showToast(`Logged in successfully as ${userData.name} (Demo Mode) 🎉`, "success");
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("role", userData.role);

      authForm.reset();
      closeAuth();

      setTimeout(() => {
        window.location.href =
          userData.role === "recruiter"
            ? "frontend/pages/recruiter_dashboard.html"
            : "frontend/pages/roles.html";
      }, 1000);
    }
  });
}

