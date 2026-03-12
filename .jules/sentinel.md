## 2026-02-12 - Hardcoded Secrets Removal
**Vulnerability:** Database credentials were hardcoded in `config/config.json` and committed to git, leaving sensitive production or development access info exposed to anyone with code access.
**Learning:** `config/config.json` is frequently required to exist for Sequelize to initialize. Simply deleting the file causes application startup crashes, whereas putting fallback logic (`process.env.DB_USERNAME || config.username`) in `models/index.js` while keeping generic placeholders in `config.json` resolves the vulnerability without breaking Sequelize initialization logic.
**Prevention:** Never hardcode credentials in JSON or JS files. Use `.env` files combined with `.gitignore` and load variables securely via `process.env`.
