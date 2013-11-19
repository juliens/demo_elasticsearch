'use strict';

angular.module('demoElasticApp')
  .controller('MainCtrl', function ($scope, $http, $timeout) {
      $scope.$watch( 'facets', function (e) {
          if (e && e.length>0) {
              find($scope.query_string, e);
          }
      });
      $scope.$watch( 'query_string', function (e) {
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
                                  contenu:{query:e}
                              }
                          },
                          {
                              match: {
                                  conferenciers:{query:e}
                              }
                          },
                          {
                              match: {
                                  salle:{query:e}
                              }
                          },
                          {
                              match: {
                                  horaire:{query:e}
                              }
                          },
                          {
                              match: {
                                  file:{query:e}
                              }
                          },
                          ]
                          
                      }
                  },
                  facets: {
                      salle:{ terms: { field: 'salle.original'}}
                  },
                  suggest: { suggest: {text:e, term: { field: 'titre'}}},
                  fields:["titre","contenu","conferenciers","salle", "horaire"]
              };
              //*
                  query.highlight = 
                  {
                              fields : {
                                  "file.file" : {}
                              }
                  };
              //*/
              var titre_match = null;
              if ($scope.ngram) {
                          titre_match = {
                              match: {
                                  'titre.autocomplete_bidirectionnel':{query:e, boost:2, analyzer:'analyzer_tokenspace_asciifolding_lowercase'}
                              }
                          }
              } else {
                          titre_match = {
                              match: {
                                  'titre':{query:e, boost:2}
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
                  },
                  facets: {
                      salle:{ terms: { field: 'salle.original'}}
                  },
                  fields:["titre","contenu","conferenciers","salle", "horaire"]
               };
          }

          if (facets.length>0) {
            var filters = [];
            for (var i=0;i<facets.length;i++) {
                if (facets[i].filter) {
                    filters.push({term:{'salle.original':facets[i].name}});
                }
            }
            if (filters.length>0) {
                query.filter = { or: filters };
            }
          }
          $http.post('http://127.0.0.1:9200/forum/_search',query).success(function (data) {
              $scope.results = data;
              console.debug(data);
              if  (facets.length==0) {
                  $scope.facets = new Array();
                  if ($scope.results.facets) {
                      for (var i=0;i<$scope.results.facets.salle.terms.length;i++) {
                          var el = $scope.results.facets.salle.terms[i];
                          $scope.facets.push({name:el.term, count:el.count, filter:false});
                      }
                  }
              }
          });
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
