import json
from datetime import date
from typing import Any, Dict, List

import requests

from app.core.config import settings
from app.services.translation_service import get_language_label, normalize_output_language

_SCOPE_WARNING = "This question is outside the scope of your notice. Please ask something related to your legal situation."
_OFFICIAL_DOMAINS = ("indiacode.nic.in", "legislative.gov.in", "nalsa.gov.in", "ecourts.gov.in", "incometax.gov.in")


async def generate_notice_analysis(
    text: str,
    extracted_fields: Dict[str, Any],
    doc_meta: Dict[str, Any],
    fraud: Dict[str, Any],
    tone: str,
    output_language: str,
    fallback_notice_details: Dict[str, Any],
    fallback_laws: List[Dict[str, Any]],
    fallback_deadlines: List[str],
    fallback_next_steps: List[str],
) -> Dict[str, Any]:
    output_language = normalize_output_language(output_language)
    fallback = _analysis_fallback(
        doc_meta=doc_meta,
        fraud=fraud,
        tone=tone,
        output_language=output_language,
        notice_details=fallback_notice_details,
        detected_laws=fallback_laws,
        fallback_deadlines=fallback_deadlines,
        fallback_next_steps=fallback_next_steps,
    )
    prompt = _build_notice_analysis_prompt(
        text=text,
        extracted_fields=extracted_fields,
        doc_meta=doc_meta,
        fraud=fraud,
        tone=tone,
        output_language=output_language,
    )
    candidate = await _generate_json(prompt=prompt, fallback=fallback)
    merged = _merge_fallback(fallback, candidate)
    return _normalize_notice_analysis_payload(merged)


async def generate_rights_information(
    detected_laws: List[Dict[str, Any]],
    notice_details: Dict[str, Any],
    output_language: str,
) -> List[Dict[str, Any]]:
    output_language = normalize_output_language(output_language)
    fallback = {"rights": _fallback_rights(detected_laws, notice_details, output_language)}
    prompt = _build_rights_prompt(detected_laws=detected_laws, notice_details=notice_details, output_language=output_language)
    candidate = await _generate_json(prompt=prompt, fallback=fallback)
    rights = candidate.get("rights", fallback["rights"])
    normalized: List[Dict[str, Any]] = []
    for item in rights if isinstance(rights, list) else []:
        normalized.append(_normalize_right(item))
    return normalized or fallback["rights"]


async def generate_case_assistant_answer(question: str, case_context: Dict[str, Any], output_language: str) -> Dict[str, Any]:
    output_language = normalize_output_language(output_language)
    prompt = _build_case_assistant_prompt(question=question, case_context=case_context, output_language=output_language)
    fallback = _fallback_case_answer(question, case_context)
    candidate = await _generate_json(prompt=prompt, fallback=fallback)
    merged = _merge_fallback(fallback, candidate)
    return _normalize_case_answer(merged, question)


async def translate_case_analysis(case_context: Dict[str, Any], output_language: str) -> Dict[str, Any]:
    output_language = normalize_output_language(output_language)
    fallback = {
        "summary": case_context.get("summary", ""),
        "explanation": case_context.get("explanation", ""),
        "reply_draft": case_context.get("reply_draft", _default_reply(output_language)),
        "notice_details": case_context.get("notice_details", {}),
        "detected_laws": case_context.get("detected_laws", []),
        "rights_information": case_context.get("rights_information", []),
        "deadline_items": case_context.get("deadline_items", []),
        "next_steps": case_context.get("next_steps", []),
        "location_resources": case_context.get("location_resources", []),
    }
    prompt = _build_translation_prompt(case_context=case_context, output_language=output_language)
    candidate = await _generate_json(prompt=prompt, fallback=fallback)
    merged = _merge_fallback(fallback, candidate)
    merged.setdefault("summary", fallback["summary"])
    merged.setdefault("explanation", fallback["explanation"])
    merged.setdefault("reply_draft", fallback["reply_draft"])
    return {
        "summary": merged["summary"],
        "explanation": merged["explanation"],
        "reply_draft": merged["reply_draft"],
        "notice_details": merged.get("notice_details", fallback["notice_details"]),
        "detected_laws": [_normalize_law_match(item) for item in merged.get("detected_laws", fallback["detected_laws"])],
        "rights_information": [_normalize_right(item) for item in merged.get("rights_information", fallback["rights_information"])],
        "deadline_items": [_normalize_deadline_item(item) for item in merged.get("deadline_items", fallback["deadline_items"])],
        "next_steps": [_normalize_next_step(item) for item in merged.get("next_steps", fallback["next_steps"])],
        "location_resources": [_normalize_resource(item) for item in merged.get("location_resources", fallback["location_resources"])],
    }


