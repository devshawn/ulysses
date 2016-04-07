'use strict';

angular.module('ulyssesApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('slot', {
        url: '/slots',
        templateUrl: 'app/slot/slot.html',
        controller: 'SlotCtrl',
        controllerAs: 'slotCtrl',
        authenticate: 'organizer'
      }).state('slot-create', {
        url: '/slots/create/:id',
        templateUrl: 'app/slot/slot-create.html',
        controller: 'SlotCtrl',
        controllerAs: 'slotCtrl',
        authenticate: 'organizer'
      }).state('slot-create-define', {
        url: '/slots/create',
        templateUrl: 'app/slot/slot-pick-job.html',
        controller: 'SlotCtrl',
        controllerAs: 'slotCtrl',
        authenticate: 'organizer'
      }).state('slot-detail', {
        url: '/slots/:id',
        templateUrl: 'app/slot/slot-detail.html',
        controller: 'SlotCtrl',
        controllerAs: 'slotCtrl',
        authenticate: 'organizer'
      });
  });
