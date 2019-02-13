var express = require('express');
var router = express.Router();

var Cost = require('../models/cost');
var Statistic = require('../models/statistic');

router.get('/', ensureAuthenticated, function (req, res) {
    res.render('statistic');
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

//get cost value
function getListCost(req, res){
    Cost.find(function(err, data){
        if(err){
            throw err;
        }else {
            res.json(data);
        }
    })
}

router.get('/getCostVal', function(req, res){
    getListCost(req, res);
})

//update cost value
router.put('/updateCostVal', function(req, res){
    Cost.findOneAndUpdate({
        _id: req.body.id
    }, {
        costVal: req.body.costVal
    }, function(err, data){
        if(err){
            throw err;
        }else {
            getListCost(req, res);
        }
    })
})

//get statistic
router.get('/listStt', function(req, res){
    Statistic.find(function(err, data){
        if(err){
            throw err;
        }else {
            res.json(data);
        }
    })
})

module.exports = router;