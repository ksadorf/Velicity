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
    console.log("CACA");
  function start() {
    
    var message = document.getElementById('message');

    // We're using textContent because inserting content from external sources into your page using innerHTML can be dangerous.
    // https://developer.mozilla.org/Web/API/Element.innerHTML#Security_considerations
    message.textContent = translate('message');
    var map = L.map('map').setView([48.8567, 2.3508], 13);
	var MapQuestOpen_OSM = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.jpeg', {
		attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
		subdomains: '1234'
	});
	var httpRequest;
	document.getElementById("message").onclick = function() { makeRequest('https://api.jcdecaux.com/vls/v1/stations/?contract=Paris&apiKey='+JcDecauxKey); };
	var markers = L.markerClusterGroup({
			maxClusterRadius: 120,
			iconCreateFunction: function (cluster) {
				var markers = cluster.getAllChildMarkers();
				var n = 0;
				for (var i = 0; i < markers.length; i++) {
					n += markers[i].bike_stand;
				}
				var c = ' marker-cluster-';
                if (n > 40) {
                    c += 'small';
                } else if (n > 30) {
                    c += 'medium';
                } else {
                 c += 'large';
                }
                return new L.DivIcon({ html: '<div><span>' + n + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
			},
			//Disable all of the defaults:
			spiderfyOnMaxZoom: false, showCoverageOnHover: false
		});
	// add an OpenStreetMap tile layer
	MapQuestOpen_OSM.addTo(map);
	var MarkerList = new Array(velib.length);
	console.log(velib.length);
	function findMarker(num){
		var lim = velib.length
		for (var i = 0; i <lim; i++) {
			if (velib[i]["number"] === num){
				return i
			}
		}
	}
	function addMarker(element, index, array) {
		// console.log('a[' + index + '] = ' + element["latitude"] + " "+ element["longitude"]);		
		var marker = this.marker([element["position"]["lat"],  element["position"]["lng"]], {icon:new L.NumberedDivIcon({number: element["bike_stands"]})})
				.bindPopup('<p>Velo libre ?</p>'
									+'<p>Place libre ?</p>'
									+'<p>Total '+element["bike_stands"]+'</p>');
		marker.bike_stand=element["bike_stands"];
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
				// console.log('Number '+element["number"] +' ssecret id :'+  curStation+' '+MarkerList.length);
				// console.log( MarkerList[curStation])
				var myIcon = new L.NumberedDivIcon({number: element["bike_stands"]});
				MarkerList[curStation]["view"].setIcon(myIcon);
				MarkerList[curStation]["view"].bike_stand=element["bike_stands"];
				var curPop = MarkerList[curStation]["view"].getPopup();
				curPop.setContent('<p>Velo libre '+element["available_bikes"]+'</p>'
									+'<p>Place libre '+element["available_bike_stands"]+'</p>'
									+'<p>Total '+element["bike_stands"]+'</p>');
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
