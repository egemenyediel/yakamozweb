from config.settings import (
    HUNTER_API_KEY, SNOV_API_CLIENT_ID, SNOV_API_CLIENT_SECRET,
    APOLLO_API_KEY, CLEARBIT_API_KEY, ROCKETREACH_API_KEY,
    NINJAPEAR_API_KEY,
)


class ContactService:
    def __init__(self, name, is_active=True):
        self.name = name
        self.is_active = is_active

    def get_status(self):
        raise NotImplementedError

    def search_domain(self, domain):
        raise NotImplementedError

    def search_person(self, first_name, last_name, domain):
        raise NotImplementedError


def get_contact_services():
    services = []

    if HUNTER_API_KEY:
        services.append(HunterService())
    if SNOV_API_CLIENT_ID and SNOV_API_CLIENT_SECRET:
        services.append(SnovService())
    if APOLLO_API_KEY:
        services.append(ApolloService())
    if CLEARBIT_API_KEY:
        services.append(ClearbitService())
    if ROCKETREACH_API_KEY:
        services.append(RocketReachService())
    if NINJAPEAR_API_KEY:
        services.append(NinjaPearService())

    return services


class HunterService(ContactService):
    def __init__(self):
        super().__init__("Hunter.io")
        self.api_key = HUNTER_API_KEY
        self.base_url = "https://api.hunter.io/v2"

    def get_status(self):
        import requests
        resp = requests.get(f"{self.base_url}/account?api_key={self.api_key}", timeout=10)
        data = resp.json().get("data", {})
        requests_data = data.get("requests", data.get("calls", {}))
        remaining = requests_data.get("searches", {}).get("available", data.get("remaining_searches", 0))
        return {
            "service": self.name,
            "plan": data.get("plan_name", "free"),
            "requests_remaining": remaining,
            "active": True,
        }

    def search_domain(self, domain):
        import requests
        resp = requests.get(
            f"{self.base_url}/domain-search",
            params={"domain": domain, "api_key": self.api_key, "limit": 10},
            timeout=15,
        )
        if resp.status_code == 429:
            return {"error": "rate_limited", "emails": []}
        data = resp.json().get("data", {})
        emails = []
        for email_data in data.get("emails", []):
            emails.append({
                "email": email_data.get("value"),
                "first_name": email_data.get("first_name", ""),
                "last_name": email_data.get("last_name", ""),
                "position": email_data.get("position", ""),
                "phone": email_data.get("phone_number", ""),
                "linkedin": email_data.get("linkedin", ""),
                "twitter": email_data.get("twitter", ""),
                "type": email_data.get("type", ""),
                "confidence": email_data.get("confidence", ""),
                "source": "hunter",
            })
        return {"emails": emails, "domain": domain}

    def search_person(self, first_name, last_name, domain):
        import requests
        resp = requests.get(
            f"{self.base_url}/email-finder",
            params={
                "domain": domain,
                "first_name": first_name,
                "last_name": last_name,
                "api_key": self.api_key,
            },
            timeout=15,
        )
        if resp.status_code == 429:
            return {"error": "rate_limited", "email": None}
        data = resp.json().get("data", {})
        return {
            "email": data.get("email"),
            "confidence": data.get("score", ""),
            "first_name": first_name,
            "last_name": last_name,
            "source": "hunter",
        }


