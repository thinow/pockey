'use strict';

angular.module('Pockey.controllers', [])

	.factory('$helper', ['$rootScope', function($rootScope) {
		return {
			defineTitle : function(title) {
				$rootScope.title = title;
			}
		};
	}])

	.controller('HeaderController', function() {})

	.controller('HomeController', ['$scope', '$helper', 'AuthentificationService', function ($scope, $helper, AuthentificationService) {
		$helper.defineTitle('');

		$scope.login = function(provider) {
			AuthentificationService.login(provider);
		};
	}])

	.controller('MenuController', ['$scope', '$helper', '$window', '$location', 'RemoteService', 'DateService', function ($scope, $helper, $window, $location, RemoteService, DateService) {
		$helper.defineTitle('Menu');

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

	.controller('ListController', ['$scope', '$helper', 'RemoteService', function ($scope, $helper, RemoteService) {
		$helper.defineTitle('Dépenses');

		RemoteService.inject($scope, { link : '/users/{{user}}/budget' });
		RemoteService.inject($scope, { link : '/users/{{user}}/sum' });
		RemoteService.inject($scope, { link : '/users/{{user}}/expenses' });

		$scope.remove = function(id, expense) {
			RemoteService.removeExpense(id, expense);
		};
	}])

	.controller('SummaryController', ['$scope', '$helper', 'RemoteService', function ($scope, $helper, RemoteService) {
		$helper.defineTitle('Budget');

		RemoteService.inject($scope, { link : '/users/{{user}}/month' });
		RemoteService.inject($scope, { link : '/users/{{user}}/budget' });
		RemoteService.inject($scope, { link : '/users/{{user}}/sum' });
	}])

	.controller('DetailController', ['$scope', '$helper', '$location', '$routeParams', 'RemoteService', 'DateService', function ($scope, $helper, $location, $routeParams, RemoteService, DateService) {
		$helper.defineTitle('');

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

	.controller('OptionsController', ['$scope', '$helper', '$window', 'RemoteService', 'AuthentificationService', function ($scope, $helper, $window, RemoteService, AuthentificationService) {
		$helper.defineTitle('Options');

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