async def generate_llm_output(*args, **kwargs) -> Dict[str, Any]:
    return await generate_notice_analysis(*args, **kwargs)


def _build_notice_analysis_prompt(
    text: str,
    extracted_fields: Dict[str, Any],
    doc_meta: Dict[str, Any],
    fraud: Dict[str, Any],
    tone: str,
    output_language: str,
) -> str:
    language_label = get_language_label(output_language)
    payload = {
        "document_type": doc_meta.get("document_type", ""),
        "case_type": doc_meta.get("case_type", ""),
        "tone": tone,
        "fraud": fraud,
        "extracted_fields": extracted_fields,
        "today": str(date.today()),
    }
    return f"""You are an Indian legal notice analysis assistant.
Explain only from the supplied notice text and extracted metadata.
Do not fabricate facts, laws, deadlines, or parties.
If the law is unclear, say so with low confidence instead of guessing.
Write user-facing narrative fields in {language_label}.
Keep act names, law names, and section numbers in their official form.

Return only valid JSON with exactly these keys:
- summary
- explanation
- reply_draft
- notice_details
- detected_laws
- deadline_items
- next_steps

Use this schema:
{{
  "summary": "string",
  "explanation": "string",
  "reply_draft": "string",
  "notice_details": {{
    "sender": "string",
    "receiver": "string",
    "subject": "string",
    "issue_problem": "string",
    "demanded_action": "string",
    "possible_consequences": ["string"],
    "deadlines": ["string"],
    "authority_sender_type": "string",
    "supporting_lines": ["string"]
  }},
  "detected_laws": [{{
    "law_name": "string",
    "act_name": "string",
    "section": "string",
    "sections": ["string"],
    "severity": "Civil|Criminal|Administrative|Mixed|Unclear",
    "confidence": "High|Medium|Low",
    "confidence_score": 0.0,
    "match_reason": "string",
    "supporting_lines": ["string"],
    "official_source_title": "string",
    "official_source_url": "string"
  }}],
  "deadline_items": [{{
    "label": "string",
    "date": "YYYY-MM-DD or descriptive string",
    "days_remaining": 0,
    "urgency": "critical|warning|safe|unknown",
    "status": "active|expired|fallback_window|unclear",
    "source_basis": "string"
  }}],
  "next_steps": [{{
    "title": "string",
    "details": "string",
    "timeframe": "string"
  }}]
}}

Rules:
- notice_details must identify sender, receiver, subject, issue, demand, consequences, and supporting lines from the notice.
- detected_laws must identify the legal basis only if supported by the notice text or unmistakable legal context.
- For official_source_url, prefer official Indian government or court/legal aid websites only.
- deadline_items must capture all explicit dates, reply deadlines, payment deadlines, and hearing dates.
- If no explicit date appears, infer a default legal response window only when the law match is strong, and mark status as fallback_window.
- next_steps must be personalised to this exact notice, not generic.
- reply_draft must be cautious and must not admit liability.

Context:
{json.dumps(payload, ensure_ascii=False)}

Notice text:
{text[:14000]}"""


def _build_rights_prompt(detected_laws: List[Dict[str, Any]], notice_details: Dict[str, Any], output_language: str) -> str:
    language_label = get_language_label(output_language)
    return f"""You are an Indian legal rights assistant.
Based on the detected law and the notice facts, list the recipient's rights in {language_label}.
Do not give generic rights that are unrelated to the matched law.
Every right must be traceable to the Constitution of India, a specific Act, or NALSA legal aid support.

Return only valid JSON with this exact schema:
{{
  "rights": [{{
    "title": "string",
    "detailed_explanation": "string",
    "source": "string",
    "article_or_section": "string",
    "official_text_excerpt": "string",
    "what_user_can_legally_do": ["string"],
    "precautions_to_take": ["string"],
    "when_to_contact_legal_aid_or_authority": "string",
    "official_source_title": "string",
    "official_source_url": "string"
  }}]
}}

Required coverage where relevant:
- Rights under the Constitution, especially Article 14, Article 21, and Article 39A where applicable
- Rights under the detected law or Act
- Rights to reply, contest, seek documents, or verify authority where applicable
- Time-sensitive rights or response windows
- When free legal aid should be sought

Detected laws:
{json.dumps(detected_laws, ensure_ascii=False)}

Notice details:
{json.dumps(notice_details, ensure_ascii=False)}"""


