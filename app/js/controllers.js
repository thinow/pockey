'use strict';

angular.module('Pockey.controllers', [])

	.controller('HeaderController', ['$scope', function ($scope) {
	}])

	.controller('HomeController', ['$rootScope', '$scope', 'AuthentificationService', function ($rootScope, $scope, AuthentificationService) {
		$rootScope.title = '';

		$scope.login = function(provider) {
			AuthentificationService.login(provider);
		};
	}])

	.controller('MenuController', ['$rootScope', '$scope', '$window', '$location', 'RemoteService', 'DateService', function ($rootScope, $scope, $window, $location, RemoteService, DateService) {
		$rootScope.title = 'Menu';

		RemoteService.inject($scope, { link : '/users/{{user}}/budget', defaultValue : 100 });
		RemoteService.inject($scope, { link : '/users/{{user}}/sum',    defaultValue : 0 });
		RemoteService.inject($scope, { link : '/users/{{user}}/month',  defaultValue : DateService.findCurrentMonth() });


		$scope.startNextMonth = function() {
			if ($window.confirm('Passer au mois suivant ?')) {
				var nextMonth = DateService.findNextMonth($scope.month);
				RemoteService.changeRemoteMonth(nextMonth);
			}
		};

		$scope.goTo = function(path) {
			return $location.path(path);
		};
	}])

	.controller('ListController', ['$rootScope', '$scope', 'RemoteService', function ($rootScope, $scope, RemoteService) {
		$rootScope.title = 'Dépenses';

		RemoteService.inject($scope, { link : '/users/{{user}}/budget' });
		RemoteService.inject($scope, { link : '/users/{{user}}/sum' });
		RemoteService.inject($scope, { link : '/users/{{user}}/expenses' });

		$scope.remove = function(id, expense) {
			RemoteService.removeExpense(id, expense);
		};
	}])

	.controller('SummaryController', ['$rootScope', '$scope', 'RemoteService', function ($rootScope, $scope, RemoteService) {
		$rootScope.title = 'Budget';

		RemoteService.inject($scope, { link : '/users/{{user}}/month' });
		RemoteService.inject($scope, { link : '/users/{{user}}/budget' });
		RemoteService.inject($scope, { link : '/users/{{user}}/sum' });
	}])

	.controller('DetailController', ['$rootScope', '$scope', '$location', '$routeParams', 'RemoteService', 'DateService', function ($rootScope, $scope, $location, $routeParams, RemoteService, DateService) {
		$rootScope.title = '';

		$scope.editMode = angular.isDefined($routeParams.id);

		RemoteService.inject($scope, { link : '/users/{{user}}/month' });
		RemoteService.inject($scope, { link : '/categories' });

		if ($scope.editMode) {
			RemoteService.inject($scope, {
				link    : '/users/{{user}}/expenses/' + $routeParams.id,
				name    : 'expense',
				unbound : true
			});
		}

		$scope.findDaysOfMonth = function() {
			return {
				first	: DateService.findFirstDayOfMonth($scope.month),
				last	: DateService.findLastDayOfMonth($scope.month)
			};
		};

		$scope.create = function() {
			RemoteService.addExpense($scope.expense);
			$scope.back();
		};

		$scope.update = function() {
			RemoteService.updateExpense($routeParams.id, $scope.expense);
			$scope.back();
		};

		$scope.back = function() {
			var previousPage = '/' + $routeParams.from;
			delete $location.$$search.from;
			$location.path(previousPage);
		}
	}])

	.controller('OptionsController', ['$rootScope', '$scope', '$window', 'RemoteService', 'AuthentificationService', function ($rootScope, $scope, $window, RemoteService, AuthentificationService) {
		$rootScope.title = 'Options';

		$scope.logout = function() {
			AuthentificationService.logout();
		};

		$scope.erase = function() {
			if ($window.confirm('Supprimer votre compte ?')) {
				RemoteService.eraseUser();
			}
		};
	}])
;
