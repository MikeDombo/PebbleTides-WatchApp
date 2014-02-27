function parseTide(response){
	var tideLevel;
		var tideTime;
		var city;
		var state;
		var currTime = Math.round(Date.now()/1000);
        if (response.success = "true") {
          tideLevel = response.response[0].periods[0].type;
		  tideTime = response.response[0].periods[0].timestamp;
		  city = ((response.response[0].place.name).substring(0,1)).toUpperCase()+(response.response[0].place.name).substring(1,(response.response[0].place.name).length);
		  state = (response.response[0].place.state).toUpperCase();
		  var diffTime = tideTime - currTime;
         /* console.log(tideLevel);
		  console.log(tideTime);
		  console.log(city);
		  console.log(state);
		  console.log(diffTime);*/
		var responseMessage;
		var tide;
		var tideTimemin = ((diffTime)/60);
		var tideTimehr = Math.floor(tideTimemin/60);
		var remainder = Math.round(tideTimemin - 60*(tideTimehr));
		var hour;
		var timePassed = new Array();
		
		if (Math.abs(tideTimehr) > 1){hour = " hours"}
		else {hour = " hour"}
		if(tideLevel == 'h'){var tide = "High tide";}
		else {var tide = "Low tide";}
		if(tideTimemin <= 0){
			timePassed[0] = " was ";
			timePassed[1] = " ago";}
		else {
			timePassed[0] = " is in ";
			timePassed[1] = "";}
			
			if(Math.abs(tideTimemin)>=60) {
				if (remainder == "0") {
					responseMessage = tide + timePassed[0] + tideTimehr + hour +timePassed[1];
					}
				else {
					responseMessage = tide + timePassed[0] + tideTimehr + hour+ " and "+remainder+" minutes" + timePassed[1];
					}
				}
			else{
				responseMessage = tide + timePassed[0] + Math.round(Math.abs(tideTimemin)) + " minutes" + timePassed[1];
			}
		responseMessage = responseMessage + " in "+city + ", "+state;	
			}
	else{
		responseMessage = "Sorry, could not retreive tides for this location";
		console.log("Failed to get tides");
		}
		console.log(responseMessage);
		Pebble.showSimpleNotificationOnPebble("Pebble Tides", responseMessage);
	}
		

function getTides(lat, lng) {
	console.log("called getTides with lat lng");
  var response;
  var req = new XMLHttpRequest();
	req.onload = function(e) {
       console.log(req.responseText);
       response = JSON.parse(req.responseText);
		if(response!=null && req.status == 200){
			parseTide(response);
		}
	}
  req.open('GET', "http://api.aerisapi.com/tides/closest?p=" + lat +","+ lng + "&client_id=eOQzJRTGPtPKdfokmpGQ9&client_secret=Elmx32lruftjejQDJWmyAgd1FMEp98LHHk9aVasg&radius=1000mi&from=-5hours&to=+6hours");
  req.send(null);	
}
	  
function getTidesZip(zip) {
	console.log("called getTides with zip: "+zip);
  var response;
  var req = new XMLHttpRequest();
	req.onload = function(e) {
       console.log(req.responseText);
       response = JSON.parse(req.responseText);
		if(response!=null && req.status == 200){
			parseTide(response);
		}
	}
  req.open('GET', "http://api.aerisapi.com/tides/closest?p=" + zip + "&client_id=eOQzJRTGPtPKdfokmpGQ9&client_secret=Elmx32lruftjejQDJWmyAgd1FMEp98LHHk9aVasg&radius=1000mi&from=-8hours&plimit=2&psort=dt");
  req.send(null);
	  }

function showPosition(position) {
    sessionStorage.lat = position.coords.latitude;
	sessionStorage.lng = position.coords.longitude;
	var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	console.log("called sessionstorage "+lat+" "+lng);
	getTides(lat, lng);
    }

function runPos() {
	if(localStorage.useGPS == "on"){
		navigator.geolocation.getCurrentPosition(showPosition);
	}
	if(localStorage.zip1 != ""){
		getTidesZip(localStorage.zip1);
	}
	if(localStorage.zip2 != ""){
		getTidesZip(localStorage.zip2);
	}
	if(localStorage.zip3 != ""){
		getTidesZip(localStorage.zip3);
	}
	if(localStorage.zip4 != ""){
		getTidesZip(localStorage.zip4);
	}
    if(localStorage.zip5 != ""){
		getTidesZip(localStorage.zip5);
	}
	if(localStorage.zip6 != ""){
		getTidesZip(localStorage.zip6);
	}
	if(localStorage.zip7 != ""){
		getTidesZip(localStorage.zip7);
	}
}

function setUp(options){
	console.log("setup called")
	localStorage.useGPS = options.gps;
	localStorage.zip1 = options.zip1;
	localStorage.zip2 = options.zip2;
	localStorage.zip3 = options.zip3;
	localStorage.zip4 = options.zip4;
	localStorage.zip5 = options.zip5;
	localStorage.zip6 = options.zip6;
	localStorage.zip7 = options.zip7;
	Pebble.showSimpleNotificationOnPebble("Pebble Tides", "Configuration Succeeded!");
	runPos();
}

// Set callback for the app ready event
Pebble.addEventListener("ready",
                        function(e) {
                          console.log("connect!" + e.ready);
                          console.log(e.type);
                        });
Pebble.addEventListener("showConfiguration", function() {
  console.log("showing configuration");
	Pebble.showSimpleNotificationOnPebble("Pebble Tides", "If configuration succeeds you will get a notification. If you do not, try again, as sometimes it takes 2 tries to set.");
  Pebble.openURL('http://mikedombrowski.com/pebbletides-config.html');
});
Pebble.addEventListener("configurationClosed", function(e) {  
	console.log("configuration closed, config closed");
  var options = JSON.parse(decodeURIComponent(e.response));
  console.log("Options = " + JSON.stringify(options));
	setUp(options);
});
Pebble.addEventListener("webviewclosed", function(e) {  
	console.log("configuration closed, webview");
  var options = JSON.parse(decodeURIComponent(e.response));
  console.log("Options = " + JSON.stringify(options));
	setUp(options);
});

Pebble.addEventListener("appmessage",
                        function(e) {
                          console.log("message");
							if(e.payload.zip){
								console.log("payload.zip");
								runPos();
							}
                          if (e.payload.fetch) {
                            Pebble.sendAppMessage(responseMessage);
                            runPos();
                          }
                          if (e.payload.responseMessage) {
                            runPos();
                          }
                        });
