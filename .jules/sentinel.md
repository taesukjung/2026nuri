## 2024-05-24 - [Hardcoded SMTP credentials regression]
**Vulnerability:** Hardcoded SMTP email address and password were found in `routes/mailController.js` and have been replaced with environment variables `process.env.SMTP_USER` and `process.env.SMTP_PASS`.
**Learning:** Hardcoding credentials makes them accessible to anyone who has access to the codebase, which could lead to unauthorized access and abuse. The regression occurred because the previous fix was either lost or reverted.
**Prevention:** Using environment variables `process.env.SMTP_USER` and `process.env.SMTP_PASS` properly configures the secrets on the server and ensures they are not tracked in the source code. A regression test `test/test_mail_secrets.js` has been added to ensure this vulnerability does not happen again.
