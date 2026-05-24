from __future__ import annotations

import json
import os
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = os.getenv("OPENROUTER_MODEL", "openai/gpt-4o-mini")
DEFAULT_TIMEOUT = float(os.getenv("OPENROUTER_TIMEOUT_SECONDS", "25"))
DEFAULT_SITE_URL = os.getenv("OPENROUTER_SITE_URL", "http://localhost")
DEFAULT_APP_NAME = os.getenv("OPENROUTER_APP_NAME", "DayZero")


def get_openrouter_api_key() -> str:
    return (
        os.getenv("OPENROUTER_API_KEY")
        or os.getenv("OPEN_ROUTER_API_KEY")
        or os.getenv("OPENROUTER_KEY")
        or ""
    ).strip()


def has_openrouter_config() -> bool:
    return bool(get_openrouter_api_key())


def _headers() -> dict[str, str] | None:
    api_key = get_openrouter_api_key()
    if not api_key:
        return None

    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": DEFAULT_SITE_URL,
        "X-Title": DEFAULT_APP_NAME,
    }


def chat_completion(
    messages: list[dict[str, str]],
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 220,
    response_format: dict[str, Any] | None = None,
    timeout: float | None = None,
) -> dict[str, Any] | None:
    headers = _headers()
    if not headers:
        return None

    payload: dict[str, Any] = {
        "model": model or DEFAULT_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    if response_format:
        payload["response_format"] = response_format

    try:
        response = requests.post(
            OPENROUTER_API_URL,
            headers=headers,
            json=payload,
            timeout=timeout or DEFAULT_TIMEOUT,
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException:
        return None


def extract_text(response: dict[str, Any] | None) -> str | None:
    if not response:
        return None

    try:
        return response["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError, AttributeError, TypeError):
        return None


def ask_ai(
    prompt: str,
    system_prompt: str | None = None,
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 220,
) -> str | None:
    messages: list[dict[str, str]] = []
    if system_prompt:
        messages.append({"role": "system", "content": system_prompt})
    messages.append({"role": "user", "content": prompt})

    return extract_text(
        chat_completion(
            messages=messages,
            model=model,
            temperature=temperature,
            max_tokens=max_tokens,
        )
    )


def _extract_json_blob(text: str) -> str | None:
    cleaned = text.strip()
    if not cleaned:
        return None

    if cleaned.startswith("```"):
        parts = cleaned.split("```")
        for part in parts:
            block = part.strip()
            if block.startswith("json"):
                block = block[4:].strip()
            if block.startswith("{") and block.endswith("}"):
                return block

    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return None

    return cleaned[start : end + 1]


def ask_ai_json(
    prompt: str,
    system_prompt: str | None = None,
    model: str | None = None,
    temperature: float = 0.2,
    max_tokens: int = 700,
) -> dict[str, Any] | None:
    json_prompt = (
        f"{prompt}\n\n"
        "Return only valid JSON. Do not wrap it in markdown. Do not add any explanation."
    )
    raw = ask_ai(
        prompt=json_prompt,
        system_prompt=system_prompt,
        model=model,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    if not raw:
        return None

    blob = _extract_json_blob(raw)
    if not blob:
        return None

    try:
        return json.loads(blob)
    except json.JSONDecodeError:
        return None
