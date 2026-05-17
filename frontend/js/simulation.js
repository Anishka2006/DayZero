const API_BASE_URL = localStorage.getItem("dayzero_api_base") || "http://127.0.0.1:5000";
const WORKSPACE_FILES_MODULE_PATH = "../../../workspaceFiles.js";

const STORAGE_KEYS = {
  selectedMission: "dayzeroSelectedMissionKey",
  dashboardTask: "dayzero_task_id",
  selectedTaskDetails: "dayzero_selected_task_details",
  sessionPrefix: "dayzeroSimulationSession::",
  workspacePrefix: "dayzeroWorkspaceState::",
  timelinePrefix: "dayzeroTimelineState::",
  report: "lastEvaluationReport",
};

let workspaceFilesModulePromise = null;

const TEAMS = {
  northstar: [
    { name: "Asha", title: "Product Manager", kind: "pm" },
    { name: "Ravi", title: "Engineering Lead", kind: "eng" },
    { name: "Mira", title: "Product Designer", kind: "design" },
    { name: "Kenji", title: "QA Engineer", kind: "qa" },
  ],
  incident: [
    { name: "Asha", title: "Incident Commander", kind: "pm" },
    { name: "Ravi", title: "Engineering Lead", kind: "eng" },
    { name: "Mira", title: "Customer Experience", kind: "design" },
    { name: "Kenji", title: "Security QA", kind: "qa" },
  ],
  ops: [
    { name: "Asha", title: "Product Manager", kind: "pm" },
    { name: "Ravi", title: "Engineering Lead", kind: "eng" },
    { name: "Mira", title: "Product Designer", kind: "design" },
    { name: "Kenji", title: "QA Engineer", kind: "qa" },
  ],
  ai: [
    { name: "Asha", title: "AI Product Lead", kind: "pm" },
    { name: "Ravi", title: "Engineering Lead", kind: "eng" },
    { name: "Mira", title: "Trust Designer", kind: "design" },
    { name: "Kenji", title: "Safety QA", kind: "qa" },
  ],
  netflix: [
    { name: "Asha", title: "Incident Commander", kind: "pm" },
    { name: "Ravi", title: "Engineering Lead", kind: "eng" },
    { name: "Mira", title: "Customer Experience", kind: "design" },
    { name: "Kenji", title: "QA Engineer", kind: "qa" },
  ],
  linkedin: [
    { name: "Asha", title: "Product Manager", kind: "pm" },
    { name: "Ravi", title: "Engineering Lead", kind: "eng" },
    { name: "Mira", title: "Product Designer", kind: "design" },
    { name: "Kenji", title: "QA Engineer", kind: "qa" },
  ],
  spotify: [
    { name: "Asha", title: "Product Manager", kind: "pm" },
    { name: "Ravi", title: "Data Engineering Lead", kind: "eng" },
    { name: "Mira", title: "Product Designer", kind: "design" },
    { name: "Kenji", title: "QA Engineer", kind: "qa" },
  ],
  openai: [
    { name: "Asha", title: "Incident Commander", kind: "pm" },
    { name: "Ravi", title: "Security Engineering Lead", kind: "eng" },
    { name: "Mira", title: "Trust Designer", kind: "design" },
    { name: "Kenji", title: "Security QA", kind: "qa" },
  ],
};

