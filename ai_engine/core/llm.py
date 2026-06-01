from __future__ import annotations

import json
import logging
import os
import re
from pathlib import Path
from typing import Any

import requests
from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")
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
GEMINI_API_URL_TEMPLATE = os.getenv(
    "GEMINI_API_URL_TEMPLATE",
    "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent",
)
DEFAULT_TIMEOUT = float(os.getenv("LLM_TIMEOUT_SECONDS") or os.getenv("GROQ_TIMEOUT_SECONDS", "18"))

DEFAULT_MODEL_CHAIN = [
    "groq:llama-3.1-8b-instant",
    "groq:llama-3.3-70b-versatile",
    "openrouter:openrouter/free",
    "openrouter:openai/gpt-oss-120b:free",
    "openrouter:z-ai/glm-4.5-air:free",
    "openrouter:nvidia/nemotron-3-super:free",
    "gemini:gemini-flash",
    "gemini:gemini-flash-lite",
]

ROUTE_MODEL_CHAINS = {
    "live_chat": DEFAULT_MODEL_CHAIN,
    "agent_chat": DEFAULT_MODEL_CHAIN,
    "initial_room": DEFAULT_MODEL_CHAIN,
    "reasoning": [
        "openrouter:openrouter/free",
        "openrouter:openai/gpt-oss-120b:free",
        "openrouter:z-ai/glm-4.5-air:free",
        "groq:llama-3.3-70b-versatile",
        "groq:llama-3.1-8b-instant",
        "gemini:gemini-flash",
    ],
    "evaluator": [
        "openrouter:openai/gpt-oss-120b:free",
        "openrouter:nvidia/nemotron-3-super:free",
        "openrouter:z-ai/glm-4.5-air:free",
        "openrouter:openrouter/free",
        "gemini:gemini-flash",
        "groq:llama-3.3-70b-versatile",
    ],
    "observer": [
        "groq:llama-3.1-8b-instant",
        "openrouter:openrouter/free",
        "gemini:gemini-flash-lite",
        "gemini:gemini-flash",
    ],
    "summary": [
        "gemini:gemini-flash",
        "groq:llama-3.3-70b-versatile",
        "groq:llama-3.1-8b-instant",
        "openrouter:openrouter/free",
    ],
}


def get_groq_api_key() -> str:
    return (os.getenv("GROQ_API_KEY") or os.getenv("GROK_API_KEY") or "").strip()


def get_openrouter_api_key() -> str:
    return os.getenv("OPENROUTER_API_KEY", "").strip()


def get_gemini_api_key() -> str:
    return os.getenv("GEMINI_API_KEY", "").strip()


def has_llm_config() -> bool:
    return bool(get_groq_api_key() or get_openrouter_api_key() or get_gemini_api_key())


def has_groq_config() -> bool:
    return has_llm_config()


def configured_provider() -> str | None:
    if get_groq_api_key():
        return "groq"
    if get_openrouter_api_key():
        return "openrouter"
    if get_gemini_api_key():
        return "gemini"
    return None


def get_llm_provider() -> str:
    return configured_provider() or "groq"


def default_model_for(provider: str | None = None) -> str:
    provider = provider or configured_provider() or "groq"
    if provider == "openrouter":
        return "openrouter/free"
    if provider == "gemini":
        return "gemini-flash"
    return "llama-3.1-8b-instant"


def _log_llm_call(agent: str, provider: str, model: str) -> None:
    logger.info("[LLM_CALL] agent=%s provider=%s model=%s", agent or "system", provider, model)


def _log_llm_fail(provider: str, model: str, reason: str) -> None:
    logger.warning("[LLM_FAIL] provider=%s model=%s reason=%s", provider, model, _short_reason(reason))


def _log_llm_fallback(next_model: str) -> None:
    logger.info("[LLM_FALLBACK] trying=%s", next_model)


def _log_llm_ok(agent: str, provider: str, model: str) -> None:
    logger.info("[LLM_OK] agent=%s provider=%s model=%s", agent or "system", provider, model)


