(()->
	window.addEventListener('DOMContentLoaded', () ->
		translate = navigator.mozL10n.get;
		navigator.mozL10n.once(start);
		true
	)

	start = () ->
		'use strict'
		L.mapbox.accessToken = mapboxKey 
		map = L.mapbox.map('map', 'examples.map-i86nkdio').setView([48.8567, 2.3508], 16)
		model = new VelibList( staticList )
		model.addMarker(L,map)
		req = new Request()
		document.getElementById("message").onclick = () -> req.makeRequest('https://api.jcdecaux.com/vls/v1/stations/?contract=Paris&apiKey='+JcDecauxKey,model)
		true

)()