class SnovService(ContactService):
    def __init__(self):
        super().__init__("Snov.io")
        self.client_id = SNOV_API_CLIENT_ID
        self.client_secret = SNOV_API_CLIENT_SECRET
        self.base_url = "https://api.snov.io/v2"
        self._token = None

    def _get_token(self):
        if self._token:
            return self._token
        import requests
        resp = requests.post(
            f"{self.base_url}/oauth/access_token",
            json={
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "grant_type": "client_credentials",
            },
            timeout=10,
        )
        self._token = resp.json().get("access_token")
        return self._token

    def get_status(self):
        return {"service": self.name, "active": bool(self._get_token())}

    def search_domain(self, domain):
        import requests
        token = self._get_token()
        if not token:
            return {"error": "auth_failed", "emails": []}
        resp = requests.get(
            f"https://api.snov.io/v1/get-domain-emails-with-count",
            params={"domain": domain, "access_token": token, "limit": 20},
            timeout=15,
        )
        if resp.status_code == 429:
            return {"error": "rate_limited", "emails": []}
        data = resp.json()
        emails = []
        for email_data in data.get("emails", []):
            emails.append({
                "email": email_data.get("email"),
                "first_name": email_data.get("firstName", ""),
                "last_name": email_data.get("lastName", ""),
                "position": email_data.get("position", ""),
                "phone": email_data.get("phone", ""),
                "linkedin": email_data.get("linkedin", ""),
                "type": email_data.get("type", ""),
                "confidence": email_data.get("confidence", ""),
                "source": "snov",
            })
        return {"emails": emails, "domain": domain}

    def search_person(self, first_name, last_name, domain):
        import requests
        token = self._get_token()
        if not token:
            return {"error": "auth_failed", "email": None}
        resp = requests.get(
            f"https://api.snov.io/v1/get-emails-from-names",
            params={
                "domain": domain,
                "firstName": first_name,
                "lastName": last_name,
                "access_token": token,
            },
            timeout=15,
        )
        if resp.status_code == 429:
            return {"error": "rate_limited", "email": None}
        data = resp.json()
        return {
            "email": data.get("data", {}).get("email"),
            "confidence": data.get("data", {}).get("confidence", ""),
            "first_name": first_name,
            "last_name": last_name,
            "source": "snov",
        }


class ApolloService(ContactService):
    def __init__(self):
        super().__init__("Apollo.io")
        self.api_key = APOLLO_API_KEY
        self.base_url = "https://api.apollo.io/api/v1"

    def get_status(self):
        return {"service": self.name, "active": bool(self.api_key)}

    def search_domain(self, domain):
        import requests
        resp = requests.post(
            f"{self.base_url}/mixed_companies/search",
            json={"api_key": self.api_key, "q_organization_domain": domain},
            timeout=15,
        )
        if resp.status_code == 429:
            return {"error": "rate_limited", "emails": []}
        data = resp.json()
        organizations = data.get("organizations", [])
        emails = []
        if organizations:
            org = organizations[0]
            contacts = resp.json().get("contacts", [])
            for contact in contacts:
                emails.append({
                    "email": contact.get("email"),
                    "first_name": contact.get("first_name", ""),
                    "last_name": contact.get("last_name", ""),
                    "position": contact.get("title", ""),
                    "phone": contact.get("phone", ""),
                    "linkedin": contact.get("linkedin_url", ""),
                    "source": "apollo",
                })
        return {"emails": emails, "domain": domain}

    def search_person(self, first_name, last_name, domain):
        import requests
        resp = requests.post(
            f"{self.base_url}/mixed_people/search",
            json={
                "api_key": self.api_key,
                "q_organization_domains": [domain],
                "person_titles[]": [first_name],
            },
            timeout=15,
        )
        if resp.status_code == 429:
            return {"error": "rate_limited", "email": None}
        contacts = resp.json().get("people", [])
        for contact in contacts:
            if (contact.get("first_name", "").lower() == first_name.lower() and
                    contact.get("last_name", "").lower() == last_name.lower()):
                return {
                    "email": contact.get("email"),
                    "first_name": first_name,
                    "last_name": last_name,
                    "position": contact.get("title", ""),
                    "phone": contact.get("phone", ""),
                    "linkedin": contact.get("linkedin_url", ""),
                    "source": "apollo",
                }
        return {"email": None, "source": "apollo"}