def _build_case_assistant_prompt(question: str, case_context: Dict[str, Any], output_language: str) -> str:
    language_label = get_language_label(output_language)
    focused_context = {
        "document_type": case_context.get("document_type"),
        "case_type": case_context.get("case_type"),
        "risk_label": case_context.get("risk_label"),
        "notice_details": case_context.get("notice_details", {}),
        "detected_laws": case_context.get("detected_laws", []),
        "rights_information": case_context.get("rights_information", []),
        "deadline_items": case_context.get("deadline_items", []),
        "next_steps": case_context.get("next_steps", []),
        "source_text": (case_context.get("source_text", "") or "")[:10000],
    }
    return f"""You are a legal assistant analyzing this specific notice.
Answer in {language_label}.
Use the full extracted notice text and structured notice context to judge whether the question is relevant.
If the user's question is not related to this notice, the laws referenced in it, the parties involved, or the user's legal rights in this matter, respond ONLY with: '{_SCOPE_WARNING}'
Do not answer general knowledge, coding, relationship, or unrelated legal questions.
Do not hallucinate missing facts.

Return only valid JSON with exactly these keys:
- is_within_scope
- user_question
- short_answer
- detailed_explanation
- legal_practical_context
- what_user_should_do_next
- caution_verification_note

When the question is outside scope:
- set is_within_scope to false
- set short_answer exactly to '{_SCOPE_WARNING}'
- keep the remaining text minimal and consistent with that warning
- what_user_should_do_next should be an empty array

When the question is in scope:
- answer only the user's exact doubt
- avoid generic legal lectures
- use the notice facts and detected law only
- if the notice does not contain enough information, say that clearly

Case context:
{json.dumps(focused_context, ensure_ascii=False)}

User question:
{question}"""


def _build_translation_prompt(case_context: Dict[str, Any], output_language: str) -> str:
    language_label = get_language_label(output_language)
    payload = {
        "source_text": (case_context.get("source_text", "") or "")[:12000],
        "document_type": case_context.get("document_type", ""),
        "case_type": case_context.get("case_type", ""),
        "notice_details": case_context.get("notice_details", {}),
        "detected_laws": case_context.get("detected_laws", []),
        "rights_information": case_context.get("rights_information", []),
        "deadline_items": case_context.get("deadline_items", []),
        "next_steps": case_context.get("next_steps", []),
        "location_resources": case_context.get("location_resources", []),
    }
    return f"""Regenerate the notice explanation package in {language_label} using the same notice facts.
Do not literally translate output line by line; rewrite it naturally in the target language.
Keep official law names, section numbers, constitutional article numbers, helpline numbers, and URLs unchanged.
Do not add any new legal claims.

Return only valid JSON with exactly these keys:
- summary
- explanation
- reply_draft
- notice_details
- detected_laws
- rights_information
- deadline_items
- next_steps
- location_resources

Input:
{json.dumps(payload, ensure_ascii=False)}"""


async def _generate_json(prompt: str, fallback: Dict[str, Any]) -> Dict[str, Any]:
    result: Dict[str, Any] = {}
    if settings.ANTHROPIC_API_KEY:
        result = _anthropic_json(prompt)
        if result:
            return _merge_fallback(fallback, result)
    provider = settings.LLM_PROVIDER.lower()
    if provider == "openai" and settings.OPENAI_API_KEY:
        result = await _openai_json(prompt)
        if result:
            return _merge_fallback(fallback, result)
    if provider == "ollama":
        result = _ollama_json(prompt)
        if result:
            return _merge_fallback(fallback, result)
    return fallback


def _anthropic_json(prompt: str) -> Dict[str, Any]:
    try:
        response = requests.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": settings.ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            json={
                "model": settings.ANTHROPIC_MODEL,
                "max_tokens": 4000,
                "temperature": 0.1,
                "messages": [{"role": "user", "content": prompt}],
            },
            timeout=settings.AI_HTTP_TIMEOUT_SEC,
        )
        response.raise_for_status()
        content_blocks = response.json().get("content", [])
        text = "\n".join(block.get("text", "") for block in content_blocks if block.get("type") == "text")
        parsed = _extract_json_object(text)
        return parsed if isinstance(parsed, dict) else {}
    except Exception as exc:
        print(f"Anthropic JSON error: {exc}")
        return {}


