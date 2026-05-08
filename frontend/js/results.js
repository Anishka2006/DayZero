const reportTaskTitle = document.getElementById("reportTaskTitle");
const reportSummary = document.getElementById("reportSummary");
const overallScore = document.getElementById("overallScore");
const recommendation = document.getElementById("recommendation");
const rubricGrid = document.getElementById("rubricGrid");
const strengthList = document.getElementById("strengthList");
const riskList = document.getElementById("riskList");
const timelineFeed = document.getElementById("timelineFeed");
const observerNoteList = document.getElementById("observerNoteList");
const teamNotes = document.getElementById("teamNotes");
const nextStepList = document.getElementById("nextStepList");

function loadReport() {
  const rawReport = localStorage.getItem("lastEvaluationReport");
  if (!rawReport) {
    renderEmpty();
    return;
  }

  try {
    renderReport(JSON.parse(rawReport));
  } catch (error) {
    renderEmpty();
  }
}

function renderReport(report) {
  const taskTitle = report.task && report.task.title ? report.task.title : localStorage.getItem("lastTaskTitle") || "Latest submission";
  const scores = report.scores || report.rubric || {};
  const weaknesses = report.weaknesses || report.risks || [];

  reportTaskTitle.textContent = taskTitle;
  reportSummary.textContent = report.summary || "No summary available.";
  overallScore.textContent = report.overall_score || 0;
  recommendation.textContent = report.recommendation || "No recommendation";

  rubricGrid.innerHTML = Object.entries(scores)
    .map(
      ([key, score]) => `
        <article class="rubric-card">
          <p class="eyebrow">${formatMetricLabel(key)}</p>
          <strong>${escapeHtml(score)}</strong>
          <span>out of 100</span>
        </article>
      `
    )
    .join("");

  strengthList.innerHTML = renderListItems(report.strengths || [], "Strong collaboration and structured decision-making signals showed up in the simulation.");

  riskList.innerHTML = renderListItems(weaknesses, "Residual risk was not captured in the final report.");

  timelineFeed.innerHTML = (report.timeline || [])
    .slice()
    .reverse()
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

  observerNoteList.innerHTML = renderListItems(report.observer_notes || [], "No observer notes were captured.");

  teamNotes.innerHTML = (report.team_notes || [])
    .map(
      (note) => `
        <article class="note-card">
          <div class="note-meta">
            <div>
              <strong>${escapeHtml(note.speaker_name)}</strong>
              <span>${escapeHtml(note.speaker_title)}</span>
            </div>
            <span class="note-score">${escapeHtml(note.score)}/100</span>
          </div>
          <p class="note-strength"><strong>Strength:</strong> ${escapeHtml(note.strength)}</p>
          <p class="note-risk"><strong>Risk:</strong> ${escapeHtml(note.risk)}</p>
        </article>
      `
    )
    .join("");

  nextStepList.innerHTML = renderListItems(report.next_steps || [], "Open a new simulation and practice making the final call faster.");
}

function renderEmpty() {
  reportTaskTitle.textContent = "No SkillRecord found";
  reportSummary.textContent = "Complete a simulation in the dashboard to generate a report.";
  overallScore.textContent = "0";
  recommendation.textContent = "No data";
  rubricGrid.innerHTML = "";
  strengthList.innerHTML = "<li>Start a live simulation and submit your solution.</li>";
  riskList.innerHTML = "<li>No weaknesses recorded yet.</li>";
  timelineFeed.innerHTML = "";
  observerNoteList.innerHTML = "<li>No observer notes recorded yet.</li>";
  teamNotes.innerHTML = "";
  nextStepList.innerHTML = "<li>Open the dashboard and finish a simulation.</li>";
}

function formatMetricLabel(key) {
  if (key === "technicalDepth") {
    return "Technical Depth";
  }

  return key
    .replace(/([A-Z])/g, " $1")
    .split("_")
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function renderListItems(items, fallback) {
  const safeItems = Array.isArray(items) && items.length ? items : [fallback];
  return safeItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

loadReport();