class ClearbitService(ContactService):
    def __init__(self):
        super().__init__("Clearbit")
        self.api_key = CLEARBIT_API_KEY
        self.base_url = "https://company-stream.clearbit.com/v2/companies"

    def get_status(self):
        return {"service": self.name, "active": bool(self.api_key)}

    def search_domain(self, domain):
        import requests
        resp = requests.get(
            f"https://person-stream.clearbit.com/v2/people/find",
            params={"domain": domain},
            headers={"Authorization": f"Bearer {self.api_key}"},
            timeout=15,
        )
        if resp.status_code == 429:
            return {"error": "rate_limited", "emails": []}
        if resp.status_code != 200:
            return {"emails": [], "domain": domain}
        data = resp.json()
        if not isinstance(data, list):
            data = [data]
        emails = []
        for person in data:
            emails.append({
                "email": person.get("email"),
                "first_name": person.get("name", {}).get("givenName", ""),
                "last_name": person.get("name", {}).get("familyName", ""),
                "position": person.get("employment", {}).get("title", ""),
                "phone": person.get("phone", ""),
                "linkedin": person.get("linkedin", {}).get("handle", ""),
                "source": "clearbit",
            })
        return {"emails": emails, "domain": domain}

    def search_person(self, first_name, last_name, domain):
        return {"email": None, "source": "clearbit", "error": "person_search_not_supported"}


class RocketReachService(ContactService):
    def __init__(self):
        super().__init__("RocketReach")
        self.api_key = ROCKETREACH_API_KEY
        self.base_url = "https://api.rocketreach.co/api/v2"

    def get_status(self):
        return {"service": self.name, "active": bool(self.api_key)}

    def search_domain(self, domain):
        import requests
        resp = requests.get(
            f"{self.base_url}/person/search",
            params={"current_employer_domain": domain},
            headers={"Api-Key": self.api_key},
            timeout=15,
        )
        if resp.status_code == 429:
            return {"error": "rate_limited", "emails": []}
        data = resp.json()
        people = data.get("profiles", [])
        emails = []
        for person in people:
            emails.append({
                "email": person.get("email", ""),
                "first_name": person.get("first_name", ""),
                "last_name": person.get("last_name", ""),
                "position": person.get("title", ""),
                "phone": person.get("phone1", ""),
                "linkedin": person.get("linkedin_url", ""),
                "source": "rocketreach",
            })
        return {"emails": emails, "domain": domain}

    def search_person(self, first_name, last_name, domain):
        return {"email": None, "source": "rocketreach", "error": "person_search_not_implemented"}


class NinjaPearService(ContactService):
    """NinjaPear / Pipl alternative - email & person lookup"""

    def __init__(self):
        super().__init__("NinjaPear")
        self.api_key = NINJAPEAR_API_KEY

    def get_status(self):
        return {"service": self.name, "active": bool(self.api_key)}

    def search_domain(self, domain):
        import requests
        try:
            resp = requests.get(
                "https://api.ninjapear.com/v1/email/search",
                params={"domain": domain, "api_key": self.api_key},
                timeout=15,
            )
            if resp.status_code == 429:
                return {"error": "rate_limited", "emails": []}
            if resp.status_code != 200:
                return {"emails": [], "domain": domain}
            data = resp.json()
            emails = []
            results = data if isinstance(data, list) else data.get("emails", data.get("results", []))
            for item in results:
                if isinstance(item, str):
                    emails.append({"email": item, "source": "ninjapear"})
                elif isinstance(item, dict):
                    emails.append({
                        "email": item.get("email", item.get("value", "")),
                        "first_name": item.get("first_name", ""),
                        "last_name": item.get("last_name", ""),
                        "position": item.get("position", item.get("title", "")),
                        "phone": item.get("phone", ""),
                        "linkedin": item.get("linkedin", ""),
                        "confidence": str(item.get("confidence", item.get("score", ""))),
                        "source": "ninjapear",
                    })
            return {"emails": emails, "domain": domain}
        except Exception:
            return {"emails": [], "domain": domain}

    def search_person(self, first_name, last_name, domain):
        import requests
        try:
            resp = requests.get(
                "https://api.ninjapear.com/v1/person/search",
                params={
                    "first_name": first_name,
                    "last_name": last_name,
                    "domain": domain,
                    "api_key": self.api_key,
                },
                timeout=15,
            )
            if resp.status_code == 429:
                return {"error": "rate_limited", "email": None}
            if resp.status_code != 200:
                return {"email": None, "source": "ninjapear"}
            data = resp.json()
            return {
                "email": data.get("email", data.get("value")),
                "confidence": str(data.get("confidence", data.get("score", ""))),
                "first_name": first_name,
                "last_name": last_name,
                "source": "ninjapear",
            }
        except Exception:
            return {"email": None, "source": "ninjapear"}
