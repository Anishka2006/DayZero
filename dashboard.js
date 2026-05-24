if (typeof lucide !== 'undefined') {
  lucide.createIcons();
}

const focusToggle = document.getElementById("focusToggle");
const collapseBtn = document.getElementById("collapseBtn");
const sidebar = document.getElementById("sidebar");
const mobileMenu = document.getElementById("mobileMenu");
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const crisisPopup = document.getElementById("crisisPopup");
const closePopup = document.getElementById("closePopup");
const crisisOptions = document.querySelectorAll(".crisis-option");
const toast = document.getElementById("toast");
const submitBtn = document.getElementById("submitBtn");




if (collapseBtn) {
  collapseBtn.addEventListener("click", () => {
    if (sidebar) sidebar.classList.toggle("collapsed");
  });
}

if (mobileMenu) {
  mobileMenu.addEventListener("click", () => {
    if (sidebar) sidebar.classList.toggle("show");
  });
}

tabButtons.forEach(button => {
  button.addEventListener("click", () => {
    const target = button.getAttribute("data-tab");

    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(content => content.classList.remove("active"));

    button.classList.add("active");
    document.getElementById(target).classList.add("active");
  });
});

// Sidebar Menu Interaction
const menuItems = document.querySelectorAll(".menu-item");
const viewPanels = document.querySelectorAll(".view-panel");

menuItems.forEach(item => {
  item.addEventListener("click", (e) => {
    e.preventDefault();
    menuItems.forEach(btn => btn.classList.remove("active"));
    item.classList.add("active");
    
    // Show correct panel
    const targetId = item.getAttribute("data-target");
    if (targetId) {
      viewPanels.forEach(panel => {
        panel.classList.add("hidden");
        panel.classList.remove("active");
      });
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.classList.remove("hidden");
        targetPanel.classList.add("active");
      }
    }
    
    // Optional: On mobile, close sidebar after clicking a link
    if (window.innerWidth <= 960) {
      sidebar.classList.remove("show");
    }
  });
});



// Crisis Events
const crisisEvents = [
  {
    title: "Engineering delayed release",
    desc: "A critical engineering dependency slipped by 3 days. What do you do?"
  },
  {
    title: "Budget reduced by 20%",
    desc: "Leadership cut the launch budget unexpectedly. Replan your rollout."
  },
  {
    title: "Competitor launched today",
    desc: "A competitor released a similar feature this morning. Respond fast."
  },
  {
    title: "CEO changed priority",
    desc: "The CEO wants retention over acquisition. Adjust your strategy."
  }
];

function showRandomCrisis() {
  const randomEvent = crisisEvents[Math.floor(Math.random() * crisisEvents.length)];
  document.getElementById("crisisTitle").textContent = randomEvent.title;
  document.getElementById("crisisDesc").textContent = randomEvent.desc;
  
  // Show the alert button in the corner instead of forcing the popup
  const alertBtn = document.getElementById("crisisAlertBtn");
  if (alertBtn) {
    alertBtn.classList.remove("hidden");
  }
}

// Show popup after 8 sec, then every 35 sec
setTimeout(showRandomCrisis, 8000);
setInterval(showRandomCrisis, 35000);

const crisisAlertBtn = document.getElementById("crisisAlertBtn");
if (crisisAlertBtn) {
  crisisAlertBtn.addEventListener("click", () => {
    crisisPopup.classList.remove("hidden");
    crisisAlertBtn.classList.add("hidden");
  });
}

if (closePopup) {
  closePopup.addEventListener("click", () => {
    crisisPopup.classList.add("hidden");
  });
}

crisisOptions.forEach(option => {
  option.addEventListener("click", () => {
    if (crisisPopup) crisisPopup.classList.add("hidden");
    showToast("Response recorded. Adaptability score updated.");
  });
});

// Submit Button
if (submitBtn) {
  submitBtn.addEventListener("click", () => {
    showToast("Submission successful. Score updated.");
  });
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.remove("hidden");

  setTimeout(() => {
    toast.classList.add("hidden");
  }, 3000);
}

// Fake live teammate messages
const teamFeed = document.querySelector(".team-feed");
const feedMessages = [
  { role: `<i data-lucide="code" class="icon-sm"></i> Engineer`, text: "Can you freeze feature priority now?" },
  { role: `<i data-lucide="pen-tool" class="icon-sm"></i> Designer`, text: "Need user pain point clarity for final screens." },
  { role: `<i data-lucide="bar-chart" class="icon-sm"></i> Analyst`, text: "The retention metric is trending better than expected." },
  { role: `<i data-lucide="megaphone" class="icon-sm"></i> Marketing`, text: "We need one-line launch positioning ASAP." }
];

setInterval(() => {
  if (!teamFeed) return;
  const msg = feedMessages[Math.floor(Math.random() * feedMessages.length)];
  const item = document.createElement("div");
  item.className = "feed-item";
  
  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  item.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:6px; align-items:center;">
      <span style="font-weight:600; font-size:13px;">${msg.role}</span>
      <small style="color:var(--text-muted); font-size:11px;">${timeStr}</small>
    </div>
    <p style="margin-bottom:12px;">${msg.text}</p>
    <div class="feed-actions" style="display:flex; gap:8px;">
      <button class="secondary-btn small reply-feed-btn" style="flex:1;">Reply</button>
      <button class="secondary-btn small resolve-feed-btn" style="flex:1;">Resolve</button>
    </div>
  `;
  teamFeed.prepend(item);
  if (typeof lucide !== 'undefined') lucide.createIcons();

  const actionsDiv = item.querySelector('.feed-actions');
  const replyBtn = item.querySelector('.reply-feed-btn');
  const resolveBtn = item.querySelector('.resolve-feed-btn');

  replyBtn.addEventListener('click', () => {
    // Show chat input
    actionsDiv.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:8px; width:100%;">
        <textarea class="reply-input" placeholder="Type your reply..." rows="2" style="width:100%; padding:8px; border-radius:6px; border:1px solid var(--border); font-family:inherit; font-size:13px; resize:none; outline:none;"></textarea>
        <div style="display:flex; justify-content:flex-end; gap:8px;">
          <button class="secondary-btn small cancel-reply-btn">Cancel</button>
          <button class="primary-btn small send-reply-btn">Send</button>
        </div>
      </div>
    `;
    
    // Focus the input
    const input = actionsDiv.querySelector('.reply-input');
    input.focus();

    // Handle Send
    actionsDiv.querySelector('.send-reply-btn').addEventListener('click', () => {
      const replyText = input.value.trim() || "Okay, I'll look into it.";
      item.style.background = "var(--bg)";
      item.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <span style="font-weight:600; font-size:13px;">${msg.role}</span>
          <small style="color:var(--text-muted); font-size:11px;">${timeStr}</small>
        </div>
        <p style="margin-bottom:12px; color:var(--text-muted);">${msg.text}</p>
        <div style="background:#f8fafc; border:1px solid #cbd5e1; padding:10px; border-radius:6px; margin-top:10px;">
          <strong style="font-size:12px; color:var(--blue);">You:</strong>
          <p style="font-size:13px; margin-top:4px;">${replyText}</p>
        </div>
        <div style="margin-top:10px; text-align:right;">
          <span style="color:var(--green); font-size:12px; font-weight:600;">Replied ✓</span>
        </div>
      `;
      if (typeof addTimelineEvent === 'function') addTimelineEvent('Replied to Teammate');
    });

    // Handle Cancel
    actionsDiv.querySelector('.cancel-reply-btn').addEventListener('click', () => {
      actionsDiv.innerHTML = `
        <button class="secondary-btn small reply-feed-btn" style="flex:1;">Reply</button>
        <button class="secondary-btn small resolve-feed-btn" style="flex:1;">Resolve</button>
      `;
      // Re-attach listeners is complex, so we just grey it out or we could just mark it resolved.
      // Easiest is just to restore original behavior via page refresh, but for a mockup, let's just make it look resolved if cancelled.
      actionsDiv.innerHTML = `<button class="secondary-btn small" disabled style="width:100%;">Cancelled</button>`;
    });
  });
  
  resolveBtn.addEventListener('click', () => {
    item.style.opacity = '0.6';
    actionsDiv.innerHTML = `
      <button class="secondary-btn small" disabled style="flex:1; background:var(--green); color:white; border:none;">Resolved ✓</button>
    `;
    if (typeof addTimelineEvent === 'function') addTimelineEvent('Resolved Teammate Request');
  });

  if (teamFeed.children.length > 5) {
    teamFeed.removeChild(teamFeed.lastElementChild);
  }
}, 12000);

// AI Conflict Engine
setTimeout(() => {
  const item = document.createElement("div");
  item.className = "feed-item";
  item.style.borderColor = "var(--amber)";
  item.innerHTML = `
    <span><i data-lucide="code" class="icon-sm"></i> Engineer</span>
    <p>This feature takes 3 weeks to build. Should we delay the launch?</p>
    <div style="margin-top: 12px; display: flex; gap: 8px;">
      <button class="primary-btn small" onclick="this.parentElement.innerHTML='<i>Accepted delay.</i>'; showToast('Adaptability +2');">Delay Launch</button>
      <button class="secondary-btn small" onclick="this.parentElement.innerHTML='<i>Negotiating scope...</i>'; showToast('Leadership +5');">Negotiate Scope</button>
    </div>
  `;
  teamFeed.prepend(item);
  lucide.createIcons();
  if (teamFeed.children.length > 5) {
    teamFeed.removeChild(teamFeed.lastElementChild);
  }
}, 15000);

// Interview Modal Logic
const interviewPopup = document.getElementById("interviewPopup");
const closeInterview = document.getElementById("closeInterview");
const exitBtn = document.querySelector(".exit-btn");

if (closeInterview) {
  closeInterview.addEventListener("click", () => {
    interviewPopup.classList.add("hidden");
  });
}

if (exitBtn) {
  exitBtn.addEventListener("click", () => {
    // Show the Live Interview overlay instead of exiting
    interviewPopup.classList.remove("hidden");
  });
}

// Re-initialize icons just in case new html needs it
lucide.createIcons();

// AI Manager Interactive Logic & API Integration
const GROQ_API_KEY = ""; // Your Groq API key (Loaded from .env in production)

const managerStyleSelect = document.getElementById("managerStyleSelect");
const managerMsgs = document.getElementById("managerMsgs");
const managerActions = document.querySelectorAll(".nova-chip");
const typingIndicator = document.getElementById("typingIndicator");
const managerInput = document.getElementById("aiManagerInput");
const managerSendBtn = document.getElementById("aiManagerSendBtn");

const systemPrompts = {
  "Strict": "You are a strict, no-nonsense AI manager in a tech company. Give very short, direct answers. Demand results and KPIs.",
  "Supportive": "You are a supportive, helpful AI manager in a tech company. Offer guidance, encouragement, and thoughtful advice. Keep it concise.",
  "Startup Founder": "You are an intense, fast-paced startup founder. Use words like 'pivot', '10x', and 'ship it'. Be highly energetic and brief.",
  "Corporate VP": "You are a corporate VP. Use corporate buzzwords like 'synergy', 'alignment', and 'deliverables'. Be formal and professional."
};

function addManagerMessage(text, isUser = false) {
  const msg = document.createElement("div");
  msg.className = "nova-msg-card " + (isUser ? "user" : "default");
  
  let iconHtml = isUser ? '' : '<div class="msg-icon"><i data-lucide="message-square" class="icon-sm"></i></div>';
  
  // Convert markdown bold to simple html
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  msg.innerHTML = `
    ${iconHtml}
    <div class="msg-content">
      <p>${formattedText}</p>
    </div>
  `;
  
  if (typingIndicator) {
  managerMsgs.insertBefore(msg, typingIndicator);
  } else {
    managerMsgs.appendChild(msg);
  }
  lucide.createIcons();
  managerMsgs.scrollTop = managerMsgs.scrollHeight; // Scroll to bottom
}

function addAiAlert(type, text) {
  const msg = document.createElement("div");
  msg.className = "nova-msg-card " + type;
  
  let iconName = 'lightbulb';
  if (type === 'approval') iconName = 'check-circle';
  if (type === 'risk') iconName = 'alert-triangle';
  
  msg.innerHTML = `
    <div class="msg-icon"><i data-lucide="${iconName}" class="icon-sm"></i></div>
    <div class="msg-content">
      <p>${text}</p>
    </div>
  `;
  
  const managerMsgs = document.getElementById("managerMsgs");
  const typingIndicator = document.getElementById("typingIndicator");
  if (managerMsgs) {
    if (typingIndicator) {
      managerMsgs.insertBefore(msg, typingIndicator);
    } else {
      managerMsgs.appendChild(msg);
    }
    if (typeof lucide !== 'undefined') lucide.createIcons();
    managerMsgs.scrollTop = managerMsgs.scrollHeight;
  }
}

function addTimelineEvent(actionText) {
  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  
  const shortText = actionText.length > 35 ? actionText.substring(0, 35) + '...' : actionText;

  document.querySelectorAll(".timeline").forEach(timeline => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${timeStr}</span> ${shortText}`;
    timeline.appendChild(li);
    
    if (timeline.children.length > 8) {
      timeline.removeChild(timeline.firstElementChild);
    }
  });
  
  // Dynamically generate AI Alert based on the action
  if (typeof addAiAlert === 'function') {
    const textLower = actionText.toLowerCase();
    // Do not generate AI alerts for literal chat prompts
    if (textLower.includes('ai prompt:')) return;

    let type = 'hint';
    let alertMsg = `Noted: ${shortText}`;
    
    if (textLower.includes('replied') || textLower.includes('resolved')) {
       type = 'approval';
       alertMsg = 'Good communication. Team alignment improved.';
    } else if (textLower.includes('started task')) {
       type = 'hint';
       alertMsg = 'Task tracking initiated. Watch your time blocks.';
    } else if (textLower.includes('override') || textLower.includes('high pressure') || textLower.includes('critical')) {
       type = 'risk';
       alertMsg = 'Warning: Pressure levels elevated. Monitor team stress.';
    } else if (textLower.includes('synced') || textLower.includes('submitted')) {
       type = 'approval';
       alertMsg = 'Submission received. Analyzing deliverables...';
    } else if (textLower.includes('provisioning') || textLower.includes('established')) {
       type = 'hint';
       alertMsg = 'Secure workspace active. KPI tracking started.';
    }
    
    // Slight delay to make it feel like AI is reacting
    setTimeout(() => {
      addAiAlert(type, alertMsg);
    }, 1500);
  }
}

function advanceCalendarProgress() {
  const panel = document.getElementById("panel-calendar");
  if (!panel) return;
  const inProgressFill = panel.querySelector(".progress-bar-fill.pulse");
  if (inProgressFill) {
    let width = parseInt(inProgressFill.style.width) || 30;
    if (width < 100) {
      width = Math.min(100, width + 35);
      inProgressFill.style.width = width + "%";
      const textSpan = inProgressFill.closest(".progress-wrap").querySelector(".timeline-progress-text");
      if (textSpan) {
        textSpan.innerText = width === 100 ? "Completed" : "In Progress (" + width + "%)";
      }
      if (width === 100) {
        inProgressFill.classList.remove("pulse");
        inProgressFill.style.background = "var(--green)";
      }
    }
  }
}

async function simulateAiResponse(userMessage) {
  advanceCalendarProgress();
  addTimelineEvent('AI Prompt: ' + userMessage);
  // Consistency update (replaces AI prompts)
  const consistEl = document.getElementById("statConsistency");
  if (consistEl) {
    consistEl.innerText = "Excellent";
  }

  if (typingIndicator) {
    typingIndicator.classList.remove("hidden");
    managerMsgs.scrollTop = managerMsgs.scrollHeight;
  }
  
  const style = managerStyleSelect ? managerStyleSelect.value : "Supportive";
  const basePrompt = systemPrompts[style] || systemPrompts["Supportive"];
  const systemPrompt = basePrompt + " IMPORTANT: At the very end of your response, provide exactly 2 short quick-reply suggestions for the user. Format them exactly like this: [Suggestion: Yes, I will do that] [Suggestion: I need more time]";

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);
    const response = await fetch("http://localhost:5000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage }
        ],
        max_tokens: 150
      })
    });

    const data = await response.json();
    clearTimeout(timeoutId);
    if (typingIndicator) typingIndicator.classList.add("hidden");

    if (data.choices && data.choices.length > 0) {
      let reply = data.choices[0].message.content;
      
      const suggestions = [];
      const regex = /\[Suggestion:\s*(.*?)\]/g;
      let match;
      while ((match = regex.exec(reply)) !== null) {
        suggestions.push(match[1]);
      }
      reply = reply.replace(/\[Suggestion:\s*(.*?)\]/g, '').trim();
      
      addManagerMessage(reply);
      if (suggestions.length > 0) {
        updateManagerActions(suggestions);
      }
    } else {
      console.error("API Error:", data);
      addManagerMessage("Action logged. I will continue to evaluate your decisions as the simulation progresses.", false);
    }
  } catch (err) {
    if (typingIndicator) typingIndicator.classList.add("hidden");
    console.error("Network Error:", err);
    addManagerMessage("Action logged. I will continue to evaluate your decisions as the simulation progresses.", false);
  }
}

// Ensure typing indicator is hidden by default
if (typingIndicator) {
  typingIndicator.classList.add("hidden");
}

// Button actions
managerActions.forEach(btn => {
  btn.addEventListener("click", () => {
    addManagerMessage(btn.textContent, true);
    simulateAiResponse(btn.textContent);
  });
});

