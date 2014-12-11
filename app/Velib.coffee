(()->
	class window.VelibList
		constructor: (@List) ->

		addMarker: (L,map) ->
			for station in @List
				cur_m = L.marker([station["latitude"],  station["longitude"]])
					.bindPopup(format(station))
					.addTo(map)
				station.marker=cur_m
			true
		findStation: (num) ->
			for station, index in @List
				if station["number"] is num
					return index
			return null

		update: (response)->
			response.forEach( (element, index, array) =>
				curStation = @findStation(element["number"])
				@List[curStation].bike_stand=element["bike_stands"]
				curPop = @List[curStation].marker.getPopup()
				curPop.setContent(format(element))
				curPop.update()
				true;
			)

	format= (station) ->
		sName=station["name"].replace(/\d* - /, "")
		n=sName.charAt(0).toUpperCase() + sName.slice(1).toLowerCase()
		if not station["available_bike_stands"]?  or  not station["available_bikes"]?
			return '<p>'+n+'</p>'
		'<p>'+n+'</p>'+'<p>'+station["available_bikes"]+'/'+ station["available_bike_stands"]+'</p>'
)()
