'use strict'

let sampleJson = require('../data/attempt');
let exec = require('child_process').execFile;
let fs = require('fs');

module.exports = function(io, firebase) {
	io.on('connection', function(socket) {
		console.log('io connected');
	  	var db = firebase.database();
	  	var ref = db.ref("/patterns");

	  	ref.on("child_added", function(snapshot) {
			fs.writeFile('samplePath2.json', JSON.stringify(snapshot.val()), function(err) {
			    if(err) {
			        return console.log(err);
			    }

			    console.log("The file samplePath2 was saved!");
			}); 
		});

	  	exec('./script.sh', function(err, data) {  
	    	console.log(err);
	    	console.log(data.toString());
	  	});


    	socket.on('verifyPatterns', function(data) {
		    // console.log(data);
		    console.log(sampleJson);

		      
			ref.set({
				patterns: sampleJson
			})
				console.log('done');

	  //     ref.once("value", function(snapshot) {
			// console.log(snapshot.val());
		 //  });

    	});
	});
}
