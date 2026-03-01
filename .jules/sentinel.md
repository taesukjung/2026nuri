## 2024-03-01 - [Hardcoded SMTP Credentials]
**Vulnerability:** Found hardcoded SMTP host, port, username, and password directly within `routes/mailController.js`.
**Learning:** Hardcoded credentials are a critical security risk as they could allow unauthorized access to the email account and compromise its use for phishing or spam. This project's setup did not utilize a unified mechanism for standard app configurations such as SMTP credentials at the controller level.
**Prevention:** Always use environment variables for configuring sensitive credentials and ensure `.env` is ignored by version control. We should always use the `process.env` pattern to protect this information, as implemented.
