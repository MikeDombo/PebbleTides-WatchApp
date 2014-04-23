//setup global variables
var version = "2.3.1";
var gpsResp = "";
var zip1Resp = "";
var zip2Resp = "";
var zip3Resp = "";
var zip4Resp = "";
var zip5Resp = "";
var zip6Resp = "";
var zip7Resp = "";

//Parse tide data 
function parseTide(response, name){
//setup Vars
		var responseMessage;	
		var tideLevel;
		var tideTime;
		var city;
		var state;
		var currTime = Math.round(Date.now()/1000);
        if (response.success === true && response.error === null) {
			tideLevel = response.response[0].periods[0].type;
			tideTime = response.response[0].periods[0].timestamp;
			city = ((response.response[0].place.name).substring(0,1)).toUpperCase()+(response.response[0].place.name).substring(1,(response.response[0].place.name).length);
			state = (response.response[0].place.state).toUpperCase();
		var diffTime = tideTime - currTime;
		var tide;
		var tideTimemin = ((diffTime)/60);
		var tideTimehr = (tideTimemin-(tideTimemin%60))/60;
		var hour;
		var timePassed = new Array("","");
		var minute;
//Decide on grammar/english to use
		if((Math.round(Math.abs(tideTimemin)) == 1 || Math.round(Math.abs(tideTimemin%60)) == 1)){minute=" minute";}
		else {minute=" minutes";}
		if (Math.abs(tideTimehr) > 1){hour = " hours";}
		else {hour = " hour";}
		if(tideLevel == 'h'){tide = "High tide";}
		else {tide = "Low tide";}
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
		gpsResp = responseMessage+"\n\n";
	}
	else if(name == "zip1"){
		zip1Resp = responseMessage+"\n\n";
	}
	else if(name == "zip2"){
		zip2Resp = responseMessage+"\n\n";
	}
	else if(name == "zip3"){
		zip3Resp = responseMessage+"\n\n";
	}
	else if(name == "zip4"){
		zip4Resp = responseMessage+"\n\n";
	}
	else if(name == "zip5"){
		zip5Resp = responseMessage+"\n\n";
	}
	else if(name == "zip6"){
		zip6Resp = responseMessage+"\n\n";
	}
	else if(name == "zip7"){
		zip7Resp = responseMessage;
	}
		print();
}

//Print the tide data
function print(){
	simply.style("large");
	simply.scrollable(true);
	var responseMessage;
	if(gpsResp !== null){
	responseMessage = gpsResp;	
	}
	if(zip1Resp !== null){
	responseMessage = responseMessage+zip1Resp;	
	}
	if(zip2Resp !== null){
	responseMessage = responseMessage+zip2Resp;	
	}
	if(zip3Resp !== null){
	responseMessage = responseMessage+zip3Resp;	
	}
	if(zip4Resp !== null){
	responseMessage = responseMessage+zip4Resp;	
	}
	if(zip5Resp !== null){
	responseMessage = responseMessage+zip5Resp;	
	}
	if(zip6Resp !== null){
	responseMessage = responseMessage+zip6Resp;	
	}
	if(zip7Resp !== null){
	responseMessage = responseMessage+zip7Resp;	
	}
	simply.body(responseMessage);
	simply.vibe();
}

//Actually get the tides and package it to send to parseTide
function getTides(zip, name) {
	zip = zip.replace(/\s+/g, "%20");
	console.log("called getTides using: "+zip);
	var response;
	var req = new XMLHttpRequest();
	req.onload = function(e) {
       console.log(req.responseText);
       response = JSON.parse(req.responseText);
		if(response!==null && req.status == 200){
			parseTide(response, name);
		}};
  req.open('GET', "http://api.aerisapi.com/tides/closest?p=" + zip + "&client_id=eOQzJRTGPtPKdfokmpGQ9&client_secret=Elmx32lruftjejQDJWmyAgd1FMEp98LHHk9aVasg&radius=1000mi&from=-8hours&plimit=2&psort=dt");
  req.send(null);
}

//Use GPS to get tides
function showPosition(position) {
    var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	console.log("using gps "+lat+" "+lng);
	getTides(lat+","+lng, "gps");
    }

//Run it
function runPos() {
//clear variables
	gpsResp = "";
	zip1Resp = "";
	zip2Resp = "";
	zip3Resp = "";
	zip4Resp = "";
	zip5Resp = "";
	zip6Resp = "";
	zip7Resp = "";
//Choose which zips/gps to find tides for
	if(localStorage.useGPS == "on"){
		navigator.geolocation.getCurrentPosition(showPosition);
	}
	if(localStorage.zip1 !== "" && localStorage.zip1 !== null){
		getTides(localStorage.zip1, "zip1");
	}
	if(localStorage.zip2 !== "" && localStorage.zip2 !== null){
		getTides(localStorage.zip2, "zip2");
	}
	if(localStorage.zip3 !== "" && localStorage.zip3 !== null){
		getTides(localStorage.zip3, "zip3");
	}
	if(localStorage.zip4 !== "" && localStorage.zip4 !== null){
		getTides(localStorage.zip4, "zip4");
	}
    if(localStorage.zip5 !== "" && localStorage.zip5 !== null){
		getTides(localStorage.zip5, "zip5");
	}
	if(localStorage.zip6 !== "" && localStorage.zip6 !== null){
		getTides(localStorage.zip6, "zip6");
	}
	if(localStorage.zip7 !== "" && localStorage.zip7 !== null){
		getTides(localStorage.zip7, "zip7");
	}
}

//Apply Selected Configuration Options
function setUp(options){
	console.log("setup called");
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

//
//Pebble Listeners
//
Pebble.addEventListener("showConfiguration", function() {
	Pebble.openURL("http://mikedombrowski.com/pebbletides-config.html");
});

Pebble.addEventListener("webviewclosed", function(e) {  
	console.log("configuration closed, webview");
	var options = JSON.parse(decodeURIComponent(e.response));
	console.log("Options = " + JSON.stringify(options));
	if(options.gps == "on" || options.gps == "off"){
		setUp(options);
	}
});

Pebble.addEventListener("configurationClosed", function(e) {  
	console.log("configuration closed, config closed");
	var options = JSON.parse(decodeURIComponent(e.response));
	console.log("Options = " + JSON.stringify(options));
	if(options.gps == "on" || options.gps == "off"){
		setUp(options);
	}
});


//
//Simply.js Stuff
//
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
   body: 'Press \'Select\' to Get Tides.\n\nCurrent Configuration:\nGPS is '+localStorage.useGPS+'\nZip 1: '+localStorage.zip1+'\nZip 2: '+localStorage.zip2+'\nZip 3: '+localStorage.zip3+'\nZip 4: '+localStorage.zip4+'\nZip 5: '+localStorage.zip5+'\nZip 6: '+localStorage.zip6+'\nZip 7: '+localStorage.zip7+
	'\n\nBy Michael Dombrowski\nMikeDombrowski.com\n\nVersion '+version,
}, true);
