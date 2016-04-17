'use strict';

angular.module('ulyssesApp')
  .factory('Team', function($resource) {
    return new $resource('/api/teams/:id', null, {
      'update': { method: 'PUT'}
    });
  });
