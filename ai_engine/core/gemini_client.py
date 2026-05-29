from __future__ import annotations

from ai_engine.core.llm import ask_ai


def call_gemini(prompt: str) -> str:
    return ask_ai(
        prompt=prompt,
        agent="GeminiBackup",
        route="summary",
        fallback_chain=["gemini:gemini-flash", "gemini:gemini-flash-lite"],
        max_tokens=320,
        temperature=0.4,
    ) or ""
