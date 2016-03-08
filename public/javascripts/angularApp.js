var app = angular.module('corduroy', ['ui.router']);

app.controller('MainCtrl', [
  '$scope',
  'albums', 
  function($scope, albums){
	$scope.test = 'Hello World!';	
	$scope.albums = albums.albums;

	$scope.addAlbum = function() {
		if(!$scope.title || $scope.title === '') { return; }
		$scope.albums.push({
			title: $scope.title,
			link: $scope.link,
			upvotes: 0,
			tracks: [
			  {author: 'Pearl Jam', title: 'Once', upvotes: 0, date: ''},
			  {author: 'Pearl Jam', title: 'Even Flow', upvotes: 0, date: ''}
			]
		});
		$scope.title = '';
		$scope.link = '';
	};

	$scope.incrementUpvotes = function(album) {
		album.upvotes += 1;
	};
}]);

app.controller('AlbumsCtrl', [
	'$scope',
	'$stateParams',
	'albums',
	function($scope, $stateParams, albums){
		$scope.album = albums.albums[$stateParams.id];

		$scope.addTrack = function(){
		  if($scope.title === '') { return; }
			  $scope.album.tracks.push({
			    title: $scope.title,
			    author: 'user',
			    upvotes: 0
			  });
		  $scope.title = '';
		};

		$scope.incrementUpvotes = function(album) {
			album.upvotes += 1;
		};
}]);

app.factory('albums', [function(){
	var o = {
		albums: []
	};
	return o;
}]);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('home', {
			url: '/home',
			templateUrl: '/home.html',
			controller: 'MainCtrl'
		});

	$stateProvider
		.state('albums', {
			url: '/albums/{id}',  //id is a route parameter
			templateUrl: '/albums.html',
			controller: 'AlbumsCtrl'
		});

	$urlRouterProvider.otherwise('home');
}]);