angular.module('starter.controllers',['ngStorage', 'ngResource'])

.controller('AppCtrl', function($scope, $http, $localStorage, $state, $ionicPopup, isLoggedIn, $timeout, $ionicModal) {

  $scope.go = function(location){
    console.log("hitting");
    $state.go(location);
  };

  $scope.goAccount = function(){
    $state.go('account');
  };

  $scope.loginData = {};
  $scope.loggedIn = isLoggedIn;

  if($scope.loggedIn){
    $state.go('tab.coffeerun');
  }

  $scope.newPref = {};
  $scope.newPref.defaultDrink = {};
  $scope.newPref.defaultDrink.beverage = {};
  $scope.newPref.defaultDrink.size = "Extra Large";
  $scope.newPref.defaultDrink.blend = "";
  $scope.newPref.defaultDrink.additives = {};
  $scope.newPref.defaultDrink.additives.whitener = {};
  $scope.newPref.defaultDrink.additives.whitener.type = "None";
  $scope.newPref.defaultDrink.additives.whitener.numberOf = "";
  $scope.newPref.defaultDrink.additives.sweetener = {};
  $scope.newPref.defaultDrink.additives.sweetener.type = "None";
  $scope.newPref.defaultDrink.additives.sweetener.numberOf = "";

  $scope.coffeeSelect = function(){
    $scope.clickedTea = false;
    $scope.clickedCoffee = true;
    $scope.clickedHc = false;
    $scope.clickedCold = false;
    $scope.newPref.defaultDrink.beverage = "Coffee";
    $scope.newPref.defaultDrink.blend = "Dark";
  };

  $scope.teaSelect = function(){
    $scope.clickedTea = true;
    $scope.clickedCoffee = false;
    $scope.clickedHc = false;
    $scope.clickedCold = false;
    $scope.newPref.defaultDrink.beverage = "Tea";
    $scope.newPref.defaultDrink.blend = "Green";
  };

  $scope.hcSelect = function(){
    $scope.clickedTea = false;
    $scope.clickedCoffee = false;
    $scope.clickedHc = true;
    $scope.clickedCold = false;
    $scope.newPref.defaultDrink.beverage = "Hot Chocolate";
  };

  $scope.coldSelect = function(){
    $scope.clickedTea = false;
    $scope.clickedCoffee = false;
    $scope.clickedHc = false;
    $scope.clickedCold = true;
    $scope.newPref.defaultDrink.beverage = "Cold Drink";
    $scope.newPref.defaultDrink.blend = "";


  };

  $scope.selectPref = function(){
    $scope.clickedTea = false;
    $scope.clickedCoffee = false;
    $scope.clickedHc = false;
    $scope.clickedCold = false;
    $scope.prefSelect = true;
  };

  $scope.doSignup = function(){
    $http.post("http://159.203.61.13:8080/api/signup", {newPref: $scope.newPref, display_name: $scope.loginData.display_name, email: $scope.loginData.email, phone: $scope.loginData.phone, password: $scope.loginData.password}).then(function(result){
      if(result.data.status == "success"){
        console.log("here's the pref:", $scope.newPref);
        $localStorage.user_id = result.data.userid;
        $localStorage.token = result.data.token;
        $state.go('tab.coffeerun');

      }else{
        var alertPopup = $ionicPopup.alert({
          title: 'Input Error',
          template: 'Please check your information and try again'
        });

        alertPopup.then(function(res) {
        });
      }
    }, function(error){

      var alertPopup = $ionicPopup.alert({
        title: 'Database Error',
        template: 'Oops, seems to be something wrong with the database, please try again later'
      });

      alertPopup.then(function(res) {
      });
      console.log(error);
    });
  };

  $scope.doLogin = function () {
    console.log("LOGIN user: " + $scope.loginData.email + " - PW: " + $scope.loginData.password);
    $http.post("http://159.203.61.13:8080/api/login", {email: $scope.loginData.email, password: $scope.loginData.password}).then(function(result){
      if (result.data.status == "success"){
        $localStorage.user_id = result.data.userid;
        $localStorage.token = result.data.token;
        $scope.loggedIn = true;
        $state.go('tab.coffeerun');
      }
      else{
        var alertPopup = $ionicPopup.alert({
          title: 'Input Error',
          template: 'Please check your information and try again'
        });

        alertPopup.then(function(res) {});
      }
    }, function(error){
      var alertPopup = $ionicPopup.alert({
        title: 'Database Error',
        template: 'Oops, seems to be something wrong with the database, please try again later'
      });

      alertPopup.then(function(res) {
      });
      console.log(error);
    });
  };

  $scope.go = function(location){
    console.log("hitting");
    $state.go(location);
  };
})


