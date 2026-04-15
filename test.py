from orchestrator import run_simulation

print("STARTING TEST...")  # ✅ debug

user_input = "Build a login system"

result = run_simulation(user_input)

print("RESULT RECEIVED")  # ✅ debug

print(result)
