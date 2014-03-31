function parseTide(response, name){
//setup Vars
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
		var responseMessage;
		var tide;
		var tideTimemin = ((diffTime)/60);
		var tideTimehr = (tideTimemin-(tideTimemin%60))/60;
		var hour;
		var timePassed = new Array();
		var minute;
//Decide on grammar/english to use
		if(Math.abs(tideTimemin==1)){minute=" minute";}
		else {minute=" minutes"}
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
//Put together responseMessage
			if(Math.abs(tideTimemin)>=60) {
				if (tideTimemin%60 == "0") {
					responseMessage = tide + timePassed[0] + Math.abs(tideTimehr) + hour +timePassed[1];
					}
				else {
					responseMessage = tide + timePassed[0] + Math.abs(tideTimehr) + hour+ " and "+Math.round(Math.abs(tideTimemin%60))+ minute + timePassed[1];
					}
				}
			else{
				responseMessage = tide + timePassed[0] + Math.round(Math.abs(tideTimemin)) + minute + timePassed[1];
			}
		responseMessage = responseMessage + " in "+city + ", "+state;
			}
	else{
		responseMessage = "Sorry, could not retreive tides for this location";
		console.log("Failed to get tides");
		}
	if(name == "gps") {
		sessionStorage.gpsResp = responseMessage+"\n\n";
	}
	else if(name == "zip1"){
		sessionStorage.zip1Resp = responseMessage+"\n\n";
	}
	else if(name == "zip2"){
		sessionStorage.zip2Resp = responseMessage+"\n\n";
	}
	else if(name == "zip3"){
		sessionStorage.zip3Resp = responseMessage+"\n\n";
	}
	else if(name == "zip4"){
		sessionStorage.zip4Resp = responseMessage+"\n\n";
	}
	else if(name == "zip5"){
		sessionStorage.zip5Resp = responseMessage+"\n\n";
	}
	else if(name == "zip6"){
		sessionStorage.zip6Resp = responseMessage+"\n\n";
	}
	else if(name == "zip7"){
		sessionStorage.zip7Resp = responseMessage;
	}
		print();
}
		
function print(){
	simply.style("large");
	simply.scrollable(true);
	var responseMessage;
	if(sessionStorage.gpsResp != null){
	responseMessage = sessionStorage.gpsResp;	
	}
	if(sessionStorage.zip1Resp != null){
	responseMessage = responseMessage+sessionStorage.zip1Resp;	
	}
	if(sessionStorage.zip2Resp != null){
	responseMessage = responseMessage+sessionStorage.zip2Resp;	
	}
	if(sessionStorage.zip3Resp != null){
	responseMessage = responseMessage+sessionStorage.zip3Resp;	
	}
	if(sessionStorage.zip4Resp != null){
	responseMessage = responseMessage+sessionStorage.zip4Resp;	
	}
	if(sessionStorage.zip5Resp != null){
	responseMessage = responseMessage+sessionStorage.zip5Resp;	
	}
	if(sessionStorage.zip6Resp != null){
	responseMessage = responseMessage+sessionStorage.zip6Resp;	
	}
	if(sessionStorage.zip7Resp != null){
	responseMessage = responseMessage+sessionStorage.zip7Resp;	
	}
	simply.body(responseMessage);
	simply.vibe();
	//Pebble.showSimpleNotificationOnPebble("Pebble Tides", responseMessage);
	
}
function getTides(lat, lng) {
	console.log("called getTides with lat lng");
  var response;
	var name = "gps";
  var req = new XMLHttpRequest();
	req.onload = function(e) {
       console.log(req.responseText);
       response = JSON.parse(req.responseText);
		if(response!=null && req.status == 200){
			sessionStorage.gpsDone=true;
			parseTide(response, name);
		}
	}
  req.open('GET', "http://api.aerisapi.com/tides/closest?p=" + lat +","+ lng + "&client_id=eOQzJRTGPtPKdfokmpGQ9&client_secret=Elmx32lruftjejQDJWmyAgd1FMEp98LHHk9aVasg&radius=1000mi&from=-5hours&to=+6hours");
  req.send(null);	
}
	  
function getTidesZip(zip, name) {
	console.log("called getTides with zip: "+zip);
  var response;
  var req = new XMLHttpRequest();
	req.onload = function(e) {
       console.log(req.responseText);
       response = JSON.parse(req.responseText);
		if(response!=null && req.status == 200){
			parseTide(response, name);
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
	sessionStorage.gpsResp="";
	sessionStorage.zip1Resp="";
	sessionStorage.zip2Resp="";
	sessionStorage.zip3Resp="";
	sessionStorage.zip4Resp="";
	sessionStorage.zip5Resp="";
	sessionStorage.zip6Resp="";
	sessionStorage.zip7Resp="";
	
	if(localStorage.useGPS == "on"){
		sessionStorage.gpsDone=false;
		navigator.geolocation.getCurrentPosition(showPosition);
	}
	if(localStorage.zip1 != ""){
		getTidesZip(localStorage.zip1, "zip1");
	}
	if(localStorage.zip2 != ""){
		getTidesZip(localStorage.zip2, "zip2");
	}
	if(localStorage.zip3 != ""){
		getTidesZip(localStorage.zip3, "zip3");
	}
	if(localStorage.zip4 != ""){
		getTidesZip(localStorage.zip4, "zip4");
	}
    if(localStorage.zip5 != ""){
		getTidesZip(localStorage.zip5, "zip5");
	}
	if(localStorage.zip6 != ""){
		getTidesZip(localStorage.zip6, "zip6");
	}
	if(localStorage.zip7 != ""){
		getTidesZip(localStorage.zip7, "zip7");
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
	simply.body("Configuration Success!");
}

Pebble.addEventListener("webviewclosed", function(e) {  
	console.log("configuration closed, webview");
  var options = JSON.parse(decodeURIComponent(e.response));
  console.log("Options = " + JSON.stringify(options));
	if(options.gps == "on" || options.gps == "off"){
		setUp(options);
	}
});

simply.on('singleClick', function(e) {
	if(e.button == "select"){
		runPos();}
});

simply.on('longClick', function(e) {
   Pebble.openURL('http://mikedombrowski.com/pebbletides-config.html');
});

simply.scrollable(true);
simply.style("small");
simply.setText({
  title: 'Pebble Tides',
   body: 'Press \'Select\' to Get Tides. \nLong Click \'Select\' to Configure.\n\nCurrent Configuration:\nGPS is '+localStorage.useGPS+'\nZip 1: '+localStorage.zip1+'\nZip 2: '+localStorage.zip2+'\nZip 3: '+localStorage.zip3+'\nZip 4: '+localStorage.zip4+'\nZip 5: '+localStorage.zip5+'\nZip 6: '+localStorage.zip6+'\nZip 7: '+localStorage.zip7,
}, true);
