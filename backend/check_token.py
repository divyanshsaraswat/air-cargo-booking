import os
import base64
from dotenv import load_dotenv

load_dotenv()

token = os.getenv("GRAFANA_AUTH_TOKEN")
print(f"Token: {token[:20]}...")

try:
    decoded_bytes = base64.b64decode(token)
    decoded_str = decoded_bytes.decode('utf-8', errors='replace')
    print(f"Decoded (start): {decoded_str[:20]}")
    
    if ":" in decoded_str:
        user, pwd = decoded_str.split(":", 1)
        print(f"Structure: Valid User:Password")
        print(f"User: {user}")
        print(f"Password starts with: {pwd[:5]}")
    else:
        print("Structure: NO COLON FOUND. likely just a token?")
        print("This might be why Basic Auth fails (needs user:pass).")

except Exception as e:
    print(f"Error decoding: {e}")
