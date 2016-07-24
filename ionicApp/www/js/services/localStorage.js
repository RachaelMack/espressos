angular.module('starter.StorageService', ['ngStorage'])

.factory('StorageService', function($localStorage){

	var _getAll = function () {
	  return $localStorage.localRuns;
	};

	var _add = function (localRun) {
	  $localStorage.localRuns.push(thing);
	};

	var _remove = function (localRun) {
	  $localStorage.localRuns.splice($localStorage.localRuns.indexOf(localRun), 1);
	};

	return {
	    getAll: _getAll,
	    add: _add,
	    remove: _remove
  };
});
