var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
require('../models/Albums');
require('../models/Tracks');
var Album = mongoose.model('Album');
var Track = mongoose.model('Track');

//get all albums from server
router.get('/albums', function(req, res, next){
	Album.find(function(err, albums){
		if(err){ return next(err); }

		res.json(albums)
	});
});

//BEGIN Define route Objects used in parameters
router.param('album', function(req, res, next, id){
	var query = Album.findById(id);

	query.exec(function (err, album){
		if(err) { return next(err); }
		if(!album) {return next(new Error('can\'t find album')); }

		req.album = album;

		return next();
	});
});

//create :track parameter to include in urls requiring an Album track loaded by id
router.param('track', function(req, res, next, id){
	var query = Track.findById(id);

	query.exec(function (err, track){
		console.log('PARAM TRACK');
		console.log(track);
		if(err) { return next(err); }
		if(!track) {return next(new Error('can\'t find track')); }

		req.track = track;

		return next();
	});
});


//BEGIN routes for Albums
//post new album
router.post('/albums', function(req, res, next){
	var album = new Album(req.body);

	album.save(function(err, album){
		if(err){ return next(err); }

		res.json(album);
	})
});


router.get('/albums/:album', function(req, res, next){
	//use populate to load all tracks associated with album
	req.album.populate('tracks', function(err, album){
		if(err) { return next(err); }
		console.log('Populate');
		console.log(album);
		res.json(album);
	});
	
});

router.put('/albums/:album/upvote', function(req, res, next){
	req.album.upvote(function(err, album){
		if(err) { return next(err); }

		res.json(album);
	});
});

//BEGIN routes for tracks
router.post('/albums/:album/tracks', function(req, res, next){
	console.log('Add Track Response:');
	console.log(res);
	var track = new Track(req.title);
	track.album = req.album;
	console.log(track);
	track.save(function(err, track){
		if(err){ return next(err); }

		req.album.tracks.push(track);
		req.album.save(function(err, album){
			if(err){ return next(err); }

			res.json(track);
		});
	});
});

router.put('/albums/:album/tracks/:track/upvote', function(req, res, next){
	req.album.upvote(function(err, album){
		if(err) { return next(err); }

		res.json(album);
	});
});

module.exports = router;
