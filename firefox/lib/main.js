var data = require("sdk/self").data;
var pageMod = require("sdk/page-mod");
var request = require("sdk/request").Request;

require("sdk/tabs").on("ready", runScript);

var out = [];
var url = 'http://httpbin.org/post';

function sendData(data) {
	console.log("sendData sending");
	var str = JSON.stringify(data);
	request({
	  url: url,
	  content: str,
	  contentType: "application/json",
	  anonymous: true,
	  onComplete: function (response) {
	    console.log('sendData', response);
	  }
	}).post(data);

	// var xhr = new XMLHttpRequest();
	// xhr.open("POST", url, true);
	// xhr.setRequestHeader("Content-type","application/json");
	// xhr.onreadystatechange = function() {
	// 	if (xhr.readyState==4){ // && xhr.status==200) {
	// 		console.log('sendData', xhr.responseText);
	// 	}
	// }
	// xhr.send(str);
}

function runScript(tab) {
	var seen = {};

	pageMod.PageMod({
	  include: "*",
	  contentScriptFile: data.url("content.js"),
	  onAttach: function(worker) {
	  	console.log("Worker attached");
		worker.port.on("ads", function(ads) {
			// console.log("ADS FROM WORKER", JSON.stringify(ads, false, 2));
			var out = [];
			for (var i=0; i<ads.length; i++) {
				if (!seen[ads[i].url]) {
					out.push(ads[i]);
					seen[ads[i].url] = 1;
				}
			}
			if (out.length) {
				console.log("ADS FROM WORKER", JSON.stringify(ads, false, 2));
				sendData(out);
			}
		});
	  }
	});
}
