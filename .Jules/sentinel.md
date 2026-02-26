## 2024-05-22 - Missing Authorization on Admin Routes
**Vulnerability:** Admin routes (`/bbs/insert`, `/ref/insert`, etc.) were completely unprotected, allowing unauthenticated users to modify data via direct POST requests.
**Learning:** The application had authentication logic (`authController.js`) but failed to maintain session state or check authorization on subsequent requests. Authentication without session management is just a gatekeeper that leaves the door open.
**Prevention:** Always implement `isAuthenticated` middleware on all state-changing routes, not just the login page. Use `express-session` to maintain state.
