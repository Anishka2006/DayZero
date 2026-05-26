from backend.services.orchestrator import start_simulation, handle_agent_event

# 1. Start simulation
session = start_simulation(
    task_id="mobile-growth",
    participant_name="Akshaya"
)

session_id = session["session_id"]

print("\n=== INITIAL AGENT INTRO MESSAGES ===")
for msg in session["messages"]:
    print(f'{msg["speaker_name"]} ({msg["role"]}): {msg["message"]}')


# 2. User introduction
print("\n=== USER INTRODUCTION TEST ===")
result = handle_agent_event({
    "session_id": session_id,
    "event_type": "candidate_message",
    "candidate_message": "Hi I am Akshaya. I will first understand the mobile onboarding issue, then fix loading and retry states."
})

for msg in result["new_messages"]:
    print(f'{msg["speaker_name"]} ({msg["role"]}): {msg["message"]}')


# 3. Ask backend-specific question
print("\n=== BACKEND AGENT ROUTING TEST ===")
result = handle_agent_event({
    "session_id": session_id,
    "event_type": "candidate_message",
    "candidate_message": "Ravi, what should happen when retryAfter comes from the API?"
})

for msg in result["new_messages"]:
    print(f'{msg["speaker_name"]} ({msg["role"]}): {msg["message"]}')


# 4. Ask design-specific question
print("\n=== DESIGNER AGENT ROUTING TEST ===")
result = handle_agent_event({
    "session_id": session_id,
    "event_type": "candidate_message",
    "candidate_message": "Mira, what should the loading state look like on mobile?"
})

for msg in result["new_messages"]:
    print(f'{msg["speaker_name"]} ({msg["role"]}): {msg["message"]}')


# 5. Run failed tests
print("\n=== QA AGENT TEST EVENT ===")
result = handle_agent_event({
    "session_id": session_id,
    "event_type": "run_tests",
    "test_results": {
        "passed": ["activation metric"],
        "failed": ["loading and retry clarity", "scope decision"]
    },
    "code": "loading state added but retry still unclear"
})

for msg in result["new_messages"]:
    print(f'{msg["speaker_name"]} ({msg["role"]}): {msg["message"]}')


# 6. Submit
print("\n=== FINAL SUBMIT TEST ===")
result = handle_agent_event({
    "session_id": session_id,
    "event_type": "submit_solution",
    "candidate_message": "Submitting final solution",
    "code": "I fixed loading, retry state, and chose activation completion rate as metric."
})

for msg in result["new_messages"]:
    print(f'{msg["speaker_name"]} ({msg["role"]}): {msg["message"]}')

print("\n=== REPORT ===")
print(result.get("report"))