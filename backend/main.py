from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, date
from uuid import uuid4
from enum import Enum
from db.db import supabase

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- Enums ---
class BookingStatus(str, Enum):
    BOOKED = "BOOKED"
    DEPARTED = "DEPARTED"
    ARRIVED = "ARRIVED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

# --- Pydantic Models ---

# Flight Models
class Flight(BaseModel):
    flight_id: str
    flight_number: str
    airline_name: str
    departure_datetime: datetime
    arrival_datetime: datetime
    origin: str
    destination: str

# Booking Models
class BookingCreate(BaseModel):
    ref_id: str = Field(..., description="Human-friendly unique ID")
    origin: str
    destination: str
    pieces: int
    weight_kg: int
    flight_ids: Optional[List[str]] = Field(default=[], description="List of flight IDs if known at creation")
    # Status defaults to BOOKED on creation

class BookingEvent(BaseModel):
    id: Optional[str] = None
    booking_ref_id: str
    status: BookingStatus
    location: Optional[str] = None
    flight_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    metadata: Optional[dict] = {}

class BookingDataset(BaseModel):
    ref_id: str
    origin: str
    destination: str
    pieces: int
    weight_kg: int
    status: BookingStatus
    flight_ids: List[str] = []
    created_at: datetime
    updated_at: datetime
    # We will likely fetch events separately or nest them if needed
    events: Optional[List[BookingEvent]] = None

@app.get("/route", response_model=List[List[Flight]])
def get_route(origin: str, destination: str, date: date):
    """
    Get direct flights and 1-stop transit routes.
    Transit rule: Second hop must be same day or next day of first hop arrival (or departure? 
    Requirement says: "Flight in the second hop should be for the same day or next day... HYD-BLR cannot be after 16th")
    Interpretation: Second flight departure date must be >= First flight Arrival Date AND <= First Flight Arrival Date + 1 Day?
    Or is it based on calendar dates? Example says: DEL-HYD (15th) + HYD-BLR (16th). 
    Let's assume: 2nd Leg Departure Time >= 1st Leg Arrival Time AND 2nd Leg Departure Time <= 1st Leg Arrival Time + 24-48hrs buffer? 
    Strict reading: "same day or next day". 
    """
    routes = []
    
    # 1. Direct Flights
    # Filter by origin, destination, and departure date (full day)
    start_of_day = datetime.combine(date, datetime.min.time())
    end_of_day = datetime.combine(date, datetime.max.time())
    
    # Supabase filter for date range
    # Note: Supabase/PostgREST usually takes ISO strings
    res_direct = supabase.table("flights").select("*")\
        .eq("origin", origin)\
        .eq("destination", destination)\
        .gte("departure_datetime", start_of_day.isoformat())\
        .lte("departure_datetime", end_of_day.isoformat())\
        .execute()
    
    for f in res_direct.data:
        routes.append([Flight(**f)])
        
    # 2. Transit Flights (1-stop)
    # Find first legs: Origin -> Any
    res_first = supabase.table("flights").select("*")\
        .eq("origin", origin)\
        .gte("departure_datetime", start_of_day.isoformat())\
        .lte("departure_datetime", end_of_day.isoformat())\
        .execute()
        
    if not res_first.data:
        return routes

    # For each first leg, find connecting second legs: First.dest -> Final Dest
    # Constraint: 2nd leg departure usually after 1st leg arrival. 
    # And "same day or next day".
    
    for l1 in res_first.data:
        first_leg = Flight(**l1)
        # Avoid circular direct flights if any
        if first_leg.destination == destination:
            continue
            
        intermediate = first_leg.destination
        arrival_dt = first_leg.arrival_datetime
        
        # Next day end constraint. 
        # "same day or next day" relative to what? usually the arrival of first flight or just calendar date?
        # The example "DEL-HYD (15th) + HYD-BLR (16th)" implies calendar dates.
        # But logically, you can't depart before you arrive. 
        # So: 2nd Dep >= 1st Arr.
        # And: 2nd Dep Date <= 1st Arr Date + 1 day. (Or 1st Dep Date + 1? Usually 1st Arr)
        # Let's use: 2nd Dep >= 1st Arr
        # And 2nd Dep < 1st Arr + 48 hours (generous) or strictly "next calendar day end".
        # Let's implement: 2nd Dep >= 1st Arr AND 2nd Dep Date <= (1st Arr Date + 1 day)
        
        limit_date = arrival_dt.date()
        # limit_datetime = datetime.combine(limit_date + timedelta(days=1), datetime.max.time()) 
        # Actually logic says "cannot be after 16th aug". So strictly <= next day end.
        
        # We need a range for 2nd leg departure
        min_dep_2nd = arrival_dt
        # max_dep_2nd = arrival_dt + timedelta(hours=36) # Approx?
        # Let's stick to strict calendar days. 
        # Max departure is End of Next Day relative to First Leg Arrival.
        import datetime as dt_module
        from datetime import timedelta
        
        max_dep_2nd = datetime.combine(arrival_dt.date() + timedelta(days=1), datetime.max.time())

        res_second = supabase.table("flights").select("*")\
            .eq("origin", intermediate)\
            .eq("destination", destination)\
            .gte("departure_datetime", min_dep_2nd.isoformat())\
            .lte("departure_datetime", max_dep_2nd.isoformat())\
            .execute()
            
        for l2 in res_second.data:
            second_leg = Flight(**l2)
            routes.append([first_leg, second_leg])
            
    return routes

@app.get("/health")
def read_root():
    return {"message": "Hello World"}

# --- Booking Routes ---

