// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local            : {
        _id          : String,
        display_name : String,
        email        : String,
        phone        : String,
        password     : String,
        //creating a link to pull in another schema
        preferences  : {type: mongoose.Schema.Types.ObjectId, ref: 'Pref'},
        favorites    : String,
        savedRuns    : String

    },
    resetPasswordToken: String,
    resetPasswordExpires: Date

});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);