// Inline Chat Input
if (managerSendBtn && managerInput) {
  const sendInputMsg = () => {
    const text = managerInput.value.trim();
    if (text) {
      addManagerMessage(text, true);
      simulateAiResponse(text);
      managerInput.value = "";
    }
  };
  managerSendBtn.addEventListener("click", sendInputMsg);
  managerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendInputMsg();
  });
}

// Style change event
if (managerStyleSelect) {
  managerStyleSelect.addEventListener("change", () => {
    addManagerMessage(`System Notice: AI Mentor personality reconfigured to [${managerStyleSelect.value}].`, false);
    simulateAiResponse(`Hi, please introduce yourself using your new ${managerStyleSelect.value} personality in one sentence.`);
  });
}

function updateManagerActions(suggestions) {
  const container = document.getElementById("managerActionsContainer");
  if (!container) return;
  container.innerHTML = "";
  suggestions.forEach(sugg => {
    const btn = document.createElement("button");
    btn.className = "nova-chip";
    btn.textContent = sugg;
    btn.addEventListener("click", () => {
      addManagerMessage(sugg, true);
      simulateAiResponse(sugg);
    });
    container.appendChild(btn);
  });
}

// Focus Mode Logic
if (focusToggle) {
  focusToggle.addEventListener("change", (e) => {
    const rightPanel = document.querySelector(".right-panel");
    if (e.target.checked) {
      document.body.classList.add("focus-mode");
      if (rightPanel) rightPanel.style.display = "none";
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(err => {
          console.log("Error attempting to enable full-screen mode:", err.message);
        });
      }
    } else {
      document.body.classList.remove("focus-mode");
      if (rightPanel) rightPanel.style.display = "";
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(err => {
          console.log("Error attempting to disable full-screen mode:", err.message);
        });
      }
    }
  });

  // Handle ESC key or browser exiting full screen manually
  document.addEventListener("fullscreenchange", () => {
    if (!document.fullscreenElement) {
      focusToggle.checked = false;
      document.body.classList.remove("focus-mode");
      const rightPanel = document.querySelector(".right-panel");
      if (rightPanel) rightPanel.style.display = "";
    }
  });
}

// Collapsible Cards Logic
const collapsibleHeaders = document.querySelectorAll(".collapsible-header");
collapsibleHeaders.forEach(header => {
  header.addEventListener("click", () => {
    const parent = header.parentElement;
    parent.classList.toggle("expanded");
  });
});

// ==========================================
// SKILL AUTHENTICATION & EMERGENCY LOGIC
// ==========================================
const authSkillBtn = document.getElementById("authSkillBtn");
const authModal = document.getElementById("authModal");
const closeAuthModal = document.getElementById("closeAuthModal");
const authTimerEl = document.getElementById("authTimer");
const authCbs = document.querySelectorAll(".auth-cb");
const submitAuthBtn = document.getElementById("submitAuthBtn");
const authStatus = document.getElementById("authStatus");

let authInterval;
let authTimeLeft = 60;

if (authSkillBtn && authModal) {
  authSkillBtn.addEventListener("click", () => {
    authModal.classList.remove("hidden");
    authTimeLeft = 60;
    authTimerEl.textContent = `${authTimeLeft}s`;
    
    // Start rapid timer
    clearInterval(authInterval);
    authInterval = setInterval(() => {
      authTimeLeft--;
      authTimerEl.textContent = `${authTimeLeft}s`;
      
      if (authTimeLeft <= 10) {
        authTimerEl.style.animation = "pulseRed 1s infinite";
      }
      
      if (authTimeLeft <= 0) {
        clearInterval(authInterval);
        alert("Time expired! Your execution speed was too slow for this crisis.");
        authModal.classList.add("hidden");
      }
    }, 1000);
  });

  closeAuthModal.addEventListener("click", () => {
    authModal.classList.add("hidden");
    clearInterval(authInterval);
  });
  
  // Validation logic: exactly 2 items must be checked
  authCbs.forEach(cb => {
    cb.addEventListener("change", () => {
      const checkedCount = document.querySelectorAll(".auth-cb:checked").length;
      if (checkedCount === 2) {
        submitAuthBtn.disabled = false;
        submitAuthBtn.style.opacity = "1";
        authStatus.textContent = "Ready to submit";
        authStatus.style.color = "var(--green)";
      } else {
        submitAuthBtn.disabled = true;
        submitAuthBtn.style.opacity = "0.5";
        authStatus.textContent = `Select exactly 2 (${checkedCount}/2)`;
        authStatus.style.color = "inherit";
      }
    });
  });
  
  submitAuthBtn.addEventListener("click", () => {
    clearInterval(authInterval);
    authModal.classList.add("hidden");
    
    // Show success toast
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = "Authentication Successful! Skill verified.";
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 3000);
    }
    
    // Change the emergency button to verified state
    authSkillBtn.textContent = "✓ Skill Verified";
    authSkillBtn.style.background = "var(--green)";
    authSkillBtn.style.borderColor = "var(--green)";
    authSkillBtn.classList.remove("pulse");
    authSkillBtn.disabled = true;
  });
}

// ==========================================
// SUBMISSION BAR AI BUTTONS
// ==========================================
const requestHintBtn = document.getElementById("requestHintBtn");
const askAiMentorBtn = document.getElementById("askAiMentorBtn");

if (requestHintBtn) {
  requestHintBtn.addEventListener("click", () => {
    addManagerMessage("System Notice: Simulation hint requested.", false);
    simulateAiResponse("I need a helpful, actionable hint for the current task: 'Launch New Feature for Mobile Users'. Please analyze the work required and provide a specific suggestion.");
  });
}

if (askAiMentorBtn) {
  askAiMentorBtn.addEventListener("click", () => {
    addManagerMessage("System Notice: AI Mentor review requested.", false);
    simulateAiResponse("Please act as my AI Mentor. Review my current simulation progress and give me a piece of constructive feedback or advice on how to improve my performance.");
  });
}

// ==========================================
// VOICE RECORDING & ANALYSIS LOGIC
// ==========================================
const startVoiceBtn = document.getElementById("startVoiceBtn");
const interviewActions = document.getElementById("interviewActions");
const recordingState = document.getElementById("recordingState");
const stopVoiceBtn = document.getElementById("stopVoiceBtn");
const recordTimer = document.getElementById("recordTimer");
const analysisState = document.getElementById("analysisState");
const analysisIcon = document.getElementById("analysisIcon");
const analysisStatus = document.getElementById("analysisStatus");


let voiceTimerInterval;
let voiceSeconds = 0;

if (startVoiceBtn && recordingState) {
  startVoiceBtn.addEventListener("click", () => {
    interviewActions.classList.add("hidden");
    recordingState.classList.remove("hidden");
    
    voiceSeconds = 0;
    recordTimer.textContent = "00:00";
    
    voiceTimerInterval = setInterval(() => {
      voiceSeconds++;
      const m = String(Math.floor(voiceSeconds / 60)).padStart(2, '0');
      const s = String(voiceSeconds % 60).padStart(2, '0');
      recordTimer.textContent = `${m}:${s}`;
    }, 1000);
  });

  stopVoiceBtn.addEventListener("click", () => {
    clearInterval(voiceTimerInterval);
    recordingState.classList.add("hidden");
    analysisState.classList.remove("hidden");
    
    // Simulate AI voice analysis delay
    setTimeout(() => {
      // Human verified state
      if(analysisIcon) {
        analysisIcon.innerHTML = '<i data-lucide="shield-check" class="icon-lg" style="color: var(--green);"></i>';
        lucide.createIcons();
      }
      analysisStatus.textContent = "Voice signature verified: 100% Human.";
      analysisStatus.style.color = "var(--green)";
      
      // Auto-submit after verification
      setTimeout(() => {
        analysisState.classList.add("hidden");
        interviewActions.classList.remove("hidden");
        if(interviewPopup) {
          interviewPopup.classList.add("hidden");
        }
        
        // Show success and simulate AI processing the answer
        const toast = document.getElementById("toast");
        if (toast) {
          toast.textContent = "Audio response submitted successfully.";
          toast.classList.remove("hidden");
          setTimeout(() => toast.classList.add("hidden"), 3000);
        }
        
        // Update Skill Points based on Voice Recording
        const commVal = document.getElementById("val-communication");
        const commBar = document.getElementById("bar-communication");
        if (commVal && commBar) {
          let currentScore = parseInt(commVal.textContent);
          if (currentScore < 100) {
            let newScore = Math.min(100, currentScore + 4);
            commVal.textContent = newScore;
            commBar.style.width = newScore + "%";
            commBar.style.background = "var(--green)"; // Highlight update
            setTimeout(() => {
              commBar.style.background = ""; // Revert to default
            }, 2000);
          }
        }
        
        const confVal = document.getElementById("statConfidence");
        if (confVal) {
          confVal.textContent = "94%";
          confVal.style.color = "var(--green)";
        }
        
        addManagerMessage("System Notice: Audio response submitted (Human Verified). +4 Communication.", false);
        simulateAiResponse("I just listened to your audio response regarding user retention. That makes sense, focusing on the core user base during a budget cut is a solid strategy.");
        
        // Reset analysis state for next time
        setTimeout(() => {
          if(analysisIcon) {
            analysisIcon.innerHTML = '<i data-lucide="cpu" class="icon-lg pulse" style="color: var(--indigo);"></i>';
          }
          analysisStatus.textContent = "Analyzing voice signature for AI generation...";
          analysisStatus.style.color = "inherit";
        }, 1000);
        
      }, 2000);
      
    }, 3000);
  });
}

// ==========================================
// TOPBAR INTERACTIVITY LOGIC
// ==========================================
const pressureMeter = document.getElementById("pressureMeter");
const pressureText = document.getElementById("pressureText");
const autoSaveBtn = document.getElementById("autoSaveBtn");

if (pressureMeter && pressureText) {
  const states = [
    { class: "low", text: "Pressure: Low", color: "var(--green)" },
    { class: "medium", text: "Pressure: Medium", color: "var(--yellow)" },
    { class: "high", text: "Pressure: High", color: "var(--red)" }
  ];
  let currentStateIdx = 1; // Starts at medium
  document.body.classList.add('pressure-medium');

  pressureMeter.addEventListener("click", () => {
    // Remove old class
    pressureMeter.classList.remove(states[currentStateIdx].class);
    document.body.classList.remove(`pressure-${states[currentStateIdx].class}`);
    
    // Cycle to next state
    currentStateIdx = (currentStateIdx + 1) % states.length;
    const nextState = states[currentStateIdx];
    
    // Add new class and update text
    pressureMeter.classList.add(nextState.class);
    document.body.classList.add(`pressure-${nextState.class}`);
    pressureText.textContent = nextState.text;
    
    // Quick pulse animation to show feedback
    pressureMeter.style.transform = "scale(0.95)";
    setTimeout(() => {
      pressureMeter.style.transform = "scale(1)";
    }, 100);
    
    // Optional: Log an event to the AI Manager
    addManagerMessage(`System Notice: Simulation pressure manually overridden to ${nextState.text.split(': ')[1]}.`, false);
    if(nextState.class === 'high') {
      simulateAiResponse("I see you've increased the pressure. Let's focus on rapid execution and prioritization.");
    }
  });
}

if (autoSaveBtn) {
  let isSaving = false;
  autoSaveBtn.addEventListener("click", () => {
    if (isSaving) return;
    isSaving = true;
    
    // Stats update
    const revEl = document.getElementById("statRevisions");
    if (revEl) {
      let revs = parseInt(revEl.innerText, 10) || 6;
      revs++;
      revEl.innerText = revs < 10 ? `0${revs}` : revs;
    }
    
    autoSaveBtn.innerHTML = '↻ Saving...';
    autoSaveBtn.style.color = "var(--text-color)";
    autoSaveBtn.classList.remove("pulse");
    
    // Simulate network delay
    setTimeout(() => {
      autoSaveBtn.innerHTML = '● Auto Saved';
      autoSaveBtn.style.color = "var(--green)";
      autoSaveBtn.classList.add("pulse");
      isSaving = false;
      
      const toast = document.getElementById("toast");
      if (toast) {
        toast.textContent = "Manual save completed successfully.";
        toast.classList.remove("hidden");
        setTimeout(() => toast.classList.add("hidden"), 3000);
      }
    }, 1200);
  });
}

