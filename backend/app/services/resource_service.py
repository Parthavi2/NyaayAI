from __future__ import annotations

import re
from functools import lru_cache
from typing import Dict, List, Optional
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

NATIONAL_NALSA_URL = "https://nalsa.gov.in"
USER_AGENT = "NyaayAI/1.0"
PHONE_PATTERN = re.compile(r"(?:\+91[-\s]?)?(?:\d[\s-]?){8,14}\d")
HOURS_PATTERN = re.compile(r"((?:mon|monday|working days|office hours)[^.\n]{0,80})", re.IGNORECASE)


def resolve_location_and_resources(
    state: str = "",
    city: str = "",
    latitude: Optional[float] = None,
    longitude: Optional[float] = None,
    case_type: str = "",
    risk_label: str = "",
    document_type: str = "",
    detected_laws: Optional[List[Dict]] = None,
) -> Dict:
    detected = _resolve_location(state=state, city=city, latitude=latitude, longitude=longitude)
    resources = _discover_legal_resources(
        state=detected["state"],
        city=detected["city"],
        state_options=detected["state_options"],
        case_type=case_type,
        risk_label=risk_label,
        document_type=document_type,
        detected_laws=detected_laws or [],
    )
    return {
        "state_detected": detected["state"] or "Not detected",
        "city_detected": detected["city"] or "Not detected",
        "state_options": detected["state_options"],
        "resources": resources,
    }


def _resolve_location(state: str, city: str, latitude: Optional[float], longitude: Optional[float]) -> Dict[str, object]:
    normalized_state = (state or "").strip()
    normalized_city = (city or "").strip()
    state_options: List[str] = []

    if latitude is not None and longitude is not None:
        reverse = _reverse_geocode(latitude, longitude)
        normalized_city = normalized_city or reverse.get("city", "")
        normalized_state = normalized_state or reverse.get("state", "")

    if normalized_city or normalized_state:
        candidates = _forward_geocode_candidates(normalized_city, normalized_state)
        candidate_states = []
        for candidate in candidates:
            candidate_state = candidate.get("state", "")
            if candidate_state and candidate_state not in candidate_states:
                candidate_states.append(candidate_state)
        if not normalized_state and len(candidate_states) > 1:
            state_options = candidate_states[:6]
        if candidates:
            top = next((item for item in candidates if normalized_state and item.get("state", "").lower() == normalized_state.lower()), candidates[0])
            normalized_city = normalized_city or top.get("city", "")
            normalized_state = normalized_state or top.get("state", "")

    return {"city": normalized_city, "state": normalized_state, "state_options": state_options}


def _reverse_geocode(latitude: float, longitude: float) -> Dict[str, str]:
    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/reverse",
            params={"lat": latitude, "lon": longitude, "format": "jsonv2", "accept-language": "en"},
            headers={"User-Agent": USER_AGENT},
            timeout=10,
        )
        response.raise_for_status()
        address = response.json().get("address", {})
        return {
            "city": address.get("city") or address.get("town") or address.get("county") or "",
            "state": address.get("state") or "",
        }
    except Exception:
        return {}


def _forward_geocode_candidates(city: str, state: str) -> List[Dict[str, str]]:
    query = ", ".join(part for part in [city, state, "India"] if part)
    if not query:
        return []
    try:
        response = requests.get(
            "https://nominatim.openstreetmap.org/search",
            params={"q": query, "format": "jsonv2", "addressdetails": 1, "limit": 6, "countrycodes": "in"},
            headers={"User-Agent": USER_AGENT},
            timeout=10,
        )
        response.raise_for_status()
        candidates = []
        for item in response.json():
            address = item.get("address", {})
            candidates.append(
                {
                    "city": address.get("city") or address.get("town") or address.get("county") or city,
                    "state": address.get("state") or state,
                }
            )
        return candidates
    except Exception:
        return []


