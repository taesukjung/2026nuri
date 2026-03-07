## 2024-05-18 - Fix hardcoded SMTP secrets
**Vulnerability:** Hardcoded SMTP credentials and configuration found in `routes/mailController.js`. The credentials `admin@nis.co.kr` and `k5s#fscyqB` were stored in plaintext within the source code.
**Learning:** Hardcoding sensitive information such as SMTP credentials in the source code exposes them to anyone who has access to the codebase, including version control systems.
**Prevention:** Sensitive information and environment-specific configuration should be stored in environment variables (`process.env.MAIL_HOST`, `process.env.MAIL_PORT`, `process.env.MAIL_USER`, `process.env.MAIL_PASS`).
