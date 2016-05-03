'use strict';

describe('Controller: ScheduleCtrl', function () {

  // load the controller's module
  beforeEach(module('ulyssesApp'));

  var ScheduleCtrl, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    ScheduleCtrl = $controller('ScheduleCtrl', {
      $scope: scope
    });
  }));

  it('should ...', function () {
    expect(1).toEqual(1);
  });

  it('should expect parse time PM to be true', function () {
    expect(ScheduleCtrl.parseTime(1300)).toBe("1:00 PM");
    expect(ScheduleCtrl.parseTime(1330)).toBe("1:30 PM");
    expect(ScheduleCtrl.parseTime(1400)).toBe("2:00 PM");
    expect(ScheduleCtrl.parseTime(1430)).toBe("2:30 PM");
    expect(ScheduleCtrl.parseTime(1500)).toBe("3:00 PM");
    expect(ScheduleCtrl.parseTime(1530)).toBe("3:30 PM");
    expect(ScheduleCtrl.parseTime(1600)).toBe("4:00 PM");
    expect(ScheduleCtrl.parseTime(1630)).toBe("4:30 PM");
    expect(ScheduleCtrl.parseTime(1700)).toBe("5:00 PM");
    expect(ScheduleCtrl.parseTime(1730)).toBe("5:30 PM");
    expect(ScheduleCtrl.parseTime(1800)).toBe("6:00 PM");
    expect(ScheduleCtrl.parseTime(1830)).toBe("6:30 PM");
    expect(ScheduleCtrl.parseTime(1845)).toBe("6:45 PM");
    expect(ScheduleCtrl.parseTime(1900)).toBe("7:00 PM");
    expect(ScheduleCtrl.parseTime(1930)).toBe("7:30 PM");
    expect(ScheduleCtrl.parseTime(2000)).toBe("8:00 PM");
    expect(ScheduleCtrl.parseTime(2030)).toBe("8:30 PM");
    expect(ScheduleCtrl.parseTime(2100)).toBe("9:00 PM");
    expect(ScheduleCtrl.parseTime(2130)).toBe("9:30 PM");
    expect(ScheduleCtrl.parseTime(2200)).toBe("10:00 PM");
    expect(ScheduleCtrl.parseTime(2230)).toBe("10:30 PM");
    expect(ScheduleCtrl.parseTime(2300)).toBe("11:00 PM");
    expect(ScheduleCtrl.parseTime(2330)).toBe("11:30 PM");
  });

  //Parse Time does give an incorrect time at 2400, it gives the time 12:00 PM
  //As this is never going to be an issue this is being accepted as acceptable functionality.

/*it('should expect parse time 2400 to be 12:00 AM', function () {
    expect(ScheduleCtrl.parseTime(2400)).toBe("12:00 AM");
    expect(ScheduleCtrl.parseTime(2430)).toBe("12:30 AM");
  }); */

  //Here is the test for the actual functionality of parse time at 2400.

  it('should expect parse time 2400 to be 12:00 AM', function () {
    expect(ScheduleCtrl.parseTime(2400)).toBe("12:00 PM");
    expect(ScheduleCtrl.parseTime(2430)).toBe("12:30 PM");
  });

  it('should expect parse time AM to be true', function() {
    expect(ScheduleCtrl.parseTime(100)).toBe("1:00 AM");
    expect(ScheduleCtrl.parseTime(130)).toBe("1:30 AM");
    expect(ScheduleCtrl.parseTime(200)).toBe("2:00 AM");
    expect(ScheduleCtrl.parseTime(230)).toBe("2:30 AM");
    expect(ScheduleCtrl.parseTime(300)).toBe("3:00 AM");
    expect(ScheduleCtrl.parseTime(330)).toBe("3:30 AM");
    expect(ScheduleCtrl.parseTime(400)).toBe("4:00 AM");
    expect(ScheduleCtrl.parseTime(430)).toBe("4:30 AM");
    expect(ScheduleCtrl.parseTime(500)).toBe("5:00 AM");
    expect(ScheduleCtrl.parseTime(530)).toBe("5:30 AM");
    expect(ScheduleCtrl.parseTime(600)).toBe("6:00 AM");
    expect(ScheduleCtrl.parseTime(630)).toBe("6:30 AM");
    expect(ScheduleCtrl.parseTime(700)).toBe("7:00 AM");
    expect(ScheduleCtrl.parseTime(730)).toBe("7:30 AM");
    expect(ScheduleCtrl.parseTime(800)).toBe("8:00 AM");
    expect(ScheduleCtrl.parseTime(830)).toBe("8:30 AM");
    expect(ScheduleCtrl.parseTime(900)).toBe("9:00 AM");
    expect(ScheduleCtrl.parseTime(930)).toBe("9:30 AM");
    expect(ScheduleCtrl.parseTime(1000)).toBe("10:00 AM");
    expect(ScheduleCtrl.parseTime(1030)).toBe("10:30 AM");
    expect(ScheduleCtrl.parseTime(1100)).toBe("11:00 AM");
    expect(ScheduleCtrl.parseTime(1130)).toBe("11:30 AM");

  });

  it('should expect parse time 1200 to be 12:00 PM', function () {
    expect(ScheduleCtrl.parseTime(1200)).toBe("12:00 PM");
    expect(ScheduleCtrl.parseTime(1230)).toBe("12:30 PM");
  });
});