// ==========================================
// PROJECT CARD INTERACTIVITY
// ==========================================
document.querySelectorAll(".project-card").forEach(card => {
  const applyBtn = card.querySelector(".primary-btn");
  const viewBtn = card.querySelector(".secondary-btn");
  
  if (applyBtn && applyBtn.textContent.includes("Apply")) {
    applyBtn.addEventListener("click", () => {
      const firstNames = ["Alice", "Bob", "Charlie", "Diana", "Evan", "Fiona", "George", "Hannah", "Ian", "Julia"];
      const lastNames = ["Smith", "Jones", "Chen", "Lee", "Wright", "Patel", "Kim", "Nguyen", "Garcia", "Martinez"];
      const t1 = `${firstNames[Math.floor(Math.random()*firstNames.length)]} ${lastNames[Math.floor(Math.random()*lastNames.length)]}`;
      const t2 = `${firstNames[Math.floor(Math.random()*firstNames.length)]} ${lastNames[Math.floor(Math.random()*lastNames.length)]}`;
      const e1 = t1.split(" ")[0].toLowerCase() + "@dayzero.io";
      const e2 = t2.split(" ")[0].toLowerCase() + "@dayzero.io";

      // Create Overlay
      const overlay = document.createElement("div");
      overlay.className = "onboarding-overlay";
      overlay.innerHTML = `
        <div class="onboard-modal">
          <h2 style="margin-bottom:20px; color:var(--text);">Initializing Workspace...</h2>
          <ul class="onboard-steps">
            <li id="step1"><i data-lucide="loader-2" class="icon-sm pulse"></i> Opens a project workspace...</li>
            <li id="step2" class="hidden"><i data-lucide="loader-2" class="icon-sm pulse"></i> Creates team room...</li>
            <li id="step3" class="hidden"><i data-lucide="loader-2" class="icon-sm pulse"></i> Assigns roles...</li>
            <li id="step4" class="hidden"><i data-lucide="loader-2" class="icon-sm pulse"></i> Signing in ${t1} (Backend) & ${t2} (QA) with email...</li>
            <li id="step5" class="hidden"><i data-lucide="loader-2" class="icon-sm pulse"></i> Assigns tasks to everyone...</li>
          </ul>
        </div>
      `;
      document.body.appendChild(overlay);
      if (typeof lucide !== 'undefined') lucide.createIcons();

      // Inject CSS once
      if (!document.getElementById("onboardCss")) {
        const style = document.createElement("style");
        style.id = "onboardCss";
        style.innerHTML = `
          .onboarding-overlay {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(248, 250, 252, 0.9);
            backdrop-filter: blur(10px);
            z-index: 9999;
            display: flex; justify-content: center; align-items: center;
          }
          .onboard-modal {
            background: #fff; border: 1px solid var(--border); border-radius: 16px;
            padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.08); width: 450px;
          }
          .onboard-steps { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 15px; }
          .onboard-steps li { display: flex; align-items: center; gap: 12px; color: var(--subtext); font-weight: 500; font-size: 14px; }
          .onboard-steps li.done { color: var(--text); }
          .onboard-steps li.done i { color: var(--green); }
          .onboard-steps li i { margin-top: 0; }
        `;
        document.head.appendChild(style);
      }

      // Step Runner
      const runStep = (stepNum, delay) => {
        return new Promise(resolve => setTimeout(() => {
          const li = document.getElementById(`step${stepNum}`);
          if (li) {
            li.classList.remove("hidden");
            if (stepNum > 1) {
               const prev = document.getElementById(`step${stepNum-1}`);
               prev.classList.add("done");
               prev.innerHTML = `<i data-lucide="check-circle" class="icon-sm"></i> ` + prev.innerText;
            }
            if (typeof lucide !== 'undefined') lucide.createIcons();
          }
          resolve();
        }, delay));
      };

      const title = card.querySelector(".proj-title") ? card.querySelector(".proj-title").textContent : "New Project";

      runStep(1, 0)
        .then(() => runStep(2, 600))
        .then(() => runStep(3, 600))
        .then(() => runStep(4, 800))
        .then(() => runStep(5, 800))
        .then(() => new Promise(r => setTimeout(r, 800)))
        .then(() => {
          const prev = document.getElementById(`step5`);
          prev.classList.add("done");
          prev.innerHTML = `<i data-lucide="check-circle" class="icon-sm"></i> ` + prev.innerText;
          if (typeof lucide !== 'undefined') lucide.createIcons();
          
          setTimeout(() => {
            overlay.remove();
            
            // RESTRUCTURE WORKSPACE
            const workspace = document.getElementById("panel-workspace");
            workspace.innerHTML = `
              <div class="section-title-row" style="margin-bottom:20px;">
                <h3 id="workspaceProjTitle">${title} - Collaboration Workspace</h3>
                <span class="section-sub">Your centralized team room and project dashboard</span>
              </div>
            `;
            
            // 1. Team Members
            const teamRow = document.createElement("div");
            teamRow.className = "card collab-score-card";
            teamRow.style.marginBottom = "20px";
            teamRow.innerHTML = `
              <h4>Team Roster & Roles</h4>
              <div style="display:flex; gap:15px; margin-top:10px;">
                <div class="coop-user" style="display:flex; align-items:center; gap:8px;"><div class="avatar blue">Y</div><span style="display:flex; flex-direction:column; line-height:1.2;"><strong>You (PM)</strong><small style="color:var(--text-muted); font-size:11px;">you@dayzero.io</small></span></div>
                <div class="coop-user" style="display:flex; align-items:center; gap:8px;"><div class="avatar purple">${t1[0]}</div><span style="display:flex; flex-direction:column; line-height:1.2;"><strong>${t1} (Backend)</strong><small style="color:var(--text-muted); font-size:11px;">${e1}</small></span></div>
                <div class="coop-user" style="display:flex; align-items:center; gap:8px;"><div class="avatar green">${t2[0]}</div><span style="display:flex; flex-direction:column; line-height:1.2;"><strong>${t2} (QA)</strong><small style="color:var(--text-muted); font-size:11px;">${e2}</small></span></div>
                <div class="coop-user" style="display:flex; align-items:center; gap:8px;"><div class="avatar dark">N</div><span style="display:flex; flex-direction:column; line-height:1.2;"><strong>Nova (Manager)</strong><small style="color:var(--text-muted); font-size:11px;">nova@dayzero.io</small></span></div>
              </div>
            `;
            workspace.appendChild(teamRow);

            // 2. Task Board (Kanban)
            const kanbanCard = document.querySelector(".kanban-card");
            if (kanbanCard) {
              kanbanCard.style.marginBottom = "20px";
              
              const smallTags = kanbanCard.querySelectorAll(".k-meta small");
              if(smallTags.length >= 2) {
                smallTags[0].innerText = t1;
                smallTags[1].innerText = t2;
                const devRoles = kanbanCard.querySelectorAll(".k-meta .role");
                if (devRoles.length >= 3) {
                  devRoles[1].innerText = "Backend";
                  devRoles[2].innerText = "QA";
                }
              }
              workspace.appendChild(kanbanCard);
            }

            // 3. Work Timeline (from Insights)
            const timelineCard = document.querySelector(".bottom-analytics");
            if (timelineCard) {
              timelineCard.style.marginBottom = "20px";
              workspace.appendChild(timelineCard);
            }

            // 4. Project Files & Environment
            const filesCard = document.createElement("div");
            filesCard.className = "card";
            filesCard.innerHTML = `
              <div class="section-title-row" style="display:flex; justify-content:space-between; align-items:center;">
                <h4>Project Files & Tools</h4>
                <select class="secondary-btn" style="appearance: auto; padding-right: 24px; cursor: pointer;">
                  <option value="" disabled selected>Open with...</option>
                  <option value="vscode">VS Code Remote</option>
                  <option value="codespaces">GitHub Codespaces</option>
                  <option value="jupyter">JupyterLab</option>
                  <option value="tableau">Tableau Server</option>
                  <option value="figma">Figma</option>
                  <option value="jira">Jira / Notion</option>
                </select>
              </div>
              <div class="placeholder-box" style="min-height:80px; margin-top:10px; display:flex; gap:10px;">
                <button class="secondary-btn file-btn"><i data-lucide="file-text" class="icon-sm"></i> Architecture.pdf</button>
                <button class="secondary-btn file-btn"><i data-lucide="file-text" class="icon-sm"></i> User_Stories.docx</button>
              </div>
            `;
            workspace.appendChild(filesCard);

            filesCard.querySelectorAll('.file-btn').forEach(btn => {
              btn.addEventListener('click', () => {
                const originalHtml = btn.innerHTML;
                const fileName = btn.textContent.trim();
                
                btn.innerHTML = `<i data-lucide="loader-2" class="icon-sm pulse"></i> Opening...`;
                btn.disabled = true;
                if (typeof lucide !== 'undefined') lucide.createIcons();

                setTimeout(() => {
                  btn.innerHTML = originalHtml;
                  btn.disabled = false;
                  if (typeof lucide !== 'undefined') lucide.createIcons();

                  const toast = document.getElementById("toast");
                  if (toast) {
                    toast.textContent = `Opened ${fileName} securely.`;
                    toast.classList.remove("hidden");
                    setTimeout(() => toast.classList.add("hidden"), 3000);
                  }

                  if (typeof addTimelineEvent === 'function') {
                    addTimelineEvent(`Reviewed ${fileName}`);
                  }
                }, 1200);
              });
            });

            // Switch to Workspace Tab
            document.querySelectorAll(".view-panel").forEach(p => {
              p.classList.add("hidden");
              p.classList.remove("active");
            });
            workspace.classList.remove("hidden");
            workspace.classList.add("active");
            
            document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
            const wsLink = document.querySelector('[data-target="panel-workspace"]');
            if (wsLink) wsLink.classList.add("active");

            // Notify AI
            addManagerMessage(`System Notice: Team formed for ${title}. AI Teammates assigned.`, false);
            simulateAiResponse(`I've provisioned the workspace and assigned the AI Backend and QA engineers. The task board is ready, what's our first move?`);
          }, 800);
        });
    });
  }

  // Add listeners to role tags so they can be selected
  document.querySelectorAll('.role-tag').forEach(tag => {
    tag.addEventListener('click', (e) => {
      e.stopPropagation(); // prevent clicking the card underneath
      // Deselect siblings in the same card
      const card = tag.closest('.project-card');
      if(card) {
        card.querySelectorAll('.role-tag').forEach(t => t.classList.remove('selected'));
      }
      tag.classList.add('selected');
    });
  });

  if (applyBtn && applyBtn.textContent.includes("Start 5-Day Sprint")) {
    applyBtn.addEventListener("click", () => {
      // Create Overlay
      const overlay = document.createElement("div");
      overlay.className = "onboarding-overlay";
      overlay.style.position = "fixed";
      overlay.style.inset = "0";
      overlay.style.zIndex = "9999";
      overlay.style.background = "#ffffff";
      overlay.style.display = "flex";
      overlay.style.flexDirection = "column";

      overlay.innerHTML = `
        <div class="onboard-modal sprint-modal-full" style="width: 100vw; height: 100vh; padding: 0; overflow-x: hidden; overflow-y: auto; background: #ffffff; border-radius: 0; border: none; box-shadow: none;">
          <!-- Content dynamically updated -->
        </div>
      `;
      document.body.appendChild(overlay);

      const modalContent = overlay.querySelector('.onboard-modal');

      const title = card.querySelector(".proj-title") ? card.querySelector(".proj-title").textContent : "Simulation";
      const logoImg = card.querySelector("img");
      const logoSrc = logoImg ? logoImg.src : "";
      let selectedTag = card.querySelector(".role-tag.selected");
      if (!selectedTag) selectedTag = card.querySelector(".role-tag");
      const targetRole = selectedTag ? selectedTag.textContent.trim() : "Candidate";
      
      let rl = targetRole.toLowerCase();
      let roleType = "Developer";
      if(rl.includes("product") || rl.includes("pm") || rl.includes("manager")) roleType = "PM";
      else if(rl.includes("design") || rl.includes("ux") || rl.includes("ui") || rl.includes("art")) roleType = "Designer";
      else if(rl.includes("front")) roleType = "Frontend";
      else if(rl.includes("back") || rl.includes("cloud") || rl.includes("devops") || rl.includes("infra")) roleType = "Backend";
      else if(rl.includes("ml") || rl.includes("data") || rl.includes("ai")) roleType = "ML";

      let day1Desc = "";
      if(roleType === "PM") {
        day1Desc = `
          <div class="deliverable-callout"><i data-lucide="box" style="width: 16px; height: 16px; margin-right: 8px; color: #4f46e5;"></i><strong>Deliverable:</strong> A one-page Product Requirements Document (PRD) and Execution Timeline.</div>
          <p class="task-context">Our engineering bandwidth is highly constrained. You must include:</p>
          <ul class="task-requirements-list">
            <li><strong>Risk Analysis:</strong> Identify top 3 technical and market risks.</li>
            <li><strong>Success Metrics:</strong> Define 2 key KPIs for the MVP launch.</li>
            <li><strong>Priority Matrix:</strong> Map MVP features against our limited bandwidth.</li>
          </ul>
        `;
      } else if(roleType === "Designer") {
        day1Desc = `
          <div class="deliverable-callout"><i data-lucide="box" style="width: 16px; height: 16px; margin-right: 8px; color: #4f46e5;"></i><strong>Deliverable:</strong> High-fidelity wireframes or a functional Figma prototype.</div>
          <p class="task-context">The team needs a clear visual direction before coding begins. You must include:</p>
          <ul class="task-requirements-list">
            <li><strong>User Flow:</strong> Map out the primary onboarding journey.</li>
            <li><strong>Design Rationale:</strong> Explain your layout and typography choices.</li>
            <li><strong>Component States:</strong> Include hover, active, and error states.</li>
          </ul>
        `;
      } else if(roleType === "Frontend") {
        day1Desc = `
          <div class="deliverable-callout"><i data-lucide="box" style="width: 16px; height: 16px; margin-right: 8px; color: #4f46e5;"></i><strong>Deliverable:</strong> Responsive UI components and a deployed prototype.</div>
          <p class="task-context">We need to ensure cross-device compatibility. You must include:</p>
          <ul class="task-requirements-list">
            <li><strong>Component Structure:</strong> Breakdown of reusable React/Vue elements.</li>
            <li><strong>Accessibility:</strong> Ensure ARIA labels and keyboard navigation work.</li>
            <li><strong>Deployment Link:</strong> Connect your GitHub repo and provide a live URL.</li>
          </ul>
        `;
      } else if(roleType === "Backend") {
        day1Desc = `
          <div class="deliverable-callout"><i data-lucide="box" style="width: 16px; height: 16px; margin-right: 8px; color: #4f46e5;"></i><strong>Deliverable:</strong> System architecture document and core API routes.</div>
          <p class="task-context">Latency and scalability are our biggest concerns right now. You must include:</p>
          <ul class="task-requirements-list">
            <li><strong>API Endpoints:</strong> Documentation for 3 core REST/GraphQL endpoints.</li>
            <li><strong>DB Schema:</strong> Entity relationship diagram for user data.</li>
            <li><strong>Architecture Diagram:</strong> Show how services communicate under load.</li>
          </ul>
        `;
      } else if(roleType === "ML") {
        day1Desc = `
          <div class="deliverable-callout"><i data-lucide="box" style="width: 16px; height: 16px; margin-right: 8px; color: #4f46e5;"></i><strong>Deliverable:</strong> Model training approach and evaluation metrics.</div>
          <p class="task-context">We need to improve our recommendation engine's accuracy. You must include:</p>
          <ul class="task-requirements-list">
            <li><strong>Dataset Handling:</strong> Explain how you will clean and split the data.</li>
            <li><strong>Evaluation Metrics:</strong> Define precision, recall, and F1 score targets.</li>
            <li><strong>Notebook Upload:</strong> Provide your Jupyter notebook with initial EDA.</li>
          </ul>
        `;
      } else {
        day1Desc = `
          <div class="deliverable-callout"><i data-lucide="box" style="width: 16px; height: 16px; margin-right: 8px; color: #4f46e5;"></i><strong>Deliverable:</strong> A comprehensive one-page strategic brief.</div>
          <ul class="task-requirements-list">
            <li><strong>Recommendation:</strong> Clear executive summary of your proposed path.</li>
            <li><strong>Risk Mitigation:</strong> Highlight potential blockers and solutions.</li>
            <li><strong>Timeline:</strong> Provide a rough estimation for milestones.</li>
          </ul>
        `;
      }

      let uiPlaceholder = "";
      let uiButtons = "";
      if(roleType === "PM") {
        uiPlaceholder = "PRD editor, sprint planning, metrics dashboard...";
        uiButtons = `
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #eff6ff, #e0e7ff); color: #3730a3; border: 1px solid #c7d2fe; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="file-text" style="width:16px; height:16px; margin-right:8px;"></i> Notion PRD</button>
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: #166534; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="pie-chart" style="width:16px; height:16px; margin-right:8px;"></i> Mixpanel</button>
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #fff7ed, #ffedd5); color: #9a3412; border: 1px solid #fed7aa; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="layout" style="width:16px; height:16px; margin-right:8px;"></i> Linear Board</button>
        `;
      } else if(roleType === "Designer") {
        uiPlaceholder = "Figma collaboration, asset uploads, prototype preview...";
        uiButtons = `
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); color: #5b21b6; border: 1px solid #ddd6fe; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="figma" style="width:16px; height:16px; margin-right:8px;"></i> Figma</button>
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #eff6ff, #e0e7ff); color: #1e40af; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="cloud-upload" style="width:16px; height:16px; margin-right:8px;"></i> Cloudinary</button>
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #fdf4ff, #fae8ff); color: #86198f; border: 1px solid #fbcfe8; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="play" style="width:16px; height:16px; margin-right:8px;"></i> Framer Pro</button>
        `;
      } else if(roleType === "ML") {
        uiPlaceholder = "Notebook Upload, Model Parameters, Output Logs...";
        uiButtons = `
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #fff7ed, #ffedd5); color: #9a3412; border: 1px solid #fed7aa; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="book-open" style="width:16px; height:16px; margin-right:8px;"></i> Colab Notebook</button>
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: #166534; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="box" style="width:16px; height:16px; margin-right:8px;"></i> HuggingFace</button>
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #eff6ff, #e0e7ff); color: #1e40af; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="bar-chart-3" style="width:16px; height:16px; margin-right:8px;"></i> W&B Logs</button>
        `;
      } else if(roleType === "Frontend") {
        uiPlaceholder = "GitHub sync, component tasks, deployment links...";
        uiButtons = `
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); color: #0f172a; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="github" style="width:16px; height:16px; margin-right:8px;"></i> GitHub</button>
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; border: 1px solid #334155; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="external-link" style="width:16px; height:16px; margin-right:8px;"></i> Vercel</button>
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #fff1f2, #ffe4e6); color: #9f1239; border: 1px solid #fecdd3; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="layout-template" style="width:16px; height:16px; margin-right:8px;"></i> Storybook</button>
        `;
      } else if(roleType === "Backend") {
        uiPlaceholder = "API testing, database schema, server logs...";
        uiButtons = `
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #fff7ed, #ffedd5); color: #c2410c; border: 1px solid #fdba74; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="send" style="width:16px; height:16px; margin-right:8px;"></i> Postman</button>
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #f0fdf4, #dcfce7); color: #15803d; border: 1px solid #86efac; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="bar-chart-2" style="width:16px; height:16px; margin-right:8px;"></i> Datadog</button>
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #f5f3ff, #ede9fe); color: #6d28d9; border: 1px solid #ddd6fe; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="database" style="width:16px; height:16px; margin-right:8px;"></i> Supabase</button>
        `;
      } else {
        uiPlaceholder = "GitHub sync, component tasks, deployment links...";
        uiButtons = `
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #f8fafc, #f1f5f9); color: #0f172a; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="github" style="width:16px; height:16px; margin-right:8px;"></i> GitHub</button>
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #0f172a, #1e293b); color: #fff; border: 1px solid #334155; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="external-link" style="width:16px; height:16px; margin-right:8px;"></i> Vercel</button>
          <button class="sim-link-btn" style="background: linear-gradient(135deg, #fff1f2, #ffe4e6); color: #9f1239; border: 1px solid #fecdd3; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; height: 42px; display: flex; align-items: center; cursor: pointer;" onclick="window.handleRoleAction(this)"><i data-lucide="layout-template" style="width:16px; height:16px; margin-right:8px;"></i> Storybook</button>
        `;
      }
      
      let uName = "";
      try {
        const u = JSON.parse(localStorage.getItem("user"));
        if (u && u.name) uName = u.name;
      } catch(e) {}

      const sprintData = [
        {
          day: 1,
          header: "DAY 1 OF 5 · TASK BRIEF",
          title: "Welcome to DayZero – Let's Ship Something",
          desc: day1Desc,
          teammateName: "Maya Chen",
          teammateRole: "SENIOR DESIGNER",
          teammateAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Maya",
          teammateMsg: "Hey! Excited to work with you. Just a heads up—I've been getting user complaints about our mobile web experience. The navigation is clunky on small screens and users keep asking for offline access. I have some mockups I did last quarter to see what a mobile experience could look like. Let me know what you need from design!"
        },
        {
          day: 2,
          header: "DAY 2 OF 5 · TASK BRIEF",
          title: "Prioritize the MVP Scope",
          desc: "We are moving forward with the Native App. Review the proposed feature list and prioritize the top 3 features for our MVP launch. Explain your rationale.",
          teammateName: "Alex",
          teammateRole: "ENGINEERING MANAGER",
          teammateAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex",
          teammateMsg: "If we want to hit the deadline, we need to cut scope aggressively. The auth module alone will take 2 weeks."
        },
        {
          day: 3,
          header: "DAY 3 OF 5 · TASK BRIEF",
          title: "Handling the Latency Crisis",
          desc: "Our primary API is experiencing severe latency under load. Draft a quick communication to stakeholders and decide whether to halt the rollout.",
          teammateName: "Sam",
          teammateRole: "BACKEND ENGINEER",
          teammateAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sam",
          teammateMsg: "The database indices aren't scaling. I need 4 hours to rebuild them, which means downtime."
        },
        {
          day: 4,
          header: "DAY 4 OF 5 · TASK BRIEF",
          title: "Competitor Response",
          desc: "A major competitor just released a feature identical to our core offering, but cheaper. Outline a 3-point strategy to retain our enterprise clients.",
          teammateName: "Riley Park",
          teammateRole: "CEO",
          teammateAvatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Riley",
          teammateMsg: "I just saw the news. We can't panic, but we need a solid response for our enterprise accounts by tomorrow."
        },
        {
          day: 5,
          header: "DAY 5 OF 5 · TASK BRIEF",
          title: "Finalizing Launch Metrics",
          desc: "We are ready to launch. Define the top 2 KPI metrics we will track in the first 48 hours to measure success.",
          teammateName: "Jordan",
          teammateRole: "DATA ANALYST",
          teammateAvatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Jordan",
          teammateMsg: "Analytics pipeline is set up. Just give me the specific events you want dashboarded."
        }
      ];

      let currentDayIndex = -1; // -1 represents the onboarding screen
      
      window.initiateCollab = async function(type) {
        const feed = document.getElementById("teamFeedContainer");
        if(!feed) return;
        
        feed.innerHTML += `
          <div class="team-msg-card" style="display: flex; gap: 16px; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 16px; animation: fadeIn 0.3s ease;">
            <div style="width: 48px; height: 48px; border-radius: 50%; background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; box-shadow: 0 2px 8px rgba(37,99,235,0.3);">You</div>
            <div style="flex: 1;">
              <div style="margin-bottom: 8px;">
                <span style="font-weight: 700; font-size: 15px; color: #0f172a; margin-right: 8px;">You</span>
              </div>
              <div style="color: #334155; font-size: 14px; line-height: 1.6;">
                Initiated a ${type}... waiting for acceptance.
              </div>
            </div>
          </div>
        `;
        feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });

        if (type === 'Meet' || type === 'Screen Share') {
            setTimeout(async () => {
                const teammateNameEl = document.querySelector(".team-msg-card span");
                const name = teammateNameEl && teammateNameEl.textContent !== "Nova" && teammateNameEl.textContent !== "You" ? teammateNameEl.textContent : "Teammate";
                const imgEl = document.querySelector(".team-msg-card img");
                const avatar = imgEl && !imgEl.src.includes("Nova") ? imgEl.src : "https://api.dicebear.com/7.x/notionists/svg?seed=Team";
                
                const sessionId = 'session_' + Date.now();
                const gridTemplate = type === 'Screen Share' ? '2fr 1fr' : '1fr 1fr';
                
                feed.innerHTML += `
                  <div class="team-msg-card" style="padding: 0; background: #0f172a; border-radius: 16px; margin-top: 16px; overflow: hidden; animation: fadeIn 0.3s ease; box-shadow: 0 12px 24px rgba(15,23,42,0.2);">
                    <div style="padding: 12px 20px; background: rgba(255,255,255,0.05); border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center;">
                      <div style="color: #fff; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                        <div style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%; box-shadow: 0 0 8px #ef4444; animation: pulse 2s infinite;"></div>
                        Live ${type}
                      </div>
                      <div style="color: #94a3b8; font-size: 12px; font-family: monospace;">ENCRYPTED P2P</div>
                    </div>
                    
                    <div style="padding: 16px; display: grid; gap: 12px; grid-template-columns: ${gridTemplate}; min-height: 200px; background: #0f172a;">
                      <div style="background: #1e293b; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; min-height: 180px;">
                        <video id="local_${sessionId}" autoplay playsinline muted style="width: 100%; height: 100%; object-fit: contain;"></video>
                        <div id="status_${sessionId}" style="position: absolute; color: #94a3b8; font-size: 13px;">Connecting...</div>
                        <div style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.6); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; backdrop-filter: blur(4px);">You</div>
                      </div>
                      
                      <div style="background: #1e293b; border-radius: 12px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.1); display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 180px;">
                        <img id="teammate_avatar_${sessionId}" src="${avatar}" style="width: 64px; height: 64px; border-radius: 50%; border: 2px solid #3b82f6; box-shadow: 0 0 0 4px rgba(59,130,246,0.2); animation: pulse 2s infinite; transition: all 0.2s;">
                        <div id="teammate_mic_${sessionId}" style="position: absolute; bottom: 8px; left: 8px; background: rgba(0,0,0,0.6); color: #fff; padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: 600; backdrop-filter: blur(4px); display: flex; align-items: center; gap: 4px;">
                          <i data-lucide="mic-off" style="width: 12px; height: 12px; color: #ef4444;"></i> ${name}
                        </div>
                      </div>
                    </div>
                    
                    <div style="padding: 16px; background: rgba(255,255,255,0.02); display: flex; justify-content: center; gap: 12px; border-top: 1px solid rgba(255,255,255,0.05);">
                      <button id="mic_btn_${sessionId}" style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"><i data-lucide="mic"></i></button>
                      <button id="cam_btn_${sessionId}" style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"><i data-lucide="video"></i></button>
                      <button id="share_btn_${sessionId}" style="width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;"><i data-lucide="monitor-up"></i></button>
                      <button id="end_${sessionId}" style="padding: 0 24px; height: 44px; border-radius: 22px; background: #ef4444; border: none; color: #fff; font-weight: 600; cursor: pointer; transition: background 0.2s; box-shadow: 0 4px 12px rgba(239,68,68,0.3);" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">End Session</button>
                    </div>
                  </div>
                `;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
                
                let stream = null;

                // Handle End Call logic FIRST so it always works even if media fails
                const endSession = (e) => {
                    const endBtn = document.getElementById(`end_${sessionId}`);
                    if(!endBtn || endBtn.innerText === 'Ended') return;
                    window.sessionActive = false;
                    if(window.currentRecognition) {
                        try { window.currentRecognition.stop(); } catch(err){}
                    }
                    if(stream) {
                        stream.getTracks().forEach(track => track.stop());
                    }
                    const card = endBtn.closest('.team-msg-card');
                    if(card) {
                        card.style.opacity = '0.5';
                        card.style.pointerEvents = 'none';
                    }
                    endBtn.innerText = 'Ended';
                    window.speechSynthesis.cancel(); 
                    
                    const summaries = [
                        "We agreed to prioritize the core features discussed and start on the initial draft.",
                        "We aligned on the risk factors and decided to pivot the current approach slightly.",
                        "Good discussion on the latency issues. Proceeding with database indexing as a priority.",
                        "Finalized the launch metrics and success criteria for the upcoming rollout."
                    ];
                    const randomSummary = summaries[Math.floor(Math.random() * summaries.length)];
                    
                    feed.innerHTML += `
                      <div class="team-msg-card" style="display: flex; flex-direction: column; gap: 8px; padding: 16px 20px; background: #fdf4ff; border: 1px solid #fbcfe8; border-radius: 12px; margin-top: 16px; color: #86198f; font-size: 14px; box-shadow: 0 4px 6px rgba(134,25,143,0.05); animation: fadeIn 0.4s ease;">
                        <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">
                          <i data-lucide="sparkles" style="width: 14px; height: 14px;"></i> AI Meeting Summary
                        </div>
                        <div style="line-height: 1.5; color: #701a75;">
                          <strong>${type} ended.</strong> ${randomSummary} You can now update your submission with these notes.
                        </div>
                      </div>
                    `;
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
                };

                document.getElementById(`end_${sessionId}`).addEventListener('click', endSession);

                const shareBtn = document.getElementById(`share_btn_${sessionId}`);
                if(shareBtn) {
                    shareBtn.addEventListener('click', async () => {
                        try {
                            const newStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                            const videoEl = document.getElementById(`local_${sessionId}`);
                            if(videoEl) {
                                videoEl.srcObject = newStream;
                                // Add listener to revert when screen sharing stops
                                newStream.getVideoTracks()[0].onended = () => {
                                    if(stream) videoEl.srcObject = stream;
                                    shareBtn.style.background = 'rgba(255,255,255,0.1)';
                                    shareBtn.style.color = '#fff';
                                };
                            }
                            shareBtn.style.background = '#3b82f6';
                            shareBtn.style.color = '#fff';
                        } catch(err) {
                            console.error("Screen share failed", err);
                        }
                    });
                }

                try {
                    if (type === 'Meet') {
                        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                    } else if (type === 'Screen Share') {
                        // Use only video for screen share to avoid audio capture errors on some systems
                        stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
                    }
                    
                    const videoEl = document.getElementById(`local_${sessionId}`);
                    const statusEl = document.getElementById(`status_${sessionId}`);
                    if (statusEl) statusEl.style.display = 'none';

                    if (videoEl && stream) {
                        videoEl.srcObject = stream;
                        
                        const micBtn = document.getElementById(`mic_btn_${sessionId}`);
                        const camBtn = document.getElementById(`cam_btn_${sessionId}`);
                        let micEnabled = true;
                        let camEnabled = true;

                        if (micBtn && stream.getAudioTracks().length > 0) {
                            micBtn.addEventListener('click', () => {
                                micEnabled = !micEnabled;
                                stream.getAudioTracks().forEach(t => t.enabled = micEnabled);
                                micBtn.innerHTML = micEnabled ? '<i data-lucide="mic"></i>' : '<i data-lucide="mic-off"></i>';
                                micBtn.style.background = micEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.2)';
                                micBtn.style.color = micEnabled ? '#fff' : '#ef4444';
                                if (typeof lucide !== 'undefined') lucide.createIcons();
                            });
                        } else if (micBtn) {
                            micBtn.style.opacity = '0.5';
                            micBtn.style.pointerEvents = 'none';
                        }

                        if (camBtn && stream.getVideoTracks().length > 0) {
                            camBtn.addEventListener('click', () => {
                                camEnabled = !camEnabled;
                                stream.getVideoTracks().forEach(t => t.enabled = camEnabled);
                                camBtn.innerHTML = camEnabled ? '<i data-lucide="video"></i>' : '<i data-lucide="video-off"></i>';
                                camBtn.style.background = camEnabled ? 'rgba(255,255,255,0.1)' : 'rgba(239,68,68,0.2)';
                                camBtn.style.color = camEnabled ? '#fff' : '#ef4444';
                                if (typeof lucide !== 'undefined') lucide.createIcons();
                            });
                        }

                        // AI Voice-to-Voice Loop Setup
                        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                        window.currentRecognition = null;
                        let isListening = false;
                        let isSpeaking = false;
                        window.sessionActive = true;

                        if (SpeechRecognition) {
                            window.currentRecognition = new SpeechRecognition();
                            window.currentRecognition.continuous = false;
                            window.currentRecognition.interimResults = false;
                            window.currentRecognition.lang = 'en-US';

                            window.currentRecognition.onstart = () => {
                                isListening = true;
                                const teammateMic = document.getElementById(`teammate_mic_${sessionId}`);
                                if(teammateMic) {
                                    teammateMic.innerHTML = `<i data-lucide="ear" style="width: 12px; height: 12px; color: #3b82f6;"></i> Listening...`;
                                    if (typeof lucide !== 'undefined') lucide.createIcons();
                                }
                            };

                            window.currentRecognition.onresult = async (event) => {
                                const transcript = event.results[0][0].transcript;
                                console.log("User said:", transcript);
                                
                                const teammateMic = document.getElementById(`teammate_mic_${sessionId}`);
                                if(teammateMic) {
                                    teammateMic.innerHTML = `<i data-lucide="loader" style="width: 12px; height: 12px; color: #f59e0b; animation: spin 1s linear infinite;"></i> Thinking...`;
                                    if (typeof lucide !== 'undefined') lucide.createIcons();
                                }

                                try {
                                    const subText = document.getElementById('sprintSubmissionText') ? document.getElementById('sprintSubmissionText').value : "";
                                    const roleContext = window.simulationUser ? window.simulationUser.role : "teammate";
                                    
                                    await new Promise(r => setTimeout(r, 1000));
                                    
                                    const res = await fetch('http://localhost:5000/api/chat', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ 
                                            message: transcript,
                                            system_prompt: `You are ${name}, a friendly AI teammate in a live voice call. The user just spoke to you over voice chat. Keep your response brief (1-2 short sentences maximum), conversational, and natural like a real spoken conversation. The user is in role: ${roleContext}. Their current draft is: ${subText}`
                                        })
                                    });
                                    
                                    const data = await res.json();
                                    let reply = "I'm not sure what to say.";
                                    if (data.choices && data.choices.length > 0) {
                                        reply = data.choices[0].message.content;
                                    } else if (data.reply) {
                                        reply = data.reply;
                                    }
                                    speakResponse(reply);
                                } catch (e) {
                                    console.error(e);
                                    speakResponse("Sorry, my connection broke for a second there. What did you say?");
                                }
                            };

                            window.currentRecognition.onend = () => {
                                isListening = false;
                                if (window.sessionActive && !isSpeaking) {
                                    try { window.currentRecognition.start(); } catch(e) {}
                                }
                            };
                            
                            window.currentRecognition.onerror = (e) => {
                                console.error("Speech Rec Error:", e.error);
                                isListening = false;
                                if (window.sessionActive && !isSpeaking) {
                                    setTimeout(() => { try { window.currentRecognition.start(); } catch(e) {} }, 1000);
                                }
                            };
                        }

                        const speakResponse = (msgText) => {
                            isSpeaking = true;
                            if(window.currentRecognition && isListening) {
                                try { window.currentRecognition.stop(); } catch(e){}
                            }

                            const utterance = new SpeechSynthesisUtterance(msgText);
                            utterance.rate = 1.0;
                            utterance.pitch = 1.1;
                            
                            const teammateAvatar = document.getElementById(`teammate_avatar_${sessionId}`);
                            const teammateMic = document.getElementById(`teammate_mic_${sessionId}`);
                            
                            utterance.onstart = () => {
                                if(teammateAvatar) teammateAvatar.style.animation = 'pulse 0.4s infinite';
                                if(teammateMic) {
                                    teammateMic.innerHTML = `<i data-lucide="mic" style="width: 12px; height: 12px; color: #22c55e;"></i> ${name}`;
                                    if (typeof lucide !== 'undefined') lucide.createIcons();
                                }
                            };
                            
                            utterance.onend = () => {
                                isSpeaking = false;
                                if(teammateAvatar) teammateAvatar.style.animation = 'pulse 2s infinite';
                                if(teammateMic) {
                                    teammateMic.innerHTML = `<i data-lucide="mic-off" style="width: 12px; height: 12px; color: #ef4444;"></i> ${name}`;
                                    if (typeof lucide !== 'undefined') lucide.createIcons();
                                }
                                
                                if (window.sessionActive && window.currentRecognition) {
                                    try { window.currentRecognition.start(); } catch(e) {}
                                }
                            };
                            
                            window.speechSynthesis.speak(utterance);
                        };

                        setTimeout(() => {
                            const subText = document.getElementById('sprintSubmissionText') ? document.getElementById('sprintSubmissionText').value : "";
                            const currentRole = window.simulationUser ? window.simulationUser.role : "teammate";
                            let initialMsg = "";
                            if (subText.length < 10) {
                                initialMsg = `Hey! I'm ${name}. I see you haven't started your draft yet. I'm listening, what do you want to brainstorm for the ${currentRole} tasks?`;
                            } else {
                                initialMsg = `Hey ${name} here. I am looking at your draft right now. This is a solid start on the ${currentRole} deliverables. I'm listening, tell me what we should discuss first?`;
                            }
                            speakResponse(initialMsg);
                        }, 2000);
                        
                        // Handle native browser "Stop sharing" button
                        if (stream.getVideoTracks().length > 0) {
                            stream.getVideoTracks()[0].onended = endSession;
                        }
                    }
                } catch(err) {
                    console.error(err);
                    const statusEl = document.getElementById(`status_${sessionId}`);
                    if (statusEl) {
                        statusEl.innerHTML = `
                            <div style="color: #ef4444; font-size: 13px; text-align: center; display: flex; flex-direction: column; align-items: center;">
                                <i data-lucide="alert-triangle" style="margin-bottom: 8px; width: 24px; height: 24px;"></i>
                                Screen Share Cancelled
                            </div>
                        `;
                    }
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                }
            }, 1000);
        } else {
            setTimeout(() => {
              // Fallback
            }, 2000);
        }
    };
    window.handleRoleAction = function(btn) {
        const action = btn.innerText.trim();
        const textArea = document.getElementById('sprintSubmissionText');
        
        // 1. Create and show the Add Platform Link modal
        const linkModal = document.createElement("div");
        linkModal.innerHTML = `
          <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.6); z-index:99999; display:flex; align-items:center; justify-content:center; backdrop-filter:blur(4px);">
            <div style="background:#fff; padding:32px; border-radius:16px; width:400px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.1); animation: fadeIn 0.2s ease-out;">
              <h3 style="margin:0 0 8px; color:#0f172a; font-family:'Inter', sans-serif; font-size: 18px;">Connect ${action}</h3>
              <p style="margin:0 0 20px; color:#64748b; font-size:13px;">Paste the link to your workspace, document, or repository to sync it.</p>
              <input type="text" id="customLinkInput" placeholder="https://..." style="width:100%; padding:12px; border:1px solid #cbd5e1; border-radius:8px; margin-bottom:24px; font-family:inherit; font-size:14px; outline:none; box-sizing:border-box; transition:border-color 0.2s;" onfocus="this.style.borderColor='#4f46e5'" onblur="this.style.borderColor='#cbd5e1'" />
              <div style="display:flex; justify-content:flex-end; gap:12px;">
                <button id="cancelLinkBtn" style="padding:10px 16px; background:#f1f5f9; border:1px solid #cbd5e1; border-radius:8px; cursor:pointer; color:#475569; font-weight:600; font-size:14px; transition:background 0.2s;" onmouseover="this.style.background='#e2e8f0'" onmouseout="this.style.background='#f1f5f9'">Cancel</button>
                <button id="confirmLinkBtn" style="padding:10px 20px; background:linear-gradient(135deg, #4f46e5, #3730a3); border:none; border-radius:8px; cursor:pointer; color:#fff; font-weight:600; font-size:14px; transition:transform 0.2s, box-shadow 0.2s; box-shadow:0 4px 12px rgba(79,70,229,0.2);" onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 16px rgba(79,70,229,0.3)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(79,70,229,0.2)'">Sync Data</button>
              </div>
            </div>
          </div>
        `;
        document.body.appendChild(linkModal);
        
        // Focus the input automatically
        setTimeout(() => document.getElementById('customLinkInput').focus(), 50);

        document.getElementById('cancelLinkBtn').onclick = () => linkModal.remove();
        
        document.getElementById('confirmLinkBtn').onclick = () => {
            const linkVal = document.getElementById('customLinkInput').value.trim();
            if(!linkVal) {
                // Shake animation for empty input
                const inputEl = document.getElementById('customLinkInput');
                inputEl.style.transform = 'translateX(-5px)';
                setTimeout(() => inputEl.style.transform = 'translateX(5px)', 100);
                setTimeout(() => inputEl.style.transform = 'translateX(-5px)', 200);
                setTimeout(() => inputEl.style.transform = 'translateX(0)', 300);
                return;
            }
            
            linkModal.remove();
            
            // 2. Show the Syncing notification
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 24px;
                right: 24px;
                background: #ffffff;
                border-radius: 12px;
                padding: 16px 20px;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                border: 1px solid #e2e8f0;
                display: flex;
                align-items: center;
                gap: 12px;
                z-index: 9999;
                transform: translateX(120%);
                transition: transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            `;
            
            notification.innerHTML = `
                <div style="width: 40px; height: 40px; border-radius: 10px; background: #f0fdf4; color: #16a34a; display: flex; align-items: center; justify-content: center; font-size: 20px;">
                    <i data-lucide="check-circle" style="width: 24px; height: 24px;"></i>
                </div>
                <div>
                    <p style="margin: 0; font-weight: 700; color: #0f172a; font-size: 14px;">${action} Syncing...</p>
                    <p style="margin: 0; color: #64748b; font-size: 12px;">Tool data successfully linked to submission.</p>
                </div>
            `;
            
            document.body.appendChild(notification);
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            setTimeout(() => notification.style.transform = 'translateX(0)', 100);
            
            // 3. Add text to submission
            if(textArea) {
                const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const currentVal = textArea.value;
                const linkText = `\n[LINKED TOOL: ${action} @ ${timestamp}] - ${linkVal}\n`;
                if(!currentVal.includes(linkText)) {
                    textArea.value += linkText;
                    const charCountSpan = document.getElementById("charCountSpan");
                    if (charCountSpan) {
                        charCountSpan.textContent = textArea.value.length + " chars";
                    }
                }
            }
            
            // Remove notification after 4 seconds
            setTimeout(() => {
                notification.style.transform = 'translateX(120%)';
                setTimeout(() => notification.remove(), 500);
            }, 4000);
        };
    };


      window.sprintSubmissions = window.sprintSubmissions || [];
      window.simulationUser = window.simulationUser || { name: "", role: "" };
      window.activityLog = [];
      window.analyticsData = { scores: [], timestamps: [] };

      window.drawAnalyticsChart = () => {
        const chartContainer = document.getElementById('analyticsChartContainer');
        if (!chartContainer) return;
        const canvas = document.getElementById('analyticsChart');
        if(!canvas) return;
        const ctx = canvas.getContext('2d');
        const data = window.analyticsData.scores;
        const w = canvas.width, h = canvas.height;
        ctx.clearRect(0,0,w,h);
        const grd = ctx.createLinearGradient(0,0,0,h);
        grd.addColorStop(0, '#eff6ff');
        grd.addColorStop(1, '#bfdbfe');
        ctx.fillStyle = grd;
        ctx.fillRect(0,0,w,h);
        if (data.length < 2) return;
        const maxScore = Math.max(...data, 100);
        const minScore = Math.min(...data, 0);
        const stepX = w / (data.length-1);
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        data.forEach((v,i)=>{
          const x = i*stepX;
          const y = h - ((v-minScore)/(maxScore-minScore))*h;
          if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        });
        ctx.stroke();
        ctx.fillStyle = '#1d4ed8';
        data.forEach((v,i)=>{
          const x = i*stepX;
          const y = h - ((v-minScore)/(maxScore-minScore))*h;
          ctx.beginPath();
          ctx.arc(x,y,4,0,2*Math.PI);
          ctx.fill();
        });
      };

      const updateActivitySummary = () => {
        const list = document.getElementById('activityList');
        if (!list) return;
        list.innerHTML = '';
        window.activityLog.forEach(entry => {
          const card = document.createElement('div');
          card.style = 'background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:12px; margin-bottom:12px; font-size:14px;';
          card.innerHTML = `
            <div style="font-weight:700; color:#0f172a; margin-bottom:8px;">Day ${entry.day} – Company: ${entry.project}</div>
            <div style="color:#475569; margin-bottom:4px;"><strong>AI Prompt:</strong> ${entry.prompt}</div>
            <div style="color:#64748b; margin-bottom:4px;"><em>Your Submission:</em> ${entry.userSubmission.slice(0, 60)}...</div>
            <div style="color:#3b82f6; margin-bottom:4px;"><strong>Teammate:</strong> ${entry.teammateReply}</div>
            <div style="color:#86198f;"><strong>Manager (${entry.pressure}):</strong> ${entry.managerReply}</div>
            <div style="margin-top:6px;">${'⭐'.repeat(entry.starRating)}</div>
          `;
          list.appendChild(card);
        });
      };

      const logActivity = (day, prompt, project, userSubmission, teammateReply, managerReply, pressure, starRating) => {
        window.activityLog.push({ day, timestamp: Date.now(), prompt, project, userSubmission, teammateReply, managerReply, pressure, starRating });
        const overallScoreEl = document.querySelector('.score-value');
        if (overallScoreEl) {
          const currentScore = parseInt(overallScoreEl.textContent) || 0;
          const newScore = Math.max(40, Math.min(99, currentScore + (starRating - 3) * 5));
          overallScoreEl.textContent = newScore;
          window.analyticsData.scores.push(newScore);
          window.analyticsData.timestamps.push(Date.now());
          drawAnalyticsChart();
        }
      };

      const renderInteractiveDay = async () => {
        if (currentDayIndex === -1) {
          // Onboarding Screen
          modalContent.innerHTML = `
            <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;">
              <div style="background: #ffffff; border-radius: 24px; padding: 60px 48px; width: 100%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1); border: 1px solid #ffffff; display: flex; flex-direction: column; align-items: center; text-align: center; position: relative; overflow: hidden;">
                
                <!-- Decorative shapes -->
                <div style="position: absolute; top: -60px; right: -60px; width: 160px; height: 160px; background: #eff6ff; border-radius: 50%; z-index: 0;"></div>
                <div style="position: absolute; bottom: -40px; left: -40px; width: 120px; height: 120px; background: #f8fafc; border-radius: 50%; z-index: 0;"></div>
                
                <div style="position: relative; z-index: 1; width: 100%;">
                  <div style="width: 64px; height: 64px; background: #eff6ff; border-radius: 16px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; color: #3b82f6;">
                    ${logoSrc ? `<img src="${logoSrc}" style="max-width: 32px; max-height: 32px; object-fit: contain;">` : `<i data-lucide="rocket" style="width: 32px; height: 32px;"></i>`}
                  </div>
                  <h1 style="font-size: 32px; font-weight: 800; letter-spacing: -0.5px; margin: 0 0 12px; color: #0f172a;">Simulation Entry</h1>
                  <p style="color: #64748b; font-size: 15px; line-height: 1.6; margin-bottom: 32px;">Initialize your profile to begin the intensive product sprint. Your performance will be strictly monitored.</p>
                  
                  <div style="width: 100%; text-align: left; margin-bottom: 32px;">
                    <label style="display: block; font-size: 12px; letter-spacing: 1px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase;">Full Name</label>
                    <input type="text" id="simNameInput" value="${uName}" placeholder="e.g. Jane Doe" style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; font-size: 15px; outline: none; transition: border-color 0.2s; margin-bottom: 20px; box-sizing: border-box;">
                    
                    <label style="display: block; font-size: 12px; letter-spacing: 1px; font-weight: 700; color: #475569; margin-bottom: 8px; text-transform: uppercase;">Target Role</label>
                    <input type="text" id="simRoleInput" value="${targetRole}" placeholder="e.g. Senior Product Manager" style="width: 100%; padding: 14px 16px; border-radius: 12px; border: 1px solid #cbd5e1; background: #f8fafc; color: #0f172a; font-size: 15px; outline: none; transition: border-color 0.2s; box-sizing: border-box;">
                  </div>

                  <button id="simStartBtn" style="width: 100%; background: #2563eb; color: #ffffff; border: none; border-radius: 12px; padding: 16px; font-weight: 600; font-size: 16px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: background 0.2s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);">
                    Initiate Sequence <i data-lucide="arrow-right" style="width: 18px; height: 18px;"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
          if (typeof lucide !== 'undefined') lucide.createIcons();

          document.getElementById("simStartBtn").addEventListener("click", () => {
            const n = document.getElementById("simNameInput").value.trim() || "Participant";
            const r = document.getElementById("simRoleInput").value.trim() || "Candidate";
            window.simulationUser = { name: n, role: r };
            currentDayIndex++;
            renderInteractiveDay();
          });
          return;
        }

        if (currentDayIndex >= sprintData.length) {
          // Analysis Loader
          modalContent.innerHTML = `
            <div style="background: #ffffff; color: #0f172a; padding: 60px 40px; text-align: center; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center;">
              <i data-lucide="loader-2" class="icon-lg pulse" style="color: #3b82f6; margin-bottom: 24px; width: 48px; height: 48px;"></i>
              <h2 style="margin: 0 0 12px; font-size: 24px; font-weight: 600;">Analyzing Final Performance...</h2>
              <p id="analysisStatusText" style="color: #64748b; font-size: 15px;">Evaluating your strategic reasoning and deliverables.</p>
            </div>
          `;
          if (typeof lucide !== 'undefined') lucide.createIcons();

          // Final Review
          let passed = true;
          let finalVerdict = "Excellent work. You handled the challenges well and delivered on all metrics.";
          let missingSkills = [];
          let starRating = 5;
          
          try {
            const res = await fetch("http://localhost:5000/api/chat", {
              method: "POST", 
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                response_format: { type: "json_object" },
                messages: [
                  { role: "system", content: "You are a strict AI manager. Evaluate the user's simulation submissions. Return JSON: { \"passed\": boolean, \"verdict\": \"Professional and thorough 2-3 sentence verdict explaining the reasoning.\", \"missingSkills\": [\"skill1\", \"skill2\", \"skill3\", \"skill4\", \"skill5\"], \"stars\": number_between_1_and_5 }. ALWAYS provide at least 4-5 specific, professional missing skills." },
                  { role: "user", content: "My submissions across 5 days: " + window.sprintSubmissions.join(" | ") }
                ]
              })
            });
            const data = await res.json();
            if (data.choices && data.choices.length > 0) {
              const parsed = JSON.parse(data.choices[0].message.content);
              if (parsed.passed !== undefined) passed = parsed.passed;
              if (parsed.verdict) finalVerdict = parsed.verdict;
              if (parsed.missingSkills) missingSkills = parsed.missingSkills;
              if (parsed.stars !== undefined) starRating = parsed.stars;
            }
          } catch(e) { console.error(e); }

          const statusText = document.getElementById("analysisStatusText");
          if(statusText) statusText.innerHTML = `<strong style="color: ${passed ? 'var(--green)' : 'var(--red)'};">Manager Verdict:</strong> ${finalVerdict}`;

          setTimeout(() => {
            renderCertificate(passed, finalVerdict, missingSkills, starRating);
          }, 3500);
          return;
        }

        const data = sprintData[currentDayIndex];
        const nextDayLabel = currentDayIndex < 4 ? `Submit & advance to Day ${currentDayIndex + 2}` : "Submit & Complete Simulation";

        const topbarDayBadge = document.getElementById("topbarDayBadge");
        if(topbarDayBadge) topbarDayBadge.innerText = `Phase ${currentDayIndex + 1} of 5`;
        const topbarRoleBadge = document.getElementById("topbarRoleBadge");
        if(topbarRoleBadge) topbarRoleBadge.innerText = `${window.simulationUser.role || 'Enterprise'} Simulation`;

        modalContent.innerHTML = `
          <div style="background: #f8fafc; color: #0f172a; text-align: left; font-family: 'Inter', sans-serif; display: flex; flex-direction: row; height: 100vh; overflow: hidden;">
            
            <!-- Main Left Column -->
            <div class="sprint-main-column" style="flex: 1; display: flex; flex-direction: column; overflow-y: auto; background: #ffffff;">
              <!-- Top / Task Brief Section -->
              <div class="sprint-header-pane" style="padding: 32px 48px; border-bottom: 1px solid rgba(79, 70, 229, 0.1); background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); flex-shrink: 0; position: relative; z-index: 10; display: flex; flex-direction: column; width: 100%; box-sizing: border-box;">
              <p style="color: var(--blue); font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px;"><i data-lucide="target" style="width: 16px; height: 16px;"></i> ${data.header}</p>
              <div style="display:flex; align-items:center; gap:20px; margin: 0 0 20px;">${logoSrc ? `<div style="width: 56px; height: 56px; display: flex; align-items: center; justify-content: center; background: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.04); border: 1px solid #e2e8f0; flex-shrink: 0;"><img src="${logoSrc}" style="max-height:36px; max-width:36px; object-fit:contain;"></div>` : ""}<h1 style="font-size: 32px; font-weight: 800; letter-spacing: -0.5px; color: #0f172a; line-height: 1.1; margin:0; padding-top: 4px;">${data.title}</h1></div>
              <div class="task-desc-container" style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0; width: 100%; display: flex; flex-direction: column; gap: 8px;">${data.desc}</div>
            </div>

              <!-- Left side: Submission Area -->
              <div class="sprint-left-pane" style="padding: 32px 48px; flex: 1; display: flex; flex-direction: column;">
                <p style="color: #64748b; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; font-weight: 700;">YOUR SUBMISSION</p>
                  <textarea id="sprintSubmissionText" placeholder="${uiPlaceholder}" style="height: 280px; width: 100%; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; color: #0f172a; padding: 24px; font-family: inherit; font-size: 15px; resize: vertical; outline: none; margin-bottom: 24px; box-shadow: 0 2px 12px rgba(15, 23, 42, 0.03); transition: border-color 0.3s ease;"></textarea>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="display: flex; gap: 10px; flex-wrap: wrap; align-items: center; width: 100%; margin-bottom: 8px;">
                    ${uiButtons}
                  </div>
                </div>

                <div style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; margin-top: 16px; padding-top: 20px; border-top: 1px dashed #cbd5e1;">
                  <span id="charCountSpan" style="color: #64748b; font-size: 13px; font-family: monospace;">0 chars</span>
                  <div style="display: flex; gap: 12px; align-items: center;">
                    <button id="sprintProceedBtn" style="display: none; background: #ffffff; color: #4f46e5; border: 2px solid #4f46e5; border-radius: 8px; padding: 12px 24px; font-weight: 600; font-size: 15px; cursor: pointer; transition: all 0.3s ease;">
                      Proceed Immediately
                    </button>
                    <button id="sprintSubmitBtn" style="background: linear-gradient(135deg, #4f46e5, #3730a3); color: #ffffff; border: none; border-radius: 8px; padding: 14px 28px; font-weight: 600; font-size: 15px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 12px 24px rgba(79, 70, 229, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 20px rgba(79, 70, 229, 0.3)'">
                      ${nextDayLabel} <i data-lucide="send" style="width: 18px; height: 18px;"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div> <!-- End sprint-main-column -->

            <!-- Right side: Teammate Feed -->
            <div class="sprint-right-pane" style="display: flex; flex-direction: column; position: relative;"><div id="teamFeedContainer" style="flex: 1; overflow-y: auto; padding-right: 8px; margin-bottom: 16px;">
                <p style="color: #64748b; font-size: 12px; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px; font-weight: 700;">TEAMMATES & COLLABORATION</p>
                
                <div class="collab-bar" style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px; background: #f8fafc; padding: 16px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(15,23,42,0.02);">
                  <button style="width: 100%; padding: 10px 8px; font-size: 13px; font-weight: 600; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; color: #0f172a; transition: all 0.2s; box-shadow: 0 1px 2px rgba(0,0,0,0.02);" onmouseover="this.style.background='#f1f5f9'; this.style.borderColor='#94a3b8'" onmouseout="this.style.background='#fff'; this.style.borderColor='#cbd5e1'" onclick="window.initiateCollab('Meet')">🎥 Live Meet</button>
                  <button id="askAiManagerBtn" style="width: 100%; margin-top: 4px; padding: 12px 16px; font-size: 14px; font-weight: 700; border-radius: 10px; border: none; background: linear-gradient(135deg, #4f46e5, #3730a3); color: #fff; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 8px 20px rgba(79, 70, 229, 0.35)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(79, 70, 229, 0.2)'">🤖 Ask AI Manager</button>
                </div>
                
                <div class="team-msg-card" style="display: flex; gap: 16px; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(15,23,42,0.03); cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);" onmouseover="this.style.transform='translateY(-4px) scale(1.01)'; this.style.boxShadow='0 16px 32px -8px rgba(79, 70, 229, 0.2)'; this.style.borderColor='rgba(79, 70, 229, 0.4)'; this.style.background='#f4f6ff';" onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 12px rgba(15,23,42,0.03)'; this.style.borderColor='#e2e8f0'; this.style.background='#ffffff';">
                  <img src="${data.teammateAvatar}" alt="Avatar" style="width: 48px; height: 48px; border-radius: 50%; border: 1px solid rgba(79, 70, 229, 0.2); background: linear-gradient(135deg, #f8fafc, #f1f5f9); flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05); transition: transform 0.3s ease;" onmouseover="this.style.transform='rotate(5deg) scale(1.1)'" onmouseout="this.style.transform='rotate(0) scale(1)'">
                  <div>
                    <div style="margin-bottom: 8px;">
                      <span style="font-weight: 700; font-size: 15px; color: #0f172a; margin-right: 8px;">${data.teammateName}</span>
                      <span style="font-size: 12px; color: #64748b; letter-spacing: 1px; font-weight: 600;">${data.teammateRole}</span>
                    </div>
                    <div style="color: #334155; font-size: 15px; line-height: 1.6;">
                      ${data.teammateMsg}
                    </div>
                  </div>
                </div>
              </div>
              <div class="chat-input-wrapper" style="margin-top: auto; position: relative; z-index: 10;">
                <input type="text" id="feedChatInput" placeholder="Message team..." style="width: 100%; padding: 14px 20px; padding-right: 50px; border: 1px solid #cbd5e1; border-radius: 24px; font-size: 14px; outline: none; transition: border-color 0.2s; box-sizing: border-box; box-shadow: 0 4px 12px rgba(0,0,0,0.03);" onfocus="this.style.borderColor='#4f46e5'" onblur="this.style.borderColor='#cbd5e1'">
                <button id="feedChatBtn" style="position: absolute; right: 8px; top: 8px; background: #4f46e5; color: #fff; border: none; border-radius: 50%; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                  <i data-lucide="send" style="width: 14px; height: 14px;"></i>
                </button>
              </div>
            </div>
            </div>

          </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        
        // --- ADDED TEAM CHAT LOGIC ---
        const chatBtn = document.getElementById("feedChatBtn");
        const chatInput = document.getElementById("feedChatInput");
        if(chatBtn && chatInput) {
            const sendMsg = async () => {
                const msg = chatInput.value.trim();
                if(!msg) return;
                
                chatInput.value = "";
                const feed = document.getElementById("teamFeedContainer");
                
                // Add user message
                feed.innerHTML += `
                  <div class="team-msg-card" style="display: flex; gap: 16px; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin-top: 16px; animation: fadeIn 0.3s ease;">
                    <div style="width: 48px; height: 48px; border-radius: 50%; background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: bold; flex-shrink: 0; box-shadow: 0 2px 8px rgba(37,99,235,0.3);">You</div>
                    <div style="flex: 1;">
                      <div style="margin-bottom: 8px;">
                        <span style="font-weight: 700; font-size: 15px; color: #0f172a; margin-right: 8px;">You</span>
                      </div>
                      <div style="color: #334155; font-size: 14px; line-height: 1.6;">
                        ${msg}
                      </div>
                    </div>
                  </div>
                `;
                feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
                if (typeof lucide !== 'undefined') lucide.createIcons();

                // Call the API
                try {
                    const currentProj = localStorage.getItem("currentProjectTitle") || "Software Project";
                    const currentRole = localStorage.getItem("currentProjectRole") || "Candidate";
                    const textAreaEl = document.getElementById('sprintSubmissionText');
                    const currentDraft = textAreaEl ? textAreaEl.value.trim() : "";
                    const draftContext = currentDraft ? ` The user's current draft submission is: "${currentDraft}".` : "";
                    const sysPrompt = `You are Nova, an AI Manager on the ${currentProj} project. The user is a ${currentRole} doing a simulation.${draftContext} Give a helpful, concise answer in 1-3 sentences. Keep it highly professional and relevant to software development. Answer their question directly. If their draft submission is gibberish or poor quality and they ask for a review, point it out strictly. Do not use asterisks or formatting.`;
                    
                    const response = await fetch("http://localhost:5000/api/chat", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                            model: "llama-3.1-8b-instant",
                            response_format: { type: "json_object" },
                            messages: [
                                { role: "system", content: sysPrompt + ' Return JSON like: { "reply": "your answer" }' },
                                { role: "user", content: msg }
                            ]
                        })
                    });
                    const data = await response.json();
                    let aiReply = "I am analyzing the request and will follow up shortly.";
                    
                    if (data.choices && data.choices.length > 0) {
                        try {
                            const parsed = JSON.parse(data.choices[0].message.content);
                            if (parsed.reply) aiReply = parsed.reply;
                        } catch(err) {
                            aiReply = data.choices[0].message.content; // fallback if not json
                        }
                    } else if (data.response) {
                        aiReply = data.response;
                    }
                    
                    // remove "AI Teammate: " if it prepends it
                    aiReply = aiReply.replace(/^AI Teammate:\s*/i, '').replace(/^Nova:\s*/i, '');
                    
                    feed.innerHTML += `
                      <div class="team-msg-card" style="display: flex; gap: 16px; padding: 20px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 12px rgba(15,23,42,0.03); margin-top: 16px; animation: fadeIn 0.3s ease;">
                        <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Nova&colors=1e40af" alt="Avatar" style="width: 48px; height: 48px; border-radius: 50%; border: 1px solid rgba(79, 70, 229, 0.2); background: linear-gradient(135deg, #f8fafc, #f1f5f9); flex-shrink: 0; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <div>
                          <div style="margin-bottom: 8px;">
                            <span style="font-weight: 700; font-size: 15px; color: #0f172a; margin-right: 8px;">Nova</span>
                            <span style="font-size: 12px; color: #64748b; letter-spacing: 1px; font-weight: 600;">AI MANAGER</span>
                          </div>
                          <div style="color: #334155; font-size: 15px; line-height: 1.6;">
                            ${aiReply}
                          </div>
                        </div>
                      </div>
                    `;
                    feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
                    if (typeof lucide !== 'undefined') lucide.createIcons();
                    
                    // also use text-to-speech so it feels real!
                    if ('speechSynthesis' in window) {
                        const utterance = new SpeechSynthesisUtterance(aiReply);
                        utterance.rate = 1.05;
                        utterance.pitch = 1.0;
                        window.speechSynthesis.speak(utterance);
                    }
                } catch(e) {
                    console.error("Chat error", e);
                }
            };
            
            chatBtn.addEventListener("click", sendMsg);
            chatInput.addEventListener("keypress", (e) => {
                if(e.key === "Enter") sendMsg();
            });
        }
        
            const askBtn = document.getElementById('askAiManagerBtn');
            if(askBtn) {
                askBtn.addEventListener('click', () => {
                    if(chatInput) {
                        chatInput.focus();
                        chatInput.value = "Review my current progress and give me feedback.";
                        sendMsg();
                    }
                });
            }
        // --- END TEAM CHAT LOGIC ---

        const textArea = document.getElementById("sprintSubmissionText");
        const charCountSpan = document.getElementById("charCountSpan");
        textArea.addEventListener("input", () => {
          charCountSpan.textContent = textArea.value.length + " chars";
        });

        // Setup real file uploader for all upload buttons
        document.querySelectorAll(".sim-upload-btn").forEach(upBtn => {
          upBtn.addEventListener("click", () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.onchange = (e) => {
              if (e.target.files.length > 0) {
                textArea.value += `\n[Uploaded File: ${e.target.files[0].name}]`;
                charCountSpan.textContent = textArea.value.length + " chars";
              }
            };
            fileInput.click();
          });
        });

        const askAiBtn = document.getElementById("askAiManagerBtn");
        if(askAiBtn) {
          askAiBtn.addEventListener("click", () => {
            const feed = document.getElementById("teamFeedContainer");
            if(!feed) return;
            
            askAiBtn.innerHTML = `<i data-lucide="loader-2" class="icon-sm pulse"></i> Asking...`;
            if (typeof lucide !== 'undefined') lucide.createIcons();
            
            setTimeout(() => {
              askAiBtn.innerHTML = `🤖 Ask AI Manager`;
              feed.innerHTML += `
              <div class="team-msg-card" style="display: flex; gap: 16px; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 4px 6px rgba(15,23,42,0.02); margin-top: 16px; animation: fadeIn 0.5s ease; cursor: pointer;">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Nova" alt="Nova" style="width: 48px; height: 48px; border-radius: 50%; border: 1px solid #cbd5e1; background: #ffffff; flex-shrink: 0;">
                <div style="flex: 1;">
                  <div style="margin-bottom: 8px;">
                    <span style="font-weight: 700; font-size: 15px; color: #0f172a; margin-right: 8px;">Nova</span>
                    <span style="font-size: 12px; color: #64748b; letter-spacing: 1px; text-transform: uppercase;">AI MANAGER</span>
                  </div>
                  <div style="color: #334155; font-size: 14px; line-height: 1.6;">
                    <strong>Live Review:</strong> I reviewed your progress so far. Consider focusing on the ${roleType === 'PM' ? 'risk analysis and PWA tradeoffs' : roleType === 'Designer' ? 'mobile offline UX flows' : 'database indexing and API latency'} because our engineering bandwidth is limited.
                  </div>
                </div>
              </div>
              `;
              feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
            }, 1500);
          });
        }
        
        // Setup custom link modal for all link buttons removed to use handleRoleAction

        document.getElementById("sprintSubmitBtn").addEventListener("click", async () => {
          const val = textArea.value.trim();
          if(val.length < 5) {
             alert("Please provide a submission, upload code, or paste a link.");
             return;
          }
          // Store by index so resubmissions overwrite instead of pushing duplicates
          window.sprintSubmissions[currentDayIndex] = val;

          const btn = document.getElementById("sprintSubmitBtn");
          btn.innerHTML = `<i data-lucide="loader-2" class="icon-sm pulse"></i> Reviewing...`;
          if (typeof lucide !== 'undefined') lucide.createIcons();
          btn.disabled = true;

          const currentPressure = document.body.className.includes("pressure-high") ? "High" : document.body.className.includes("pressure-low") ? "Low" : "Medium";
          
          // Helper to check if a submission is obvious gibberish or keyboard smash
          const isGibberish = (text) => {
              const cleanText = text.trim();
              if (cleanText.length < 5) return true;
              
              // No spaces and long string -> definitely keyboard smash
              if (!cleanText.includes(" ") && cleanText.length > 15) return true;
              
              // Contains word segments that are too long without being paths or URLs
              const words = cleanText.split(/\s+/);
              for (let word of words) {
                  if (word.length > 22 && !word.startsWith("http") && !word.startsWith("/") && !word.includes("\\")) {
                      return true;
                  }
              }
              
              // Low ratio of vowels to consonants in alphanumeric text
              const vowels = (cleanText.match(/[aeiouyAEIOUY]/g) || []).length;
              const letters = (cleanText.match(/[a-zA-Z]/g) || []).length;
              if (letters > 10 && vowels / letters < 0.15) {
                  return true;
              }
              
              return false;
          };

          let aiReview;

          if (isGibberish(val)) {
              // Direct client-side rejection with 0.0/10 score to prevent API clutter / JSON failure
              aiReview = {
                  score: "0.0/10",
                  decision: "Needs Improvement",
                  strengths: ["Submission registered"],
                  weaknesses: ["Submission appears to be gibberish or a keyboard smash", "Does not contain any coherent plan or structural information"],
                  manager_feedback: "Your submission appears to be gibberish and does not contain any useful information for evaluation. Please resubmit a coherent, well-formatted document or explanation directly addressing the task."
              };
          } else {
              // Strict fallback score in case of parser/API failure
              aiReview = {
                  score: "1.0/10",
                  decision: "Needs Improvement",
                  strengths: ["Submission logged"],
                  weaknesses: ["Could not parse AI response", "Technical evaluation failed"],
                  manager_feedback: "I am unable to provide a full review at this time. Please check your connection or resubmit."
              };
              
              try {
                  const controller = new AbortController();
                  const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s for full review
                  const res = await fetch("http://localhost:5000/api/chat", {
                    method: "POST", 
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
                    body: JSON.stringify({
                      model: "llama-3.1-8b-instant",
                      response_format: { type: "json_object" },
                      messages: [
                        { 
                            role: "system", 
                            content: `You are evaluating a tech simulation for the ${localStorage.getItem("currentProjectTitle") || "Software Project"}. The user is acting as a ${localStorage.getItem("currentProjectRole") || "Candidate"}. Act as Nova, the strict AI Manager. Current pressure: ${currentPressure}. Review their latest submission including any linked tools. CRITICAL: If the submission is short, wrong, poor quality, or gibberish, you MUST be extremely strict and give a very low score (0.0/10 to 2.0/10), decision "Needs Improvement", and document it. Return ONLY JSON: { "score": "X/10", "decision": "Approved" or "Needs Improvement", "strengths": ["point 1", "point 2"], "weaknesses": ["point 1", "point 2"], "manager_feedback": "2-3 sentences of strict professional feedback" }` 
                        },
                        { role: "user", content: "Review my submission: " + val }
                      ]
                    })
                  });
                  const rd = await res.json();
                  if (rd.choices && rd.choices.length > 0) {
                     let contentStr = rd.choices[0].message.content;
                     const startIdx = contentStr.indexOf('{');
                     const endIdx = contentStr.lastIndexOf('}');
                     if (startIdx !== -1 && endIdx !== -1) {
                         contentStr = contentStr.substring(startIdx, endIdx + 1);
                     }
                     try {
                         aiReview = JSON.parse(contentStr);
                     } catch(err) {
                         console.error("JSON parse failed on AI response:", contentStr);
                         aiReview.manager_feedback = "Parse Error. Raw Output: " + contentStr.substring(0, 50) + "...";
                     }
                  } else if (rd.error) {
                     console.error("API Error:", rd.error);
                     aiReview.manager_feedback = "API Error: " + (rd.error.message || JSON.stringify(rd.error));
                  }
                  clearTimeout(timeoutId);
              } catch(e) {
                  console.error("Sprint review error:", e);
                  aiReview.manager_feedback = "Network error or timeout. Please check your connection.";
              }
          }

          if (typeof logActivity === 'function') {
            logActivity(currentDayIndex + 1, window.currentDayPrompt || data.desc, data.title, val, aiReview.manager_feedback, aiReview.score, currentPressure, 3);
            updateActivitySummary();
          }

          
          // INJECT REVIEW INTO SIDEBAR FEED
          const feed = document.getElementById("teamFeedContainer");
          if(feed) {
             const isApproved = aiReview.decision && aiReview.decision.toLowerCase().includes("approve");
             const badgeColor = isApproved ? "#166534" : "#9f1239";
             const badgeBg = isApproved ? "#f0fdf4" : "#fff1f2";
             const badgeBorder = isApproved ? "#bbf7d0" : "#fecdd3";
             const decisionText = isApproved ? "Approved ✅" : "Needs Improvement ⚠️";
             
             let strengthsHtml = "";
             if(aiReview.strengths && Array.isArray(aiReview.strengths)) {
                 aiReview.strengths.forEach(s => strengthsHtml += `<li style="margin-bottom:4px;">${s}</li>`);
             }
             let weaknessesHtml = "";
             if(aiReview.weaknesses && Array.isArray(aiReview.weaknesses)) {
                 aiReview.weaknesses.forEach(w => weaknessesHtml += `<li style="margin-bottom:4px;">${w}</li>`);
             }

             // We will append a premium card directly into the feed
             const reviewCardHtml = `
              <div class="team-msg-card" style="display: flex; flex-direction: column; gap: 12px; padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: 0 8px 16px rgba(15,23,42,0.04); margin-top: 16px; animation: fadeIn 0.4s ease;">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                  <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Nova" alt="Nova" style="width: 40px; height: 40px; border-radius: 50%; border: 1px solid #cbd5e1; background: #ffffff;">
                    <div>
                      <div style="font-weight: 700; font-size: 14px; color: #0f172a;">Nova</div>
                      <div style="font-size: 11px; color: #64748b; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">AI Manager</div>
                    </div>
                  </div>
                  <div style="background: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeBorder}; padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 13px;">
                    ${aiReview.score || "N/A"}
                  </div>
                </div>
                
                <div style="font-weight: 700; font-size: 15px; color: ${badgeColor}; margin-top: 8px;">
                  ${decisionText}
                </div>
                
                <div style="color: #334155; font-size: 14px; line-height: 1.6; margin-bottom: 8px;">
                  ${aiReview.manager_feedback || "Review completed."}
                </div>
                
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 8px;">
                  <strong style="font-size: 13px; color: #166534; display: block; margin-bottom: 6px;">Strengths</strong>
                  <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #475569;">${strengthsHtml || "<li>None</li>"}</ul>
                </div>
                
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
                  <strong style="font-size: 13px; color: #9f1239; display: block; margin-bottom: 6px;">Needs Improvement</strong>
                  <ul style="margin: 0; padding-left: 18px; font-size: 13px; color: #475569;">${weaknessesHtml || "<li>None</li>"}</ul>
                </div>
                
                <div id="dynamicReviewActions" style="display: flex; flex-direction: column; gap: 8px;">
                  <!-- Actions will be bound here -->
                </div>
              </div>
             `;
             
             // Create a temporary container to convert string to DOM elements so we can attach events
             const tempDiv = document.createElement("div");
             tempDiv.innerHTML = reviewCardHtml;
             const cardEl = tempDiv.firstElementChild;
             
             const actionsContainer = cardEl.querySelector("#dynamicReviewActions");
             
             const advanceDay = () => {
                actionsContainer.innerHTML = `<span style="font-size: 13px; color: #64748b; font-style: italic;">Proceeded to next phase.</span>`;
                btn.innerHTML = `Advance (${30}s) or Update <i data-lucide="refresh-cw" style="width: 18px; height: 18px;"></i>`;
                btn.disabled = false;
                currentDayIndex++;
                renderInteractiveDay();
             };
             
             const improveSubmission = () => {
                actionsContainer.innerHTML = `<span style="font-size: 13px; color: #64748b; font-style: italic;">Awaiting resubmission...</span>`;
                btn.innerHTML = `Resubmit Work <i data-lucide="refresh-cw" style="width:16px; height:16px;"></i>`;
                if (typeof lucide !== 'undefined') lucide.createIcons();
                btn.disabled = false;
             };

             if(isApproved) {
                const proceedBtn = document.createElement("button");
                proceedBtn.style.cssText = "background: linear-gradient(135deg, #4f46e5, #3730a3); color: #ffffff; border: none; border-radius: 8px; padding: 10px; font-weight: 600; font-size: 13px; cursor: pointer; width: 100%; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.2);";
                proceedBtn.innerHTML = `Proceed to Day ${currentDayIndex + 2}`;
                proceedBtn.onclick = advanceDay;
                actionsContainer.appendChild(proceedBtn);
             } else {
                const improveBtn = document.createElement("button");
                improveBtn.style.cssText = "background: #ffffff; color: #0f172a; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; font-weight: 600; font-size: 13px; cursor: pointer; width: 100%; margin-bottom: 4px;";
                improveBtn.innerHTML = `Improve Submission`;
                improveBtn.onclick = improveSubmission;
                
                const proceedAnywayBtn = document.createElement("button");
                proceedAnywayBtn.style.cssText = "background: transparent; color: #64748b; border: none; font-size: 13px; cursor: pointer; width: 100%; text-decoration: underline;";
                proceedAnywayBtn.innerHTML = `Proceed Anyway`;
                proceedAnywayBtn.onclick = advanceDay;
                
                actionsContainer.appendChild(improveBtn);
                actionsContainer.appendChild(proceedAnywayBtn);
             }
             
             feed.appendChild(cardEl);
             feed.scrollTo({ top: feed.scrollHeight, behavior: 'smooth' });
             if (typeof lucide !== 'undefined') lucide.createIcons();
          }
        });
      };
      // Start the interactive sprint
      renderInteractiveDay();

      const renderCertificate = (passed = true, finalVerdict = "", missingSkills = [], starRating = 5) => {
        const uName = window.simulationUser ? window.simulationUser.name : "Participant";
        const uRole = window.simulationUser ? window.simulationUser.role : "Candidate";
        
        let starsHtml = '';
        for(let i=1; i<=5; i++) {
           if(i <= starRating) {
             starsHtml += `<i data-lucide="star" style="width: 28px; height: 28px; fill: #fbbf24; color: #fbbf24;"></i>`;
           } else {
             starsHtml += `<i data-lucide="star" style="width: 28px; height: 28px; color: #cbd5e1;"></i>`;
           }
        }
        if (passed) {
          modalContent.innerHTML = `
            <div class="cert-wrapper">
              <div class="cert-card">
                
                <div class="cert-header">
                  <div style="position: absolute; top: -50px; right: -50px; width: 200px; height: 200px; background: rgba(255,255,255,0.05); border-radius: 50%;"></div>
                  <div style="width: 80px; height: 80px; background: #fffbeb; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 0 0 8px rgba(251, 191, 36, 0.2);">
                    <i data-lucide="award" style="width: 40px; height: 40px; color: #d97706;"></i>
                  </div>
                  <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">Certificate of Excellence</h1>
                  <p style="margin: 0; font-size: 16px; color: #cbd5e1; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 600;">Simulation Successfully Completed</p>
                </div>
                
                <div style="text-align: center; margin-bottom: 40px;">
                  <h2 style="color: #0f172a; font-size: 32px; margin: 0 0 8px; font-weight: 800;">${uName}</h2>
                  <p style="color: #475569; font-size: 18px; margin: 0;">Completed as: <strong>${uRole}</strong></p>
                </div>
                
                <div style="display: flex; gap: 24px; margin-bottom: 40px; flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 200px; background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
                    <p style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0 0 12px;"><i data-lucide="briefcase" style="width: 14px; height: 14px; display: inline-block; vertical-align: middle;"></i> Target Company</p>
                    <p style="margin: 0; color: #0f172a; font-size: 18px; font-weight: 700;">${title}</p>
                  </div>
                  <div style="flex: 1; min-width: 200px; background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; text-align: center;">
                    <p style="font-size: 13px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 700; margin: 0 0 12px;">Final Rating</p>
                    <div style="display: flex; justify-content: center; gap: 4px;">
                      ${starsHtml}
                    </div>
                  </div>
                </div>

                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; margin-bottom: 40px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                      <img src="https://api.dicebear.com/7.x/bottts/svg?seed=Nova" alt="Nova" width="48" height="48" style="border-radius:50%; background: #f8fafc; border: 1px solid #cbd5e1;">
                      <div>
                        <p style="font-weight: 700; font-size: 16px; margin: 0; color: #0f172a;">Nova</p>
                        <p style="color: #64748b; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">AI Manager</p>
                      </div>
                    </div>
                    <div style="width: 60px; height: 60px; border-radius: 50%; border: 3px dashed #fbbf24; display: flex; align-items: center; justify-content: center; background: #fffbeb;">
                      <span style="color: #b45309; font-weight: 800; font-size: 12px; text-align: center; line-height: 1;">TOP<br>5%</span>
                    </div>
                  </div>
                  <p style="color: #334155; font-size: 16px; line-height: 1.6; margin: 0; font-style: italic;">"${finalVerdict}"</p>
                </div>

                <div style="margin-bottom: 40px;">
                  <p style="font-size: 14px; color: #0f172a; font-weight: 700; margin: 0 0 16px; text-transform: uppercase; letter-spacing: 1px;">Live Performance Analytics</p>
                  <div id="analyticsChartContainer" style="width: 100%; height: 180px; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; display: flex; align-items: center; justify-content: center;">
                    <canvas id="analyticsChart" width="700" height="180"></canvas>
                  </div>
                </div>
                
                <div style="display: flex; gap: 16px; width: 100%; flex-wrap: wrap;">
                  <button id="downloadReportBtn" style="flex: 1; padding: 16px; font-size: 16px; border-radius: 12px; border: 2px solid #e2e8f0; background: #ffffff; color: #475569; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; gap: 8px;" onmouseover="this.style.borderColor='var(--blue)'; this.style.color='var(--blue)';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#475569';">
                    <i data-lucide="download-cloud" style="width: 20px; height: 20px;"></i> Save as PDF
                  </button>
                  <button id="viewSkillRecordBtn" style="flex: 2; padding: 16px; font-size: 16px; border-radius: 12px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: #ffffff; font-weight: 600; border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); display: flex; align-items: center; justify-content: center; gap: 8px;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='translateY(0)';">
                    Return to Dashboard <i data-lucide="arrow-right" style="width: 20px; height: 20px;"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        } else {
          modalContent.innerHTML = `
            <div class="cert-wrapper">
              <div class="cert-card">
                
                <div class="cert-fail-header">
                  <div style="width: 80px; height: 80px; background: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; box-shadow: 0 0 0 8px rgba(220, 38, 38, 0.1);">
                    <i data-lucide="alert-triangle" style="width: 40px; height: 40px; color: #dc2626;"></i>
                  </div>
                  <h1 style="margin: 0 0 8px; font-size: 32px; font-weight: 800; letter-spacing: -0.5px; color: #991b1b;">Performance Report</h1>
                  <p style="margin: 0; font-size: 16px; color: #dc2626; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700;">Simulation Failed</p>
                </div>

                <div style="text-align: center; margin-bottom: 40px;">
                  <h2 style="color: #0f172a; font-size: 32px; margin: 0 0 8px; font-weight: 800;">${uName}</h2>
                  <p style="color: #475569; font-size: 18px; margin: 0;">Target Company: <strong>${title}</strong></p>
                </div>
                
                <div style="display: flex; justify-content: center; gap: 8px; margin-bottom: 32px; padding: 16px; background: #f8fafc; border-radius: 12px;">
                  ${starsHtml}
                </div>

                <div style="background: #fff5f5; border: 1px solid #fecaca; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                  <p style="color: #991b1b; font-size: 16px; line-height: 1.6; margin: 0; font-weight: 500;"><strong>Manager Feedback:</strong> "${finalVerdict}"</p>
                </div>
                
                <div style="background: #f8fafc; padding: 24px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 40px;">
                  <p style="font-weight: 700; color: #0f172a; margin-bottom: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;"><i data-lucide="target" style="width: 16px; height: 16px; margin-right: 8px; display: inline-block; vertical-align: middle;"></i> Identified Skill Gaps</p>
                  <ul style="color: #dc2626; margin: 0; padding-left: 20px; font-size: 15px; font-weight: 500; line-height: 1.8;">
                    ${missingSkills.length > 0 ? missingSkills.map(s => `<li>${s}</li>`).join('') : `<li>Poor problem solving</li><li>Code quality issues</li>`}
                  </ul>
                </div>

                <div style="display: flex; gap: 16px; width: 100%; flex-wrap: wrap;">
                  <button id="downloadReportBtn" style="flex: 1; padding: 16px; font-size: 16px; border-radius: 12px; border: 2px solid #fecaca; background: #ffffff; color: #b91c1c; font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); display: flex; align-items: center; justify-content: center; gap: 8px;" onmouseover="this.style.background='#fef2f2';" onmouseout="this.style.background='#ffffff';">
                    <i data-lucide="download-cloud" style="width: 20px; height: 20px;"></i> Download Report
                  </button>
                  <button id="viewSkillRecordBtn" style="flex: 2; padding: 16px; font-size: 16px; border-radius: 12px; background: #0f172a; color: #ffffff; font-weight: 600; border: none; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 12px rgba(15,23,42,0.1); display: flex; align-items: center; justify-content: center; gap: 8px;" onmouseover="this.style.transform='translateY(-2px)';" onmouseout="this.style.transform='translateY(0)';">
                    Return to Dashboard <i data-lucide="arrow-right" style="width: 20px; height: 20px;"></i>
                  </button>
                </div>
              </div>
            </div>
          `;
        }

        
        // Add Download Report Logic
        const dlBtn = document.getElementById("downloadReportBtn");
        if(dlBtn) {
          dlBtn.addEventListener("click", () => {
             // Change styling temporarily for printing
             const modal = modalContent.querySelector("div > div");
             const oldBoxShadow = modal.style.boxShadow;
             modal.style.boxShadow = "none";
             modal.style.border = "none";
             dlBtn.style.display = "none";
             document.getElementById("viewSkillRecordBtn").style.display = "none";
             
             window.print();
             
             // Restore
             modal.style.boxShadow = oldBoxShadow;
             if(!passed) modal.style.border = "1px solid rgba(220, 38, 38, 0.15)";
             else modal.style.border = "1px solid rgba(79, 70, 229, 0.15)";
             dlBtn.style.display = "flex";
             document.getElementById("viewSkillRecordBtn").style.display = "flex";
          });
        }

        document.getElementById("viewSkillRecordBtn").addEventListener("click", () => {
          overlay.remove();
          
          // Populate the Main Dashboard Skill Record
          const missingSkillsContainer = document.getElementById("missingSkillsContainer");
          if (missingSkillsContainer && missingSkills && missingSkills.length > 0) {
             missingSkillsContainer.innerHTML = '';
             missingSkills.forEach(s => {
               missingSkillsContainer.innerHTML += `<div class="skill-pill missing" style="border:1px solid #fecaca; background:#fff5f5; color:#b91c1c; padding:6px 12px; border-radius:20px; font-size:12px; font-weight:600;"><i data-lucide="x" style="width:12px; height:12px; margin-right:4px;"></i> ${s}</div>`;
             });
             if (typeof lucide !== 'undefined') lucide.createIcons();
          }

          // Switch to Skill Record Tab
          document.querySelectorAll(".view-panel").forEach(p => {
            p.classList.add("hidden");
            p.classList.remove("active");
          });
          const skillPanel = document.getElementById("panel-skillrecord");
          if (skillPanel) {
            skillPanel.classList.remove("hidden");
            skillPanel.classList.add("active");
          }
          
          document.querySelectorAll(".menu-item").forEach(i => i.classList.remove("active"));
          const skillLink = document.querySelector('[data-target="panel-skillrecord"]');
          if (skillLink) skillLink.classList.add("active");

          // Update Skill Record Data
          const overallScoreValue = document.querySelector(".score-value");
          let finalTargetScore = 85;
          if (overallScoreValue) {
            let currentScore = parseInt(overallScoreValue.textContent);
            if (!isNaN(currentScore)) {
              let scoreBump = 0;
              if (starRating === 1) scoreBump = -15;
              else if (starRating === 2) scoreBump = -5;
              else if (starRating === 3) scoreBump = 0;
              else if (starRating === 4) scoreBump = 5;
              else if (starRating === 5) scoreBump = 12;

              finalTargetScore = currentScore + scoreBump; 
              if(finalTargetScore > 99) finalTargetScore = 99;
              if(finalTargetScore < 40) finalTargetScore = 40;

              let direction = finalTargetScore > currentScore ? 1 : -1;
              const scoreInterval = setInterval(() => {
                if(currentScore !== finalTargetScore) {
                  currentScore += direction;
                  overallScoreValue.textContent = currentScore;
                } else {
                  clearInterval(scoreInterval);
                }
              }, 50);
            }
            
            // update ring fill
            const ringFill = document.querySelector(".ring-fill");
            if (ringFill) {
              ringFill.style.transition = "stroke-dashoffset 1s ease-out";
              ringFill.style.strokeDashoffset = "20"; // visually increase it
            }
          }
          
          // Update Skill bars visually based on star rating
          const skillRows = document.querySelectorAll(".skill-row");
          skillRows.forEach(row => {
            const strong = row.querySelector("strong");
            const fill = row.querySelector(".skill-bar-fill");
            if(strong && fill) {
               // Calculate dynamic score: Base 60 + (stars * 7) + up to 8 points random variance
               let baseScore = 60 + (starRating * 7) + Math.floor(Math.random() * 8);
               if(baseScore > 99) baseScore = 99;
               
               strong.textContent = baseScore;
               fill.style.transition = "width 1.5s ease-out";
               fill.style.width = baseScore + "%";
            }
          });

  
          const badgesRow = document.querySelector(".badges-row");
          if (badgesRow) {
            const newBadge = document.createElement("div");
            newBadge.className = "ach-badge";
            newBadge.style.borderColor = "var(--blue)";
            newBadge.style.color = "var(--blue)";
            newBadge.innerHTML = `<i data-lucide="award" class="icon-sm"></i> Premium Sprint Completed`;
            badgesRow.appendChild(newBadge);
            if (typeof lucide !== 'undefined') lucide.createIcons();
          }
          
          // Save report HTML to localStorage for viewing from the Skill section
          localStorage.setItem('lastSimulationReport', modalContent.innerHTML);
          
          // Optional Toast
          const toast = document.getElementById("toast");
          if (toast) {
            toast.textContent = "Simulation completed. Skill Record updated.";
            toast.classList.remove("hidden");
            setTimeout(() => toast.classList.add("hidden"), 4000);
          }
        });
      };
    });
  }

  if (viewBtn && viewBtn.textContent.includes("View Details")) {
    // Inject details div dynamically
    const detailsDiv = document.createElement("div");
    detailsDiv.className = "proj-details hidden";
    detailsDiv.style.marginTop = "12px";
    detailsDiv.style.paddingTop = "12px";
    detailsDiv.style.borderTop = "1px solid var(--border)";
    detailsDiv.style.fontSize = "13px";
    detailsDiv.style.color = "var(--text-muted)";
    detailsDiv.style.lineHeight = "1.5";
    
    const title = card.querySelector(".proj-title") ? card.querySelector(".proj-title").textContent : "this project";
    detailsDiv.innerHTML = `
      <strong>Tech Stack:</strong> Standard Enterprise Stack<br>
      <strong>Commitment:</strong> 10-15 hrs/week<br>
      <strong>Objective:</strong> Core contribution to ${title}.
    `;
    
    // Insert right before the button
    viewBtn.parentNode.insertBefore(detailsDiv, viewBtn);
    viewBtn.style.marginTop = "12px";

    viewBtn.addEventListener("click", () => {
      if (detailsDiv.classList.contains("hidden")) {
        detailsDiv.classList.remove("hidden");
        viewBtn.textContent = "Hide Details";
      } else {
        detailsDiv.classList.add("hidden");
        viewBtn.textContent = "View Details";
      }
    });
  }
});

// ==========================================
// TASK CARD INTERACTIVITY
// ==========================================
document.querySelectorAll(".task-card").forEach(card => {
  const startBtn = card.querySelector(".primary-btn");
  const secondaryBtn = card.querySelector(".secondary-btn"); // Could be "Continue" or "Start When Ready"
  
  // Handle primary "Start Task" button
  if (startBtn && startBtn.textContent.includes("Start")) {
    startBtn.addEventListener("click", () => {
      startBtn.innerHTML = '<i data-lucide="play-circle" class="icon-sm"></i> In Progress';
      startBtn.style.backgroundColor = "var(--green)";
      startBtn.style.borderColor = "var(--green)";
      startBtn.style.pointerEvents = "none";
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      const title = card.querySelector("h2") ? card.querySelector("h2").textContent : "a new task";
      addManagerMessage(`System Notice: Task started - [${title}].`, false);
      simulateAiResponse(`Great, let's focus on execution for: ${title}. Let me know if you need strategic guidance.`);
    });
  }

  // Handle secondary "Start When Ready" button on low pressure tasks
  if (secondaryBtn && secondaryBtn.textContent.includes("Start When Ready")) {
    secondaryBtn.addEventListener("click", () => {
      secondaryBtn.innerHTML = '<i data-lucide="play-circle" class="icon-sm"></i> In Progress';
      secondaryBtn.style.backgroundColor = "var(--green)";
      secondaryBtn.style.borderColor = "var(--green)";
      secondaryBtn.style.color = "white";
      secondaryBtn.style.pointerEvents = "none";
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      const title = card.querySelector("h2") ? card.querySelector("h2").textContent : "backlog task";
      addManagerMessage(`System Notice: Task started - [${title}].`, false);
      simulateAiResponse("I see you're picking up a backlog task. Excellent time management.");
    });
  }

  // Handle "Continue" button
  if (secondaryBtn && secondaryBtn.textContent.includes("Continue")) {
    secondaryBtn.addEventListener("click", () => {
      const originalText = secondaryBtn.textContent;
      secondaryBtn.innerHTML = '<i data-lucide="check" class="icon-sm"></i> Continued';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      // Scroll to workspace
      const workspace = document.querySelector(".workspace-card");
      if (workspace) {
        workspace.scrollIntoView({ behavior: "smooth", block: "start" });
      }

      setTimeout(() => {
        secondaryBtn.textContent = originalText;
      }, 2000);
    });
  }
});