def _ollama_json(prompt: str) -> Dict[str, Any]:
    try:
        response = requests.post(
            f"{settings.OLLAMA_BASE_URL}/api/generate",
            json={"model": settings.OLLAMA_MODEL, "prompt": prompt, "stream": False, "format": "json"},
            timeout=settings.AI_HTTP_TIMEOUT_SEC,
        )
        response.raise_for_status()
        raw = response.json().get("response", "{}")
        parsed = _extract_json_object(raw)
        return parsed if isinstance(parsed, dict) else {}
    except Exception as exc:
        print(f"Ollama JSON error: {exc}")
        return {}


async def _openai_json(prompt: str) -> Dict[str, Any]:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
    try:
        response = await client.chat.completions.create(
            model=settings.OPENAI_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.1,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content or "{}"
        parsed = _extract_json_object(content)
        return parsed if isinstance(parsed, dict) else {}
    except Exception as exc:
        print(f"OpenAI JSON error: {exc}")
        return {}


def _extract_json_object(raw: str) -> Dict[str, Any]:
    raw = (raw or "").strip()
    if not raw:
        return {}
    try:
        parsed = json.loads(raw)
        return parsed if isinstance(parsed, dict) else {}
    except Exception:
        pass

    start = raw.find("{")
    end = raw.rfind("}")
    if start == -1 or end == -1 or end <= start:
        return {}
    try:
        parsed = json.loads(raw[start : end + 1])
        return parsed if isinstance(parsed, dict) else {}
    except Exception:
        return {}


def _merge_fallback(fallback: Dict[str, Any], candidate: Dict[str, Any]) -> Dict[str, Any]:
    merged = dict(fallback)
    for key, value in candidate.items():
        if _is_valid_value(value):
            merged[key] = value
    return merged


def _is_valid_value(value: Any) -> bool:
    if value is None:
        return False
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, dict)):
        return len(value) > 0
    return True


def _analysis_fallback(
    doc_meta: Dict[str, Any],
    fraud: Dict[str, Any],
    tone: str,
    output_language: str,
    notice_details: Dict[str, Any],
    detected_laws: List[Dict[str, Any]],
    fallback_deadlines: List[str],
    fallback_next_steps: List[str],
) -> Dict[str, Any]:
    deadline_items = []
    for item in fallback_deadlines[:4]:
        deadline_items.append(
            {
                "label": item,
                "date": item,
                "days_remaining": None,
                "urgency": "unknown",
                "status": "unclear",
                "source_basis": "Heuristic extraction",
            }
        )
    next_steps = [
        {"title": f"Step {index + 1}", "details": step, "timeframe": "As soon as possible"}
        for index, step in enumerate(fallback_next_steps[:5])
    ]
    return {
        "summary": (
            f"This appears to be a {doc_meta.get('document_type', 'legal document')} about {doc_meta.get('case_type', 'a legal issue')}. "
            f"The sender appears to be {notice_details.get('sender', 'not clearly identified')}."
        ),
        "explanation": (
            f"The notice focuses on {notice_details.get('issue_problem', 'an issue not fully extracted yet')}. "
            f"Main demand: {notice_details.get('demanded_action', 'not clearly extracted')}. "
            f"Risk label: {fraud.get('risk_label', 'Needs Verification')}. Tone detected: {tone}."
        ),
        "reply_draft": _default_reply(output_language),
        "notice_details": notice_details,
        "detected_laws": [_normalize_law_match(item) for item in detected_laws],
        "deadline_items": deadline_items,
        "next_steps": next_steps,
    }


def _normalize_notice_analysis_payload(payload: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "summary": str(payload.get("summary", "")).strip(),
        "explanation": str(payload.get("explanation", "")).strip(),
        "reply_draft": str(payload.get("reply_draft", "")).strip(),
        "notice_details": _normalize_notice_details(payload.get("notice_details", {})),
        "detected_laws": [_normalize_law_match(item) for item in payload.get("detected_laws", [])],
        "deadline_items": [_normalize_deadline_item(item) for item in payload.get("deadline_items", [])],
        "next_steps": [_normalize_next_step(item) for item in payload.get("next_steps", [])],
    }


