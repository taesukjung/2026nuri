var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');

module.exports = (app) => {

    // 페이지네이션을 처리하기 위한 middleware
    // https://github.com/expressjs/express-paginate
    var paginate = require('express-paginate');

    app.use(paginate.middleware(10, 50));

    // models/*.js 파일이름이 객체 이름이 된다.
    const { tbl_ref } = require('../models')

    router.all(function (req, res, next) {
        // set default or minimum is 10 (as it was prior to v0.2.0)
        if (req.query.limit <= 10) req.query.limit = 10;
        // if (req.query.page < 1) req.query.page = 1;
        next();
    });

    const pageLimit = 10;

    router.get('/list', function (req, res, next) {
        const Op = sequelize.Op;
        let b_category = req.query.b_category;
        let b_sector = req.query.b_sector;

        if (typeof b_category == "undefined") b_category = "";
        if (typeof b_sector == "undefined") b_sector = "";

        let offset = (req.query.b_page - 1) * pageLimit
        if (offset < 1) offset = 0
        console.log('오프셋 :' + offset)
        tbl_ref.findAndCountAll({
            attributes: [
                [sequelize.literal("CASE WHEN b_sector = '1' THEN '제조/유통'" +
                    "WHEN b_sector = '2' THEN '금융'" +
                    "WHEN b_sector = '3' THEN '서비스'" +
                    "ELSE '공공' END"), 'b_sector'],
                "b_category", "b_date", "b_client", "b_text", "b_id"
            ],
            order: [['b_date', 'DESC'], ['b_id', 'DESC']],
            limit: pageLimit,
            offset: offset, // (Math.ceil((req.query.page - 1) / pageLimit))
            where: {
                b_category: {
                    [Op.like]: '%' + b_category + '%'
                },
                b_sector: {
                    [Op.like]: '%' + b_sector + '%'
                }
            }
        })
            .then(function (result) {

                // pagination을 구현하기 위한 배열 생성
                // .getArrayPages(limit, pageCount, currentPage)
                // 선택된 페이지를 중심으로 좌우로 limite 개수 만큼 페이지 번호 나열
                let pageCount = Math.ceil(result.count / pageLimit);
                const pageArray = paginate.getArrayPages(req)(pageLimit, pageCount, req.query.b_page)

                if (pageCount > 10) {
                    if (pageArray[0].number != 1) {
                        if (pageCount >= Math.ceil(req.query.b_page) + 5) {
                            pageCount = Math.ceil(req.query.b_page) + 5;
                        }
                    } else {
                        pageCount = 10;
                    }
                }

                res.send({
                    result: true,
                    REF_LIST: result.rows,
                    pageCount,
                    itemCount: result.count,
                    currentPage: req.query.b_page,
                    pages: pageArray,
                    category: b_category,
                    sector: b_sector
                })
            })

        return router
    });

    /* POST insert */
    router.post('/insert', function (req, res, next) {
        tbl_ref.create({
            // req.body
            b_id: 0,
            b_category: req.body.b_category,
            b_date: req.body.b_date,
            b_sector: req.body.b_sector,
            b_client: req.body.b_client,
            b_text: req.body.b_text
        })
            .then(result => {
                tbl_ref.count({}, function (result) {
                    console.log("INSERT : " + result)
                })
                res.redirect('/move/archive/casestudy.html');
            });
    });

    router.post('/update', function (req, res, next) {

        let b_id = req.body.b_id
        tbl_ref.update(
            {
                b_category: req.body.b_category,
                b_date: req.body.b_date,
                b_sector: req.body.b_sector,
                b_client: req.body.b_client,
                b_text: req.body.b_text
            },
            {
                where: { b_id: b_id }
            })
            .then(function (result) {
                // res.send(result)
                res.redirect('/move/archive/casestudy.html');
            })
    })

    router.post('/delete', function (req, res, next) {

        let b_id = req.body.b_id
        tbl_ref.destroy({
            where: { b_id: b_id }
        })
            .then(function (result) {
                // res.send(result)
                res.redirect('/move/archive/casestudy.html');
            })
    })


    router.get('/getContent', function (req, res, next) {
        tbl_ref.findAll({
            where: { b_id: req.query.b_id }
        })
            .then(function (result) {
                res.send({
                    REF_LIST: result
                })
            })
    })

    router.get('/write', function (req, res, next) {
        let b_id = req.query.b_id;
        if (typeof b_id == "undefined") b_id = "";

        res.render('archive/casestudy-write.html', {
            b_id: b_id
        });
    });

    return router;

}