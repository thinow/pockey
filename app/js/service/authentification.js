'use strict';

angular.module('Pockey.service.authentification', ['firebase'])

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

			login : function(provider) {
				this.auth.$login(provider, {
					rememberMe : true
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
;