
# Backend Tests

These tests use `pytest` and `unittest.mock` to verify the backend logic.

## Prerequisites

You need to install the testing dependencies:

```bash
pip install pytest httpx
```

## Running Tests

From the `backend` directory, run:

```bash
pytest
```

## Coverage

- **API Endpoints**: `/route`, `/bookings`, `/bookings/{id}/cancel`
- **Logic**: Flight capacity checks, dynamic routing (direct vs transit), cancellation constraints.
- **Mocking**: Supabase and Redis interactions are mocked to ensure tests are fast and isolated.
