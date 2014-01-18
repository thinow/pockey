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
				$rootScope.$on('$firebaseAuth:' + event, function(error, user) {
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

	.factory('RemoteService', function(REMOTE_SERVER, $firebase, AuthentificationService, DateService, $interpolate) {
		return {
			inject : function(scope, link) {
				var self = this;
				var name = this.findNodeName(link);

				AuthentificationService.register('login',  function() { self.bind(scope, link, name); });
				AuthentificationService.register('logout', function() { delete scope[name]; });

				if (AuthentificationService.isUserLogged()) self.bind(scope, link, name);
			},

			findNodeName : function(link) {
				var position = link.lastIndexOf('/') + 1;
				return link.substring(position);
			},

			bind : function(scope, link, name) {
				this.getNode(link).$bind(scope, name).then(function(unbind) {
				});
			},

			addExpense : function(expense) {
				this.getNode('/users/{{user}}/expenses').$add(expense);
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
			.when('/',						{ templateUrl : 'loading.html' })
			.when('/home',					{ controller : 'HomeController',	templateUrl : 'home.html' })
			.when('/expenses',				{ controller : 'ListController',	templateUrl : 'list.html' })
			.when('/expenses/add-entry',	{ controller : 'AddController',		templateUrl : 'detail.html' })
			.otherwise({ redirectTo : '/' });
	})

	.run(function(AuthentificationService) {
		AuthentificationService.initialize([
			{ onEvent : 'login',  redirectTo : '/expenses' },
			{ onEvent : 'logout', redirectTo : '/home' }
		]);
	})

	.controller('HeaderController', ['$scope', 'RemoteService', function ($scope, RemoteService) {
		RemoteService.inject($scope, '/users/{{user}}/month');
	}])

	.controller('HomeController', ['$scope', 'AuthentificationService', function ($scope, AuthentificationService) {
		$scope.login = function(provider) {
			AuthentificationService.login(provider, $scope.rememberMe);
		};
	}])

	.controller('ListController', ['$scope', '$filter', '$window', 'RemoteService', 'DateService', 'AuthentificationService', function ($scope, $filter, $window, RemoteService, DateService, AuthentificationService) {

		RemoteService.inject($scope, '/users/{{user}}/budget');
		RemoteService.inject($scope, '/users/{{user}}/month');
		RemoteService.inject($scope, '/users/{{user}}/expenses');

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

		$scope.logout = function() {
			AuthentificationService.logout();
		};
	}])

	.controller('AddController', ['$scope', '$location', 'RemoteService', 'DateService', function ($scope, $location, RemoteService, DateService) {

		RemoteService.inject($scope, '/users/{{user}}/month');
		RemoteService.inject($scope, '/categories');

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
