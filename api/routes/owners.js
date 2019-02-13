var express = require('express');
var router = express.Router();

var Owner = require('../models/owner');
var Car = require('../models/car');

//render monthly car page
router.get('/', ensureAuthenticated, function (req, res) {
    res.render('owner');
});

//check login
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('error_msg', 'You are not logged in');
        res.redirect('/users/login');
    }
}

function getListOwner(res){
    Owner.find(function (err, data) {
        if (err) {
            throw err;
        } else {
            res.json(data);
        }
    })
}

//create new owner 
router.post('/add', function (req, res) {
    newOwner = {
        ownerName: req.body.ownerName,
        ownerPhoneNumber: req.body.ownerPhoneNumber,
        carNumberPlate: req.body.carNumberPlate
    };
    Owner.create(newOwner, function (err, data) {
        if (err) {
            throw err;
        } else {
            getListOwner(res);
        }
    })
});

//get list owner
router.get('/listOwner', function (req, res) {
    getListOwner(res);
});

//delete owner 
router.delete('/dltOwner', function (req, res) {
    Owner.remove({
        _id: req.body.id
    }, function (err, data) {
        if (err) {
            throw err;
        } else {
            getListOwner(res);
        }
    })
})

//update owner
router.put('/updateOwner', function (req, res) {
    Owner.findOneAndUpdate({
        _id: req.body.id
    }, {
        ownerName: req.body.ownerName,
        ownerPhoneNumber: req.body.ownerPhoneNumber,
        carNumberPlate: req.body.carNumberPlate
    }, function(err, data){
        if(err){
            throw err;
        }else {
            getListOwner(res);
        }
    })
})

//check car is monthly car
router.get('/checkOwner', function(req, res){
    Owner.find({
        carNumberPlate: req.query.carOutNumberPlate
    }, function(err, data){
        if(err){
            throw err;
        }else {
            res.json(data);
        }
    })
})
module.exports = router;