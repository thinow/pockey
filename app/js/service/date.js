'use strict';

angular.module('Pockey.service.date', [])

	.factory('DateService', ['$filter', function($filter) {
		return {
			createDate : function(string) {
				return new Date(string);
			},

			format : function(date) {
				return $filter('date')(date, 'yyyy-MM-dd');
			},

			findCurrentMonth : function() {
				var today = new Date();
				return new Date(today.getFullYear(), today.getMonth(), 1);
			},

			findFirstDayOfMonth : function(string) {
				var date = this.createDate(string);
				return new Date(date.getFullYear(), date.getMonth(), 1);
			},

			findLastDayOfMonth : function(string) {
				var date = this.createDate(string);
				return new Date(date.getFullYear(), date.getMonth() + 1, 0);
			},

			findNextMonth : function(string) {
				var date = this.createDate(string);
				date.setMonth(date.getMonth() + 1);
				return date;
			}
		};
	}])
;