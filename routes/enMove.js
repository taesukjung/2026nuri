var express = require('express');
var router = express.Router();

/* GET Move Target Page. */
router.get('/:dir/:file', function(req, res, next) {
    // Validate dir and file to prevent path traversal (LFI)
    if (!/^[a-zA-Z0-9_-]+$/.test(req.params.dir) || !/^[a-zA-Z0-9_.-]+$/.test(req.params.file)) {
        return res.status(400).send('Invalid directory or file path.');
    }
    res.render("en/" + req.params.dir + "/" + req.params.file, {
        emailTo: req.query.emailTo
    })
});

module.exports = router;
