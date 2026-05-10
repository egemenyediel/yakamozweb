import re
import os

import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))


class EmailVerifier:
    """Verify emails using multiple free services, rotating on limits"""

    SERVICES = [
        "disify",
        "abstract",
        "emailable",
    ]

    def __init__(self):
        self._exhausted = set()
        self._abstract_key = os.environ.get("ABSTRACT_API_KEY", "")

    def verify_syntax(self, email):
        """Basic syntax verification"""
        pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        return bool(re.match(pattern, email))

    def verify_disposable(self, email):
        """Check if email domain is disposable using Disify"""
        try:
            import requests
            domain = email.split("@")[1]
            resp = requests.get(
                f"https://disify.com/api/email/{domain}",
                timeout=10,
            )
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "email": email,
                    "format_valid": True,
                    "disposable": data.get("disposable", False),
                    "dns_valid": data.get("format", False),
                    "service": "disify",
                }
        except Exception:
            pass
        return None

    def verify_abstract(self, email):
        """Verify email using Abstract API (free tier: 100/month)"""
        if not self._abstract_key or "abstract" in self._exhausted:
            return None

        try:
            import requests
            resp = requests.get(
                "https://emailvalidation.abstractapi.com/v1/",
                params={"api_key": self._abstract_key, "email": email},
                timeout=10,
            )
            if resp.status_code == 429:
                self._exhausted.add("abstract")
                return None
            if resp.status_code == 200:
                data = resp.json()
                return {
                    "email": email,
                    "format_valid": data.get("is_valid_format", {}).get("value", False),
                    "disposable": data.get("is_disposable_email", {}).get("value", False),
                    "dns_valid": data.get("is_mx_found", {}).get("value", False),
                    "smtp_valid": data.get("is_smtp_valid", {}).get("value", False),
                    "quality_score": data.get("quality_score", ""),
                    "service": "abstract",
                }
        except Exception:
            pass
        return None

    def verify_email(self, email):
        """Verify an email using all available methods"""
        if not self.verify_syntax(email):
            return {
                "email": email,
                "format_valid": False,
                "disposable": False,
                "dns_valid": False,
                "service": "syntax_check",
            }

        result = self.verify_disposable(email)
        if result:
            return result

        result = self.verify_abstract(email)
        if result:
            return result

        return {
            "email": email,
            "format_valid": True,
            "service": "syntax_only",
        }

    def batch_verify(self, emails):
        """Verify a batch of emails"""
        results = []
        for email in emails:
            result = self.verify_email(email)
            results.append(result)
        return results