// ==========================================
// OPEN WITH... DROPDOWN LOGIC
// ==========================================
const toolUrls = {
  "vscode": ["VS Code Remote", "https://vscode.dev"],
  "codespaces": ["GitHub Codespaces", "https://github.com/codespaces"],
  "jupyter": ["JupyterLab", "https://jupyter.org/try"],
  "tableau": ["Tableau Server", "https://public.tableau.com/"],
  "figma": ["Figma", "https://www.figma.com"],
  "jira": ["Jira / Notion", "https://www.atlassian.com/software/jira"]
};

document.addEventListener("change", (e) => {
  if (e.target.tagName === 'SELECT' && e.target.classList.contains('secondary-btn') && e.target.options[0].text === "Open with...") {
    const val = e.target.value;
    if (toolUrls[val]) {
      const [toolName, toolUrl] = toolUrls[val];
      
      const toast = document.getElementById("toast");
      if (toast) {
        toast.textContent = `Connecting to ${toolName}...`;
        toast.classList.remove("hidden");
      }
      
      if (typeof addManagerMessage === 'function') {
        addManagerMessage(`System Notice: Provisioning secure cloud connection to ${toolName}...`, false);
      }
      
      e.target.disabled = true;

      setTimeout(() => {
        if (toast) {
          toast.textContent = `Secure connection established. Opening ${toolName}.`;
        }
        if (typeof addManagerMessage === 'function') {
          addManagerMessage(`System Notice: Secure connection established. ${toolName} environment is active.`, false);
        }
        if (typeof simulateAiResponse === 'function') {
          simulateAiResponse(`Your ${toolName} environment is ready. You can switch to that window to complete your task.`);
        }
        
        window.open(toolUrl, "_blank");
        e.target.disabled = false;
        e.target.selectedIndex = 0; // Reset
        setTimeout(() => { if (toast) toast.classList.add("hidden"); }, 3000);
      }, 2500);
    }
  }
});