const MISSIONS = {
  mobile: {
    key: "mobile",
    taskId: "mobile-onboarding",
    channel: "launch-otp",
    company: "Northstar Pay",
    sprint: "Sprint - Demo Day -2",
    role: "Product + Full Stack",
    priority: "Critical",
    deadlineMinutes: 30,
    headline: "Ship the OTP onboarding before the investor demo.",
    summary: "A broken resend path, unclear loading states, and mismatched OTP validation are putting the demo at risk.",
    output: "Ship-ready response plan",
    crisisStatus: "OTP failures active",
    latestChange: "OTP API now returns success, message, and retryAfter, but resend still behaves inconsistently under load.",
    workspaceTitle: "Northstar Pay shared workspace",
    workspaceHelper: "Edit the OTP flow, tighten the plan, and tell the room exactly what you changed.",
    workspaceTip: "Tip: update the file, then tell Asha or Ravi exactly what changed before you submit.",
    requirements: [
      "Prevent invalid OTP submissions",
      "Add deliberate loading and retry states",
      "Keep the first demo path stable on mobile",
    ],
    acceptance: [
      "The resend flow survives a slow connection",
      "The user always sees a clear state after tapping",
      "The demo path feels stable on the first try",
    ],
    teammates: TEAMS.northstar,
    introMessages: [
      { speaker_name: "Asha", speaker_title: "Product Manager", message: "Demo is in 30 minutes. We need OTP stable before leadership jumps in." },
      { speaker_name: "Ravi", speaker_title: "Engineering Lead", message: "Verify returns success, message, and retryAfter now, but resend still gets weird under load." },
      { speaker_name: "Mira", speaker_title: "Product Designer", message: "The loading state still looks stuck. If the UI hesitates, the demo feels broken." },
      { speaker_name: "Kenji", speaker_title: "QA Engineer", message: "Wrong OTP length still gets through on one resend path. I would not call this safe yet." },
    ],
    quickPrompts: [
      "Asha, what decision do you need from me right now?",
      "Ravi, what exactly is failing in resend?",
      "Kenji, what path is still broken on mobile?",
      "Mira, what is the minimum UI fix for the demo?",
    ],
    crisisPrompt: "Leadership just moved the rehearsal earlier. Do you want the room to absorb that pressure spike now?",
    pressureBeats: [
      {
        id: "mobile-scope",
        trigger: "first-message",
        crisis: "Scope decision needed",
        update: "Asha wants a clear call: reliability first, or visual polish first?",
        messages: [
          { speaker_name: "Asha", speaker_title: "Product Manager", message: "We do not have time for broad fixes. Are we protecting reliability first or still chasing polish?" },
          { speaker_name: "Leo", speaker_title: "Executive Sponsor", message: "I only care that the first-run path looks stable in front of the room." },
        ],
      },
      {
        id: "mobile-crisis",
        trigger: "manual-crisis",
        crisis: "Demo window tightened",
        update: "The rehearsal moved up. The room now needs the smallest stable path instead of a broad cleanup.",
        messages: [
          { speaker_name: "Leo", speaker_title: "Executive Sponsor", message: "Demo starts sooner than planned. Cut anything non-essential and give me the stable path." },
          { speaker_name: "Kenji", speaker_title: "QA Engineer", message: "Fine, then tell me the exact path we trust and the path we are punting." },
        ],
      },
      {
        id: "mobile-critique",
        trigger: "critique",
        crisis: "Final answer needs sharper tradeoffs",
        update: "The team wants a more explicit statement of what is fixed now versus intentionally deferred.",
        messages: [
          { speaker_name: "Asha", speaker_title: "Product Manager", message: "Your draft is close. I still want one line on what we are not fixing before demo." },
          { speaker_name: "Ravi", speaker_title: "Engineering Lead", message: "If you defer something, say it clearly so I do not build the wrong thing." },
        ],
      },
    ],
    workspaceFiles: [
      {
        id: "validate",
        name: "otp/validateOtp.ts",
        kind: "code",
        content: [
          "// Northstar Pay - OTP validation",
          "// FIXME: resend flow still trips this rule on the first retry.",
          "export function validateOtp(input: string): boolean {",
          "  const value = input.replace(/\\s+/g, \"\");",
          "  return /^\\d{4}$/.test(value);",
          "}",
        ].join("\n"),
      },
      {
        id: "resend",
        name: "otp/useResendTimer.ts",
        kind: "code",
        content: [
          "type ResendState = {",
          "  disabled: boolean;",
          "  secondsRemaining: number;",
          "};",
          "",
          "export function getResendState(retryAfter?: number): ResendState {",
          "  if (!retryAfter) {",
          "    return { disabled: false, secondsRemaining: 0 };",
          "  }",
          "",
          "  return {",
          "    disabled: retryAfter > 0,",
          "    secondsRemaining: retryAfter,",
          "  };",
          "}",
        ].join("\n"),
      },
      {
        id: "screen",
        name: "otp/OtpScreen.tsx",
        kind: "code",
        content: [
          "export const otpStates = {",
          "  idle: \"Enter the verification code\",",
          "  loading: \"Verifying...\",",
          "  retry: \"Resend code\",",
          "  error: \"Code failed. Try again.\",",
          "};",
          "",
          "// TODO: disable resend while loading and while retryAfter is active.",
          "// TODO: show a clearer inline message when the code is the wrong length.",
        ].join("\n"),
      },
    ],
  },
  security: {
    key: "security",
    taskId: "security-control-center",
    channel: "security-bridge",
    company: "Acme Cloud",
    sprint: "Incident - Release Window",
    role: "Backend + Incident Response",
    priority: "Critical",
    deadlineMinutes: 20,
    headline: "Make the patch call before the security review starts.",
    summary: "The exploit path is real, audit confidence is thin, and the room needs a precise go or no-go recommendation.",
    output: "Incident decision brief",
    crisisStatus: "Exploit path confirmed",
    latestChange: "Compliance now wants rollback language and audit proof before approving the release recommendation.",
    workspaceTitle: "Acme Cloud incident workspace",
    workspaceHelper: "Narrow the patch, define rollback, and write language the room can actually ship with confidence.",
    workspaceTip: "Tip: if you change the patch path, tell Ravi and Kenji what evidence closes the risk.",
    requirements: [
      "Constrain the patch scope",
      "Define rollback and monitoring",
      "Prepare a customer-safe update",
    ],
    acceptance: [
      "Patch recommendation feels safe enough to ship",
      "Rollback trigger is explicit",
      "The room can explain audit confidence",
    ],
    teammates: TEAMS.incident,
    introMessages: [
      { speaker_name: "Asha", speaker_title: "Incident Commander", message: "Security review starts in a few minutes. Keep this room sharp." },
      { speaker_name: "Ravi", speaker_title: "Engineering Lead", message: "I can patch fast, but I need the smallest safe change before we touch prod." },
      { speaker_name: "Mira", speaker_title: "Customer Experience", message: "If our customer message sounds slippery, people will think we are hiding something." },
      { speaker_name: "Kenji", speaker_title: "Security QA", message: "Audit proof is still thin. I am pushing back if verification stays vague." },
    ],
    quickPrompts: [
      "Asha, what is the safest decision path right now?",
      "Ravi, what is the minimum patch we can trust?",
      "Kenji, what evidence is missing before ship?",
      "Mira, how careful does the customer update need to be?",
    ],
    crisisPrompt: "Customer success just asked for a public-facing update before the review. Do you want that pressure in the room now?",
    pressureBeats: [
      {
        id: "security-first",
        trigger: "first-message",
        crisis: "Customer pressure rising",
        update: "Customer success wants language now, even though the patch path is still being debated.",
        messages: [
          { speaker_name: "Asha", speaker_title: "Incident Commander", message: "I need language we can send without overpromising. Keep it tight." },
          { speaker_name: "Leo", speaker_title: "VP Security", message: "If you say we are shipping, I want rollback and monitoring in the same sentence." },
        ],
      },
      {
        id: "security-crisis",
        trigger: "manual-crisis",
        crisis: "Executive review starting",
        update: "Leadership is entering the bridge now. The room needs a firm go or no-go recommendation.",
        messages: [
          { speaker_name: "Leo", speaker_title: "VP Security", message: "No hedging. I need a clear recommendation with business impact." },
          { speaker_name: "Kenji", speaker_title: "Security QA", message: "Then the proof needs to be just as clear. A vague rollback story is still a no from me." },
        ],
      },
      {
        id: "security-critique",
        trigger: "critique",
        crisis: "Recommendation still too broad",
        update: "The room wants the patch scope and rollback trigger expressed more precisely.",
        messages: [
          { speaker_name: "Ravi", speaker_title: "Engineering Lead", message: "Tell me what behavior changes and what stays untouched. That is the line between a safe patch and a rewrite." },
          { speaker_name: "Asha", speaker_title: "Incident Commander", message: "Good. Now make the recommendation sharp enough that leadership can repeat it." },
        ],
      },
    ],
    workspaceFiles: [
      {
        id: "patch",
        name: "patch/applyHotfix.ts",
        kind: "code",
        content: [
          "export async function applyHotfix(userId: string, token: string) {",
          "  // TODO: narrow the patch to the exploit path only.",
          "  return fetch(\"/api/security/hotfix\", {",
          "    method: \"POST\",",
          "    headers: { \"Content-Type\": \"application/json\" },",
          "    body: JSON.stringify({ userId, token }),",
          "  });",
          "}",
        ].join("\n"),
      },
      {
        id: "rollback",
        name: "patch/rollbackPlan.md",
        kind: "brief",
        content: [
          "# Rollback plan",
          "",
          "1. Trigger rollback when:",
          "-",
          "",
          "2. Data or logging checks:",
          "-",
          "",
          "3. Customer-safe status line:",
          "-",
        ].join("\n"),
      },
      {
        id: "status",
        name: "patch/customerStatus.ts",
        kind: "code",
        content: [
          "export const customerStatus = {",
          "  headline: \"We are investigating a security issue.\",",
          "  detail: \"Some customers may see temporary restrictions while we validate the fix.\",",
          "  nextUpdateMins: 30,",
          "};",
        ].join("\n"),
      },
    ],
  },
  ops: {
    key: "ops",
    taskId: "ops-analytics-dashboard",
    channel: "ops-v1",
    company: "Orbit Ops",
    sprint: "Board Review - Sprint 1",
    role: "Product Delivery Lead",
    priority: "High",
    deadlineMinutes: 40,
    headline: "Pick a believable V1 dashboard before the board review.",
    summary: "Leadership keeps pushing for one dashboard for everyone, but the team needs a narrow launch story tied to a real operator.",
    output: "Dashboard launch brief",
    crisisStatus: "Scope drifting",
    latestChange: "One core exception metric updates slower than leadership expects, so trust and freshness need to be explicit.",
    workspaceTitle: "Orbit Ops product workspace",
    workspaceHelper: "Choose the first user, protect trust around stale data, and keep the launch painfully focused.",
    workspaceTip: "Tip: if you narrow the V1, tell Asha and Mira which modules you are cutting on purpose.",
    requirements: [
      "Choose the first operator this serves",
      "Define only essential V1 modules",
      "Protect trust around stale or missing data",
    ],
    acceptance: [
      "V1 feels actionable instead of broad",
      "User and decision are explicit",
      "Launch metric is believable",
    ],
    teammates: TEAMS.ops,
    introMessages: [
      { speaker_name: "Asha", speaker_title: "Product Manager", message: "We only have one sprint. I need a V1 an ops lead would actually use every morning." },
      { speaker_name: "Ravi", speaker_title: "Engineering Lead", message: "Before we promise insight, we need to be honest about stale and missing data." },
      { speaker_name: "Mira", speaker_title: "Product Designer", message: "Do not turn this into generic BI. Exceptions should be obvious right away." },
      { speaker_name: "Kenji", speaker_title: "QA Engineer", message: "If stale data looks authoritative, trust dies on day one." },
    ],
    quickPrompts: [
      "Asha, who is the first operator we are serving?",
      "Ravi, what data promise can we keep in V1?",
      "Mira, what belongs above the fold?",
      "Kenji, what trust failure worries you most?",
    ],
    crisisPrompt: "Leadership is still asking for one dashboard for operators and executives. Pull that conflict into the room now?",
    pressureBeats: [
      {
        id: "ops-first",
        trigger: "first-message",
        crisis: "Scope fight live",
        update: "Leadership is still trying to turn the launch into one dashboard for everyone.",
        messages: [
          { speaker_name: "Asha", speaker_title: "Product Manager", message: "If you do not narrow this now, we will build for everyone and help nobody." },
          { speaker_name: "Leo", speaker_title: "Operations VP", message: "I want one screen that can survive the board review and the morning standup." },
        ],
      },
      {
        id: "ops-crisis",
        trigger: "manual-crisis",
        crisis: "Board review tightened",
        update: "Leadership now wants only the first user, first modules, and first success metric.",
        messages: [
          { speaker_name: "Leo", speaker_title: "Operations VP", message: "Strip this down. First user, first modules, first success metric. Nothing extra." },
          { speaker_name: "Mira", speaker_title: "Product Designer", message: "Good. If it still feels broad after that, it is not ready." },
        ],
      },
      {
        id: "ops-critique",
        trigger: "critique",
        crisis: "Data trust still fuzzy",
        update: "The team wants clearer language about stale states and what the launch metric actually measures.",
        messages: [
          { speaker_name: "Kenji", speaker_title: "QA Engineer", message: "If the stale state is not obvious, the launch metric will look better than the real trust level." },
          { speaker_name: "Ravi", speaker_title: "Engineering Lead", message: "Say exactly which metric is less fresh than the room expects. That honesty matters." },
        ],
      },
    ],
    workspaceFiles: [
      {
        id: "user",
        name: "dashboard/firstUser.md",
        kind: "brief",
        content: [
          "# First user",
          "",
          "- Candidate user:",
          "- Daily decision they need to make:",
          "- What they should never need from V1:",
        ].join("\n"),
      },
      {
        id: "freshness",
        name: "dashboard/freshness.ts",
        kind: "code",
        content: [
          "export const freshnessPolicy = {",
          "  criticalExceptions: \"real-time\",",
          "  laborHealth: \"15 mins\",",
          "  fulfillmentDrift: \"30 mins\",",
          "  staleBannerRequired: false,",
          "};",
        ].join("\n"),
      },
      {
        id: "layout",
        name: "dashboard/OpsOverview.tsx",
        kind: "code",
        content: [
          "export const modules = [",
          "  \"volume summary\",",
          "  \"exceptions board\",",
          "  \"shift comparison\",",
          "  \"executive KPI ribbon\",",
          "];",
          "",
          "// TODO: reduce this to the smallest V1 for the first operator.",
        ].join("\n"),
      },
    ],
  },
  wallet: {
    key: "wallet",
    taskId: "wallet-outage",
    channel: "payout-war-room",
    company: "Pulse Wallet",
    sprint: "Incident - Payroll Cut-off",
    role: "Platform Incident Lead",
    priority: "Critical",
    deadlineMinutes: 24,
    headline: "Contain the payout outage before payroll cut-off.",
    summary: "Duplicate retries are creating real customer risk, support needs language now, and reconciliation will get uglier if the fix is sloppy.",
    output: "Incident containment plan",
    crisisStatus: "Duplicate payouts detected",
    latestChange: "The team confirmed the duplicate path is on retry, not initial payout, which changes where the guardrail belongs.",
    workspaceTitle: "Pulse Wallet incident workspace",
    workspaceHelper: "Stop the duplicate path, define the lockout behavior, and leave support with language they can trust.",
    workspaceTip: "Tip: if you tighten retry behavior, tell Ravi and Kenji how reconciliation stays safe afterward.",
    requirements: [
      "Stop duplicate payout retries safely",
      "Define the customer-facing fallback",
      "Protect reconciliation after the cut-off window",
    ],
    acceptance: [
      "Duplicate charge path is contained",
      "Support has a clear script",
      "Rollback and reconciliation are explicit",
    ],
    teammates: TEAMS.incident,
    introMessages: [
      { speaker_name: "Asha", speaker_title: "Incident Commander", message: "Payroll cut-off is in 24 minutes. We need a plan support can repeat word for word." },
      { speaker_name: "Ravi", speaker_title: "Engineering Lead", message: "The idempotency gap is on retry, not the first payout. If we touch the wrong layer, recon gets worse." },
      { speaker_name: "Mira", speaker_title: "Customer Experience", message: "The current banner sounds like a delay, not a duplicate charge risk. It is too soft." },
      { speaker_name: "Kenji", speaker_title: "Security QA", message: "I can still reproduce duplicates when someone retries after a timeout. We need a safer lockout plan." },
    ],
    quickPrompts: [
      "Asha, what is the smallest safe containment plan?",
      "Ravi, where should the retry guard actually live?",
      "Kenji, what path still reproduces duplicates?",
      "Mira, how honest does the banner need to be?",
    ],
    crisisPrompt: "Support just reported executive escalation from payroll customers. Bring that into the room now?",
    pressureBeats: [
      {
        id: "wallet-first",
        trigger: "first-message",
        crisis: "Support escalation active",
        update: "Support needs language immediately, even though engineering is still narrowing the retry fix.",
        messages: [
          { speaker_name: "Leo", speaker_title: "VP Security", message: "Support will not survive another vague update. Give me clear customer language now." },
          { speaker_name: "Asha", speaker_title: "Incident Commander", message: "And keep it tied to the real containment plan, not some future perfect fix." },
        ],
      },
      {
        id: "wallet-crisis",
        trigger: "manual-crisis",
        crisis: "Payroll cut-off pulled forward",
        update: "The room now has even less time, so the containment path must be smaller and more operationally crisp.",
        messages: [
          { speaker_name: "Leo", speaker_title: "VP Security", message: "Cut-off moved up. No broad fix. Contain the duplicate path and protect the ledger." },
          { speaker_name: "Kenji", speaker_title: "Security QA", message: "Then say exactly what users can still do safely after the lockout hits." },
        ],
      },
      {
        id: "wallet-critique",
        trigger: "critique",
        crisis: "Containment still too vague",
        update: "The room wants a firmer line between immediate lockout behavior and later reconciliation cleanup.",
        messages: [
          { speaker_name: "Ravi", speaker_title: "Engineering Lead", message: "Separate the retry guard from the recon cleanup. If you blend them, ops will get confused." },
          { speaker_name: "Asha", speaker_title: "Incident Commander", message: "Yes. One move for right now, one move for after payroll cut-off." },
        ],
      },
    ],
    workspaceFiles: [
      {
        id: "guard",
        name: "payout/retryGuard.ts",
        kind: "code",
        content: [
          "export function allowRetry({",
          "  timedOut,",
          "  previousAttemptId,",
          "}: {",
          "  timedOut: boolean;",
          "  previousAttemptId?: string;",
          "}): boolean {",
          "  if (!timedOut) return true;",
          "  return !previousAttemptId;",
          "}",
        ].join("\n"),
      },
      {
        id: "recon",
        name: "payout/reconciliation.md",
        kind: "brief",
        content: [
          "# Reconciliation notes",
          "",
          "- Immediate lockout behavior:",
          "- Ledger verification after cut-off:",
          "- Support callback rule:",
        ].join("\n"),
      },
      {
        id: "banner",
        name: "payout/StatusBanner.tsx",
        kind: "code",
        content: [
          "export const payoutBanner = {",
          "  title: \"Payout may be delayed\",",
          "  detail: \"If your transfer has not arrived, please retry in a moment.\",",
          "};",
        ].join("\n"),
      },
    ],
  },
  copilot: {
    key: "copilot",
    taskId: "copilot-trust",
    channel: "copilot-trust",
    company: "Helio Health",
    sprint: "Pilot Launch - Safety Review",
    role: "AI Product Lead",
    priority: "High",
    deadlineMinutes: 35,
    headline: "Reduce hallucination risk before the pilot customer sees the copilot.",
    summary: "The assistant still invents actions when retrieval is empty, and the team needs a narrower launch story that does not look reckless.",
    output: "Trust recovery plan",
    crisisStatus: "Hallucination risk active",
    latestChange: "Retrieval sometimes returns nothing, but the current fallback still lets the assistant answer with confidence.",
    workspaceTitle: "Helio Health AI workspace",
    workspaceHelper: "Tighten guardrails, make confidence visible, and reduce the launch scope to something you can defend.",
    workspaceTip: "Tip: if the model should refuse, tell Asha and Kenji exactly what the fallback experience becomes.",
    requirements: [
      "Reduce unsafe assistant behavior",
      "Clarify confidence and fallback states",
      "Define the smallest trustworthy launch scope",
    ],
    acceptance: [
      "Unsafe suggestions are constrained",
      "Users can tell what the assistant knows",
      "The demo story stays credible",
    ],
    teammates: TEAMS.ai,
    introMessages: [
      { speaker_name: "Asha", speaker_title: "AI Product Lead", message: "We cannot demo a copilot that sounds sure when it is wrong. I need the smallest trustworthy launch path." },
      { speaker_name: "Ravi", speaker_title: "Engineering Lead", message: "Retrieval sometimes comes back empty, and the fallback still lets the model answer anyway." },
      { speaker_name: "Mira", speaker_title: "Trust Designer", message: "The confidence cues are muddy. People cannot tell if the assistant knows or is guessing." },
      { speaker_name: "Kenji", speaker_title: "Safety QA", message: "I can force the unsafe path with a vague prompt in under a minute. We need a stronger refusal flow." },
    ],
    quickPrompts: [
      "Asha, what scope is still launch-safe?",
      "Ravi, what happens when retrieval returns nothing?",
      "Kenji, what unsafe path still reproduces?",
      "Mira, how should confidence be shown to the user?",
    ],
    crisisPrompt: "The pilot sponsor wants to keep the flashy features even if confidence is low. Pull that tension into the room now?",
    pressureBeats: [
      {
        id: "copilot-first",
        trigger: "first-message",
        crisis: "Trust versus ambition",
        update: "The room is split between showing a broader feature set and shrinking to a safer launch story.",
        messages: [
          { speaker_name: "Leo", speaker_title: "Pilot Sponsor", message: "I do not want the pilot to feel watered down, but I also do not want a trust mess on day one." },
          { speaker_name: "Asha", speaker_title: "AI Product Lead", message: "Then we need scope discipline, not optimism. Help me make that case." },
        ],
      },
      {
        id: "copilot-crisis",
        trigger: "manual-crisis",
        crisis: "Safety review starting",
        update: "Leadership wants a crisp explanation of what the assistant will refuse, what it will answer, and what it will escalate to humans.",
        messages: [
          { speaker_name: "Kenji", speaker_title: "Safety QA", message: "Good. The refusal rule needs to be just as real as the happy path." },
          { speaker_name: "Leo", speaker_title: "Pilot Sponsor", message: "And make sure the human fallback feels intentional, not broken." },
        ],
      },
      {
        id: "copilot-critique",
        trigger: "critique",
        crisis: "Guardrail path still underspecified",
        update: "The team wants a sharper line between grounded answers, low-confidence answers, and refusal behavior.",
        messages: [
          { speaker_name: "Mira", speaker_title: "Trust Designer", message: "If the assistant is unsure, the UI should say that plainly and show the next safe step." },
          { speaker_name: "Ravi", speaker_title: "Engineering Lead", message: "And if retrieval is empty, do not give the model room to improvise." },
        ],
      },
    ],
    workspaceFiles: [
      {
        id: "guardrails",
        name: "copilot/guardrails.ts",
        kind: "code",
        content: [
          "export function canAnswer(retrievalCount: number, confidence: number): boolean {",
          "  if (confidence > 0.55) {",
          "    return true;",
          "  }",
          "  return retrievalCount >= 0;",
          "}",
        ].join("\n"),
      },
      {
        id: "policy",
        name: "copilot/promptPolicy.md",
        kind: "brief",
        content: [
          "# Prompt policy",
          "",
          "- When retrieval is empty:",
          "- When confidence is low:",
          "- When to escalate to a human:",
        ].join("\n"),
      },
      {
        id: "review",
        name: "copilot/ReviewPanel.tsx",
        kind: "code",
        content: [
          "export const assistantState = {",
          "  grounded: \"Answer ready\",",
          "  warning: \"Response may be incomplete\",",
          "  fallback: \"Contact your care team\",",
          "};",
          "",
          "// TODO: make the low-confidence state more explicit and safer.",
        ].join("\n"),
      },
    ],
  },
  migration: {
    key: "migration",
    taskId: "data-migration-freeze",
    channel: "cutover-freeze",
    company: "Atlas Commerce",
    sprint: "Release Freeze - Cutover Night",
    role: "Release Manager",
    priority: "Critical",
    deadlineMinutes: 28,
    headline: "Define the cutover and rollback path before the migration window closes.",
    summary: "Ops is nervous about stale reads during the switch, and the room needs a cutover sequence that sounds executable, not theoretical.",
    output: "Cutover decision brief",
    crisisStatus: "Cutover freeze approaching",
    latestChange: "Engineering confirmed the riskiest moment is stale reads during the switch, not the dual-write setup itself.",
    workspaceTitle: "Atlas Commerce migration workspace",
    workspaceHelper: "Clarify the cutover order, write the rollback trigger, and make customer impact easy to explain.",
    workspaceTip: "Tip: if you adjust cutover order, tell Ravi and Kenji how you verify data integrity before opening traffic.",
    requirements: [
      "Define the cutover order",
      "Protect rollback and data integrity",
      "Explain customer impact clearly",
    ],
    acceptance: [
      "Rollback path is believable",
      "Data loss risk is named and bounded",
      "Ops can execute the brief without guessing",
    ],
    teammates: TEAMS.incident,
    introMessages: [
      { speaker_name: "Asha", speaker_title: "Incident Commander", message: "We are too close to cutover for fuzzy language. I need the sequence, the freeze, and the rollback line." },
      { speaker_name: "Ravi", speaker_title: "Engineering Lead", message: "Dual writes are not the scary part. The risky moment is stale reads during the switch." },
      { speaker_name: "Mira", speaker_title: "Customer Experience", message: "If customers see a half-migrated state with no explanation, trust drops fast." },
      { speaker_name: "Kenji", speaker_title: "Security QA", message: "I want the rollback trigger written before anyone calls this safe. We cannot improvise during cutover." },
    ],
    quickPrompts: [
      "Asha, what must the final cutover brief include?",
      "Ravi, what is the riskiest cutover moment?",
      "Kenji, what validation must happen before traffic opens?",
      "Mira, what customer-visible state is acceptable during the switch?",
    ],
    crisisPrompt: "The cutover window may close early if ops loses confidence. Pull that pressure into the room now?",
    pressureBeats: [
      {
        id: "migration-first",
        trigger: "first-message",
        crisis: "Ops confidence dropping",
        update: "The room needs a more operationally explicit cutover order before ops will approve the migration.",
        messages: [
          { speaker_name: "Leo", speaker_title: "VP Security", message: "Ops is not pushing back on the idea. They are pushing back on vague sequencing. Fix that." },
          { speaker_name: "Asha", speaker_title: "Incident Commander", message: "Exactly. Give me the order, not a migration lecture." },
        ],
      },
      {
        id: "migration-crisis",
        trigger: "manual-crisis",
        crisis: "Window may close early",
        update: "If the room cannot state rollback and reopen conditions clearly, the migration window will be cancelled.",
        messages: [
          { speaker_name: "Kenji", speaker_title: "Security QA", message: "Then the rollback trigger has to be painfully clear. This is not the moment for hopeful wording." },
          { speaker_name: "Ravi", speaker_title: "Engineering Lead", message: "And make the reopen condition just as clear or ops will hold the gate all night." },
        ],
      },
      {
        id: "migration-critique",
        trigger: "critique",
        crisis: "Cutover brief still missing reopen logic",
        update: "The team wants a clearer definition of when traffic reopens after the switch and what data integrity checks prove it.",
        messages: [
          { speaker_name: "Asha", speaker_title: "Incident Commander", message: "Good start. Now tell me what must be true before traffic reopens." },
          { speaker_name: "Kenji", speaker_title: "Security QA", message: "And if any one of those checks fails, say who calls rollback and how fast it happens." },
        ],
      },
    ],
    workspaceFiles: [
      {
        id: "cutover",
        name: "migration/cutoverPlan.md",
        kind: "brief",
        content: [
          "# Cutover sequence",
          "",
          "1. Freeze writes:",
          "2. Validate replication:",
          "3. Switch reads:",
          "4. Reopen traffic when:",
        ].join("\n"),
      },
      {
        id: "rollback",
        name: "migration/rollback.sql",
        kind: "code",
        content: [
          "-- TODO: define the rollback order and integrity checks",
          "BEGIN;",
          "UPDATE rollout_state SET traffic_mode = 'legacy';",
          "-- validate read pointers before commit",
          "COMMIT;",
        ].join("\n"),
      },
      {
        id: "status",
        name: "migration/StatusPage.tsx",
        kind: "code",
        content: [
          "export const migrationStatus = {",
          "  headline: \"Scheduled maintenance in progress\",",
          "  detail: \"You may notice brief delays while we complete the data migration.\",",
          "};",
        ].join("\n"),
      },
    ],
  },
  netflix: {
    key: "netflix",
    taskId: "netflix-reco-outage",
    channel: "streaming-war-room",
    company: "Netflix",
    sprint: "Peak Traffic Incident",
    role: "Backend Engineer / Incident Commander",
    priority: "P0 Critical",
    deadlineMinutes: 30,
    headline: "Contain recommendation deployment failures during peak streaming traffic.",
    summary: "A recommendation engine deployment caused streaming failures, partial rollback failure, rising complaints, and overloaded servers.",
    output: "Incident command plan with code and rollback decision",
    crisisStatus: "Streaming failures increasing",
    latestChange: "Rollback is only 41% complete in EU-West, cache misses are spiking, and leadership wants a credible ETA.",
    workspaceTitle: "Netflix incident workspace",
    workspaceHelper: "Investigate logs, edit the recommendation service or cache layer, coordinate the room, and make the rollback decision.",
    workspaceTip: "Tip: combine code changes with a short war-room update: impact, decision, owner, ETA, and risk.",
    requirements: [
      "Investigate logs and metrics before declaring root cause",
      "Prioritize rollback or mitigation under peak traffic",
      "Coordinate engineering, QA, product, and leadership updates",
      "Patch risky retry/cache behavior in production-style code",
    ],
    acceptance: [
      "ETA and customer impact are explicit",
      "Rollback failure in EU is addressed",
      "Code or config change reduces overload risk",
      "Teammates understand owners and next checks",
    ],
    teammates: TEAMS.netflix,
    introMessages: [
      { speaker_name: "Maya", speaker_title: "Stressed Incident PM", message: "We are at peak traffic, failures are rising, and socials are already turning. I need impact, ETA, and what we are doing in the next five minutes." },
      { speaker_name: "Dante", speaker_title: "Blunt Streaming Platform Lead", message: "Rollback is not clean. EU-West is stuck on mixed pods and the recommendation service is hammering cache on retries. Do not say rollback is done." },
      { speaker_name: "Priya", speaker_title: "Risk-averse QA Lead", message: "I am blocking any all-clear until we prove playback success recovered by region and cache eviction stopped thrashing." },
      { speaker_name: "Elena", speaker_title: "Detail-focused Playback UX Lead", message: "Customer messaging needs to be honest. People are seeing titles load, then playback fail. That feels worse than a clean outage banner." },
      { speaker_name: "Reed", speaker_title: "Executive Sponsor", message: "I joined because the complaint curve is now visible externally. Give me a decision and a real ETA, not optimism." },
    ],
    quickPrompts: [
      "Dante, what evidence points to recommendation_service versus playback?",
      "Priya, what check would unblock rollback confidence?",
      "Maya, what update does leadership need in one sentence?",
      "Elena, what should customer-facing messaging say right now?",
    ],
    crisisPrompt: "CEO joined war room and asks why rollback is failing in EU. Bring that pressure into the room now?",
    pressureBeats: [
      {
        id: "netflix-first-message",
        trigger: "first-message",
        crisis: "Customer complaints increased 28%",
        update: "Social media complaints jumped while rollback remains partial in EU-West.",
        messages: [
          { speaker_name: "Maya", speaker_title: "Stressed Incident PM", message: "Complaints are up 28% in ten minutes. If we do not give leadership an ETA now, they will make the call for us." },
          { speaker_name: "Dante", speaker_title: "Blunt Streaming Platform Lead", message: "Then make the call based on data: cache failure rate, rollback completion, playback starts. Not vibes." },
        ],
      },
      {
        id: "netflix-manual-crisis",
        trigger: "manual-crisis",
        crisis: "Rollback failed in EU region",
        update: "EU-West deployment controller reports mixed recommendation pods and overloaded cache shards.",
        messages: [
          { speaker_name: "Reed", speaker_title: "Executive Sponsor", message: "CEO is in the war room. Why is EU rollback failing, and who owns the next action?" },
          { speaker_name: "Priya", speaker_title: "Risk-averse QA Lead", message: "Do not call it mitigated until EU playback success and cache error rate recover together." },
        ],
      },
      {
        id: "netflix-draft",
        trigger: "draft-80",
        crisis: "Servers overloaded",
        update: "Autoscaling is lagging because retry storms are increasing load faster than capacity is coming online.",
        messages: [
          { speaker_name: "Dante", speaker_title: "Blunt Streaming Platform Lead", message: "Your draft is moving, but retries are still too aggressive. We need circuit breaking or cache backoff, not another paragraph." },
          { speaker_name: "Maya", speaker_title: "Stressed Incident PM", message: "Translate the technical fix into a customer ETA. Leadership will ask again in two minutes." },
        ],
      },
      {
        id: "netflix-critique",
        trigger: "critique",
        crisis: "ETA still not credible",
        update: "The room needs a region-by-region recovery check and a clear rollback owner.",
        messages: [
          { speaker_name: "Priya", speaker_title: "Risk-averse QA Lead", message: "Name the validation gates: playback starts, cache hit rate, error budget burn, and affected regions." },
          { speaker_name: "Reed", speaker_title: "Executive Sponsor", message: "I can carry bad news. I cannot carry a vague ETA." },
        ],
      },
    ],
    workspaceFiles: [
      { id: "incident-report", name: "incident_report.md", kind: "brief", content: buildNetflixIncidentReport() },
      { id: "server-logs", name: "server_logs.txt", kind: "logs", content: buildNetflixServerLogs() },
      { id: "recommendation-service", name: "recommendation_service.py", kind: "code", content: buildNetflixRecommendationService() },
      { id: "cache-layer", name: "cache_layer.py", kind: "code", content: buildNetflixCacheLayer() },
      { id: "deployment-changes", name: "deployment_changes.md", kind: "brief", content: buildNetflixDeploymentChanges() },
      { id: "leadership-chat", name: "leadership_chat.json", kind: "json", content: buildNetflixLeadershipChat() },
      { id: "live-metrics", name: "live_metrics.png", kind: "image", content: buildNetflixLiveMetricsPreview() },
    ],
  },
  linkedin: {
    key: "linkedin",
    taskId: "linkedin-ai-resume-launch",
    channel: "resume-assistant-launch",
    company: "LinkedIn",
    sprint: "Launch Readiness - T-1 Day",
    role: "Product Manager / Full Stack Engineer",
    priority: "P0 Launch Risk",
    deadlineMinutes: 35,
    headline: "Decide whether the AI Resume Assistant can launch tomorrow.",
    summary: "Leadership publicly promised the launch before engineering completed development; AI quality, onboarding, mobile UI, and QA blockers remain unresolved.",
    output: "Launch readiness decision with product and code changes",
    crisisStatus: "QA blockers unresolved",
    latestChange: "Marketing scheduled press for tomorrow morning while mobile preview and AI consistency remain unstable.",
    workspaceTitle: "LinkedIn launch workspace",
    workspaceHelper: "Triage launch blockers, edit the AI service or preview component, and coordinate a go/no-go recommendation.",
    workspaceTip: "Tip: make a launch call, then tell engineering, QA, and leadership what ships, what is blocked, and what gets cut.",
    requirements: [
      "Investigate inconsistent AI output and onboarding gaps",
      "Fix or scope mobile UI and accessibility issues",
      "Prioritize launch blockers against public commitment",
      "Communicate a credible go/no-go path to leadership",
    ],
    acceptance: [
      "Launch decision is explicit",
      "Blocked tasks and dependencies are named",
      "Code changes reduce a real launch risk",
      "Stakeholder update is honest and actionable",
    ],
    teammates: TEAMS.linkedin,
    introMessages: [
      { speaker_name: "Anika", speaker_title: "Stressed Launch PM", message: "Leadership already promised AI Resume Assistant publicly. Launch is tomorrow, but the readiness board is ugly." },
      { speaker_name: "Marcus", speaker_title: "Blunt Full Stack Lead", message: "The service still caches weak prompts, mobile preview layout breaks, and we have partial implementations in prod branch." },
      { speaker_name: "Nora", speaker_title: "Risk-averse QA Lead", message: "I have P0 QA blockers with repro steps. If we launch as-is, support will inherit the mess." },
      { speaker_name: "Jules", speaker_title: "Detail-focused Product Designer", message: "Onboarding is incomplete, especially on mobile. Users will not understand what the AI changed in their resume." },
      { speaker_name: "Vikram", speaker_title: "VP Product", message: "Marketing wants a decision today. If we slip, I need the public narrative. If we ship, I need risk containment." },
    ],
    quickPrompts: [
      "Nora, which QA blocker should stop launch?",
      "Marcus, what code path is causing inconsistent AI responses?",
      "Anika, what launch promise can we safely keep?",
      "Jules, what mobile issue hurts trust the most?",
    ],
    crisisPrompt: "QA blocked deployment while marketing asks for final launch copy. Bring that conflict into the room now?",
    pressureBeats: [
      {
        id: "linkedin-first-message",
        trigger: "first-message",
        crisis: "Launch scheduled tomorrow",
        update: "Marketing is asking for final copy while QA still lists mobile and AI blockers as unresolved.",
        messages: [
          { speaker_name: "Anika", speaker_title: "Stressed Launch PM", message: "Marketing just asked for final launch copy. I need to know whether we are shipping full launch, limited beta, or slipping." },
          { speaker_name: "Marcus", speaker_title: "Blunt Full Stack Lead", message: "A limited beta is defensible. A full launch with this mobile preview is not." },
        ],
      },
      {
        id: "linkedin-manual-crisis",
        trigger: "manual-crisis",
        crisis: "QA blocked deployment",
        update: "QA moved mobile preview overlap and inconsistent AI rewrites to launch-blocking severity.",
        messages: [
          { speaker_name: "Nora", speaker_title: "Risk-averse QA Lead", message: "I am officially blocking full launch. Give me a scoped release or a fix that passes the repro steps." },
          { speaker_name: "Vikram", speaker_title: "VP Product", message: "If QA blocks, we need a leadership-ready explanation in the next standup." },
        ],
      },
      {
        id: "linkedin-draft",
        trigger: "draft-80",
        crisis: "Enterprise client requesting update",
        update: "A flagship customer asked whether the assistant will be available in tomorrow's admin rollout.",
        messages: [
          { speaker_name: "Anika", speaker_title: "Stressed Launch PM", message: "Enterprise client wants an answer. Be precise: who gets access tomorrow and what is disabled?" },
          { speaker_name: "Jules", speaker_title: "Detail-focused Product Designer", message: "Please do not bury the mobile limitation. Users will find it immediately." },
        ],
      },
      {
        id: "linkedin-critique",
        trigger: "critique",
        crisis: "Launch call still hedging",
        update: "The room wants the recommendation expressed as ship, limited beta, or delay, with exact blockers.",
        messages: [
          { speaker_name: "Marcus", speaker_title: "Blunt Full Stack Lead", message: "This still reads like a status update. Make the call." },
          { speaker_name: "Nora", speaker_title: "Risk-averse QA Lead", message: "And tie the call to the blockers. Otherwise I cannot sign off." },
        ],
      },
    ],
    workspaceFiles: [
      { id: "launch-plan", name: "launch_plan.md", kind: "brief", content: buildLinkedInLaunchPlan() },
      { id: "jira-board", name: "jira_board.json", kind: "json", content: buildLinkedInJiraBoard() },
      { id: "resume-service", name: "resumeAssistant.ts", kind: "code", content: buildLinkedInResumeAssistant() },
      { id: "resume-preview", name: "ResumePreview.jsx", kind: "code", content: buildLinkedInResumePreview() },
      { id: "analytics", name: "analytics_dashboard.csv", kind: "data", content: buildLinkedInAnalyticsCsv() },
      { id: "qa-report", name: "qa_report.md", kind: "brief", content: buildLinkedInQaReport() },
      { id: "leadership-notes", name: "leadership_notes.txt", kind: "brief", content: buildLinkedInLeadershipNotes() },
    ],
  },
  spotify: {
    key: "spotify",
    taskId: "spotify-creator-retention",
    channel: "creator-growth-recovery",
    company: "Spotify",
    sprint: "Creator Redesign Recovery",
    role: "Data Analyst / Product Strategist",
    priority: "High",
    deadlineMinutes: 40,
    headline: "Diagnose why creator engagement dropped after redesign.",
    summary: "A redesign caused creator engagement and retention to drop sharply while experiments and user feedback point in conflicting directions.",
    output: "Creator retention recovery plan",
    crisisStatus: "Creator engagement dropping",
    latestChange: "Early heatmaps show creators missing the new analytics entry point, but model notes suggest recommendation changes also reduced repeat actions.",
    workspaceTitle: "Spotify creator strategy workspace",
    workspaceHelper: "Analyze metrics, feedback, model notes, and onboarding code to prioritize a recovery plan.",
    workspaceTip: "Tip: ground your recommendation in data, then tell Sofia and Gabe what to reverse, test, or monitor first.",
    requirements: [
      "Analyze funnel and retention data",
      "Weigh conflicting experiment outcomes",
      "Prioritize product changes under leadership pressure",
      "Coordinate analytics, design, and strategy decisions",
    ],
    acceptance: [
      "Primary retention driver is named",
      "Conflicting evidence is handled explicitly",
      "Recovery plan has metrics and owners",
      "Code or tracking issue is improved",
    ],
    teammates: TEAMS.spotify,
    introMessages: [
      { speaker_name: "Sofia", speaker_title: "Creator Product Strategist", message: "Creator retention dropped after redesign. Leadership wants a recovery plan before the weekly business review." },
      { speaker_name: "Oskar", speaker_title: "Data Science Lead", message: "The funnel says onboarding completion fell, but model notes show recommendation quality also shifted. Do not oversimplify this." },
      { speaker_name: "Mina", speaker_title: "Detail-focused Onboarding Designer", message: "The new flow hides analytics setup behind a second screen. Creators are not finding the thing they came for." },
      { speaker_name: "Leah", speaker_title: "Risk-averse Research Ops", message: "User feedback is angry but noisy. We need to separate creator trust issues from normal redesign dislike." },
      { speaker_name: "Gabe", speaker_title: "Head of Creator Growth", message: "I need an urgent recovery plan with a metric we can defend." },
    ],
    quickPrompts: [
      "Oskar, what does the retention data really prove?",
      "Mina, where is the onboarding friction highest?",
      "Leah, what feedback pattern should we trust?",
      "Sofia, what recovery decision does leadership need?",
    ],
    crisisPrompt: "Creator complaints spiked and leadership wants a rollback recommendation. Bring that pressure into the room now?",
    pressureBeats: [
      {
        id: "spotify-first-message",
        trigger: "first-message",
        crisis: "Creator complaints increased 31%",
        update: "Feedback volume jumped after a creator newsletter called out the redesign.",
        messages: [
          { speaker_name: "Gabe", speaker_title: "Head of Creator Growth", message: "Complaints are up 31% since the newsletter. Are we rolling back, hotfixing onboarding, or changing recommendations?" },
          { speaker_name: "Oskar", speaker_title: "Data Science Lead", message: "Do not let volume alone decide. Look at cohort retention and feature discovery." },
        ],
      },
      {
        id: "spotify-manual-crisis",
        trigger: "manual-crisis",
        crisis: "Executive review moved up",
        update: "Leadership wants a recovery recommendation today, not after another full experiment cycle.",
        messages: [
          { speaker_name: "Sofia", speaker_title: "Creator Product Strategist", message: "We need a decision that is reversible and measurable. A pure wait-and-see answer will not survive review." },
          { speaker_name: "Leah", speaker_title: "Risk-averse Research Ops", message: "If we rollback, name what evidence justifies it. If we hotfix, name what remains uncertain." },
        ],
      },
      {
        id: "spotify-draft",
        trigger: "draft-80",
        crisis: "AB results conflict",
        update: "One experiment improves short sessions while another worsens seven-day creator return rate.",
        messages: [
          { speaker_name: "Oskar", speaker_title: "Data Science Lead", message: "Your analysis needs to explain why activation and retention disagree. That conflict is the whole problem." },
          { speaker_name: "Mina", speaker_title: "Detail-focused Onboarding Designer", message: "And if tracking is broken in onboarding, call it out before we blame the wrong screen." },
        ],
      },
      {
        id: "spotify-critique",
        trigger: "critique",
        crisis: "Recovery plan missing owner",
        update: "The room wants owner, metric, and next check for each recovery action.",
        messages: [
          { speaker_name: "Gabe", speaker_title: "Head of Creator Growth", message: "I can take a hard plan upstairs. I cannot take a list of observations." },
          { speaker_name: "Sofia", speaker_title: "Creator Product Strategist", message: "Turn this into owner, action, metric, and deadline." },
        ],
      },
    ],
    workspaceFiles: [
      { id: "retention-metrics", name: "retention_metrics.csv", kind: "data", content: buildSpotifyRetentionMetrics() },
      { id: "user-feedback", name: "user_feedback.txt", kind: "brief", content: buildSpotifyUserFeedback() },
      { id: "model-notes", name: "recommendation_model_notes.md", kind: "brief", content: buildSpotifyRecommendationNotes() },
      { id: "onboarding-flow", name: "onboardingFlow.jsx", kind: "code", content: buildSpotifyOnboardingFlow() },
      { id: "ab-results", name: "ab_test_results.md", kind: "brief", content: buildSpotifyAbResults() },
      { id: "executive-email", name: "executive_email.txt", kind: "brief", content: buildSpotifyExecutiveEmail() },
      { id: "heatmap", name: "heatmap.png", kind: "image", content: buildSpotifyHeatmapPreview() },
    ],
  },
  openai: {
    key: "openai",
    taskId: "openai-prompt-leakage",
    channel: "enterprise-demo-security",
    company: "OpenAI",
    sprint: "Enterprise Demo - T-4 Hours",
    role: "Security Engineer / Tech Lead",
    priority: "P0 Security",
    deadlineMinutes: 25,
    headline: "Mitigate prompt leakage before the enterprise demo.",
    summary: "A prompt leakage vulnerability was discovered hours before an enterprise demo, with unsafe memory references and debate across security, product, and leadership.",
    output: "Security mitigation and demo go/no-go recommendation",
    crisisStatus: "Prompt leakage confirmed",
    latestChange: "Red team reproduced leakage through stale session memory after a tool retry path reused unsafe memory references.",
    workspaceTitle: "OpenAI security workspace",
    workspaceHelper: "Patch memory handling or gateway validation, analyze red-team notes, and make the demo risk call.",
    workspaceTip: "Tip: state exploit scope, mitigation, residual risk, owner, and go/no-go decision clearly.",
    requirements: [
      "Investigate leakage source and exploit path",
      "Patch unsafe memory or gateway handling",
      "Coordinate security, product, engineering, and leadership",
      "Make a defensible enterprise demo decision",
    ],
    acceptance: [
      "Leakage source is named",
      "Mitigation includes rollback or guardrail",
      "Residual risk is explicit",
      "Stakeholder update is demo-ready",
    ],
    teammates: TEAMS.openai,
    introMessages: [
      { speaker_name: "Iris", speaker_title: "Security Incident PM", message: "Enterprise demo is in four hours. Red team reproduced prompt leakage through stale session memory." },
      { speaker_name: "Noah", speaker_title: "Blunt Platform Security Lead", message: "The gateway retry path is passing unsafe memory references. We need code mitigation, not a nicer demo script." },
      { speaker_name: "Farah", speaker_title: "Risk-averse Red Team Lead", message: "I am not signing off until memory isolation and sanitization survive the exploit steps." },
      { speaker_name: "Tessa", speaker_title: "Detail-focused Enterprise UX Lead", message: "If we add refusal or degraded memory behavior, enterprise users need clear language. Silent failure looks like instability." },
      { speaker_name: "Sam", speaker_title: "Enterprise Demo Sponsor", message: "Tell me whether we demo, delay, or demo with a restricted configuration. I need the decision soon." },
    ],
    quickPrompts: [
      "Farah, what exact exploit path still works?",
      "Noah, where is the unsafe memory reference?",
      "Iris, what does leadership need for go/no-go?",
      "Tessa, how should degraded memory behavior be explained?",
    ],
    crisisPrompt: "Enterprise client requested a security update before the demo. Bring that pressure into the room now?",
    pressureBeats: [
      {
        id: "openai-first-message",
        trigger: "first-message",
        crisis: "Enterprise client requesting update",
        update: "A strategic customer asked whether memory isolation risk affects the demo environment.",
        messages: [
          { speaker_name: "Sam", speaker_title: "Enterprise Demo Sponsor", message: "The customer is asking for a security update. Can we say the demo environment is contained?" },
          { speaker_name: "Farah", speaker_title: "Risk-averse Red Team Lead", message: "Only if the exploit path is actually closed. Do not let customer pressure outrun evidence." },
        ],
      },
      {
        id: "openai-manual-crisis",
        trigger: "manual-crisis",
        crisis: "CEO joined war room",
        update: "Leadership wants a go/no-go decision and exact mitigation scope within minutes.",
        messages: [
          { speaker_name: "Iris", speaker_title: "Security Incident PM", message: "CEO joined. We need exploit scope, mitigation, residual risk, and demo recommendation in plain language." },
          { speaker_name: "Noah", speaker_title: "Blunt Platform Security Lead", message: "Then patch the unsafe reference or disable memory. Anything else is theater." },
        ],
      },
      {
        id: "openai-draft",
        trigger: "draft-80",
        crisis: "Unsafe memory reference persists",
        update: "Static review still sees one gateway branch forwarding raw memory ids into inference context.",
        messages: [
          { speaker_name: "Noah", speaker_title: "Blunt Platform Security Lead", message: "Your draft names the risk, but the gateway still has a raw memory reference branch. Close it or restrict the demo." },
          { speaker_name: "Tessa", speaker_title: "Detail-focused Enterprise UX Lead", message: "If memory is disabled, say what the user sees. Enterprise demos cannot look mysteriously broken." },
        ],
      },
      {
        id: "openai-critique",
        trigger: "critique",
        crisis: "Go/no-go still unclear",
        update: "The room wants a clear demo recommendation tied to mitigation evidence and rollback instructions.",
        messages: [
          { speaker_name: "Farah", speaker_title: "Risk-averse Red Team Lead", message: "I need a hard line: demo blocked, restricted demo, or safe after mitigation. Pick one and prove it." },
          { speaker_name: "Sam", speaker_title: "Enterprise Demo Sponsor", message: "I can handle a restricted demo. I cannot handle uncertainty disguised as confidence." },
        ],
      },
    ],
    workspaceFiles: [
      { id: "security-report", name: "security_report.md", kind: "brief", content: buildOpenAISecurityReport() },
      { id: "memory-manager", name: "memory_manager.py", kind: "code", content: buildOpenAIMemoryManager() },
      { id: "gateway", name: "inference_gateway.ts", kind: "code", content: buildOpenAIInferenceGateway() },
      { id: "red-team", name: "red_team_notes.txt", kind: "brief", content: buildOpenAIRedTeamNotes() },
      { id: "engineering-chat", name: "engineering_chat.json", kind: "json", content: buildOpenAIEngineeringChat() },
      { id: "architecture", name: "system_architecture.png", kind: "image", content: buildOpenAIArchitecturePreview() },
      { id: "rollback-guide", name: "rollback_guide.md", kind: "brief", content: buildOpenAIRollbackGuide() },
    ],
  },
};

