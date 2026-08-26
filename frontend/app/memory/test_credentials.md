# Test Credentials — ViaAce Xpress

## Mock Guest Login (primary for testing)
- **Endpoint**: `POST /api/auth/mock`
- **Body**: `{ "name": "Tester" }`
- **UI Path**: Login screen → "Teruskan sebagai Tetamu" (`login-mock-button`)
- Returns `{ session_token, user }`; session is valid for 30 days.

## Google Auth
- Uses hosted OAuth
- Any real Google account may be used; not seeded.
- Backend exchange endpoint: `POST /api/auth/session` with `{ session_id }`.

## Notes for testing_agent
- Prefer the mock-guest login for automated testing (no external OAuth needed).
- Store the returned `session_token` and send as `Authorization: Bearer <token>` for all subsequent `/api/*` calls.
- Backend base URL: `EXPO_PUBLIC_BACKEND_URL` from `/app/frontend/.env`.
