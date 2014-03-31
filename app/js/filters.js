'use strict';

angular.module('Pockey.filters', [])

	.filter('signedCurrency', function($window, $filter) {
		return function(input) {
			var prefix = (input >= 0) ? '+' : '-';
			var absolute = $window.Math.abs(input);

			return prefix + ' ' + $filter('number')(absolute) + ' €';
		};
	})

	.filter('asArray', function($filter) {
		return function(input) {
			var array = [];

			angular.forEach(input, function(value, key) {
				if (!angular.isFunction(value)) {
					value.$id = key;
					this.push(value);
				}
			}, array);

			return array;
		};
	})

	.filter('isEmpty', function($filter) {
		return function(input) {
			var array = $filter('asArray')(input);
			return Object.keys(array).length == 0;
		};
	})

;