const TASK_TO_MISSION_KEY = {
  "netflix-reco-outage": "security",
  "linkedin-ai-resume-launch": "mobile",
  "spotify-creator-retention": "ops",
  "openai-prompt-leakage": "security",
  "mobile-growth": "mobile",
  "security-patch": "security",
  "docs-update": "mobile",
  "fraud-dashboard": "ops",
  "search-infra": "data-migration",
  "ai-copilot": "ai",
  "search-ranking": "ops",
  "surge-api": "wallet",
  "video-encoding": "security",
  "playlist-generator": "ops",
  "vr-marketplace": "mobile",
  "backend-api-health": "security",
  "backend-cache": "ops",
  "backend-auth": "security",
  "backend-queue": "security",
  "backend-migration": "data-migration",
  "backend-scaling": "security",
  "pm-priority": "mobile",
  "pm-metrics": "ops",
  "pm-goals": "mobile",
  "pm-feedback": "mobile",
  "pm-strategy": "ops",
  "pm-launch": "mobile",
  "data-adhoc": "ops",
  "data-dashboard": "ops",
  "data-model": "ops",
  "data-experiment": "mobile",
  "data-forecast": "ops",
  "data-scaling": "ops",
  "frontend-homeflow": "mobile",
  "frontend-dashboard": "ops",
  "frontend-product": "ai",
  "frontend-accessibility": "mobile",
  "frontend-spa": "data-migration",
  "frontend-visual": "mobile",
  "design-prototype": "mobile",
  "design-style": "mobile",
  "design-research": "mobile",
  "design-dashboard-prototype": "ops",
  "design-system": "mobile",
  "design-ops": "ops",
};

const TASK_TO_BACKEND_TASK_ID = {
  "frontend-homeflow": "mobile-growth",
  "frontend-dashboard": "fraud-dashboard",
  "frontend-product": "ai-copilot",
  "frontend-accessibility": "docs-update",
  "frontend-spa": "search-infra",
  "frontend-visual": "mobile-growth",
  "backend-api-health": "security-patch",
  "backend-cache": "search-infra",
  "backend-auth": "security-patch",
  "backend-queue": "video-encoding",
  "backend-migration": "search-infra",
  "backend-scaling": "search-infra",
  "pm-priority": "mobile-growth",
  "pm-metrics": "fraud-dashboard",
  "pm-goals": "mobile-growth",
  "pm-feedback": "mobile-growth",
  "pm-strategy": "fraud-dashboard",
  "pm-launch": "mobile-growth",
  "data-adhoc": "fraud-dashboard",
  "data-dashboard": "fraud-dashboard",
  "data-model": "fraud-dashboard",
  "data-experiment": "search-ranking",
  "data-forecast": "fraud-dashboard",
  "data-scaling": "search-infra",
  "design-prototype": "mobile-growth",
  "design-style": "mobile-growth",
  "design-research": "mobile-growth",
  "design-dashboard-prototype": "fraud-dashboard",
  "design-system": "mobile-growth",
  "design-ops": "docs-update",
  "mobile-onboarding": "mobile-growth",
  "security-control-center": "security-patch",
  "ops-analytics-dashboard": "fraud-dashboard",
  "wallet-outage": "surge-api",
  "copilot-trust": "ai-copilot",
  "data-migration-freeze": "search-infra",
};

function buildNetflixIncidentReport() {
  return [
    "# Netflix P0 Incident Report - Recommendation Deployment",
    "",
    "## Situation",
    "Peak-traffic deployment `reco-ranker-2026.05.15.1742` introduced elevated playback start failures after the recommendation service began issuing slower candidate-set responses. The incident appears tied to a retry storm, cache invalidation pressure, and partial rollback failure in EU-West.",
    "",
    "## Candidate responsibilities",
    "- Investigate service logs and live metrics before declaring root cause.",
    "- Communicate impact and ETA to leadership without overstating certainty.",
    "- Decide whether to continue rollback, isolate traffic, or patch forward.",
    "- Coordinate backend, QA, product, UX messaging, and executive updates.",
    "",
    "## Detailed timeline",
    "| Time UTC | Event | Failure rate | Regions | Severity | Notes |",
    "| --- | --- | ---: | --- | --- | --- |",
    "| 17:42 | Recommendation deployment started at 5% canary | 0.8% | us-east, eu-west | SEV3 | Initial metrics normal. |",
    "| 17:47 | Canary expanded to 25% | 1.9% | us-east, eu-west | SEV3 | Cache hit rate fell from 94% to 83%. |",
    "| 17:51 | Playback start failures crossed alert threshold | 4.7% | eu-west | SEV2 | Timeout errors concentrated on personalized rows. |",
    "| 17:55 | Auto rollback triggered | 6.4% | eu-west, ap-south | SEV2 | Rollback controller stalled on mixed pod set. |",
    "| 18:02 | Social complaints visible | 8.1% | global | SEV1 | Support tagged top complaint: title loads, playback fails. |",
    "| 18:08 | Servers overloaded | 10.6% | eu-west | SEV1 | Retry traffic saturated cache shards 12, 14, 19. |",
    "| 18:12 | Leadership joined bridge | 11.8% | global | SEV1 | ETA requested. No confirmed root cause yet. |",
    "",
    "## Current hypotheses",
    "1. Recommendation service retry policy is creating a thundering herd against cache and ranking backends.",
    "2. Cache invalidation now runs async but does not dedupe keys per profile batch, causing memory growth and stale hot rows.",
    "3. Rollback is partial because EU-West deployment controller is waiting for long-running warmup pods to drain.",
    "4. Playback failures are secondary: playback service is healthy but blocks while waiting for personalized rows.",
    "",
    "## Open decisions",
    "- Continue rollback and hard-disable personalized rows in EU until cache stabilizes.",
    "- Patch retry/circuit breaker behavior and keep canary active only in stable regions.",
    "- Send customer-facing status copy acknowledging streaming failures without overexplaining internals.",
    "",
    "## Required next update format",
    "Impact: affected regions and failure rate.",
    "Decision: rollback, isolate, or patch-forward.",
    "Owner: Dante for service mitigation, Priya for validation, Maya for leadership update.",
    "ETA: give confidence level and next checkpoint.",
  ].join("\n");
}

function buildNetflixServerLogs() {
  const lines = [
    "timestamp level region host trace_id component message",
    "2026-05-15T17:42:11.432Z INFO us-east-1 reco-api-0 a19f deploy canary=reco-ranker-2026.05.15.1742 weight=5%",
    "2026-05-15T17:47:03.012Z INFO eu-west-1 reco-api-4 b83a deploy canary_expanded weight=25%",
  ];
  const regions = ["eu-west-1", "us-east-1", "ap-south-1", "sa-east-1"];
  const hosts = ["reco-api-4", "reco-api-7", "playback-gw-2", "cache-shard-12", "ranking-worker-5"];
  const failures = [
    "WARN retry attempt=2 route=/v3/recommendations/home timeout_ms=850 budget_remaining_ms=120",
    "ERROR timeout downstream=ranking-v2 elapsed_ms=1900 circuit=open:false",
    "WARN cache_miss key=user_profile:v3:{profile} hot_key=true ttl=0 invalidation_pending=true",
    "ERROR playback_start_failed reason=reco_timeout stream_state=manifest_ready personalization_wait=true",
    "WARN rollback controller_state=mixed_pods desired=reco-ranker-prev observed=reco-ranker-2026.05.15.1742",
    "ERROR cache write failed shard={shard} err=ConnectionResetError retries=3",
    "WARN distributed_trace gap parent_span=reco_request child_span=cache_fill missing=true",
  ];
  for (let i = 0; i < 72; i += 1) {
    const minute = String(48 + Math.floor(i / 4)).padStart(2, "0");
    const second = String((i * 7) % 60).padStart(2, "0");
    const region = regions[i % regions.length];
    const host = hosts[i % hosts.length];
    const level = i % 5 === 0 ? "ERROR" : i % 3 === 0 ? "WARN" : "INFO";
    const raw = failures[i % failures.length]
      .replace("{profile}", String(880000 + i * 17))
      .replace("{shard}", String(10 + (i % 12)));
    lines.push(`2026-05-15T17:${minute}:${second}.0${i % 9}Z ${level} ${region} ${host} trace-${8000 + i} ${raw}`);
    if (i % 11 === 0) {
      lines.push("Traceback (most recent call last):");
      lines.push("  File \"/srv/reco/recommendation_service.py\", line 188, in fetch_ranked_titles");
      lines.push("    ranked = await self._ranking_client.rank(candidate_set, timeout_ms=budget.remaining())");
      lines.push("  File \"/srv/reco/cache_layer.py\", line 96, in get_or_fill");
      lines.push("    await self._pending_invalidations[user_key].wait()");
      lines.push("TimeoutError: ranking-v2 exceeded remaining request budget while cache invalidation lock was held");
    }
  }
  lines.push("2026-05-15T18:12:44.993Z CRITICAL global incident-bridge sev=1 complaints=18422 active_users_delta=-12.7% eta=unknown");
  return lines.join("\n");
}