def _normalize_notice_details(payload: Dict[str, Any]) -> Dict[str, Any]:
    payload = payload if isinstance(payload, dict) else {}
    return {
        "sender": str(payload.get("sender", "Not clearly identified")).strip() or "Not clearly identified",
        "receiver": str(payload.get("receiver", "Not clearly identified")).strip() or "Not clearly identified",
        "subject": str(payload.get("subject", "Not clearly identified")).strip() or "Not clearly identified",
        "issue_problem": str(payload.get("issue_problem", "Not clearly identified")).strip() or "Not clearly identified",
        "demanded_action": str(payload.get("demanded_action", "Not clearly identified")).strip() or "Not clearly identified",
        "possible_consequences": _string_list(payload.get("possible_consequences")),
        "deadlines": _string_list(payload.get("deadlines")),
        "authority_sender_type": str(payload.get("authority_sender_type", "Not clearly identified")).strip() or "Not clearly identified",
        "supporting_lines": _string_list(payload.get("supporting_lines")),
    }


def _normalize_law_match(payload: Dict[str, Any]) -> Dict[str, Any]:
    payload = payload if isinstance(payload, dict) else {}
    sections = _string_list(payload.get("sections"))
    section_value = str(payload.get("section", "")).strip()
    if not sections and section_value:
        sections = [section_value]
    official_title = str(payload.get("official_source_title", "")).strip()
    official_url = str(payload.get("official_source_url", "")).strip()
    enriched_title, enriched_url = _official_source_for_law(
        act_name=str(payload.get("act_name", "")).strip(),
        law_name=str(payload.get("law_name", "")).strip(),
        explicit_title=official_title,
        explicit_url=official_url,
    )
    return {
        "law_name": str(payload.get("law_name", "Unclear legal basis")).strip() or "Unclear legal basis",
        "act_name": str(payload.get("act_name", "Unclear legal basis")).strip() or "Unclear legal basis",
        "section": section_value or (", ".join(sections) if sections else "Not clearly cited"),
        "sections": sections,
        "severity": str(payload.get("severity", "Unclear")).strip() or "Unclear",
        "confidence": str(payload.get("confidence", "Low")).strip() or "Low",
        "confidence_score": _coerce_float(payload.get("confidence_score"), 0.35),
        "match_reason": str(payload.get("match_reason", "The notice hints at this legal basis, but it still needs verification.")).strip(),
        "supporting_lines": _string_list(payload.get("supporting_lines")),
        "official_source_title": enriched_title,
        "official_source_url": enriched_url,
    }


def _normalize_right(payload: Dict[str, Any]) -> Dict[str, Any]:
    payload = payload if isinstance(payload, dict) else {}
    title = str(payload.get("title", "Relevant legal right")).strip() or "Relevant legal right"
    source = str(payload.get("source", "Official legal source")).strip()
    official_title = str(payload.get("official_source_title", "")).strip()
    official_url = str(payload.get("official_source_url", "")).strip()
    if not official_title or not official_url:
        official_title, official_url = _official_source_for_right(source, title)
    return {
        "title": title,
        "detailed_explanation": str(payload.get("detailed_explanation", "Review this right carefully in the context of your notice.")).strip(),
        "source": source,
        "article_or_section": str(payload.get("article_or_section", "")).strip(),
        "official_text_excerpt": str(payload.get("official_text_excerpt", "")).strip(),
        "what_user_can_legally_do": _string_list(payload.get("what_user_can_legally_do")),
        "precautions_to_take": _string_list(payload.get("precautions_to_take")),
        "when_to_contact_legal_aid_or_authority": str(payload.get("when_to_contact_legal_aid_or_authority", "Seek legal aid promptly if the notice has a short deadline or a court risk.")).strip(),
        "official_source_title": official_title,
        "official_source_url": official_url,
    }


def _normalize_deadline_item(payload: Dict[str, Any]) -> Dict[str, Any]:
    payload = payload if isinstance(payload, dict) else {}
    return {
        "label": str(payload.get("label", "Relevant date")).strip() or "Relevant date",
        "date": str(payload.get("date", "Not clearly specified")).strip() or "Not clearly specified",
        "days_remaining": _coerce_int_or_none(payload.get("days_remaining")),
        "urgency": str(payload.get("urgency", "unknown")).strip() or "unknown",
        "status": str(payload.get("status", "unclear")).strip() or "unclear",
        "source_basis": str(payload.get("source_basis", "Notice analysis")).strip() or "Notice analysis",
    }


