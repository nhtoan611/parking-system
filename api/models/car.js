var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var carSchema = new Schema({
    carNumberPlate: String,
    carInTime: Date,
    carOutTime: Date,
    carInImage: String,
    carOutImage: String,
    isFollow:{
        type: Boolean,
        default: false
    },
    fee: Number
})

var Car = mongoose.model("Car", carSchema);
module.exports = Car;

module.exports.updateFollow = function(carNumberPlate, isFollow, callback){
    Car.updateMany({
        carNumberPlate: carNumberPlate
    }, {
        isFollow: isFollow
    }, callback);
}
