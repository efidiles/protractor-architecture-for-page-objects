(function () {
  'use strict';

  var app = angular
    .module('app', [
      'ui.router',
      'ui.bootstrap'
    ]);

  app.factory('productsData', [productsData]);

  app.controller('ProductsListingController', [
    '$scope',
    '$state',
    '$uibModal',
    'productsData',
    ProductsListingController
  ]);

  app.controller('ProductDetailsController', [
    '$scope',
    'productData',
    ProductDetailsController
  ]);

  app.controller('ProductPreviewController', [
    '$scope',
    '$uibModalInstance',
    'productData',
    ProductPreviewController
  ]);

  app.config([
    '$stateProvider',
    '$urlRouterProvider',
    config
  ]);

  app.run();

  function config($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise("/products-listing");

    $stateProvider
      .state('productsListing', {
        url: "/products-listing",
        controller: 'ProductsListingController',
        template: '<h1>Products listing</h1><br>' +
          '<table class="table table-bordered table-striped">' +
          ' <tr>' +
          '   <th>ID</th>' +
          '   <th>NAME</th>' +
          '   <th>PRICE</th>' +
          '   <th>PREVIEW</th>' +
          ' </tr>' +
          ' <tr id="{{product.id}}" ng-repeat="product in products track by $index">' +
          '   <td>{{product.id}}</td>' +
          '   <td><a ui-sref="productDetails({id: product.id})">{{product.name}}</a></td>' +
          '   <td>{{product.price}}</td>' +
          '   <td><a class="preview" ng-click="previewImage(product)"><img style="max-width: 50px" ng-src="{{product.image}}"></a></td>' +
          ' </tr>' +
          '</table>'
      })
      .state('productDetails', {
        url: "/product-details/:id",
        controller: 'ProductDetailsController',
        template: '<h1>Products details</h1><br>' +
          '<ul>' +
          ' <li>ID: {{product.id}}</li>' +
          ' <li>Name: {{product.name}}</li>' +
          ' <li>Price: {{product.price}}</li>' +
          '</ul>',
        resolve: {
          productData: function ($stateParams, productsData) {
            return productsData.find(function (product) {
              return product.id === $stateParams.id;
            });
          }
        }
      });
  }

  function ProductsListingController($scope, $state, $uibModal, productsData) {
    $scope.products = productsData;

    $scope.previewImage = function (product) {
      var modalInstance = $uibModal.open({
        templateUrl: 'product-preview.html',
        controller: 'ProductPreviewController',
        resolve: {
          productData: function () {
            return product;
          }
        }
      });
    };
  }

  function ProductDetailsController($scope, productData) {
    $scope.product = productData;
  }

  function ProductPreviewController($scope, $uibModalInstance, productData) {
    $scope.product = productData;

    $scope.close = function () {
      $uibModalInstance.dismiss();
    };
  }

  function productsData() {
    return [{
      id: 'prod-1',
      name: 'Samsung Galaxy S6',
      price: '420.00',
      image: 'http://placehold.it/350x350'
    }, {
      id: 'prod-2',
      name: 'Samsung Galaxy S6 Edge',
      price: '500.00',
      image: 'http://placehold.it/350x350'
    }];
  }
}());
