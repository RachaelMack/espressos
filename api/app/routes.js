// app/routes.js
var mongoose   = require('mongoose');
var flash	   = require('connect-flash');
var nodemailer = require('nodemailer');
var async      = require('async');

// load the user and token models
var Token = require('./models/token');
var User = require('./models/user');
var Pref = require('./models/preferences');
var Store = require('./models/stores');
var Run = require('./models/savedRun');

// expose the routes to our app with module.exports
module.exports = function(app, passport) {
	
	// API routes ==================================================================

  app.get('/api/test', function(req, res) {
    return res.json({message: 'Connected Successfully!'});
  });

    app.get('/', function(req, res) {
        res.render('index', { title: 'Express' });
    });

  app.post('/api/signup', function(req, res) {
    passport.authenticate('local-signup', function(err, user, info) {

        //an error was encountered (ie. no database available)
        if (err) {  
          return next(err); 
        }

        //a user wasn't returned; this means that the user isn't available, or the login information is incorrect
        if (!user) {  
          return res.json({
            'status' : 'error',
            'message' : info.message
          }); 
        }
        else {
            console.log(user);
          //success!  create a token and return the successful status and the if of the logged in user

          // create a token (random 32 character string)
          var token = Math.round((Math.pow(36, 32 + 1) - Math.random() * Math.pow(36, 32))).toString(36).slice(1);

          // add the token to the database
          Token.create({
            user_id: user.id,
            token: token,
          }, function(err, tokenRes) {
            if (err)
                res.send(err);

            return res.json({
              'status' : 'success',
              'userid' : user.id,
              'token' : token,
            });
          });
        }
      })(req, res);
  });

  app.post('/api/login', function(req, res) {
  	passport.authenticate('local-login', function(err, user, info) {

        //an error was encountered (ie. no database available)
        if (err) {  
          return next(err); 
        }

        //a user wasn't returned; this means that the user isn't available, or the login information is incorrect
        if (!user) {  
          return res.json({
            'status' : 'error',
            'message' : info.message
          }); 
        }
        else {  

          //success!  create a token and return the successful status and the if of the logged in user

          // create a token (random 32 character string)
          var token = Math.round((Math.pow(36, 32 + 1) - Math.random() * Math.pow(36, 32))).toString(36).slice(1);

          // add the token to the database
          Token.create({
            user_id: user.id,
            token: token,
          }, function(err, tokenRes) {
            if (err)
                res.send(err);

            return res.json({
              'status' : 'success',
              'userid' : user.id,
              'token' : token,
            });
          });
        }
      })(req, res);
  });

  // checks and authenticates a userid/token combination
  app.post('/api/checklogin', function(req, res) {

      if (!req.param('user_id') || !req.param('token')) {
          
          // user_id/token combination not complete, return invalid
          return res.json({ status: 'error'});
      }

      // attempt to retrieve the token info
      Token.find({
        user_id: req.param('user_id'),
        token: req.param('token'),
      }, function(err, tokenRes) {
        if (err)
            return res.json(err);

        // not found
        if (!tokenRes || tokenRes.length <= 0) {
            return res.json({ status: 'error'});
        }

        // all checks pass, we're good!
        return res.json({ status: 'success'});
      });
  });

  app.post('/forgotPassword', function(req, res, next){
      async.waterfall([
          function(done) {
              User.findOne({ 'local.email': req.body.email }, function(err, user) {
                  if (!user) {
                      done("User does not exist in the database. Please try another email.");
                  }
                  else{
                      var token = Math.round((Math.pow(36, 32 + 1) - Math.random() * Math.pow(36, 32))).toString(36).slice(1);
                      console.log("This is the user's token:", user);
                      user.resetPasswordToken = token;
                      user.resetPasswordExpires = Date.now() + 3600000; // 1 hour


                      user.save(function(err) {
                          done(err, token, user);
                      });
                  }
              });
          },
          function(token, user, done) {
                console.log("user:", user, "token:", token, "done:", done);
              var smtpTransport = nodemailer.createTransport('SMTP', {
                  service: 'Gmail',
                  auth: {
                      user: 'sipsterapp@gmail.com',
                      pass: '2be@Sipster'
                  }
              });
              var mailOptions = {
                  to: user.local.email,
                  from: 'sipsterapp@gmail.com',
                  subject: 'Sipster Password Reset',
                  text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                  'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                  'http://' + req.headers.host + '/resetPassword/' + token + '\n\n' +
                  'If you did not request this, please ignore this email and your password will remain unchanged.\n'
              };
              smtpTransport.sendMail(mailOptions, function(err) {
                  req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                  done(err, 'done');
              });
          }
      ], function(err) {
          if (err) return next(err);
          res.end("Email successfully sent!");
      });
  });

  app.get('/forgotPassword', function(req, res){
    res.render('forgot', {
        user: req.user
    });
  });

  app.get('/resetPassword', function(req, res){
      res.render('reset', {
          user: req.user
      });
  });

  app.get('/resetPassword/:token', function(req, res){
      console.log("this is our token?:", req.params.token);
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
          if (!user) {
              req.flash('error', 'Password reset token is invalid or has expired.');
              return res.redirect('/');

          }
          res.render('reset', {
              user: req.user
          });
      });
  });

  app.post('/resetPassword/:token', function(req, res){
      console.log("this is our token?:", req.params.token);
      async.waterfall([
          function(done) {
              User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                  if (!user) {
                      req.flash('error', 'Password reset token is invalid or has expired.');
                      return res.redirect('back');
                  }
                  var password = req.body.password;
                  user.local.password = user.generateHash(password);
                  user.resetPasswordToken = undefined;
                  user.resetPasswordExpires = undefined;

                  user.save(function(err) {
                      console.log("user pass:", user.local.password);
                      req.logIn(user, function(err) {
                          done(err, user);
                      });
                  });
              });
          },
          function(user, done) {
              var smtpTransport = nodemailer.createTransport('SMTP', {
                  service: 'Gmail',
                  auth: {
                      user: 'sipsterapp@gmail.com',
                      pass: '2be@Sipster'
                  }
              });
              var mailOptions = {
                  to: user.local.email,
                  from: 'sipsterapp@gmail.com',
                  subject: 'Your password has been changed',
                  text: 'Hello,\n\n' +
                  'This is a confirmation that the password for your account ' + user.local.email + ' has just been changed.\n'
              };
              smtpTransport.sendMail(mailOptions, function(err) {
                  req.flash('success', 'Success! Your password has been changed.');
                  done(err);
              });
          }
      ], function(err) {
          if (err){
              console.log("This is an error:", err);
          }
          res.end("Password successfully changed!");
      });
  });

  app.post('/api/userPreferences', function(req, res){
      var newPref = new Pref();
      console.log("This should be where the additives are:", req.body.defaultDrink.additives);
      newPref.defaultDrink = {
          beverage: req.body.defaultDrink.beverage,
          blend: req.body.defaultDrink.blend,
          size: req.body.defaultDrink.size
      };
      newPref.defaultDrink.additives.whitener = {
              numberOf: req.body.defaultDrink.additives.whitener.numberOf,
              type: req.body.defaultDrink.additives.whitener.type
          };
      newPref.defaultDrink.additives.sweetener = {
          numberOf: req.body.defaultDrink.additives.sweetener.numberOf,
          type: req.body.defaultDrink.additives.sweetener.type
      };

      console.log(newPref);
      newPref.save(function(err){
          if(err){

              throw err;
          }

          var returnJson = {};
          returnJson.status = "success";
          return res.json(newPref);
      });
      console.log('newPref');

  });


  app.get('/api/userPreferences', function(req, res){
      User.find({}).populate('local.preferences').exec(function(err, user){
          if(err){
              console.log("error:",err);
          }else{
              console.log(user);
          }
          return res.json(user);
      })
  });

  app.put('/api/userPreferences/:userId', function(req, res){
      //Grabbing an ID that is attached to the pref that we'll be updating
      var userId = mongoose.Types.ObjectId(req.param('userId'));
      console.log(userId);
      //Use the ID to find a particular user preference in the database.
      User.findOne({_id: userId}).populate('local.preferences').exec(function(err, user){
          if(err){
              console.log("error:",err);
          }else{
              console.log("User found successfully!");
          }
          console.log("here's the user prefs, yo:", user.local.preferences);
          var userPrefs = user.local.preferences.defaultDrink;
          // update the user's preferences based on information grabbed from a form.

          userPrefs.beverage = req.body.beverage;
          userPrefs.blend = req.body.blend;
          userPrefs.size = req.body.size;
          userPrefs.additives.sweetener.type = req.body.sweetener.type;
          userPrefs.additives.sweetener.numberOf = req.body.sweetener.numOf;
          userPrefs.additives.whitener.type = req.body.whitener.type;
          userPrefs.additives.whitener.numberOf = req.body.whitener.numOf;
          //save & update the user's information in the database
          userPrefs.save(function(err, user){
              if (err){
                  throw err;
              }
              else{
                  console.log("This totally worked!! :", user);
              }
              var returnJson = {};
              returnJson.status = "success";
              return res.json(user);
          })
      })
  });

  app.put('/api/userInformation/:userId', function(req, res){
      console.log("body", req.body);
      var userId = mongoose.Types.ObjectId(req.param('userId'));
      console.log(userId);
      User.findOne({_id: userId}).populate('local.preferences').exec(function(err, user){
          if(err){
              console.log("error:",err);
          }else{
              console.log("User found successfully!");
          }
          console.log("here's the user object:", user);
          user.local.display_name = req.body.display_name;
          user.local.email = req.body.email;
          user.local.phone = req.body.phone;
          user.save(function(err, user){
              if (err){
                  throw err;
              }
              else{
                  console.log("This totally worked!! :", user);
              }
              var returnJson = {};
              returnJson.status = "success";
              return res.json(user);
          })
      })
  });

  app.post('/api/saveCoffeeRun', function(req, res){
        //create a new 'coffee run' object
      newRun = new Run();
        //grab information to populate this 'run' object
      newRun.title = req.body.newRun.title;
      newRun.prefs = req.body.newRun.prefs;
        //current logged in user is linked to this 'run' via a unique ID
      newRun.creator = req.body.creator;

      newRun.save(function(err){
          if(err){

              throw err;
          }

          var returnJson = {};
          returnJson.status = "success";
          return res.json(newRun);
      });
  });


  app.get('/api/getCoffeeRun', function(req, res){
    console.log("this is the req" + req.param("creator"));
      Run.find({creator: req.param("creator")})
          .populate('creator')
          .exec(function(err, runs){
              if (err){
                  throw err
              }

              console.log("This is the coffee run being saved: ", runs);
              return res.json(runs);

          })

  });

  app.post('/api/location', function(req, res){
      var newStore = new Store();

      newStore.storeName = req.body.storeName;
      newStore.location = req.body.location;

      console.log("Here's the store you're trying to enter:",newStore);

      newStore.save(function(err){
          if(err){
              throw err;
          }
          var returnJson = {};
          returnJson.status = "success";
          return res.json(returnJson);
      });
  });

  app.get('/api/location', function(req, res){
      Store.find({}).sort({storeName: 1}).exec(function(err, stores){
          if(err){
              res.send(err);
          }
          else{
              console.log("These should be stores:",stores);
              return res.json(stores);
          }
      })
  });
};

// persistent log-in middleware for API
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.body.user_id && req.body.token) {
        Token.find({
          user_id: req.body.user_id,
          token: req.body.token
        }, function(err, tokenRes) {
          if (err)
              res.send({ status: 'error', message: "why aren't you logged in?"});

          // not found
          if (!tokenRes) {
              res.send({ status: 'error', message: "why aren't you logged in?"});
          }

          // all checks pass, we're good!
          return next();
        });
    }
    else {
      res.send({ status: 'error', message: "why aren't you logged in?"});
    }
    return next();
}

isLoggedIn