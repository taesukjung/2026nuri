## 2023-10-27 - Path Traversal (LFI) in Dynamic View Routes

**Vulnerability:** The dynamic view rendering routes `routes/move.js` and `routes/enMove.js` were passing user-supplied input (`req.params.dir` and `req.params.file`) directly to `res.render()`. This allowed an attacker to use `../` directory traversal sequences to potentially load any file outside the views directory (Local File Inclusion).

**Learning:** Express's `res.render()` uses `path.join()` internally to locate view files relative to the `views` setting. If inputs are unsanitized, path traversal sequences within the variables bypass standard route matching restrictions.

**Prevention:** Never pass untrusted, user-supplied input directly to `res.render()`. If dynamic view rendering is required, ensure strict input validation (e.g., regex whitelisting alphanumeric characters, hyphens, and underscores) is applied to all path components to prevent directory traversal sequences like `../` or `%2e%2e%2f` from being processed.
