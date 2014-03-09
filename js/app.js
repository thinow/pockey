'use strict';

angular.module('Pockey', [
		'ngRoute',
		'firebase',
		'Pockey.filters'
	])

	.constant('REMOTE_SERVER', 'https://pockey-dev.firebaseio.com')

	.factory('AuthentificationService', function(REMOTE_SERVER, $firebaseAuth, $rootScope, $location) {
		return {
			initialize : function(redirections) {
				this.auth = $firebaseAuth(new Firebase(REMOTE_SERVER));

				this.register('login',  function(user) { $rootScope.user = user; });
				this.register('logout', function(user) { $rootScope.user = null; });

				var self = this;
				angular.forEach(redirections, function(redirection) {
					self.register(redirection.onEvent, function() { $location.path(redirection.redirectTo); });
				});
			},

			register : function(event, callback) {
				$rootScope.$on('$firebaseAuth:' + event, function(e, user) {
					callback(user);
				});
			},

			login : function(provider, rememberMe) {
				this.auth.$login(provider, {
					rememberMe : rememberMe
				});
			},

			logout : function() {
				this.auth.$logout();
			},

			getUserUid : function() {
				return this.isUserLogged() ? $rootScope.user.uid : undefined;
			},

			isUserLogged : function() {
				return $rootScope.user != null && angular.isDefined($rootScope.user);
			}
		};
	})

	.factory('RemoteService', function(REMOTE_SERVER, $firebase, AuthentificationService, DateService, $interpolate, $timeout, $filter) {
		return {
			inject : function(scope, data) {
				data.name = this.findNodeName(data);

				var self = this;
				AuthentificationService.register('login',  function() { self.bind(scope, data); });
				AuthentificationService.register('logout', function() { delete scope[data.name]; });

				if (AuthentificationService.isUserLogged()) self.bind(scope, data);
			},

			findNodeName : function(data) {
				var position = data.link.lastIndexOf('/') + 1;
				return data.link.substring(position);
			},

			bind : function(scope, data) {
				var node = this.getNode(data.link);

				if (angular.isDefined(data.default)) {
					var newValue = angular.isDate(data.default) ? DateService.format(data.default) : data.default;
					this.intercept(node, function() { node.$set(newValue); });
				}
				node.$bind(scope, data.name);
			},

			intercept : function(node, callback) {
				node.$on('loaded', function(value) {
					// When value is empty, the node does not exist on server
					if (value == '') $timeout(callback);
				});
			},

			addExpense : function(expense) {
				this.getNode('/users/{{user}}/expenses').$add(expense);
			},

			sumExpenses : function(expenses) {
				var sum = 0;
				angular.forEach($filter('asArray')(expenses), function(expense) {
					sum += expense.cost;
				});
				return sum;
			},

			changeRemoteMonth : function(month) {
				var formattedMonth = DateService.format(month);
				this.getNode('/users/{{user}}/month').$set(formattedMonth);
				this.getNode('/users/{{user}}/expenses').$remove();
			},

			getNode : function(pattern) {
				var link = this.buildLink(pattern);
				return $firebase(new Firebase(REMOTE_SERVER + link));
			},

			buildLink : function(pattern) {
				return $interpolate(pattern)({
					user : AuthentificationService.getUserUid()
				});
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

			findCurrentMonth : function() {
				var today = new Date();
				return new Date(today.getFullYear(), today.getMonth(), 1);
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
			.when('/',						{ templateUrl : 'views/loading.html' })
			.when('/home',					{ controller : 'HomeController',	templateUrl : 'views/home.html' })
			.when('/expenses',				{ controller : 'ListController',	templateUrl : 'views/list.html' })
			.when('/expenses/summary',		{ controller : 'SummaryController',	templateUrl : 'views/summary.html' })
			.when('/expenses/add-entry',	{ controller : 'AddController',		templateUrl : 'views/detail.html' })
			.otherwise({ redirectTo : '/' });
	})

	.run(function(AuthentificationService) {
		AuthentificationService.initialize([
			{ onEvent : 'login',  redirectTo : '/expenses' },
			{ onEvent : 'logout', redirectTo : '/home' }
		]);
	})

	.controller('HeaderController', ['$scope', 'RemoteService', function ($scope, RemoteService) {
		RemoteService.inject($scope, { link : '/users/{{user}}/month' });
	}])

	.controller('HomeController', ['$scope', 'AuthentificationService', function ($scope, AuthentificationService) {
		$scope.login = function(provider) {
			AuthentificationService.login(provider, $scope.rememberMe);
		};
	}])

	.controller('ListController', ['$scope', '$window', 'RemoteService', 'DateService', 'AuthentificationService', function ($scope, $window, RemoteService, DateService, AuthentificationService) {

		RemoteService.inject($scope, { link : '/users/{{user}}/budget', default : 100 });
		RemoteService.inject($scope, { link : '/users/{{user}}/month',  default : DateService.findCurrentMonth() });
		RemoteService.inject($scope, { link : '/users/{{user}}/expenses' });

		$scope.computeRemainder = function() {
			return $scope.budget - RemoteService.sumExpenses($scope.expenses);
		};

		$scope.startNextMonth = function() {
			if ($window.confirm('Passer au mois suivant ?')) {
				var nextMonth = DateService.findNextMonth($scope.month);
				RemoteService.changeRemoteMonth(nextMonth);
			}
		};

		$scope.logout = function() {
			AuthentificationService.logout();
		};
	}])

	.controller('SummaryController', ['$scope', 'RemoteService', function ($scope, RemoteService) {
		RemoteService.inject($scope, { link : '/users/{{user}}/month' });
		RemoteService.inject($scope, { link : '/users/{{user}}/budget' });
		RemoteService.inject($scope, { link : '/users/{{user}}/expenses' });

		$scope.getExpensesSum = function() {
			return RemoteService.sumExpenses($scope.expenses);
		};
	}])

	.controller('AddController', ['$scope', '$location', 'RemoteService', 'DateService', function ($scope, $location, RemoteService, DateService) {

		RemoteService.inject($scope, { link : '/users/{{user}}/month' });
		RemoteService.inject($scope, { link : '/categories' });

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
