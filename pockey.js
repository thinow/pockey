function ListController($scope, $window) {

	$scope.categories = [
	    { text : 'Repas',	icon : 'cutlery',	color : 'danger' },
	    { text : 'Loisirs',	icon : 'film',		color : 'primary' },
	    { text : 'Soirées',	icon : 'glass',		color : 'warning' },
	    { text : 'Amis',	icon : 'user',		color : 'success' },
	    { text : 'Divers',	icon : 'euro',		color : 'info' }
	];

	$scope.expenses = [
	    { date : '2013-10-15',	cost : 35,	category : $scope.categories[0] },
	    { date : '2013-10-14',	cost : 12,	category : $scope.categories[1] },
	    { date : '2013-10-10',	cost : 21,	category : $scope.categories[2] },
	    { date : '2013-10-10',	cost : 5,	category : $scope.categories[3] },
	    { date : '2013-10-08',	cost : 8,	category : $scope.categories[4] },
	    { date : '2013-10-07',	cost : 15,	category : $scope.categories[2] }
	];

	$scope.findLastDate = function() {
		var dates = new Array();
		angular.forEach($scope.expenses, function(expense) {
			dates.push(new Date(expense.date).getTime());
		});

		return max(dates);
	};

	max = function(array) {
		return $window.Math.max.apply(null, array);
	}
}