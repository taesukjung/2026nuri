var express = require('express');
var router = express.Router();
var moment = require('moment');
var sequelize = require('sequelize');

require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

module.exports = (app)=>{

// 페이지네이션을 처리하기 위한 middleware
// https://github.com/expressjs/express-paginate
    var paginate = require('express-paginate');

    app.use(paginate.middleware(10, 50));

    // models/*.js 파일이름이 객체 이름이 된다.
    const { tbl_bbs } = require('../models')

    router.all(function (req, res, next) {
        // set default or minimum is 10 (as it was prior to v0.2.0)
        if (req.query.limit <= 10) req.query.limit = 10;
        // if (req.query.page < 1) req.query.page = 1;
        next();
    });

    const pageLimit = 10; //페이지에 보여줄 갯수

    router.get('/list', function (req, res, next) {
        const Op = sequelize.Op;
        let search_text = req.query.search_text;
        let b_category = req.query.b_category;

        if(typeof search_text == "undefined") search_text = "";
        if(typeof b_category == "undefined") b_category = "";

        let offset = (req.query.b_page- 1) * pageLimit
        if(offset < 1) offset = 0
        console.log('offset :' + offset)
        tbl_bbs.findAndCountAll({
            order: [['b_date', 'DESC'], ['b_time', 'DESC']],
            limit: pageLimit,
            offset: offset, // (Math.ceil((req.query.page - 1) / pageLimit))
            where: {
                b_subject: {
                    [Op.like]: '%'+search_text+'%'
                },
                b_category: {
                    [Op.like]: '%'+b_category+'%'
                }
            }
        })
            .then(function (result) {

                // pagination을 구현하기 위한 배열 생성
                // .getArrayPages(limit, pageCount, currentPage)
                // 선택된 페이지를 중심으로 좌우로 limite 개수 만큼 페이지 번호 나열
                let pageCount = Math.ceil(result.count / pageLimit);
                //let pageCount = 5;
                
               

                const pageArray = paginate.getArrayPages(req)(pageLimit, pageCount,req.query.b_page)
                
                if(pageCount > 10){
                	if(pageArray[0].number != 1){
                		if(pageCount >= Math.ceil(req.query.b_page)+5){
                			pageCount = Math.ceil(req.query.b_page)+5;
                		}
                	}else{
                		pageCount = 10;
                	}
                }
                
                res.send({
                    result:true,
                    BBS_LIST: result.rows,
                    pageCount,
                    itemCount: result.count,
                    currentPage: req.query.b_page,
                    pages: pageArray,
                    category: b_category
                })
            })

        return router
    });

    /* POST insert */
    router.post('/insert', function (req, res, next) {
        tbl_bbs.create({
            // req.body

            b_id: 0,
            b_category: req.body.b_category,
            b_date: req.body.b_date,
            b_time: moment().format('HH:mm:ss'),
            b_writer: 'ADMIN',
            b_subject: req.body.b_subject,
            b_text: req.body.b_text
        })
            .then(result => {
                tbl_bbs.count({},function(result){
                    console.log("INSERT : " + result)
                })
                tbl_bbs.findAll({ order: [['b_id', 'DESC']] })
                    .then(function (result) {
                        // res.send(result)
                        res.render('contact/contact1.html');
                    })

            });
    });

    router.get('/view', function (req, res, next) {
        let b_id = req.query.b_id

        tbl_bbs.findOne({
            where : {b_id : b_id}

        })
            .then(function(record){

                // 조회수 update
                tbl_bbs.update(
                    {
                        b_count : record.b_count + 1
                    },
                    {where : {b_id : b_id}
                    }).
                then(function(result){
                    record.b_text = record.b_text.replace(/\n/g, "").replace(/&nbsp;/g, " ");
                    console.log("record :: "+record.b_text);
                    res.render('contact/contact1_view.html',{bbs:record})
                })
            })
            .catch(function (err) {
                res.json(err)
            });

    })

    router.post('/update', function (req, res, next) {

        let b_id = req.body.b_id
        tbl_bbs.update(
            {
                b_category: req.body.b_category,
                b_date: req.body.b_date,
                b_time: moment().format('HH:mm:ss'),
                b_writer: 'ADMIN',
                b_subject: req.body.b_subject,
                b_text: req.body.b_text
            },
            {where : {b_id : b_id}
            })
            .then(function(result){
                // res.send(result)
                res.render('contact/contact1.html')
            })
    })

    router.post('/delete', function (req, res, next) {

        let b_id = req.body.b_id
        tbl_bbs.destroy({
            where : {b_id : b_id}
        })
            .then(function(result){
                // res.send(result)
                res.render('contact/contact1.html')

            })
    })

    router.get('/getContent', function (req, res, next) {
        tbl_bbs.findAndCountAll({
            where : {b_id : req.query.b_id}
        })
            .then(function(result){
                res.send({
                    BBS_LIST: result.rows
                })
            })
    })

    return router;

}