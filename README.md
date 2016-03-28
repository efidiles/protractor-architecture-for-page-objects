# An architecture for structuring your protractor page objects

Writing your integration tests using page objects offers the benefit of a high level API that can be used by anyone to write tests without knowing too many technical details.

The following architecture assures that those persons avoid common mistakes and headaches caused by the various factors involved in writing e2e tests: Selenium, Angular, Protractor, Promises etc.)  

The convention is the following:
- Integration tests are written by making use of the API exposed by page objects.
- Instances of page objects are always created in `beforeAll` / `beforeEach` blocks.
- in the following `it` blocks it's safe to interact with all the properties and methods of the page objects.

The navigation to the page we need to inspect is done inside the constructor of the page objects - therefore the navigation to the page that we need to start with will also happen in the `before` block.

A typical e2e test will look like this:

```js
'use strict';

var PreviewProductPage = require('../page-object/preview-product');

describe('Preview product', function () {
  var previewProductPage;

  beforeAll(function () {
    previewProductPage = new PreviewProductPage('prod-1');
  });

  // If you need login steps do them like this:
  // beforeAll(function () {
  //   var loginPage = new LoginPage();
  //   
  //   loginPage
  //     .navigation()
  //     .then(function() {
  //       previewProductPage = new PreviewProductPage('prod-1');
  //     });
  // });

  it('should have the title set', function () {
    expect(previewProductPage.title.getText()).toEqual('Preview of Samsung Galaxy S6');
  });

  it('should allow to close the modal', function () {
    expect(previewProductPage.closeButton.isPresent()).toBe(true);
  });
});
```
REMEMBER: the convention is that the page object is always created inside a `beforeAll` / `beforeEach` block. This is important because the navigation to a page or a modal inside a page can be quite complex, involving login steps, multiple route changes and maybe clicks on different elements. Having all this done in a before block is a safe way of making sure that both Angular and the DOM have settled down and we can start performing actions or querying elements in the page.

Going one level down, a developer will typically create a page object using the following structure:

```js
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
```

Mainly two things are important:  
1. Do the navigation in the constructor (`PreviewProductPage`).  
2. Set the prototype with a new instance of `PageObject` (`PreviewProductPage.prototype`).

In the constructor we have two markers: `startNavigation` and `completeNavigation`. This will help to determine when a page has finished its initial navigation.
We call `startNavigation` followed by any other steps involved to get to a page / modal and then we call `completeNavigation` to mark the end of the navigation.  
The reason for these start / complete markers is to help the `PageObject` to defer all methods on the page object to execute after the navigation completes and to throw explicit error messages if properties on the page object are accessed before the navigation has completed.

The `prototype` is set to a new instance of a `PageObject` to which we pass two objects: one with properties and one with methods that we want accesible in the page object currently built. The reason why they are passed to the `PageObject` is that inside the `PageObject` these methods will be wrapped inside other functions that will perform the deferring / throwing operations if needed.

That's all a developer has to do.

The `PageObject` constructor (`page-object` module) doesn't need any work.  


Long story short, in the `PageObject` constructor we wrap the properties and methods we receive in the constructor with functionality that will delay all the
methods until the navigation completes or will throw errors if properties are accessed before the navigation completes.

```js
'use strict';

var PageObject = function(properties, methods) {
    var propertyDescriptor = {};

    for (var property in properties) {
        _addProperty(properties[property], property);
    }

    for (var method in methods) {
        _addMethod(methods[method], method);
    }

    function _addProperty(getter, name) {
        propertyDescriptor[name] = {
            get: _expectNavigationComplete(getter)
        };
    }

    function _addMethod(handler, name) {
        propertyDescriptor[name] = {
            value: _waitForNavigation(handler)
        };
    }

    Object.defineProperties(this, propertyDescriptor);
};

PageObject.prototype.startNavigation = _startNavigation;
PageObject.prototype.completeNavigation = _completeNavigation;

module.exports = PageObject;

// Private declarations

function _startNavigation(url) {
    if (!url) {
        throw 'Missing url parameter';
    }

    this.$navigationDeferrer = protractor.promise.defer();
    this.$navigation = this.$navigationDeferrer.promise;
    this.url = url;
    this.$navigationComplete = false;

    return browser.get(this.url);
}

function _completeNavigation() {
    this.$navigationComplete = true;
    this.$navigationDeferrer.fulfill();
}

function _expectNavigationComplete(next) {
    return function () {
        if (!this.$navigationComplete) {
            throw 'Navigation is not complete! Make sure ' +
              'completeNavigation is called before querying the page.';
        }

        return next.apply(this, arguments);
    };
}

function _waitForNavigation(next) {
    return function () {
        var self = this;
        var args = arguments;

        return this.$navigation.then(function () {
            return next.apply(self, args);
        });
    };
}
```

## Running the example:

Clone the repo:
`git clone git@github.com:efidiles/protractor-architecture-for-page-objects.git .`

Install the packages:  
`npm install`

To run the tests:  
`npm test`

To run the example in your browser:  
`npm start`

then open in browser:   
`http://localhost:8085`

___
**This has only been tested on Ubuntu.**

___

**TIP:** Having an image with `ng-src` inside a link causes the link not to be visible for clicking (because the image is rendered in the next event loop and until then the link has dimensions 0 - no content).  
The css below is one solution to overcome this. Basically we give minimum dimensions for preview links.

```css
a.preview {
  display: block;
  min-width: 20px;
  min-height: 20px;
}
```
