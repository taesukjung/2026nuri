var express = require('express');
var router = express.Router();
var multer = require('multer');

const path = require('path');
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, 'public/uploads/');
        },
        filename: function (req, file, cb) {
            cb(null, new Date().valueOf() + path.extname(file.originalname));
        }
    }),
});
module.exports = ()=>{

    router.post('/image', upload.single('file'), function(req, res){
        console.log(req.file)
        res.send({
            url: "/uploads/"+req.file.filename
        })
    });

    return router;

}