const ALLOWED_DIRS = ['about', 'archive', 'business', 'company', 'contact', 'layout', 'solutions'];

const validatePath = (req, res, next) => {
    const dir = req.params.dir;
    const file = req.params.file;

    // Validate directory against allowlist
    if (!ALLOWED_DIRS.includes(dir)) {
        return res.status(404).send('Not Found');
    }

    // Validate filename format (prevent directory traversal)
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(file) || file.includes('..')) {
        return res.status(404).send('Not Found');
    }

    next();
};

module.exports = validatePath;
