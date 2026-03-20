## 2024-05-18 - Hardcoded SMTP Credentials in Mail Controller
**Vulnerability:** Found hardcoded plaintext SMTP credentials (`user` and `pass`) in `routes/mailController.js` inside the nodemailer configuration.
**Learning:** Email configurations, especially using popular libraries like `nodemailer`, are often prone to hardcoded secrets when initially set up for testing and then left in production.
**Prevention:** Always use environment variables for sensitive credentials (e.g., `process.env.SMTP_PASS`) and ensure they are loaded securely via libraries like `dotenv` or directly from the deployment environment. Add checks to tests to scan for hardcoded credentials.
