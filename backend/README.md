# GoComet Backend API

This is the FastAPI backend for the Air Cargo Booking system. It provides endpoints for flight searching and booking management, backed by Supabase.

## Setup

1.  **Install Dependencies**:
    ```bash
    uv sync
    ```
2.  **Environment Variables**:
    Create a `.env` file with:
    ```env
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_key
    ```
3.  **Run Server**:
    ```bash
    uv run fastapi dev main.py
    ```

## API Endpoints

### ✈️ Flights

#### **Search Routes**
`GET /route`

Finds flight options between two cities for a specific date. 
- **Direct Flights**: Returns all direct flights.
- **Transit Flights**: Returns 1-stop connections where the second leg departs on the **same day or the next day** relative to the first leg's arrival.

**Parameters:**
- `origin` (string): IATA code or city name.
- `destination` (string): IATA code or city name.
- `date` (date): Departure date (YYYY-MM-DD).

**Response:** `List[List[Flight]]`
A list of routes. Each route is a list of flight segments (1 for direct, 2 for transit).

---

### 📦 Bookings

#### **Create Booking**
`POST /bookings`

Creates a new shipment booking and initializes its status to `BOOKED`.

**Body:**
```json
{
  "ref_id": "unique-human-readable-id",
  "origin": "DEL",
  "destination": "NYC",
  "pieces": 10,
  "weight_kg": 500,
  "flight_ids": ["fl_123"]
}
```

#### **Get Booking & History**
`GET /bookings/{ref_id}`

Retrieves the current state of a booking along with its full event timeline.

**Response:**
```json
{
  "ref_id": "...",
  "status": "ARRIVED",
  ...
  "events": [
    { "status": "BOOKED", "timestamp": "...", "metadata": {...} },
    { "status": "DEPARTED", "timestamp": "...", "location": "DEL" }
  ]
}
```

#### **Depart Booking**
`POST /bookings/{ref_id}/depart`

Marks a booking as `DEPARTED`.

**Parameters:**
- `location` (string): The airport/location code.
- `flight_id` (string, optional): The flight ID being boarded.

#### **Arrive Booking**
`POST /bookings/{ref_id}/arrive`

Marks a booking as `ARRIVED`.

**Parameters:**
- `location` (string): The airport/location code.

#### **Deliver Booking**
`POST /bookings/{ref_id}/deliver`

Marks a booking as `DELIVERED`.

**Parameters:**
- `location` (string): The delivery location/address.

#### **Cancel Booking**
`POST /bookings/{ref_id}/cancel`

Marks a booking as `CANCELLED`.
- **Restriction**: Cannot cancel a booking that has already `ARRIVED` or been `DELIVERED`.

---

## Data Models

### Booking Status
- `BOOKED`: Initial state.
- `DEPARTED`: Shipment has left a location.
- `ARRIVED`: Shipment has arrived at a location.
- `DELIVERED`: Final delivery complete.
- `CANCELLED`: Shipment cancelled.

## 👤 User Management

### **Signup**
`POST /users/signup`

Registers a new user with a secure password hash.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "dob": "1990-01-01"
}
```

**Response:**
Returns the created user object (excluding password).

### **Login**
`POST /users/login`

Verifies credentials and logs the user in.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
Returns a success message and user details.

---

## Data Models

### User
- `id`: UUID
- `email`: String (Unique)
- `name`: String
- `dob`: Date
- `created_at`: Datetime

