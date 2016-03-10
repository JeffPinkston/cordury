var mongoose = require('mongoose');

var TrackSchema = new mongoose.Schema({
	author: {type: String, default: 'Pearl Jam'},
	title: String,
	upvotes: {type: Number, default: 0},
	album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album'},
	author: String
});

TrackSchema.methods.upvote = function(cb) {
	this.upvotes += 1;
	this.save(cb);
}

mongoose.model('Track', TrackSchema);