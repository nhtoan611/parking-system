var express = require('express');
var router = express.Router();
var fs = require('fs');
var Nexmo = require('nexmo');
var nodemailer = require('nodemailer');

var Car = require('../models/car');
var Follow = require('../models/follow');

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

// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
	res.render('index');
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

//get list car in for create - update -delete
function getListCarIn(res){
	Car.find({
		carOutTime: null
	},{},{
		sort: {
			carInTime: 'DESC'
		}
	}, function (err, cars) {
		if (err) {
			throw err;
		} else {
			res.json(cars);
		}
	})
}

//create new car in
router.post('/carin', function (req, res) {
	var imagePath = '/public/image/incar' + req.body.carInNumberPlate + new Date().toLocaleString() + '.jpg';
	var newCar = {
		carNumberPlate: req.body.carInNumberPlate,
		carInTime: new Date(),
		carInImage: imagePath,
		isFollow: false
	}
	Follow.findCarIsFollow(req.body.carInNumberPlate, function (err, data) {
		//console.log(req.body.carInNumberPlate + ': ' + data.length);
		if (err) {
			throw err;
		} else {
			if (data.length != 0) {
				newCar.isFollow = true;
			}
			var buf = new Buffer(req.body.carInImage, 'base64');
			fs.writeFile('.' + imagePath, buf);
			//console.log(req.body);
			Car.create(newCar, function (err, newCar) {
				//console.log('send sms: '+req.user.isSendSms+' send email: '+req.user.isSendMail);
				if (err) {
					throw err;
				} else {
					if(req.user.isSendSms && newCar.isFollow){
						console.log('send sms to '+req.body.carInNumberPlate);
						//Khi nao demo moi mang ra dung
						//sendSms(req.body.carInNumberPlate);
					}
					if(req.user.isSendMail && newCar.isFollow){
						//console.log('send email to '+req.body.carInNumberPlate);
						sendMail(req.user.email, req.body.carInNumberPlate);
					}
					getListCarIn(res);
				}
			})		
		}
	})

})

//get list car in
router.get('/listCarIn', function (req, res) {
	getListCarIn(res);
})

//get car in detail
router.get('/carInDetail', function (req, res) {
	Car.findById({
		_id: req.query.id
	}, function (err, data) {
		if (err) {
			throw err;
		} else {
			res.json(data);
		}
	})
})

//update car in
router.put('/carInUpdate', function (req, res) {
	//console.log(req.body.id+' '+req.body.carNumberPlateDt);
	Follow.findCarIsFollow(req.body.carNumberPlateDt, function (err, data){
		if(err){
			throw err;
		}else {
			if (data.length != 0){
				Car.update({
					_id: req.body.id
				}, {
					carNumberPlate: req.body.carNumberPlateDt,
					isFollow: true
				}, function (err, data) {
					if (err) {
						throw err;
					} else {
						//res.json(data);
						getListCarIn(res);
					}
				})
			}else {
				Car.update({
					_id: req.body.id
				}, {
					carNumberPlate: req.body.carNumberPlateDt,
					isFollow: false
				}, function (err, data) {
					if (err) {
						throw err;
					} else {
						//res.json(data);
						getListCarIn(res);
					}
				})
			}
		}
	})
	
})

//update car follow
router.put('/carInFlUpdate', function (req, res) {
	var carNumberPlate = req.body.carNumberPlate;
	var isFollow = req.body.isFollow;
	//console.log(carNumberPlate+ '  '+isFollow);
	//Update in follows Collection
	if (isFollow == 'true') {
		var newCarFl = {
			carNumberPlate: carNumberPlate
		};
		Follow.createCarFl(newCarFl, function (err, data) {
			if (err) {
				throw err;
			}
		})
	} else {
		Follow.deleteCarFl(carNumberPlate, function (err, data) {
			if (err) {
				throw err;
			}
		})
	}

	//Update in cars collection
	Car.updateFollow(carNumberPlate, isFollow, function (err, data) {
		if (err) {
			throw err;
		} else {
			res.json(data);
		}
	});
})

//get car by numberplate
router.get('/getCarByNumberplate', function(req, res){
	Car.find({
		carNumberPlate: req.query.carNumberPlate
	}, function(err, data){
		if(err){
			throw err;
		}else {
			res.json(data);
		}
	})
})
module.exports = router;