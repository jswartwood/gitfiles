var util = require("util"),
		stream = require("stream");

// Define the pattern for finding files in logs.
var statusMatcher = /^([ADMR])\s+(.+?)$/,
		// And the pattern for finding newlines.
		newlineMatcher = /(?:\n)|(?:\r\n)|(?:\r)/;

function StatusStream( opts ) {
	// Silly JS `new` keyword.
	if (!(this instanceof StatusStream))
		return new StatusStream(opts);

	stream.Transform.call(this, opts);
	// Map of statuses to exclude;
	// setting any to true will
	// prevent sending that file.
	this.excludeStatus = {
		A: false,
		D: false,
		M: false,
		R: false,
	};
	// Internal unique file ref cache.
	this._unique = {};
	// Should we only send unique files?
	this.unique = true;
	// Define newline character
	this.newline = "\n";
}

// Inherit from Transform.
//StatusStream.prototype = Object.create(stream.Transform.prototype, { constructor: { value: stream.Transform }});
util.inherits(StatusStream, stream.Transform);

StatusStream.prototype._transform = function( chunk, encoding, done ) {
	// Split chunks into 
	var lines = chunk.toString().split(newlineMatcher);
	
	for (var i = 0, j = lines.length; i < j; i++) {
		// Try to push each line as a file
		pushFile.call(this, lines[i]);
	}
	
	// We're done here.
	done();
};

function pushFile( line ) {
	// Attempt to match line as a file.
	var fileStatus = line.match(statusMatcher);
	// Give up if no status match found
	if (!fileStatus) return;

	// Split match into status & file.
	var status = fileStatus[1],
			file = fileStatus[2];
	
	// Give up if results should be unique
	// and this file has been sent already.
	if (this.unique && this._unique[file]) return;
	this._unique[file] = true;
	// Give up if status should be excluded.
	if (this.excludeStatus[status]) return;
	
	// Send file
	this.push(file + this.newline);
}

module.exports = StatusStream;

