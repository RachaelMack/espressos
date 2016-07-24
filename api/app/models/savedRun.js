var mongoose = require('mongoose');

var runSchema = mongoose.Schema({
    title: String,
    creator: {type: mongoose.Schema.ObjectId, ref: 'User'},
    prefs: Array

});

module.exports = mongoose.model('CoffeeRun', runSchema);