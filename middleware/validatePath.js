const validatePath = (req, res, next) => {
    // Whitelist of allowed directories based on views/ folder structure
    const allowedDirs = [
        'about',
        'archive',
        'business',
        'company',
        'contact',
        'layout',
        'recruiting',
        'solutions'
    ];

    const { dir, file } = req.params;

    // Validate directory
    if (!allowedDirs.includes(dir)) {
        return res.status(403).send('Forbidden directory');
    }

    // Validate filename (allow alphanumeric, underscore, hyphen, and dot. NO slashes)
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(file)) {
        return res.status(400).send('Invalid filename');
    }

    next();
};

module.exports = validatePath;
