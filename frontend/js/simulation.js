const API_BASE_URL = localStorage.getItem("dayzero_api_base") || "http://127.0.0.1:5000";

const STORAGE_KEYS = {
  selectedMission: "dayzeroSelectedMissionKey",
  dashboardTask: "dayzero_task_id",
  sessionPrefix: "dayzeroSimulationSession::",
  workspacePrefix: "dayzeroWorkspaceState::",
  timelinePrefix: "dayzeroTimelineState::",
  report: "lastEvaluationReport",
};

const TEAMS = {
  northstar: [
    { name: "Asha", title: "Product Manager", kind: "pm" },
    { name: "Ravi", title: "Engineering Lead", kind: "eng" },
    { name: "Mira", title: "Product Designer", kind: "design" },
    { name: "Kenji", title: "QA Engineer", kind: "qa" },
    { name: "Leo", title: "Executive Sponsor", kind: "exec" },
  ],
  incident: [
    { name: "Asha", title: "Incident Commander", kind: "pm" },
    { name: "Ravi", title: "Engineering Lead", kind: "eng" },
    { name: "Mira", title: "Customer Experience", kind: "design" },
    { name: "Kenji", title: "Security QA", kind: "qa" },
    { name: "Leo", title: "VP Security", kind: "exec" },
  ],
  ops: [
    { name: "Asha", title: "Product Manager", kind: "pm" },
    { name: "Ravi", title: "Engineering Lead", kind: "eng" },
    { name: "Mira", title: "Product Designer", kind: "design" },
    { name: "Kenji", title: "QA Engineer", kind: "qa" },
    { name: "Leo", title: "Operations VP", kind: "exec" },
  ],
  ai: [
    { name: "Asha", title: "AI Product Lead", kind: "pm" },
    { name: "Ravi", title: "Engineering Lead", kind: "eng" },
    { name: "Mira", title: "Trust Designer", kind: "design" },
    { name: "Kenji", title: "Safety QA", kind: "qa" },
    { name: "Leo", title: "Pilot Sponsor", kind: "exec" },
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
};

const TASK_TO_MISSION_KEY = {
  "mobile-growth": "mobile",
  "security-patch": "security",
  "docs-update": "mobile",
  "fraud-dashboard": "ops",
  "search-infra": "migration",
  "ai-copilot": "copilot",
  "search-ranking": "ops",
  "surge-api": "wallet",
  "video-encoding": "migration",
  "playlist-generator": "ops",
  "vr-marketplace": "mobile",
};

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

function getMissionConfigByKey(key) {
  if (MISSIONS[key]) {
    return MISSIONS[key];
  }
  const mappedKey = TASK_TO_MISSION_KEY[key];
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
  if (role.includes("backend")) {
    return "security";
  }
  if (role.includes("data") || role.includes("analyst")) {
    return "ops";
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
  return state.mission ? state.mission.taskId : "mobile-growth";
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
  quickPrompts.innerHTML = state.mission.quickPrompts
    .map((prompt, index) => `<button type="button" data-prompt-index="${index}">${escapeHtml(prompt)}</button>`)
    .join("");

  quickPrompts.querySelectorAll("[data-prompt-index]").forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = state.mission.quickPrompts[Number(button.getAttribute("data-prompt-index"))];
      sendRoomMessage(prompt);
    });
  });
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

function normalizeMessage(message) {
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
  const key = uniqueMessageKey(rawMessage);
  if (state.messageKeys.has(key)) {
    return;
  }

  state.messageKeys.add(key);
  const message = normalizeMessage(rawMessage);
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

function appendMessagesSequentially(messages, startDelay = 180) {
  messages.forEach((message, index) => {
    window.setTimeout(() => appendChatMessage(message), startDelay + index * 340);
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

  if (text.includes("ravi")) {
    return [
      { speaker_name: eng.name, speaker_title: eng.title, message: "Tell me the exact behavior change. What should the client do on success, error, and retry?" },
      { speaker_name: pm.name, speaker_title: pm.title, message: "Once that is clear, I can tell if the scope is tight enough." },
    ];
  }

  if (text.includes("kenji")) {
    return [
      { speaker_name: qa.name, speaker_title: qa.title, message: "What edge case are you protecting first? If you cannot name it, the fix still sounds soft." },
      { speaker_name: eng.name, speaker_title: eng.title, message: "Give Kenji that path and I can tell you if the implementation stays narrow." },
    ];
  }

  if (text.includes("mira")) {
    return [
      { speaker_name: design.name, speaker_title: design.title, message: "Make the user-facing state obvious. If the UI feels unsure, nobody will trust the fix." },
      { speaker_name: pm.name, speaker_title: pm.title, message: "And say if that UX change is enough for today or if we still need to cut scope." },
    ];
  }

  if (text.includes("api") || text.includes("retry") || text.includes("backend") || text.includes("payload")) {
    return [
      { speaker_name: eng.name, speaker_title: eng.title, message: "I need the exact client behavior for invalid input, throttling, and server failure. Be concrete." },
      { speaker_name: qa.name, speaker_title: qa.title, message: "And tell me what ugly path you would retest right after that. I do not want a happy-path-only fix." },
    ];
  }

  if (text.includes("design") || text.includes("mobile") || text.includes("loading") || text.includes("copy")) {
    return [
      { speaker_name: design.name, speaker_title: design.title, message: "Make the user-facing state explicit. Silent taps and vague copy are what make these flows feel broken." },
      { speaker_name: pm.name, speaker_title: pm.title, message: "Good. Once the UI state is clear, tell me if that is enough or if we still need to cut scope." },
    ];
  }

  if (text.includes("test") || text.includes("risk") || text.includes("edge")) {
    return [
      { speaker_name: qa.name, speaker_title: qa.title, message: "Name the edge case you trust least. That is usually the fastest way to prove if the plan is real." },
      { speaker_name: eng.name, speaker_title: eng.title, message: "If the plan survives that edge case, I can usually build around the rest. Be precise." },
    ];
  }

  return [
    { speaker_name: pm.name, speaker_title: pm.title, message: "Sharpen the call. Tell the room what happens first, what gets cut, and what counts as stable today." },
    { speaker_name: eng.name, speaker_title: eng.title, message: "Once you make the call, give me the exact behavior I need to build so we do not lose time translating strategy." },
  ];
}

function triggerPressureBeat(trigger) {
  const beat = state.mission.pressureBeats.find((entry) => entry.trigger === trigger && !state.triggeredBeats.has(entry.id));
  if (!beat) {
    return;
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

async function createSession() {
  const response = await fetch(`${API_BASE_URL}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      task_id: activeTaskId(),
      role: state.mission.role,
      participant_name: candidateName(),
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
    messages.forEach(appendChatMessage);
  }
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
  state.mission.introMessages.forEach((message) => appendChatMessage({ ...message, created_at: new Date().toISOString() }));
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
    hydrateFromSession(payload);
    scrollChatToBottom();
    showToast("Room ready.");
  } catch (error) {
    storeSessionId(null);
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

  state.userMessageCount += 1;
  if (state.userMessageCount === 1) {
  
  }

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
  state.mission = clone(missionConfig);
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
    triggerPressureBeat("manual-crisis");
  });

  crisisModal.addEventListener("click", (event) => {
    if (event.target === crisisModal) {
      closeCrisisModal();
    }
  });
}

function init() {
  bindEvents();
  resetMissionState(selectedMissionKey());
  refreshIcons();
}

init();
