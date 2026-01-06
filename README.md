# ✈️ Air Cargo Booking System

A next-generation logistics platform designed for reliability, speed, and user experience. It bridges the gap between complex backend logistics and intuitive frontend interaction.

## 🌟 System Overview

This project is a full-stack solution comprising a high-performance **FastAPI Backend** and a reactive **Next.js Frontend**. It handles the complete lifecycle of air freight operations: searching flights, booking, tracking, and delivery.

### 🏗️ Architecture & Key Technical Features

#### **1. High-Concurrency Backend (Python/FastAPI)**
-   **Hybrid Locking Strategy**: Solves the "Double Booking" problem.
    -   **Optimistic**: Fast DB updates for flights with ample capacity.
    -   **Pessimistic**: **Redis Distributed Locks** kick in automatically when capacity drops below 100kg, ensuring absolute data integrity during high traffic.
-   **Performance Caching**: **Redis** caches flight route computations (5-min TTL), reducing database load and speeding up search results.
-   **Event-Driven**: Every booking action is logged as an event, creating an immutable audit trail.

#### **2. Reactive Frontend (Next.js/TypeScript)**
-   **Live Data**: Uses **SWR** (Stale-While-Revalidate) for intelligent data fetching.
    -   Flight searches are instantly cached.
    -   Shipment tracking updates live (10s polling) without page reloads.
-   **Premium UI/UX**: Built with Ant Design and a custom "Deep Indigo" theme. Fully responsive with Dark Mode support.
-   **Resilience**: Gracefully handles network issues, 404s, and server congestion (503) with helpful user feedback.

## 🚀 Quick Start Guide

### Prerequisites
-   Node.js & npm
-   Python 3.10+ & `uv`
-   Supabase Account
-   Upstash Redis Account

### 1️⃣ Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:3000
```

### 2️⃣ Backend Setup
```bash
cd backend
uv sync
# Configure .env with SUPABASE_URL, SUPABASE_KEY, UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
uv run fastapi dev main.py
# API running at http://localhost:8000
```

## 📂 Project Structure

-   `frontend/`: Next.js App Router application.
    -   `app/tracking`: Real-time tracking interface.
    -   `components/`: Reusable UI modules (FlightSearch, MainLayout).
-   `backend/`: FastAPI application.
    -   `main.py`: Core logic for Booking, Routes, and Auth.
    -   `db/`: Database migrations and schemas.

---
© 2026 Air Cargo Booking System