var util = require("util"),
		stream = require("stream");

var statusMatcher = /^([ADMR])\s+(.+?)$/;

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

	this.newline = "\n";
}

//StatusStream.prototype = Object.create(stream.Transform.prototype, { constructor: { value: stream.Transform }});
util.inherits(StatusStream, stream.Transform);

StatusStream.prototype._transform = function( chunk, encoding, done ) {
	var lines = chunk.toString().split(/(?:\n)|(?:\r\n)|(?:\r)/);
	
	for (var i = 0, j = lines.length; i < j; i++) {
		pushFile.call(this, lines[i]);
	}
	
	done(null);
};

function pushFile( line ) {
	var fileStatus = line.match(statusMatcher);
	if (fileStatus && !this.excludeStatus[fileStatus[1]]) {
		this.push(fileStatus[2] + this.newline);
	}
}

module.exports = StatusStream;

