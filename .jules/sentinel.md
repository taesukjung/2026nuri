# Sentinel Journal

## 2024-03-14 - Hardcoded Database Credentials in config.json
**Vulnerability:** Found hardcoded plaintext database credentials (username, password, IP) in `config/config.json` used by Sequelize, which leaks sensitive infrastructure information in version control.
**Learning:** `config.json` was generated directly by Sequelize-CLI, and by default, developers may forget to replace the initial configurations with dynamic environment-variable fallbacks for database initialization before committing.
**Prevention:** Avoid placing real secrets directly into configuration files; rely on fallback chains using `process.env.DB_PASSWORD || config.password` combined with local/CI secrets (e.g. `.env` via `dotenv` or Docker secrets). Also, add test scripts asserting hardcoded secrets aren't present in specific files.