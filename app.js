var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

var indexRouter = require('./routes/index');
var moveRouter = require('./routes/move');
var usersRouter = require('./routes/users');
var mailRouter = require('./routes/mailController');
var bbsRouter = require('./routes/bbsController')(app);
var refRouter = require('./routes/refController')(app);
var uploadRouter = require('./routes/uploadController')(app);
var authRouter = require('./routes/authController')(app);

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
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/move', moveRouter);
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
/*
app.all('*', (req, res, next) =>
{
	let protocol = req.headers['x-forwarded-proto'] || req.protocol;
	if (protocol == 'https') { next(); }
	else {
		let from = `${protocol}://${req.hostname}${req.url}`;
		let to = `https://'${req.hostname}${req.url}`;
		// log and redirect
		console.log(`[${req.method}]: ${from} -> ${to}`);
		res.redirect(to);
	}
});
*/
app.get("*", function (req, res, next) {
    res.redirect("https://" + req.headers.host + "/" + req.path);
});

module.exports = app;
