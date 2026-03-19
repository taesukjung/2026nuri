## 2024-05-24 - [Path Traversal in Dynamic Routes]
**Vulnerability:** Path traversal (LFI) in `routes/move.js` and `routes/enMove.js` allowed accessing arbitrary files via `../` in directory or filename parameters.
**Learning:** `res.render` with unvalidated user input for template paths is dangerous and can lead to reading sensitive files if extensions aren't restricted.
**Prevention:** Use strict regex validation (e.g., `/^[a-zA-Z0-9_-]+$/`) to whitelist acceptable characters in dynamic route parameters before using them in file system operations.
