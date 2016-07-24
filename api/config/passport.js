// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

var mongoose        = require('mongoose');

// load up the user model
var User            = require('../app/models/user');
var Pref            = require('../app/models/preferences');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if theres already a user with that email
            if (user) {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            } else {

                var newPref = new Pref();
                newPref.defaultDrink = {
                    beverage: req.body.newPref.defaultDrink.beverage,
                    blend: req.body.newPref.defaultDrink.blend,
                    size: req.body.newPref.defaultDrink.size,
                    additives: {
                        whitener: {
                            numberOf: req.body.newPref.defaultDrink.additives.whitener.numberOf,
                            type: req.body.newPref.defaultDrink.additives.whitener.type
                        },
                        sweetener: {
                            numberOf: req.body.newPref.defaultDrink.additives.sweetener.numberOf,
                            type: req.body.newPref.defaultDrink.additives.sweetener.type
                        }
                    }
                };
                console.log(newPref);
                console.log("This is our user:", user);
                console.log("Here's your drink:" ,req.body.newPref);

                newPref.save(function(err){
                    if(err){
                        throw err;
                    }

                    return newPref;
                });

                // if there is no user with that email
                // create the user
                var newUser            = new User();

                // set the user's local credentials
                newUser.local.email    = email;
                newUser.local.display_name = req.body.display_name;
                newUser.local.phone = req.body.phone;
                newUser.local.password = newUser.generateHash(password);
                newUser.local.preferences = mongoose.Types.ObjectId(newPref._id);
                console.log(newUser.local.preferences);

                // save the user
                newUser.save(function(err) {
                    if (err) {
                        throw err;
                    }

                    // set the user in the session
                    req.session.user = newUser;

                    User.find({}).populate('local.preferences').exec(function(err, users){
                        console.log("\n", users[users.length-1].local.preferences.defaultDrink);
                    });

                    return done(null, newUser);

                });

            }

        });    

        });

    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'local.email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // set the user in the session
            req.session.user = user;

            // all is well, return successful user
            return done(null, user);
        });

    }));

};