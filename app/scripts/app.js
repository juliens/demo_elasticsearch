'use strict';

angular.module('demoElasticApp', ['ngSanitize', 'ngRoute'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/wikipedia', {
        templateUrl: 'views/wikipedia.html',
        controller: 'WikipediaCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