def _normalize_next_step(payload: Dict[str, Any]) -> Dict[str, Any]:
    if isinstance(payload, str):
        return {"title": payload[:80] or "Next step", "details": payload, "timeframe": "As soon as possible"}
    payload = payload if isinstance(payload, dict) else {}
    title = str(payload.get("title", "Next step")).strip() or "Next step"
    details = str(payload.get("details", title)).strip() or title
    timeframe = str(payload.get("timeframe", "As soon as possible")).strip() or "As soon as possible"
    return {"title": title, "details": details, "timeframe": timeframe}


def _normalize_resource(payload: Dict[str, Any]) -> Dict[str, Any]:
    payload = payload if isinstance(payload, dict) else {}
    return {
        "state": str(payload.get("state", "Not detected")).strip() or "Not detected",
        "city": str(payload.get("city", "Not detected")).strip() or "Not detected",
        "relevant_authority_name": str(payload.get("relevant_authority_name", "Relevant authority")).strip() or "Relevant authority",
        "helpline_number": str(payload.get("helpline_number", "Check official website")).strip() or "Check official website",
        "official_website": str(payload.get("official_website", "https://nalsa.gov.in")).strip() or "https://nalsa.gov.in",
        "office_support_category": str(payload.get("office_support_category", "Legal help")).strip() or "Legal help",
        "relevance_reason": str(payload.get("relevance_reason", "Relevant official support for this notice.")).strip(),
        "availability_hours": str(payload.get("availability_hours", "Check official website")).strip() or "Check official website",
        "official_source_title": str(payload.get("official_source_title", "Official source")).strip() or "Official source",
        "is_fallback": bool(payload.get("is_fallback", False)),
    }


def _normalize_case_answer(payload: Dict[str, Any], question: str) -> Dict[str, Any]:
    out_of_scope = payload.get("is_within_scope") is False or str(payload.get("short_answer", "")).strip() == _SCOPE_WARNING
    if out_of_scope:
        return {
            "is_within_scope": False,
            "user_question": question,
            "short_answer": _SCOPE_WARNING,
            "detailed_explanation": _SCOPE_WARNING,
            "legal_practical_context": "The current assistant is limited to this uploaded notice and the laws or rights connected to it.",
            "what_user_should_do_next": [],
            "caution_verification_note": _SCOPE_WARNING,
        }
    return {
        "is_within_scope": True,
        "user_question": str(payload.get("user_question", question)).strip() or question,
        "short_answer": str(payload.get("short_answer", "Not enough case detail was found to answer safely.")).strip(),
        "detailed_explanation": str(payload.get("detailed_explanation", "Not enough case detail was found to answer safely.")).strip(),
        "legal_practical_context": str(payload.get("legal_practical_context", "This answer is based only on the uploaded notice and stored analysis.")).strip(),
        "what_user_should_do_next": _string_list(payload.get("what_user_should_do_next")),
        "caution_verification_note": str(payload.get("caution_verification_note", "Verify the notice documents before taking any irreversible step.")).strip(),
    }


def _fallback_case_answer(question: str, case_context: Dict[str, Any]) -> Dict[str, Any]:
    notice_details = case_context.get("notice_details", {})
    deadline_items = case_context.get("deadline_items", [])
    deadline_text = ", ".join(item.get("label", "") for item in deadline_items[:2] if isinstance(item, dict)) or "No clear deadline extracted"
    return {
        "is_within_scope": True,
        "user_question": question,
        "short_answer": f"The notice mainly concerns {notice_details.get('issue_problem', 'the issue described in the document')}. {deadline_text}.",
        "detailed_explanation": f"The sender appears to be {notice_details.get('sender', 'not clearly identified')}, and the notice asks for {notice_details.get('demanded_action', 'an action that should be verified carefully')}.",
        "legal_practical_context": "This answer is grounded in the uploaded notice text and stored case analysis only.",
        "what_user_should_do_next": [step.get("details", "Verify the notice before responding.") for step in case_context.get("next_steps", [])[:3] if isinstance(step, dict)],
        "caution_verification_note": "Do not admit liability, send money, or ignore a deadline until the notice is verified.",
    }


