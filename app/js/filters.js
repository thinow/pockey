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
			if (angular.isUndefined(input)) {
				return input;
			} else {
				return $filter('orderByPriority')(input);
			}
		};
	})

	.filter('isEmpty', function($filter) {
		return function(input) {
			var keys = $filter('keys')(input);
			return keys.length == 0;
		};
	})

	.filter('keys', function() {
		return function(input) {
			var keys = [];

			angular.forEach(input, function(value, key) {
				if (!angular.isFunction(value)) {
					this.push(key);
				}
			}, keys);

			return keys;
		};
	})
;