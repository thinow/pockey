angular.module('Pockey', ['firebase'])

	.filter('signedCurrency', function($window, $filter) {
		return function(input) {
			var prefix = (input >= 0) ? '+' : '-';
			var absolute = $window.Math.abs(input);

			return prefix + ' ' + $filter('number')(absolute) + ' €';
		};
	})

	.constant('REMOTE_SERVER', 'https://pockey-dev.firebaseio.com')

	.factory('RemoteService', function(REMOTE_SERVER, angularFire, angularFireCollection, DateService) {
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
				var node = this.getNode(property);
				angularFire(node, parent, property, type);
			},

			changeRemoteMonth : function(month) {
				var formattedMonth = DateService.format(month);
				this.getNode('month').set(formattedMonth);
				this.getNode('expenses').remove();
			},

			getNode : function(name) {
				return new Firebase(REMOTE_SERVER + '/' + name);
			},

			serialize : function(source) {
				var copy = this.copyObject(source);
				return this.removeKeys(copy, ['$id', '$index', '$ref']);
			},

			copyObject : function(source) {
				var copy = {};
				angular.forEach(source, function(value, key) {
					copy[key] = value;
				});
				return copy;
			},

			removeKeys : function(object, keysToRemove) {
				angular.forEach(keysToRemove, function(keyToRemove) {
					delete object[keyToRemove];
				});
				return object;
			}
		};
	})

	.factory('DateService', function($filter) {
		return {
			createDate : function(string) {
				return new Date(string);
			},

			format : function(date) {
				return $filter('date')(date, 'yyyy-MM-dd');
			},

			findFirstDayOfMonth : function(string) {
				var date = this.createDate(string);
				return new Date(date.getFullYear(), date.getMonth(), 1);
			},

			findLastDayOfMonth : function(string) {
				var date = this.createDate(string);
				return new Date(date.getFullYear(), date.getMonth() + 1, 0);
			},

			findNextMonth : function(string) {
				var date = this.createDate(string);
				date.setMonth(date.getMonth() + 1);
				return date;
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

	.controller('ListController', ['$scope', 'RemoteService', 'DateService', function ($scope, RemoteService, DateService) {

		RemoteService.injectNumber($scope, 'budget');
		RemoteService.injectString($scope, 'month');
		RemoteService.injectCollection($scope, 'expenses');
		
		$scope.computeTotal = function() {
			var allExpensesCost = 0;
			angular.forEach($scope.expenses, function(expense) {
				allExpensesCost += expense.cost;
			});
	
			return $scope.budget - allExpensesCost;
		};

		$scope.startNextMonth = function() {
			var nextMonth = DateService.findNextMonth($scope.month);
			RemoteService.changeRemoteMonth(nextMonth);
		};
	}])

	.controller('AddController', ['$scope', '$location', 'RemoteService', 'DateService', function ($scope, $location, RemoteService, DateService) {

		RemoteService.injectString($scope, 'month');
		RemoteService.injectCollection($scope, 'categories');
		RemoteService.injectCollection($scope, 'expenses');

		$scope.findDaysOfMonth = function() {
			return {
				first	: DateService.findFirstDayOfMonth($scope.month),
				last	: DateService.findLastDayOfMonth($scope.month)
			};
		};

		$scope.save = function() {
			$scope.expense.category = RemoteService.serialize($scope.expense.category);
			$scope.expenses.add($scope.expense);
			$location.path('/');
		};

	}]);