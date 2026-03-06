var express = require('express');
var router = express.Router();

/* GET Move Target Page. */
router.get('/:dir/:file', function(req, res, next) {
    const dir = req.params.dir;
    const file = req.params.file;

    // Strict regex validation to prevent path traversal (LFI)
    // Only allow alphanumeric characters, underscores, and hyphens for directory
    const dirRegex = /^[a-zA-Z0-9_-]+$/;
    // Allow alphanumeric characters, underscores, hyphens, and dots for file
    const fileRegex = /^[a-zA-Z0-9_.-]+$/;

    if (!dirRegex.test(dir) || !fileRegex.test(file)) {
        return res.status(400).send("Bad Request: Invalid path parameters");
    }

    res.render("en/" + dir + "/" + file, {
        emailTo: req.query.emailTo
    });
});

module.exports = router;