const submitToolWorkBtn = document.getElementById("submitToolWorkBtn");
const toolConnectedArea = document.getElementById("toolConnectedArea");
const toolSelectionArea = document.getElementById("toolSelectionArea");

if (submitToolWorkBtn) {
  submitToolWorkBtn.addEventListener("click", () => {
    if (toolConnectedArea) toolConnectedArea.classList.add("hidden");
    if (toolSelectionArea) toolSelectionArea.classList.remove("hidden");
    
    const toast = document.getElementById("toast");
    if (toast) {
      toast.textContent = "Work submitted for review successfully.";
      toast.classList.remove("hidden");
      setTimeout(() => toast.classList.add("hidden"), 3000);
    }
    
    addManagerMessage(`System Notice: External workspace code/data synced and submitted.`, false);
    simulateAiResponse("I've received your submission from the external workspace. I will review the metrics and code quality shortly.");
  });
}

// ==========================================
// SIMULATION SCHEDULE INTERACTIVITY
// ==========================================
const scheduleEvents = document.querySelectorAll(".premium-event");

scheduleEvents.forEach(event => {
  event.addEventListener("click", () => {
    // Toggle the expanded class on the clicked event
    event.classList.toggle("expanded");
  });
});

// ==========================================
// PROFILE ACTION BUTTONS INTERACTIVITY
// ==========================================
const shareProfileBtn = document.getElementById("shareProfileBtn");
const downloadResumeBtn = document.getElementById("downloadResumeBtn");
const fullReportBtn = document.getElementById("fullReportBtn");

