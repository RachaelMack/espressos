angular.module('starter.User', ['ngStorage'])

  .factory('User', function($http, $localStorage){

    var User = {

      checkToken: function() {
        console.log("1userid",$localStorage.user_id, "token:", $localStorage.token);
        if($localStorage.hasOwnProperty("token") && $localStorage.hasOwnProperty("user_id")){
          return $http.post('http://159.203.21.32:8080/api/checklogin', {
            user_id: $localStorage.user_id,
            token: $localStorage.token
          }).then(function(result){
            console.log("You're getting here",$localStorage.user_id, "token:", $localStorage.token);
            return true;
          }).catch(function onError(sailsResponse){
            console.log(sailsResponse);
            delete $localStorage.user_id;
            delete $localStorage.token;
            return false;
          });
        }
        else {
          return false;
        }
      }
    };

    return User;

  });
