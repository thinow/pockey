angular.module('Pockey', ['firebase'])

	.filter('signedCurrency', function($window, $filter) {
		return function(input) {
			var prefix = (input >= 0) ? '+' : '-';
			var absolute = $window.Math.abs(input);

			return prefix + ' ' + $filter('number')(absolute) + ' €';
		};
	})

	.constant('REMOTE_SERVER', 'https://pockey-dev.firebaseio.com')

	.constant('CATEGORIES', [
	    { text : 'Repas',	icon : 'cutlery',	color : 'danger' },
	    { text : 'Loisirs',	icon : 'film',		color : 'primary' },
	    { text : 'Soirées',	icon : 'glass',		color : 'warning' },
	    { text : 'Amis',	icon : 'user',		color : 'success' },
	    { text : 'Divers',	icon : 'euro',		color : 'info' }
	])

	.constant('MONTH', '2013-12-01')

	.constant('BUDGET', 500)

	.factory('$expenses', function(angularFireCollection, REMOTE_SERVER, CATEGORIES) {
		return angularFireCollection(REMOTE_SERVER + '/expenses'); 
	})

	.config(function($routeProvider) {
		$routeProvider
			.when('/',			{ controller : 'ListController',	templateUrl : 'list.html' })
			.when('/add-entry',	{ controller : 'AddController',		templateUrl : 'detail.html' })
			.otherwise({ redirectTo : '/' });
	})

	.controller('HeaderController', ['$scope', 'MONTH', function ($scope, MONTH) {

		$scope.month = MONTH;

	}])

	.controller('ListController', ['$scope', '$expenses', 'BUDGET', function ($scope, $expenses, BUDGET) {

		$scope.expenses = $expenses;

		$scope.computeTotal = function() {
			var allExpensesCost = 0;
			angular.forEach($expenses, function(expense) {
				allExpensesCost += expense.cost;
			});
	
			return BUDGET - allExpensesCost;
		};
	}])

	.controller('AddController', ['$scope', '$expenses', 'MONTH', 'CATEGORIES', '$location', function ($scope, $expenses, MONTH, CATEGORIES, $location) {

		$scope.categories = CATEGORIES;

		$scope.findDaysOfMonth = function() {
			return {
				first : new Date(currentYear(), currentMonth(), 1),
				last  : new Date(currentYear(), currentMonth() + 1, 0)
			};
		};

		currentMonth = function() {
			return new Date(MONTH).getMonth();
		};

		currentYear = function() {
			return new Date(MONTH).getFullYear();
		};

		$scope.save = function() {
			$expenses.add($scope.expense);
			$location.path('/');
		};

	}]);