if (shareProfileBtn) {
  shareProfileBtn.addEventListener("click", () => {
    const originalText = shareProfileBtn.innerHTML;
    shareProfileBtn.innerHTML = '<i data-lucide="check" class="icon-sm"></i> Link Copied';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    showToast("Profile link copied to clipboard.");
    
    setTimeout(() => {
      shareProfileBtn.innerHTML = originalText;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 2000);
  });
}

if (downloadResumeBtn) {
  downloadResumeBtn.addEventListener("click", () => {
    const originalText = downloadResumeBtn.innerHTML;
    downloadResumeBtn.innerHTML = '<i data-lucide="loader-2" class="icon-sm pulse"></i> Downloading...';
    if (typeof lucide !== 'undefined') lucide.createIcons();
    showToast("Downloading Resume...");
    
    setTimeout(() => {
      downloadResumeBtn.innerHTML = '<i data-lucide="check" class="icon-sm"></i> Downloaded';
      if (typeof lucide !== 'undefined') lucide.createIcons();
      
      setTimeout(() => {
        downloadResumeBtn.innerHTML = originalText;
        if (typeof lucide !== 'undefined') lucide.createIcons();
      }, 2000);
    }, 1500);
  });
}

if (fullReportBtn) {
  fullReportBtn.addEventListener("click", () => {
    const reportHTML = localStorage.getItem('lastSimulationReport');
    if (!reportHTML) {
      showToast("No simulation report found. Complete a simulation first!");
      return;
    }
    
    const overlay = document.getElementById("overlay");
    if (!overlay) return;
    
    overlay.classList.remove("hidden");
    overlay.innerHTML = `
      <div class="sprint-modal" style="width: 900px; max-height: 90vh; overflow-y: auto; padding: 0; background: white; border-radius: 24px; position: relative; animation: slideInUp 0.4s ease;">
        <button id="closeReportModal" style="position: absolute; top: 20px; right: 20px; z-index: 100; background: white; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1); display: flex; align-items: center; justify-content: center;">
          <i data-lucide="x" style="width: 20px; height: 20px; color: #64748b;"></i>
        </button>
        <div id="reportContainer" class="cert-wrapper" style="padding:0; margin:0;">
          ${reportHTML}
        </div>
      </div>
    `;
    
    document.getElementById("closeReportModal").onclick = () => {
      overlay.classList.add("hidden");
      overlay.innerHTML = "";
    };
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
    if (typeof window.drawAnalyticsChart === 'function') {
      setTimeout(window.drawAnalyticsChart, 100);
    }
    
    showToast("Opening Full Performance Report...");
  });
}

// ==========================================
// TEAM CHAT INTERACTIVITY
// ==========================================
const teamChatInput = document.getElementById("teamChatInput");
const teamChatSend = document.getElementById("teamChatSend");
const teamChatHistory = document.getElementById("teamChatHistory");

const simulatedTeamReplies = [
  { name: "Sarah", text: "Got it, thanks!" },
  { name: "Mike", text: "I'll update the ticket." },
  { name: "Alex", text: "Makes sense to me." },
  { name: "Sarah", text: "Should I change the design specs for this?" }
];

async function handleTeamChatSend() {
  if (!teamChatInput || !teamChatInput.value.trim() || !teamChatHistory) return;
  
  // Stats update
  advanceCalendarProgress();
  const collabEl = document.getElementById("statCollab");
  if (collabEl) {
    let collab = parseInt(collabEl.innerText.replace('%',''), 10) || 89;
    if (collab < 99) collab += 1;
    collabEl.innerText = collab + "%";
  }
  
  const userText = teamChatInput.value.trim();
  
  // Add user message
  const userMsg = document.createElement("div");
  userMsg.className = "chat-msg";
  userMsg.innerHTML = `<strong>You:</strong> ${userText}`;
  teamChatHistory.appendChild(userMsg);
  
  teamChatInput.value = "";
  teamChatHistory.scrollTop = teamChatHistory.scrollHeight;
  
  // Build Kanban Context
  let kanbanContext = "Current Team Status:\\n";
  const kanbanCols = document.querySelectorAll(".kanban-col");
  if (kanbanCols.length > 0) {
    kanbanCols.forEach(col => {
      const colName = col.querySelector(".col-head") ? col.querySelector(".col-head").innerText : "";
      const tasks = col.querySelectorAll(".k-item");
      tasks.forEach(task => {
        const taskName = task.querySelector(".k-title") ? task.querySelector(".k-title").innerText : "";
        const owner = task.querySelector(".k-owner") ? task.querySelector(".k-owner").innerText : "";
        if (owner && taskName) {
          kanbanContext += `- ${owner} is in '${colName}' working on '${taskName}'\\n`;
        }
      });
    });
  }

  // Show Typing Indicator
  const typingMsg = document.createElement("div");
  typingMsg.className = "chat-msg typing-indicator";
  typingMsg.innerHTML = `<em>Team is typing...</em>`;
  teamChatHistory.appendChild(typingMsg);
  teamChatHistory.scrollTop = teamChatHistory.scrollHeight;

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          messages: [
            {
              role: "system",
              content: `You are playing the role of the user's teammates: Sarah (Design), Mike (Dev), or Alex (Data). 
  Based on the user's message, pick ONE teammate to reply. Keep the reply short (1-2 sentences). 
  If the user asks what someone is doing, reference this context:\\n${kanbanContext}\\n
  IMPORTANT: Your response MUST be in the format "TeammateName: Message". For example: "Sarah: I'm currently designing the wires."
  ALSO IMPORTANT: If your message implies completing a task or starting a new one from the context, you MUST append a tag exactly like this to the end of your message: [MOVE_TASK: "Task Name" -> "Column Name"] where Column Name is "To Do", "In Progress", or "Done". 
  If the user tells you to fix the active crisis, append: [CRISIS_RESOLVED]`
            },
            { role: "user", content: userText }
          ],
          max_tokens: 150
        })
      });

      const data = await response.json();
      let replyText = data.choices[0].message.content.trim();
      
      typingMsg.remove();


    // Parse Actions
    const moveTaskMatch = replyText.match(/\[MOVE_TASK:\s*"([^"]+)"\s*->\s*"([^"]+)"\]/);
    if (moveTaskMatch) {
      const taskName = moveTaskMatch[1];
      const targetColName = moveTaskMatch[2].toLowerCase();
      
      const kanbanCols = document.querySelectorAll(".kanban-col");
      let targetColNode = null;
      kanbanCols.forEach(col => {
        if (col.querySelector(".col-head") && col.querySelector(".col-head").innerText.toLowerCase().includes(targetColName)) {
          targetColNode = col;
        }
      });

      if (targetColNode) {
        const tasks = document.querySelectorAll(".k-task, .k-item");
        tasks.forEach(task => {
          const tName = task.querySelector("span, .k-title") ? task.querySelector("span, .k-title").innerText : "";
          if (tName.includes(taskName) || taskName.includes(tName)) {
            targetColNode.appendChild(task);
            task.style.background = "var(--green-light, #ecfdf5)";
            setTimeout(() => task.style.background = "", 2000);
          }
        });
      }
      replyText = replyText.replace(moveTaskMatch[0], "");
    }

    if (replyText.includes("[CRISIS_RESOLVED]")) {
      const crisisBanner = document.getElementById("crisisBannerBox");
      if (crisisBanner) {
        crisisBanner.style.opacity = "0.5";
        crisisBanner.innerHTML = "<h4>Crisis Resolved</h4><p>The team successfully mitigated the issue.</p>";
      }
      replyText = replyText.replace("[CRISIS_RESOLVED]", "");
    }

    let name = "Team";
    let msg = replyText;
    if (replyText.includes(":")) {
      const split = replyText.split(":");
      name = split[0].trim().replace(/\\*/g, ""); // Remove bold markdown if present
      msg = split.slice(1).join(":").trim();
      
      if (!["Sarah", "Mike", "Alex", "Team"].includes(name)) {
         name = "Sarah"; 
      }
    }

    const replyMsg = document.createElement("div");
    replyMsg.className = "chat-msg";
    replyMsg.innerHTML = `<strong>${name}:</strong> ${msg}`;
    teamChatHistory.appendChild(replyMsg);
    teamChatHistory.scrollTop = teamChatHistory.scrollHeight;

  } catch (error) {
    console.error("Team Chat Error:", error);
    typingMsg.remove();
    const fallbackMsg = document.createElement("div");
    fallbackMsg.className = "chat-msg";
    fallbackMsg.innerHTML = `<strong>Mike:</strong> Sorry, we are having some connection issues right now.`;
    teamChatHistory.appendChild(fallbackMsg);
    teamChatHistory.scrollTop = teamChatHistory.scrollHeight;
  }
}