.controller('LocationCtrl', function($scope, $cordovaGeolocation, $state){

    $scope.disableTap = function(){
      container = document.getElementsByClassName('pac-container');
      // disable ionic data tab
      angular.element(container).attr('data-tap-disabled', 'true');
      // leave input field if google-address-entry is selected
      angular.element(container).on("click", function(){
        document.getElementById('searchBar').blur();
      });
    };

    $scope.go = function(location){
      console.log("hitting");
      $state.go(location);
    };

    $scope.goAccount = function(){
      $state.go('account');
    };

    var map, places, infoWindow;
    var markers = [];
    var autocomplete;

    var MARKER_PATH = 'https://maps.gstatic.com/intl/en_us/mapfiles/marker_green';
    var hostnameRegexp = new RegExp('^https?://.+?/');

    var options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    };


    $scope.initMap = function() {
      $cordovaGeolocation.getCurrentPosition(options).then(function(position){
        var latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

        map = new google.maps.Map(document.getElementById('map'), {
          center: latLng,
          zoom: 15,
          mapTypeId: google.maps.MapTypeId.ROADMAP,
          mapTypeControl: false,
          panControl: false,
          zoomControl: false,
          streetViewControl: false
        });

        infoWindow = new google.maps.InfoWindow({
          content: document.getElementById('info-content')
        });

        autocomplete = new google.maps.places.Autocomplete((document.getElementById('autocomplete')), {
            types: [ '(cities)' ]
          });


        places = new google.maps.places.PlacesService(map);

        autocomplete.addListener('place_changed', onPlaceChanged);
      })
    };

    function onPlaceChanged(){
      var place = autocomplete.getPlace();
      if (place.geometry) {
        map.panTo(place.geometry.location);
        map.setZoom(15);
        search();
      }else {
        document.getElementById('autocomplete').placeholder = 'Please enter a city.';
      }
    }

    function search() {
      var search = {
        bounds: map.getBounds(),
        types: ['cafe']
      };

      places.nearbySearch(search, function(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          clearResults();
          clearMarkers();
          // Create a marker for each hotel found, and
          // assign a letter of the alphabetic to each marker icon.
          for (var i = 0; i < results.length; i++) {
            var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
            var markerIcon = MARKER_PATH + markerLetter + '.png';
            // Use marker animation to drop the icons incrementally on the map.
            markers[i] = new google.maps.Marker({
              position: results[i].geometry.location,
              animation: google.maps.Animation.DROP,
              icon: markerIcon
            });
            // If the user clicks a hotel marker, show the details of that hotel
            // in an info window.
            markers[i].placeResult = results[i];
            google.maps.event.addListener(markers[i], 'click', showInfoWindow);
            setTimeout(dropMarker(i), i * 100);
            addResult(results[i], i);
          }
        }
      });
    }

    function clearMarkers(){
      for (var i = 0; i < markers.length; i++) {
        if (markers[i]) {
          markers[i].setMap(null);
        }
      }
      markers = [];
    }

    function dropMarker(i) {
      return function() {
        markers[i].setMap(map);
      };
    }

    function addResult(result, i) {
      var results = document.getElementById('results');
      var markerLetter = String.fromCharCode('A'.charCodeAt(0) + i);
      var markerIcon = MARKER_PATH + markerLetter + '.png';

      var tr = document.createElement('tr');
      tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
      tr.onclick = function() {
        google.maps.event.trigger(markers[i], 'click');
      };

      var iconTd = document.createElement('td');
      var nameTd = document.createElement('td');
      var icon = document.createElement('img');
      icon.src = markerIcon;
      icon.setAttribute('class', 'placeIcon');
      icon.setAttribute('className', 'placeIcon');
      var name = document.createTextNode(result.name);
      iconTd.appendChild(icon);
      nameTd.appendChild(name);
      tr.appendChild(iconTd);
      tr.appendChild(nameTd);
      results.appendChild(tr);
    }

    function clearResults() {
      var results = document.getElementById('results');
      while (results.childNodes[0]) {
        results.removeChild(results.childNodes[0]);
      }
    }

    function showInfoWindow() {
      var marker = this;
      places.getDetails({placeId: marker.placeResult.place_id},
        function(place, status) {
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            return;
          }
          infoWindow.open(map, marker);
          buildIWContent(place);
        });
    }

    function buildIWContent(place) {
      document.getElementById('iw-name').innerHTML = '<b><p>' + place.name + '</p></b>';
      document.getElementById('iw-address').textContent = place.vicinity;

      if (place.formatted_phone_number) {
        document.getElementById('iw-phone-row').style.display = '';
        document.getElementById('iw-phone').textContent =
          place.formatted_phone_number;
      } else {
        document.getElementById('iw-phone-row').style.display = 'none';
      }

      // The regexp isolates the first part of the URL (domain plus subdomain)
      // to give a short URL for displaying in the info window.
      if (place.website) {
        var fullUrl = place.website;
        var website = hostnameRegexp.exec(place.website);
        if (website === null) {
          website = 'http://' + place.website + '/';
          fullUrl = website;
        }
        document.getElementById('iw-website-row').style.display = '';
        document.getElementById('iw-website').textContent = website;
      } else {
        document.getElementById('iw-website-row').style.display = 'none';
      }
      console.log('Here\'s some info on the place:', place);
    }

  })


