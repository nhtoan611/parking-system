var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var costSchema = new Schema({
    costVal: Number
})

var Cost = mongoose.model("Cost", costSchema);
module.exports = Cost;