var express = require('express');
var router = express.Router();


module.exports = () => {

    // models/*.js 파일이름이 객체 이름이 된다.
    const { tbl_auth } = require('../models')

    const checkAdmin = (req) => {
        return tbl_auth.findOne({
            where: { w_id: 'admin' }
        })
            .then(function (record) {
                return record && record.w_passwd == req.body.w_passwd;
            });
    };

    router.post('/check/bbs', function (req, res, next) {
        checkAdmin(req)
            .then(function (loginCheck) {
                if (loginCheck) {
                    req.session.regenerate(function (err) {
                        req.session.isAdmin = true;
                        res.render('contact/contact1_write.html', { "b_id": req.body.b_id })
                    });
                } else {
                    res.render('contact/contact1.html');
                }
            })
            .catch(next);
    })

    router.post('/check/ref', function (req, res, next) {
        checkAdmin(req)
            .then(function (loginCheck) {
                if (loginCheck) {
                    req.session.regenerate(function (err) {
                        req.session.isAdmin = true;
                        res.render('about/about4_write.html', { "b_id": req.body.b_id })
                    });
                } else {
                    res.render('about/about4.html');
                }
            })
            .catch(next);
    })

    router.post('/check/casestudy', function (req, res, next) {
        checkAdmin(req)
            .then(function (loginCheck) {
                if (loginCheck) {
                    req.session.regenerate(function (err) {
                        req.session.isAdmin = true;
                        res.render('archive/casestudy-write.html', { "b_id": req.body.b_id })
                    });
                } else {
                    res.render('archive/casestudy.html');
                }
            })
            .catch(next);
    })

    router.post('/check/notice', function (req, res, next) {
        checkAdmin(req)
            .then(function (loginCheck) {
                if (loginCheck) {
                    req.session.regenerate(function (err) {
                        req.session.isAdmin = true;
                        res.render('archive/notice-write.html', { "b_id": req.body.b_id })
                    });
                } else {
                    res.render('archive/notice.html');
                }
            })
            .catch(next);
    })


    return router;

}