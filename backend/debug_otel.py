from opentelemetry import trace
from opentelemetry.sdk.resources import Resource
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor, ConsoleSpanExporter, SimpleSpanProcessor
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
import os
import base64
from dotenv import load_dotenv

load_dotenv()

print("--- Starting OTel Debug Script ---")

endpoint = os.getenv("OTEL_EXPORTER_OTLP_ENDPOINT")
token = os.getenv("GRAFANA_AUTH_TOKEN")

token = os.getenv("GRAFANA_AUTH_TOKEN")
print(f"Endpoint: {endpoint}")
print(f"Token present: {bool(token)}")
if token:
    print(f"Token length: {len(token)}")
    print(f"Has newlines: {'\\n' in token}")
    print(f"Has whitespace: {any(c.isspace() for c in token)}")
    print(f"Token first 10: {token[:10]}")
    print(f"Token last 10: {token[-10:]}")
    try:
        decoded = base64.b64decode(token).decode('utf-8', errors='replace')
        print(f"Decodes to (masked): {decoded[:10]}...{decoded[-10:]}")
        if ":" in decoded:
            u, p = decoded.split(":", 1)
            print(f"Decoded structure: {u}:{'*' * 5}")
        else:
            print("Decoded structure: NO COLON")
    except Exception as e:
        print(f"Base64 decode error: {e}")

# Construct headers manually
headers = {"Authorization": f"Basic {token}"} if token else {}

try:
    # Set up Tracer
    resource = Resource.create(attributes={"service.name": "gocomet-backend"})
    provider = TracerProvider(resource=resource)
    trace.set_tracer_provider(provider)
    
    # Use SimpleSpanProcessor for immediate export
    otlp_exporter = OTLPSpanExporter(endpoint=endpoint, headers=headers)
    provider.add_span_processor(SimpleSpanProcessor(otlp_exporter))
    
    # Also export to console to verify span creation
    provider.add_span_processor(SimpleSpanProcessor(ConsoleSpanExporter()))

    tracer = trace.get_tracer(__name__)

    print("Creating span...")
    with tracer.start_as_current_span("debug-span"):
        print("Span active.")
        
    print("Span ended. Forcing flush...")
    # force_flush will return False if export failed
    success = provider.force_flush()
    if success:
        print("Flush successful!")
    else:
        print("Flush FAILED.")

except Exception as e:
    print(f"An exception occurred: {e}")
    import traceback
    traceback.print_exc()

print("--- End OTel Debug Script ---")
