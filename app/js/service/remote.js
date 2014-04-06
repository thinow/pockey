'use strict';

angular.module('Pockey.service.remote', ['firebase'])

	.factory('RemoteService', ['REMOTE_SERVER', '$firebase', 'AuthentificationService', 'DateService', '$interpolate', '$timeout', function(REMOTE_SERVER, $firebase, AuthentificationService, DateService, $interpolate, $timeout) {
		return {
			inject : function(scope, data) {
				if (angular.isUndefined(data.name)) {
					data.name = this.findNodeName(data);
				}

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
				node.$bind(scope, data.name).then(function(unbind) {
					if (data.unbound) unbind();
				});

				this.forceDefault(data);
			},

			forceDefault : function(data) {
				if (angular.isUndefined(data.defaultValue)) return;

				var newValue = angular.isDate(data.defaultValue) ? DateService.format(data.defaultValue) : data.defaultValue;
				this.doOnce(data.link, function(ref, value) {
					console.log(data.link + ' >>> [' + value + '] and default = [' + newValue + ']');
					// When value is null, the node does not exist on server
					if (value === null) ref.set(newValue);
				})
			},

			updateExpense : function(id, expense) {
				var self = this;
				this.doOnce('/users/{{user}}/expenses/' + id, function(ref, old) {
					self.doOnce('/users/{{user}}/sum', function(sum, value) {
						sum.set((value - old.cost) + expense.cost);
					});
					self.getRef('/users/{{user}}/expenses/' + id).remove();
					self.getNode('/users/{{user}}/expenses').$add(expense);
				});
			},

			addExpense : function(expense) {
				this.doOnce('/users/{{user}}/sum', function(sum, value) {
					sum.set(value + expense.cost);
				});
				this.getNode('/users/{{user}}/expenses').$add(expense);
			},

			removeExpense : function(id, expense) {
				this.doOnce('/users/{{user}}/sum', function(sum, value) {
					sum.set(value - expense.cost);
				});
				this.getRef('/users/{{user}}/expenses/' + id).remove();
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
	}])
;