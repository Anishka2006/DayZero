from __future__ import annotations

import json
import logging
import os
from typing import Any

import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

GROQ_API_URL = os.getenv(
    "GROQ_API_URL",
    "https://api.groq.com/openai/v1/chat/completions",
)
OPENROUTER_API_URL = os.getenv(
    "OPENROUTER_API_URL",
    "https://openrouter.ai/v1/chat/completions",
)
DEFAULT_MODEL = os.getenv("GROQ_MODEL", "llama-3.1-8b-instant")
GROQ_MODEL = DEFAULT_MODEL
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "x-ai/grok-4.3")
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openrouter").strip().lower()
DEFAULT_TIMEOUT = float(os.getenv("LLM_TIMEOUT_SECONDS") or os.getenv("GROQ_TIMEOUT_SECONDS", "25"))


def get_groq_api_key() -> str:
    return (
        os.getenv("GROQ_API_KEY")
        or os.getenv("GROK_API_KEY")
        or ""
    ).strip()


def get_openrouter_api_key() -> str:
    return os.getenv("OPENROUTER_API_KEY", "").strip()


def get_llm_provider() -> str:
    if LLM_PROVIDER in {"openrouter", "groq"}:
        return LLM_PROVIDER
    if get_openrouter_api_key():
        return "openrouter"
    if get_groq_api_key():
        return "groq"
    return "openrouter"


def default_model_for(provider: str | None = None) -> str:
    return OPENROUTER_MODEL if (provider or get_llm_provider()) == "openrouter" else GROQ_MODEL


def has_llm_config() -> bool:
    return bool(get_openrouter_api_key() or get_groq_api_key())


def has_groq_config() -> bool:
    return has_llm_config()


def configured_provider() -> str | None:
    provider = get_llm_provider()
    if provider == "openrouter" and get_openrouter_api_key():
        return "openrouter"
    if provider == "groq" and get_groq_api_key():
        return "groq"
    if get_openrouter_api_key():
        return "openrouter"
    if get_groq_api_key():
        return "groq"
    return None


def _groq_headers() -> dict[str, str] | None:
    api_key = get_groq_api_key()
    if not api_key:
        return None

    return {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }


def _openrouter_headers() -> dict[str, str] | None:
    api_key = get_openrouter_api_key()
    if not api_key:
        return None

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    referer = os.getenv("OPENROUTER_HTTP_REFERER", "").strip()
    title = os.getenv("OPENROUTER_APP_TITLE", "DayZero").strip()
    if referer:
        headers["HTTP-Referer"] = referer
    if title:
        headers["X-Title"] = title
    return headers


def _openrouter_model(model: str | None = None) -> str:
    requested = str(model or "").strip()
    if requested and "/" in requested:
        return requested
    if requested and requested != OPENROUTER_MODEL:
        logger.info(
            "openrouter_model_normalized requested=%s using=%s",
            requested,
            OPENROUTER_MODEL,
        )
    return OPENROUTER_MODEL


def _groq_chat_completion(
    messages: list[dict[str, str]],
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 220,
    response_format: dict[str, Any] | None = None,
    timeout: float | None = None,
) -> dict[str, Any] | None:
    headers = _groq_headers()
    if not headers:
        logger.warning("groq_chat skipped: missing GROQ_API_KEY")
        return None

    payload: dict[str, Any] = {
        "model": model or GROQ_MODEL,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    if response_format:
        payload["response_format"] = response_format

    try:
        logger.info(
            "llm_request provider=groq model=%s messages=%s max_tokens=%s",
            payload.get("model"),
            len(messages),
            max_tokens,
        )
        response = requests.post(
            GROQ_API_URL,
            headers=headers,
            json=payload,
            timeout=timeout or DEFAULT_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
        data["_dayzero_provider"] = "groq"
        data["_dayzero_model"] = payload.get("model")
        logger.info(
            "llm_response provider=groq model=%s choices=%s",
            payload.get("model"),
            len(data.get("choices") or []),
        )
        return data
    except requests.RequestException as exc:
        status = getattr(getattr(exc, "response", None), "status_code", None)
        body = getattr(getattr(exc, "response", None), "text", "") or ""
        logger.warning(
            "groq_chat failed model=%s status=%s error=%s body=%s",
            payload.get("model"),
            status or "n/a",
            exc,
            body[:500],
        )
        return None


def _openrouter_chat_completion(
    messages: list[dict[str, str]],
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 220,
    response_format: dict[str, Any] | None = None,
    timeout: float | None = None,
) -> dict[str, Any] | None:
    headers = _openrouter_headers()
    if not headers:
        logger.warning("openrouter_chat skipped: missing OPENROUTER_API_KEY")
        return None

    payload: dict[str, Any] = {
        "model": _openrouter_model(model),
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    if response_format:
        payload["response_format"] = response_format

    try:
        logger.info(
            "llm_request provider=openrouter model=%s messages=%s max_tokens=%s",
            payload.get("model"),
            len(messages),
            max_tokens,
        )
        response = requests.post(
            OPENROUTER_API_URL,
            headers=headers,
            json=payload,
            timeout=timeout or DEFAULT_TIMEOUT,
        )
        response.raise_for_status()
        data = response.json()
        data["_dayzero_provider"] = "openrouter"
        data["_dayzero_model"] = payload.get("model")
        logger.info(
            "llm_response provider=openrouter model=%s choices=%s",
            payload.get("model"),
            len(data.get("choices") or []),
        )
        return data
    except requests.RequestException as exc:
        status = getattr(getattr(exc, "response", None), "status_code", None)
        body = getattr(getattr(exc, "response", None), "text", "") or ""
        logger.warning(
            "openrouter_chat failed model=%s status=%s error=%s body=%s",
            payload.get("model"),
            status or "n/a",
            exc,
            body[:500],
        )
        return None


def chat_completion(
    messages: list[dict[str, str]],
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 220,
    response_format: dict[str, Any] | None = None,
    timeout: float | None = None,
) -> dict[str, Any] | None:
    preferred = get_llm_provider()
    provider_order = [preferred] + [item for item in ("openrouter", "groq") if item != preferred]

    for provider in provider_order:
        if provider == "openrouter" and get_openrouter_api_key():
            response = _openrouter_chat_completion(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                response_format=response_format,
                timeout=timeout,
            )
            if response:
                return response
            logger.info("chat_completion provider=openrouter failed, checking fallback provider")
            continue

        if provider == "groq" and get_groq_api_key():
            response = _groq_chat_completion(
                messages=messages,
                model=model,
                temperature=temperature,
                max_tokens=max_tokens,
                response_format=response_format,
                timeout=timeout,
            )
            if response:
                return response
            logger.info("chat_completion provider=groq failed, checking fallback provider")

    logger.warning("chat_completion skipped: no valid LLM provider configured")
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
