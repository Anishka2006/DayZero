import requests

OPENROUTER_API_KEY = "your api key"

def ask_ai(prompt):
    url = "https://openrouter.ai/api/v1/chat/completions"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }

    data = {
        "model": "openai/gpt-3.5-turbo",  # safe + free
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    response = requests.post(url, headers=headers, json=data)

    print("🔍 API STATUS:", response.status_code)

    if response.status_code != 200:
        print("🔍 API RESPONSE:", response.text)
        print("\n⚠️ API failed, using fallback...\n")
        return None

    result = response.json()

    try:
        return result["choices"][0]["message"]["content"]
    except:
        return None
