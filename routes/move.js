var express = require('express');
var router = express.Router();

/* GET Move Target Page. */
router.get('/:dir/:file', function (req, res, next) {
    const dir = req.params.dir;
    const file = req.params.file;

    // Validate dir and file to prevent Path Traversal (LFI)
    const safeDirRegex = /^[a-zA-Z0-9_-]+$/;
    const safeFileRegex = /^[a-zA-Z0-9_.-]+$/;

    if (!safeDirRegex.test(dir) || !safeFileRegex.test(file)) {
        return res.status(400).send('Bad Request: Invalid path parameters');
    }

    res.render(dir + "/" + file, {
        emailTo: req.query.emailTo
    });
});

module.exports = router;
