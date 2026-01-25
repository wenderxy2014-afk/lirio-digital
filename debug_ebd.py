import requests
import json

# Script para listar todos os devocionais e ver o que realmente está no banco
url = "https://mlbcbxajwzeocrmijqqf.supabase.co/functions/v1/ebd-devotional"
headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYmNieGFqd3plb2NybWlqcXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTgxODcsImV4cCI6MjA4NDQzNDE4N30.958148SiF9u8ZB1QtizV6NH9Nq20tKfZud9G9dfxcj8"
}

try:
    print("Listando devocionais...")
    # Chamada normal para ver se a função retorna algo
    response = requests.get(url, headers=headers)
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Hoje: {data.get('title')} ({data.get('day')})")
    
    # Tentando listar via DB (usando chave anon)
    print("\nConsultando via REST API...")
    rest_url = "https://mlbcbxajwzeocrmijqqf.supabase.co/rest/v1/ebd_devotionals?select=day,title&order=day.desc"
    headers_rest = {
        "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYmNieGFqd3plb2NybWlqcXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTgxODcsImV4cCI6MjA4NDQzNDE4N30.958148SiF9u8ZB1QtizV6NH9Nq20tKfZud9G9dfxcj8",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYmNieGFqd3plb2NybWlqcXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTgxODcsImV4cCI6MjA4NDQzNDE4N30.958148SiF9u8ZB1QtizV6NH9Nq20tKfZud9G9dfxcj8"
    }
    response_rest = requests.get(rest_url, headers=headers_rest)
    if response_rest.status_code == 200:
        items = response_rest.json()
        print(f"Total no banco: {len(items)}")
        for item in items[:10]:
            print(f"- {item['day']}: {item['title']}")
    else:
        print(f"Erro REST: {response_rest.status_code} - {response_rest.text}")

except Exception as e:
    print(f"Erro: {e}")
