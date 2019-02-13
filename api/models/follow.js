var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var followSchema = new Schema({
    carNumberPlate: {
        type: String,
        unique: true
    }
})

var Follow = mongoose.model("Follow", followSchema);
module.exports = Follow;

module.exports.createCarFl =function(newCarFl, callback){
    Follow.create(newCarFl, callback);
}

module.exports.deleteCarFl = function(carNumberPlate, callback){
    Follow.remove({
        carNumberPlate: carNumberPlate
    }, callback);
}

module.exports.findCarIsFollow = function(carNumberPlate, callback){
    Follow.find({
        carNumberPlate: carNumberPlate
    }, callback);
}