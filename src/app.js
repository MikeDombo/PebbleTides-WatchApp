var UI = require('ui');
var ajax = require('ajax');
var Settings = require('settings');
var version = '3.9';
var menu;
var allTideData;
if(typeof localStorage.allTideData !== "undefined" && localStorage.allTideData !== null && localStorage.allTideData !== ""){allTideData = JSON.parse(localStorage.allTideData);}
if(typeof allTideData === "undefined"){allTideData = {location1:{displayName:"", lookupName:""}, location2:{displayName:"", lookupName:""}, location3:{displayName:"", lookupName:""}, location4:{displayName:"", lookupName:""}, location5:{displayName:"", lookupName:""}, location6:{displayName:"", lookupName:""}, location7:{displayName:"", lookupName:""}, hourFormat: "12h", units: "Ft"};
				localStorage.allTideData = JSON.stringify(allTideData);}
console.log(localStorage.allTideData);
if(allTideData.units === null || typeof allTideData.units === "undefined"){allTideData.units = "Ft";}

function updateCheck(){
	ajax(
  {
	url: 'http://mikedombrowski.com/pebtides/version/'+version+'/new.txt'
  },
  function(data) {
	console.log('New Version Found! Version: '+data);
	localStorage.update = 'true';
  },
  function(error) {
    console.log('No New Update!');
	localStorage.update = 'false';
  });
}

updateCheck();
function parseTide(response, name, index){
//setup Vars
	var responseMessage;	
	var tideLevel;
	var tideTime;
	var city;
	var state;
	var tideHeightFt;
	var tideHeightM;
	var tideHeight;
	var currTime = Math.round(Date.now()/1000);
	if (response.success === true && response.error === null) {
		tideLevel = response.response[0].periods[index].type;
		tideHeightFt = response.response[0].periods[index].heightFT;
		tideHeightM = response.response[0].periods[index].heightM;
		if(allTideData.units == "M"){
			tideHeight = tideHeightM+" meters";
		}
		else{
			tideHeight = tideHeightFt+" feet";
		}
		tideTime = response.response[0].periods[index].timestamp;
		city = ((response.response[0].place.name).substring(0,1)).toUpperCase()+(response.response[0].place.name).substring(1);
		state = (response.response[0].place.state).toUpperCase();
		var time = response.response[0].periods[index].dateTimeISO.substring(11,16);
		if(allTideData.hourFormat == "12h" && parseInt(time.substring(0,2))>12){
			time = (parseInt(time.substring(0,2))-12)+time.substring(2)+" PM";
		}
		else if(allTideData.hourFormat == "12h"){time = time.substring(0,2)+time.substring(2)+" AM";}
		if (time.substring(0,2)=='00'){
			time = '12:'+time.substring(3, time.length-3)+" AM";
		}
		if (time.substring(0,1) == "0" && allTideData.hourFormat == "12h"){
			time = time.substring(1);
		}
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
				responseMessage = tide + timePassed[0] + Math.abs(tideTimehr) + hour + timePassed[1]+" ("+time+")";
				}
			else {
				responseMessage = tide + timePassed[0] + Math.abs(tideTimehr) + hour + " and " + Math.round(Math.abs(tideTimemin%60)) + minute + timePassed[1]+" ("+time+")";
				}
			}
		else{
			responseMessage = tide + timePassed[0] + Math.round(Math.abs(tideTimemin)) + minute + timePassed[1]+" ("+time+")";
			}
		responseMessage = responseMessage + ". Height will be " + tideHeight + ", in " + city + ", " + state;
		}
	else{
		responseMessage = "Sorry, could not retreive tides for this location";
		}
//compile data to be written to screen and print it
	var resultCard = new UI.Card({title: "Tide Aware Result", body:responseMessage, scrollable: true});
	resultCard.show();
}

