import time
import requests

print("Starting traffic generator...")
print("Press Ctrl+C to stop.")

success_count = 0
fail_count = 0

while True:
    try:
        # Hit Health
        requests.get("http://127.0.0.1:8000/health")
        
        # Hit Route Search (triggers spans)
        requests.get("http://127.0.0.1:8000/route?origin=DEL&destination=BOM&date=2024-01-20")
        
        success_count += 2
        print(f"\rRequests Sent: {success_count} | Failures: {fail_count}", end="", flush=True)
    except Exception as e:
        fail_count += 1
    
    time.sleep(2) # Wait 2 seconds between bursts
