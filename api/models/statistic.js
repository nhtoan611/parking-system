var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var statisticSchema = new Schema({
    dateVal: String,
    revenue: Number
})

var Statistic = mongoose.model("Statistic", statisticSchema);
module.exports = Statistic;