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
			
			month : '2013-11-01',

			expenses : [
			    { date : '2013-11-15',	cost : 35,	category : CATEGORIES[0] },
			    { date : '2013-11-14',	cost : 12,	category : CATEGORIES[1] },
			    { date : '2013-11-10',	cost : 21,	category : CATEGORIES[2] },
			    { date : '2013-11-10',	cost : 5,	category : CATEGORIES[3] },
			    { date : '2013-11-08',	cost : 8,	category : CATEGORIES[4] },
			    { date : '2013-11-07',	cost : 15,	category : CATEGORIES[2] }
			]
		}
	})

	.config(function($routeProvider) {
		$routeProvider
			.when('/',			{ controller : 'ListController',	templateUrl : 'list.html' })
			.when('/add-entry',	{ controller : 'AddController',		templateUrl : 'detail.html' })
			.otherwise({ redirectTo : '/' });
	})

	.controller('HeaderController', ['$scope', '$data', '$window', function ($scope, $data, $window) {

		$scope.findCurrentMonth = function() {
			return $data.month;
		};

	}])

	.controller('ListController', ['$scope', '$data', function ($scope, $data) {

		$scope.expenses = $data.expenses;

		$scope.computeTotal = function() {
			var allExpensesCost = 0;
			angular.forEach($data.expenses, function(expense) {
				allExpensesCost += expense.cost;
			});
	
			return $data.budget - allExpensesCost;
		};
	}])

	.controller('AddController', ['$scope', '$data', 'CATEGORIES', '$location', function ($scope, $data, CATEGORIES, $location) {

		$scope.categories = CATEGORIES;

		$scope.findDaysOfMonth = function() {
			return {
				first : new Date(currentYear(), currentMonth(), 1),
				last  : new Date(currentYear(), currentMonth() + 1, 0)
			};
		};

		currentMonth = function() {
			return new Date($data.month).getMonth();
		};

		currentYear = function() {
			return new Date($data.month).getFullYear();
		};

		$scope.save = function() {
			$data.expenses.push($scope.expense);
			$location.path('/');
		};

	}]);