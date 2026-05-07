from ai_engine.agents.manager import run_manager

output = run_manager()

print("\nFINAL OUTPUT:\n")
print(output)

import json

print(json.dumps(output, indent=4))
