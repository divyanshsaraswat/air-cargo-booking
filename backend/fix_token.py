import os
import base64
from dotenv import load_dotenv

load_dotenv()

token = os.getenv("GRAFANA_AUTH_TOKEN")
# print(f"Original: {token}")

try:
    decoded_bytes = base64.b64decode(token)
    decoded_str = decoded_bytes.decode('utf-8', errors='replace')
    
    if ":" in decoded_str:
        part1, part2 = decoded_str.split(":", 1)
        # Check which one looks like numeric ID
        # The output showed part2 started with "14861", which is numeric ID.
        # part1 started with "glc_", which is token.
        
        if part2.strip().isdigit() or len(part2) < len(part1): 
             # likely part2 is ID. 
             # We want User:Pass => ID:Token
             new_str = f"{part2}:{part1}"
             print("Swapping parts...")
        else:
            # Maybe already correct?
            # If part1 matches numeric ID..
            new_str = decoded_str
            print("Parts might be correct, verification needed.")

        print(f"New payload: {new_str[:20]}...{new_str[-10:]}")
        
        new_bytes = new_str.encode('utf-8')
        new_b64 = base64.b64encode(new_bytes).decode('utf-8')
        print(f"NEW_TOKEN={new_b64}")
        
    else:
        print("No colon found.")

except Exception as e:
    print(f"Error: {e}")