def _short_reason(value: Any, limit: int = 120) -> str:
    text = " ".join(str(value or "unknown").split())
    text = re.sub(r"key=[^&\s)]+", "key=REDACTED", text, flags=re.IGNORECASE)
    text = re.sub(r"(api[_-]?key|token|authorization)=?[A-Za-z0-9_\-\.]+", r"\1=REDACTED", text, flags=re.IGNORECASE)
    text = re.sub(r"Bearer\s+[A-Za-z0-9_\-\.]+", "Bearer REDACTED", text, flags=re.IGNORECASE)
    return text[:limit] or "unknown"


def _parse_model_ref(ref: str) -> tuple[str, str]:
    provider, _, model = str(ref or "").partition(":")
    provider = provider.strip().lower()
    model = model.strip()
    if provider not in {"groq", "openrouter", "gemini"} or not model:
        preferred = configured_provider() or "groq"
        return preferred, str(ref or default_model_for(preferred)).strip()
    return provider, model


def _model_chain(route: str | None, model: str | None, fallback_chain: list[str] | None) -> list[str]:
    if fallback_chain:
        chain = [str(item).strip() for item in fallback_chain if str(item).strip()]
    else:
        chain = list(ROUTE_MODEL_CHAINS.get(str(route or "live_chat"), DEFAULT_MODEL_CHAIN))

    if model:
        provider, parsed_model = _parse_model_ref(model)
        first = f"{provider}:{parsed_model}"
        chain = [first] + [item for item in chain if item != first]

    seen: set[str] = set()
    unique: list[str] = []
    for item in chain:
        if item not in seen:
            seen.add(item)
            unique.append(item)
    return unique


