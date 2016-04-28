'use strict';

var slotPage = function() {
  this.container = element(by.css('.slot-container'));
  this.panelBody = this.container.element(by.css('.panel-body'));
}

module.exports = new slotPage();
