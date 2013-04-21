var util = require("util"),
		stream = require("stream");

var statusMatch = /^([ADMR]) (.+)$/;

function StatusStream( opts ) {
	if (!(this instanceof StatusStream))
		return new StatusStream(opts);

	stream.Transform.call(this, opts);

	this.excludeStatus = {
		A: false,
		D: false,
		M: false,
		R: false,
	};
}

//StatusStream.prototype = Object.create(stream.Transform.prototype, { constructor: { value: stream.Transform }});
util.inherits(StatusStream, stream.Transform);

StatusStream.prototype._transform = function( chunk, encoding, done ) {
	var statusMatched = chunk.toString().match(statusMatch);

	if (statusMatched && !this.excludeStatus[statusMatched[1]]) {
		this.push(statusMatched[2]);
	}

	done(null);
};

module.exports = StatusStream;

