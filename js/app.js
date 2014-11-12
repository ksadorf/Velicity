// DOMContentLoaded is fired once the document has been loaded and parsed,
// but without waiting for other external resources to load (css/images/etc)
// That makes the app more responsive and perceived as faster.
// https://developer.mozilla.org/Web/Reference/Events/DOMContentLoaded
window.addEventListener('DOMContentLoaded', function() {

  // We'll ask the browser to use strict code to help us catch errors earlier.
  // https://developer.mozilla.org/Web/JavaScript/Reference/Functions_and_function_scope/Strict_mode
  'use strict';

  var translate = navigator.mozL10n.get;

  // We want to wait until the localisations library has loaded all the strings.
  // So we'll tell it to let us know once it's ready.
  navigator.mozL10n.once(start);

  // ---
  function start() {
    
    var message = document.getElementById('message');

    // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
    // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
    message.textContent = translate('message');
	var map = L.map('map', {zoomControl:false }).setView([48.8567, 2.3508], 17);
	var MapQuestOpen_OSM =L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
	    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
	    format: 'jpg80',
	    minZoom: 16,
	    maxZoom:19,
	    tileSize: 256,
	    reuseTiles: true, 
	});
	var httpRequest;
	document.getElementById("message").onclick = function() { makeRequest('https://api.jcdecaux.com/vls/v1/stations/?contract=Paris&apiKey='+JcDecauxKey); };
	var markers = L.markerClusterGroup({
			maxClusterRadius: 50,
			iconCreateFunction: function (cluster) {
				var markers = cluster.getAllChildMarkers();

				var c = ' marker-cluster-small';

                return new L.DivIcon({ html: '<div><span>' + markers.length + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
			},
			//Disable all of the defaults:
			spiderfyOnMaxZoom: false, showCoverageOnHover: false
		});
	// add an OpenStreetMap tile layer
	MapQuestOpen_OSM.addTo(map);
	map.locate({setView: true, maxZoom: 17});
	function onLocationFound(e) {
	    var radius = e.accuracy / 2;
	    L.marker(e.latlng).addTo(map);
	    L.circle(e.latlng, radius).addTo(map);
	}
	function onLocationError(e) {
	    alert(e.message);
	}

	// map.on('locationerror', onLocationError);
	// map.on('locationfound', onLocationFound);
	var MarkerList = new Array(velib.length);
	// console.log(velib.length);
	function findMarker(num){
		var lim = velib.length
		for (var i = 0; i <lim; i++) {
			if (velib[i]["number"] === num){
				return i
			}
		}
	}
	function formatStation(s){
		var sName=s["name"].replace(/\d* - /, "");
		var n=sName.charAt(0).toUpperCase() + sName.slice(1).toLowerCase();
		if ( s["available_bike_stands"]=== undefined  || s["available_bikes"]=== undefined){
			return '<p>'+n+'</p>';
		}
		return '<p>'+n+'</p>'+'<p>'+s["available_bikes"]+'/'+ s["available_bike_stands"]+'</p>'
	}
	function addMarker(element, index, array) {
		// console.log('a[' + index + '] = ' + element["latitude"] + " "+ element["longitude"]);		
		var marker = this.marker([element["latitude"],  element["longitude"]])
				.bindPopup(formatStation(element));
		marker.bike_stand=1;
		MarkerList[index] = {"place": 45, "view":marker};
		markers.addLayer(marker);
	}
	velib.forEach(addMarker,L);
	map.addLayer(markers);
	function makeRequest(url) {
	if (window.XMLHttpRequest) { // Mozilla, Safari, ...
		httpRequest = new XMLHttpRequest();
	} else if (window.ActiveXObject) { // IE
		try {
			httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
		} catch (e) {
			try {
				httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
			}catch (e) {}
		}
    }

    if (!httpRequest) {
		alert('Giving up :( Cannot create an XMLHTTP instance');
		return false;
    }
    httpRequest.onreadystatechange = alertContents;
    httpRequest.open('GET', url);
    httpRequest.send();
  }

  function alertContents() {
	if (httpRequest.readyState === 4) {
		if (httpRequest.status === 200) {
			var response = JSON.parse(httpRequest.responseText);
			response.forEach(function(element, index, array){
				var curStation = findMarker(element["number"]);
				 //console.log('Number '+element["number"] +' ssecret id :'+  curStation+' '+MarkerList.length);
				//console.log( MarkerList[curStation])
				//console.log(element)
				MarkerList[curStation]["view"].bike_stand=element["bike_stands"];
				var curPop = MarkerList[curStation]["view"].getPopup();
				curPop.setContent(formatStation(element));
				curPop.update();
			    }
			);
		    markers._defaultIconCreateFunction= new L.NumberedDivIcon({number: 4});
		} else {
			alert('There was a problem with the request.');
		}
    }
    }
  }
  
});
