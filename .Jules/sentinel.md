## 2025-02-18 - Missing API Authentication Bypass
**Vulnerability:** BBS endpoints (`/insert`, `/update`, `/delete`) were exposed without authentication, relying solely on UI-level password checks (`/auth/check/*`).
**Learning:** UI-based access control (rendering forms only after password check) is insufficient. Attackers can bypass the UI and POST directly to the API endpoints if those endpoints lack session validation middleware.
**Prevention:** Implement `isAuthenticated` middleware on all state-changing routes to verify session existence and privileges, regardless of how the user accesses the form.
