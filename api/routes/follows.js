var express = require('express');
var router = express.Router();

var Follow = require('../models/follow');
var Car = require('../models/car');

router.get('/', ensureAuthenticated, function (req, res) {
    res.render('follow');
})

//check login
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/users/login');
    }
}

function getListCarFl(req, res){
    Follow.find(function (err, data) {
        if (err) {
            throw err;
        } else {
            //res.json(data);
            res.json({
                data: data,
                isSendMail: req.user.isSendMail,
                isSendSms: req.user.isSendSms 
            });
        }
    })
}

//create new follow car
router.post('/followcar', function (req, res) {
    //console.log(req.body.carNumberPlate);
    var newCarFl = {
        carNumberPlate: req.body.carNumberPlate
    };
    //create in follows collection
    Follow.createCarFl(newCarFl, function (err, data) {
        if (err) {
            throw err;
        } else {
            //create in cars collection
            Car.updateFollow(req.body.carNumberPlate, true, function (err, data) {
                if (err) {
                    throw err;
                } else {
                    // console.log('ok');
                    getListCarFl(req, res);
                }
            });
        }
    });
})

//Get follow car detail
router.get('/followcarDetail', function (req, res) {
    //console.log(req.query.carNumberPlate);
    Follow.find({
        carNumberPlate: req.query.carNumberPlate
    }, function (err, data) {
        //console.log(data.length);
        if (err) {
            throw err;
        } else {
            res.json(data);
        }
    })
})

//Get List follow car
router.get('/listCarFl', function (req, res) {
    getListCarFl(req, res);
})

//delete follow car
router.delete('/dltCarFl', function (req, res) {
    //delete in follows collection
    Follow.deleteCarFl(req.body.carNumberPlate, function (err, data) {
        if (err) {
            throw err;
        } else {
            //delete in cars collection
            Car.updateFollow(req.body.carNumberPlate, false, function (err, data) {
                if (err) {
                    throw err;
                } else {
                    getListCarFl(req, res);
                }
            })
        }
    })

})

//kiem tra xe vao co theo doi ko (xe ra dung cai khac)
router.get('/carIsFollow', function(req, res){
    //console.log(req.query.carNumberPlate);
    Follow.findCarIsFollow(req.query.carNumberPlate, function(err, data){
        if(err){
            throw err;
        } else{
            res.json(data);
        }
    })
})
module.exports = router;