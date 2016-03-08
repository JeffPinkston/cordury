var app = angular.module('corduroy', ['ui.router']);

app.controller('AlbumCtrl', [
  '$scope',
  'albums',
  function($scope, albums, album){
	$scope.test = 'Hello World!';	
	$scope.albums = albums.albums;

	$scope.addAlbum = function() {
		if(!$scope.title || $scope.title === '') { return; }
		albums.create({
			title: $scope.title,
			link: $scope.link
		});
		$scope.title = '';
		$scope.link = '';
	};

	$scope.incrementUpvotes = function(album) {
		albums.upvote(album);
	};
}]);

app.controller('TracksCtrl', [
	'$scope',
	'albums',
	'album',
	function($scope, albums, album){
		$scope.album = album;

		$scope.addTrack = function(){
		  if($scope.title === '') { return; }
			 albums.addTrack(album._id, {
			 	title: $scope.title,
			 }).success(function(track){
			 	$scope.album.tracks.push(track);
			 });
		  $scope.title = '';
		};

		$scope.incrementUpvotes = function(track){
		  albums.upvoteTrack(album, track);
		};
}]);

app.factory('albums', [
	'$http',
	function($http){
	var o = {
		albums: []
	};

	o.getAll = function(){
		return $http.get('/albums').success(function(data){
			angular.copy(data, o.albums);
		});
	};

	o.create = function(album) {
		return $http.post('/albums', album).success(function(data){
			console.log(data);
			o.albums.push(data);
		});
	};

	o.upvote = function(album) {
		console.log(album);
		return $http.put('/albums/' + album._id + '/upvote')
			.success(function(data){
				album.upvotes += 1;
			});
	};

	o.get = function(id) {
		return $http.get('/albums/' + id).then(function(res){
			console.log(res.data);
			return res.data;
		});
	};

	o.addTrack = function(id, track) {
		console.log('Add Track');
		console.log(id);
		console.log(track);
		return $http.post('/albums/' + id + '/tracks', track);
	};

	o.upvoteTrack = function(album, track) {
	  return $http.put('/albums/' + album._id + '/tracks/'+ track._id + '/upvote')
	    .success(function(data){
	      track.upvotes += 1;
	    });
	};

	return o;
}]);

app.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

	$stateProvider
		.state('albums', {
			url: '/albums',
			templateUrl: '/albums.html',
			controller: 'AlbumCtrl',
			//resolve ensures anytime our home state is entered, we will automatically query all albums before state finished loading.
			resolve: {
				postPromise: ['albums', function(albums){
					return albums.getAll();
				}]
			}
		});

	$stateProvider
		.state('tracks', {
			url: '/tracks/{id}',  //id is a route parameter
			templateUrl: '/tracks.html',
			controller: 'TracksCtrl',
			resolve: {
				album: ['$stateParams', 'albums', function($stateParams, albums){
					console.log(albums.get($stateParams.id));
					return albums.get($stateParams.id);
				}]
			}
		});

	$urlRouterProvider.otherwise('albums');
}]);