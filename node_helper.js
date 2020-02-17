var http = require('http');
var fs = require('fs');
var del = require('del');
var request = require('request'); 
var NodeHelper = require("node_helper");

module.exports = NodeHelper.create({

	start: function() {
		console.log("Starting node helper: " + this.name);
	},

	socketNotificationReceived: function(notification, payload) {
		console.log("Downloading weather map with signal: " + notification + " From URL: " + payload.domain + payload.path);
		if (notification === "FETCH_MAP"){
			var self = this;
			var options = {
				host: payload.domain,
				path: payload.path
			};
			var newImage =null
			var pngFiles = payload.mmDir + 'modules/mmm-weatherchart/cache/*.png';
			del.sync([pngFiles]);			
			http.get(options, function (response) {
				if(response.statusCode == 200){
					console.log("received good status")
					var cachedFile = 'modules/mmm-weatherchart/cache/map-' + new Date().getTime() + '.png';
					let np =payload.mmDir + cachedFile;
					console.log("writing to "+np);
					newImage = fs.createWriteStream(np);				
					response.on('data', function(chunk){
						newImage.write(chunk);
					});
					response.on('end', function(){
						newImage.end();
						self.sendSocketNotification("MAPPED", cachedFile);
				});
				}
			});
		}
	},
});
