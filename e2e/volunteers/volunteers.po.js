'use strict';

var volunteerPage = function() {
  this.container = element(by.css('.volunteer-container'));
  this.panelBody = this.container.element(by.css('.panel-heading'));
}

module.exports = new volunteerPage();
