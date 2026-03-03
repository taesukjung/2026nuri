## 2024-03-03 - [Fix] Path Traversal in Dynamic View Router

**Vulnerability:** Path Traversal / Local File Inclusion via `res.render()` in `/move/:dir/:file` and `/en/move/:dir/:file`
**Learning:** Never pass untrusted, user-supplied input directly to `res.render()` in Express, as it allows attackers to use dot-dot-slash `../` sequences to traverse outside the view directory, causing Local File Inclusion (LFI) or information disclosure. The express `res.render` checks view paths and falls back to require(), allowing arbitrary file inclusion and code execution.
**Prevention:** Implement strict whitelisting for view directories and validate filenames using a regex to ensure they only contain safe characters (e.g., `/^[a-zA-Z0-9_\-\.]+$/`).
