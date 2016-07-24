// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.StorageService', 'starter.User'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})


.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
    .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

.state('login', {
      url: '/login',
      cache: false,
      templateUrl: 'templates/login.html',
      controller: 'AppCtrl',
      resolve: {
        isLoggedIn: function(User){
          return User.checkToken();
        }
      }
    })

.state('signup', {
      url: '/signup',
      templateUrl: 'templates/signup.html',
      controller: 'AppCtrl',
      resolve: {
        isLoggedIn: function(User){
          return User.checkToken();;
        }
      }
    })

.state('preference', {
      url: '/preference',
      templateUrl: 'templates/preference.html',
      controller: 'PrefCtrl',
      resolve: {
        isLoggedIn: function(User){
          return User.checkToken();
        }
      }
    })

.state('run', {
      url: '/run',
      cache: false,
      templateUrl: 'templates/coffeeRunSelect.html',
      controller: 'RunCtrl',
    })

  .state('tab.dash', {
    url: '/dash',
    cache: false,
    views: {
      'tab-dash': {
        templateUrl: 'templates/tab-dash.html',
        controller: 'RunCtrl'
      }
    }
  })

  .state('tab.friends', {
    url: '/friends',
    cache: false,
    views: {
      'tab-friends': {
        templateUrl: 'templates/tab-friends.html',
        controller: 'RunCtrl',
      }
    }
  })

   .state('tab.list', {
    url: '/list',
    cache: false,
    views: {
      'tab-list': {
        templateUrl: 'templates/tab-list.html',
        controller: 'RunCtrl'
      }
    }
  })

  .state('tab.coffeerun', {
      url: '/coffeerun',
      cache: false,
      views: {
        'tab-coffeerun': {
          templateUrl: 'templates/tab-coffeeRun.html',
          controller: 'RunCtrl'
        }
      }

    })

  .state('tab.location', {
      url: '/location',
      views: {
        'tab-location': {
          templateUrl: 'templates/tab-location.html',
          controller: 'LocationCtrl'
        }
      }
    })

  .state('account', {
      url: '/account',
      templateUrl: 'templates/account.html',
      controller: 'AccountCtrl',
      resolve: {
        isLoggedIn: function(User){
          return User.checkToken();
        }
      }
    })

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/login');

});