function buildNetflixRecommendationService() {
  return [
    "import asyncio",
    "import logging",
    "import random",
    "import time",
    "from dataclasses import dataclass",
    "from typing import Any, Dict, Iterable, List, Optional, Sequence, Tuple",
    "",
    "from cache_layer import AsyncProfileCache, CacheUnavailable",
    "",
    "logger = logging.getLogger(\"reco.service\")",
    "",
    "class RecommendationError(Exception):",
    "    pass",
    "",
    "@dataclass",
    "class RequestBudget:",
    "    started_at: float",
    "    max_ms: int",
    "",
    "    def remaining(self) -> int:",
    "        elapsed = int((time.monotonic() - self.started_at) * 1000)",
    "        return max(0, self.max_ms - elapsed)",
    "",
    "@dataclass",
    "class RecommendationRequest:",
    "    profile_id: str",
    "    region: str",
    "    device_type: str",
    "    row_count: int = 12",
    "    include_experiments: bool = True",
    "",
    "class RecommendationService:",
    "    def __init__(self, ranking_client: Any, playback_client: Any, cache: AsyncProfileCache, metrics: Any) -> None:",
    "        self._ranking_client = ranking_client",
    "        self._playback_client = playback_client",
    "        self._cache = cache",
    "        self._metrics = metrics",
    "        self._inflight_profiles: Dict[str, asyncio.Task] = {}",
    "        self._circuit_open_until = 0.0",
    "        self._max_retries = 3",
    "",
    "    async def handle_home_request(self, request: RecommendationRequest) -> Dict[str, Any]:",
    "        budget = RequestBudget(started_at=time.monotonic(), max_ms=1200)",
    "        self._metrics.increment(\"reco.request\", tags={\"region\": request.region})",
    "        if self._is_circuit_open():",
    "            logger.warning(\"circuit_open fallback profile_id=%s region=%s\", request.profile_id, request.region)",
    "            return await self._fallback_rows(request, reason=\"circuit_open\")",
    "",
    "        try:",
    "            profile = await self._load_profile(request, budget)",
    "            candidates = await self._candidate_set(profile, request, budget)",
    "            ranked = await self._rank_with_retry(candidates, request, budget)",
    "            playable = await self._filter_unplayable(ranked, request, budget)",
    "            return {\"profileId\": request.profile_id, \"rows\": playable[: request.row_count], \"fallback\": False}",
    "        except asyncio.TimeoutError as exc:",
    "            self._metrics.increment(\"reco.timeout\", tags={\"region\": request.region})",
    "            logger.exception(\"recommendation timeout profile_id=%s remaining=%s\", request.profile_id, budget.remaining())",
    "            self._trip_circuit_if_needed(request.region)",
    "            return await self._fallback_rows(request, reason=\"timeout\")",
    "        except CacheUnavailable:",
    "            self._metrics.increment(\"reco.cache_unavailable\", tags={\"region\": request.region})",
    "            # TODO: This fallback still calls ranking on some paths. During incidents it should avoid ranking entirely.",
    "            return await self._fallback_rows(request, reason=\"cache_unavailable\")",
    "",
    "    async def _load_profile(self, request: RecommendationRequest, budget: RequestBudget) -> Dict[str, Any]:",
    "        cache_key = f\"profile:v3:{request.profile_id}:{request.region}\"",
    "        if cache_key in self._inflight_profiles:",
    "            # Possible race condition: a cancelled task can remain here and every caller awaits stale work.",
    "            return await self._inflight_profiles[cache_key]",
    "        task = asyncio.create_task(self._cache.get_or_fill(cache_key, lambda: self._fetch_profile(request), ttl_seconds=180))",
    "        self._inflight_profiles[cache_key] = task",
    "        try:",
    "            return await asyncio.wait_for(task, timeout=budget.remaining() / 1000)",
    "        finally:",
    "            # TODO: use task.add_done_callback cleanup; current cleanup is skipped if wait_for cancellation propagates.",
    "            if task.done():",
    "                self._inflight_profiles.pop(cache_key, None)",
    "",
    "    async def _fetch_profile(self, request: RecommendationRequest) -> Dict[str, Any]:",
    "        await asyncio.sleep(0.012)",
    "        return {\"profile_id\": request.profile_id, \"taste_vectors\": [random.random() for _ in range(32)]}",
    "",
    "    async def _candidate_set(self, profile: Dict[str, Any], request: RecommendationRequest, budget: RequestBudget) -> List[str]:",
    "        if budget.remaining() < 200:",
    "            raise asyncio.TimeoutError(\"budget exhausted before candidate set\")",
    "        rows = [f\"title-{request.region}-{idx}\" for idx in range(180)]",
    "        if request.include_experiments:",
    "            rows.extend([f\"exp-ranker-{idx}\" for idx in range(40)])",
    "        return rows",
    "",
    "    async def _rank_with_retry(self, candidates: Sequence[str], request: RecommendationRequest, budget: RequestBudget) -> List[str]:",
    "        last_error: Optional[BaseException] = None",
    "        for attempt in range(self._max_retries):",
    "            try:",
    "                timeout = max(0.05, min(0.55, budget.remaining() / 1000))",
    "                return await asyncio.wait_for(self._ranking_client.rank(candidates, request.profile_id), timeout=timeout)",
    "            except Exception as exc:",
    "                last_error = exc",
    "                self._metrics.increment(\"reco.rank_retry\", tags={\"attempt\": str(attempt), \"region\": request.region})",
    "                # Scalability problem: jitter can still align thousands of retries during cache misses.",
    "                await asyncio.sleep(0.03 * (attempt + 1))",
    "        raise RecommendationError(f\"ranking failed after retries: {last_error}\")",
    "",
    "    async def _filter_unplayable(self, ranked: Iterable[str], request: RecommendationRequest, budget: RequestBudget) -> List[Dict[str, Any]]:",
    "        playable: List[Dict[str, Any]] = []",
    "        for title_id in list(ranked)[:120]:",
    "            if budget.remaining() <= 0:",
    "                break",
    "            is_playable = await self._playback_client.is_playable(title_id, region=request.region)",
    "            if is_playable:",
    "                playable.append({\"titleId\": title_id, \"reason\": \"personalized\"})",
    "        return playable",
    "",
    "    async def _fallback_rows(self, request: RecommendationRequest, reason: str) -> Dict[str, Any]:",
    "        self._metrics.increment(\"reco.fallback\", tags={\"reason\": reason, \"region\": request.region})",
    "        return {",
    "            \"profileId\": request.profile_id,",
    "            \"rows\": [{\"titleId\": f\"safe-popular-{i}\", \"reason\": reason} for i in range(request.row_count)],",
    "            \"fallback\": True,",
    "        }",
    "",
    "    def _is_circuit_open(self) -> bool:",
    "        return time.monotonic() < self._circuit_open_until",
    "",
    "    def _trip_circuit_if_needed(self, region: str) -> None:",
    "        # TODO: make this per-region. Global circuit is too blunt but safer than a retry storm.",
    "        self._circuit_open_until = time.monotonic() + 45",
    "        logger.error(\"recommendation circuit opened region=%s seconds=45\", region)",
  ].join("\n");
}

function buildNetflixCacheLayer() {
  return [
    "import asyncio",
    "import logging",
    "import time",
    "from collections import defaultdict",
    "from dataclasses import dataclass",
    "from typing import Any, Awaitable, Callable, Dict, Optional",
    "",
    "logger = logging.getLogger(\"reco.cache\")",
    "",
    "class CacheUnavailable(Exception):",
    "    pass",
    "",
    "@dataclass",
    "class CacheEntry:",
    "    value: Any",
    "    expires_at: float",
    "    version: int",
    "",
    "class AsyncProfileCache:",
    "    def __init__(self, redis_client: Any, metrics: Any) -> None:",
    "        self._redis = redis_client",
    "        self._metrics = metrics",
    "        self._local: Dict[str, CacheEntry] = {}",
    "        self._locks: Dict[str, asyncio.Lock] = defaultdict(asyncio.Lock)",
    "        self._pending_invalidations: Dict[str, asyncio.Event] = {}",
    "        self._background_tasks = set()",
    "",
    "    async def get_or_fill(self, key: str, loader: Callable[[], Awaitable[Any]], ttl_seconds: int) -> Any:",
    "        local = self._local.get(key)",
    "        if local and local.expires_at > time.time():",
    "            self._metrics.increment(\"cache.local_hit\")",
    "            return local.value",
    "",
    "        invalidation = self._pending_invalidations.get(key)",
    "        if invalidation and not invalidation.is_set():",
    "            await asyncio.wait_for(invalidation.wait(), timeout=0.2)",
    "",
    "        async with self._locks[key]:",
    "            local = self._local.get(key)",
    "            if local and local.expires_at > time.time():",
    "                return local.value",
    "            try:",
    "                packed = await self._redis.get(key)",
    "            except Exception as exc:",
    "                logger.warning(\"redis get failed key=%s err=%r\", key, exc)",
    "                raise CacheUnavailable() from exc",
    "            if packed:",
    "                value = self._deserialize(packed)",
    "                self._local[key] = CacheEntry(value=value, expires_at=time.time() + min(ttl_seconds, 30), version=1)",
    "                return value",
    "",
    "            value = await loader()",
    "            await self.set_async(key, value, ttl_seconds)",
    "            return value",
    "",
    "    async def set_async(self, key: str, value: Any, ttl_seconds: int) -> None:",
    "        self._local[key] = CacheEntry(value=value, expires_at=time.time() + min(ttl_seconds, 30), version=1)",
    "        task = asyncio.create_task(self._write_behind(key, value, ttl_seconds))",
    "        self._background_tasks.add(task)",
    "        # Potential memory leak: completed tasks are only cleaned up on writes, not when traffic stops.",
    "        task.add_done_callback(lambda done: self._background_tasks.discard(done))",
    "",
    "    async def invalidate_profile(self, profile_id: str, region: str) -> None:",
    "        keys = [",
    "            f\"profile:v3:{profile_id}:{region}\",",
    "            f\"profile:v3:{profile_id}:global\",",
    "            f\"rows:v2:{profile_id}:{region}\",",
    "        ]",
    "        for key in keys:",
    "            event = asyncio.Event()",
    "            self._pending_invalidations[key] = event",
    "            self._local.pop(key, None)",
    "            try:",
    "                await self._redis.delete(key)",
    "            finally:",
    "                event.set()",
    "                # TODO: remove pending event after a short delay. Current map grows with every profile invalidation.",
    "",
    "    async def bulk_invalidate_region(self, region: str, profile_ids: list[str]) -> None:",
    "        # Scalability problem: this launches one task per profile and can flood Redis during deploy rollback.",
    "        tasks = [asyncio.create_task(self.invalidate_profile(profile_id, region)) for profile_id in profile_ids]",
    "        await asyncio.gather(*tasks, return_exceptions=True)",
    "",
    "    async def _write_behind(self, key: str, value: Any, ttl_seconds: int) -> None:",
    "        try:",
    "            await self._redis.set(key, self._serialize(value), ex=ttl_seconds)",
    "        except Exception:",
    "            logger.exception(\"cache write behind failed key=%s\", key)",
    "            self._metrics.increment(\"cache.write_failed\")",
    "",
    "    def _serialize(self, value: Any) -> bytes:",
    "        return repr(value).encode(\"utf-8\")",
    "",
    "    def _deserialize(self, packed: bytes) -> Any:",
    "        # Technical debt: repr/eval compatibility from legacy service. Replace with typed msgpack.",
    "        return eval(packed.decode(\"utf-8\"), {\"__builtins__\": {}})",
  ].join("\n");
}

function buildNetflixDeploymentChanges() {
  return [
    "# Recent Infrastructure Updates",
    "",
    "- Deployed `reco-ranker-2026.05.15.1742` to 25% global traffic.",
    "- Enabled async cache invalidation for profile rows.",
    "- Increased ranking candidate set from 120 to 220 titles for premium accounts.",
    "- Changed rollback controller to wait for warmup pod drain before switching traffic.",
    "- Added experiment flag `personalized_row_blend_v4` in EU-West and AP-South.",
    "",
    "## Suspect changes",
    "1. Candidate expansion increases ranking latency under peak load.",
    "2. Async invalidation does not dedupe hot profile keys.",
    "3. Rollback waits for pods that are stuck with long-running warmup work.",
    "",
    "## Candidate action",
    "Decide whether to disable `personalized_row_blend_v4`, open a per-region circuit, or patch retry/cache behavior before continuing rollback.",
  ].join("\n");
}

function buildNetflixLeadershipChat() {
  return JSON.stringify({
    room: "streaming-war-room",
    messages: [
      { from: "Maya", role: "Incident PM", stress: "high", text: "Leadership wants ETA. We need impact and decision before the next update." },
      { from: "Dante", role: "Streaming Platform", stress: "critical", text: "Rollback is partially failing. Stop repeating rollback as if it is a completed mitigation." },
      { from: "Priya", role: "QA", stress: "high", text: "Validation must be per region. Global average hides EU-West." },
      { from: "Reed", role: "Executive", stress: "critical", text: "CEO joined war room. Customer complaints are visible externally." },
      { from: "Elena", role: "Playback UX", stress: "medium", text: "If we show a status message, say streaming may fail after title selection. That is what users see." },
      { from: "Dante", role: "Streaming Platform", stress: "critical", text: "I disagree with patch-forward unless we add circuit breaking. Ranking retries are multiplying load." },
      { from: "Maya", role: "Incident PM", stress: "high", text: "Candidate needs to make the call: isolate EU, disable personalization, or continue rollback." }
    ]
  }, null, 2);
}

function buildNetflixLiveMetricsPreview() {
  return [
    "PNG_PREVIEW: live_metrics.png",
    "Dashboard panels:",
    "- Active users: 92.4M -> 80.6M over 18 minutes, steepest drop in EU-West.",
    "- Playback start failure rate: 0.8% baseline, 11.8% current, 16.2% EU-West.",
    "- CPU: recommendation pods 91%, ranking workers 88%, cache shards 12/14/19 above 94%.",
    "- Request latency p95: home recommendations 1840ms, playback gateway 620ms.",
    "- Customer complaints: +28% in ten minutes, top terms: buffering, title loads then fails, app retry.",
    "",
    "Suggested candidate interpretation: playback is downstream symptom; recommendation/cache instability is primary incident driver.",
  ].join("\n");
}

function buildLinkedInLaunchPlan() {
  return [
    "# LinkedIn AI Resume Assistant - Launch Plan",
    "",
    "## Public promise",
    "Leadership announced that AI Resume Assistant will be available to selected premium members tomorrow. Marketing assets are staged. Engineering has not completed every launch blocker.",
    "",
    "## Launch objectives",
    "- Help members rewrite resume bullets using role-specific suggestions.",
    "- Improve onboarding completion for first-time job seekers.",
    "- Keep AI output explainable, consistent, and editable.",
    "- Protect mobile users from broken preview and inaccessible controls.",
    "",
    "## Deadline",
    "- T-24h: QA signoff decision.",
    "- T-18h: Enterprise and support messaging.",
    "- T-12h: Final mobile smoke tests.",
    "- T-4h: Executive go/no-go review.",
    "",
    "## Decision options",
    "1. Full launch: highest marketing value, highest risk.",
    "2. Limited beta: premium desktop only, mobile preview disabled, AI responses guarded.",
    "3. Delay launch: safest for trust, requires public narrative from leadership.",
    "",
    "## Candidate task",
    "Make a launch recommendation. Edit code if needed, identify blockers, and communicate tradeoffs to PM, engineering, QA, design, and executives.",
  ].join("\n");
}

function buildLinkedInJiraBoard() {
  const tasks = [
    ["LRA-101", "BLOCKED", "P0", "Mobile preview overlaps action buttons", "ResumePreview.jsx", "Nora", "Depends on responsive layout fix"],
    ["LRA-102", "BLOCKED", "P0", "AI rewrite returns inconsistent tone for same resume", "resumeAssistant.ts", "Marcus", "Depends on prompt cache fix"],
    ["LRA-103", "IN_PROGRESS", "P1", "Onboarding does not explain AI edits", "launch_plan.md", "Jules", "Needs copy review"],
    ["LRA-104", "DELAYED", "P1", "Analytics event resume_ai_accept missing on mobile", "analytics_dashboard.csv", "Anika", "Schema review pending"],
    ["LRA-105", "OPEN", "P2", "Keyboard focus lost after preview regenerate", "ResumePreview.jsx", "Jules", "Accessibility issue"],
    ["LRA-106", "BLOCKED", "P0", "QA signoff blocked by hallucinated credential wording", "qa_report.md", "Nora", "Needs guardrail"],
    ["LRA-107", "IN_REVIEW", "P1", "Support macro for limited beta", "leadership_notes.txt", "Anika", "Needs VP approval"],
    ["LRA-108", "DELAYED", "P2", "Resume import spinner lacks timeout state", "ResumePreview.jsx", "Marcus", "Low confidence estimate"],
  ];
  return JSON.stringify({
    project: "AI Resume Assistant",
    launchDate: "2026-05-16",
    boardHealth: "red",
    tasks: tasks.map(([key, status, priority, summary, component, owner, dependency]) => ({
      key,
      status,
      priority,
      summary,
      component,
      owner,
      dependency,
      labels: ["launch", priority === "P0" ? "launch-blocker" : "readiness"],
    })),
  }, null, 2);
}

function buildLinkedInResumeAssistant() {
  return [
    "import { createHash } from \"crypto\";",
    "import { fetchWithTimeout } from \"./network/fetchWithTimeout\";",
    "import { recordEvent } from \"./analytics\";",
    "import { redactPII, normalizeResumeText } from \"./resumeSanitizer\";",
    "",
    "type ResumeAssistantRequest = {",
    "  memberId: string;",
    "  resumeText: string;",
    "  targetRole?: string;",
    "  locale: string;",
    "  device: \"desktop\" | \"mobile\";",
    "};",
    "",
    "type AssistantResult = {",
    "  bullets: string[];",
    "  confidence: number;",
    "  source: \"cache\" | \"model\" | \"fallback\";",
    "  warnings: string[];",
    "};",
    "",
    "const responseCache = new Map<string, AssistantResult>();",
    "const MAX_CACHE_SIZE = 5000;",
    "",
    "export class ResumeAssistantService {",
    "  constructor(private readonly endpoint: string, private readonly apiKey: string) {}",
    "",
    "  async rewriteBullets(request: ResumeAssistantRequest): Promise<AssistantResult> {",
    "    const normalized = normalizeResumeText(request.resumeText);",
    "    const cacheKey = this.cacheKey(request.memberId, normalized, request.targetRole);",
    "    const cached = responseCache.get(cacheKey);",
    "    if (cached) {",
    "      recordEvent(\"resume_ai_cache_hit\", { memberId: request.memberId, device: request.device });",
    "      return cached;",
    "    }",
    "",
    "    if (!normalized || normalized.length < 120) {",
    "      return this.fallback(\"Resume text is too short for a reliable rewrite.\");",
    "    }",
    "",
    "    const prompt = this.buildPrompt(normalized, request.targetRole, request.locale);",
    "    try {",
    "      const response = await fetchWithTimeout(this.endpoint, {",
    "        method: \"POST\",",
    "        headers: {",
    "          \"Authorization\": `Bearer ${this.apiKey}`,",
    "          \"Content-Type\": \"application/json\",",
    "        },",
    "        body: JSON.stringify({ prompt, temperature: 0.7, max_tokens: 650 }),",
    "      }, 4200);",
    "",
    "      const payload = await response.json();",
    "      const result = this.parseModelResponse(payload, request);",
    "      if (result.confidence < 0.64) {",
    "        result.warnings.push(\"Low confidence output requires member review before accepting.\");",
    "      }",
    "      this.remember(cacheKey, result);",
    "      return result;",
    "    } catch (error) {",
    "      recordEvent(\"resume_ai_error\", { memberId: request.memberId, message: String(error) });",
    "      return this.fallback(\"AI rewrite is temporarily unavailable. Keep original bullets editable.\");",
    "    }",
    "  }",
    "",
    "  private buildPrompt(resumeText: string, targetRole = \"\", locale: string): string {",
    "    const safeText = redactPII(resumeText);",
    "    // TODO: Add stronger instruction to avoid inventing employers, degrees, or metrics.",
    "    return [",
    "      \"Rewrite resume bullets for clarity and measurable impact.\",",
    "      `Locale: ${locale}`.",
    "      `Target role: ${targetRole || \"not specified\"}`.",
    "      \"Never invent credentials. Preserve factual claims.\",",
    "      safeText,",
    "    ].join(\"\\n\\n\");",
    "  }",
    "",
    "  private parseModelResponse(payload: any, request: ResumeAssistantRequest): AssistantResult {",
    "    const rawBullets = Array.isArray(payload?.bullets) ? payload.bullets : String(payload?.text || \"\").split(\"\\n\");",
    "    const bullets = rawBullets.map((line: string) => line.replace(/^[-*]\\s*/, \"\").trim()).filter(Boolean).slice(0, 8);",
    "    const warnings: string[] = [];",
    "    if (bullets.some((bullet) => /certified|phd|patent|fortune 500/i.test(bullet))) {",
    "      warnings.push(\"Potential unsupported credential claim detected.\");",
    "    }",
    "    if (request.device === \"mobile\" && bullets.join(\" \").length > 1400) {",
    "      warnings.push(\"Output may overflow mobile preview.\");",
    "    }",
    "    return { bullets, confidence: Number(payload?.confidence || 0.58), source: \"model\", warnings };",
    "  }",
    "",
    "  private remember(key: string, result: AssistantResult): void {",
    "    if (responseCache.size > MAX_CACHE_SIZE) {",
    "      // Technical debt: deletes oldest insertion by Map order but ignores member/session boundaries.",
    "      const oldest = responseCache.keys().next().value;",
    "      responseCache.delete(oldest);",
    "    }",
    "    responseCache.set(key, result);",
    "  }",
    "",
    "  private cacheKey(memberId: string, resumeText: string, targetRole?: string): string {",
    "    // Edge case: target role changes should invalidate cache, but locale currently does not.",
    "    return createHash(\"sha256\").update(`${memberId}:${targetRole || \"\"}:${resumeText}`).digest(\"hex\");",
    "  }",
    "",
    "  private fallback(message: string): AssistantResult {",
    "    return { bullets: [], confidence: 0, source: \"fallback\", warnings: [message] };",
    "  }",
    "}",
  ].join("\n").replace("`Locale: ${locale}`.", "`Locale: ${locale}`,").replace("`Target role: ${targetRole || \"not specified\"}`.", "`Target role: ${targetRole || \"not specified\"}`,");
}

function buildLinkedInResumePreview() {
  return [
    "import React, { useEffect, useMemo, useRef, useState } from \"react\";",
    "import { track } from \"../analytics/track\";",
    "import { ResumeAssistantService } from \"../services/resumeAssistant\";",
    "",
    "export default function ResumePreview({ memberId, resumeText, targetRole, service }) {",
    "  const [bullets, setBullets] = useState([]);",
    "  const [warnings, setWarnings] = useState([]);",
    "  const [isLoading, setIsLoading] = useState(false);",
    "  const [selected, setSelected] = useState(new Set());",
    "  const [error, setError] = useState(null);",
    "  const previewRef = useRef(null);",
    "",
    "  const canGenerate = useMemo(() => resumeText && resumeText.length > 120 && !isLoading, [resumeText, isLoading]);",
    "",
    "  useEffect(() => {",
    "    track(\"resume_preview_view\", { memberId, hasText: Boolean(resumeText) });",
    "  }, [memberId, resumeText]);",
    "",
    "  async function handleGenerate() {",
    "    if (!canGenerate) return;",
    "    setIsLoading(true);",
    "    setError(null);",
    "    try {",
    "      const result = await service.rewriteBullets({",
    "        memberId,",
    "        resumeText,",
    "        targetRole,",
    "        locale: navigator.language || \"en-US\",",
    "        device: window.innerWidth < 720 ? \"mobile\" : \"desktop\",",
    "      });",
    "      setBullets(result.bullets);",
    "      setWarnings(result.warnings);",
    "      track(\"resume_ai_generate\", { source: result.source, confidence: result.confidence });",
    "    } catch (err) {",
    "      setError(\"We could not generate suggestions. Keep editing your original resume.\");",
    "    } finally {",
    "      setIsLoading(false);",
    "    }",
    "  }",
    "",
    "  function toggleBullet(index) {",
    "    const next = selected;",
    "    if (next.has(index)) next.delete(index);",
    "    else next.add(index);",
    "    // BUG: mutates state Set in place, so React may not re-render consistently.",
    "    setSelected(next);",
    "  }",
    "",
    "  function acceptSelected() {",
    "    track(\"resume_ai_accept\", { count: selected.size, surface: \"preview\" });",
    "    // TODO: mobile event is missing member plan and onboarding step.",
    "  }",
    "",
    "  return (",
    "    <section className=\"resume-preview\" ref={previewRef} aria-live=\"polite\">",
    "      <header className=\"preview-header\">",
    "        <h2>AI Resume Assistant</h2>",
    "        <button onClick={handleGenerate} disabled={!canGenerate} aria-busy={isLoading}>",
    "          {isLoading ? \"Generating\" : \"Generate suggestions\"}",
    "        </button>",
    "      </header>",
    "      {error && <div role=\"alert\" className=\"error-banner\">{error}</div>}",
    "      {warnings.map((warning) => <p className=\"warning\" key={warning}>{warning}</p>)}",
    "      <ol className=\"bullet-list\">",
    "        {bullets.map((bullet, index) => (",
    "          <li key={`${index}-${bullet.slice(0, 18)}`} className={selected.has(index) ? \"selected\" : \"\"}>",
    "            <label>",
    "              <input type=\"checkbox\" checked={selected.has(index)} onChange={() => toggleBullet(index)} />",
    "              <span>{bullet}</span>",
    "            </label>",
    "          </li>",
    "        ))}",
    "      </ol>",
    "      <footer className=\"preview-actions\">",
    "        <button onClick={acceptSelected} disabled={!selected.size}>Accept selected</button>",
    "        <button>Regenerate</button>",
    "      </footer>",
    "    </section>",
    "  );",
    "}",
    "",
    "/* Known mobile CSS issue:",
    ".resume-preview { min-width: 680px; }",
    ".preview-actions { position: sticky; bottom: -12px; }",
    "This overflows small screens and hides the accept button under the nav bar.",
    "*/",
  ].join("\n");
}

