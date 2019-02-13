var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var mongoose = require('mongoose');
var Nexmo = require('nexmo');
var nodemailer = require('nodemailer');

var config = require("./config");

var routes = require('./api/routes/index');
var userRoutes = require('./api/routes/users');
var followRoutes = require('./api/routes/follows');
var ownerRoutes = require('./api/routes/owners');
var outcarRoutes = require('./api/routes/outcars');
var statisticRoutes = require('./api/routes/statistics');

//connect db
mongoose.connect(config.getDbConnectionString(), {
  useNewUrlParser: true
});

var app = express();
var port = process.env.PORT || 3000;

app.use("/public", express.static(__dirname + "/public"));
// đọc dữ liệu ng dùng gửi lên là json
app.use(bodyParser.json());
// đọc dữ liệu ng dùng gửi lên là data form
app.use(bodyParser.json({
  limit: '50mb'
}));
app.use(bodyParser.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(cookieParser());

app.use(morgan("dev"));

app.set("view engine", "ejs");

// Express Session
app.use(session({
  secret: 'secret',
  saveUninitialized: true,
  resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function (param, msg, value) {
    var namespace = param.split('.'),
      root = namespace.shift(),
      formParam = root;

    while (namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});

app.use('/', routes);
app.use('/users', userRoutes);
app.use('/follows', followRoutes);
app.use('/owners', ownerRoutes);
app.use('/outcars', outcarRoutes);
app.use('/statistics', statisticRoutes);

var server = require("http").Server(app);
var io = require("socket.io")(server);
server.listen(port);

io.on("connection", function (socket) {
  console.log("co ng ket noi: " + socket.id);

  socket.on("disconnect", function () {
    console.log(socket.id + " ngat ket noi");
  })

  socket.on("csd", function (data) {
    io.sockets.emit("ssd", data);
  })

  socket.on("csdout", function (data) {
    io.sockets.emit("ssdout", data);
  })

})