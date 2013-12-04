angular.module('Pockey', ['firebase'])

	.filter('signedCurrency', function($window, $filter) {
		return function(input) {
			var prefix = (input >= 0) ? '+' : '-';
			var absolute = $window.Math.abs(input);

			return prefix + ' ' + $filter('number')(absolute) + ' €';
		};
	})

	.constant('REMOTE_SERVER', 'https://pockey-dev.firebaseio.com')

	.factory('RemoteService', function(REMOTE_SERVER, angularFire, angularFireCollection) {
		return {
			injectCollection : function(parent, name) {
				var collection = angularFireCollection(REMOTE_SERVER + '/' + name);
				parent[name] = collection;
			},

			injectNumber : function(parent, property) {
				this.inject(parent, property, 0);
			},

			injectString : function(parent, property) {
				this.inject(parent, property, '');
			},

			inject : function(parent, property, type) {
				var ref = new Firebase(REMOTE_SERVER + '/' + property);
				angularFire(ref, parent, property, type);
			}
		};
	})

	.config(function($routeProvider) {
		$routeProvider
			.when('/',			{ controller : 'ListController',	templateUrl : 'list.html' })
			.when('/add-entry',	{ controller : 'AddController',		templateUrl : 'detail.html' })
			.otherwise({ redirectTo : '/' });
	})

	.controller('HeaderController', ['$scope', 'RemoteService', function ($scope, RemoteService) {

		RemoteService.injectString($scope, 'month');

	}])

	.controller('ListController', ['$scope', 'RemoteService', function ($scope, RemoteService) {

		RemoteService.injectNumber($scope, 'budget');
		RemoteService.injectCollection($scope, 'expenses');

		$scope.computeTotal = function() {
			var allExpensesCost = 0;
			angular.forEach($scope.expenses, function(expense) {
				allExpensesCost += expense.cost;
			});
	
			return $scope.budget - allExpensesCost;
		};
	}])

	.controller('AddController', ['$scope', 'RemoteService', '$location', function ($scope, RemoteService, $location) {

		RemoteService.injectString($scope, 'month');
		RemoteService.injectCollection($scope, 'categories');
		RemoteService.injectCollection($scope, 'expenses');

		$scope.findDaysOfMonth = function() {
			return {
				first : new Date(currentYear(), currentMonth(), 1),
				last  : new Date(currentYear(), currentMonth() + 1, 0)
			};
		};

		currentMonth = function() {
			return new Date($scope.month).getMonth();
		};

		currentYear = function() {
			return new Date($scope.month).getFullYear();
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