var express = require('express');
var router = express.Router();
var moment = require('moment');

require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

module.exports = ()=>{

    // models/*.js 파일이름이 객체 이름이 된다.
    const { tbl_auth } = require('../models')

    router.post('/check/bbs', function (req, res, next) {
        let loginCheck = false;

        tbl_auth.findOne({
            where : {w_id : 'admin'}
        })

            .then(function(record){
                if(record.w_passwd == req.body.w_passwd) loginCheck = true;

                if(loginCheck) {
                    res.render('contact/contact1_write.html',{"b_id":req.body.b_id})
                }else{
                    res.render('contact/contact1.html');
                }
            })
    })

    router.post('/check/ref', function (req, res, next) {
        let loginCheck = false;

        tbl_auth.findOne({
            where : {w_id : 'admin'}
        })

            .then(function(record){
                if(record.w_passwd == req.body.w_passwd) loginCheck = true;

                if(loginCheck) {
                    res.render('about/about4_write.html',{"b_id":req.body.b_id})
                }else{
                    res.render('about/about4.html');
                }
            })
    })


    return router;

}