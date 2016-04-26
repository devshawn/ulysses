'use strict';

var schedulePage = function() {
  this.container = element(by.css('.schedule-container'));
  this.panelBody = this.container.element(by.css('.panel-body'));
}

module.exports = new schedulePage();