.controller('RunCtrl', function($state, $scope, $ionicPopup, $http, $ionicModal, $stateParams, $interval, $localStorage) {
  $scope.cachedRun = {};
  $scope.newRun = {};
  $scope.newRun.clicked = {};
  $scope.newRun.title = "";

  $scope.showCurrentRun = false;
  $scope.showNewRun = true;

  $scope.init = function () {
    if ($localStorage.cachedRun.creator == undefined) {
      $scope.showCurrentRun = false;
      $scope.showNewRun = true;

    } else {
      $scope.showCurrentRun = true;
      $scope.showNewRun = false;
    }
  };

  $interval(function() {
    var quotes = [
    "img/quote1.svg",
    "img/quote2.svg",
    "img/quote3.svg",
    ];
    var index = Math.floor((Math.random() * quotes.length));
    document.getElementById('quote').src = quotes[index];
  }, 10000);

  $scope.goAccount = function(){
    $state.go('account');
  };

  $scope.go = function(location){
    console.log("hitting");
    $state.go(location);
  };

  $http.get("http://159.203.61.13:8080/api/userPreferences").then(function(result) {
    $scope.users = result.data;
    $scope.users.sort();
    console.log(result.data);
  }, function(error) {
    alert("There was a problem loading users");
    console.log(error);
  });


  $scope.doRun = function(){
    //clear out the currently cached 'active coffee run'
    delete $localStorage.cachedRun;
    $scope.cachedRun = {};

    //set a local var to our 'newRun' data grabbed from a form.
    var run = $scope.newRun;

    //add the prefs of each of the user selected on the 'add people to this run' step, to an array attached to our run object
    run.prefs = [];
    $scope.isValid = false;

    for (var i = 0; i < $scope.users.length; i++) {
      if ($scope.users[i].checked == true) {
        $scope.isValid = true;
        console.log($scope.users[i].local);
        run.prefs.push($scope.users[i].local);

        run.creator = $localStorage.user_id;
        $localStorage.cachedRun = run;
        $scope.showCurrentRun = true;
        $state.go('tab.coffeerun');
        console.log("Here's where our cached run is placed into localStorage to be held:", $localStorage.cachedRun);
      }
    }

    if ($scope.isValid == false) {
      console.log("You haven't clicked any users");
        var alertPopup = $ionicPopup.alert({
          title: 'Input Error',
          template: 'You must select at least one friend'
        });

        alertPopup.then(function(res) {});
    }
  };


  $scope.saveTitle = function(){

    var runTitlePopup = $ionicPopup.show({
    template: '<input type="text" ng-model="newRun.title">',
    title: 'Name your Run',
    scope: $scope,
    buttons: [
      { text: 'Cancel' },
      {
        text: '<b>Save</b>',
        type: 'button-positive',
        onTap: function(e) {
          if (!$scope.newRun.title) {
            //don't allow the user to save unless they enter a title
            e.preventDefault();
          } else {
            $scope.saveRun();

          }
        }
      }
    ]
  });
};


  $http.get("http://159.203.61.13:8080/api/getCoffeeRun?creator="+$localStorage.user_id).then(function(result) {
    $scope.coffeeRun = result.data;
    $scope.coffeeRun.reverse();
    console.log(result.data);
  }, function(error) {
    alert("There was a problem loading users");
    console.log(error);
  });


  $scope.deleteActiveRun = function(){
    delete $localStorage.cachedRun;
    delete $scope.cachedRun;
      $localStorage.cachedRun = {};
      $localStorage.cachedRun.prefs = {};
      $state.go('tab.coffeerun');
      $state.go($state.current, {}, {reload: true});
      $scope.modal.hide();
  };

  $scope.saveRun = function(){

    var run = $localStorage.cachedRun;
    $localStorage.cachedRun.title = $scope.newRun.title;
    $scope.userId = $localStorage.user_id;

    $http.post("http://159.203.61.13:8080/api/saveCoffeeRun", {newRun: $localStorage.cachedRun, creator: $scope.userId }).then(function(result){
     console.log("These are your results:", result);

     if(result.statusText == "OK"){
      delete $localStorage.cachedRun;
      delete $scope.cachedRun;
      $localStorage.cachedRun = {};
      $localStorage.cachedRun.prefs = {};
      $scope.modal.hide();
      $state.go('tab.coffeerun');
      $state.go($state.current, {}, {reload: true});

    }else{
     var alertPopup = $ionicPopup.alert({
       title: 'Input Error',
       template: 'Please check your information and try again'
     });

     alertPopup.then(function(res) {
     });
   }
 }, function(error){

   var alertPopup = $ionicPopup.alert({
     title: 'Database Error',
     template: 'Oops, seems to be something wrong with the database, please try again later'
   });

   alertPopup.then(function(res) {
   });
   console.log(error);
 });
  };

  $ionicModal.fromTemplateUrl('templates/localRunModal.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
    $scope.cachedRun = $localStorage.cachedRun;
    $scope.cachedRun.prefs = $localStorage.cachedRun.prefs;

    console.log("this is the cached run scope", $scope.cachedRun);
  });

                // Triggered in the current run modal to close it
                $scope.closeRun = function() {
                  $state.go('tab.coffeerun');
                  $state.go($state.current, {}, {reload: true});
                  $scope.modal.hide()
                };

                // Open the current run modal
                $scope.currentRun = function() {
                  $scope.modal.show();
                };
    $scope.goHome = function(){
    $state.go('tab.coffeerun');
  };

    $scope.displayNewRun = function(){
    $state.go('run');
  };

})


