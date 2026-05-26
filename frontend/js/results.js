const profileName = document.querySelector(".profile-identity h2");
const profileTitle = document.querySelector(".profile-title");
const profileTask = document.getElementById("reportTaskTitle");
const profileLocation = document.querySelector(".profile-location");
const profileAvatar = document.querySelector(".profile-avatar-premium");
const scoreValue = document.getElementById("overallScore");
const scoreSubtitle = document.getElementById("recommendation");
const scoreBadge = document.getElementById("scoreBadge");
const summaryBody = document.getElementById("reportSummary");
const skillsGrid = document.getElementById("rubricGrid");
const badgesRow = document.getElementById("strengthList");
const rolesRow = document.getElementById("nextStepList");
const footerDate = document.getElementById("issuedDate");
const publicLink = document.getElementById("publicLink");
const scoreRingFill = document.querySelector(".ring-fill");
const strengthDetailList = document.getElementById("strengthDetailList");
const riskList = document.getElementById("riskList");
const timelineFeed = document.getElementById("timelineFeed");
const observerNoteList = document.getElementById("observerNoteList");
const nextStepsDetailList = document.getElementById("nextStepsDetailList");
const teamNotes = document.getElementById("teamNotes");
const shareProfileBtn = document.getElementById("shareProfileBtn");
const downloadReportBtn = document.getElementById("downloadReportBtn");
const toast = document.getElementById("toast");
const recordHistory = document.getElementById("recordHistory");
const recordList = document.getElementById("recordList");
const recordCount = document.getElementById("recordCount");

let currentReport = null;
let currentRecordIndex = 0;

function currentUserName() {
  return localStorage.getItem("userName") || "You";
}

function currentUserRole() {
  return localStorage.getItem("userRole") || "Candidate";
}

