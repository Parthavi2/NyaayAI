import json
import os
 
_path = os.path.join(os.path.dirname(__file__), "../../config/legal_aid_centers.json")
try:
    with open(_path) as f:
        _centers = json.load(f)
except Exception:
    _centers = []
 
 
def get_legal_aid_recommendation(state: str = "", city: str = "") -> dict:
    matches = [
        c for c in _centers
        if state.lower() in c.get("state", "").lower()
        or city.lower() in c.get("city", "").lower()
    ]
    return {
        "recommended": True,
        "centers": matches if matches else _centers[:3],
        "message": "Contact your nearest NALSA Legal Aid Centre for free legal assistance.",
        "nalsa_url": "https://nalsa.gov.in",
    }
 