.controller('AccountCtrl', function($ionicModal, $scope, $http, $localStorage, $state, $ionicPopup) {
    $scope.updateInfo = {};

    $scope.coffeeSelect = function(){
      $scope.clickedTea = false;
      $scope.clickedCoffee = true;
      $scope.clickedHc = false;
      $scope.clickedCold = false;
      $scope.updateInfo.beverage = "Coffee";
      $scope.updateInfo.blend = "Dark";
    };

    $scope.teaSelect = function(){
      $scope.clickedTea = true;
      $scope.clickedCoffee = false;
      $scope.clickedHc = false;
      $scope.clickedCold = false;
      $scope.updateInfo.beverage = "Tea";
      $scope.updateInfo.blend = "Green";
    };

    $scope.hcSelect = function(){
      $scope.clickedTea = false;
      $scope.clickedCoffee = false;
      $scope.clickedHc = true;
      $scope.clickedCold = false;
      $scope.updateInfo.beverage = "Hot Chocolate";
    };

    $scope.coldSelect = function(){
      $scope.clickedTea = false;
      $scope.clickedCoffee = false;
      $scope.clickedHc = false;
      $scope.clickedCold = true;
      $scope.updateInfo.beverage = "Cold Drink";
      $scope.updateInfo.blend = "";


    };

    $scope.selectPref = function(){
      $scope.clickedTea = false;
      $scope.clickedCoffee = false;
      $scope.clickedHc = false;
      $scope.clickedCold = false;
      $scope.prefSelect = true;
    };


    $scope.openModal = function(index) {
      if (index == 1){
        $ionicModal.fromTemplateUrl('templates/partials/updateUserInfo-Modal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal){
          $scope.modal = modal;
        }).then(function(){
          $scope.modal.show();
        });
      }
      if (index == 3){
        $ionicModal.fromTemplateUrl('templates/partials/passwordReset-Modal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal){
          $scope.modal = modal;
        }).then(function(){
          $scope.modal.show();
        });
      }
      else{
        $ionicModal.fromTemplateUrl('templates/partials/updateUserPrefs-Modal.html', {
          scope: $scope,
          animation: 'slide-in-up'
        }).then(function(modal){
          $scope.modal = modal;
        }).then(function(){
          $scope.modal.show();
        });
      }
    };

    $scope.closeModal = function() {
      $scope.modal.hide();
    };

  $scope.updateUserInfo = function() {

    console.log("This should be the input data:", $scope.updateInfo);

    console.log("This is the userId:", {userId: $localStorage.user_id});


    $http.put("http://159.203.61.13:8080/api/userInformation/"+$localStorage.user_id, $scope.updateInfo).then(function(result) {
      $scope.userData = result.data.local;
    }, function(error) {
      alert("There was a problem with something.");
      console.log(error);
    }).then(function(){
      $scope.closeModal();
    });

  };

  $scope.updateUserPrefs = function(){
    console.log("This is the userId:", {userId: $localStorage.user_id});
    console.log("This is our numberOf:", $scope.updateInfo.whitener.numOf);

    if($scope.updateInfo.whitener.numOf == undefined){
      $scope.updateInfo.whitener.numOf = 0;
      if($scope.updateInfo.sweetener.numOf == undefined){
        $scope.updateInfo.sweetener.numOf = 0;
        $http.put("http://159.203.61.13:8080/api/userPreferences/"+$localStorage.user_id, $scope.updateInfo).then(function(result) {
          $scope.userData = result.data.local;
          console.log("After:", $scope.updateInfo, "and this:", $scope.userData);
        }, function(error) {
          alert("There was a problem with something.");
          console.log(error);
        }).then(function(){
          $scope.closeModal();
        });
      }
      else{
        $http.put("http://159.203.61.13:8080/api/userPreferences/"+$localStorage.user_id, $scope.updateInfo).then(function(result) {
          $scope.userData = result.data.local;
          console.log("After:", $scope.updateInfo, "and this:", $scope.userData);
        }, function(error) {
          alert("There was a problem with something.");
          console.log(error);
        }).then(function(){
          $scope.closeModal();
        });
      }

    }
    else{
      if($scope.updateInfo.sweetener.numOf == undefined){
        $scope.updateInfo.sweetener.numOf = 0;
        $http.put("http://159.203.61.13:8080/api/userPreferences/"+$localStorage.user_id, $scope.updateInfo).then(function(result) {
          $scope.userData = result.data.local;
          console.log("After:", $scope.updateInfo, "and this:", $scope.userData);
        }, function(error) {
          alert("There was a problem with something.");
          console.log(error);
        }).then(function(){
          $scope.closeModal();
        });
      }
      else{
        $http.put("http://159.203.61.13:8080/api/userPreferences/"+$localStorage.user_id, $scope.updateInfo).then(function(result) {
          $scope.userData = result.data.local;
          console.log("After:", $scope.updateInfo, "and this:", $scope.userData);
        }, function(error) {
          alert("There was a problem with something.");
          console.log(error);
        }).then(function(){
          $scope.closeModal();
        });
      }
    }


  };

  $scope.resetPassword = function(){
    $http.post("http://159.203.61.13:8080/forgotPassword", $scope.reset).success(function(res){
      $ionicPopup.alert({
        title: 'Password reset was successful!',
        template: 'Please check your email for a reset link.'
      });
      $scope.modal.hide();
    }).error(function(err){
      $ionicPopup.alert({
        title: 'Oops! Something went wrong.',
        template: 'Please ensure that your email is valid.'
      });
      console.log(err);
    })
  };

  $scope.logout = function() {
    delete $localStorage.user_id;
    delete $localStorage.token;
    delete $localStorage.cachedRun;
    delete $scope.cachedRun;
    $localStorage.cachedRun = {};
    $scope.loggedIn = false;
    $state.go('login');
    console.log($localStorage.user_id, $localStorage.token);
  };

  $scope.go = function(location){
    console.log("hitting");
    $state.go(location);
  };

  $scope.goHome = function(){
    $state.go('tab.coffeerun');
  };
});
