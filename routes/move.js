var express = require('express');
var router = express.Router();

/* GET Move Target Page. */
router.get('/:dir/:file', function (req, res, next) {
    const dir = req.params.dir;
    const file = req.params.file;

    // Validate input to prevent path traversal (LFI)
    if (!/^[a-zA-Z0-9_-]+$/.test(dir) || !/^[a-zA-Z0-9_.-]+$/.test(file)) {
        return res.status(400).send('Invalid path parameters');
    }

    res.render(dir + "/" + file, {
        emailTo: req.query.emailTo
    });
});

module.exports = router;
