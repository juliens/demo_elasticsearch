'use strict';

angular.module('demoElasticApp')
  .controller('WikipediaCtrl', function ($scope, $http, $timeout, $q) {
      var canceler = $q.defer();
      $scope.$watch( 'facets', function (e) {
          if (e && e.length>0) {
              find($scope.query_string, e);
          }
      });
      $scope.$watch( 'query_string', function (e) {
          canceler.resolve();
          canceler = $q.defer();
          find(e, []);
      });
      var find = function(e, facets) {
          var query = null;
          if (e) {
               query = {
                  query: {
                      bool: {
                          should: [
                              {
                              match: {
                                  "text":{query:e}
                              }
                          },
                          {
                              match: {
                                  link:{query:e}
                              }

                          }

                          ]
                          
                      }
                  },
                  suggest: { suggest: {text:e, term: { field: 'link'}}}
               };
              var titre_match = null;
              //*
              if ($scope.highlight) {
                  query.highlight = 
                  {
                              fields : {
                                  text : {}
                              }
                  };
              }
              //*/
              if ($scope.type=="ngram") {
                          titre_match = {
                              match: {
                                  'title.autocomplete_bidirectionnel':{query:e, boost:2, analyzer:'analyzer_tokenspace_asciifolding_lowercase'}
                              }
                          };
              } else if ($scope.type=="stemmer") {
                          titre_match = {
                              match: {
                                  'title.stemmer':{query:e, boost:2}
                              }
                          };
              } else {
                          titre_match = {
                              match: {
                                  'title':{query:e, boost:2}
                              }
                          }
              }
              query.query.bool.should.push(titre_match);

          } else {
               query = {
                  query: {
                      bool: {
                          must: [
                              {
                              match_all: {
                              }
                          }
                          ]
                          
                      }
                  }
               };
          }
            var filters = [{term:{redirect:false}}];
            //query.filter = { or: filters };
          
          $http({method:'POST', url:'http://127.0.0.1:9200/wikipedia/_search',data:query ,timeout : canceler}).success(function (data) {
          //$http({method:'POST', url:'http://sd-31675.dedibox.fr:9200/wikipedia/_search',data:query ,timeout : canceler}).success(function (data) {
              $scope.results = data;
              if  (facets.length==0) {
                  $scope.facets = new Array();
                  if ($scope.results.facets) {
                      for (var i=0;i<$scope.results.facets.salle.terms.length;i++) {
                          var el = $scope.results.facets.salle.terms[i];
                          $scope.facets.push({name:el.term, count:el.count, filter:false});
                      }
                  }
              }
          }).error(function (data) {
              //console.debug('canceled');
          });;
      };
      $scope.use_suggest = function (text) {
          $scope.query_string = text;
      }
      $scope.facets = new Array();
      $scope.switch_facet_filter = function (term_key) {
          $scope.facets[term_key].filter = !$scope.facets[term_key].filter;
          find($scope.query_string, $scope.facets);
      };
      
  });