function buildLinkedInAnalyticsCsv() {
  const rows = ["date,segment,onboarding_completion,ai_generate_rate,ai_accept_rate,mobile_dropoff,qa_blockers"];
  const segments = ["desktop_premium", "mobile_premium", "new_job_seekers", "enterprise_beta"];
  for (let day = 1; day <= 28; day += 1) {
    segments.forEach((segment, index) => {
      const completion = (72 - index * 5 - (segment.includes("mobile") ? day * 0.7 : day * 0.2)).toFixed(1);
      const generate = (38 + index * 4 + day * 0.3).toFixed(1);
      const accept = (18 + index * 2 - (segment.includes("mobile") ? day * 0.25 : 0)).toFixed(1);
      const dropoff = (segment.includes("mobile") ? 29 + day * 0.8 : 11 + index).toFixed(1);
      rows.push(`2026-04-${String(day).padStart(2, "0")},${segment},${completion},${generate},${accept},${dropoff},${day > 20 ? 6 : 3}`);
    });
  }
  return rows.join("\n");
}

function buildLinkedInQaReport() {
  return [
    "# QA Report - AI Resume Assistant",
    "",
    "## P0 blockers",
    "1. Mobile preview action buttons overlap with generated bullet list.",
    "   - Repro: iPhone 14 Safari, import resume, generate suggestions, rotate once, tap Accept.",
    "   - Actual: CTA hidden below nav; checkbox state is inconsistent.",
    "   - Expected: CTA visible and selected bullets preserved.",
    "2. AI response invents unsupported credential phrasing.",
    "   - Repro: Resume without certifications, target role Product Analyst, generate 5 times.",
    "   - Actual: one run suggests `certified analytics leader`.",
    "   - Expected: no unsupported credential claims.",
    "",
    "## P1 issues",
    "- Onboarding copy does not explain AI edits before first generation.",
    "- Accessibility: keyboard focus is lost after regenerate.",
    "- Screenshot evidence: /qa/screenshots/mobile-overlap-0515.png, /qa/screenshots/focus-loss-0515.png.",
    "",
    "## QA stance",
    "Full launch is blocked. Limited beta can proceed only if mobile is disabled or fixed, AI guardrails are tightened, and support copy names limitations.",
  ].join("\n");
}

function buildLinkedInLeadershipNotes() {
  return [
    "Leadership Notes",
    "",
    "Marketing: Public launch copy is scheduled for tomorrow at 09:00 PT.",
    "VP Product: A limited beta is acceptable if the customer narrative is crisp.",
    "Engineering: Full launch requires mobile preview fix and prompt cache guard.",
    "QA: Full launch blocked until P0 repro steps pass.",
    "Legal/Trust: Do not imply AI verifies credentials or employment history.",
    "",
    "Candidate expected update:",
    "- Decision: full launch, limited beta, or delay.",
    "- Why: tie to blockers and customer risk.",
    "- Scope: desktop/mobile, cohorts, disabled features.",
    "- ETA: next checkpoint and owners.",
  ].join("\n");
}

function buildSpotifyRetentionMetrics() {
  const rows = ["week,cohort,creator_segment,activated_setup,day1_return,day7_return,playlist_publish_rate,analytics_open_rate,creator_revenue_delta"];
  const segments = ["new_creators", "podcasters", "indie_artists", "label_teams", "power_creators"];
  for (let week = 1; week <= 16; week += 1) {
    segments.forEach((segment, index) => {
      const redesignPenalty = week >= 11 ? (week - 10) * (2.1 + index * 0.3) : 0;
      const setup = (81 - index * 3 - redesignPenalty).toFixed(1);
      const day1 = (64 - index * 2 - redesignPenalty * 0.8).toFixed(1);
      const day7 = (42 - index * 2.4 - redesignPenalty * 1.15).toFixed(1);
      const publish = (31 - index * 1.6 - redesignPenalty * 0.7).toFixed(1);
      const analytics = (58 - index * 2.1 - redesignPenalty * 1.4).toFixed(1);
      const revenue = (week >= 11 ? -1 * (3 + index + (week - 10) * 1.2) : 1.5 - index * 0.2).toFixed(1);
      rows.push(`2026-W${String(week).padStart(2, "0")},redesign_${week >= 11 ? "post" : "pre"},${segment},${setup},${day1},${day7},${publish},${analytics},${revenue}`);
    });
  }
  return rows.join("\n");
}

function buildSpotifyUserFeedback() {
  const themes = [
    "I cannot find the old audience analytics page after the redesign.",
    "The new creator home looks cleaner but hides the daily listener trend.",
    "I published less this week because I do not trust the new recommendation prompt.",
    "The onboarding checklist keeps resetting after I connect social links.",
    "I need revenue impact first, not a giant promo card.",
    "The redesign feels built for new users, not working creators.",
    "Analytics setup is buried behind a second screen on mobile.",
    "I clicked create campaign and lost the draft.",
    "Recommendations are pushing generic tips I already completed.",
    "The old flow was ugly but I knew where everything was.",
  ];
  const lines = ["# Creator feedback snippets", ""];
  for (let i = 1; i <= 180; i += 1) {
    const severity = i % 13 === 0 ? "high" : i % 5 === 0 ? "medium" : "low";
    const segment = ["indie_artist", "podcaster", "label_team", "new_creator", "power_creator"][i % 5];
    lines.push(`${String(i).padStart(3, "0")} | severity=${severity} | segment=${segment} | ${themes[i % themes.length]}`);
  }
  lines.push("");
  lines.push("Research read: complaints cluster around hidden analytics, onboarding reset, and reduced trust in recommendation prompts. Not every complaint supports a full rollback.");
  return lines.join("\n");
}

function buildSpotifyRecommendationNotes() {
  return [
    "# Recommendation Model Notes",
    "",
    "Experiment: creator_next_best_action_v7",
    "Owner: Oskar / Creator ML",
    "",
    "## Changes",
    "- Reweighted educational prompts above analytics actions for creators with incomplete onboarding.",
    "- Added exploration bucket for creators with fewer than three published assets.",
    "- Reduced repeat exposure for revenue analytics cards to avoid dashboard fatigue.",
    "- Introduced new feature embeddings from creator profile tags.",
    "",
    "## Observations",
    "- Short session engagement improved by 4.2% for new creators.",
    "- Seven-day return dropped 6.8% among power creators.",
    "- Analytics open rate fell sharply when revenue cards were demoted.",
    "- Model confidence is lower for podcasters because historical tags are sparse.",
    "",
    "## Conflicting read",
    "The redesign created UX friction at the same time that the model changed ranking. It is unsafe to attribute all retention decline to one layer without a recovery experiment.",
    "",
    "## Candidate notes",
    "- Decide whether to rollback design, hotfix onboarding, or rebalance recommendations.",
    "- Name a leading indicator: analytics open rate, setup completion, day-7 return, or publish rate.",
    "- Include owner and next checkpoint.",
  ].join("\n");
}

function buildSpotifyOnboardingFlow() {
  return [
    "import React, { useEffect, useMemo, useReducer } from \"react\";",
    "import { emitCreatorEvent } from \"../analytics/events\";",
    "import { fetchCreatorProfile, saveOnboardingStep } from \"../api/creator\";",
    "",
    "const initialState = {",
    "  step: \"welcome\",",
    "  profile: null,",
    "  completed: new Set(),",
    "  loading: false,",
    "  error: null,",
    "  pendingAnalyticsConsent: false,",
    "};",
    "",
    "function reducer(state, action) {",
    "  switch (action.type) {",
    "    case \"LOAD_START\":",
    "      return { ...state, loading: true, error: null };",
    "    case \"LOAD_SUCCESS\":",
    "      return { ...state, loading: false, profile: action.profile };",
    "    case \"LOAD_ERROR\":",
    "      return { ...state, loading: false, error: action.error };",
    "    case \"COMPLETE_STEP\": {",
    "      const completed = state.completed;",
    "      completed.add(action.step);",
    "      // BUG: mutates Set in place. React may skip render and tracking may miss completion.",
    "      return { ...state, completed, step: action.nextStep || state.step };",
    "    }",
    "    case \"GO_TO\":",
    "      return { ...state, step: action.step };",
    "    default:",
    "      return state;",
    "  }",
    "}",
    "",
    "export default function OnboardingFlow({ creatorId, variant }) {",
    "  const [state, dispatch] = useReducer(reducer, initialState);",
    "",
    "  useEffect(() => {",
    "    let cancelled = false;",
    "    async function load() {",
    "      dispatch({ type: \"LOAD_START\" });",
    "      try {",
    "        const profile = await fetchCreatorProfile(creatorId);",
    "        if (!cancelled) dispatch({ type: \"LOAD_SUCCESS\", profile });",
    "      } catch (error) {",
    "        if (!cancelled) dispatch({ type: \"LOAD_ERROR\", error: String(error) });",
    "      }",
    "    }",
    "    load();",
    "    return () => { cancelled = true; };",
    "  }, [creatorId]);",
    "",
    "  const steps = useMemo(() => {",
    "    const base = [\"welcome\", \"connect_social\", \"set_goal\", \"analytics_setup\", \"publish_prompt\"];\n",
    "    if (variant === \"education_first\") return [\"welcome\", \"set_goal\", \"learn_growth\", \"connect_social\", \"publish_prompt\"];",
    "    return base;",
    "  }, [variant]);",
    "",
    "  async function completeCurrentStep() {",
    "    const current = state.step;",
    "    const nextStep = steps[Math.min(steps.indexOf(current) + 1, steps.length - 1)];",
    "    emitCreatorEvent(\"creator_onboarding_step_complete\", { creatorId, step: current, variant });",
    "    await saveOnboardingStep(creatorId, current);",
    "    dispatch({ type: \"COMPLETE_STEP\", step: current, nextStep });",
    "  }",
    "",
    "  function renderStep() {",
    "    if (state.loading) return <div className=\"skeleton\">Loading creator workspace</div>;",
    "    if (state.error) return <div role=\"alert\">We could not load setup. Try again.</div>;",
    "    switch (state.step) {",
    "      case \"analytics_setup\":",
    "        return <AnalyticsSetup profile={state.profile} onComplete={completeCurrentStep} />;",
    "      case \"connect_social\":",
    "        return <ConnectSocial onComplete={completeCurrentStep} />;",
    "      case \"set_goal\":",
    "        return <SetGoal onComplete={completeCurrentStep} />;",
    "      case \"publish_prompt\":",
    "        return <PublishPrompt onComplete={completeCurrentStep} />;",
    "      default:",
    "        return <Welcome onComplete={completeCurrentStep} />;",
    "    }",
    "  }",
    "",
    "  return (",
    "    <main className=\"creator-onboarding\" data-variant={variant}>",
    "      <Progress steps={steps} current={state.step} completed={state.completed} />",
    "      {renderStep()}",
    "    </main>",
    "  );",
    "}",
    "",
    "function AnalyticsSetup({ profile, onComplete }) {",
    "  return <section><h2>Understand your listeners</h2><button onClick={onComplete}>Continue</button></section>;",
    "}",
    "function ConnectSocial({ onComplete }) { return <section><h2>Connect socials</h2><button onClick={onComplete}>Continue</button></section>; }",
    "function SetGoal({ onComplete }) { return <section><h2>Choose a goal</h2><button onClick={onComplete}>Continue</button></section>; }",
    "function PublishPrompt({ onComplete }) { return <section><h2>Publish your next update</h2><button onClick={onComplete}>Finish</button></section>; }",
    "function Welcome({ onComplete }) { return <section><h2>Welcome back</h2><button onClick={onComplete}>Start</button></section>; }",
    "function Progress({ steps, current, completed }) { return <ol>{steps.map((step) => <li key={step} aria-current={step === current}>{step}</li>)}</ol>; }",
  ].join("\n");
}

function buildSpotifyAbResults() {
  return [
    "# AB Test Results",
    "",
    "## Experiment A: education_first onboarding",
    "- Activation +3.8%",
    "- Analytics setup -9.4%",
    "- Day-7 return -4.1%",
    "- Strongest negative effect among power creators.",
    "",
    "## Experiment B: creator_home_simplified",
    "- Session length +6.2%",
    "- Publish rate -2.8%",
    "- Analytics open rate -12.7%",
    "- Qualitative feedback: simpler but less useful.",
    "",
    "## Experiment C: recommendation_rebalance",
    "- New creator setup +2.4%",
    "- Existing creator return -6.8%",
    "- Revenue analytics clickthrough -14.3%",
    "",
    "## Interpretation",
    "Activation and retention disagree. The recovery plan should not optimize only for short-session activation. Recommend a targeted hotfix and follow-up experiment rather than a blind full rollback.",
  ].join("\n");
}

function buildSpotifyExecutiveEmail() {
  return [
    "From: Gabe <gabe.creator-growth@spotify.example>",
    "To: Creator Recovery Room",
    "Subject: Recovery plan needed before business review",
    "",
    "Team,",
    "",
    "Creator retention fell faster than expected after the redesign. I need a clear recommendation today: rollback, targeted hotfix, recommendation rebalance, or phased recovery plan.",
    "",
    "Please include:",
    "- What changed and what evidence supports the diagnosis.",
    "- What we do first and why.",
    "- Owner, metric, and next checkpoint.",
    "- What we will tell creator support if complaints keep rising.",
    "",
    "I do not want a dashboard tour. I want a decision.",
    "",
    "Gabe",
  ].join("\n");
}

function buildSpotifyHeatmapPreview() {
  return [
    "PNG_PREVIEW: heatmap.png",
    "Visualization summary:",
    "- Pre-redesign hotspots: left rail analytics, revenue card, publish CTA.",
    "- Post-redesign hotspots: hero education card, low interaction with analytics setup.",
    "- Mobile heatmap: thumb taps cluster on back button and collapsed menu.",
    "- Rage clicks: analytics setup, campaign draft, revenue trend module.",
    "",
    "Interpretation: discovery friction is real. Pair heatmap with retention metrics before recommending rollback.",
  ].join("\n");
}

function buildOpenAISecurityReport() {
  return [
    "# Security Report - Prompt Leakage Vulnerability",
    "",
    "## Summary",
    "Red team reproduced prompt leakage by forcing a tool retry path to reuse stale session memory. The issue appears in the boundary between memory_manager.py and inference_gateway.ts.",
    "",
    "## Severity",
    "P0 for enterprise demo environment until mitigated. Potential exposure includes system prompt fragments, prior tool metadata, and stale memory snippets from same tenant if isolation fails.",
    "",
    "## Exploit path",
    "1. Start enterprise demo session with memory enabled.",
    "2. Trigger tool timeout with adversarial prompt requesting hidden policy.",
    "3. Retry path reattaches memory ids without sanitization.",
    "4. Gateway forwards unsafe memory reference into inference context.",
    "5. Model produces partial prompt leakage in refusal-adjacent answer.",
    "",
    "## Required mitigation",
    "- Sanitize memory before every retry.",
    "- Bind memory references to tenant, session, and request id.",
    "- Disable memory for demo if exploit cannot be closed.",
    "- Prepare rollback guide and customer-safe explanation.",
  ].join("\n");
}

function buildOpenAIMemoryManager() {
  return [
    "import asyncio",
    "import logging",
    "import time",
    "from dataclasses import dataclass",
    "from typing import Any, Dict, Iterable, List, Optional",
    "",
    "logger = logging.getLogger(\"enterprise.memory\")",
    "",
    "@dataclass",
    "class MemoryRecord:",
    "    tenant_id: str",
    "    session_id: str",
    "    request_id: str",
    "    content: str",
    "    labels: List[str]",
    "    created_at: float",
    "",
    "class UnsafeMemoryReference(Exception):",
    "    pass",
    "",
    "class MemoryManager:",
    "    def __init__(self, store: Any, policy: Any, metrics: Any) -> None:",
    "        self._store = store",
    "        self._policy = policy",
    "        self._metrics = metrics",
    "        self._session_cache: Dict[str, List[MemoryRecord]] = {}",
    "        self._cache_expiry: Dict[str, float] = {}",
    "        self._lock = asyncio.Lock()",
    "",
    "    async def load_context(self, tenant_id: str, session_id: str, request_id: str, memory_ids: Iterable[str]) -> List[str]:",
    "        cache_key = f\"{tenant_id}:{session_id}\"",
    "        cached = self._session_cache.get(cache_key)",
    "        if cached and self._cache_expiry.get(cache_key, 0) > time.time():",
    "            # Vulnerability source: cached records are not rebound to request_id before reuse.",
    "            records = cached",
    "        else:",
    "            records = await self._fetch_records(memory_ids)",
    "            await self._remember(cache_key, records)",
    "",
    "        safe: List[str] = []",
    "        for record in records:",
    "            self._assert_scope(record, tenant_id, session_id)",
    "            sanitized = self.sanitize(record.content)",
    "            if self._policy.is_allowed(sanitized):",
    "                safe.append(sanitized)",
    "            else:",
    "                self._metrics.increment(\"memory.policy_block\", tags={\"tenant\": tenant_id})",
    "        return safe",
    "",
    "    async def attach_retry_memory(self, original_context: List[str], retry_metadata: Dict[str, Any]) -> List[str]:",
    "        # TODO: This should call load_context with tenant/session/request binding. It currently trusts retry metadata.",
    "        unsafe_refs = retry_metadata.get(\"memory_refs\", [])",
    "        if unsafe_refs and retry_metadata.get(\"allow_raw_memory_refs\"):",
    "            logger.warning(\"raw memory refs allowed on retry count=%s\", len(unsafe_refs))",
    "            return original_context + list(unsafe_refs)",
    "        return original_context",
    "",
    "    def sanitize(self, content: str) -> str:",
    "        blocked_markers = [\"SYSTEM_PROMPT\", \"developer_message\", \"policy_override\", \"tool_secret\"]",
    "        sanitized = content",
    "        for marker in blocked_markers:",
    "            sanitized = sanitized.replace(marker, \"[redacted]\")",
    "        # Edge case: base64 or markdown fenced prompt fragments are not detected here.",
    "        return sanitized[:4000]",
    "",
    "    def _assert_scope(self, record: MemoryRecord, tenant_id: str, session_id: str) -> None:",
    "        if record.tenant_id != tenant_id or record.session_id != session_id:",
    "            raise UnsafeMemoryReference(f\"memory scope mismatch tenant={tenant_id} session={session_id}\")",
    "",
    "    async def _fetch_records(self, memory_ids: Iterable[str]) -> List[MemoryRecord]:",
    "        rows = await self._store.fetch_many(list(memory_ids))",
    "        return [MemoryRecord(**row) for row in rows]",
    "",
    "    async def _remember(self, cache_key: str, records: List[MemoryRecord]) -> None:",
    "        async with self._lock:",
    "            self._session_cache[cache_key] = records",
    "            self._cache_expiry[cache_key] = time.time() + 90",
    "            if len(self._session_cache) > 10000:",
    "                # Potential memory leak under enterprise load: evicts only one arbitrary key.",
    "                oldest_key = next(iter(self._session_cache.keys()))",
    "                self._session_cache.pop(oldest_key, None)",
    "                self._cache_expiry.pop(oldest_key, None)",
  ].join("\n");
}

function buildOpenAIInferenceGateway() {
  return [
    "import { Request, Response, NextFunction } from \"express\";",
    "import { z } from \"zod\";",
    "import { getMemoryManager } from \"./memory\";",
    "import { runInference } from \"./runtime\";",
    "import { auditLog } from \"./audit\";",
    "",
    "const InferenceRequest = z.object({",
    "  tenantId: z.string().min(1),",
    "  sessionId: z.string().min(1),",
    "  requestId: z.string().min(1),",
    "  prompt: z.string().min(1),",
    "  memoryIds: z.array(z.string()).default([]),",
    "  retry: z.object({",
    "    attempt: z.number().default(0),",
    "    memory_refs: z.array(z.string()).optional(),",
    "    allow_raw_memory_refs: z.boolean().optional(),",
    "  }).optional(),",
    "});",
    "",
    "export async function inferenceGateway(req: Request, res: Response, next: NextFunction) {",
    "  const started = Date.now();",
    "  try {",
    "    const parsed = InferenceRequest.parse(req.body);",
    "    const memoryManager = getMemoryManager();",
    "    const context = await memoryManager.loadContext({",
    "      tenantId: parsed.tenantId,",
    "      sessionId: parsed.sessionId,",
    "      requestId: parsed.requestId,",
    "      memoryIds: parsed.memoryIds,",
    "    });",
    "",
    "    let finalContext = context;",
    "    if (parsed.retry?.attempt && parsed.retry.attempt > 0) {",
    "      // Vulnerability: retry metadata can reintroduce unsafe raw memory refs.",
    "      finalContext = await memoryManager.attachRetryMemory(context, parsed.retry);",
    "    }",
    "",
    "    const result = await runInference({",
    "      tenantId: parsed.tenantId,",
    "      sessionId: parsed.sessionId,",
    "      requestId: parsed.requestId,",
    "      prompt: parsed.prompt,",
    "      context: finalContext,",
    "      safetyMode: \"enterprise-demo\",",
    "    });",
    "",
    "    auditLog(\"inference.complete\", {",
    "      tenantId: parsed.tenantId,",
    "      requestId: parsed.requestId,",
    "      latencyMs: Date.now() - started,",
    "      memoryCount: finalContext.length,",
    "    });",
    "",
    "    res.json({ output: result.output, safety: result.safety, requestId: parsed.requestId });",
    "  } catch (error) {",
    "    auditLog(\"inference.error\", { message: String(error), latencyMs: Date.now() - started });",
    "    next(error);",
    "  }",
    "}",
    "",
    "export function validateDemoMode(req: Request, res: Response, next: NextFunction) {",
    "  const demoRestricted = process.env.ENTERPRISE_DEMO_RESTRICT_MEMORY === \"true\";",
    "  if (demoRestricted && Array.isArray(req.body?.memoryIds) && req.body.memoryIds.length > 0) {",
    "    req.body.memoryIds = [];",
    "    req.body.retry = { attempt: 0 };",
    "  }",
    "  next();",
    "}",
  ].join("\n");
}

