var express = require('express');
var router = express.Router();

/* GET Move Target Page. */
router.get('/:dir/:file', function (req, res, next) {
    const dirRegex = /^[a-zA-Z0-9_-]+$/;
    const fileRegex = /^[a-zA-Z0-9_.-]+$/;

    if (!dirRegex.test(req.params.dir) || !fileRegex.test(req.params.file)) {
        return res.status(400).send('Invalid path');
    }

    res.render(req.params.dir + "/" + req.params.file, {
        emailTo: req.query.emailTo
    })
});

module.exports = router;