function initials(name) {
  return String(name || "You")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "Y";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatDate(value) {
  if (!value) {
    return "Pending";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Pending";
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(value) {
  if (!value) {
    return "Now";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Now";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function refreshIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function showToast(message) {
  if (!toast) {
    return;
  }
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toast.classList.add("hidden");
  }, 2200);
}

function copyToClipboard(text, successMessage) {
  if (!text) {
    showToast("Nothing to copy yet.");
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(
      () => showToast(successMessage),
      () => showToast("Copy failed. Try again.")
    );
    return;
  }

  showToast("Clipboard is not available here.");
}

function publicSkillRecordLink(name) {
  if (window.DayZeroSkillRecords && currentReport) {
    return window.DayZeroSkillRecords.publicUrl(currentReport).replace(/^https?:\/\//, "");
  }
  const slug = String(name || "candidate")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "candidate";
  return `dayzero.ai/${slug}`;
}

function reportScore(report, key) {
  if (!report) return 0;
  if (report.scores && Number.isFinite(Number(report.scores[key]))) {
    return Number(report.scores[key]);
  }
  if (Number.isFinite(Number(report[`${key}_score`]))) {
    return Number(report[`${key}_score`]);
  }
  const fallbackScores = report.scores || {};
  if (key === "technicalReasoning" && Number.isFinite(Number(fallbackScores.technicalDepth))) {
    return Number(fallbackScores.technicalDepth);
  }
  if (key === "collaboration" && Number.isFinite(Number(fallbackScores.communication))) {
    return Math.round((Number(fallbackScores.communication) + Number(fallbackScores.leadership || fallbackScores.communication)) / 2);
  }
  if (key === "stakeholderManagement" && Number.isFinite(Number(fallbackScores.prioritization))) {
    return Math.round((Number(fallbackScores.prioritization) + Number(fallbackScores.communication || fallbackScores.prioritization)) / 2);
  }
  if (key === "role_judgment" && Number.isFinite(Number(report.role_skill_score))) {
    return Number(report.role_skill_score);
  }
  if (Number.isFinite(Number(report[key]))) {
    return Number(report[key]);
  }
  return 0;
}

function reportModeLabel(report) {
  return report && report.mode === "project" ? "5-Day Sprint" : "Live Simulation";
}

function scoreBadgeLabel(score) {
  if (score >= 90) return "Top 5% Candidate";
  if (score >= 85) return "Top 10% Candidate";
  if (score >= 80) return "Top 15% Candidate";
  if (score >= 70) return "Top 25% Candidate";
  return "Emerging Candidate";
}

function reportMetricEntries(report) {
  return [
    ["Problem Solving", reportScore(report, "problem_solving") || reportScore(report, "prioritization")],
    ["Communication", reportScore(report, "communication")],
    ["Role Judgment", reportScore(report, "role_judgment") || reportScore(report, "leadership")],

    ["Collaboration", reportScore(report, "collaboration")],
    ["Technical Reasoning", reportScore(report, "technicalReasoning")],

  ];
}

function recommendedRoleTags(report) {
  const role = report && report.task && report.task.role ? report.task.role.toLowerCase() : "";
  if (role.includes("product")) {
    return ["Product Manager", "Growth PM", "Founder's Office", "Strategy Associate"];
  }
  if (role.includes("backend")) {
    return ["Backend Engineer", "Product Engineer", "API Engineer", "Quality-Focused Builder"];
  }
  if (role.includes("frontend")) {
    return ["Frontend Engineer", "Product Engineer", "UI Systems", "Launch Team"];
  }
  if (role.includes("designer") || role.includes("design")) {
    return ["Product Designer", "UX Designer", "Design Systems", "Product Team"];
  }
  return ["Product Generalist", "Operator", "Builder", "Analyst"];
}

function achievementBadges(report) {
  const badges = [];
  const overallScore = report && report.overall_score ? report.overall_score : 0;

  badges.push(reportModeLabel(report) === "5-Day Sprint" ? "Completed 5-Day Sprint" : "Completed Live Simulation");
  if (overallScore >= 80) {
    badges.push(scoreBadgeLabel(overallScore));
  }
  if (reportScore(report, "adaptability") >= 80) {
    badges.push("Crisis Handling Certified");
  }
  if (reportScore(report, "prioritization") >= 80 || reportScore(report, "ownership") >= 80) {
    badges.push("Execution Excellence");
  }
  return badges.slice(0, 4);
}

function renderListItems(items, fallback) {
  const safeItems = Array.isArray(items) && items.length ? items : [fallback];
  return safeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderTimeline(items) {
  const safeItems = Array.isArray(items) && items.length ? items.slice().reverse() : [];
  if (!safeItems.length) {
    timelineFeed.innerHTML = `
      <article class="note-card">
        <div class="note-meta">
          <div>
            <strong>No timeline yet</strong>
            <span>Now</span>
          </div>
        </div>
        <p class="note-risk">Complete a simulation to generate the SkillRecord timeline.</p>
      </article>
    `;
    return;
  }

  timelineFeed.innerHTML = safeItems
    .map(
      (item) => `
        <article class="note-card">
          <div class="note-meta">
            <div>
              <strong>${escapeHtml(item.title || "Timeline event")}</strong>
              <span>${escapeHtml(formatTime(item.created_at))}</span>
            </div>
          </div>
          <p class="note-risk">${escapeHtml(item.description || "")}</p>
        </article>
      `
    )
    .join("");
}

function renderTeamNotes(notes) {
  const safeNotes = Array.isArray(notes) && notes.length ? notes : [];
  if (!safeNotes.length) {
    teamNotes.innerHTML = `
      <article class="note-card">
        <div class="note-meta">
          <div>
            <strong>No team feedback yet</strong>
            <span>DayZero room</span>
          </div>
        </div>
        <p class="note-risk">Complete a simulation to see how the room interpreted your delivery.</p>
      </article>
    `;
    return;
  }

  teamNotes.innerHTML = safeNotes
    .map(
      (note) => `
        <article class="note-card">
          <div class="note-meta">
            <div>
              <strong>${escapeHtml(note.speaker_name || "Teammate")}</strong>
              <span>${escapeHtml(note.speaker_title || "Simulation teammate")}</span>
            </div>
            <span class="note-score">${escapeHtml(note.score || 0)}/100</span>
          </div>
          <p class="note-strength"><strong>Strength:</strong> ${escapeHtml(note.strength || "No strength note provided.")}</p>
          <p class="note-risk"><strong>Risk:</strong> ${escapeHtml(note.risk || "No risk note provided.")}</p>
        </article>
      `
    )
    .join("");
}

function renderHistory(records) {
  const safeRecords = Array.isArray(records) ? records : [];
  if (!recordHistory || !recordList || !recordCount) {
    return;
  }

  recordCount.textContent = `${safeRecords.length} record${safeRecords.length === 1 ? "" : "s"}`;

  if (!safeRecords.length) {
    recordList.innerHTML = `
      <article class="record-empty">
        Complete a simulation and your saved SkillRecords will appear here.
      </article>
    `;
    return;
  }

  recordList.innerHTML = safeRecords
    .map((record, index) => {
      const task = record.task || {};
      const title = task.title || "DayZero simulation";
      const company = task.company || task.company_name || "DayZero";
      const score = Number(record.overall_score) || 0;
      const active = index === currentRecordIndex ? " active" : "";
      return `
        <button class="record-item${active}" type="button" data-record-index="${index}">
          <span>
            <strong>${escapeHtml(title)}</strong>
            <small>${escapeHtml(company)} | ${escapeHtml(formatDate(record.submitted_at || record.created_at))}</small>
          </span>
          <b>${escapeHtml(score)}/100</b>
        </button>
      `;
    })
    .join("");

  recordList.querySelectorAll("[data-record-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextIndex = Number(button.dataset.recordIndex);
      const nextReport = safeRecords[nextIndex];
      if (!nextReport) return;
      currentRecordIndex = nextIndex;
      localStorage.setItem("lastEvaluationReport", JSON.stringify(nextReport));
      renderReport(nextReport);
      renderHistory(safeRecords);
      showToast("SkillRecord loaded.");
    });
  });
}

function toggleActionButtons(enabled) {
  if (shareProfileBtn) {
    shareProfileBtn.disabled = !enabled;
  }
  if (downloadReportBtn) {
    downloadReportBtn.disabled = !enabled;
  }
}

function renderEmpty() {
  currentReport = null;
  const userName = currentUserName();

  if (profileName) profileName.textContent = userName;
  if (profileTitle) profileTitle.textContent = "Complete a simulation to generate a verified SkillRecord";
  if (profileTask) profileTask.textContent = "No completed SkillRecord yet";
  if (profileLocation) {
    profileLocation.innerHTML = `<i data-lucide="briefcase" class="icon-xs"></i> DayZero | <i data-lucide="calendar-days" class="icon-xs"></i> No completed flow yet`;
  }
  if (profileAvatar) profileAvatar.textContent = initials(userName);
  if (scoreValue) scoreValue.textContent = "0";
  if (scoreSubtitle) scoreSubtitle.textContent = "No report yet";
  if (scoreBadge) {
    scoreBadge.innerHTML = `<i data-lucide="award" class="icon-xs"></i> Awaiting submission`;
  }
  if (summaryBody) {
    summaryBody.textContent = "No completed simulation yet. Start a short room or a five-day sprint in the dashboard to generate your report.";
  }
  if (skillsGrid) {
    skillsGrid.innerHTML = `
      <div class="skill-row">
        <div class="skill-info"><span>Leadership</span><strong>0</strong></div>
        <div class="skill-bar-wrap"><div class="skill-bar-fill" style="width: 0%;"></div></div>
      </div>
      <div class="skill-row">
        <div class="skill-info"><span>Communication</span><strong>0</strong></div>
        <div class="skill-bar-wrap"><div class="skill-bar-fill" style="width: 0%;"></div></div>
      </div>
    `;
  }
  if (badgesRow) {
    badgesRow.innerHTML = `<div class="ach-badge"><i data-lucide="clock" class="icon-sm"></i> No completed flow yet</div>`;
  }
  if (rolesRow) {
    rolesRow.innerHTML = `<span class="role-tag">Start a simulation first</span>`;
  }
  if (footerDate) {
    footerDate.textContent = "Issued by DayZero Simulation OS | Assessment Date: Pending";
  }
  if (publicLink) {
    publicLink.textContent = "dayzero.ai/your-profile";
  }
  if (scoreRingFill) {
    scoreRingFill.style.strokeDasharray = "283";
    scoreRingFill.style.strokeDashoffset = "283";
  }
  if (riskList) {
    riskList.innerHTML = "<li>No weaknesses recorded yet.</li>";
  }
  if (strengthDetailList) {
    strengthDetailList.innerHTML = "<li>Start a live simulation and submit your solution.</li>";
  }
  if (observerNoteList) {
    observerNoteList.innerHTML = "<li>No observer notes recorded yet.</li>";
  }
  if (nextStepsDetailList) {
    nextStepsDetailList.innerHTML = "<li>Open the dashboard and finish a simulation.</li>";
  }

  renderTimeline([]);
  renderTeamNotes([]);
  renderHistory([]);
  toggleActionButtons(false);
  refreshIcons();
}

function renderReport(report) {
  currentReport = report;
  const userName = currentUserName();
  const metricRows = reportMetricEntries(report);
  const taskTitle = report.task && report.task.title ? report.task.title : localStorage.getItem("lastTaskTitle") || "Latest simulation";
  const taskCompany = report.task && (report.task.company || report.task.company_name) ? (report.task.company || report.task.company_name) : "DayZero";
  const ringCircumference = 283;
  const ringOffset = ringCircumference * (1 - (report.overall_score || 0) / 100);

  if (profileName) profileName.textContent = userName;
  if (profileTitle) profileTitle.textContent = `${report.task && report.task.role ? report.task.role : currentUserRole()} Candidate`;
  if (profileTask) profileTask.textContent = taskTitle;
  if (profileLocation) {
    profileLocation.innerHTML = `<i data-lucide="briefcase" class="icon-xs"></i> ${escapeHtml(taskCompany)} | <i data-lucide="calendar-days" class="icon-xs"></i> ${escapeHtml(reportModeLabel(report))}`;
  }
  if (profileAvatar) profileAvatar.textContent = initials(userName);
  if (scoreValue) scoreValue.textContent = String(report.overall_score || 0);
  if (scoreSubtitle) scoreSubtitle.textContent = report.recommendation || "SkillRecord ready";
  if (scoreBadge) {
    scoreBadge.innerHTML = `<i data-lucide="award" class="icon-xs"></i> ${escapeHtml(scoreBadgeLabel(report.overall_score || 0))}`;
  }
  if (summaryBody) {
    summaryBody.textContent = report.summary || report.timeline_summary || "Latest report ready.";
  }
  if (skillsGrid) {
    skillsGrid.innerHTML = metricRows
      .map(
        ([label, score]) => `
          <div class="skill-row">
            <div class="skill-info"><span>${escapeHtml(label)}</span><strong>${escapeHtml(score)}</strong></div>
            <div class="skill-bar-wrap"><div class="skill-bar-fill" style="width: ${score}%;"></div></div>
          </div>
        `
      )
      .join("");
  }
  if (badgesRow) {
    badgesRow.innerHTML = achievementBadges(report)
      .map(
        (badge, index) => `
          <div class="ach-badge${index === 1 ? " gold" : ""}">
            <i data-lucide="${["check-circle", "star", "shield-check", "zap"][index % 4]}" class="icon-sm"></i>
            ${escapeHtml(badge)}
          </div>
        `
      )
      .join("");
  }
  if (rolesRow) {
    rolesRow.innerHTML = recommendedRoleTags(report)
      .map((role) => `<span class="role-tag">${escapeHtml(role)}</span>`)
      .join("");
  }
  if (footerDate) {
    footerDate.textContent = `Issued by DayZero Simulation OS | Assessment Date: ${formatDate(report.submitted_at)}`;
  }
  if (publicLink) {
    publicLink.textContent = publicSkillRecordLink(userName);
  }
  if (scoreRingFill) {
    scoreRingFill.style.strokeDasharray = String(ringCircumference);
    scoreRingFill.style.strokeDashoffset = String(ringOffset);
  }
  if (riskList) {
    riskList.innerHTML = renderListItems(report.weaknesses || report.risks || [], "Residual risk was not captured in the final report.");
  }
  if (strengthDetailList) {
    strengthDetailList.innerHTML = renderListItems(report.strengths || [], "Strong collaboration and structured decision-making signals showed up in the simulation.");
  }
  if (observerNoteList) {
    observerNoteList.innerHTML = renderListItems(report.observer_notes || [], "No observer notes were captured.");
  }
  if (nextStepsDetailList) {
    nextStepsDetailList.innerHTML = renderListItems(report.next_steps || [], "Open a new simulation and practice making the final call faster.");
  }

  renderTimeline(report.timeline || []);
  renderTeamNotes(report.team_notes || []);
  toggleActionButtons(true);
  refreshIcons();
}

function loadReport() {
  let report = window.DayZeroSkillRecords ? window.DayZeroSkillRecords.latest() : null;

  if (!report) {
    const rawReport = localStorage.getItem("lastEvaluationReport");
    if (rawReport) {
      try {
        report = JSON.parse(rawReport);
        if (window.DayZeroSkillRecords) {
          report = window.DayZeroSkillRecords.store(report, { migrated_from_last_report: true });
        }
      } catch (error) {
        report = null;
      }
    }
  }

  if (!report) {
    renderEmpty();
    return;
  }

  currentRecordIndex = 0;
  renderReport(report);
  renderHistory(window.DayZeroSkillRecords ? window.DayZeroSkillRecords.list() : [report]);
}

function downloadReport() {
  if (!currentReport) {
    showToast("No SkillRecord to download yet.");
    return;
  }

  if (window.DayZeroSkillRecords) {
    window.DayZeroSkillRecords.downloadPdf(currentReport);
    showToast("SkillRecord PDF downloaded.");
    return;
  }

  window.print();
}

function shareProfile() {
  if (!currentReport) {
    showToast("No SkillRecord to share yet.");
    return;
  }

  if (window.DayZeroSkillRecords) {
    const result = window.DayZeroSkillRecords.openLinkedInPost(currentReport);
    showToast(result.opened ? "LinkedIn opened. Post text copied." : "Post text copied. Allow popups to open LinkedIn.");
    return;
  }

  const text = `${currentUserName()} | ${currentReport.task && currentReport.task.title ? currentReport.task.title : "Latest simulation"} | ${currentReport.overall_score || 0}/100 | ${currentReport.recommendation || "SkillRecord ready"} | ${publicSkillRecordLink(currentUserName())}`;
  copyToClipboard(text, "SkillRecord summary copied.");
}

if (shareProfileBtn) {
  shareProfileBtn.addEventListener("click", shareProfile);
}

if (downloadReportBtn) {
  downloadReportBtn.addEventListener("click", downloadReport);
}

if (publicLink) {
  publicLink.addEventListener("click", (event) => {
    event.preventDefault();
    copyToClipboard(publicLink.textContent, "Public SkillRecord link copied.");
  });
}

loadReport();
