const validatePath = (req, res, next) => {
    const allowedDirs = ['about', 'archive', 'business', 'company', 'contact', 'recruiting', 'solutions'];
    const dir = req.params.dir;
    const file = req.params.file;

    // Validate directory against whitelist
    if (!allowedDirs.includes(dir)) {
        console.error(`Blocked LFI attempt: Invalid directory '${dir}'`);
        return next(new Error('Page not found'));
    }

    // Validate filename (alphanumeric, dash, underscore, dot) - strictly no slashes
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(file)) {
        console.error(`Blocked LFI attempt: Invalid filename '${file}'`);
        return next(new Error('Page not found'));
    }

    // Prevent double dot traversal just in case regex misses something (defense in depth)
    if (file.includes('..')) {
        console.error(`Blocked LFI attempt: Double dot in filename '${file}'`);
        return next(new Error('Page not found'));
    }

    next();
};

module.exports = validatePath;
