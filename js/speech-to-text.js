var r = document.getElementById('sptext')

var finalTranscripts = '';
function startConverting(){
	if ('webkitSpeechRecognition' in window){
		var speechRecognizer = new webkitSpeechRecognition();
		speechRecognizer.continuous = true;
		speechRecognizer.interimResults = true;
		speechRecognizer.lang = 'en-IN';
		speechRecognizer.start()

		speechRecognizer.onresult = function(event){
			var interimTranscripts = '';
			for(var i = event.resultIndex; i < event.results.length; i++){
				var transcript = event.results[i][0].transcript;
				transcript.replace("\n", "<br>");
				if(event.results[i].isFinal){
					finalTranscripts += transcript;
				}
				else{
					interimTranscripts += transcript;
				}
			}
			r.innerHTML = finalTranscripts + '<span style="color:#999">' + interimTranscripts + '</span>';
		};

		speechRecognizer.onerror = function(event){

		};
	}
	else{
		console.log("Version not supported.");
	}

}

function clearText() {
	document.getElementById('sptext').innerHTML = "";
	location.reload();
}

function JSON_to_URLEncoded(element,key,list){
	var list = list || [];
	if(typeof(element)=='object'){
	  	for (var idx in element)
	      	JSON_to_URLEncoded(element[idx],key?key+'['+idx+']':idx,list);
	} else {
	    list.push(key+'='+encodeURIComponent(element));
	  }
	  return list.join('&');
}

function listAlbums(res) {
	//move top
	document.getElementById("form-element").style.position = "absolute";
	document.getElementById("form-element").style.top = "30px";
	document.getElementById("micro-div").style.marginTop = "6px";
	
	//list track
	var tracks = res.tracks;
	var k = document.getElementById('recommend');
	k,innerHTML = "";
	for(var i=0;i<tracks.length;i++)
	{
		//iframe.setAttribute("src",tracks[i].external_urls.spotify);
		console.log(tracks[i].external_urls.spotify)
		var x = tracks[i].external_urls.spotify
		var m = x.slice(0,24)
		var j = x.slice(25, x.length)
		var fin = m + "/embed/" + j
		console.log(fin)
		//var str = "<iframe src='https://open.spotify.com/embed/album/1DFixLWuPkv3KT3TnV35m3" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>"
		k.innerHTML += '<iframe class="iframe-class" src="' + fin + '" width="300" height="80" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>'

	}
	var parent = k.parentNode;
	var wrapper = document.createElement('form');
	wrapper.setAttribute("id","list-form");
	parent.replaceChild(wrapper,k);
	wrapper.appendChild(k);
}


function processData(){
	console.log(finalTranscripts)
	var t = {'grant_type': 'client_credentials'}
	$.ajax({
		url: '/process',
		dataType: 'json',
		type: 'post',
		contentType: 'application/json',
		data: JSON.stringify({ "desc": finalTranscripts}),
		success: function(data){
			console.log(data)
			if(data.flag){
				let score = Object.values(data.emotions[0]).sort((prev, next) => next - prev)[0]
				//console.log(max)
				if(data.sentiment[0].label === 'negative'){
					score = 1 - score
				}
				console.log(score)
				$.ajax({
					url: '/token',
					type: 'get',
					success: function(res){
						//console.log("Hello")
						//x = JSON.parse(err.responseText)
						console.log(res.access_token);
						var genre = ''
						if(score >= 0 && score <= 0.25){
							genre = 'chill'
						}
						else if(score > 0.25 && score <= 0.39){
							genre = 'classical'
						}
						else if(score > 0.39 && score <= 0.59){
							genre = 'romance'
						}
						else if(score > 0.6 && score <= 0.75){
							genre = 'electronic'
						}
						else if(score > 0.76 && score <= 0.9){
							genre = 'hip-hop'
						}
						else{
							genre = 'metal'
						}
						$.ajax({
							url: 'https://api.spotify.com/v1/recommendations?limit=12' + '&seed_genres='+ genre +'&max_valence=' + score.toString() + '&max_danceability=0.5' + '&min_popularity=50',
							dataType: 'json',
							type: 'get',
							headers: {
								'Accept': '*',
			        			'Content-Type': 'application/json',
			        			'Authorization': "Bearer " + res.access_token
			            	},
							success: function(res){
								console.log(res)
								listAlbums(res)
							},
							error: function(err){
								console.log(err)			
							}
						});
					},
					error: function(err){

					}
				});
			}
			else{
				$(function(){
				  	new PNotify({
				    	title: 'Error !!',
					    text: 'Please be more descriptive.',
					    type: 'error',
					    styling: 'bootstrap3',
					});
				});
			}

		},
		error: function(err){
			console.log(err);
		}
	});		
}


