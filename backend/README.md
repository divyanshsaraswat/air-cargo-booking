# GoComet Backend API

A high-performance FastAPI backend for the Air Cargo Booking system, powered by Supabase and Redis.

## 🚀 Key Features

-   **Hybrid Concurrency Control**: Uses a smart hybrid locking strategy (Database Atomic Updates + Redis Distributed Locks) to handle high-concurrency flight bookings, ensuring zero overbooking even for the last few kg.
-   **Intelligent Caching**: Implements Redis caching for flight search routes to deliver lightning-fast results.
-   **Event-Driven Architecture**: bookings generate a trail of events (`BOOKED`, `DEPARTED`, `ARRIVED`, `DELIVERED`) for granular tracking.
-   **Secure Authentication**: JWT-based user authentication.

## 🛠️ Tech Stack

-   **Framework**: FastAPI (Python)
-   **Database**: Supabase (PostgreSQL)
-   **Caching & Locking**: Upstash Redis (`upstash-redis`)
-   **Package Manager**: `uv`

## ⚡ Setup

1.  **Install Dependencies**:
    ```bash
    uv sync
    ```
2.  **Environment Variables**:
    Create a `.env` file with:
    ```env
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_key
    SECRET_KEY=your_jwt_secret
    UPSTASH_REDIS_REST_URL=your_redis_url
    UPSTASH_REDIS_REST_TOKEN=your_redis_token
    ```
3.  **Run Server**:
    ```bash
    uv run fastapi dev main.py
    ```

## 📖 API Documentation

### ✈️ Flight Routes

#### **Search Routes**
`GET /route`
-   **Goal**: Find direct or 1-stop connections between cities.
-   **Performance**: Results are **Cached in Redis** for 5 minutes (TTL 300s).
-   **Params**: `origin`, `destination`, `date` (YYYY-MM-DD).

---

### 📦 Booking Management

#### **Create Booking**
`POST /bookings`
-   **Goal**: Create a shipment booking.
-   **Concurrency**: 
    -   If flight capacity > 100kg: Fast `UPDATE`.
    -   If flight capacity <= 100kg: **Redis Lock (5s TTL)** is acquired to prevent race conditions.
-   **Body**:
    ```json
    { "origin": "DEL", "destination": "LHR", "weight_kg": 500, "pieces": 10, "flight_ids": ["..."] }
    ```

#### **Get Booking Status**
`GET /bookings/{ref_id}`
-   Retrieves current status and full event timeline.

#### **Depart Shipment**
`POST /bookings/{ref_id}/depart`
-   Updates status to `DEPARTED`. Requires `location`.

#### **Arrive Shipment**
`POST /bookings/{ref_id}/arrive`
-   Updates status to `ARRIVED`. Requires `location`.

#### **Deliver Shipment**
`POST /bookings/{ref_id}/deliver`
-   Updates status to `DELIVERED`. Requires `location`.

#### **Cancel Booking**
`POST /bookings/{ref_id}/cancel`
-   Marks as `CANCELLED`. Allowed only before arrival/delivery.
