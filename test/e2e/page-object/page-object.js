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
PageObject.prototype.navigation = _navigation;

module.exports = PageObject;

// Private declarations

function _startNavigation(url) {
    if (!url) {
        throw 'Missing url parameter.';
    }

    if (this.$navigation) {
        throw 'Navigation already started.';
    }

    this.$navigationDeferrer = protractor.promise.defer();
    this.$navigation = this.$navigationDeferrer.promise;
    this.url = url;
    this.$navigationComplete = false;

    return browser.get(this.url);
}

function _completeNavigation() {
    if (!this.$navigation) {
        throw 'Navigation not started.';
    }

    this.$navigationComplete = true;
    this.$navigationDeferrer.fulfill();
}

function _navigation() {
  if (!this.$navigation) {
    throw 'Navigation not started.';
  }

  return this.$navigation;
}

function _expectNavigationComplete(next) {
    return function () {
        if (!this.$navigationComplete) {
            throw 'Navigation is not complete! Make sure completeNavigation is called before querying the page.';
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
