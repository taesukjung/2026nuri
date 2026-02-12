var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index.html', { title: '누리인포스' })
});

/* GET dashboard page. */
router.get('/dashboard', function (req, res, next) {
    res.render('dashboard.html', { title: '유니베라 멤버스룸 - 대시보드' })
});

/* GET landing page. */
router.get('/landing', function (req, res, next) {
    res.render('landing.html', { title: 'NURIINFOS - 혁신을 현실로, 스마트 ICT의 새 기준' })
});

/* GET company history page. */
router.get('/company/history', function (req, res, next) {
    res.render('company/history.html', { title: '연혁 - NURIINFOS' })
});

/* GET company introduction page. */
router.get('/company/introduction', function (req, res, next) {
    res.render('company/introduction.html', { title: '회사소개 - NURIINFOS' })
});

/* GET company location page. */
router.get('/company/location', function (req, res, next) {
    res.render('company/location.html', { title: '오시는 길 - NURIINFOS' })
});

/* GET company careers page. */
router.get('/company/careers', function (req, res, next) {
    res.render('company/careers.html', { title: '인재채용 - NURIINFOS' })
});

/* GET business retail page. */
router.get('/business/retail', function (req, res, next) {
    res.render('business/retail.html', { title: '스마트 유통 - NURIINFOS' })
});

/* GET business public page. */
router.get('/business/public', function (req, res, next) {
    res.render('business/public.html', { title: '지능형 공공 - NURIINFOS' })
});

/* GET business cloud page. */
router.get('/business/cloud', function (req, res, next) {
    res.render('business/cloud.html', { title: '클라우드 인프라 - NURIINFOS' })
});

/* GET contact inquiry page. */
router.get('/contact/inquiry', function (req, res, next) {
    res.render('contact/inquiry.html', { title: '문의하기 - NURIINFOS', emailTo: req.query.emailTo || '' })
});

/* GET contact support page. */
router.get('/contact/support', function (req, res, next) {
    res.render('contact/support.html', { title: '기술지원 - NURIINFOS' })
});

/* GET archive casestudy page. */
router.get('/archive/casestudy', function (req, res, next) {
    res.render('archive/casestudy.html', { title: '구축사례 - NURIINFOS' })
});

/* GET solutions anyworks page. */
router.get('/solutions/anyworks', function (req, res, next) {
    res.render('solutions/anyworks.html', { title: '스마트유통 - NURIINFOS' })
});

/* GET notice page. */
router.get('/archive/notice', function (req, res, next) {
    res.render('archive/notice.html', { title: '공지사항 - NURIINFOS' })
});

/* GET privacy policy page. */
router.get('/archive/policy', function (req, res, next) {
    res.render('archive/policy.html', { title: '개인정보처리방침 - NURIINFOS' })
});

module.exports = router;
