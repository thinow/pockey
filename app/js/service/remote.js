'use strict';

angular.module('Pockey.service.remote', ['firebase'])

	.factory('RemoteService', function(REMOTE_SERVER, $firebase, AuthentificationService, DateService, $interpolate, $timeout) {
		return {
			inject : function(scope, data) {
				data.name = this.findNodeName(data);

				var self = this;
				AuthentificationService.register('login',  function() { self.bind(scope, data); });
				AuthentificationService.register('logout', function() { delete scope[data.name]; });

				if (AuthentificationService.isUserLogged()) self.bind(scope, data);
			},

			findNodeName : function(data) {
				var position = data.link.lastIndexOf('/') + 1;
				return data.link.substring(position);
			},

			bind : function(scope, data) {
				var node = this.getNode(data.link);

				if (angular.isDefined(data.default)) {
					var newValue = angular.isDate(data.default) ? DateService.format(data.default) : data.default;
					this.intercept(node, function() { node.$set(newValue); });
				}
				node.$bind(scope, data.name);
			},

			intercept : function(node, callback) {
				node.$on('loaded', function(value) {
					// When value is empty, the node does not exist on server
					if (value == '') $timeout(callback);
				});
			},

			addExpense : function(expense) {
				this.doOnce('/users/{{user}}/sum', function(sum, value) {
					sum.set(value + expense.cost);
				});
				this.getNode('/users/{{user}}/expenses').$add(expense);
			},

			changeRemoteMonth : function(month) {
				var formattedMonth = DateService.format(month);
				this.getNode('/users/{{user}}/month').$set(formattedMonth);
				this.getNode('/users/{{user}}/sum').$set(0);
				this.getNode('/users/{{user}}/expenses').$remove();
			},

			eraseUser : function() {
				this.getRef('/users/{{user}}').remove(function() {
					AuthentificationService.logout();
				});
			},

			remove : function(pattern) {
				this.getRef(pattern).remove();
			},

			doOnce : function(pattern, callback) {
				var ref = this.getRef(pattern);
				ref.once('value', function(snapshot) {
					callback(ref, snapshot.val());
				});
			},

			getNode : function(pattern) {
				return $firebase(this.getRef(pattern));
			},

			getRef : function(pattern) {
				var link = this.buildLink(pattern);
				return new Firebase(REMOTE_SERVER + link);
			},

			buildLink : function(pattern) {
				return $interpolate(pattern)({
					user : AuthentificationService.getUserUid()
				});
			}
		};
	})
;