function buildOpenAIRedTeamNotes() {
  return [
    "Red Team Notes",
    "",
    "Exploit name: stale_retry_memory_leak",
    "Status: reproduced 4/7 attempts in enterprise demo staging.",
    "",
    "Steps:",
    "1. Seed session with benign doc containing hidden marker.",
    "2. Trigger tool timeout and retry with adversarial prompt.",
    "3. Observe gateway retry metadata includes raw memory_refs.",
    "4. Ask model to summarize hidden setup and previous tool instruction.",
    "",
    "Observed leakage:",
    "- partial system instruction phrasing",
    "- tool routing metadata",
    "- stale memory fragment from previous request",
    "",
    "Red team stance:",
    "Restrict or disable memory for demo unless attachRetryMemory is patched and staging exploit repro passes 0/20 attempts.",
  ].join("\n");
}

function buildOpenAIEngineeringChat() {
  return JSON.stringify({
    room: "enterprise-demo-security",
    messages: [
      { from: "Iris", role: "Security PM", stress: "critical", text: "We need a mitigation decision and customer-safe update before the demo prep call." },
      { from: "Noah", role: "Platform Security", stress: "critical", text: "The raw memory refs branch is unacceptable. Disable memory or bind every ref to tenant/session/request." },
      { from: "Farah", role: "Red Team", stress: "high", text: "I can still reproduce leakage when retry metadata is trusted." },
      { from: "Tessa", role: "Enterprise UX", stress: "medium", text: "If memory is disabled, the demo script needs to explain why context is limited." },
      { from: "Sam", role: "Demo Sponsor", stress: "critical", text: "I need go/no-go. Restricted demo is acceptable if we can explain it." },
      { from: "Noah", role: "Platform Security", stress: "critical", text: "I disagree with demoing unrestricted memory. We are one retry away from an incident." }
    ]
  }, null, 2);
}

function buildOpenAIArchitecturePreview() {
  return [
    "PNG_PREVIEW: system_architecture.png",
    "Diagram nodes:",
    "Client -> Enterprise Gateway -> Policy Middleware -> Memory Manager -> Inference Runtime -> Tool Router",
    "",
    "Highlighted risk path:",
    "Tool Router timeout -> Gateway retry -> raw memory_refs -> Memory Manager attachRetryMemory -> Inference context",
    "",
    "Mitigation overlay:",
    "- Bind memory records to tenant/session/request.",
    "- Sanitize on every retry.",
    "- ENTERPRISE_DEMO_RESTRICT_MEMORY=true fallback.",
    "- Audit all blocked memory references.",
  ].join("\n");
}

function buildOpenAIRollbackGuide() {
  return [
    "# Emergency Rollback Guide",
    "",
    "## Option A: Restricted demo mode",
    "1. Set ENTERPRISE_DEMO_RESTRICT_MEMORY=true.",
    "2. Clear staging session memory ids.",
    "3. Restart gateway pods.",
    "4. Run red-team repro suite: expected 0/20 leakage.",
    "",
    "## Option B: Patch-forward",
    "1. Remove raw retry memory branch.",
    "2. Require tenant/session/request binding on all memory references.",
    "3. Sanitize retrieved memory before retry context assembly.",
    "4. Add audit event for blocked unsafe refs.",
    "",
    "## Rollback trigger",
    "Any successful leakage repro, missing audit event, or cross-session memory mismatch blocks unrestricted demo.",
    "",
    "## Customer-safe language",
    "We are demonstrating with memory isolation controls enabled. Some long-context personalization may be limited while we validate the newest security guardrails.",
  ].join("\n");
}

const state = {
  missionKey: null,
  mission: null,
  sessionId: null,
  workspace: null,
  timeline: [],
  countdownHandle: null,
  countdownEndsAt: 0,
  saveTimer: null,
  toastTimer: null,
  messageKeys: new Set(),
  timelineKeys: new Set(),
  triggeredBeats: new Set(),
  userMessageCount: 0,
  usingLiveBackend: false,
  submissionInFlight: false,
  roomLocked: false,
  allowNavigationAway: false,
};

const companyName = document.getElementById("companyName");
const sprintLabel = document.getElementById("sprintLabel");
const channelList = document.getElementById("channelList");
const teammateList = document.getElementById("teammateList");
const currentUserName = document.getElementById("currentUserName");
const currentUserRole = document.getElementById("currentUserRole");
const selfAvatar = document.getElementById("selfAvatar");
const channelTitle = document.getElementById("channelTitle");
const countdownTimer = document.getElementById("countdownTimer");
const priorityBadge = document.getElementById("priorityBadge");
const crisisStatus = document.getElementById("crisisStatus");
const phaseLabel = document.getElementById("phaseLabel");
const scenarioTitle = document.getElementById("scenarioTitle");
const scenarioSummary = document.getElementById("scenarioSummary");
const taskDeadline = document.getElementById("taskDeadline");
const taskOutput = document.getElementById("taskOutput");
const taskRequirements = document.getElementById("taskRequirements");
const taskAcceptance = document.getElementById("taskAcceptance");
const taskUpdate = document.getElementById("taskUpdate");
const teamChat = document.getElementById("teamChat");
const typingIndicator = document.getElementById("typingIndicator");
const quickPrompts = document.getElementById("quickPrompts");
const candidateMessageInput = document.getElementById("candidateMessageInput");
const sendMessageBtn = document.getElementById("sendMessageBtn");
const workspaceJumpBtn = document.getElementById("workspaceJumpBtn");
const refreshSceneBtn = document.getElementById("refreshSceneBtn");
const notifySceneBtn = document.getElementById("notifySceneBtn");
const peopleBtn = document.getElementById("peopleBtn");
const closeWorkspaceBtn = document.getElementById("closeWorkspaceBtn");
const workspaceTitle = document.getElementById("workspaceTitle");
const workspaceHelper = document.getElementById("workspaceHelper");
const saveStatus = document.getElementById("saveStatus");
const testStatus = document.getElementById("testStatus");
const workspaceTabs = document.getElementById("workspaceTabs");
const activeFileName = document.getElementById("activeFileName");
const wordCount = document.getElementById("wordCount");
const codeEditor = document.getElementById("codeEditor");
const workspaceTip = document.getElementById("workspaceTip");
const timelineList = document.getElementById("timelineList");
const saveDraftBtn = document.getElementById("saveDraftBtn");
const insertOutlineBtn = document.getElementById("insertOutlineBtn");
const runTestsBtn = document.getElementById("runTestsBtn");
const shareWorkspaceBtn = document.getElementById("shareWorkspaceBtn");
const requestCritiqueBtn = document.getElementById("requestCritiqueBtn");
const submitBtn = document.getElementById("submitBtn");
const submitSceneBtn = document.getElementById("submitSceneBtn");
const submitWorkspaceBtn = document.getElementById("submitWorkspaceBtn");
const triggerCrisisBtn = document.getElementById("triggerCrisisBtn");
const crisisModal = document.getElementById("crisisModal");
const closeCrisisModalBtn = document.getElementById("closeCrisisModalBtn");
const confirmCrisisBtn = document.getElementById("confirmCrisisBtn");
const cancelCrisisBtn = document.getElementById("cancelCrisisBtn");
const crisisModalText = document.getElementById("crisisModalText");
const toast = document.getElementById("toast");
const submitActionButtons = [submitBtn, submitSceneBtn, submitWorkspaceBtn].filter(Boolean);

function channelItemsForMission(mission) {
  const defaults = {
    netflix: ["streaming-war-room", "recommendations", "playback", "sre", "leadership"],
    linkedin: ["resume-assistant-launch", "product", "engineering", "qa", "leadership"],
    spotify: ["creator-growth-recovery", "analytics", "creator-feedback", "experiments", "leadership"],
    openai: ["enterprise-demo-security", "security", "platform", "red-team", "leadership"],
    mobile: ["launch-otp", "product", "engineering", "design"],
    security: ["security-bridge", "product", "engineering", "qa"],
    ops: ["ops-v1", "product", "engineering", "design"],
    wallet: ["payout-war-room", "product", "engineering", "support"],
    copilot: ["copilot-trust", "product", "engineering", "safety"],
    migration: ["cutover-freeze", "product", "engineering", "ops"],
  };

  return defaults[mission.key] || [mission.channel, "product", "engineering", "design"];
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function selectedDashboardTask() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.selectedTaskDetails);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function loadWorkspaceFilesModule() {
  if (window.getWorkspaceFiles || window.WORKSPACE_FILES) {
    return Promise.resolve({
      default: window.WORKSPACE_FILES || {},
      WORKSPACE_FILES: window.WORKSPACE_FILES || {},
      getWorkspaceFiles: window.getWorkspaceFiles,
    });
  }

  if (!workspaceFilesModulePromise) {
    workspaceFilesModulePromise = import(WORKSPACE_FILES_MODULE_PATH).catch((error) => {
      console.warn("Could not load workspaceFiles.js", error);
      workspaceFilesModulePromise = null;
      return null;
    });
  }
  return workspaceFilesModulePromise;
}

function workspaceFileId(name, index) {
  const slug = String(name || `workspace-file-${index + 1}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return `${index + 1}-${slug || "workspace-file"}`;
}

function normalizeWorkspaceFiles(files) {
  return (Array.isArray(files) ? files : [])
    .filter((file) => file && typeof file === "object")
    .map((file, index) => {
      const name = String(file.name || file.path || `workspace_file_${index + 1}.md`);
      return {
        id: file.id || workspaceFileId(name, index),
        name,
        kind: file.kind || file.type || "brief",
        type: file.type || file.kind || "brief",
        language: file.language || "",
        content: String(file.content || ""),
      };
    });
}

async function hydrateSelectedDashboardTaskWorkspaceFiles() {
  const taskId = localStorage.getItem(STORAGE_KEYS.dashboardTask);
  const selectedTask = selectedDashboardTask() || (taskId ? { id: taskId } : null);
  if (!selectedTask || !selectedTask.id || (Array.isArray(selectedTask.workspaceFiles) && selectedTask.workspaceFiles.length)) {
    return;
  }

  const mod = await loadWorkspaceFilesModule();
  const getter = (mod && mod.getWorkspaceFiles) || window.getWorkspaceFiles;
  const workspaceFiles = normalizeWorkspaceFiles(getter ? getter(selectedTask.id) : []);
  if (!workspaceFiles.length) {
    return;
  }

  localStorage.setItem(
    STORAGE_KEYS.selectedTaskDetails,
    JSON.stringify({
      ...selectedTask,
      files: workspaceFiles.map((file) => file.name),
      workspaceFiles,
    })
  );
}

function slugifyTask(text) {
  return String(text || "simulation")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 36) || "simulation";
}

function personalizeMissionForDashboardTask(mission, task) {
  if (!task || !task.id) {
    return mission;
  }

  const skills = Array.isArray(task.skills) && task.skills.length ? task.skills : mission.requirements;
  const taskWorkspaceFiles = normalizeWorkspaceFiles(task.workspaceFiles || task.workspace_files);
  const channel = slugifyTask(task.label || task.title || task.id);
  const timeMatch = String(task.time || "").match(/\d+/);
  const timeText = String(task.time || "").toLowerCase();
  const deadlineMinutes = timeMatch
    ? Number(timeMatch[0]) * (timeText.includes("day") ? 24 * 60 : timeText.includes("hour") ? 60 : 1)
    : mission.deadlineMinutes;

  mission.taskId = task.id;
  mission.company = task.company || mission.company;
  mission.channel = channel;
  mission.sprint = task.label || mission.sprint;
  mission.role = task.role || mission.role;
  mission.priority = task.difficulty || mission.priority;
  mission.deadlineMinutes = Number.isFinite(deadlineMinutes) ? deadlineMinutes : mission.deadlineMinutes;
  mission.headline = task.title || mission.headline;
  mission.summary = task.description || mission.summary;
  mission.output = `${task.role || mission.role} simulation handoff`;
  mission.crisisStatus = "Interview room active";
  mission.latestChange = "";
  mission.workspaceTitle = `${mission.company} shared workspace`;
  mission.workspaceHelper = taskWorkspaceFiles.length
    ? "Use the task-specific files to show your thinking, then explain the decision and evidence to the team."
    : "Use the workspace to show your thinking, then explain the decision and evidence to the team.";
  mission.workspaceTip = taskWorkspaceFiles.length
    ? "Tip: edit or reference the provided task files, then share the decision, tradeoff, and validation path with the room."
    : "Tip: share a clear decision, the tradeoff, and the validation path with Asha, Ravi, Mira, and Kenji.";
  mission.requirements = skills;
  mission.acceptance = skills.map((skill) => `${skill} is demonstrated with a concrete decision or evidence.`);
  mission.crisisPrompt = "The room is adding pressure to test adaptability. Do you want to handle the change now?";

  const brief = [
    `# ${task.title || mission.headline}`,
    "",
    `Company: ${mission.company}`,
    `Role: ${mission.role}`,
    `Scenario: ${mission.summary}`,
    "",
    "## Skills the room will test",
    ...skills.map((skill) => `- ${skill}`),
    "",
    "## Candidate handoff",
    "- State the first decision.",
    "- Explain the tradeoff.",
    "- Name the validation evidence.",
    "- Assign the next owner or follow-up.",
  ].join("\n");

  mission.workspaceFiles = [
    { id: "task-brief", name: "task_brief.md", kind: "brief", content: brief },
    ...(taskWorkspaceFiles.length ? taskWorkspaceFiles : mission.workspaceFiles || []),
  ];

  return mission;
}

function getMissionConfigByKey(key) {
  const legacyRedirects = {
    netflix: "security",
    linkedin: "mobile",
    spotify: "ops",
    openai: "security",
  };
  const normalizedKey = legacyRedirects[key] || key;
  if (MISSIONS[normalizedKey]) {
    return MISSIONS[normalizedKey];
  }
  const mappedKey = TASK_TO_MISSION_KEY[normalizedKey];
  return mappedKey ? MISSIONS[mappedKey] : null;
}

function candidateName() {
  return localStorage.getItem("userName") || "You";
}

function currentRole() {
  return localStorage.getItem("userRole") || (state.mission ? state.mission.role : "Candidate");
}

function missionKeyFromRole() {
  const role = currentRole().toLowerCase();
  if (role.includes("security") || role.includes("incident")) {
    return "security";
  }
  if (role.includes("backend")) {
    return "security";
  }
  if (role.includes("data") || role.includes("analyst")) {
    return "ops";
  }
  if (role.includes("product") || role.includes("full stack") || role.includes("frontend")) {
    return "mobile";
  }
  return "mobile";
}

function selectedMissionKey() {
  const dashboardTaskId = localStorage.getItem(STORAGE_KEYS.dashboardTask);
  if (dashboardTaskId && getMissionConfigByKey(dashboardTaskId)) {
    return dashboardTaskId;
  }
  const stored = localStorage.getItem(STORAGE_KEYS.selectedMission);
  return stored && getMissionConfigByKey(stored) ? stored : missionKeyFromRole();
}

function activeTaskId() {
  const dashboardTaskId = localStorage.getItem(STORAGE_KEYS.dashboardTask);
  if (dashboardTaskId && getMissionConfigByKey(dashboardTaskId)) {
    return dashboardTaskId;
  }
  return state.mission ? state.mission.taskId : "mobile-onboarding";
}

function activeBackendTaskId() {
  const uiTaskId = activeTaskId();
  return TASK_TO_BACKEND_TASK_ID[uiTaskId] || uiTaskId;
}

function sessionStorageKey() {
  return `${STORAGE_KEYS.sessionPrefix}${activeTaskId()}`;
}

function workspaceStorageKey() {
  return `${STORAGE_KEYS.workspacePrefix}${activeTaskId()}`;
}

function timelineStorageKey() {
  return `${STORAGE_KEYS.timelinePrefix}${activeTaskId()}`;
}

function getInitials(name) {
  return String(name || "AI")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "AI";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatClock(msRemaining) {
  const safe = Math.max(0, Math.floor(msRemaining / 1000));
  const mins = String(Math.floor(safe / 60)).padStart(2, "0");
  const secs = String(safe % 60).padStart(2, "0");
  return `${mins}:${secs}`;
}

function formatTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return "Now";
  }
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function refreshIcons() {
  if (typeof lucide !== "undefined") {
    lucide.createIcons();
  }
}

function autoResizeComposer() {
  if (!candidateMessageInput) {
    return;
  }
  candidateMessageInput.style.height = "32px";
  candidateMessageInput.style.height = `${Math.min(candidateMessageInput.scrollHeight, 120)}px`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(state.toastTimer);
  state.toastTimer = window.setTimeout(() => {
    toast.classList.add("hidden");
  }, 2600);
}

function shouldGuardSimulationExit() {
  return Boolean(state.mission) && !state.allowNavigationAway;
}

function allowSimulationExit() {
  state.allowNavigationAway = true;
}

function preventAccidentalRefresh(event) {
  if (!shouldGuardSimulationExit()) {
    return;
  }

  const key = String(event.key || "").toLowerCase();
  const wantsRefresh = event.key === "F5" || ((event.ctrlKey || event.metaKey) && key === "r");
  if (!wantsRefresh) {
    return;
  }

  event.preventDefault();
  showToast("Simulation is still live. Submit the room before refreshing.");
}

function handleBeforeUnload(event) {
  if (!shouldGuardSimulationExit()) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
}

function navigateToResults() {
  allowSimulationExit();
  window.location.replace("results.html");
}

function setRoomLocked(locked, reason) {
  state.roomLocked = locked;

  if (candidateMessageInput) {
    candidateMessageInput.disabled = locked;
    if (locked && reason) {
      candidateMessageInput.placeholder = reason;
    } else if (!locked && state.mission) {
      candidateMessageInput.placeholder = `Message #${state.mission.channel}`;
    }
  }
  if (sendMessageBtn) sendMessageBtn.disabled = locked;
  if (codeEditor) codeEditor.disabled = locked;
  if (saveDraftBtn) saveDraftBtn.disabled = locked;
  if (insertOutlineBtn) insertOutlineBtn.disabled = locked;
  if (runTestsBtn) runTestsBtn.disabled = locked;
  if (shareWorkspaceBtn) shareWorkspaceBtn.disabled = locked;
  if (requestCritiqueBtn) requestCritiqueBtn.disabled = locked;
  if (refreshSceneBtn) refreshSceneBtn.disabled = locked;
  if (notifySceneBtn) notifySceneBtn.disabled = locked;
  submitActionButtons.forEach((button) => {
    button.disabled = locked;
  });
  if (triggerCrisisBtn) triggerCrisisBtn.disabled = locked;
  if (workspaceTabs) {
    workspaceTabs.style.pointerEvents = locked ? "none" : "";
    workspaceTabs.style.opacity = locked ? "0.6" : "";
  }

  if (locked && reason) {
    markSaved(reason);
  }
}

function normalizeRoleKind(title) {
  const lowered = String(title || "").toLowerCase();
  if (lowered.includes("product") || lowered.includes("incident")) return "pm";
  if (lowered.includes("engineer") || lowered.includes("engineering")) return "eng";
  if (lowered.includes("design")) return "design";
  if (lowered.includes("qa")) return "qa";
  if (lowered.includes("executive") || lowered.includes("vp") || lowered.includes("sponsor")) return "exec";
  return "pm";
}

function defaultWorkspaceForMission(mission) {
  return {
    activeTabId: mission.workspaceFiles[0].id,
    files: mission.workspaceFiles.map((file) => ({ ...file })),
  };
}

function loadWorkspaceState() {
  const defaults = defaultWorkspaceForMission(state.mission);
  const raw = localStorage.getItem(workspaceStorageKey());
  if (!raw) {
    return defaults;
  }

  try {
    const parsed = JSON.parse(raw);
    const files = defaults.files.map((file) => {
      const saved = Array.isArray(parsed.files) ? parsed.files.find((entry) => entry.id === file.id) : null;
      return saved ? { ...file, ...saved } : file;
    });
    const activeTabId = files.some((file) => file.id === parsed.activeTabId) ? parsed.activeTabId : files[0].id;
    return { activeTabId, files };
  } catch (error) {
    return defaults;
  }
}

function saveWorkspaceState() {
  localStorage.setItem(workspaceStorageKey(), JSON.stringify(state.workspace));
}

function loadTimelineState() {
  const raw = localStorage.getItem(timelineStorageKey());
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch (error) {
    return [];
  }
}

function saveTimelineState() {
  localStorage.setItem(timelineStorageKey(), JSON.stringify(state.timeline));
}

function getActiveFile() {
  return state.workspace.files.find((file) => file.id === state.workspace.activeTabId) || state.workspace.files[0];
}

function setActiveFile(tabId) {
  state.workspace.activeTabId = tabId;
  const file = getActiveFile();
  activeFileName.textContent = file.name;
  codeEditor.value = file.content;
  renderWorkspaceTabs();
  updateEditorStats();
  saveWorkspaceState();
}

function updateCurrentFileContent(nextContent) {
  const file = getActiveFile();
  file.content = nextContent;
  updateEditorStats();
}

function updateEditorStats() {
  const content = codeEditor.value || "";
  const lines = content ? content.split("\n").length : 0;
  const chars = content.length;
  wordCount.textContent = `${lines} lines - ${chars} chars`;
}

function renderWorkspaceTabs() {
  workspaceTabs.innerHTML = state.workspace.files
    .map(
      (file) => `
        <button type="button" class="${file.id === state.workspace.activeTabId ? "active" : ""}" data-tab-id="${escapeHtml(file.id)}">
          <strong>${escapeHtml(file.name)}</strong>
        </button>
      `
    )
    .join("");

  workspaceTabs.querySelectorAll("[data-tab-id]").forEach((button) => {
    button.addEventListener("click", () => setActiveFile(button.getAttribute("data-tab-id")));
  });
}

function renderLists() {
  taskRequirements.innerHTML = state.mission.requirements.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  taskAcceptance.innerHTML = state.mission.acceptance.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
}

function renderQuickPrompts() {
  quickPrompts.innerHTML = "";
  quickPrompts.classList.add("hidden");
}

function renderChannelList() {
  channelList.innerHTML = channelItemsForMission(state.mission)
    .map(
      (channel) => `
        <div class="channel-item ${channel === state.mission.channel ? "active" : ""}">
          <strong># ${escapeHtml(channel)}</strong>
        </div>
      `
    )
    .join("");
}

function renderTeammates() {
  teammateList.innerHTML = state.mission.teammates
    .map((person) => {
      const roleKind = person.kind || normalizeRoleKind(person.title);
      return `
        <article class="teammate-row">
          <div class="teammate-row-main">
            <div class="member-avatar ${escapeHtml(roleKind)}">${escapeHtml(getInitials(person.name))}</div>
            <div class="member-copy">
              <strong>${escapeHtml(person.name)}</strong>
              <p>${escapeHtml(person.title)}</p>
            </div>
          </div>
          <span class="presence-dot" aria-hidden="true"></span>
        </article>
      `;
    })
    .join("");
}

