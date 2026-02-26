var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var moment = require('moment');
var session = require('express-session');
var crypto = require('crypto');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

var app = express();

var indexRouter = require('./routes/index');
var enIndexRouter = require('./routes/enIndex');
var moveRouter = require('./routes/move');
var enMoveRouter = require('./routes/enMove');
var usersRouter = require('./routes/users');
var mailRouter = require('./routes/mailController');
var bbsRouter = require('./routes/bbsController')(app);
var refRouter = require('./routes/refController')(app);
var uploadRouter = require('./routes/uploadController')();
var authRouter = require('./routes/authController')();

var sequelize = require('./models/index').sequelize;
sequelize.sync()

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false,
        httpOnly: true
    }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/en', enIndexRouter);
app.use('/move', moveRouter);
app.use('/en/move', enMoveRouter);
app.use('/bbs', bbsRouter);
app.use('/ref', refRouter);
app.use('/upload', uploadRouter);
app.use('/auth', authRouter);
app.use('/mail', mailRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// redirect HTTP to HTTPS
app.get("*", function (req, res, next) {
    res.redirect("https://" + req.headers.host + "/" + req.path);
});

module.exports = app;
