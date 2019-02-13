var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var ownerSchema = new Schema({
    ownerName: String,
    ownerPhoneNumber: String,
    carNumberPlate: String
})

var Owner = mongoose.model("Owner", ownerSchema);
module.exports = Owner;

module.exports.findCarIsMonthly = function(carNumberPlate, callback){
    Owner.find({
        carNumberPlate: carNumberPlate
    }, callback);
}