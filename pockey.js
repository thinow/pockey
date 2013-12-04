angular.module('Pockey', ['firebase'])

	.filter('signedCurrency', function($window, $filter) {
		return function(input) {
			var prefix = (input >= 0) ? '+' : '-';
			var absolute = $window.Math.abs(input);

			return prefix + ' ' + $filter('number')(absolute) + ' €';
		};
	})

	.constant('REMOTE_SERVER', 'https://pockey-dev.firebaseio.com')

	.constant('MONTH', '2013-12-01')

	.constant('BUDGET', 500)

	.factory('$expenses', function(angularFireCollection, REMOTE_SERVER) {
		return angularFireCollection(REMOTE_SERVER + '/expenses'); 
	})

	.factory('$categories', function(angularFireCollection, REMOTE_SERVER) {
		return angularFireCollection(REMOTE_SERVER + '/categories'); 
	})

	.config(function($routeProvider) {
		$routeProvider
			.when('/',			{ controller : 'ListController',	templateUrl : 'list.html' })
			.when('/add-entry',	{ controller : 'AddController',		templateUrl : 'detail.html' })
			.otherwise({ redirectTo : '/' });
	})

	.controller('HeaderController', ['$scope', 'angularFire', 'REMOTE_SERVER', function ($scope, angularFire, REMOTE_SERVER) {
		
		angularFire(new Firebase(REMOTE_SERVER + '/parameters/month'), $scope, 'month', '');

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

	.controller('AddController', ['$scope', '$expenses', 'MONTH', '$categories', '$location', function ($scope, $expenses, MONTH, $categories, $location) {

		$scope.categories = $categories;

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
			$scope.expense.category = createSerializable($scope.expense.category);
			$expenses.add($scope.expense);
			$location.path('/');
		};

		createSerializable = function(source) {
			var copy = copyObject(source);
			return removeKeys(copy, ['$id', '$index', '$ref']);
		};

		copyObject = function(source) {
			var copy = {};
			angular.forEach(source, function(value, key) {
				copy[key] = value;
			});
			return copy;
		};

		removeKeys = function(object, keysToRemove) {
			angular.forEach(keysToRemove, function(keyToRemove) {
				delete object[keyToRemove];
			});
			return object;
		};

	}]);