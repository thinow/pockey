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
;