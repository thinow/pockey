'use strict';

angular.module('Pockey.controllers', [])

	.factory('$do', ['$rootScope', function($rootScope) {
		return {
			defineTitle : function(title) {
				$rootScope.title = title;
			}
		};
	}])

	.controller('HeaderController', function() {})

	.controller('HomeController', ['$scope', '$do', 'AuthentificationService', function ($scope, $do, AuthentificationService) {
		$do.defineTitle('');

		$scope.login = function(provider) {
			AuthentificationService.login(provider);
		};
	}])

	.controller('MenuController', ['$scope', '$do', '$window', '$location', 'RemoteService', 'DateService', function ($scope, $do, $window, $location, RemoteService, DateService) {
		$do.defineTitle('Menu');

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

	.controller('ListController', ['$scope', '$do', 'RemoteService', function ($scope, $do, RemoteService) {
		$do.defineTitle('Dépenses');

		RemoteService.inject($scope, { link : '/users/{{user}}/budget' });
		RemoteService.inject($scope, { link : '/users/{{user}}/sum' });
		RemoteService.inject($scope, { link : '/users/{{user}}/expenses' });

		$scope.remove = function(id, expense) {
			RemoteService.removeExpense(id, expense);
		};
	}])

	.controller('SummaryController', ['$scope', '$do', 'RemoteService', function ($scope, $do, RemoteService) {
		$do.defineTitle('Budget');

		RemoteService.inject($scope, { link : '/users/{{user}}/month' });
		RemoteService.inject($scope, { link : '/users/{{user}}/budget' });
		RemoteService.inject($scope, { link : '/users/{{user}}/sum' });
	}])

	.controller('DetailController', ['$scope', '$do', '$location', '$routeParams', 'RemoteService', 'DateService', function ($scope, $do, $location, $routeParams, RemoteService, DateService) {
		$do.defineTitle('');

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

	.controller('OptionsController', ['$scope', '$do', '$window', 'RemoteService', 'AuthentificationService', function ($scope, $do, $window, RemoteService, AuthentificationService) {
		$do.defineTitle('Options');

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
