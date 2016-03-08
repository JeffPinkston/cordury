var mongoose = require('mongoose');

var AlbumSchema = new mongoose.Schema({
	title: String,
	link: String,
	upvotes: {type: Number, default: 0},
	tracks: [{type: mongoose.Schema.Types.ObjectId, ref: 'Track'}]
});

mongoose.mode('Album', AlbumSchema);