def _discover_legal_resources(
    state: str,
    city: str,
    state_options: List[str],
    case_type: str,
    risk_label: str,
    document_type: str,
    detected_laws: List[Dict],
) -> List[Dict]:
    resources: List[Dict] = []
    state_site = _discover_state_site(state) if state else ""
    state_reason = _build_reason(case_type, risk_label, document_type, detected_laws)

    resources.append(
        {
            "state": state or "Not detected",
            "city": city or "Not detected",
            "relevant_authority_name": "NALSA / Tele-Law National Helpline",
            "helpline_number": "15100",
            "official_website": NATIONAL_NALSA_URL,
            "office_support_category": "National legal aid helpline",
            "relevance_reason": "National legal aid and Tele-Law support for notice verification, referrals, and next legal steps.",
            "availability_hours": "Check official website",
            "official_source_title": "National Legal Services Authority",
            "is_fallback": False,
        }
    )

    if state_site:
        resources.extend(_extract_state_resources(state_site=state_site, state=state, city=city, reason=state_reason))

    if not state_site and state:
        resources.append(
            {
                "state": state,
                "city": city or "Not detected",
                "relevant_authority_name": f"{state} State Legal Services Authority",
                "helpline_number": "15100",
                "official_website": NATIONAL_NALSA_URL,
                "office_support_category": "State legal aid fallback",
                "relevance_reason": f"An exact {state} authority page could not be confirmed right now, so the national legal aid helpline is the nearest official support path for this jurisdiction.",
                "availability_hours": "Check official website",
                "official_source_title": "National Legal Services Authority",
                "is_fallback": True,
            }
        )

    if state_options and not state:
        resources.append(
            {
                "state": "Not confirmed",
                "city": city or "Not detected",
                "relevant_authority_name": "State confirmation needed",
                "helpline_number": "15100",
                "official_website": NATIONAL_NALSA_URL,
                "office_support_category": "Location clarification",
                "relevance_reason": f"The location appears ambiguous across: {', '.join(state_options[:4])}. Confirm the state to fetch the most specific authority.",
                "availability_hours": "Check official website",
                "official_source_title": "National Legal Services Authority",
                "is_fallback": True,
            }
        )

    unique: Dict[tuple[str, str], Dict] = {}
    for item in resources:
        key = (item["relevant_authority_name"], item["helpline_number"])
        unique[key] = item
    return list(unique.values())[:6]


def _build_reason(case_type: str, risk_label: str, document_type: str, detected_laws: List[Dict]) -> str:
    law_text = " ".join([str(item.get("act_name", "")) for item in detected_laws]).strip()
    return (
        f"This authority is relevant because the notice is classified as '{case_type or document_type or 'a legal notice'}', "
        f"the current risk label is '{risk_label or 'Needs Verification'}', and the detected legal context is '{law_text or 'still under verification'}'."
    )


def _extract_state_resources(state_site: str, state: str, city: str, reason: str) -> List[Dict]:
    pages = _collect_relevant_pages(state_site)
    page_bundles = []
    for page_url in pages:
        html = _fetch_text(page_url)
        if html:
            page_bundles.append((page_url, html))

    resources: List[Dict] = []
    district_match = city.lower() if city else ""
    state_added = False
    for page_url, html in page_bundles:
        title = _extract_title(html) or f"{state} Legal Services Authority"
        phones = _extract_phone_numbers(html)
        hours = _extract_hours(html)
        page_text = _clean_text(html)
        page_lower = page_text.lower()
        is_district_page = bool(district_match and district_match in page_lower and "district" in page_lower)
        if is_district_page and phones:
            resources.append(
                {
                    "state": state or "Not detected",
                    "city": city or "Not detected",
                    "relevant_authority_name": f"District Legal Services Authority, {city}",
                    "helpline_number": phones[0],
                    "official_website": page_url,
                    "office_support_category": "District legal aid",
                    "relevance_reason": f"This page appears to mention the district jurisdiction for {city}. {reason}",
                    "availability_hours": hours,
                    "official_source_title": title,
                    "is_fallback": False,
                }
            )
        if not state_added and phones:
            resources.append(
                {
                    "state": state or "Not detected",
                    "city": city or "Not detected",
                    "relevant_authority_name": f"{state or 'State'} State Legal Services Authority",
                    "helpline_number": phones[0],
                    "official_website": page_url,
                    "office_support_category": "State legal aid",
                    "relevance_reason": reason,
                    "availability_hours": hours,
                    "official_source_title": title,
                    "is_fallback": False,
                }
            )
            state_added = True

    if city and not any(item["office_support_category"] == "District legal aid" for item in resources):
        resources.append(
            {
                "state": state or "Not detected",
                "city": city,
                "relevant_authority_name": f"District Legal Services Authority, {city}",
                "helpline_number": resources[0]["helpline_number"] if resources else "15100",
                "official_website": resources[0]["official_website"] if resources else state_site,
                "office_support_category": "District legal aid fallback",
                "relevance_reason": f"An exact district contact for {city} was not confidently extracted from the official pages, so this confirmed legal aid contact is the nearest valid fallback.",
                "availability_hours": resources[0]["availability_hours"] if resources else "Check official website",
                "official_source_title": resources[0]["official_source_title"] if resources else "State Legal Services Authority",
                "is_fallback": True,
            }
        )
    return resources


