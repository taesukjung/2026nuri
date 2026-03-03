/**
 * Security Middleware: Prevents Path Traversal vulnerabilities
 * Enforces a directory whitelist and filename regex validation
 */
const validatePath = (req, res, next) => {
    const dir = req.params.dir;
    const file = req.params.file;

    // Strict whitelist of allowed view directories
    const allowedDirs = [
        'about', 'archive', 'business', 'company',
        'contact', 'layout', 'recruiting', 'solutions'
    ];

    if (!allowedDirs.includes(dir)) {
        return res.status(403).send("Forbidden: Invalid directory access");
    }

    // Validate filename to only allow safe characters and prevent path traversal
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(file) || file.includes('..')) {
        return res.status(400).send("Bad Request: Invalid filename");
    }

    next();
};

module.exports = validatePath;
