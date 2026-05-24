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

const AUTH_BASE_URL = "https://madauth.onrender.com";

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

    const email = emailInput.value.trim().toLowerCase();
    const role = roleInput.value;

    if (role === "recruiter" && email) {
      const domain = getEmailDomain(email);
      const isApproved = isApprovedRecruiterDomain(email);

      if (isApproved) {
        emailWarning.innerHTML = `✅ Domain <strong>${domain}</strong> is approved for recruiters`;
        emailWarning.className = "email-domain-warning success";
      } else {
        emailWarning.innerHTML = `⚠️ Domain <strong>${domain}</strong> is not approved. Recruiters must use official company emails (@google, @microsoft, etc.)`;
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

    // Validate recruiter email domain on frontend before submission
    if (!isLogin && role === "recruiter") {
      if (!isApprovedRecruiterDomain(email)) {
        showToast("Please use an approved company email domain to register as a recruiter.", "error");
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

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });

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

        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user?.role || role);

        authForm.reset();
        closeAuth();

        setTimeout(() => {
          window.location.href =
            (data.user?.role || role) === "recruiter"
              ? "frontend/pages/recruiter_dashboard.html"
              : "frontend/pages/roles.html";
        }, 1000);

      } else {
        showToast(data.error || "Something went wrong ❌", "error");

        // Re-enable button on failure so user can try again
        submitBtn.disabled = false;
        submitBtn.innerText = isLogin ? "Log In" : "Create Account";
      }

    } catch (err) {
      showToast("Network error. Please try again.", "error");

      // Re-enable button on network error
      submitBtn.disabled = false;
      submitBtn.innerText = isLogin ? "Log In" : "Create Account";
    }
  });
}
