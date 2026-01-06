import base64
import os

# The original token that was in .env (Reversed: Token:InstanceID)
# Retrieved from conversation history.
ORIGINAL_TOKEN = "Z2xjX2V5SnZJam9pTVRZek1qazNOeUlzSW00aU9pSm5iMk52YldWMExXdGxlU0lzSW1zaU9pSkxhRGswYlZCVVV6UjJNekpJTW1kd1FVa3pNamRuTmtNaUxDSnRJanA3SW5JaU9pSndjbTlrTFdGd0xYTnZkWFJvTFRFaWZYMD06MTQ4NjEzMg=="

def fix_and_write():
    print(f"Original Length: {len(ORIGINAL_TOKEN)}")
    
    try:
        decoded_bytes = base64.b64decode(ORIGINAL_TOKEN)
        decoded_str = decoded_bytes.decode('utf-8', errors='replace')
        print(f"Decoded: {decoded_str[:20]}...{decoded_str[-10:]}")

        if ":" in decoded_str:
            part1, part2 = decoded_str.split(":", 1)
            # part1 is Token (glc_), part2 is ID (1486132)
            # We need ID:Token
            new_str = f"{part2}:{part1}"
            print("Swapped PARTS.")
            
            new_bytes = new_str.encode('utf-8')
            new_b64 = base64.b64encode(new_bytes).decode('utf-8')
            print(f"New B64 Length: {len(new_b64)}")
            
            # Read .env
            with open(".env", "r") as f:
                lines = f.readlines()
            
            # Write .env
            with open(".env", "w") as f:
                for line in lines:
                    if line.startswith("GRAFANA_AUTH_TOKEN="):
                        f.write(f"GRAFANA_AUTH_TOKEN={new_b64}\n")
                    else:
                        f.write(line)
            print("Updated .env successfully.")
            
        else:
            print("Colon not found in source token!")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    fix_and_write()
