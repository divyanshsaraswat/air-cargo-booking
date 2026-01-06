# Migration: Add User ID to Bookings

Run the following SQL command in your Supabase SQL Editor to add the `user_id` column to the `bookings` table.

```sql
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
```

This will create a foreign key link to the `users` table. The column is nullable to support existing bookings.
