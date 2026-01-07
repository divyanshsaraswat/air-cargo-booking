# GoComet Backend API

A high-performance FastAPI backend for the Air Cargo Booking system, powered by Supabase and Redis. It is architected to handle high-concurrency booking scenarios with ease.

---

## 🚀 Key Features

### **1. Hybrid Concurrency Control**
To solve the classic "Double Booking" problem without sacrificing performance:
-   **Optimistic Zone**: For flights with ample capacity (>100kg + requested), we use standard fast DB atomic updates.
-   **Critical Zone (Pessimistic)**: When capacity drops below the threshold (100kg), the system automatically engages **Redis Distributed Locks** (via `upstash-redis`). This serializes requests for that specific flight for a few milliseconds, ensuring absolute data integrity.

### **2. Intelligent Route Caching**
-   Flight searches (especially multi-leg transit routes) are computationally expensive.
-   We cache the results of routing queries in **Redis** with a 5-minute TTL.
-   This reduces database load by ~90% for high-volume routes like `DEL-LHR`.

### **3. Event-Driven Audit Trail**
-   The system follows an event sourcing pattern for tracking.
-   Every status change (`BOOKED`, `DEPARTED`, `ARRIVED`, `DELIVERED`, `CANCELLED`) is recorded as an immutable event in the `booking_events` table.
-   This allows for granular tracking history and debugging.

### **4. Secure Authentication**
-   Implements **OAuth2 with Password Flow**.
-   Uses **JWT (JSON Web Tokens)** for stateless, secure session management.
-   Protected endpoints automatically verify token validity and expiry.

---

## 🛠️ Tech Stack & Architecture

-   **Framework**: FastAPI (Python 3.10+) - Chosen for native async support and high throughput.
-   **Database**: Supabase (PostgreSQL) - Relational data integrity + powerful `pgvector` ready.
-   **Caching & Locking**: Upstash Redis - Serverless Redis for global low-latency access.
-   **Observability**: OpenTelemetry - Integrated tracing to monitor request latency and bottlenecks.
-   **Testing**: Pytest - Comprehensive unit and integration test suite capable of mocking external services.

### **Folder Structure**
-   `main.py`: The entry point containing all API routes and business logic.
-   `db/`: Database connection management.
-   `tests/`: Unit and Integration tests using `pytest`.

---

## ⚡ Setup & Installation

1.  **Install Dependencies**:
    We use `uv` for lightning-fast package management.
    ```bash
    uv sync
    ```

2.  **Environment Configuration**:
    Create a `.env` file in the `backend/` root:
    ```env
    # Database
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    
    # Auth
    SECRET_KEY=your_jwt_secret_key
    
    # Caching & Locking
    UPSTASH_REDIS_REST_URL=your_redis_url
    UPSTASH_REDIS_REST_TOKEN=your_redis_token
    
    # Observability (Optional)
    OTEL_EXPORTER_OTLP_ENDPOINT=your_otel_endpoint
    GRAFANA_AUTH_TOKEN=your_grafana_token
    ```

3.  **Run Development Server**:
    ```bash
    uv run fastapi dev main.py
    ```
    The API will be available at `http://localhost:8000`.
    Swagger UI documentation is auto-generated at `http://localhost:8000/docs`.

4.  **Run Tests**:
    ```bash
    uv run pytest
    ```

---

## 📖 API Documentation

### 👤 Authentication

#### `POST /users/signup`
**Description**: Register a new user.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword",
    "name": "John Doe",
    "dob": "1990-01-01"
  }
  ```
- **Response**: `200 OK`
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": { "id": "uuid", "email": "...", "name": "..." }
  }
  ```

#### `POST /users/login`
**Description**: Authenticate and get a JWT token.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword"
  }
  ```
- **Response**: Same as signup.

---

### ✈️ Flights & Routing

#### `GET /route`
**Description**: Search for flights between two airports. Returns direct and 1-stop options.
- **Query Parameters**:
  - `origin` (e.g., `DEL`)
  - `destination` (e.g., `LHR`)
  - `date` (YYYY-MM-DD)
- **Response**: Array of Route objects.
  ```json
  [
    [
      {
        "flight_id": "uuid",
        "flight_number": "BA143",
        "airline_name": "British Airways",
        "origin": "DEL",
        "destination": "LHR",
        "departure_datetime": "2024-03-20T10:00:00",
        "arrival_datetime": "2024-03-20T14:30:00",
        "base_price_per_kg": 12.5,
        "max_weight_kg": 5000,
        "booked_weight_kg": 1200
      }
    ]
  ]
  ```

---

### 📦 Bookings

#### `POST /bookings`
**Description**: Create a new shipment booking.
- **Headers**: `Authorization: Bearer <token>`
- **Request Body**:
  ```json
  {
    "ref_id": "BKG-12345",
    "origin": "DEL",
    "destination": "LHR",
    "pieces": 5,
    "weight_kg": 150,
    "flight_ids": ["uuid-flight-1", "uuid-flight-2"]
  }
  ```
- **Response**:
  ```json
  {
    "ref_id": "BKG-12345",
    "status": "BOOKED",
    "created_at": "..."
  }
  ```

#### `GET /bookings/my-bookings`
**Description**: Get all bookings for the current user.
- **Headers**: `Authorization: Bearer <token>`

#### `GET /bookings/{ref_id}`
**Description**: Get booking details and tracking timeline.

#### `POST /bookings/{ref_id}/{action}`
**Description**: Update booking lifecycle state.
- **Actions**: `depart`, `arrive`, `deliver`, `cancel`
- **Request Body** (optional, e.g., for `depart`):
  ```json
  {
    "location": "LHR",
    "flight_id": "uuid-flight-1" 
  }
  ```
