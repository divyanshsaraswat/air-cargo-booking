-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Flights Table
CREATE TABLE IF NOT EXISTS flights (
    flight_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flight_number TEXT NOT NULL,
    airline_name TEXT NOT NULL,
    departure_datetime TIMESTAMPTZ NOT NULL,
    arrival_datetime TIMESTAMPTZ NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    max_weight_kg INTEGER DEFAULT 5000, -- Default 5,000kg capacity
    booked_weight_kg INTEGER DEFAULT 0, -- Starts at 0
    base_price_per_kg DECIMAL(10, 2) DEFAULT 5.00
);

-- Create Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    ref_id TEXT PRIMARY KEY,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    pieces INTEGER NOT NULL,
    weight_kg INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('BOOKED', 'DEPARTED', 'ARRIVED', 'DELIVERED', 'CANCELLED')),
    user_id UUID REFERENCES users(id),
    flight_ids TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Booking Events Table
CREATE TABLE IF NOT EXISTS booking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_ref_id TEXT NOT NULL REFERENCES bookings(ref_id),
    status TEXT NOT NULL,
    location TEXT,
    flight_id TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Should be hashed
    name TEXT NOT NULL,
    dob DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create Indexes for performance
CREATE INDEX IF NOT EXISTS idx_flight_route ON flights (origin, destination, departure_datetime);
CREATE INDEX IF NOT EXISTS idx_bookings_ref_id ON bookings (ref_id);
CREATE INDEX IF NOT EXISTS idx_booking_events_ref_id ON booking_events (booking_ref_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);