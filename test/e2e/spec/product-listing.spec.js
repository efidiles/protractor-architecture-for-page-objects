var ProductListingPage = require('../page-object/product-listing');

describe('Product listing', function () {
  var productListingPage;

  beforeAll(function () {
    productListingPage = new ProductListingPage();
  });

  it('should display a table with all products', function () {
    expect(productListingPage.productCount).toEqual(2);
  });
});
