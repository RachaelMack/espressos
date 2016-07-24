var mongoose = require('mongoose');

var storeSchema = mongoose.Schema({
    storeName: String,
    location: String
});

module.exports = mongoose.model('Store', storeSchema);