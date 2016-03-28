'use strict';

var PageObject = require('./page-object');

var productsListingUrl = '#/products-listing';

var PreviewProductPage = function (id) {
  id = id.toString();

  this.startNavigation(productsListingUrl)
    .then(_openProductEditModal.bind(this, id))
    .then(this.completeNavigation.bind(this));
    // or with an arrow function: .then(() => (this.completeNavigation()));
};

PreviewProductPage.prototype = new PageObject({
  title: _getTitle,
  closeButton: _getCloseButton
});

module.exports = PreviewProductPage;

// Private declarations

function _openProductEditModal(id) {
  return element(by.id(id))
    .element(by.className('preview'))
    .click();
}

function _getTitle() {
  return element(by.css('.modal-title'));
}

function _getCloseButton() {
  return element(by.css('.modal-footer button'));
}
