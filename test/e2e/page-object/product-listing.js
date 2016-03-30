'use strict';

var PageObject = require('./page-object');

var productsListingUrl = '#/products-listing';

var ProductListingPage = function () {
  this.startNavigation()
    .then(browser.get.bind(browser, productsListingUrl))
    // .then(_someOtherAction)
    .then(this.completeNavigation.bind(this));
};

ProductListingPage.prototype = new PageObject({
  productCount: _getProductCount
}, {
  getProductRow: _getProductRow
});

module.exports = ProductListingPage;

// Private declarations

function _getProductCount() {
  return element.all(by.repeater('product in products track by $index')).count();
}

function _getProductRow(productId) {
  return element(by.id(productId));
}
