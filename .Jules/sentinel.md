## 2025-05-15 - Hardcoded Database Credentials in Config
**Vulnerability:** Hardcoded production database credentials (password, host) found in `config/config.json`.
**Learning:** The project used the default Sequelize `config.json` pattern but failed to exclude it from version control or use environment variables, exposing critical infrastructure secrets.
**Prevention:** Always initialize projects with a `.gitignore` that includes config files with secrets. Prefer `config.js` using `process.env` over static `config.json` for database configuration to enforce environment variable usage.
