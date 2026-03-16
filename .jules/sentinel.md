## 2025-03-16 - Hardcoded Database Credentials in Config File
**Vulnerability:** The `config/config.json` file contained hardcoded database credentials (username, password, database name, and host) for development, test, and production environments, which could be exposed if the source code was leaked or compromised.
**Learning:** Hardcoding secrets directly in configuration files instead of using environment variables is a common architectural oversight when quickly scaffolding applications. It makes configuration difficult across environments and risks exposing credentials in version control.
**Prevention:** Always use environment variables (`process.env.DB_PASSWORD`, etc.) to inject sensitive credentials into configuration files or application logic at runtime.
