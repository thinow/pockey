angular.module('Pockey', ['ngRoute', 'firebase'])

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

	.constant('REMOTE_SERVER', 'https://pockey-dev.firebaseio.com')

	.factory('RemoteService', function(REMOTE_SERVER, $firebase, DateService) {
		return {
			inject : function(parent, property) {
				this.getNode(property).$bind(parent, property);
			},

			addExpense : function(expense) {
				this.getNode('expenses').$add(expense);
			},

			changeRemoteMonth : function(month) {
				var formattedMonth = DateService.format(month);
				this.getNode('month').$set(formattedMonth);
				this.getNode('expenses').$remove();
			},

			getNode : function(name) {
				return $firebase(new Firebase(REMOTE_SERVER + '/' + name));
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
			.when('/',						{ controller : 'LoadingController',	templateUrl : 'loading.html' })
			.when('/home',					{ controller : 'HomeController',	templateUrl : 'home.html' })
			.when('/expenses',				{ controller : 'ListController',	templateUrl : 'list.html' })
			.when('/expenses/add-entry',	{ controller : 'AddController',		templateUrl : 'detail.html' })
			.otherwise({ redirectTo : '/' });
	})

	.controller('HeaderController', ['$scope', 'RemoteService', function ($scope, RemoteService) {

		RemoteService.inject($scope, 'month');

	}])

	.controller('LoadingController', ['$scope', function ($scope) {

	}])

	.controller('HomeController', ['$scope', function ($scope) {

	}])

	.controller('ListController', ['$scope', '$filter', '$window', 'RemoteService', 'DateService', function ($scope, $filter, $window, RemoteService, DateService) {

		RemoteService.inject($scope, 'budget');
		RemoteService.inject($scope, 'month');
		RemoteService.inject($scope, 'expenses');
		
		$scope.computeTotal = function() {
			var allExpensesCost = 0;
			angular.forEach($filter('asArray')($scope.expenses), function(expense) {
				allExpensesCost += expense.cost;
			});
	
			return $scope.budget - allExpensesCost;
		};

		$scope.startNextMonth = function() {
			if ($window.confirm('Passer au mois suivant ?')) {
				var nextMonth = DateService.findNextMonth($scope.month);
				RemoteService.changeRemoteMonth(nextMonth);
			}
		};
	}])

	.controller('AddController', ['$scope', '$location', 'RemoteService', 'DateService', function ($scope, $location, RemoteService, DateService) {

		RemoteService.inject($scope, 'month');
		RemoteService.inject($scope, 'categories');

		$scope.findDaysOfMonth = function() {
			return {
				first	: DateService.findFirstDayOfMonth($scope.month),
				last	: DateService.findLastDayOfMonth($scope.month)
			};
		};

		$scope.save = function() {
			RemoteService.addExpense($scope.expense);
			$location.path('/expenses');
		};

	}]);