if (teamChatSend) {
  teamChatSend.addEventListener("click", handleTeamChatSend);
}

if (teamChatInput) {
  teamChatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleTeamChatSend();
    }
  });
}

// ==========================================
// GLOBAL BEHAVIORAL ANALYTICS TRACKING
// ==========================================
let thinkingTime = 18;
let activityCount = 0;

setInterval(() => {
  const timeEl = document.getElementById("statThinking");
  if (timeEl) {
    thinkingTime++;
    timeEl.innerText = `${thinkingTime}m`;
  }
  
  // Decay activity
  if (activityCount > 0) activityCount = Math.floor(activityCount / 2);
}, 60000);

// Global interaction tracker
document.addEventListener("click", (e) => {
  activityCount++;
  
  // Track prioritization (Clicking buttons in task cards)
  if (e.target.closest('.task-card') && e.target.classList.contains('primary-btn')) {
    const priorEl = document.getElementById("statPrioritization");
    if (priorEl) priorEl.innerText = "Excellent";
    
    const confEl = document.getElementById("statConfidence");
    if (confEl) {
      let conf = parseInt(confEl.innerText) || 82;
      if (conf < 99) conf += 2;
      confEl.innerText = `${conf}%`;
    }
  }
  
  // Update consistency based on activity rate
  const consistEl = document.getElementById("statConsistency");
  if (consistEl) {
    if (activityCount > 10) consistEl.innerText = "Excellent";
    else if (activityCount > 4) consistEl.innerText = "High";
  }
});