//Actually get the tides and package it to send to parseTide
function getTides(zip, name) {
	zip = encodeURIComponent(zip);
	console.log("called getTides using: "+zip);
	ajax(
  {
    url: 'http://api.aerisapi.com/tides/closest?p='+zip+'&client_id=eOQzJRTGPtPKdfokmpGQ9&client_secret=Elmx32lruftjejQDJWmyAgd1FMEp98LHHk9aVasg&radius=1000mi&from=-8hours&to=+7days&plimit=5&psort=dt',
    type: 'json'
  },
  function(data) {
    // Success!
    console.log('success'+JSON.stringify(data));
	var tideMen = [];
	for (var i=0; i<data.response[0].periods.length; i++){
		var time = data.response[0].periods[i].dateTimeISO.substring(11,16);
		if(allTideData.hourFormat == "12h" && parseInt(time.substring(0,2))>12){
			time = (parseInt(time.substring(0,2))-12)+time.substring(2)+" PM";
		}
		else if(allTideData.hourFormat == "12h"){time = time.substring(0,2)+time.substring(2)+" AM";}
		if (time.substring(0,2)=='00'){
			time = '12:'+time.substring(3, time.length-3)+" AM";
		}
		if (time.substring(0,1) == "0" && allTideData.hourFormat == "12h"){
			time = time.substring(1);
		}
		var level = data.response[0].periods[i].type;
		if (level == 'h'){level = "High";}
		else {level = 'Low';}
		tideMen.push({title:level+' Tide', subtitle:time});
	}
	
	ajax(
	{
		url: 'http://mikedombrowski.com/analytics/gather.php?location='+zip+'&US=TRUE&ID='+Pebble.getAccountToken()+'&settings='+encodeURIComponent(JSON.stringify(allTideData))+"&ver="+version
	},
	function(data){}, function(error){});

	var locationName = ((data.response[0].place.name).substring(0,1)).toUpperCase()+(data.response[0].place.name).substring(1) + ', '+ (data.response[0].place.state).toUpperCase();
	var tideMenu = new UI.Menu({sections: [{title: 'Tides in '+locationName, items: tideMen}]});
	tideMenu.on('select', function(e){parseTide(data, name, e.itemIndex);});
	tideMenu.show();
  },
  function(error) {
    // Failure!
    console.log('Failed fetching data: ' + error);
  }
  );}

//Use GPS to get tides
function showPosition(position) {
    var lat = position.coords.latitude;
	var lng = position.coords.longitude;
	getTides(lat+","+lng, "gps");
    }
function makeMenu(){
	var locations = [];
	if(localStorage.update == 'true'){locations.push({
      title:'New Update Available',
      subtitle:''
	});}
	locations.push({
      title:'GPS Location',
      subtitle:''
    });
	var x = 1;
	for(var i=1; i<8; i++){
		var title = "Location "+x;
		if(typeof allTideData['location'+i] != "undefined"){
			var subtitle = allTideData['location'+i].lookupName;
			if (subtitle === ''){
			continue;
			}
		else{
			locations.push({
			title:title,
			subtitle:subtitle
			});
			x++;
		}
		}
	}
	locations.push({
			title:'About',
			subtitle:'About This App'
			});
	locations.push({
			title:'Settings',
			subtitle:'Change App Settings'
			});
	menu = new UI.Menu({
   sections: [{
		title: 'Tide Locations',
		items: locations
    }]
  });
	menu.on('select', function(e){
	if(e.itemIndex > 0 ){
		if (locations[e.itemIndex].title == 'About'){
			var card = new UI.Card();
			card.title('Tide Aware');
			card.scrollable(true);
			card.body('By Michael Dombrowski\nMikeDombrowski.com\n\nVersion '+version);
			card.show();
		}
		else if (locations[e.itemIndex].title == 'Settings'){
			var settMenu = new UI.Menu({
		sections: [{
			title: 'App Settings',
			items: [{title:'Current ('+allTideData.hourFormat+')',subtitle:'12 or 24 Hour Time'},
					{title:'Current ('+allTideData.units+')',subtitle:'Tide Height Units (Ft/M)'}]
		}]
		});
			settMenu.on('select', function(e){
				if(e.itemIndex===0){
				if (allTideData.hourFormat == '12h'){allTideData.hourFormat = '24h';}
				else {allTideData.hourFormat = '12h';}
				settMenu.items(0,[{title:'Current ('+allTideData.hourFormat+')', subtitle:'12 or 24 Hour Time'}, {title:'Current ('+allTideData.units+')',subtitle:'Tide Height Units (Ft/M)'}]);}
				else{
					if (allTideData.units == 'M'){allTideData.units = 'Ft';}
					else {allTideData.units = 'M';}
					settMenu.items(0,[{title:'Current ('+allTideData.hourFormat+')', subtitle:'12 or 24 Hour Time'}, {title:'Current ('+allTideData.units+')',subtitle:'Tide Height Units (Ft/M)'}]);
				}
			});
			settMenu.show();
		}
		else{
			getTides(e.item.subtitle, e.item.title);}
	}
	else{
	navigator.geolocation.getCurrentPosition(showPosition);
	}
});
	menu.show();
}
//Apply Selected Configuration Options
function setUp(options){
	console.log("setup called");
	allTideData = options;
	localStorage.allTideData = JSON.stringify(allTideData);
	menu.hide();
	makeMenu();
}

Settings.config(
  { url: "http://mikedombrowski.com/pebtides/version/"+version+"/config.html?data="+encodeURIComponent(JSON.stringify(allTideData))},
  function(e) {
	console.log('opening configurable'+"http://mikedombrowski.com/pebtides/version/"+version+"/config.html?data="+encodeURIComponent(JSON.stringify(allTideData)));
  },
  function(e) {
	var options = JSON.parse(decodeURIComponent(e.response));
	console.log("Options = " + JSON.stringify(options));
	if(options.hourFormat == "12h" || options.hourFormat == "24h"){
		setUp(options);
	}
  }
);
makeMenu();