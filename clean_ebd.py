import requests
import json

url = "https://mlbcbxajwzeocrmijqqf.supabase.co/functions/v1/ebd-devotional"
headers = {
    "Content-Type": "application/json",
}
payload = {"cleanHistory": True}

try:
    response = requests.post(url, headers=headers, json=payload)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
except Exception as e:
    print(f"Error: {e}")
