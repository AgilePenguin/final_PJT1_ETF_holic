import os
import requests
import pathlib
from dotenv import load_dotenv

# Load backend/.env explicitly
env_path = pathlib.Path(__file__).parent / 'backend' / '.env'
load_dotenv(dotenv_path=env_path)

API_KEY = os.getenv('GEMINI_API_KEY')
if not API_KEY:
    print('No GEMINI_API_KEY set')
    raise SystemExit(1)

url = f'https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}'
print('GET', url)
resp = requests.get(url, timeout=20)
print('Status:', resp.status_code)
print(resp.text[:4000])
