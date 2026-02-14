## 2025-02-14 - Authentication Bypass via Stateless View Rendering
**Vulnerability:** Admin authentication relied solely on a POST request checking a password and immediately rendering the "write" view. No session or cookie was set. Subsequent POST requests to `/insert` or `/update` had no authentication checks, allowing anyone to modify data by hitting these endpoints directly.
**Learning:** The application architecture assumed that if a user is on the "write" page, they must be authenticated. This "stateless" approach in a stateful workflow (edit -> save) is fundamentally insecure.
**Prevention:** Always implement session management (e.g., `express-session`) and verify authentication state on *every* sensitive request, not just the entry point.
