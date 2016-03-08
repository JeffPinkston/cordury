var mongoose = require('mongoose');

var AlbumSchema = new mongoose.Schema({
	title: String,
	year: {type: String, default: '1996'},
	upvotes: {type: Number, default: 0},
	tracks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Track'}]
});

AlbumSchema.methods.upvote = function(cb) {
	this.upvotes += 1;
	this.save(cb);
}

mongoose.model('Album', AlbumSchema);