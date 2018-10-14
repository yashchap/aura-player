var express = require('express');
var app = express();
var path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser')

var NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
var natural_language_understanding = new NaturalLanguageUnderstandingV1({
	'username': 'c37982f3-c81d-4656-9109-1fa938f2096f',
	'password': 'iP0N8h11m6T5',
	'version': '2018-03-16'
});


var port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(express.static(__dirname + '/'));

app.get('/', function(req,res){
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/process', function(req,res){
	text = req.body.desc
	console.log(text)
	var parameters = {
	  'text': text,
	  'features': {
	    'entities': {
	      'emotion': true,
	      'sentiment': true,
	      'limit': 1
	    },
	    'keywords': {
	      'emotion': true,
	      'sentiment': true,
	      'limit': 1
	    }
	  }
	}
	var emotions = []
	var sentiment = []
	natural_language_understanding.analyze(parameters, function(err, response) {
	  if (err){
	    console.log('error:', err);
		res.json({'flag': false})
	  }
	  else{
		    //var fs = require("fs")
		    //var contents = fs.readFileSync('jsoncontents.')
		    console.log(response)
		    //console.log(response.keywords)
		    if(response.keywords){
		    	if(response.keywords.length != 0){
			    	for(var i=0; i < response.keywords.length; i++){
			    		if(response.keywords[i].emotion != null || response.keywords[i].sentiment != null){
			    			emotions.push(response.keywords[i].emotion)
			    			sentiment.push(response.keywords[i].sentiment)
			    		}
			    		else{
			    			res.json({'flag': false})
			    		}
			    	}
			    	res.json({'emotions': emotions, 'sentiment': sentiment, 'flag': true}) 
		    	}
		    	else{
		    		res.json({'flag': false})
		    	}
		    }
		    else{
		    	res.json({'err': 'Please speak a bigger sentence.', 'flag': false})
		    }
	   	}
	    
	  
	});
});


app.listen(port, function(){
    console.log('Server running at port ' + port);
});