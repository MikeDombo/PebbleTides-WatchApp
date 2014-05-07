//Copyright 2014 Michael Dombrowski 
//Licensed under GNU General Public License, version 2 (GPL-2.0)
/* Pebble Tides is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Pebble Tides is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.*/

//setup global variables
var version = "2.5.4";
var printer;
if(localStorage.iPhone !== null && localStorage.iPhone === false){
	checkUpdates();
}

//Check for updates
function checkUpdates(){
	var response;
	var req = new XMLHttpRequest();
	req.onload = function(e) {
       response = req.responseText;
		if(response!==null && req.status == 200){
			var current = version.split(".");
			console.log("web version "+response.substring(9,10)+"."+response.substring(19,20)+"."+response.substring(30,31)+" current version"+current[0]+"."+current[1]+"."+current[2]);
			if(response.substring(9,10)>current[0]){
				localStorage.update = "true";
			}
			else if(response.substring(19,20)>current[1]){
				localStorage.update = "true";
			}
			else if(response.substring(30,31)>current[2]){
				localStorage.update =  "true";
			}
			else{localStorage.update = "false";}
		}};
  req.open('GET', "http://mikedombrowski.com/pbtides-version");
  req.send(null);
}

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
		city = ((response.response[0].place.name).substring(0,1)).toUpperCase()+(response.response[0].place.name).substring(1);
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
				responseMessage = tide + timePassed[0] + Math.abs(tideTimehr) + hour + timePassed[1];
				}
			else {
				responseMessage = tide + timePassed[0] + Math.abs(tideTimehr) + hour + " and " + Math.round(Math.abs(tideTimemin%60)) + minute + timePassed[1];
				}
			}
		else{
			responseMessage = tide + timePassed[0] + Math.round(Math.abs(tideTimemin)) + minute + timePassed[1];
			}
		responseMessage = responseMessage + " in " + city + ", " + state;
		}
	else{
		responseMessage = "Sorry, could not retreive tides for this location";
		}
//compile data to be written to screen and print it
		printer = printer + responseMessage+"\n\n";
		simply.style("large");
		simply.body(printer);
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
	getTides(lat+","+lng, "gps");
    }

//Run it
function runPos() {
	if(localStorage.update == "true"){
		printer = "A new update was found, please unload the app from your watch and reload\n\n";}
	else{printer = "";}
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
	localStorage.iPhone = options.iPhone;
	mainPage();
}

//
//Pebble Listeners
//
Pebble.addEventListener("showConfiguration", function(e) {
	Pebble.openURL("http://mikedombrowski.com/pebbletides-config.html?loc1="+localStorage.zip1+"&loc2="+localStorage.zip2+"&loc3="+localStorage.zip3+"&loc4="+localStorage.zip4+"&loc5="+localStorage.zip5+"&loc6="+localStorage.zip6+"&loc7="+localStorage.zip7);
});
Pebble.addEventListener("webviewclosed", function(e) {
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
mainPage();
function mainPage(){
	simply.scrollable(true);
	simply.style("small");
	simply.setText({
		title: 'Pebble Tides',
		body: 'Press \'Select\' to Get Tides.\n\nCurrent Configuration:\nGPS is '+localStorage.useGPS+'\nZip 1: '+localStorage.zip1+'\nZip 2: '+localStorage.zip2+'\nZip 3: '+localStorage.zip3+'\nZip 4: '+localStorage.zip4+'\nZip 5: '+localStorage.zip5+'\nZip 6: '+localStorage.zip6+'\nZip 7: '+localStorage.zip7+
		'\n\nBy Michael Dombrowski\nMikeDombrowski.com\n\nVersion '+version,}, true);
}
