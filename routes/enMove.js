var express = require('express');
var router = express.Router();
var createError = require('http-errors');

/* GET Move Target Page. */
router.get('/:dir/:file', function(req, res, next) {
    const { dir, file } = req.params;

    // Allowed directories under views/en/
    const ALLOWED_DIRS = ['about', 'business', 'contact', 'recruiting'];

    // Security check: Validate directory against whitelist
    if (!ALLOWED_DIRS.includes(dir)) {
        return next(createError(404));
    }

    // Security check: Validate filename (alphanumeric, dot, underscore, hyphen)
    // prevent path traversal (..) and invalid characters
    if (!/^[a-zA-Z0-9_\-\.]+$/.test(file) || file.includes('..')) {
        return next(createError(404));
    }

    res.render("en/" + dir + "/" + file, {
        emailTo: req.query.emailTo
    })
});

module.exports = router;
