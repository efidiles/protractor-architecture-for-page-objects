var PreviewProductPage = require('../page-object/preview-product');

describe('Preview product', function () {
  var previewProductPage;

  beforeAll(function () {
    previewProductPage = new PreviewProductPage('prod-1');
  });

  it('should have the title set', function () {
    expect(previewProductPage.title.getText()).toEqual('Preview of Samsung Galaxy S6');
  });

  it('should allow to close the modal', function () {
    expect(previewProductPage.closeButton.isPresent()).toBe(true);
  });
});
