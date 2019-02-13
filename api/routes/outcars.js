var express = require('express');
var router = express.Router();
var fs = require('fs');
var Nexmo = require('nexmo');
var nodemailer = require('nodemailer');

var Car = require('../models/car');
var Cost = require('../models/cost');
var Owner = require('../models/owner');
var Follow = require('../models/follow');
var Statistic = require('../models/statistic');

router.get('/', ensureAuthenticated, function (req, res) {
    res.render('outcar');
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

//sending mail
function sendMail(to, carNumberPlate) {
	var transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: 'example@gmail.com',
			pass: 'securepassword'
		}
	});

	var mailOptions = {
		from: 'example@gmail.com',
		to: to,
		subject: 'Cảnh báo xe theo dõi',
		text: 'Xe ' + carNumberPlate + ' mà bạn theo dõi vừa vào bến'
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
		} else {
			console.log('Email sent: ' + info.response);
		}
	});
}

function sendSms(carNumberPlate) {
	const Nexmo = require('nexmo')
	const nexmo = new Nexmo({
		apiKey: 'apiKey',
		apiSecret: 'apiSecret'
	})

	const from = 'Nexmo'
	const to = '123456789'
	const text = 'Xe ' + carNumberPlate + ' ma ban theo doi vua vao ben'

	nexmo.message.sendSms(from, to, text)
}

//kiem tra xe co trong ben ko
router.get('/checkCarIn', function (req, res) {
    Car.find({
        carNumberPlate: req.query.carOutNumberPlate,
        carOutTime: null
    }, function (err, data) {
        if (err) {
            throw err;
        } else {
            if (data.length != 0) {
                var hourPark = Math.ceil(Math.abs(new Date() - new Date(data[0].carInTime)) / 36e5);
                Cost.find(function (err, cost) {
                    if (err) {
                        throw err;
                    } else {
                        var fee = cost[0].costVal * hourPark;
                        //console.log(cost[0].costVal +' * '+hourPark+' = '+fee);
                        //res.json(fee);
                        Owner.findCarIsMonthly(req.query.carOutNumberPlate, function (err, data) {
                            if (err) {
                                throw err;
                            } else {
                                var isMonthly = data.length;
                                Follow.findCarIsFollow(req.query.carOutNumberPlate, function (err, data) {
                                    var isFollow = data.length;
                                    res.json({
                                        fee: fee,
                                        isMonthly: isMonthly,
                                        isFollow: isFollow,
                                        status: 1
                                    })
                                })
                            }
                        })
                    }
                })
            } else {
                res.json({
                    status: 0
                })
            }
            //res.json(data);
        }
    })
})

//cap nhat thong tin xe ra
router.put('/carout', function (req, res) {
    var imagePath = '/public/image/outcar' + req.body.carOutNumberPlate + new Date().toLocaleString() + '.jpg';
    //console.log(imagePath);
    Car.find({
        carOutTime: null,
        carNumberPlate: req.body.carOutNumberPlate
    }, function (err, data) {
        if (err) {
            throw err;
        } else {
            var buf = new Buffer(req.body.carOutImage, 'base64');
            fs.writeFile('.' + imagePath, buf);
            //console.log('===============>'+data);
            if (data[0].isFollow) {
                if (req.user.isSendSms) {
                    console.log('send sms to ' + req.body.carOutNumberPlate);
                    //Khi nao demo moi mang ra dung
                    //sendSms(req.body.carOutNumberPlate);
                }
                if (req.user.isSendMail) {
                    //console.log('send email to '+req.body.carOutNumberPlate);
                    sendMail(req.user.email, req.body.carOutNumberPlate);
                }
            }
            Car.findOneAndUpdate({
                _id: data[0]._id
            }, {
                carOutTime: new Date(),
                carOutImage: imagePath,
                fee: req.body.fee
            }, function (err, data) {
                if (err) {
                    throw err;
                } else {
                    //getListCar(req, res);
                    Statistic.find({
                        dateVal: new Date().toLocaleDateString()
                    }, function(err, data){
                        if(err){
                            throw err;
                        }else {
                            if(data.length != 0){
                                var revenueUpdate = Number(req.body.fee) + Number(data[0].revenue)
                                Statistic.update({
                                    dateVal: data[0].dateVal
                                }, {
                                    revenue: revenueUpdate
                                }, function(err, data){
                                    if(err){
                                        throw err;
                                    }else {
                                        getListCar(req, res);
                                    }
                                })
                            }else {
                                Statistic.create({
                                    dateVal: new Date().toLocaleDateString(),
                                    revenue: req.body.fee
                                }, function(err, data){
                                    if(err){
                                        throw err;
                                    }else {
                                        getListCar(req, res);
                                    }
                                })
                            }
                        }
                    })
                }
            })
        }
    })
})

//Lay danh sach xe ra
function getListCar(req, res) {
    Car.find({
        carOutTime: {
            $exists: true,
            $ne: null
        }
    },{},{
        sort: {
            carOutTime: 'DESC'
        }
    }, function (err, data) {
        if (err) {
            throw err;
        } else {
            Car.find({
                carOutTime: null
            },{},{
                carInTime: 'DESC'
            }, function (err, cars) {
                if (err) {
                    throw err;
                } else {
                    res.json({
                        carOut: data,
                        carIn: cars
                    });
                }
            })
        }
    });
}

router.get('/listCarOut', function (req, res) {
    getListCar(req, res);
})

module.exports = router;