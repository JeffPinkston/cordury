var express 	= require('express');
var router 		= express.Router();
var passport 	= require('passport');
var jwt 		= require('express-jwt');
var auth 		= jwt({ secret: 'SECRET', userProperty: 'payload' });

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

var mongoose = require('mongoose');
require('../models/Albums');
require('../models/Tracks');
require('../models/Users');
var User  = mongoose.model('User');
var Album = mongoose.model('Album');
var Track = mongoose.model('Track');

//get all albums from server
router.get('/albums', function(req, res, next){
	Album.find(function(err, albums){
		if(err){ return next(err); }

		res.json(albums);
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
		if(err) { return next(err); }
		if(!track) {return next(new Error('can\'t find track')); }

		req.track = track;

		return next();
	});
});


//BEGIN routes for Albums
//post new album
router.post('/albums', auth, function(req, res, next){
	var album = new Album(req.body);
	post.author = req.paylod.username;

	album.save(function(err, album){
		if(err){ return next(err); }

		res.json(album);
	})
});


router.get('/albums/:album', function(req, res, next){
	//use populate to load all tracks associated with album
	req.album.populate('tracks', function(err, album){
		if(err) { return next(err); }
		res.json(album);
	});
	
});

router.put('/albums/:album/upvote', auth, function(req, res, next){
	req.album.upvote(function(err, album){
		if(err) { return next(err); }

		res.json(album);
	});
});

//BEGIN routes for tracks
router.post('/albums/:album/tracks', auth, function(req, res, next){
	var track = new Track(req.body);
	track.album = req.album;
	comment.author = req.payload.username;

	track.save(function(err, track){
		if(err){ return next(err); }

		req.album.tracks.push(track);
		req.album.save(function(err, album){
			if(err){ return next(err); }

			res.json(track);
		});
	});
});

router.put('/albums/:album/tracks/:track/upvote', auth, function(req, res, next){
	req.album.upvote(function(err, album){
		if(err) { return next(err); }

		res.json(album);
	});

//User Authentication routes
router.post('/register', function(req, res, next){
	if(!req.body.username || !req.body.password){
		return res.status(400).json({message: 'Please fill out all fields.'})
	}

	var user = new User();

	user.username = req.body.username;

	user.setPassword(req.body.password);

	user.save(function(err){
		if(err){ return next(err); }

		return res.json({ token: user.generateJWT() })
		});

	});

	router.post('/login', function(req, res, next){
		if(!req.body.username || !req.body.password) {
			return res.status(400).json({ message: 'Please fill out all fields' });
		}

		passport.authenticate('local', function(er, user, info){
			if(err){ return next(err); }

			if(user){
				return res.json({ token: user.generateJWT() });
			} else {
				return res.status(401).json(info);
			}
		})(req, res, next);
	});

	//middleware for authenicating jwt tokens
	
});

module.exports = router;
