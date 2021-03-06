'use strict';

angular.module('Pockey', [
		'ngRoute',
		'Pockey.filters',
		'Pockey.controllers',
		'Pockey.service.authentification',
		'Pockey.service.date',
		'Pockey.service.remote'
	])

	.constant('REMOTE_SERVER', 'https://pockey-dev.firebaseio.com')

	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/',                      { templateUrl : 'views/loading.html', controller : undefined })
			.when('/home',                  { templateUrl : 'views/home.html',    controller : 'HomeController' })
			.when('/menu',                  { templateUrl : 'views/menu.html',    controller : 'MenuController' })
			.when('/expenses',              { templateUrl : 'views/list.html',    controller : 'ListController' })
			.when('/expenses/summary',      { templateUrl : 'views/summary.html', controller : 'SummaryController' })
			.when('/expenses/add',          { templateUrl : 'views/detail.html',  controller : 'DetailController' })
			.when('/expenses/edit/:id',     { templateUrl : 'views/detail.html',  controller : 'DetailController' })
			.when('/options',               { templateUrl : 'views/options.html', controller : 'OptionsController' })
			.otherwise({ redirectTo : '/' });
	}])

	.run(['AuthentificationService', function(AuthentificationService) {
		AuthentificationService.initialize([
			{ onEvent : 'login',  redirectTo : '/menu' },
			{ onEvent : 'logout', redirectTo : '/home' }
		]);
	}])
;
