'use strict';

angular.module('Pockey.controllers', [])

	.factory('$do', ['$rootScope', '$window', '$location', '$routeParams', function($rootScope, $window, $location, $routeParams) {
		return {
			defineTitle : function(title) {
				$rootScope.title = title;
			},

			ask : function(message) {
				var confirm = $window.confirm(message);
				if (confirm) return { onConfirm : function(callback) { callback(); } };
				else         return { onConfirm : function() {} };
			},

			ifExistsInUrl : function(parameter) {
				var value = this.getFromUrl(parameter);
				if (angular.isDefined(value)) return { then : function(callback) { callback(value); } };
				else                          return { then : function() {} };
			},

			getFromUrl : function(parameter, options) {
				var value = $routeParams[parameter];
				if (angular.isDefined(options) && options.remove) {
					delete $location.$$search[parameter];
				}
				return value;
			},

			redirect : function(path, parameters) {
				angular.forEach(parameters, function(value, key) {
					$location.search(key, value);
				})
				$location.path(path);
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

	.controller('MenuController', ['$scope', '$do', 'RemoteService', 'DateService', function ($scope, $do, RemoteService, DateService) {
		$do.defineTitle('Menu');

		RemoteService.inject($scope, { link : '/users/{{user}}/budget', defaultValue : 100 });
		RemoteService.inject($scope, { link : '/users/{{user}}/sum',    defaultValue : 0 });
		RemoteService.inject($scope, { link : '/users/{{user}}/month',  defaultValue : DateService.findCurrentMonth() });

		$scope.startNextMonth = function() {
			$do.ask('Passer au mois suivant ?').onConfirm(function() {
				var nextMonth = DateService.findNextMonth($scope.month);
				RemoteService.changeRemoteMonth(nextMonth);
			});
		};

		$scope.goTo = $do.redirect;
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

	.controller('DetailController', ['$scope', '$do', 'RemoteService', 'DateService', function ($scope, $do, RemoteService, DateService) {
		$do.defineTitle('');

		RemoteService.inject($scope, { link : '/users/{{user}}/month' });
		RemoteService.inject($scope, { link : '/categories' });

		$do.ifExistsInUrl('id').then(function(id) {
			$scope.editMode = true;
			RemoteService.inject($scope, {
				link    : '/users/{{user}}/expenses/' + id,
				name    : 'expense',
				unbound : true
			});
		});

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
			RemoteService.updateExpense($do.getFromUrl('id'), $scope.expense);
			$scope.back();
		};

		$scope.back = function() {
			var previousPage = $do.getFromUrl('from', { remove : true });
			$do.redirect('/' + previousPage);
		}
	}])

	.controller('OptionsController', ['$scope', '$do', 'RemoteService', 'AuthentificationService', function ($scope, $do, RemoteService, AuthentificationService) {
		$do.defineTitle('Options');

		$scope.logout = function() {
			AuthentificationService.logout();
		};

		$scope.erase = function() {
			$do.ask('Supprimer votre compte ?').onConfirm(function() {
				RemoteService.eraseUser();
			});
		};
	}])
;
