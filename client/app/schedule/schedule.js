'use strict';

angular.module('ulyssesApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('schedule', {
        url: '/schedule',
        templateUrl: 'app/schedule/schedule.html',
        controller: 'ScheduleCtrl',
        controllerAs: 'scheduleCtrl',
        authenticate: 'organizer'
      }).state('schedule-volunteers', {
        url: '/schedule/volunteers',
        templateUrl: 'app/schedule/schedule-volunteers.html',
        controller: 'ScheduleCtrl',
        controllerAs: 'scheduleCtrl',
        authenticate: 'organizer'
      });
  });
