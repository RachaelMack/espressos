 var mongoose = require('mongoose');

var prefSchema = mongoose.Schema({
    creator: {type: mongoose.Schema.ObjectId, ref: 'User'},
    defaultDrink: {
        beverage: String,
        blend: String,
        size: String,
        additives: {
            whitener: {
                numberOf: {type: String},
                type: {type: String}
            },
            sweetener: {
                numberOf: {type: String},
                type: {type: String}
            }
        }
    }

    // Default Drink is the only data we need right now. Favorite Location & corresponding drink will come next

});

module.exports = mongoose.model('Pref', prefSchema);