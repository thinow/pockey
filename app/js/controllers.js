'use strict';

angular.module('Pockey.controllers', [])

	.controller('HeaderController', ['$scope', 'RemoteService', function ($scope, RemoteService) {
		RemoteService.inject($scope, { link : '/users/{{user}}/month' });
	}])

	.controller('HomeController', ['$scope', 'AuthentificationService', function ($scope, AuthentificationService) {
		$scope.login = function(provider) {
			AuthentificationService.login(provider, $scope.rememberMe);
		};
	}])

	.controller('MenuController', ['$scope', 'RemoteService', 'DateService', function ($scope, RemoteService, DateService) {
		RemoteService.inject($scope, { link : '/users/{{user}}/budget', default : 100 });
		RemoteService.inject($scope, { link : '/users/{{user}}/month',  default : DateService.findCurrentMonth() });
		RemoteService.inject($scope, { link : '/users/{{user}}/expenses' });

		$scope.computeRemainder = function() {
			return $scope.budget - RemoteService.sumExpenses($scope.expenses);
		};
	}])

	.controller('ListController', ['$scope', '$window', 'RemoteService', 'DateService', 'AuthentificationService', function ($scope, $window, RemoteService, DateService, AuthentificationService) {
		RemoteService.inject($scope, { link : '/users/{{user}}/budget' });
		RemoteService.inject($scope, { link : '/users/{{user}}/month' });
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
	}])
;