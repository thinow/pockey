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
;