// ==========================================
// HEATMAP GENERATION
// ==========================================
const heatmapContainer = document.getElementById('productivityHeatmap');
if (heatmapContainer) {
  // Generate 20 weeks * 7 days = 140 squares
  for (let i = 0; i < 140; i++) {
    const square = document.createElement('div');
    square.classList.add('heat');
    
    // Assign random activity levels to make it look realistic
    const rand = Math.random();
    if (rand > 0.92) square.classList.add('level-4');
    else if (rand > 0.8) square.classList.add('level-3');
    else if (rand > 0.65) square.classList.add('level-2');
    else if (rand > 0.4) square.classList.add('level-1');
    else square.classList.add('empty');
    
    // Optional: add a tooltip with mock date/contribution
    square.title = `${Math.floor(Math.random() * 12)} contributions on this day`;
    
    heatmapContainer.appendChild(square);
  }
}

// ==========================================
// WELCOME TUTORIAL LOGIC
// ==========================================
const welcomePopup = document.getElementById("welcomePopup");
const closeWelcome = document.getElementById("closeWelcome");
const startSimBtn = document.getElementById("startSimBtn");

if (welcomePopup) {
  // Show welcome popup on load if not seen before
  if (!localStorage.getItem('dayzero_welcome_seen')) {
    welcomePopup.classList.remove("hidden");
  }

  const dismissWelcome = () => {
    welcomePopup.classList.add("hidden");
    localStorage.setItem('dayzero_welcome_seen', 'true');
    // Start simulation timer or first crisis
    setTimeout(showRandomCrisis, 12000);
  };

  if (closeWelcome) closeWelcome.addEventListener("click", dismissWelcome);
  if (startSimBtn) startSimBtn.addEventListener("click", dismissWelcome);
}

document.addEventListener("DOMContentLoaded", () => {
    // Make sure project cards and role tags are fully interactive
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        // Handle role tag selection
        const tags = card.querySelectorAll('.role-tag');
        if(tags.length > 0) {
            // Select the first one by default if none selected
            if(!card.querySelector('.role-tag.selected')) {
                tags[0].classList.add('selected');
            }
            
            tags.forEach(tag => {
                tag.style.cursor = 'pointer';
                tag.addEventListener('click', (e) => {
                    e.stopPropagation(); // prevent card click
                    tags.forEach(t => t.classList.remove('selected'));
                    tag.classList.add('selected');
                });
            });
        }
        
        // Handle Start Sprint Button
        const startBtn = card.querySelector('.primary-btn');
        if(startBtn) {
            startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                // Get project details
                const title = card.querySelector('.proj-title') ? card.querySelector('.proj-title').innerText : 'Project';
                const selectedTag = card.querySelector('.role-tag.selected');
                const targetRole = selectedTag ? selectedTag.textContent.trim() : "Candidate";
                
                // Save context
                localStorage.setItem("currentProjectTitle", title);
                localStorage.setItem("currentProjectRole", targetRole);
                
                // Navigate to simulation view
                const mainContent = document.getElementById("mainContent");
                const simView = document.getElementById("simView");
                if(mainContent) mainContent.classList.remove("active");
                if(simView) {
                    simView.classList.add("active");
                    // Call the function to render the interactive day
                    if(typeof renderInteractiveDay === 'function') {
                        renderInteractiveDay(1, title, targetRole);
                    }
                }
            });
        }
    });
});
