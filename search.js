var search_terms = []
$( document ).ready(function() {

	// Search-Terms
    $( "#search-terms-btn" ).click((e) => {
        var value = $( "#search-terms-in" ).val();
        search_terms.push('"'+value+'"');
		var close_id = "term-" + value;
        if (value != "") {
        	// create search term button and display above search bar along with previous terms
            $( "#search-terms-div" ).append(
                '<div class="m-1 d-inline-block alert alert-secondary alert-dismissible fade show" role="alert">' +
                    '<strong>' + value + '</strong>' +
                    '<button id="' + close_id + '" type="button" class="close" data-dismiss="alert" onclick="closeTerm(this)">' +
                        '<span aria-hidden="true">&times;</span>' +
                    '</button>' +
                '</div>'
            );
            $( "#search-terms-in" ).val("");
        }
        $( "#search-terms-in" ).focus();
        //
        findProjects();
    });

    $( "#search-terms-in" ).keypress((e) => {
        if ( e.which == 13 ) {
            $( "#search-terms-btn" ).click();
        }
	});
	
});

// If user clicks 'x' next to a previously entered search term
// card grid should repopulate to only show projects meeting remaining terms
function closeTerm(close_btn) {
	var term = close_btn.id.replace("term-", "")
	var index = search_terms.indexOf('"'+term+'"'); //indexOf may not be supported in IE 7 & 8
	if (index > -1) {
	  search_terms.splice(index, 1);
	}
	findProjects();
}

function findProjects() {
	if (search_terms.length == 0) {

		// no terms remaining, clear grid of all cards
		$( '#projects' ).empty();
	} else {
	    var params = {
	        FunctionName : 'search_has_any',
	        InvocationType : 'RequestResponse',
	        LogType : 'Tail',
	        Payload : '{"search_term" : [' + search_terms + ']}' //e.g.["python", "2018", "git"]}'
	    };

		triggerLambda(params);
		
	}
	
}

$( document ).ready(function() {
    window.s3_path = "https://s3.us-east-2.amazonaws.com/cs673-projects-folder";
});

function triggerLambda(params) {
    AWS.config.update({region: 'us-east-2'});
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
        IdentityPoolId: 'us-east-2:1c5c4b60-8923-4c04-9ae9-71a82cc4f087',
    });
    
    var lambda = new AWS.Lambda({region: 'us-east-2', apiVersion: '2015-03-31'});
    lambda.invoke(params, function(error, data) {
        
        if (error) {
            prompt(error);
            window.alert(JSON.parse(error));
        } else {
            window.message = JSON.parse(data.Payload);
            $( '#projects' ).empty();

            if (message != null) {
                for (var i=0; i < message.length; i++) {
                    // break-up data for readability
                    var project_name = message[i]['project_name']
                    var year = message[i]['year']
                    var semester = message[i]['semester']
                    var instructor = message[i]['instructor']
                    var github = message[i]['github']
                    var description = message[i]['description']
                    
                    // format strings
                    var subheader = semester + " " + year + " | " + instructor
                    if(description.length > 160){
                    	// truncate description
                        description = description.substring(0,160) + "...";
                    }

    				// Build project's display card
                    $( '#projects' ).append(
                        '<div class="col-md-4 col-sm-6 mb-3">' +
                            '<div id="' + i + '" class="card h-100 border-dark" data-toggle="modal" data-target="#myModal">' +
                                '<div class="card-header">' + project_name + '<br> <i>' + subheader + '</i></div>' +
                                '<div class="card-body text-dark">' +
                                    '<p class="card-text">' + description + '</p>' +
                                '</div>' +
                            '</div>' +
                        '</div>'
                    );
                }
            }
            
        }
    });
}

