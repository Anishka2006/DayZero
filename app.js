// app.js
// DayZero Full Interaction Script
// Buttons + Scroll + Navbar + Reveal + Progress Bars

document.addEventListener("DOMContentLoaded", () => {
  initNavbar();
  initSmoothScroll();
  initRevealAnimation();
  initProgressBars();
  initButtons();
  initTimer();
  initModal();
  initAuthModal();
});

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

  // Contact Buttons
  const contactBtns = document.querySelectorAll(
    'a[href="#contact"]'
  );

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
===================================== */
function initTimer() {
  const timerElement = document.getElementById("countdown-timer");
  if (!timerElement) return;

  let totalSeconds = 18 * 60 + 22; // 18:22

  setInterval(() => {
    if (totalSeconds <= 0) return;
    totalSeconds--;
    
    let m = Math.floor(totalSeconds / 60);
    let s = totalSeconds % 60;
    
    timerElement.innerText = `${m}:${s < 10 ? '0' + s : s}`;
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

 form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("reg-name").value;
  const phone = document.getElementById("reg-phone").value;

  try {
    const res = await fetch("https://dayzero-1.onrender.com/request-demo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, phone })
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Demo request sent! ");
      form.reset();
      closeModal();
    } else {
     showToast(data.error || "Failed ❌", "error");
    }

  } catch (err) {
    showToast("Server error ⚠️");
  }
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
  
  const sideTitle = document.getElementById("auth-side-title");
  const sideDesc = document.getElementById("auth-side-desc");
  const nameGroup = document.getElementById("auth-name-group");
  const nameInput = document.getElementById("auth-name");
  const submitBtn = document.getElementById("auth-submit-btn");
  const switchPrompt = document.getElementById("auth-switch-prompt");
  const switchLink = document.getElementById("auth-switch-link");
  const authForm = document.getElementById("auth-form");

  if (!authModal) return;

  function openAuth(mode) {
    authModal.classList.add("active");
    setAuthMode(mode);
  }

  function closeAuth() {
    authModal.classList.remove("active");
  }

  function setAuthMode(mode) {
    if (mode === "login") {
      tabLogin.classList.add("active");
      tabSignup.classList.remove("active");
      sideTitle.innerText = "Welcome Back";
      sideDesc.innerText = "Sign in to access your dashboard and continue where you left off.";
      nameGroup.style.display = "none";
      nameInput.removeAttribute("required");
      submitBtn.innerText = "Log In";
      switchPrompt.innerText = "Don't have an account?";
      switchLink.innerText = "Sign Up";
    } else {
      tabSignup.classList.add("active");
      tabLogin.classList.remove("active");
      sideTitle.innerText = "Join DayZero";
      sideDesc.innerText = "Create an account to start experiencing skill-based hiring.";
      nameGroup.style.display = "block";
      nameInput.setAttribute("required", "true");
      submitBtn.innerText = "Create Account";
      switchPrompt.innerText = "Already have an account?";
      switchLink.innerText = "Log In";
    }
  }

  authClose.addEventListener("click", closeAuth);
  authModal.addEventListener("click", (e) => {
    if (e.target === authModal) closeAuth();
  });

  loginBtns.forEach(btn => {
    btn.addEventListener("click", e => { e.preventDefault(); openAuth("login"); });
  });

  signupBtns.forEach(btn => {
    btn.addEventListener("click", e => { e.preventDefault(); openAuth("signup"); });
  });

  tabLogin.addEventListener("click", () => setAuthMode("login"));
  tabSignup.addEventListener("click", () => setAuthMode("signup"));

  switchLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (tabLogin.classList.contains("active")) setAuthMode("signup");
    else setAuthMode("login");
  });

  authForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const isLogin = tabLogin.classList.contains("active");

  const name = document.getElementById("auth-name").value;
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;

  const url = isLogin
    ? "https://dayzero-1.onrender.com/login"
    : "https://dayzero-1.onrender.com/signup";

  const body = isLogin
    ? { email, password }
    : { name, email, password };

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
  showToast(data.message || "Success ", "success");

  localStorage.setItem("user", JSON.stringify(data.user));

  authForm.reset();
  closeAuth();

  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1000);

} else {
  showToast(data.error || "Something went wrong ❌", "error");
}

    

  } catch (err) {
    showToast("An error occurred. Please try again.", "error");
  }
});
}

function selectRole(role) {
    // 1. Save the role in the browser's memory
    localStorage.setItem('userRole', role);
    
    // 2. Alert the user (optional)
    alert("Role selected: " + role + ". Initializing your manager...");
    
    // 3. Send them to the dashboard
    window.location.href = "dashboard.html";
}

function finishSimulation() {
    const finalScore = 88; // This would come from your AI evaluation
    localStorage.setItem('lastScore', finalScore);
    window.location.href = 'results.html';
}