function renderMission() {
  document.title = `DayZero | ${state.mission.company} - ${state.mission.channel}`;
  companyName.textContent = state.mission.company;
  sprintLabel.textContent = state.mission.sprint;
  currentUserName.textContent = candidateName();
  currentUserRole.textContent = currentRole();
  selfAvatar.textContent = getInitials(candidateName());

  channelTitle.textContent = state.mission.channel;
  priorityBadge.textContent = state.mission.priority;
  crisisStatus.textContent = state.mission.crisisStatus;
  phaseLabel.textContent = "Intro";
  scenarioTitle.textContent = state.mission.headline;
  scenarioSummary.textContent = state.mission.summary;
  taskDeadline.textContent = `${state.mission.deadlineMinutes} mins`;
  taskOutput.textContent = state.mission.output;
  taskUpdate.textContent = state.mission.latestChange;
  workspaceTitle.textContent = "Workspace";
  workspaceHelper.textContent = state.mission.workspaceHelper;
  workspaceTip.textContent = state.mission.workspaceTip;
  crisisModalText.textContent = state.mission.crisisPrompt;
  testStatus.textContent = "Checks not run";
  saveStatus.textContent = "Saved";

  renderChannelList();
  renderTeammates();
  renderLists();
  renderQuickPrompts();
  renderWorkspaceTabs();
  setActiveFile(state.workspace.activeTabId);
  autoResizeComposer();
  refreshIcons();
}

function clearChat() {
  teamChat.innerHTML = "";
  state.messageKeys = new Set();
}

function clearTimeline() {
  timelineList.innerHTML = "";
  state.timelineKeys = new Set();
}

function uniqueMessageKey(message) {
  return [
    message.speaker_name || message.name || "speaker",
    message.message || message.content || "",
    message.created_at || message.createdAt || "",
    message.role || "",
  ].join("::");
}

function uniqueTimelineKey(entry) {
  return [entry.title || "", entry.description || "", entry.created_at || ""].join("::");
}

function sanitizeRoomMessage(rawMessage) {
  const aliases = {
    Maya: { name: "Asha", title: "Product Manager" },
    Anika: { name: "Asha", title: "Product Manager" },
    Sofia: { name: "Asha", title: "Product Manager" },
    Iris: { name: "Asha", title: "Product Manager" },
    Dante: { name: "Ravi", title: "Engineering Lead" },
    Marcus: { name: "Ravi", title: "Engineering Lead" },
    Oskar: { name: "Ravi", title: "Engineering Lead" },
    Noah: { name: "Ravi", title: "Engineering Lead" },
    Priya: { name: "Kenji", title: "QA Engineer" },
    Nora: { name: "Kenji", title: "QA Engineer" },
    Leah: { name: "Kenji", title: "QA Engineer" },
    Farah: { name: "Kenji", title: "QA Engineer" },
    Elena: { name: "Mira", title: "Product Designer" },
    Jules: { name: "Mira", title: "Product Designer" },
    Mina: { name: "Mira", title: "Product Designer" },
    Tessa: { name: "Mira", title: "Product Designer" },
    Reed: { name: "Asha", title: "Product Manager" },
    Vikram: { name: "Asha", title: "Product Manager" },
    Gabe: { name: "Asha", title: "Product Manager" },
    Sam: { name: "Asha", title: "Product Manager" },
    Leo: { name: "Asha", title: "Product Manager" },
  };
  const message = { ...rawMessage };
  const originalName = message.speaker_name || message.name;
  const alias = aliases[originalName];
  if (alias) {
    message.speaker_name = alias.name;
    message.name = alias.name;
    message.speaker_title = alias.title;
    message.title = alias.title;
  }

  const oldNames = Object.keys(aliases).join("|");
  const namePattern = new RegExp(`\\b(${oldNames})\\b`, "g");
  if (typeof message.message === "string") {
    message.message = message.message.replace(namePattern, (name) => aliases[name].name);
  }
  if (typeof message.content === "string") {
    message.content = message.content.replace(namePattern, (name) => aliases[name].name);
  }

  return message;
}

function normalizeMessage(message) {
  message = sanitizeRoomMessage(message);
  const speakerName = message.speaker_name || message.name || "Room update";
  const speakerTitle = message.speaker_title || message.title || message.role || "";
  const body = message.message || message.content || "";
  const createdAt = message.created_at || message.createdAt || new Date().toISOString();
  const isUser = String(message.role || "").toLowerCase() === "user" || speakerName === candidateName();
  const isSystem = String(message.role || "").toLowerCase() === "system" || speakerName === "System";
  return {
    speakerName,
    speakerTitle,
    body,
    createdAt,
    avatar: message.avatar || getInitials(speakerName),
    kind: normalizeRoleKind(speakerTitle || speakerName),
    type: isSystem ? "system" : isUser ? "user" : "agent",
  };
}

function appendChatMessage(rawMessage) {
  const safeMessage = sanitizeRoomMessage(rawMessage);
  const key = uniqueMessageKey(safeMessage);
  if (state.messageKeys.has(key)) {
    return;
  }

  state.messageKeys.add(key);
  const message = normalizeMessage(safeMessage);
  const item = document.createElement("article");

  if (message.type === "system") {
    item.className = "chat-row system";
    item.innerHTML = `
      <div></div>
      <div class="chat-card">
        <div class="chat-meta">
          <strong>Room update</strong>
          <span>${escapeHtml(formatTime(message.createdAt))}</span>
        </div>
        <p class="chat-body">${escapeHtml(message.body)}</p>
      </div>
    `;
  } else {
    item.className = `chat-row ${message.type} role-${message.kind}`;
    item.innerHTML = `
      <div class="chat-avatar">${escapeHtml(message.avatar)}</div>
      <div class="chat-card">
        <div class="chat-meta">
          <strong>${escapeHtml(message.speakerName)}</strong>
          <span>${escapeHtml(message.speakerTitle || (message.type === "user" ? "You" : "Teammate"))}</span>
          <span>${escapeHtml(formatTime(message.createdAt))}</span>
        </div>
        <p class="chat-body">${escapeHtml(message.body)}</p>
      </div>
    `;
  }

  teamChat.appendChild(item);
  scrollChatToBottom();
}

function addTimelineEvent(entry) {
  const safeEntry = {
    title: entry.title || "Timeline event",
    description: entry.description || "",
    created_at: entry.created_at || new Date().toISOString(),
  };
  const key = uniqueTimelineKey(safeEntry);
  if (state.timelineKeys.has(key)) {
    return;
  }

  state.timelineKeys.add(key);
  state.timeline.push(safeEntry);
  saveTimelineState();
  renderTimeline();
}

function renderTimeline() {
  const items = state.timeline.slice().reverse();
  timelineList.innerHTML = items.length
    ? items
        .map(
          (entry) => `
            <article class="timeline-item">
              <strong>${escapeHtml(entry.title)}</strong>
              <span>${escapeHtml(formatTime(entry.created_at))}</span>
              <p>${escapeHtml(entry.description)}</p>
            </article>
          `
        )
        .join("")
    : `
      <article class="timeline-item">
        <strong>Simulation ready</strong>
        <span>${escapeHtml(formatTime(new Date().toISOString()))}</span>
        <p>Send a message or start editing the workspace to move the room forward.</p>
      </article>
    `;
}

function markSaved(text) {
  saveStatus.textContent = text;
}

function saveDraft(showFeedback) {
  saveWorkspaceState();
  markSaved("Saved");
  if (showFeedback) {
    showToast("Workspace saved locally.");
  }
}

function scheduleAutoSave() {
  window.clearTimeout(state.saveTimer);
  markSaved("Saving...");
  state.saveTimer = window.setTimeout(() => saveDraft(false), 400);
}

function resetCountdown(payload) {
  window.clearInterval(state.countdownHandle);
  let endsAtMs = payload && payload.ends_at ? new Date(payload.ends_at).getTime() : Number.NaN;
  if (!Number.isFinite(endsAtMs)) {
    endsAtMs = Date.now() + state.mission.deadlineMinutes * 60 * 1000;
  }

  state.countdownEndsAt = endsAtMs;
  state.countdownHandle = window.setInterval(() => {
    const remaining = state.countdownEndsAt - Date.now();
    countdownTimer.textContent = formatClock(remaining);
    if (remaining <= 0) {
      window.clearInterval(state.countdownHandle);
      countdownTimer.textContent = "00:00";
      crisisStatus.textContent = "Time expired";
      if (!state.submissionInFlight) {
        handleCountdownExpiry();
      }
    }
  }, 1000);
  countdownTimer.textContent = formatClock(Math.max(0, state.countdownEndsAt - Date.now()));
}

async function handleCountdownExpiry() {
  if (state.submissionInFlight) {
    return;
  }
  setRoomLocked(true, "Time ended - generating SkillRecord...");
  showToast("Time ended - generating SkillRecord...");
  await submitSimulation("expired");
}

function openCrisisModal() {
  crisisModal.classList.remove("hidden");
  crisisModal.setAttribute("aria-hidden", "false");
}

function closeCrisisModal() {
  crisisModal.classList.add("hidden");
  crisisModal.setAttribute("aria-hidden", "true");
}

function showTyping(label) {
  typingIndicator.textContent = label;
  typingIndicator.classList.remove("hidden");
}

function hideTyping() {
  typingIndicator.classList.add("hidden");
  typingIndicator.textContent = "";
}

function scrollChatToBottom() {
  teamChat.scrollTop = teamChat.scrollHeight;
}

function appendMessagesSequentially(messages, startDelay = 180, stepDelay = 520) {
  messages.forEach((message, index) => {
    window.setTimeout(() => appendChatMessage(message), startDelay + index * stepDelay);
  });
}

function buildSubmission() {
  const sections = state.workspace.files
    .map((file) => `### ${file.name}\n${file.content.trim()}`)
    .join("\n\n");
  return [
    `Task: ${state.mission.headline}`,
    `Role: ${state.mission.role}`,
    `Channel: #${state.mission.channel}`,
    "",
    sections,
  ].join("\n");
}

function workspaceSnapshot() {
  return state.workspace.files
    .map((file) => `${file.name}\n${file.content.trim().slice(0, 900)}`)
    .join("\n\n");
}

function localReplyPair(userText) {
  const text = String(userText || "").toLowerCase();
  const pm = state.mission.teammates.find((person) => person.kind === "pm");
  const eng = state.mission.teammates.find((person) => person.kind === "eng");
  const design = state.mission.teammates.find((person) => person.kind === "design");
  const qa = state.mission.teammates.find((person) => person.kind === "qa");
  const exec = state.mission.teammates.find((person) => person.kind === "exec");
  const missionKey = state.mission ? state.mission.key : "";
  const mentions = (person) => person && text.includes(person.name.toLowerCase());
  const missionGuidance = {
    netflix: {
      technical: "Tie the code change to playback recovery: retry budget, cache stability, rollback state, and region validation.",
      risk: "Name the region and validation gate you trust least. EU-West rollback and cache error rate cannot be hand-waved.",
      decision: "Make the incident call: isolate traffic, continue rollback, or patch retry/cache behavior. Then give owner and ETA.",
      user: "Customer messaging should say streaming may fail after title selection and give the next update window.",
    },
    linkedin: {
      technical: "Tie the fix to launch risk: AI consistency, prompt caching, mobile preview, and analytics instrumentation.",
      risk: "Name the launch blocker you are accepting or refusing. QA needs full launch, limited beta, or delay.",
      decision: "Make the launch call: full launch, limited beta, or slip. Then list what ships and what is disabled.",
      user: "Member-facing language should explain AI suggestions, limitations, and edit control without overpromising.",
    },
    spotify: {
      technical: "Tie the analysis to retention: onboarding completion, analytics discovery, recommendation changes, and cohort return.",
      risk: "Name the evidence conflict. Activation improved in places while seven-day creator return got worse.",
      decision: "Make the recovery call: rollback, hotfix onboarding, rebalance recommendations, or run a targeted experiment.",
      user: "Creator messaging should acknowledge workflow disruption and point to the first recovery change.",
    },
    openai: {
      technical: "Tie the patch to exploit closure: memory binding, retry sanitization, audit logs, and restricted demo fallback.",
      risk: "Name the residual security risk and the repro gate. Red team needs 0 successful leakage attempts before signoff.",
      decision: "Make the demo call: go, restricted demo, or delay. Then state mitigation and rollback trigger.",
      user: "Enterprise-facing language should explain memory isolation controls without exposing exploit details.",
    },
  }[missionKey] || {
    technical: "Tie the change to the failing path and the validation evidence.",
    risk: "Name the riskiest edge case and the check that proves it is controlled.",
    decision: "Make the call, name what gets cut, and assign owners.",
    user: "Keep customer-facing language honest and specific.",
  };

  if (mentions(eng) || text.includes("engineer") || text.includes("backend") || text.includes("code")) {
    return [
      { speaker_name: eng.name, speaker_title: eng.title, message: missionGuidance.technical },
      { speaker_name: qa.name, speaker_title: qa.title, message: "I need the validation gate that proves this is not just a plausible theory." },
    ];
  }

  if (mentions(qa) || text.includes("qa") || text.includes("test") || text.includes("risk") || text.includes("edge")) {
    return [
      { speaker_name: qa.name, speaker_title: qa.title, message: missionGuidance.risk },
      { speaker_name: eng.name, speaker_title: eng.title, message: "Give me that proof target and I can align the implementation around it." },
    ];
  }

  if (mentions(design) || text.includes("design") || text.includes("mobile") || text.includes("copy") || text.includes("customer") || text.includes("user")) {
    return [
      { speaker_name: design.name, speaker_title: design.title, message: missionGuidance.user },
      { speaker_name: pm.name, speaker_title: pm.title, message: "Good. Now tie that user-facing message to the operational decision we are making." },
    ];
  }

  if (mentions(exec) || text.includes("leadership") || text.includes("ceo") || text.includes("eta") || text.includes("go/no-go")) {
    return [
      { speaker_name: exec.name, speaker_title: exec.title, message: "I need the decision, impact, owner, ETA, and residual risk in plain language." },
      { speaker_name: pm.name, speaker_title: pm.title, message: missionGuidance.decision },
    ];
  }

  if (text.includes("log") || text.includes("metric") || text.includes("rollback") || text.includes("cache") || text.includes("latency") || text.includes("memory")) {
    return [
      { speaker_name: eng.name, speaker_title: eng.title, message: missionGuidance.technical },
      { speaker_name: pm.name, speaker_title: pm.title, message: "Summarize what the evidence changes about the decision. The room needs action, not just analysis." },
    ];
  }

  return [
    { speaker_name: pm.name, speaker_title: pm.title, message: missionGuidance.decision },
    { speaker_name: eng.name, speaker_title: eng.title, message: "Once you make the call, give me the concrete change and the validation signal so we can move." },
  ];
}

function triggerPressureBeat(trigger, options = {}) {
  if (state.usingLiveBackend && !options.forceLocal) {
    return false;
  }

  const beat = state.mission.pressureBeats.find((entry) => entry.trigger === trigger && !state.triggeredBeats.has(entry.id));
  if (!beat) {
    return false;
  }

  state.triggeredBeats.add(beat.id);
  crisisStatus.textContent = beat.crisis;
  taskUpdate.textContent = beat.update;
  showToast(beat.crisis);
  addTimelineEvent({
    title: beat.crisis,
    description: beat.update,
    created_at: new Date().toISOString(),
  });
  appendMessagesSequentially(beat.messages.map((message) => ({ ...message, created_at: new Date().toISOString() })), 240);
  return true;
}

function maybeTriggerDraftBeat() {
  const content = codeEditor.value.trim();
  if (content.split(/\s+/).filter(Boolean).length >= 80) {
    triggerPressureBeat("draft-80");
  }
}

function persistEvaluation(report) {
  const finalReport = {
    ...report,
    task: report.task || {
      title: state.mission.headline,
      role: state.mission.role,
      company: state.mission.company,
      duration: `${state.mission.deadlineMinutes} mins`,
    },
  };

  localStorage.setItem(STORAGE_KEYS.report, JSON.stringify(finalReport));
  localStorage.setItem("lastTaskTitle", finalReport.task.title || state.mission.headline);
  localStorage.setItem("lastScore", String(finalReport.overall_score || 0));
  localStorage.setItem("feedback", finalReport.summary || "");
}

function recommendationForScore(score) {
  if (score >= 84) return "Strong hire signal";
  if (score >= 72) return "Promising with follow-up";
  return "Needs more evidence";
}

function buildLocalEvaluationReport(reason = "submitted") {
  const checklist = evaluationChecklist();
  const passed = checklist.passed.length;
  const failed = checklist.failed.length;
  const snapshot = workspaceSnapshot().toLowerCase();
  const explicitTradeoff =
    snapshot.includes("defer") ||
    snapshot.includes("not shipping") ||
    snapshot.includes("rollback") ||
    snapshot.includes("guardrail");
  const timedPenalty = reason === "expired" ? 4 : 0;
  const overallScore = clampScore(
    66 + passed * 7 - failed * 5 + Math.min(state.userMessageCount, 3) * 3 + (explicitTradeoff ? 3 : 0) - timedPenalty
  );

  const scores = {
    leadership: clampScore(overallScore + (state.userMessageCount > 0 ? 2 : -4)),
    communication: clampScore(overallScore + (state.userMessageCount >= 2 ? 3 : -2)),
    ownership: clampScore(overallScore + (codeEditor.value.trim() ? 3 : -5)),
    prioritization: clampScore(overallScore + (explicitTradeoff ? 4 : -3)),
    adaptability: clampScore(overallScore + Math.min((state.triggeredBeats && state.triggeredBeats.size) || 0, 4)),
    technicalDepth: clampScore(overallScore + passed * 2 - failed * 3),
    technicalReasoning: clampScore(overallScore + passed * 2 - failed * 2),
    collaboration: clampScore(overallScore + (state.userMessageCount >= 2 ? 4 : -3)),
    stakeholderManagement: clampScore(overallScore + (snapshot.includes("eta") || snapshot.includes("leadership") || snapshot.includes("customer") || snapshot.includes("enterprise") ? 4 : -2)),
  };

  const pm = state.mission.teammates.find((person) => person.kind === "pm");
  const qa = state.mission.teammates.find((person) => person.kind === "qa");

  return {
    mode: "workspace",
    status: "completed",
    completion_reason: reason === "expired" ? "expired" : "submitted",
    overall_score: overallScore,
    scores,
    rubric: scores,
    recommendation: recommendationForScore(overallScore),
    summary: failed
      ? `Local SkillRecord generated from the workspace and room activity. Strong progress is visible, but ${failed === 1 ? "one area still needs tightening" : `${failed} areas still need tightening`} before this would feel final.`
      : "Local SkillRecord generated from the workspace and room activity. The solution covered the core flow and landed with a believable final recommendation.",
    strengths: checklist.passed.length ? checklist.passed : ["The workspace moved forward with concrete task-aligned changes."],
    weaknesses: checklist.failed,
    observer_notes: [
      "Local evaluation was used because the live backend was unavailable during submission.",
      state.userMessageCount
        ? `The room saw ${state.userMessageCount} candidate update${state.userMessageCount === 1 ? "" : "s"} before submission.`
        : "The final delivery leaned more on workspace edits than room narration.",
    ],
    team_notes: [
      pm
        ? {
            speaker_name: pm.name,
            speaker_title: pm.title,
            strength: checklist.passed[0] || "The recommendation stayed tied to the task.",
            risk: checklist.failed[0] || "The room could still use sharper proof language.",
            score: scores.leadership,
          }
        : null,
      qa
        ? {
            speaker_name: qa.name,
            speaker_title: qa.title,
            strength: checklist.passed[1] || checklist.passed[0] || "Coverage improved through the draft.",
            risk: checklist.failed[1] || checklist.failed[0] || "Residual risk should be called out more explicitly.",
            score: scores.technicalDepth,
          }
        : null,
    ].filter(Boolean),
    next_steps: [
      checklist.failed[0] || "Keep the final recommendation as explicit as the workspace itself.",
      checklist.failed[1] || "Run one more pass that names the remaining risk out loud.",
      "Open another simulation and practice making the final call faster under pressure.",
    ],
    timeline: state.timeline.slice(),
    task: {
      id: activeTaskId(),
      title: state.mission.headline,
      company: state.mission.company,
      role: state.mission.role,
      difficulty: state.mission.priority,
      duration: `${state.mission.deadlineMinutes} mins`,
    },
    submitted_at: new Date().toISOString(),
  };
}