@app.post("/bookings", response_model=BookingDataset)
def create_booking(booking: BookingCreate):
    # Check uniqueness of ref_id is handled by DB constraint usually, but we can check here to be safe or catch error
    
    # Insert Booking
    booking_data = booking.model_dump()
    booking_data["status"] = BookingStatus.BOOKED
    booking_data["created_at"] = datetime.now().isoformat()
    booking_data["updated_at"] = datetime.now().isoformat()
    
    try:
        res = supabase.table("bookings").insert(booking_data).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create booking")
        
        created_booking = res.data[0]
        
        # Create Initial Event
        event_data = {
            "booking_ref_id": created_booking["ref_id"],
            "status": BookingStatus.BOOKED,
            "timestamp": created_booking["created_at"],
            "metadata": {"action": "created"}
        }
        supabase.table("booking_events").insert(event_data).execute()
        
        return BookingDataset(**created_booking)
        
    except Exception as e:
        # Check for duplicate key error logic if needed, simplify for now
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/bookings/{ref_id}", response_model=BookingDataset)
def get_booking(ref_id: str):
    res = supabase.table("bookings").select("*").eq("ref_id", ref_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking_data = res.data[0]
    
    # Fetch events
    events_res = supabase.table("booking_events").select("*").eq("booking_ref_id", ref_id).order("timestamp").execute()
    
    booking_obj = BookingDataset(**booking_data)
    booking_obj.events = [BookingEvent(**e) for e in events_res.data]
    
    return booking_obj

@app.post("/bookings/{ref_id}/depart")
def depart_booking(ref_id: str, location: str, flight_id: Optional[str] = None):
    # Get current booking
    res = supabase.table("bookings").select("*").eq("ref_id", ref_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    booking = res.data[0]
    
    # Update Status
    new_status = BookingStatus.DEPARTED
    now = datetime.now().isoformat()
    
    supabase.table("bookings").update({
        "status": new_status, 
        "updated_at": now
    }).eq("ref_id", ref_id).execute()
    
    # Log Event
    event_data = {
        "booking_ref_id": ref_id,
        "status": new_status,
        "location": location,
        "flight_id": flight_id,
        "timestamp": now
    }
    supabase.table("booking_events").insert(event_data).execute()
    
    return {"message": "Booking departed", "status": new_status}

@app.post("/bookings/{ref_id}/arrive")
def arrive_booking(ref_id: str, location: str):
    # Get current booking
    res = supabase.table("bookings").select("*").eq("ref_id", ref_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    # Update Status
    new_status = BookingStatus.ARRIVED
    now = datetime.now().isoformat()
    
    supabase.table("bookings").update({
        "status": new_status, 
        "updated_at": now
    }).eq("ref_id", ref_id).execute()
    
    # Log Event
    event_data = {
        "booking_ref_id": ref_id,
        "status": new_status,
        "location": location,
        "timestamp": now
    }
    supabase.table("booking_events").insert(event_data).execute()
    
    return {"message": "Booking arrived", "status": new_status}

@app.post("/bookings/{ref_id}/cancel")
def cancel_booking(ref_id: str):
    # Get current booking
    res = supabase.table("bookings").select("*").eq("ref_id", ref_id).execute()
    if not res.data:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    current_status = res.data[0]["status"]
    
    # Logic: Cannot cancel if ARRIVED (or DELIVERED)
    if current_status in [BookingStatus.ARRIVED, BookingStatus.DELIVERED]:
        raise HTTPException(status_code=400, detail="Cannot cancel booking that has already arrived or been delivered")
    
    # Update Status
    new_status = BookingStatus.CANCELLED
    now = datetime.now().isoformat()
    
    supabase.table("bookings").update({
        "status": new_status, 
        "updated_at": now
    }).eq("ref_id", ref_id).execute()
    
    # Log Event
    event_data = {
        "booking_ref_id": ref_id,
        "status": new_status,
        "timestamp": now,
        "metadata": {"reason": "User requested cancellation"}
    }
    supabase.table("booking_events").insert(event_data).execute()
    
    return {"message": "Booking cancelled", "status": new_status}

# --- User Management ---

import bcrypt

class UserCreate(BaseModel):
    email: str = Field(..., description="User email")
    password: str = Field(..., description="User password")
    name: str = Field(..., description="User full name")
    dob: Optional[date] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    dob: Optional[date]
    created_at: datetime

def get_password_hash(password: str) -> str:
    # bcrypt requires bytes
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    pwd_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(pwd_bytes, hash_bytes)

@app.post("/users/signup", response_model=UserResponse)
def signup(user: UserCreate):
    # Check if email exists
    res = supabase.table("users").select("id").eq("email", user.email).execute()
    if res.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_pwd = get_password_hash(user.password)
    
    user_data = {
        "email": user.email,
        "password": hashed_pwd,
        "name": user.name,
        "dob": user.dob.isoformat() if user.dob else None,
        "created_at": datetime.now().isoformat()
    }
    
    try:
        res_insert = supabase.table("users").insert(user_data).execute()
        if not res_insert.data:
             raise HTTPException(status_code=500, detail="Failed to create user")
             
        created_user = res_insert.data[0]
        return UserResponse(**created_user)
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/users/login")
def login(user: UserLogin):
    # Fetch user by email
    res = supabase.table("users").select("*").eq("email", user.email).execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    db_user = res.data[0]
    
    # Verify password
    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
        
    return {
        "message": "Login successful", 
        "user": {
            "id": db_user["id"],
            "email": db_user["email"],
            "name": db_user["name"]
        }
    }

