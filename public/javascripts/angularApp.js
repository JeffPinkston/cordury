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

app.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth){
		$scope.user = {};

		$scope.register = function() {
			console.log('AuthCtrl.register');
			auth.register($scope.user).error(function(error){
				$scope.error = error;
			}).then(function(){
				$state.go('albums');
			});
		}
	}
]);

//craete factory for albums
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
			//console.log(data);
			o.albums.push(data);
		});
	};

	o.upvote = function(album) {
		//console.log(album);
		return $http.put('/albums/' + album._id + '/upvote')
			.success(function(data){
				album.upvotes += 1;
			});
	};
	/**
	 * get - returns single album from collection based on id
	 * @param  {String} id album id
	 * @return {Album}    single ablumb from collection
	 */
	o.get = function(id) {
		return $http.get('/albums/' + id).then(function(res){
			//console.log(res.data);
			return res.data;
		});
	};

    /**
     * Adds Track to currently selected Album
     * @param {String} id    Album _id
     * @param {Track} track track 
     */
	o.addTrack = function(id, track) {
		console.log('Add Track');
		console.log(id);
		console.log(track);
		return $http.post('/albums/' + id + '/tracks', track);
	};

	/**
	 * upvoteTrack increments upvote prop of selected track
	 * @param  {Album} album 
	 * @param  {Track} track 
	 * @return {Obj}   album collection
	 */
	o.upvoteTrack = function(album, track) {
	  return $http.put('/albums/' + album._id + '/tracks/'+ track._id + '/upvote')
	    .success(function(data){
	      track.upvotes += 1;
	    });
	};

	return o;
}]);

app.factory('auth', ['$http', '$window', function($http, $window){
	var auth = {};

	auth.saveToken = function(token) {
		$window.localStorage['corduroy-token'] = token;
	};

	auth.getToken = function() {
		return $window.localStorage['corduroy-token'];
	};

	auth.isLoggedIn = function() {
		var token = auth.getToken();

		if(token) {
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUser = function() {
		if(auth.isLoggedIn()){
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user) {
		console.log(user);
		return $http.post('/register', user).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logIn = function(user) {
		console.log(user);
		return $http.post('/login', user).success(function(data){
			auth.saveToken(data.token);
		});
	};

	auth.logOut = function(){
	  $window.localStorage.removeItem('corduroy-token');
	};

	return auth;
}]);

app.controller('NavCtrl', [
	'$scope',
	'auth',
	function($scope, auth){
		$scope.isLoggedIn = auth.isLoggedIn;
		$scope.currentUser = auth.currentUser;
		$scope.logOut = auth.logOut;
	}

	]);

//config state provider for various states
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
					//console.log(albums.get($stateParams.id));
					return albums.get($stateParams.id);
				}]
			}
		});

	$stateProvider
		.state('login', {
			url: '/login',
			templateUrl: '/login.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'auth', function($state, auth){
				if(auth.isLoggedIn()) {
					$state.go('albums');
				}
			}]
		});

	$stateProvider
		.state('register', {
			url: '/register',
			templateUrl: '/register.html',
			controller: 'AuthCtrl',
			onEnter: ['$state', 'auth', function($state, auth){
				if(auth.isLoggedIn()) {
					$state.go('albums');
				}
			}]
		});

	$urlRouterProvider.otherwise('albums');
}]);