(function () {
  const LAST_REPORT_KEY = "lastEvaluationReport";
  const STORE_PREFIX = "dayzeroSkillRecords::";
  const MAX_RECORDS = 20;

  function readJson(key, fallback) {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (_error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function slugify(value) {
    return String(value || "candidate")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "candidate";
  }

  function currentUser() {
    const stored = readJson("user", {}) || {};
    const name = stored.name || localStorage.getItem("userName") || "Candidate";
    const role = localStorage.getItem("userRole") || stored.role || localStorage.getItem("role") || "Candidate";
    return {
      id: stored.id || localStorage.getItem("userId") || "",
      email: stored.email || localStorage.getItem("userEmail") || "",
      name,
      role,
    };
  }

  function storageKey(user) {
    const activeUser = user || currentUser();
    return `${STORE_PREFIX}${slugify(activeUser.id || activeUser.email || activeUser.name)}`;
  }

  function taskFromReport(report) {
    const task = report && report.task && typeof report.task === "object" ? report.task : {};
    return {
      id: task.id || report.task_id || "",
      title: task.title || report.task_title || localStorage.getItem("lastTaskTitle") || "DayZero simulation",
      company: task.company || task.company_name || report.company || report.company_name || "DayZero",
      role: task.role || report.role || localStorage.getItem("userRole") || "Candidate",
      duration: task.duration || task.duration_type || report.duration || "",
    };
  }

  function publicUrl(report) {
    const user = (report && report.user) || currentUser();
    const task = taskFromReport(report || {});
    const seed = (report && (report.record_id || report.id || report.session_id)) || `${user.name}-${task.title}`;
    return `https://dayzero.ai/skillrecord/${slugify(user.name)}-${slugify(seed).slice(0, 32)}`;
  }

  function normalizeReport(report, extras) {
    const base = report && typeof report === "object" ? report : {};
    const user = currentUser();
    const task = taskFromReport(base);
    const submittedAt = base.submitted_at || base.created_at || new Date().toISOString();
    const recordSeed = base.record_id || base.id || base.session_id || (extras && extras.session_id) || `${task.title}-${submittedAt}`;
    const normalized = {
      ...base,
      ...extras,
      task: {
        ...task,
        ...((base.task && typeof base.task === "object") ? base.task : {}),
      },
      user: {
        id: user.id,
        email: user.email,
        name: base.user_name || user.name,
        role: base.user_role || user.role,
      },
      user_name: base.user_name || user.name,
      user_role: base.user_role || user.role,
      record_id: base.record_id || `skillrecord-${slugify(recordSeed)}`,
      submitted_at: submittedAt,
      stored_at: base.stored_at || new Date().toISOString(),
    };

    normalized.public_url = base.public_url || publicUrl(normalized);
    normalized.linkedin_post = base.linkedin_post || linkedinPost(normalized);
    return normalized;
  }

  function list(user) {
    const records = readJson(storageKey(user), []);
    return Array.isArray(records) ? records : [];
  }

  function store(report, extras) {
    const normalized = normalizeReport(report, extras || {});
    const records = list();
    const deduped = records.filter((item) => {
      if (!item) return false;
      if (item.record_id && item.record_id === normalized.record_id) return false;
      if (item.session_id && normalized.session_id && item.session_id === normalized.session_id) return false;
      return true;
    });
    const nextRecords = [normalized, ...deduped].slice(0, MAX_RECORDS);
    writeJson(storageKey(), nextRecords);
    writeJson(LAST_REPORT_KEY, normalized);
    return normalized;
  }

  function latest() {
    const records = list();
    if (records.length) {
      return records[0];
    }

    const legacyReport = readJson(LAST_REPORT_KEY, null);
    if (legacyReport) {
      return store(legacyReport, { migrated_from_last_report: true });
    }

    return null;
  }

  function scoreEntries(report) {
    const scores = report && report.scores && typeof report.scores === "object" ? report.scores : {};
    const entries = Object.entries(scores)
      .filter((entry) => Number.isFinite(Number(entry[1])))
      .map(([key, value]) => [labelize(key), Number(value)]);

    if (entries.length) {
      return entries;
    }

    return [
      ["Overall Work Readiness", Number(report && report.overall_score) || 0],
      ["Communication", Number(report && report.communication_score) || 0],
      ["Problem Solving", Number(report && report.problem_solving_score) || 0],
      ["Collaboration", Number(report && report.collaboration_score) || 0],
      ["Execution", Number(report && report.execution_score) || 0],
      ["Role Judgment", Number(report && report.role_skill_score) || 0],
    ].filter((entry) => entry[1] > 0 || entry[0] === "Overall Work Readiness");
  }

  function labelize(value) {
    return String(value || "")
      .replace(/_/g, " ")
      .replace(/([a-z])([A-Z])/g, "$1 $2")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  function linkedinPost(report) {
    const user = (report && report.user) || currentUser();
    const task = taskFromReport(report || {});
    const score = Number(report && report.overall_score) || 0;
    const recommendation = (report && report.recommendation) || "SkillRecord ready";
    const strengths = Array.isArray(report && report.strengths) ? report.strengths.slice(0, 2).join(" ") : "";

    if (report && typeof report.linkedin_post === "string" && report.linkedin_post.trim()) {
      return report.linkedin_post.trim();
    }

    return [
      `I completed a DayZero work simulation for ${task.company}: ${task.title}.`,
      `My SkillRecord score was ${score}/100 (${recommendation}).`,
      strengths ? `Key signal: ${strengths}` : "The simulation tested collaboration, judgment, execution, and clear handoff under pressure.",
      `Role focus: ${task.role || user.role}.`,
    ].join("\n");
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    } finally {
      textarea.remove();
    }
  }

  function openLinkedInPost(report) {
    const normalized = normalizeReport(report || latest() || {});
    const text = `${linkedinPost(normalized)}\n\n${normalized.public_url || publicUrl(normalized)}`;
    const url = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`;
    const opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
    }
    copyText(text).catch(() => {});
    return { opened: Boolean(opened), text };
  }

  function sanitizePdfText(value) {
    return String(value || "")
      .replace(/[\u2018\u2019]/g, "'")
      .replace(/[\u201C\u201D]/g, '"')
      .replace(/[\u2013\u2014]/g, "-")
      .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function escapePdfText(value) {
    return sanitizePdfText(value)
      .replace(/\\/g, "\\\\")
      .replace(/\(/g, "\\(")
      .replace(/\)/g, "\\)");
  }

  function wrapText(value, maxChars) {
    const words = sanitizePdfText(value).split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";

    words.forEach((word) => {
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });

    if (line) lines.push(line);
    return lines.length ? lines : [""];
  }

  function buildPdf(report) {
    const normalized = normalizeReport(report || {});
    const task = taskFromReport(normalized);
    const pages = [];
    const left = 48;
    const width = 516;
    const bottom = 52;
    let y = 744;
    let content = "";

    function newPage() {
      if (content) pages.push(content);
      content = "";
      y = 744;
    }

    function addText(value, options) {
      const opts = options || {};
      const size = opts.size || 10;
      const font = opts.bold ? "F2" : "F1";
      const x = left + (opts.indent || 0);
      const lineHeight = opts.lineHeight || Math.round(size * 1.45);
      const maxChars = opts.maxChars || Math.max(28, Math.floor((width - (opts.indent || 0)) / (size * 0.52)));
      const lines = wrapText(value, maxChars);

      lines.forEach((line) => {
        if (y < bottom) newPage();
        content += `BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdfText(line)}) Tj ET\n`;
        y -= lineHeight;
      });

      if (opts.after) y -= opts.after;
    }

    function addSection(title) {
      y -= 4;
      addText(title, { size: 13, bold: true, after: 3 });
    }

    function addList(items, fallback) {
      const safeItems = Array.isArray(items) && items.length ? items : [fallback];
      safeItems.slice(0, 8).forEach((item) => addText(`- ${item}`, { size: 10, indent: 10 }));
    }

    addText("DayZero SkillRecord", { size: 22, bold: true, after: 5 });
    addText(`${normalized.user_name || currentUser().name} | ${normalized.user_role || currentUser().role}`, { size: 12, after: 10 });
    addText(`Simulation: ${task.title}`, { size: 11 });
    addText(`Company: ${task.company} | Role: ${task.role}`, { size: 11 });
    addText(`Assessment date: ${formatDate(normalized.submitted_at)} | Record ID: ${normalized.record_id}`, { size: 9, after: 12 });
    addText(`Overall score: ${Number(normalized.overall_score) || 0}/100`, { size: 18, bold: true, after: 10 });

    addSection("Assessment Summary");
    addText(normalized.summary || normalized.score_summary || "SkillRecord summary was not provided.", { size: 10, after: 8 });

    addSection("Verified Competencies");
    scoreEntries(normalized).slice(0, 10).forEach(([label, score]) => {
      addText(`${label}: ${score}/100`, { size: 10 });
    });

    addSection("Key Strengths");
    addList(normalized.strengths, "Simulation activity created a work-readiness signal.");

    addSection("Growth Areas");
    addList(normalized.weaknesses || normalized.risks || normalized.improvement_plan, "Keep sharpening the final decision, evidence, and owner.");

    addSection("Next Steps");
    addList(normalized.next_steps || normalized.improvement_plan, "Run another simulation and practice a concise final handoff.");

    addSection("LinkedIn Post Draft");
    addText(linkedinPost(normalized), { size: 10, after: 8 });

    addSection("Public Record");
    addText(normalized.public_url || publicUrl(normalized), { size: 10 });

    if (content) pages.push(content);
    return serializePdf(pages);
  }

  function serializePdf(pageContents) {
    const objects = [];
    objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
    objects[2] = "";
    objects[3] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";
    objects[4] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>";

    const pageRefs = [];
    let nextRef = 5;
    pageContents.forEach((pageContent) => {
      const contentRef = nextRef++;
      const pageRef = nextRef++;
      objects[contentRef] = `<< /Length ${pageContent.length} >>\nstream\n${pageContent}endstream`;
      objects[pageRef] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentRef} 0 R >>`;
      pageRefs.push(pageRef);
    });

    objects[2] = `<< /Type /Pages /Count ${pageRefs.length} /Kids [${pageRefs.map((ref) => `${ref} 0 R`).join(" ")}] >>`;

    let pdf = "%PDF-1.4\n";
    const offsets = [0];
    for (let index = 1; index < objects.length; index += 1) {
      offsets[index] = pdf.length;
      pdf += `${index} 0 obj\n${objects[index]}\nendobj\n`;
    }

    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
    for (let index = 1; index < objects.length; index += 1) {
      pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return pdf;
  }

  function formatDate(value) {
    const date = value ? new Date(value) : new Date();
    if (Number.isNaN(date.getTime())) return "Pending";
    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  }

  function downloadPdf(report) {
    const normalized = normalizeReport(report || latest() || {});
    const blob = new Blob([buildPdf(normalized)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const task = taskFromReport(normalized);
    anchor.href = url;
    anchor.download = `${slugify(task.title)}-skillrecord.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    return normalized;
  }

  window.DayZeroSkillRecords = {
    currentUser,
    list,
    latest,
    store,
    normalizeReport,
    publicUrl,
    linkedinPost,
    openLinkedInPost,
    downloadPdf,
    scoreEntries,
    slugify,
  };
})();
