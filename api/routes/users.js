var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

// Register
router.get('/register', function (req, res) {
    res.render('register');
});

// Login
router.get('/login', function (req, res) {
    res.render('login');
});

// Register user
router.post('/register', function (req, res) {
    var email = req.body.email;
    var username = req.body.username;
    var phonenumber = req.body.phonenumber;
    var password = req.body.password;
    var password2 = req.body.password2;

    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();
    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        var newUser = new User({
            username: username,
            password: password,
            email: email,
            phonenumber: phonenumber
        })
        User.createUser(newUser, function (err, user) {
            if (err) throw err;
            console.log(user);
        });
        req.flash('success_msg', 'You have registered successfully!');
        res.redirect('/users/login');
    }
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, {
                    message: 'Unknown User'
                });
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid password'
                    });
                }
            });
        });
    }));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login',
        failureFlash: true
    }),
    function (req, res) {
        res.redirect('/');
    });

router.get('/logout', function (req, res) {
    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');
});

router.put('/updateSendMail', function(req, res){
    User.update({
        _id: req.user._id
    }, {
        isSendMail: req.body.isSendMail
    }, function(err, data){
        if(err){
            throw err;
        }else {
            res.json(data);
        }
    });
})

router.put('/updateSendSms', function(req, res){
    User.update({
        _id: req.user._id
    }, {
        isSendSms: req.body.isSendSms
    }, function(err, data){
        if(err){
            throw err;
        }else {
            res.json(data);
        }
    });
})

module.exports = router;