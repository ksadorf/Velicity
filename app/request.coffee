(()->
	class window.Request
		constructor: () ->
			console.log "Build request"
			if (window.XMLHttpRequest)  # Mozilla, Safari, ...
				@httpRequest = new XMLHttpRequest();
			else if (window.ActiveXObject) # IE
				try
					@httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
				catch e
					try
						@httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
					catch e
						console.log "Fuck everything"
			if (!@httpRequest)
				alert('Giving up :( Cannot create an XMLHTTP instance')
				false
			console.log @httpRequest
		alertContents: (model) ->
			if @httpRequest.readyState is 4
				if @httpRequest.status is 200
					response = JSON.parse(@httpRequest.responseText);
					console.log "traitement"
					model.update(response)
					"all good"
				else
					alert('There was a problem with the request.');
		makeRequest: (url, model) ->
			console.log(@alertContents)
			@httpRequest.onreadystatechange =  () => @alertContents(model);
			@httpRequest.open('GET', url);
			@httpRequest.send();
			console.log "Sending"
			console.log @httpRequest


)()
