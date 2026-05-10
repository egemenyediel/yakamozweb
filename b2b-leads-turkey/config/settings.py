import os
from pathlib import Path
from dotenv import load_dotenv

_project_root = Path(__file__).parent.parent
load_dotenv(_project_root / ".env")

DATA_DIR = os.path.join(_project_root, "data")
OUTPUT_DIR = os.path.join(_project_root, "output")
DB_PATH = os.path.join(DATA_DIR, "b2b_leads.db")

SECTORS = {
    "teknoloji": "technology",
    "finans": "finance",
    "savunma_sanayi": "defense_industry",
    "otomotiv": "automotive",
    "insaat": "construction",
    "saglik": "healthcare",
    "egitim": "education",
    "perakende": "retail",
    "lojistik": "logistics",
    "enerji": "energy",
    "gida": "food",
    "tekstil": "textile",
    "turizm": "tourism",
    "kimya": "chemistry",
    "madencilik": "mining",
}

HUNTER_API_KEY = os.environ.get("HUNTER_API_KEY", "")
SNOV_API_CLIENT_ID = os.environ.get("SNOV_API_CLIENT_ID", "")
SNOV_API_CLIENT_SECRET = os.environ.get("SNOV_API_CLIENT_SECRET", "")
APOLLO_API_KEY = os.environ.get("APOLLO_API_KEY", "")
CLEARBIT_API_KEY = os.environ.get("CLEARBIT_API_KEY", "")
ROCKETREACH_API_KEY = os.environ.get("ROCKETREACH_API_KEY", "")
ABSTRACT_API_KEY = os.environ.get("ABSTRACT_API_KEY", "")
NINJAPEAR_API_KEY = os.environ.get("NINJAPEAR_API_KEY", "")

REQUEST_DELAY = 2
MAX_RETRIES = 3
BATCH_SIZE = 50
