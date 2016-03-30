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
