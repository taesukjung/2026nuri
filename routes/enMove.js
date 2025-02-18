var express = require('express');
var router = express.Router();

/* GET Move Target Page. */
router.get('/:dir/:file', function(req, res, next) {
    res.render("en/" + req.params.dir + "/" + req.params.file, {
        emailTo: req.query.emailTo
    })
});

module.exports = router;
