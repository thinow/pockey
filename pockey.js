angular.module('Pockey', [])

	.filter('signedCurrency', function($window, $filter) {
		return function(input) {
			var prefix = (input >= 0) ? '+' : '-';
			var absolute = $window.Math.abs(input);

			return prefix + ' ' + $filter('number')(absolute) + ' €';
		};
	})

	.constant('CATEGORIES', [
	    { text : 'Repas',	icon : 'cutlery',	color : 'danger' },
	    { text : 'Loisirs',	icon : 'film',		color : 'primary' },
	    { text : 'Soirées',	icon : 'glass',		color : 'warning' },
	    { text : 'Amis',	icon : 'user',		color : 'success' },
	    { text : 'Divers',	icon : 'euro',		color : 'info' }
	])

	.factory('$data', function(CATEGORIES) {
		return {
			budget : 500,

			expenses : [
			    { date : '2013-10-15',	cost : 35,	category : CATEGORIES[0] },
			    { date : '2013-10-14',	cost : 12,	category : CATEGORIES[1] },
			    { date : '2013-10-10',	cost : 21,	category : CATEGORIES[2] },
			    { date : '2013-10-10',	cost : 5,	category : CATEGORIES[3] },
			    { date : '2013-10-08',	cost : 8,	category : CATEGORIES[4] },
			    { date : '2013-10-07',	cost : 15,	category : CATEGORIES[2] }
			]
		}
	})

	.controller('ListController', ['$scope', '$data', '$window', function ($scope, $data, $window) {

		$scope.expenses = $data.expenses;

		$scope.findLastDate = function() {
			var dates = new Array();
			angular.forEach($scope.expenses, function(expense) {
				dates.push(new Date(expense.date).getTime());
			});
	
			return max(dates);
		};

		max = function(array) {
			return $window.Math.max.apply(null, array);
		};

		$scope.computeTotal = function() {
			var allExpensesCost = 0;
			angular.forEach($scope.expenses, function(expense) {
				allExpensesCost += expense.cost;
			});
	
			return $data.budget - allExpensesCost;
		};
	}]);