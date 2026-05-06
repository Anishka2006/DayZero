/* ==========================================================================
   DayZero Recruiter OS — recruiter-dashboard.js
   Covers every interactive feature of recruiter-dashboard.html:
     • Role guard (localStorage)
     • Candidate data & state management
     • Table render, search, sort, status filter, tab switching
     • Candidate detail side panel with skill bars & decisions
     • Skill heatmap render
     • Score distribution bar chart
     • Live activity feed + real-time polling simulation
     • Invite modal (open / close / submit with validation)
     • Export report (PDF print + CSV download)
     • Sidebar navigation active states
     • Toast notification system (queue support)
     • Keyboard shortcuts
     • Stat card live counters (shortlist count, avg score)
     • Candidate decision actions (shortlist / interview / reject)
       with persistent state across re-renders
     • "Last Active" relative time auto-refresh
     • Score bar entrance animation on first render
   ========================================================================== */

   (function () {
    "use strict";
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 1 — ROLE GUARD
       Redirects non-recruiters away immediately (mirrors the inline <script>).
    ───────────────────────────────────────────────────────────────────────── */
    function enforceRoleGuard() {
      var role = localStorage.getItem("role");
      if (role !== "recruiter") {
        window.location.href = "dashboard.html";
      }
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 2 — CANDIDATE DATA STORE
    ───────────────────────────────────────────────────────────────────────── */
  
    var CANDIDATES = [
      {
        id: 1, name: "Richa Yadav", initials: "RY", college: "AIT, Pune",
        score: 95, progress: 82, topSkill: "Prioritization",
        status: "shortlisted", joinedMs: Date.now() - 2 * 60 * 1000,
        skills: { Leadership: 91, Communication: 84, Execution: 79, ProblemSolving: 88, Adaptability: 95 }
      },
      {
        id: 2, name: "Arjun Sharma", initials: "AS", college: "IIT Delhi",
        score: 89, progress: 71, topSkill: "Execution",
        status: "on-track", joinedMs: Date.now() - 8 * 60 * 1000,
        skills: { Leadership: 78, Communication: 80, Execution: 91, ProblemSolving: 82, Adaptability: 85 }
      },
      {
        id: 3, name: "Priya Mehta", initials: "PM", college: "BITS Pilani",
        score: 86, progress: 68, topSkill: "Leadership",
        status: "shortlisted", joinedMs: Date.now() - 15 * 60 * 1000,
        skills: { Leadership: 92, Communication: 88, Execution: 73, ProblemSolving: 79, Adaptability: 80 }
      },
      {
        id: 4, name: "Kiran Patel", initials: "KP", college: "NIT Trichy",
        score: 84, progress: 60, topSkill: "Communication",
        status: "on-track", joinedMs: Date.now() - 22 * 60 * 1000,
        skills: { Leadership: 70, Communication: 90, Execution: 77, ProblemSolving: 81, Adaptability: 74 }
      },
      {
        id: 5, name: "Aditya Rao", initials: "AR", college: "VIT Vellore",
        score: 80, progress: 55, topSkill: "Problem Solving",
        status: "on-track", joinedMs: Date.now() - 30 * 60 * 1000,
        skills: { Leadership: 72, Communication: 75, Execution: 80, ProblemSolving: 87, Adaptability: 78 }
      },
      {
        id: 6, name: "Sneha Joshi", initials: "SJ", college: "DTU Delhi",
        score: 78, progress: 50, topSkill: "Adaptability",
        status: "on-track", joinedMs: Date.now() - 60 * 60 * 1000,
        skills: { Leadership: 68, Communication: 76, Execution: 74, ProblemSolving: 72, Adaptability: 85 }
      },
      {
        id: 7, name: "Rohit Nair", initials: "RN", college: "NSIT Delhi",
        score: 74, progress: 44, topSkill: "Execution",
        status: "at-risk", joinedMs: Date.now() - 2 * 60 * 60 * 1000,
        skills: { Leadership: 60, Communication: 68, Execution: 80, ProblemSolving: 65, Adaptability: 70 }
      },
      {
        id: 8, name: "Meera Iyer", initials: "MI", college: "SPIT Mumbai",
        score: 72, progress: 40, topSkill: "Communication",
        status: "on-track", joinedMs: Date.now() - 2 * 60 * 60 * 1000,
        skills: { Leadership: 65, Communication: 79, Execution: 68, ProblemSolving: 70, Adaptability: 74 }
      },
      {
        id: 9, name: "Vivek Kumar", initials: "VK", college: "RVCE Bangalore",
        score: 69, progress: 38, topSkill: "Leadership",
        status: "at-risk", joinedMs: Date.now() - 3 * 60 * 60 * 1000,
        skills: { Leadership: 74, Communication: 60, Execution: 65, ProblemSolving: 62, Adaptability: 69 }
      },
      {
        id: 10, name: "Pooja Gupta", initials: "PG", college: "Thapar Patiala",
        score: 91, progress: 74, topSkill: "Strategy",
        status: "shortlisted", joinedMs: Date.now() - 5 * 60 * 1000,
        skills: { Leadership: 85, Communication: 88, Execution: 82, ProblemSolving: 90, Adaptability: 88 }
      },
      {
        id: 11, name: "Sameer Khan", initials: "SK", college: "COEP Pune",
        score: 76, progress: 52, topSkill: "Problem Solving",
        status: "on-track", joinedMs: Date.now() - 45 * 60 * 1000,
        skills: { Leadership: 71, Communication: 73, Execution: 74, ProblemSolving: 83, Adaptability: 75 }
      },
      {
        id: 12, name: "Ananya Reddy", initials: "AR", college: "IIIT Hyderabad",
        score: 83, progress: 63, topSkill: "Adaptability",
        status: "on-track", joinedMs: Date.now() - 20 * 60 * 1000,
        skills: { Leadership: 76, Communication: 80, Execution: 79, ProblemSolving: 81, Adaptability: 86 }
      },
      {
        id: 13, name: "Dev Malhotra", initials: "DM", college: "IIT Bombay",
        score: 66, progress: 35, topSkill: "Communication",
        status: "at-risk", joinedMs: Date.now() - 4 * 60 * 60 * 1000,
        skills: { Leadership: 58, Communication: 72, Execution: 60, ProblemSolving: 64, Adaptability: 62 }
      },
      {
        id: 14, name: "Tanvi Singh", initials: "TS", college: "Manipal University",
        score: 79, progress: 56, topSkill: "Leadership",
        status: "on-track", joinedMs: Date.now() - 60 * 60 * 1000,
        skills: { Leadership: 80, Communication: 74, Execution: 75, ProblemSolving: 76, Adaptability: 77 }
      }
    ];
  
    /* Decisions made this session: { [candidateId]: "shortlisted"|"rejected"|"interview" } */
    var sessionDecisions = {};
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 3 — STATIC CONFIG & HELPERS
    ───────────────────────────────────────────────────────────────────────── */
  
    var AVATAR_COLORS = [
      { bg: "#eef2ff", color: "#4338ca" },
      { bg: "#eff6ff", color: "#1d4ed8" },
      { bg: "#ecfdf5", color: "#065f46" },
      { bg: "#fffbeb", color: "#92400e" },
      { bg: "#fdf4ff", color: "#7e22ce" },
      { bg: "#fef2f2", color: "#991b1b" }
    ];
  
    var SKILL_CONFIG = [
      { label: "Leadership",     avg: 74, color: "#6366f1" },
      { label: "Communication",  avg: 78, color: "#3b82f6" },
      { label: "Execution",      avg: 76, color: "#10b981" },
      { label: "Problem Solving",avg: 79, color: "#f59e0b" },
      { label: "Adaptability",   avg: 79, color: "#8b5cf6" },
      { label: "Prioritization", avg: 81, color: "#ef4444" }
    ];
  
    var ACTIVITY_SEED = [
      { icon: "zap",          color: "#6366f1", bg: "#eef2ff", text: "<strong>Richa Yadav</strong> submitted Crisis Response task",     time: "2m ago" },
      { icon: "trending-up",  color: "#10b981", bg: "#ecfdf5", text: "<strong>Pooja Gupta</strong> score jumped to 91 (+7)",             time: "5m ago" },
      { icon: "alert-circle", color: "#f59e0b", bg: "#fffbeb", text: "<strong>Dev Malhotra</strong> flagged as at-risk (66/100)",        time: "12m ago" },
      { icon: "message-square", color: "#3b82f6", bg: "#eff6ff", text: "<strong>Kiran Patel</strong> left a comment in Team Chat",       time: "22m ago" },
      { icon: "star",         color: "#8b5cf6", bg: "#fdf4ff", text: "<strong>Arjun Sharma</strong> unlocked Fast Thinker badge",        time: "35m ago" },
      { icon: "check-circle", color: "#10b981", bg: "#ecfdf5", text: "<strong>Priya Mehta</strong> completed Day 2 milestone",           time: "41m ago" }
    ];
  
    var LIVE_ACTIVITY_POOL = [
      { icon: "zap",          color: "#6366f1", bg: "#eef2ff", text: "<strong>Tanvi Singh</strong> completed a strategy task" },
      { icon: "trending-up",  color: "#10b981", bg: "#ecfdf5", text: "<strong>Sameer Khan</strong> score updated to 78 (+2)" },
      { icon: "message-square", color: "#3b82f6", bg: "#eff6ff", text: "<strong>Ananya Reddy</strong> asked Nova a hint question" },
      { icon: "award",        color: "#8b5cf6", bg: "#fdf4ff", text: "<strong>Aditya Rao</strong> earned Crisis Solver badge" },
      { icon: "check-circle", color: "#10b981", bg: "#ecfdf5", text: "<strong>Sneha Joshi</strong> passed Skill Authentication" },
      { icon: "alert-triangle", color: "#f59e0b", bg: "#fffbeb", text: "<strong>Vivek Kumar</strong> has not logged in for 3h" },
      { icon: "user-check",   color: "#6366f1", bg: "#eef2ff", text: "<strong>Meera Iyer</strong> joined the Team Collaboration room" },
      { icon: "clock",        color: "#3b82f6", bg: "#eff6ff", text: "<strong>Rohit Nair</strong> is 2 tasks behind cohort average" }
    ];
  
    /* ── helpers ── */
    function avatarColorFor(index) {
      return AVATAR_COLORS[index % AVATAR_COLORS.length];
    }
  
    function scoreColor(v) {
      if (v >= 85) return "#10b981";
      if (v >= 70) return "#6366f1";
      return "#f59e0b";
    }
  
    function statusBadgeHTML(s) {
      if (s === "shortlisted") return '<span class="badge indigo dot-badge">Shortlisted</span>';
      if (s === "at-risk")     return '<span class="badge amber dot-badge">At Risk</span>';
      return '<span class="badge green dot-badge">On Track</span>';
    }
  
    function relativeTime(ms) {
      var diff = Date.now() - ms;
      var mins  = Math.floor(diff / 60000);
      var hours = Math.floor(diff / 3600000);
      if (mins < 1)   return "just now";
      if (mins < 60)  return mins + "m ago";
      if (hours < 24) return hours + "h ago";
      return Math.floor(hours / 24) + "d ago";
    }
  
    function calcAvgScore() {
      var total = CANDIDATES.reduce(function (s, c) { return s + c.score; }, 0);
      return Math.round(total / CANDIDATES.length);
    }
  
    function countByStatus(status) {
      return CANDIDATES.filter(function (c) { return c.status === status; }).length;
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 4 — TOAST SYSTEM  (queue, icon variants)
    ───────────────────────────────────────────────────────────────────────── */
  
    var _toastQueue   = [];
    var _toastBusy    = false;
    var _toastTimerId = null;
  
    /* type: "default" | "success" | "error" | "warning" */
    function showToast(msg, type, duration) {
      _toastQueue.push({ msg: msg, type: type || "default", duration: duration || 2500 });
      if (!_toastBusy) _processToastQueue();
    }
  
    function _processToastQueue() {
      if (!_toastQueue.length) { _toastBusy = false; return; }
      _toastBusy = true;
      var item  = _toastQueue.shift();
      var toast = document.getElementById("toast");
      if (!toast) { _toastBusy = false; return; }
  
      var iconMap = { success: "✓ ", error: "✕ ", warning: "⚠ ", default: "" };
      toast.textContent = (iconMap[item.type] || "") + item.msg;
  
      var bgMap = { success: "#065f46", error: "#991b1b", warning: "#92400e", default: "#0f172a" };
      toast.style.background = bgMap[item.type] || bgMap.default;
      toast.style.display = "block";
      toast.style.opacity = "1";
  
      clearTimeout(_toastTimerId);
      _toastTimerId = setTimeout(function () {
        toast.style.opacity = "0";
        setTimeout(function () {
          toast.style.display = "none";
          toast.style.opacity = "1";
          _toastBusy = false;
          _processToastQueue();
        }, 200);
      }, item.duration);
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 5 — STAT CARDS  (live counter update)
    ───────────────────────────────────────────────────────────────────────── */
  
    function updateStatCards() {
      /* Total participants */
      var totalEl = document.querySelector(".stats-row .stat-card:nth-child(1) .stat-value");
      if (totalEl) totalEl.textContent = CANDIDATES.length;
  
      /* Avg score */
      var avgEl = document.querySelector(".stats-row .stat-card:nth-child(2) .stat-value");
      if (avgEl) avgEl.textContent = calcAvgScore();
  
      /* Shortlisted count */
      var slEl = document.querySelector(".stats-row .stat-card:nth-child(4) .stat-value");
      if (slEl) slEl.textContent = countByStatus("shortlisted");
  
      /* Nav badge for shortlist */
      var slNavBadge = document.querySelector('.nav-item:has(i[data-lucide="star"]) .nav-badge');
      if (slNavBadge) slNavBadge.textContent = countByStatus("shortlisted");
  
      /* Nav badge for candidates */
      var candNavBadge = document.querySelector('.nav-item:has(i[data-lucide="users"]) .nav-badge');
      if (candNavBadge) candNavBadge.textContent = CANDIDATES.length;
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 6 — TABLE RENDER  (search / sort / filter / tab)
    ───────────────────────────────────────────────────────────────────────── */
  
    var _activeTab    = "all";
    var _selectedId   = null;
    var _firstRender  = true;
  
    function getFilteredData() {
      var search  = (document.getElementById("searchInput")  || {}).value || "";
      var sortBy  = (document.getElementById("sortSelect")   || {}).value || "score";
      var statusF = (document.getElementById("statusFilter") || {}).value || "";
  
      var data = CANDIDATES.slice(); // shallow copy
  
      /* Tab filter */
      if (_activeTab === "shortlist") data = data.filter(function (c) { return c.status === "shortlisted"; });
      if (_activeTab === "review")    data = data.filter(function (c) { return c.status === "at-risk"; });
  
      /* Status dropdown filter */
      if (statusF) data = data.filter(function (c) { return c.status === statusF; });
  
      /* Text search across name, college, topSkill */
      if (search.trim()) {
        var q = search.toLowerCase();
        data = data.filter(function (c) {
          return c.name.toLowerCase().includes(q) ||
                 c.college.toLowerCase().includes(q) ||
                 c.topSkill.toLowerCase().includes(q);
        });
      }
  
      /* Sort */
      if (sortBy === "score")    data.sort(function (a, b) { return b.score - a.score; });
      if (sortBy === "name")     data.sort(function (a, b) { return a.name.localeCompare(b.name); });
      if (sortBy === "progress") data.sort(function (a, b) { return b.progress - a.progress; });
  
      return data;
    }
  
    function renderTable() {
      var body = document.getElementById("candBody");
      if (!body) return;
  
      var data = getFilteredData();
  
      if (!data.length) {
        body.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:32px;color:var(--hint);font-size:13px;">No candidates match your filters.</td></tr>';
        if (window.lucide) lucide.createIcons();
        return;
      }
  
      body.innerHTML = data.map(function (c, i) {
        var ac  = avatarColorFor(i);
        var sc  = scoreColor(c.score);
        var sel = (_selectedId === c.id) ? "selected" : "";
        /* Score bar starts at 0 on first render, animates to real value */
        var barW = _firstRender ? "0%" : c.score + "%";
        var progBarW = _firstRender ? "0%" : c.progress + "%";
  
        /* Decision override badge */
        var dec = sessionDecisions[c.id];
        var statusHTML = dec === "rejected"
          ? '<span class="badge red dot-badge">Rejected</span>'
          : dec === "shortlisted"
            ? '<span class="badge indigo dot-badge">Shortlisted</span>'
            : dec === "interview"
              ? '<span class="badge blue dot-badge">Interview</span>'
              : statusBadgeHTML(c.status);
  
        return '<tr class="cand-row ' + sel + '" data-id="' + c.id + '" style="cursor:pointer;">' +
          '<td><div class="cand-info">' +
            '<div class="cand-avatar" style="background:' + ac.bg + ';color:' + ac.color + ';">' + c.initials + '</div>' +
            '<div><div class="cand-name">' + c.name + '</div><div class="cand-college">' + c.college + '</div></div>' +
          '</div></td>' +
          '<td><div class="score-bar-wrap">' +
            '<div class="score-bar-track"><div class="score-bar-fill" data-target="' + c.score + '" style="width:' + barW + ';background:' + sc + ';transition:width 0.6s ease;"></div></div>' +
            '<span class="score-num" style="color:' + sc + ';">' + c.score + '</span>' +
          '</div></td>' +
          '<td><div class="score-bar-wrap">' +
            '<div class="score-bar-track"><div class="score-bar-fill" data-target="' + c.progress + '" style="width:' + progBarW + ';background:#6366f1;transition:width 0.6s ease;"></div></div>' +
            '<span class="score-num" style="color:var(--subtext);">' + c.progress + '%</span>' +
          '</div></td>' +
          '<td><span class="badge blue">' + c.topSkill + '</span></td>' +
          '<td>' + statusHTML + '</td>' +
          '<td class="last-active-cell" data-joined="' + c.joinedMs + '" style="color:var(--subtext);font-size:12px;">' + relativeTime(c.joinedMs) + '</td>' +
          '<td><div class="action-btn-group">' +
            '<button class="action-btn invite js-interview-btn" data-id="' + c.id + '">' +
              '<i data-lucide="calendar" style="width:12px;height:12px;"></i> Interview' +
            '</button>' +
            '<button class="action-btn js-view-btn" data-id="' + c.id + '">' +
              '<i data-lucide="eye" style="width:12px;height:12px;"></i>' +
            '</button>' +
          '</div></td>' +
        '</tr>';
      }).join("");
  
      /* Animate bars on first render */
      if (_firstRender) {
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            body.querySelectorAll(".score-bar-fill[data-target]").forEach(function (el) {
              el.style.width = el.getAttribute("data-target") + "%";
            });
          });
        });
        _firstRender = false;
      }
  
      bindTableEvents();
      if (window.lucide) lucide.createIcons();
    }
  
    /* Delegate row & button clicks from tbody */
    function bindTableEvents() {
      var body = document.getElementById("candBody");
      if (!body || body._bound) return;
      body._bound = true;
  
      body.addEventListener("click", function (e) {
        /* Interview button */
        var intBtn = e.target.closest(".js-interview-btn");
        if (intBtn) {
          e.stopPropagation();
          var id = parseInt(intBtn.dataset.id, 10);
          scheduleInterview(id);
          return;
        }
        /* Eye / view button */
        var viewBtn = e.target.closest(".js-view-btn");
        if (viewBtn) {
          e.stopPropagation();
          selectCandidate(parseInt(viewBtn.dataset.id, 10));
          return;
        }
        /* Row click */
        var row = e.target.closest(".cand-row");
        if (row) selectCandidate(parseInt(row.dataset.id, 10));
      });
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 7 — TAB SWITCHING
    ───────────────────────────────────────────────────────────────────────── */
  
    window.setTab = function (el, tab) {
      document.querySelectorAll(".tab").forEach(function (t) { t.classList.remove("active"); });
      el.classList.add("active");
      _activeTab = tab;
      renderTable();
    };
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 8 — SEARCH & FILTER  (exposed as global for inline oninput)
    ───────────────────────────────────────────────────────────────────────── */
  
    window.filterTable = function () { renderTable(); };
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 9 — CANDIDATE DETAIL SIDE PANEL
    ───────────────────────────────────────────────────────────────────────── */
  
    function selectCandidate(id) {
      _selectedId = id;
      var c = CANDIDATES.find(function (x) { return x.id === id; });
      if (!c) return;
  
      renderTable(); /* re-render to highlight selected row */
  
      var ac = avatarColorFor(id % AVATAR_COLORS.length);
      var MILESTONES = [
        "Completed Day 1 Onboarding",
        "Submitted Strategy Task",
        "Passed Skill Authentication",
        "Joined Team Collaboration"
      ];
      var doneCount = c.progress > 70 ? 4 : c.progress > 50 ? 3 : c.progress > 35 ? 2 : 1;
      var completedMs = MILESTONES.slice(0, doneCount);
      var pendingMs   = MILESTONES.slice(doneCount);
  
      var strengthNote = c.topSkill + " is a standout competency. Decision-making under pressure ranks above cohort average.";
      var watchNote    = c.score < 75
        ? "Low overall score — may benefit from a quick coaching nudge before Day 3."
        : "Solid performer. Monitor consistency through Day 3 crisis phase.";
  
      /* Decision state from this session */
      var dec = sessionDecisions[c.id];
      var decBanner = "";
      if (dec === "shortlisted") decBanner = '<div style="background:#ecfdf5;color:#065f46;border:1px solid #a7f3d0;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;margin-bottom:14px;text-align:center;">✓ Shortlisted this session</div>';
      if (dec === "rejected")    decBanner = '<div style="background:#fef2f2;color:#991b1b;border:1px solid #fecaca;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;margin-bottom:14px;text-align:center;">✕ Passed / Rejected</div>';
      if (dec === "interview")   decBanner = '<div style="background:#eef2ff;color:#4338ca;border:1px solid #c7d2fe;border-radius:8px;padding:8px 12px;font-size:12px;font-weight:700;margin-bottom:14px;text-align:center;">📅 Interview Scheduled</div>';
  
      var spSubEl = document.getElementById("spSub");
      if (spSubEl) spSubEl.textContent = c.name + " · " + c.college;
  
      var spBody = document.getElementById("spBody");
      if (!spBody) return;
  
      spBody.innerHTML =
        /* Avatar & identity */
        '<div class="candidate-card-detail">' +
          '<div class="sp-avatar" style="background:' + ac.bg + ';color:' + ac.color + ';">' + c.initials + '</div>' +
          '<div class="sp-name">' + c.name + '</div>' +
          '<div class="sp-role">' + c.college + '</div>' +
          '<div class="sp-badges">' + statusBadgeHTML(c.status) + '<span class="badge blue">' + c.topSkill + '</span></div>' +
        '</div>' +
  
        decBanner +
  
        /* Score + progress mini cards */
        '<div style="display:flex;gap:10px;margin-bottom:16px;">' +
          '<div style="flex:1;text-align:center;background:var(--surface2);border-radius:10px;padding:12px;">' +
            '<div style="font-size:22px;font-weight:800;color:' + scoreColor(c.score) + ';">' + c.score + '</div>' +
            '<div style="font-size:11px;color:var(--subtext);">Overall Score</div>' +
          '</div>' +
          '<div style="flex:1;text-align:center;background:var(--surface2);border-radius:10px;padding:12px;">' +
            '<div style="font-size:22px;font-weight:800;color:var(--indigo);">' + c.progress + '%</div>' +
            '<div style="font-size:11px;color:var(--subtext);">Sprint Progress</div>' +
          '</div>' +
        '</div>' +
  
        /* Core skills */
        '<div class="section-head">Core Skills</div>' +
        '<div class="skill-list" id="spSkillList">' +
          Object.entries(c.skills).map(function (entry) {
            var sk = entry[0], val = entry[1];
            return '<div class="sk-row">' +
              '<div class="sk-label">' + sk + '</div>' +
              '<div class="sk-bar-w"><div class="sk-bar-f" data-target="' + val + '" style="width:0%;background:' + scoreColor(val) + ';transition:width 0.5s ease;"></div></div>' +
              '<div class="sk-val" style="color:' + scoreColor(val) + ';">' + val + '</div>' +
            '</div>';
          }).join("") +
        '</div>' +
  
        /* AI Insights */
        '<div class="section-head" style="margin-top:14px;">AI Insight</div>' +
        '<div class="insight-box"><p><strong>Strengths:</strong> ' + strengthNote + '</p></div>' +
        '<div class="insight-box"><p><strong>Watch:</strong> ' + watchNote + '</p></div>' +
  
        /* Milestones */
        '<div class="section-head" style="margin-top:14px;">Milestones</div>' +
        '<div class="milestone-list">' +
          completedMs.map(function (m) {
            return '<div class="milestone"><i data-lucide="check-circle" style="width:14px;height:14px;color:var(--green);"></i><span style="font-size:12px;color:var(--text);">' + m + '</span></div>';
          }).join("") +
          pendingMs.map(function (m) {
            return '<div class="milestone"><i data-lucide="circle" style="width:14px;height:14px;color:var(--hint);"></i><span style="font-size:12px;color:var(--hint);">' + m + '</span></div>';
          }).join("") +
        '</div>' +
  
        /* Decision buttons */
        '<div class="decision-btn-row" style="margin-top:18px;">' +
          '<button class="dec-btn shortlist" id="spShortlistBtn" data-id="' + c.id + '">' +
            '<i data-lucide="star" style="width:13px;height:13px;display:inline;vertical-align:-2px;margin-right:4px;"></i>Shortlist' +
          '</button>' +
          '<button class="dec-btn interview" id="spInterviewBtn" data-id="' + c.id + '">' +
            '<i data-lucide="calendar" style="width:13px;height:13px;display:inline;vertical-align:-2px;margin-right:4px;"></i>Interview' +
          '</button>' +
        '</div>' +
        '<button class="dec-btn reject" id="spRejectBtn" data-id="' + c.id + '" style="width:100%;margin-top:8px;">' +
          '<i data-lucide="x" style="width:13px;height:13px;display:inline;vertical-align:-2px;margin-right:4px;"></i>Pass / Reject' +
        '</button>';
  
      /* Animate skill bars after paint */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          var bars = spBody.querySelectorAll(".sk-bar-f[data-target]");
          bars.forEach(function (bar) {
            bar.style.width = bar.getAttribute("data-target") + "%";
          });
        });
      });
  
      bindSidePanelButtons(c);
      if (window.lucide) lucide.createIcons();
    }
  
    /* Bind shortlist / interview / reject buttons in side panel */
    function bindSidePanelButtons(c) {
      var slBtn  = document.getElementById("spShortlistBtn");
      var intBtn = document.getElementById("spInterviewBtn");
      var rejBtn = document.getElementById("spRejectBtn");
  
      if (slBtn) slBtn.addEventListener("click", function () { applyDecision(c.id, "shortlisted"); });
      if (intBtn) intBtn.addEventListener("click", function () { scheduleInterview(c.id); });
      if (rejBtn) rejBtn.addEventListener("click", function () { applyDecision(c.id, "rejected"); });
    }
  
    /* Decision logic: update status in data + session decisions + re-render */
    function applyDecision(id, decision) {
      var c = CANDIDATES.find(function (x) { return x.id === id; });
      if (!c) return;
      sessionDecisions[id] = decision;
      if (decision === "shortlisted") c.status = "shortlisted";
      if (decision === "rejected")    c.status = "rejected";
  
      var label = { shortlisted: "shortlisted ✓", rejected: "moved to rejected ✕", interview: "scheduled for interview 📅" };
      showToast(c.name + " " + label[decision], decision === "rejected" ? "error" : "success");
  
      updateStatCards();
      selectCandidate(id); /* refresh side panel with banner */
      renderTable();
    }
  
    function scheduleInterview(id) {
      applyDecision(id, "interview");
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 10 — SKILL HEATMAP
    ───────────────────────────────────────────────────────────────────────── */
  
    function renderSkillHeatmap() {
      var wrap = document.getElementById("skillHeatmap");
      if (!wrap) return;
  
      wrap.innerHTML = SKILL_CONFIG.map(function (s) {
        var dots = CANDIDATES.slice(0, 10).map(function (c) {
          /* Look up the exact skill key (strip spaces) */
          var key = s.label.replace(/\s/g, "");
          var val = c.skills[key] !== undefined
            ? c.skills[key]
            : Math.min(99, Math.max(40, c.score - 5 + Math.floor(Math.random() * 15)));
          var opacity = (val / 100).toFixed(2);
          return '<div class="skill-dot" style="flex:1;background:' + s.color + ';opacity:' + opacity + ';" ' +
                 'title="' + c.name + ': ' + val + '"></div>';
        }).join("");
  
        return '<div class="skill-row">' +
          '<div class="skill-label">' + s.label + '</div>' +
          '<div class="skill-dots">' + dots + '</div>' +
          '<div class="skill-avg" style="color:' + s.color + ';">' + s.avg + '</div>' +
        '</div>';
      }).join("");
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 11 — SCORE DISTRIBUTION CHART
    ───────────────────────────────────────────────────────────────────────── */
  
    function renderDistChart() {
      var container = document.getElementById("distChart");
      if (!container) return;
  
      var bins   = [55, 60, 65, 70, 75, 80, 85, 90, 95];
      var counts = bins.map(function (b) {
        return CANDIDATES.filter(function (c) { return c.score >= b && c.score < b + 5; }).length;
      });
      var maxCount = Math.max.apply(null, counts.concat([1]));
  
      container.innerHTML = bins.map(function (b, i) {
        var h   = Math.max(Math.round((counts[i] / maxCount) * 68), 4);
        var col = b >= 85 ? "#10b981" : b >= 70 ? "#6366f1" : "#f59e0b";
        return '<div style="display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;">' +
          '<div style="font-size:10px;color:var(--subtext);">' + (counts[i] || "") + '</div>' +
          '<div style="height:0px;width:100%;background:' + col + ';border-radius:4px 4px 0 0;opacity:0.85;transition:height 0.6s ease;" ' +
               'data-h="' + h + '" title="' + b + '–' + (b + 4) + ': ' + counts[i] + ' candidates"></div>' +
          '<div style="font-size:10px;color:var(--subtext);">' + b + '</div>' +
        '</div>';
      }).join("");
  
      /* Animate bars */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          container.querySelectorAll("[data-h]").forEach(function (el) {
            el.style.height = el.getAttribute("data-h") + "px";
          });
        });
      });
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 12 — ACTIVITY FEED
    ───────────────────────────────────────────────────────────────────────── */
  
    var _livePoolIdx = 0;
  
    function renderActivityFeed() {
      var feed = document.getElementById("activityFeed");
      if (!feed) return;
  
      feed.innerHTML = ACTIVITY_SEED.map(function (a) {
        return '<div class="feed-item">' +
          '<div class="feed-icon" style="background:' + a.bg + ';color:' + a.color + ';">' +
            '<i data-lucide="' + a.icon + '" style="width:14px;height:14px;"></i>' +
          '</div>' +
          '<div class="feed-text">' +
            '<div class="feed-main">' + a.text + '</div>' +
            '<div class="feed-time">' + a.time + '</div>' +
          '</div>' +
        '</div>';
      }).join("");
    }
  
    function pushLiveActivityItem() {
      var feed = document.getElementById("activityFeed");
      if (!feed) return;
  
      var item = LIVE_ACTIVITY_POOL[_livePoolIdx % LIVE_ACTIVITY_POOL.length];
      _livePoolIdx++;
  
      var el       = document.createElement("div");
      el.className = "feed-item";
      el.style.background    = "#f0f9ff";
      el.style.transition    = "background 1.2s ease";
      el.innerHTML =
        '<div class="feed-icon" style="background:' + item.bg + ';color:' + item.color + ';">' +
          '<i data-lucide="' + item.icon + '" style="width:14px;height:14px;"></i>' +
        '</div>' +
        '<div class="feed-text">' +
          '<div class="feed-main">' + item.text + '</div>' +
          '<div class="feed-time">just now</div>' +
        '</div>';
  
      feed.insertBefore(el, feed.firstChild);
  
      /* Fade background back to normal */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { el.style.background = ""; });
      });
  
      /* Cap feed at 7 items */
      while (feed.children.length > 7) feed.removeChild(feed.lastChild);
  
      if (window.lucide) lucide.createIcons();
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 13 — INVITE MODAL
    ───────────────────────────────────────────────────────────────────────── */
  
    function initInviteModal() {
      var openBtn  = document.getElementById("inviteBtn");
      var modal    = document.getElementById("inviteModal");
      if (!openBtn || !modal) return;
  
      var nameInput  = modal.querySelector('input[type="text"]');
      var emailInput = modal.querySelector('input[type="email"]');
      var roleSelect = modal.querySelector("select");
      var submitBtn  = modal.querySelector("button:last-of-type");
      var closeBtn   = modal.querySelector("button:first-of-type"); /* ✕ button inside header div */
  
      /* ── open ── */
      openBtn.addEventListener("click", function () {
        modal.style.display = "flex";
        if (nameInput) nameInput.focus();
      });
  
      /* ── close via overlay click ── */
      modal.addEventListener("click", function (e) {
        if (e.target === modal) closeInviteModal();
      });
  
      /* ── ESC key ── */
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal.style.display === "flex") closeInviteModal();
      });
  
      /* ── submit with validation ── */
      if (submitBtn) {
        submitBtn.addEventListener("click", function (e) {
          e.preventDefault();
          var name  = nameInput  ? nameInput.value.trim()  : "";
          var email = emailInput ? emailInput.value.trim() : "";
          var role  = roleSelect ? roleSelect.value        : "";
  
          if (!name) {
            showToast("Please enter the candidate's name.", "warning");
            if (nameInput) nameInput.focus();
            return;
          }
          if (!email || !email.includes("@")) {
            showToast("Please enter a valid email address.", "warning");
            if (emailInput) emailInput.focus();
            return;
          }
  
          /* Simulate adding to candidate list */
          var newId = CANDIDATES.length + 1;
          CANDIDATES.push({
            id: newId,
            name: name,
            initials: name.split(" ").map(function (w) { return w[0]; }).join("").toUpperCase().slice(0, 2),
            college: "Invited",
            score: 0,
            progress: 0,
            topSkill: role.split(" ")[0] || "—",
            status: "on-track",
            joinedMs: Date.now(),
            skills: { Leadership: 0, Communication: 0, Execution: 0, ProblemSolving: 0, Adaptability: 0 }
          });
  
          showToast("Invite sent to " + name + "! (" + email + ")", "success");
          closeInviteModal();
          updateStatCards();
          renderTable();
  
          /* Reset fields */
          if (nameInput)  nameInput.value  = "";
          if (emailInput) emailInput.value = "";
        });
      }
    }
  
    function closeInviteModal() {
      var modal = document.getElementById("inviteModal");
      if (modal) modal.style.display = "none";
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 14 — EXPORT REPORT
    ───────────────────────────────────────────────────────────────────────── */
  
    function initExportBtn() {
      var btn = document.getElementById("exportBtn");
      if (!btn) return;
  
      btn.addEventListener("click", function () {
        exportCSV();
      });
    }
  
    function exportCSV() {
      var headers = ["Name", "College", "Score", "Progress %", "Top Skill", "Status", "Leadership",
                     "Communication", "Execution", "ProblemSolving", "Adaptability"];
      var rows = CANDIDATES.map(function (c) {
        return [
          '"' + c.name + '"',
          '"' + c.college + '"',
          c.score,
          c.progress,
          '"' + c.topSkill + '"',
          '"' + (sessionDecisions[c.id] || c.status) + '"',
          c.skills.Leadership,
          c.skills.Communication,
          c.skills.Execution,
          c.skills.ProblemSolving,
          c.skills.Adaptability
        ].join(",");
      });
  
      var csv     = [headers.join(",")].concat(rows).join("\n");
      var blob    = new Blob([csv], { type: "text/csv" });
      var url     = URL.createObjectURL(blob);
      var anchor  = document.createElement("a");
      anchor.href = url;
      anchor.download = "dayzero-recruiter-report-" + new Date().toISOString().slice(0, 10) + ".csv";
      anchor.click();
      URL.revokeObjectURL(url);
  
      showToast("CSV report downloaded successfully.", "success");
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 15 — SIDEBAR NAVIGATION ACTIVE STATE
    ───────────────────────────────────────────────────────────────────────── */
  
    function initSidebarNav() {
      var items = document.querySelectorAll(".nav-item");
      items.forEach(function (item) {
        item.addEventListener("click", function () {
          items.forEach(function (i) { i.classList.remove("active"); });
          this.classList.add("active");
          /* Future: panel switching could be wired here */
        });
      });
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 16 — "LAST ACTIVE" AUTO-REFRESH
    ───────────────────────────────────────────────────────────────────────── */
  
    function refreshLastActiveTimes() {
      document.querySelectorAll(".last-active-cell[data-joined]").forEach(function (cell) {
        var ms = parseInt(cell.getAttribute("data-joined"), 10);
        cell.textContent = relativeTime(ms);
      });
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 17 — KEYBOARD SHORTCUTS
    ───────────────────────────────────────────────────────────────────────── */
  
    function initKeyboardShortcuts() {
      document.addEventListener("keydown", function (e) {
        /* Ignore when typing in an input */
        if (["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)) return;
  
        /* / → focus search */
        if (e.key === "/") {
          e.preventDefault();
          var s = document.getElementById("searchInput");
          if (s) { s.focus(); s.select(); }
        }
  
        /* I → open invite modal */
        if (e.key === "i" || e.key === "I") {
          var modal = document.getElementById("inviteModal");
          if (modal && modal.style.display !== "flex") {
            modal.style.display = "flex";
            var nameInput = modal.querySelector('input[type="text"]');
            if (nameInput) nameInput.focus();
          }
        }
  
        /* E → export CSV */
        if ((e.key === "e" || e.key === "E") && !e.ctrlKey && !e.metaKey) exportCSV();
  
        /* Arrow navigation through visible rows */
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
          var rows = Array.from(document.querySelectorAll(".cand-row"));
          if (!rows.length) return;
          var currentIdx = rows.findIndex(function (r) { return parseInt(r.dataset.id, 10) === _selectedId; });
          var nextIdx = e.key === "ArrowDown"
            ? Math.min(currentIdx + 1, rows.length - 1)
            : Math.max(currentIdx - 1, 0);
          if (rows[nextIdx]) {
            e.preventDefault();
            selectCandidate(parseInt(rows[nextIdx].dataset.id, 10));
            rows[nextIdx].scrollIntoView({ block: "nearest" });
          }
        }
  
        /* S → shortlist selected; R → reject selected */
        if (_selectedId) {
          if (e.key === "s" || e.key === "S") applyDecision(_selectedId, "shortlisted");
          if (e.key === "r" || e.key === "R") applyDecision(_selectedId, "rejected");
        }
      });
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 18 — PERIODIC LIVE SCORE NUDGE
       Randomly bumps or dips a candidate's score slightly every ~15s
       to simulate live scoring during the sprint.
    ───────────────────────────────────────────────────────────────────────── */
  
    function startLiveScoreNudge() {
      setInterval(function () {
        /* Pick a random on-track or at-risk candidate */
        var eligible = CANDIDATES.filter(function (c) {
          return c.status !== "shortlisted" && c.status !== "rejected";
        });
        if (!eligible.length) return;
  
        var c     = eligible[Math.floor(Math.random() * eligible.length)];
        var delta = Math.floor(Math.random() * 5) - 2; /* -2 to +2 */
        c.score   = Math.min(100, Math.max(30, c.score + delta));
  
        /* Flip at-risk if score recovered */
        if (c.status === "at-risk" && c.score >= 70) {
          c.status = "on-track";
          pushLiveActivityItem();
        }
        /* Flag as at-risk if dropped */
        if (c.status === "on-track" && c.score < 65) {
          c.status = "at-risk";
          showToast(c.name + " has dropped below threshold — now At Risk.", "warning");
        }
  
        updateStatCards();
        renderDistChart();
        renderTable();
  
        /* If this candidate is open in the side panel, refresh it */
        if (_selectedId === c.id) selectCandidate(c.id);
      }, 15000);
    }
  
    /* ─────────────────────────────────────────────────────────────────────────
       SECTION 19 — MAIN INIT
    ───────────────────────────────────────────────────────────────────────── */
  
    function init() {
      enforceRoleGuard();
  
      /* Initial renders */
      updateStatCards();
      renderTable();
      renderSkillHeatmap();
      renderActivityFeed();
      renderDistChart();
  
      /* Wire up UI modules */
      initInviteModal();
      initExportBtn();
      initSidebarNav();
      initKeyboardShortcuts();
  
      /* Lucide icons (initial pass) */
      if (window.lucide) lucide.createIcons();
  
      /* Live activity feed — new item every 8s */
      setInterval(pushLiveActivityItem, 8000);
  
      /* Refresh "last active" timestamps every 60s */
      setInterval(refreshLastActiveTimes, 60000);
  
      /* Live score nudge every ~15s */
      startLiveScoreNudge();
  
      /* Keyboard hint toast */
      setTimeout(function () {
        showToast("Tip: Press / to search · ↑↓ to navigate · S to shortlist", "default", 4000);
      }, 1500);
    }
  
    /* Run after DOM is ready */
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init);
    } else {
      init();
    }
  
  })();
  <script src="recruiter_app.js"></script>