var mongoose = require('mongoose');
var bcrypt = require('bcryptjs')

var Schema = mongoose.Schema;

var userSchema = new Schema({
    username: {
        type: String
        //index: true
    },
    password: {
        type: String
    },
    phonenumber: {
        type: String
    },
    email: {
        type: String
    },
    isSendSms: {
        type: Boolean,
        default: false
    },
    isSendMail: {
        type: Boolean,
        default: false
    }
});

var User = mongoose.model("User", userSchema);
module.exports = User;

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}