def _fallback_rights(detected_laws: List[Dict[str, Any]], notice_details: Dict[str, Any], output_language: str) -> List[Dict[str, Any]]:
    first_law = detected_laws[0] if detected_laws else {}
    law_name = first_law.get("act_name") or first_law.get("law_name") or "the legal basis mentioned in the notice"
    return [
        {
            "title": "Right to know the exact claim and supporting records",
            "detailed_explanation": f"You are entitled to understand why this notice was sent under {law_name} and to review the documents or allegations being relied on.",
            "source": law_name,
            "article_or_section": first_law.get("section", "") or "Article 14 / Article 21 principles",
            "official_text_excerpt": "A person receiving a legal notice should be given a fair opportunity to understand and respond.",
            "what_user_can_legally_do": [
                "Ask for complete copies of documents, calculations, notices, or records relied on by the sender.",
                "Verify whether the sender has legal authority to issue the demand."
            ],
            "precautions_to_take": [
                "Do not ignore short deadlines.",
                "Do not make admissions without checking the full record."
            ],
            "when_to_contact_legal_aid_or_authority": "Contact legal aid immediately if the notice threatens court action, arrest, eviction, or a coercive payment demand.",
            "official_source_title": "NALSA Legal Aid",
            "official_source_url": "https://nalsa.gov.in/legal-aid/",
        },
        {
            "title": "Right to free legal aid where eligible",
            "detailed_explanation": "If you cannot effectively defend yourself because of financial or social disadvantage, you may seek free legal aid and guidance.",
            "source": "Constitution of India and Legal Services Authorities framework",
            "article_or_section": "Article 39A",
            "official_text_excerpt": "Equal justice and free legal aid should be made available so opportunities for securing justice are not denied.",
            "what_user_can_legally_do": [
                "Approach the State Legal Services Authority or District Legal Services Authority.",
                "Use the Tele-Law / legal aid helpline to locate the correct authority."
            ],
            "precautions_to_take": [
                "Keep the notice copy and identity proof ready before contacting legal aid.",
                "Explain any urgent deadline or hearing date during the first contact."
            ],
            "when_to_contact_legal_aid_or_authority": "Contact legal aid as soon as the notice has a near deadline, court date, or serious rights impact.",
            "official_source_title": "Constitution of India / NALSA",
            "official_source_url": "https://legislative.gov.in/constitution-of-india/",
        },
    ]


def _official_source_for_law(act_name: str, law_name: str, explicit_title: str, explicit_url: str) -> tuple[str, str]:
    if explicit_url and any(domain in explicit_url for domain in _OFFICIAL_DOMAINS):
        return explicit_title or "Official source", explicit_url
    combined = f"{act_name} {law_name}".lower()
    if "constitution" in combined:
        return "Constitution of India", "https://legislative.gov.in/constitution-of-india/"
    if "income tax" in combined:
        return "Income Tax Department", "https://www.incometax.gov.in/"
    return explicit_title or "India Code", explicit_url or "https://www.indiacode.nic.in/"


def _official_source_for_right(source: str, title: str) -> tuple[str, str]:
    source_lc = f"{source} {title}".lower()
    if "39a" in source_lc or "legal aid" in source_lc:
        return "NALSA Legal Aid", "https://nalsa.gov.in/legal-aid/"
    if "article" in source_lc or "constitution" in source_lc:
        return "Constitution of India", "https://legislative.gov.in/constitution-of-india/"
    return "India Code", "https://www.indiacode.nic.in/"


def _string_list(value: Any) -> List[str]:
    if isinstance(value, list):
        return [str(item).strip() for item in value if str(item).strip()]
    if isinstance(value, str) and value.strip():
        return [value.strip()]
    return []


def _coerce_float(value: Any, fallback: float) -> float:
    try:
        return float(value)
    except Exception:
        return fallback


def _coerce_int_or_none(value: Any):
    try:
        if value is None or value == "":
            return None
        return int(value)
    except Exception:
        return None


def _default_reply(output_language: str) -> str:
    return (
        "To,\n"
        "The Sender / Concerned Party,\n\n"
        "Dear Sir/Madam,\n\n"
        "I acknowledge receipt of your communication. I am reviewing the contents and request complete copies of the documents, records, calculations, and authority relied upon in support of the claims made in the notice.\n\n"
        "Please provide the supporting material within a reasonable time. I reserve all legal rights and remedies. Nothing in this communication should be treated as an admission of liability.\n\n"
        "Yours faithfully,\n"
        "[Your Name]\n"
        "[Address]\n"
        f"[Preferred response language: {normalize_output_language(output_language)}]"
    )