def _headers_for_provider(provider: str) -> dict[str, str] | None:
    if provider == "groq":
        api_key = get_groq_api_key()
        if not api_key:
            return None
        return {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

    if provider == "openrouter":
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

    if provider == "gemini":
        return {"Content-Type": "application/json"} if get_gemini_api_key() else None

    return None


def _openai_compatible_chat(
    provider: str,
    url: str,
    messages: list[dict[str, str]],
    model: str,
    temperature: float,
    max_tokens: int,
    response_format: dict[str, Any] | None,
    timeout: float | None,
) -> dict[str, Any]:
    headers = _headers_for_provider(provider)
    if not headers:
        raise RuntimeError("missing_api_key")

    payload: dict[str, Any] = {
        "model": model,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    if response_format:
        payload["response_format"] = response_format

    response = requests.post(url, headers=headers, json=payload, timeout=timeout or DEFAULT_TIMEOUT)
    response.raise_for_status()
    data = response.json()
    data["_dayzero_provider"] = provider
    data["_dayzero_model"] = model
    return data


def _gemini_model_name(model: str) -> str:
    aliases = {
        "gemini-flash": os.getenv("GEMINI_FLASH_MODEL", "gemini-2.0-flash"),
        "gemini-flash-lite": os.getenv("GEMINI_FLASH_LITE_MODEL", "gemini-2.0-flash-lite"),
    }
    return aliases.get(model, model)


def _messages_to_gemini_contents(messages: list[dict[str, str]]) -> list[dict[str, Any]]:
    contents: list[dict[str, Any]] = []
    system_parts: list[str] = []
    for message in messages:
        role = str(message.get("role") or "user").lower()
        text = str(message.get("content") or "")
        if not text:
            continue
        if role == "system":
            system_parts.append(text)
            continue
        gemini_role = "model" if role == "assistant" else "user"
        contents.append({"role": gemini_role, "parts": [{"text": text}]})

    if system_parts:
        system_text = "\n\n".join(system_parts)
        if contents and contents[0].get("role") == "user":
            contents[0]["parts"].insert(0, {"text": f"{system_text}\n\n"})
        else:
            contents.insert(0, {"role": "user", "parts": [{"text": system_text}]})
    return contents or [{"role": "user", "parts": [{"text": "Reply briefly."}]}]


def _gemini_chat_completion(
    messages: list[dict[str, str]],
    model: str,
    temperature: float,
    max_tokens: int,
    timeout: float | None,
) -> dict[str, Any]:
    api_key = get_gemini_api_key()
    if not api_key:
        raise RuntimeError("missing_api_key")

    actual_model = _gemini_model_name(model)
    url = GEMINI_API_URL_TEMPLATE.format(model=actual_model)
    payload = {
        "contents": _messages_to_gemini_contents(messages),
        "generationConfig": {
            "temperature": temperature,
            "maxOutputTokens": max_tokens,
        },
    }
    response = requests.post(
        url,
        params={"key": api_key},
        headers={"Content-Type": "application/json"},
        json=payload,
        timeout=timeout or DEFAULT_TIMEOUT,
    )
    response.raise_for_status()
    data = response.json()
    text = _extract_gemini_text(data)
    return {
        "choices": [{"message": {"role": "assistant", "content": text}}],
        "model": actual_model,
        "_dayzero_provider": "gemini",
        "_dayzero_model": model,
        "_dayzero_raw_model": actual_model,
        "_dayzero_raw": data,
    }


def _extract_gemini_text(data: dict[str, Any]) -> str:
    candidates = data.get("candidates") or []
    if not candidates:
        return ""
    content = candidates[0].get("content") or {}
    parts = content.get("parts") or []
    text_parts = [str(part.get("text") or "") for part in parts if isinstance(part, dict)]
    return "\n".join(part for part in text_parts if part).strip()


def chat_completion(
    messages: list[dict[str, str]],
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 220,
    response_format: dict[str, Any] | None = None,
    timeout: float | None = None,
    agent: str | None = None,
    route: str | None = "live_chat",
    fallback_chain: list[str] | None = None,
) -> dict[str, Any] | None:
    chain = _model_chain(route, model, fallback_chain)
    last_error = ""

    for index, ref in enumerate(chain):
        provider, provider_model = _parse_model_ref(ref)
        if index > 0:
            _log_llm_fallback(f"{provider}/{provider_model}")

        try:
            _log_llm_call(agent or "system", provider, provider_model)
            if provider == "groq":
                data = _openai_compatible_chat(
                    provider="groq",
                    url=GROQ_API_URL,
                    messages=messages,
                    model=provider_model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    response_format=response_format,
                    timeout=timeout,
                )
            elif provider == "openrouter":
                data = _openai_compatible_chat(
                    provider="openrouter",
                    url=OPENROUTER_API_URL,
                    messages=messages,
                    model=provider_model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    response_format=response_format,
                    timeout=timeout,
                )
            elif provider == "gemini":
                data = _gemini_chat_completion(
                    messages=messages,
                    model=provider_model,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    timeout=timeout,
                )
            else:
                raise RuntimeError("unknown_provider")

            if extract_text(data):
                _log_llm_ok(agent or "system", provider, provider_model)
                return data

            last_error = "empty_response"
            _log_llm_fail(provider, provider_model, last_error)
        except requests.exceptions.Timeout:
            last_error = "timeout"
            _log_llm_fail(provider, provider_model, last_error)
        except requests.RequestException as exc:
            status = getattr(getattr(exc, "response", None), "status_code", None)
            body = getattr(getattr(exc, "response", None), "text", "") or ""
            last_error = f"http_{status or 'error'} {body[:160] or exc}"
            _log_llm_fail(provider, provider_model, last_error)
        except Exception as exc:
            last_error = str(exc)
            _log_llm_fail(provider, provider_model, last_error)

    logger.warning("llm_router exhausted route=%s agent=%s reason=%s", route or "live_chat", agent or "system", _short_reason(last_error, 220))
    return None


def extract_text(response: dict[str, Any] | None) -> str | None:
    if not response:
        return None
    try:
        return str(response["choices"][0]["message"]["content"]).strip()
    except (KeyError, IndexError, AttributeError, TypeError):
        return None


def ask_ai(
    prompt: str,
    system_prompt: str | None = None,
    model: str | None = None,
    temperature: float = 0.7,
    max_tokens: int = 220,
    agent: str | None = None,
    route: str | None = "live_chat",
    fallback_chain: list[str] | None = None,
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
            agent=agent,
            route=route,
            fallback_chain=fallback_chain,
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
    agent: str | None = None,
    route: str | None = "evaluator",
    fallback_chain: list[str] | None = None,
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
        agent=agent,
        route=route,
        fallback_chain=fallback_chain,
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