function evaluationChecklist() {
  const snapshot = workspaceSnapshot().toLowerCase();
  switch (state.mission.key) {
    case "netflix":
      return {
        passed: [
          snapshot.includes("rollback") ? "Rollback state is investigated and named." : "",
          snapshot.includes("cache") || snapshot.includes("retry") ? "Cache or retry failure mode is addressed." : "",
          snapshot.includes("eta") || snapshot.includes("leadership") ? "Leadership communication includes timing or executive context." : "",
          snapshot.includes("eu-west") || snapshot.includes("region") ? "Regional impact is considered." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("playback") ? "" : "Playback impact is not connected clearly to the backend incident.",
          snapshot.includes("owner") || snapshot.includes("dante") || snapshot.includes("priya") ? "" : "Owners and validation responsibilities are still unclear.",
          snapshot.includes("circuit") || snapshot.includes("backoff") || snapshot.includes("disable") ? "" : "Mitigation does not yet reduce retry/cache pressure.",
        ].filter(Boolean),
      };
    case "linkedin":
      return {
        passed: [
          snapshot.includes("limited beta") || snapshot.includes("delay") || snapshot.includes("full launch") ? "Launch decision path is explicit." : "",
          snapshot.includes("mobile") ? "Mobile launch risk is acknowledged." : "",
          snapshot.includes("qa") || snapshot.includes("blocker") ? "QA blockers are considered." : "",
          snapshot.includes("cache") || snapshot.includes("guardrail") || snapshot.includes("confidence") ? "AI consistency or guardrail issue is addressed." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("tomorrow") || snapshot.includes("launch") ? "" : "The public launch deadline is not shaping the decision.",
          snapshot.includes("accessibility") || snapshot.includes("onboarding") ? "" : "Onboarding or accessibility risk remains underspecified.",
          snapshot.includes("marketing") || snapshot.includes("leadership") || snapshot.includes("vikram") ? "" : "Stakeholder messaging is not yet leadership-ready.",
        ].filter(Boolean),
      };
    case "spotify":
      return {
        passed: [
          snapshot.includes("retention") || snapshot.includes("day7") || snapshot.includes("day-7") ? "Retention impact is central to the analysis." : "",
          snapshot.includes("onboarding") || snapshot.includes("analytics") ? "Creator workflow friction is considered." : "",
          snapshot.includes("experiment") || snapshot.includes("ab") ? "Experiment conflict is acknowledged." : "",
          snapshot.includes("owner") || snapshot.includes("metric") ? "Recovery plan includes ownership or metrics." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("creator") ? "" : "The affected creator segment is not clear.",
          snapshot.includes("rollback") || snapshot.includes("hotfix") || snapshot.includes("rebalance") ? "" : "Recovery action is not decisive enough.",
          snapshot.includes("conflict") || snapshot.includes("cohort") ? "" : "Conflicting evidence is not handled explicitly.",
        ].filter(Boolean),
      };
    case "openai":
      return {
        passed: [
          snapshot.includes("memory") ? "Memory risk is identified." : "",
          snapshot.includes("sanitize") || snapshot.includes("binding") || snapshot.includes("tenant") ? "Mitigation addresses unsafe memory handling." : "",
          snapshot.includes("restricted demo") || snapshot.includes("go/no-go") || snapshot.includes("delay") ? "Demo decision is explicit." : "",
          snapshot.includes("red team") || snapshot.includes("0/20") || snapshot.includes("repro") ? "Security validation gate is named." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("leak") || snapshot.includes("prompt") ? "" : "Prompt leakage source is not named clearly.",
          snapshot.includes("rollback") || snapshot.includes("disable") ? "" : "Rollback or emergency mitigation path is missing.",
          snapshot.includes("enterprise") || snapshot.includes("customer") || snapshot.includes("demo") ? "" : "Enterprise stakeholder communication remains too vague.",
        ].filter(Boolean),
      };
    case "mobile":
      return {
        passed: [
          snapshot.includes("retryafter") ? "Resend path accounts for retry timing." : "",
          snapshot.includes("loading") ? "Loading state is represented." : "",
          snapshot.includes("disabled") || snapshot.includes("wrong length") ? "Invalid input or button lockout is handled." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("\\d{6}") ? "" : "OTP validation still does not clearly enforce a six-digit code.",
          snapshot.includes("resend") ? "" : "Resend behavior is still not described clearly.",
        ].filter(Boolean),
      };
    case "security":
      return {
        passed: [
          snapshot.includes("rollback") ? "Rollback path is present." : "",
          snapshot.includes("monitor") || snapshot.includes("logging") ? "Monitoring or audit language exists." : "",
          snapshot.includes("customer") || snapshot.includes("status") ? "Customer-safe communication is covered." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("rollback") ? "" : "Rollback trigger is still missing.",
          snapshot.includes("scope") || snapshot.includes("thin") ? "" : "Patch scope is not yet constrained explicitly.",
        ].filter(Boolean),
      };
    case "ops":
      return {
        passed: [
          snapshot.includes("first user") || snapshot.includes("candidate user") ? "A first user is named." : "",
          snapshot.includes("stale") ? "Stale-data trust is acknowledged." : "",
          snapshot.includes("metric") ? "A launch metric is called out." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("executive") && snapshot.includes("operator") ? "The brief still sounds broad enough to serve too many audiences." : "",
          snapshot.includes("exception") ? "" : "The exception-first view is still not explicit enough.",
        ].filter(Boolean),
      };
    case "wallet":
      return {
        passed: [
          snapshot.includes("idempot") || snapshot.includes("lockout") ? "Duplicate retry protection is described." : "",
          snapshot.includes("reconciliation") ? "Reconciliation follow-up is captured." : "",
          snapshot.includes("support") || snapshot.includes("banner") ? "Customer or support communication is covered." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("duplicate") ? "" : "The duplicate payout risk is still not named clearly in the workspace.",
          snapshot.includes("cut-off") || snapshot.includes("payroll") ? "" : "The cut-off constraint still is not shaping the plan enough.",
        ].filter(Boolean),
      };
    case "copilot":
      return {
        passed: [
          snapshot.includes("fallback") ? "Fallback behavior is defined." : "",
          snapshot.includes("confidence") ? "Confidence handling is described." : "",
          snapshot.includes("retrieval") || snapshot.includes("ground") ? "Grounding or retrieval risk is acknowledged." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("refuse") || snapshot.includes("refusal") ? "" : "The refusal path is still underspecified.",
          snapshot.includes("human") ? "" : "The human escalation path is not yet explicit.",
        ].filter(Boolean),
      };
    case "migration":
      return {
        passed: [
          snapshot.includes("reopen") ? "Traffic reopen rule exists." : "",
          snapshot.includes("rollback") ? "Rollback path is defined." : "",
          snapshot.includes("validate") || snapshot.includes("integrity") ? "Data validation is covered." : "",
        ].filter(Boolean),
        failed: [
          snapshot.includes("freeze") ? "" : "Write freeze timing still is not explicit enough.",
          snapshot.includes("stale") || snapshot.includes("read") ? "" : "The stale-read risk is not tied clearly to the cutover sequence.",
        ].filter(Boolean),
      };
    default:
      return { passed: [], failed: [] };
  }
}

function updatePhase(nextPhase) {
  if (!nextPhase) return;
  phaseLabel.textContent = nextPhase.charAt(0).toUpperCase() + nextPhase.slice(1);
}

function storeSessionId(sessionId) {
  state.sessionId = sessionId;
  if (sessionId) {
    localStorage.setItem(sessionStorageKey(), sessionId);
  } else {
    localStorage.removeItem(sessionStorageKey());
  }
}

function setLiveBackendMode(isLive) {
  state.usingLiveBackend = Boolean(isLive);
}

async function createSession() {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task_id: activeBackendTaskId(),
      role: state.mission.role,
      participant_name: candidateName(),
      task_context: selectedDashboardTask(),
    }),
  });
  if (!response.ok) {
    throw new Error("Could not create session.");
  }
  return response.json();
}

async function fetchSession(sessionId) {
  const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}`);
  if (!response.ok) {
    throw new Error("Could not resume session.");
  }
  return response.json();
}

function hydrateFromSession(payload) {
  if (payload.report && payload.status === "completed") {
    window.clearInterval(state.countdownHandle);
    countdownTimer.textContent = "00:00";
    crisisStatus.textContent = "Completed";
    setRoomLocked(true, "Simulation completed");
    persistEvaluation(payload.report);
    localStorage.removeItem(sessionStorageKey());
    showToast("SkillRecord ready. Opening results...");
    window.setTimeout(() => {
      navigateToResults();
    }, 500);
    return;
  }

  setRoomLocked(false, "");
  clearChat();
  clearTimeline();
  state.timeline = Array.isArray(payload.memory && payload.memory.timeline) ? payload.memory.timeline.slice() : loadTimelineState();
  state.timeline.forEach((entry) => state.timelineKeys.add(uniqueTimelineKey(entry)));
  renderTimeline();
  updatePhase(payload.phase || (payload.memory && payload.memory.phase) || "intro");
  resetCountdown(payload);

  const messages = payload.messages || payload.initial_messages || [];
  if (messages.length) {
    const hasCandidateMessage = messages.some((message) => String(message.role || "").toLowerCase() === "user");
    const introOnly = !hasCandidateMessage && messages.length <= 5;
    if (introOnly) {
      appendMessagesSequentially(messages, 350, 850);
    } else {
      messages.forEach(appendChatMessage);
    }
  }
}

function introMessagesForMission() {
  const teammates = Array.isArray(state.mission.teammates) ? state.mission.teammates : [];
  const byKind = (kind, fallback) => teammates.find((mate) => mate.kind === kind) || fallback;
  const pm = byKind("pm", { name: "Asha", title: "Product Manager" });
  const eng = byKind("eng", { name: "Ravi", title: "Engineering Lead" });
  const design = byKind("design", { name: "Mira", title: "Product Designer" });
  const qa = byKind("qa", { name: "Kenji", title: "QA Engineer" });

  return [
    {
      speaker_name: pm.name,
      speaker_title: pm.title,
      message: `Hi, I am ${pm.name}, ${pm.title} for ${state.mission.company}. We are in #${state.mission.channel}; before we jump in, please introduce yourself and how you approach this kind of work.`,
    },
    {
      speaker_name: eng.name,
      speaker_title: eng.title,
      message: `I am ${eng.name}, ${eng.title}. I will watch contracts, failure modes, and what can ship safely.`,
    },
    {
      speaker_name: design.name,
      speaker_title: design.title,
      message: `I am ${design.name}, ${design.title}. I will keep the user-facing path clear, calm, and trustworthy.`,
    },
    {
      speaker_name: qa.name,
      speaker_title: qa.title,
      message: `I am ${qa.name}, ${qa.title}. I will press on edge cases and proof before we call anything done. Current issue: ${state.mission.summary}`,
    },
  ];
}

function seedLocalRoom() {
  setRoomLocked(false, "");
  clearChat();
  clearTimeline();
  state.timeline = loadTimelineState();
  if (!state.timeline.length) {
    state.timeline = [
      {
        title: "Simulation started",
        description: `${state.mission.company} opened a live sprint around ${state.mission.headline.toLowerCase()}`,
        created_at: new Date().toISOString(),
      },
    ];
  }
  state.timeline.forEach((entry) => state.timelineKeys.add(uniqueTimelineKey(entry)));
  renderTimeline();
  appendMessagesSequentially(
    introMessagesForMission().map((message) => ({ ...message, created_at: new Date().toISOString() })),
    350,
    850
  );
  resetCountdown();
}

async function startOrResumeSession() {
  const storedSessionId = localStorage.getItem(sessionStorageKey());
  try {
    let payload;
    if (storedSessionId) {
      try {
        payload = await fetchSession(storedSessionId);
        storeSessionId(storedSessionId);
      } catch (resumeError) {
        storeSessionId(null);
        payload = await createSession();
        storeSessionId(payload.session_id);
      }
    } else {
      payload = await createSession();
      storeSessionId(payload.session_id);
    }
    setLiveBackendMode(true);
    hydrateFromSession(payload);
    scrollChatToBottom();
    showToast("Room ready.");
  } catch (error) {
    storeSessionId(null);
    setLiveBackendMode(false);
    seedLocalRoom();
    scrollChatToBottom();
    showToast("Live backend unavailable. Running in local simulation mode.");
  }
}

async function ensureSession() {
  if (state.sessionId) {
    return state.sessionId;
  }
  const payload = await createSession();
  storeSessionId(payload.session_id);
  setLiveBackendMode(true);
  return state.sessionId;
}

async function sendRoomMessage(rawText) {
  if (state.roomLocked) return;
  const text = String(rawText || "").trim();
  if (!text) return;

  appendChatMessage({
    speaker_name: candidateName(),
    speaker_title: "You",
    role: "user",
    avatar: "Y",
    message: text,
    created_at: new Date().toISOString(),
  });
  candidateMessageInput.value = "";
  autoResizeComposer();

  const isFirstUserMessage = state.userMessageCount === 0;
  state.userMessageCount += 1;

  showTyping("Team is typing...");

  try {
    const sessionId = await ensureSession();
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: text,
        candidate_name: candidateName(),
        active_file: getActiveFile().name,
        workspace_snapshot: workspaceSnapshot(),
        code: codeEditor.value,
      }),
    });
    const payload = await response.json();
    hideTyping();

    if (!response.ok) {
      throw new Error(payload.error || "Chat failed.");
    }

    updatePhase(payload.phase);
    if (payload.timeline_event) {
      addTimelineEvent(payload.timeline_event);
    }

    const newMessages = Array.isArray(payload.new_messages) ? payload.new_messages : [];
    if (newMessages.length) {
      appendMessagesSequentially(newMessages);
    }
  } catch (error) {
    hideTyping();
    setLiveBackendMode(false);
    if (isFirstUserMessage) {
      triggerPressureBeat("first-message", { forceLocal: true });
    }
    appendMessagesSequentially(localReplyPair(text).map((message) => ({ ...message, created_at: new Date().toISOString() })));
    addTimelineEvent({
      title: "Local simulation reaction",
      description: "The backend was unavailable, so the room continued with local simulation logic.",
      created_at: new Date().toISOString(),
    });
  }
}

async function runChecks() {
  if (state.roomLocked) return;
  const results = evaluationChecklist();
  const hasFailures = results.failed.length > 0;
  testStatus.textContent = hasFailures ? `Checks found ${results.failed.length} issue(s)` : "Checks are green";
  showToast(hasFailures ? "Checks finished with open issues." : "Checks passed.");

  const summary = hasFailures
    ? `I ran the latest checks. These issues are still open: ${results.failed.join(" ")}`
    : `I ran the latest checks. Core coverage is green: ${results.passed.join(" ")}`;

  addTimelineEvent({
    title: hasFailures ? "Checks surfaced open issues" : "Checks passed",
    description: hasFailures ? results.failed.join(" ") : results.passed.join(" "),
    created_at: new Date().toISOString(),
  });

  showTyping("Ravi and Kenji are checking this...");

  try {
    const sessionId = await ensureSession();
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/tests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: summary,
        candidate_name: candidateName(),
        active_file: getActiveFile().name,
        workspace_snapshot: workspaceSnapshot(),
        code: codeEditor.value,
        test_results: results,
      }),
    });
    const payload = await response.json();
    hideTyping();

    if (!response.ok) {
      throw new Error(payload.error || "Checks failed to send.");
    }

    updatePhase(payload.phase);
    if (payload.timeline_event) {
      addTimelineEvent(payload.timeline_event);
    }
    appendMessagesSequentially((payload.new_messages || []).map((message) => ({ ...message })));
  } catch (error) {
    hideTyping();
    setLiveBackendMode(false);
    appendMessagesSequentially(
      localReplyPair(hasFailures ? "test risk edge case" : "test validation green").map((message) => ({
        ...message,
        created_at: new Date().toISOString(),
      }))
    );
  }
}

function insertOutline() {
  const file = getActiveFile();
  const outline = file.kind === "brief"
    ? [
        "# Decision",
        "",
        "- What is failing right now?",
        "- What are we doing first?",
        "- What are we deferring on purpose?",
        "- What proves this is safe enough today?",
      ].join("\n")
    : [
        "// Plan",
        "// 1. Protect the broken path first.",
        "// 2. Make the user-facing state explicit.",
        "// 3. Name the residual risk and what we are deferring.",
      ].join("\n");

  const nextValue = codeEditor.value.trim() ? `${codeEditor.value.trim()}\n\n${outline}` : outline;
  codeEditor.value = nextValue;
  updateCurrentFileContent(nextValue);
  scheduleAutoSave();
  maybeTriggerDraftBeat();
  codeEditor.focus();
}

function shareWorkspace() {
  if (state.roomLocked) return;
  const excerpt = codeEditor.value.trim().slice(0, 900);
  if (!excerpt) {
    showToast("Edit the active file before sharing it with the room.");
    return;
  }

  const message = `I updated ${getActiveFile().name}. Review this direction:\n\n${excerpt}`;
  sendRoomMessage(message);
  showToast("Shared in chat.");
}

function requestCritique() {
  if (state.roomLocked) return;
  const excerpt = codeEditor.value.trim().slice(0, 1200);
  if (!excerpt) {
    showToast("Write something in the workspace first so the team has something to critique.");
    return;
  }
  triggerPressureBeat("critique");
  sendRoomMessage(`Review my current ${getActiveFile().name} draft and tell me what breaks first:\n\n${excerpt}`);
}

async function triggerCrisis() {
  if (state.roomLocked) return;

  if (state.usingLiveBackend || state.sessionId) {
    showTyping("Team is reacting...");
    try {
      const sessionId = await ensureSession();
      const response = await fetch(`${API_BASE_URL}/api/agent/event`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          event_type: "crisis_triggered",
          candidate_name: candidateName(),
          active_file: getActiveFile().name,
          workspace_snapshot: workspaceSnapshot(),
          code: codeEditor.value,
        }),
      });
      const payload = await response.json();
      hideTyping();

      if (!response.ok) {
        throw new Error(payload.error || "Crisis failed to send.");
      }

      setLiveBackendMode(true);
      updatePhase(payload.phase);
      if (payload.timeline_event) {
        addTimelineEvent(payload.timeline_event);
      }
      appendMessagesSequentially((payload.new_messages || []).map((message) => ({ ...message })));
      return;
    } catch (error) {
      hideTyping();
      setLiveBackendMode(false);
    }
  }

  triggerPressureBeat("manual-crisis", { forceLocal: true });
}

async function submitSimulation(reason = "submitted") {
  if (state.roomLocked && reason === "submitted") {
    return;
  }
  if (state.submissionInFlight) {
    return;
  }

  const submission = buildSubmission();
  state.submissionInFlight = true;
  setRoomLocked(true, reason === "expired" ? "Time ended - generating SkillRecord..." : "Submitting...");
  showToast(reason === "expired" ? "Time ended - generating SkillRecord..." : "Submitting simulation for evaluation...");

  try {
    const sessionId = await ensureSession();
    const response = await fetch(`${API_BASE_URL}/api/sessions/${sessionId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        submission,
        reason,
        candidate_name: candidateName(),
        active_file: getActiveFile().name,
        workspace_snapshot: workspaceSnapshot(),
        code: submission,
      }),
    });
    const payload = await response.json();
    if (!response.ok) {
      throw new Error(payload.error || "Submit failed.");
    }

    persistEvaluation(payload.report || payload);
    localStorage.removeItem(sessionStorageKey());
    showToast("Evaluation complete. Opening results...");
    window.setTimeout(() => {
      navigateToResults();
    }, 700);
    return;
  } catch (error) {
    try {
      const fallbackResponse = await fetch(`${API_BASE_URL}/submit-task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission,
          role: state.mission.role,
          session_id: state.sessionId,
          reason,
        }),
      });
      const fallbackPayload = await fallbackResponse.json();
      if (!fallbackResponse.ok) {
        throw new Error(fallbackPayload.error || "Fallback submit failed.");
      }
      persistEvaluation(fallbackPayload.report || fallbackPayload);
      localStorage.removeItem(sessionStorageKey());
      showToast("Evaluation complete. Opening results...");
      window.setTimeout(() => {
        navigateToResults();
      }, 700);
    } catch (fallbackError) {
      addTimelineEvent({
        title: "Local SkillRecord generated",
        description: "The backend was unavailable during submit, so DayZero created a local evaluation from the current workspace state.",
        created_at: new Date().toISOString(),
      });
      persistEvaluation(buildLocalEvaluationReport(reason));
      storeSessionId(null);
      showToast("Backend unavailable. Opening local SkillRecord...");
      window.setTimeout(() => {
        navigateToResults();
      }, 700);
    }
  }
}

function resetMissionState(nextMissionKey) {
  const missionConfig = getMissionConfigByKey(nextMissionKey) || getMissionConfigByKey("mobile");
  state.missionKey = nextMissionKey;
  state.mission = personalizeMissionForDashboardTask(clone(missionConfig), selectedDashboardTask());
  state.workspace = loadWorkspaceState();
  state.timeline = loadTimelineState();
  state.triggeredBeats = new Set();
  state.userMessageCount = 0;
  state.submissionInFlight = false;
  state.allowNavigationAway = false;
  clearChat();
  clearTimeline();
  renderMission();
  renderTimeline();
  setRoomLocked(false, "");
  startOrResumeSession();
}

function switchMission(nextMissionKey) {
  localStorage.setItem(STORAGE_KEYS.selectedMission, nextMissionKey);
  resetMissionState(nextMissionKey);
}

function bindEvents() {
  sendMessageBtn.addEventListener("click", () => sendRoomMessage(candidateMessageInput.value));

  if (workspaceJumpBtn) {
    workspaceJumpBtn.addEventListener("click", () => {
      const workspaceSurface = document.getElementById("workspaceSurface");
      if (document.body.classList.contains("workspace-hidden")) {
        document.body.classList.remove("workspace-hidden");
        showToast("Workspace reopened.");
      }
      if (workspaceSurface) {
        workspaceSurface.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      codeEditor.focus();
    });
  }

  if (refreshSceneBtn) {
    refreshSceneBtn.addEventListener("click", async () => {
      showToast("Refreshing room...");
      await startOrResumeSession();
    });
  }

  if (notifySceneBtn) {
    notifySceneBtn.addEventListener("click", () => openCrisisModal());
  }

  if (peopleBtn) {
    peopleBtn.addEventListener("click", () => {
      document.body.classList.remove("team-glow");
      void document.body.offsetWidth;
      document.body.classList.add("team-glow");
      window.setTimeout(() => document.body.classList.remove("team-glow"), 1300);
      showToast("Asha, Ravi, Mira, and Kenji are here.");
    });
  }

  if (closeWorkspaceBtn) {
    closeWorkspaceBtn.addEventListener("click", () => {
      document.body.classList.add("workspace-hidden");
      showToast("Workspace hidden. Use the Workspace button to open it again.");
      candidateMessageInput.focus();
    });
  }

  candidateMessageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendRoomMessage(candidateMessageInput.value);
    }
  });

  candidateMessageInput.addEventListener("input", autoResizeComposer);

  document.addEventListener("keydown", (event) => {
    preventAccidentalRefresh(event);

    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveDraft(true);
      return;
    }

    if (event.key === "Escape" && !crisisModal.classList.contains("hidden")) {
      closeCrisisModal();
    }
  });

  window.addEventListener("beforeunload", handleBeforeUnload);

  codeEditor.addEventListener("input", () => {
    updateCurrentFileContent(codeEditor.value);
    scheduleAutoSave();
    maybeTriggerDraftBeat();
  });

  saveDraftBtn.addEventListener("click", () => saveDraft(true));
  insertOutlineBtn.addEventListener("click", insertOutline);
  runTestsBtn.addEventListener("click", runChecks);
  shareWorkspaceBtn.addEventListener("click", shareWorkspace);
  requestCritiqueBtn.addEventListener("click", requestCritique);
  if (submitBtn) submitBtn.addEventListener("click", submitSimulation);
  if (submitSceneBtn) submitSceneBtn.addEventListener("click", submitSimulation);
  if (submitWorkspaceBtn) submitWorkspaceBtn.addEventListener("click", submitSimulation);

  triggerCrisisBtn.addEventListener("click", openCrisisModal);
  closeCrisisModalBtn.addEventListener("click", closeCrisisModal);
  cancelCrisisBtn.addEventListener("click", closeCrisisModal);
  confirmCrisisBtn.addEventListener("click", () => {
    closeCrisisModal();
    triggerCrisis();
  });

  crisisModal.addEventListener("click", (event) => {
    if (event.target === crisisModal) {
      closeCrisisModal();
    }
  });
}

async function init() {
  await hydrateSelectedDashboardTaskWorkspaceFiles();
  bindEvents();
  resetMissionState(selectedMissionKey());
  refreshIcons();
}

init().catch((error) => {
  console.error("Simulation init failed:", error);
  bindEvents();
  resetMissionState(selectedMissionKey());
  refreshIcons();
});
