'use strict';

angular.module('Pockey.controllers', [])

	.controller('HeaderController', ['$scope', 'RemoteService', function ($scope, RemoteService) {
		RemoteService.inject($scope, { link : '/users/{{user}}/month' });
	}])

	.controller('HomeController', ['$scope', 'AuthentificationService', function ($scope, AuthentificationService) {
		$scope.login = function(provider) {
			AuthentificationService.login(provider);
		};
	}])

	.controller('MenuController', ['$scope', '$window', '$location', 'RemoteService', 'DateService', function ($scope, $window, $location, RemoteService, DateService) {
		RemoteService.inject($scope, { link : '/users/{{user}}/budget', default : 100 });
		RemoteService.inject($scope, { link : '/users/{{user}}/sum',    default : 0 });
		RemoteService.inject($scope, { link : '/users/{{user}}/month',  default : DateService.findCurrentMonth() });

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

	.controller('ListController', ['$scope', 'RemoteService', function ($scope, RemoteService) {
		RemoteService.inject($scope, { link : '/users/{{user}}/budget' });
		RemoteService.inject($scope, { link : '/users/{{user}}/sum' });
		RemoteService.inject($scope, { link : '/users/{{user}}/expenses' });

		$scope.remove = function(id, expense) {
			RemoteService.removeExpense(id, expense);
		};
	}])

	.controller('SummaryController', ['$scope', 'RemoteService', function ($scope, RemoteService) {
		RemoteService.inject($scope, { link : '/users/{{user}}/month' });
		RemoteService.inject($scope, { link : '/users/{{user}}/budget' });
		RemoteService.inject($scope, { link : '/users/{{user}}/sum' });
	}])

	.controller('AddController', ['$scope', '$location', '$routeParams', 'RemoteService', 'DateService', function ($scope, $location, $routeParams, RemoteService, DateService) {
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

	.controller('OptionsController', ['$scope', '$window', 'RemoteService', 'AuthentificationService', function ($scope, $window, RemoteService, AuthentificationService) {
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