def _collect_relevant_pages(base_url: str) -> List[str]:
    html = _fetch_text(base_url)
    urls = [base_url]
    if not html:
        return urls
    soup = BeautifulSoup(html, "html.parser")
    for anchor in soup.find_all("a", href=True):
        label = " ".join(anchor.stripped_strings).lower()
        href = anchor.get("href", "")
        if any(token in label for token in ["contact", "helpline", "district", "legal services"]):
            urls.append(urljoin(base_url, href))
    deduped = []
    for url in urls:
        if url not in deduped:
            deduped.append(url)
    return deduped[:6]


@lru_cache(maxsize=64)
def _discover_state_site(state: str) -> str:
    if not state:
        return ""
    candidates = _candidate_state_urls(state)
    for url in candidates:
        if _url_is_reachable(url):
            return url
    return _discover_state_site_from_nalsa(state)


def _candidate_state_urls(state: str) -> List[str]:
    slug = re.sub(r"[^a-z]", "", state.lower())
    return [
        f"https://{slug}.nalsa.gov.in/",
        f"https://www.{slug}.nalsa.gov.in/",
    ]


def _discover_state_site_from_nalsa(state: str) -> str:
    html = _fetch_text(NATIONAL_NALSA_URL)
    if not html:
        return ""
    soup = BeautifulSoup(html, "html.parser")
    target = state.lower()
    for anchor in soup.find_all("a", href=True):
        href = anchor.get("href", "")
        text = " ".join(anchor.stripped_strings).lower()
        if ".nalsa.gov.in" in href and target in f"{text} {href}".lower():
            return href if href.startswith("http") else urljoin(NATIONAL_NALSA_URL, href)
    return ""


def _url_is_reachable(url: str) -> bool:
    try:
        response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=8, allow_redirects=True)
        return response.ok
    except Exception:
        return False


def _fetch_text(url: str) -> str:
    try:
        response = requests.get(url, headers={"User-Agent": USER_AGENT}, timeout=12)
        response.raise_for_status()
        return response.text
    except Exception:
        return ""


def _extract_phone_numbers(html: str) -> List[str]:
    seen = []
    for raw in PHONE_PATTERN.findall(_clean_text(html)):
        digits = re.sub(r"\D", "", raw)
        if len(digits) < 8:
            continue
        formatted = raw.strip(" -")
        if formatted not in seen:
            seen.append(formatted)
    return seen[:4]


def _extract_hours(html: str) -> str:
    text = _clean_text(html)
    match = HOURS_PATTERN.search(text)
    return match.group(1).strip() if match else "Check official website"


def _extract_title(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    title = soup.title.string.strip() if soup.title and soup.title.string else ""
    if title:
        return title
    h1 = soup.find("h1")
    return h1.get_text(" ", strip=True) if h1 else "Official page"


def _clean_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    return soup.get_text(" ", strip=True)
