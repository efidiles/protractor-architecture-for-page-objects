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

  this.startNavigation()
    .then(browser.get.bind(browser, productsListingUrl))
    .then(_openProductEditModal.bind(this, id))
    // .then(_someOtherAction)
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
The reason for these start / complete markers is to help the `PageObject` to throw explicit error messages if properties on the page objects are accessed before the navigation process is complete.

The `prototype` is set to a new instance of a `PageObject` to which we pass two objects: one with properties and one with methods that we want accessible in the page object currently built. The reason why they are passed to the `PageObject` is that inside the `PageObject` these methods will be wrapped inside other functions that will perform extra checks to ensure that the page objects are used in the intended manner.

That's all a developer has to do.

The `PageObject` constructor (`page-object` module) doesn't need any work.  


Long story short, in the `PageObject` constructor we wrap the properties and methods we receive in the constructor with functionality that will delay all the
methods until the navigation completes or will throw errors if properties are accessed before the navigation completes.

```js
'use strict';

var PageObject = function (properties, methods) {
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
      value: _expectNavigationComplete(handler)
    };
  }

  Object.defineProperties(this, propertyDescriptor);
};

PageObject.prototype.startNavigation = _startNavigation;
PageObject.prototype.completeNavigation = _completeNavigation;
PageObject.prototype.navigate = _navigate;

module.exports = PageObject;

// Private declarations

/**
 * This method flags the start of the navigation phase.
 * By navigation we mean the process of reaching a specific state of the app. This can be a simple
 * navigation to a page or a more complex journey such as navigating to a page, pressing something
 * to open a modal, doing something inside the modal etc.
 * @method _startNavigation
 */
function _startNavigation() {
  if (typeof this.$navigationComplete !== 'undefined') {
    throw 'Navigation already started.';
  }

  this.$navigationComplete = false;

  return protractor.promise.fulfilled();
}

/**
 * Marks the end of a navigation phase.
 * Between the start of the navigation and the end we can go through multiple steps already
 * mentioned in the startNavigation function.
 * @method _completeNavigation
 */
function _completeNavigation() {
  if (typeof this.$navigationComplete === 'undefined') {
    throw 'Navigation not started.';
  }

  this.$navigationComplete = true;

  return protractor.promise.fulfilled();
}

/**
 * This method must be implemented by the inheriting objects and inside it we will typically
 * call startNavigation optionally followed by multiple steps and ending with a call to
 * completeNavigation.
 * @method _navigate
 */
function _navigate() {
  throw 'Undefined method. Navigate method needs to be defined by the inheriting objects.';
}

function _expectNavigationComplete(next) {
  return function () {
    if (!this.$navigationComplete) {
      throw 'Navigation is not complete! Make sure completeNavigation is called before querying ' +
        'the page.';
    }

    return next.apply(this, arguments);
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
[http://localhost:8085](http://localhost:8085)

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

___

## Updates

**30/03/2016** - Refactored the base page object to make it more loosely coupled and flexible to use.  
Details of the changes are in the following PR: [https://github.com/efidiles/protractor-architecture-for-page-objects/pull/1](https://github.com/efidiles/protractor-architecture-for-page-objects/pull/1)
