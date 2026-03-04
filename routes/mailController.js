const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// 🛡️ Sentinel: Removed hardcoded SMTP credentials to prevent secret leakage.
// Now relies on environment variables for secure configuration.
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || 'mail.nis.co.kr',
    port: process.env.MAIL_PORT || '465',
    secure: process.env.MAIL_SECURE !== 'false', // defaults to true
    auth: {
       user: process.env.MAIL_USER || 'admin@nis.co.kr',
       pass: process.env.MAIL_PASS || 'default_pass_needs_override'
    }
});

router.post("/sendMail", function(req, res, next){
    let emailTo = req.body.div; 	//메일 담당자 

    let content = "";
    content +=
        "회사이름: " + req.body.companyNm + "\n" +
        "담당자성함: " + req.body.empNm + "\n" +
        "직책: " + req.body.position + "\n" +
        "전화번호: " + req.body.telNo + "\n" +
        "이메일: " + req.body.email + "\n" +
      //  "유형구분: " + req.body.div + "\n" +
        "------------------------------------------ \n\n" +
        req.body.content +
        "";

    console.log("mail emailTo : "+ emailTo);
    let mailOptions = {
        from: process.env.MAIL_USER || 'admin@nis.co.kr',
        to: emailTo ,
        subject: '누리인포스 홈페이지에서 문의사항이 등록되었습니다.',
        text: content
    };

    console.log("mail mailOptions : "+ mailOptions);
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log(error);
        }
        else {
            console.log('Email sent: ' + info.response);
        }
    });

    res.redirect("/");
})

module.exports = router;