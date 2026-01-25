import requests

# Forçamos a limpeza via query string que é a forma mais direta
url = "https://mlbcbxajwzeocrmijqqf.supabase.co/functions/v1/ebd-devotional?clean=true"
headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1sYmNieGFqd3plb2NybWlqcXFmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg4NTgxODcsImV4cCI6MjA4NDQzNDE4N30.958148SiF9u8ZB1QtizV6NH9Nq20tKfZud9G9dfxcj8",
    "x-clean-history": "true"
}

try:
    print(f"Enviando requisição de limpeza para: {url}")
    response = requests.get(url, headers=headers)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text}")
    
    # Se ainda estiver retornando um objeto de hoje, vamos tentar forçar via POST
    if "History cleaned" not in response.text:
       print("\nTentando via POST...")
       response = requests.post(url, headers=headers, json={"cleanHistory": True})
       print(f"Status Code POST: {response.status_code}")
       print(f"Response POST: {response.text}")

except Exception as e:
    print(f"Error: {e}")
