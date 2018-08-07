define(["qlik", "jquery"],
function (qlik, $) {

	var apiConfig = { 
		url: 'http://ffmw3019406.internal.imsglobal.com:8085/', 
		method: 'POST'
	}; 
	var qlikConfig = {
		host: window.location.hostname,
		prefix: "/",
		port: window.location.port,
		isSecure: window.location.protocol === "https:"
	};
	
	return {
		definition: { // property panel definition
			type: 'items',
			component: 'accordion',
			items: {
				appearance: {
					uses: "settings",
					items: {
						section1: {
							type: "string",
							ref: "appid",
							label: "Visual App Id",
							expression: "optional",
							defaultValue: "47357b99-85e1-4efd-ab5e-3e1cf63d025e"
						},
						section2: {
							type: "string",
							ref: "sheetid",
							label: "Sheet Id",
							expression: "optional",
							defaultValue: "f2860584-6a2c-43dc-87a1-ccd87debdcf8"
						}
					}
				}
			},
		},	
		support : {
			snapshot: true,
			export: true,
			exportData : false
		},
		paint: function ($element, layout) {
			var self = this; 
			var ownId = this.options.id;             
			var app = qlik.currApp(this); 
			var global = qlik.getGlobal(qlikConfig);
			var scope = $('body').scope();
			scope.enigma = null;
			
			var html = '<div id="wrap' + ownId + '">';
			//add your rendering code here
			html += '<button class="lui-button" data-cmd="Ping' + ownId + '">Ping</button>';
			html += '<button class="lui-button" data-cmd="Send' + ownId + '" id="Send' + ownId + '">Send</button>';
			html += '<button class="lui-button" data-cmd="Start' + ownId + '" id="Start' + ownId + '">Start</button>';
			//html += '<button class="lui-button" data-cmd="Open' + ownId + '">Reload+Open Viz</button><br/>';
			html += '<div id="feedback' + ownId + '"></div>';
			html += '</div>';
			$element.html(html);

			$element.find('button').on('qv-activate', function() {
				if ($(this).data('cmd') == ('Ping' + ownId)) {
					console.log('Ping clicked.');
					var body = {Function:'Ping'};

					var xhr = new XMLHttpRequest();
					xhr.withCredentials = true;

					xhr.addEventListener("readystatechange", function () {
					  if (xhr.readyState == 4) {
						alert('readystatechange '+ xhr.status + ' ' + xhr.response);
					   }
					});
					/*xhr.onreadystatechange = function (response) {
						alert('onreadystatechange ' + xhr.status + ' ' + xhr.response);
					};
					
					xhr.addEventListener("load", function () {
						alert('load ' + xhr.status + ' ' + xhr.response);
					});
					xhr.onload = function() {
						alert('onload ' + xhr.responseText);
					};*/
					xhr.open(apiConfig.method, apiConfig.url, true);
					xhr.setRequestHeader("Content-Type", "application/json");
					//xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
					//xhr.setRequestHeader("Cache-Control", "no-cache");
					//xhr.setRequestHeader("Access-Control-Allow-Origin" , apiConfig.url);
    				//xhr.setRequestHeader('Access-Control-Allow-Credentials', "true");
					xhr.send(JSON.stringify(body));
/*
var settings = {
  "async": true,
  "crossDomain": true,
  "url": "http://ffmw3019406.internal.imsglobal.com:8085/",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json",
    "Cache-Control": "no-cache",
    //"Postman-Token": "15e03f7d-7358-48e9-939c-d86e3e0f052b"
  },
  "processData": false,
  "data": "{\"Function\":\"Ping\"}"
}

$.ajax(settings).done(function (response) {
  console.log('done request yeah ', response);
});
*/

				} else if ($(this).data('cmd') == ('Send' + ownId)) {
					document.getElementById("Send" + ownId).disabled = true;
	
					var wrapper = {	"ReferenceGroupings": [] };
					var grpElem = function(){
						return {
							"RefTableKey": 0,
							"HasTotal": false,
							"Rules": [],
							"GroupingIdColumn": []
						};
					};
					var newElem;	
					
/*
RefTableKey InputTable
0           Therapie{Pro92#Total_Data}.txt
7           Diagnose{Pro92#Total_Data}.txt
16          Praxis{Pro92#Total_Data}.txt
17          Ärzte{Pro92#Total_Data}.txt
*/
// go for 1st cohort: Therapie
					document.getElementById('feedback' + ownId).innerText = '1/5 Therapie array';
					app.model.enigmaModel.evaluate("$(vGetSetsJson(Therapie))")
					.then(function(rules){
						console.log('Therapie Sets: ', rules)
						newElem = grpElem();
						newElem.RefTableKey = 0;  // Table ID for Therapie (fix this hard-coding later)
						newElem.Rules = JSON.parse(rules);
						/* newElem.Rules.push({ //Grouping Last Element is always "Rest" (Hide: 1)
							"Id": newElem.Rules.length,  
							"ParId": newElem.Rules.length,
							"Level": 1,
							"Desc": "Rest",
							"LevelDesc": "?",
							"Hide": 1					
						});	*/											
						return(app.model.enigmaModel.evaluate("$(vSelectVector(Therapie))"))
					}).then(function(set){
						
						newElem.GroupingIdColumn = JSON.parse('[' + set + ']');
						console.log('Therapie array length:', newElem.GroupingIdColumn.length);
						wrapper.ReferenceGroupings.push( newElem )
						
// go for 2nd cohort: Diagnose	
						document.getElementById('feedback' + ownId).innerText = '2/5 Diagnose array';
						return(app.model.enigmaModel.evaluate("$(vGetSetsJson(Diagnose))"));
					}).then(function(rules){
						console.log('Diagnose Sets: ', rules)
						newElem = grpElem();
						newElem.RefTableKey = 7;  // Table ID for Diagnose (fix this hard-coding later)
						newElem.Rules = JSON.parse(rules);
						/*
						newElem.Rules.push({ //Grouping Last Element is always "Rest" (Hide: 1)
							"Id": newElem.Rules.length,  
							"ParId": newElem.Rules.length,
							"Level": 1,
							"Desc": "Rest",
							"LevelDesc": "?",
							"Hide": 1					
						}); */
						return(app.model.enigmaModel.evaluate("$(vSelectVector(Diagnose))"))						
					}).then(function(set){
						document.getElementById('feedback' + ownId).innerText = '2/5 Diagnose array (done)';
						newElem.GroupingIdColumn = JSON.parse('[' + set + ']');
						console.log('Diagnose array length:', newElem.GroupingIdColumn.length);
						wrapper.ReferenceGroupings.push( newElem )
						
// go for 3rd cohort: Praxis	
						document.getElementById('feedback' + ownId).innerText = '3/5 Praxis array';
						return(app.model.enigmaModel.evaluate("$(vGetSetsJson(Praxis))"));
					}).then(function(rules){
						console.log('Praxis Sets: ', rules)
						newElem = grpElem();
						newElem.RefTableKey = 16;  // Table ID for Praxis (fix this hard-coding later)
						newElem.Rules = JSON.parse(rules);
						/* newElem.Rules.push({ //Grouping Last Element is always "Rest" (Hide: 1)
							"Id": newElem.Rules.length,  
							"ParId": newElem.Rules.length,
							"Level": 1,
							"Desc": "Rest",
							"LevelDesc": "?",
							"Hide": 1					
						});	*/										
						return(app.model.enigmaModel.evaluate("$(vSelectVector(Praxis))"))						
					}).then(function(set){				
						newElem.GroupingIdColumn = JSON.parse('[' + set + ']');
						console.log('Praxis array length:', newElem.GroupingIdColumn.length);
						wrapper.ReferenceGroupings.push( newElem )
						
// go for 4th cohort: Ärzte	
						document.getElementById('feedback' + ownId).innerText = '4/5 Ärzte array';
						return(app.model.enigmaModel.evaluate("$(vGetSetsJson(Ärzte))"));
					}).then(function(rules){
						console.log('Ärzte Sets: ', rules)
						newElem = grpElem();
						newElem.RefTableKey = 17;  // Table ID for Ärzte (fix this hard-coding later)
						newElem.Rules = JSON.parse(rules);
						/* newElem.Rules.push({ //Grouping Last Element is always "Rest" (Hide: 1)
							"Id": newElem.Rules.length,  
							"ParId": newElem.Rules.length,
							"Level": 1,
							"Desc": "Rest",
							"LevelDesc": "?",
							"Hide": 1					
						});	*/											
						return(app.model.enigmaModel.evaluate("$(vSelectVector(Ärzte))"))						
					}).then(function(set){
						
						newElem.GroupingIdColumn = JSON.parse('[' + set + ']');
						console.log('Ärzte array length:', newElem.GroupingIdColumn.length);
						wrapper.ReferenceGroupings.push( newElem )

// done. Now Submit ...
						console.log('finished json', wrapper);
						
						var body = {Function:"SaveGrouping", Parameters:["TestGrouping", JSON.stringify(wrapper)]};

						var xhr = new XMLHttpRequest();
						xhr.withCredentials = true;

						xhr.addEventListener("readystatechange", function () {
						  if (this.readyState === 4) {
							alert(this.status + ' ' + this.response);
						  }
						});

						xhr.open(apiConfig.method, apiConfig.url);
						xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
						xhr.setRequestHeader("Cache-Control", "no-cache");
						xhr.send(JSON.stringify(body));
						console.log(JSON.stringify(body));
						
						document.getElementById("Send" + ownId).disabled = false;
						document.getElementById('feedback' + ownId).innerText = '5/5 Transferring to API.';
					});

				} else if ($(this).data('cmd') == ('Start' + ownId)) {
					var body = {Function:'StartJob'};

					var xhr = new XMLHttpRequest();
					xhr.withCredentials = true;

					xhr.addEventListener("readystatechange", function(){
					  if (this.readyState === 4) {
						document.getElementById('feedback' + ownId).innerText = this.status + ' ' + this.response;
						scope.enigma = global.session.__enigmaApp;
						scope.enigma.openDoc(layout.appid)
						.then(function(vizapp){
							console.log('Opened app ' + layout.appid);
							document.getElementById('feedback' + ownId).innerHTML = 'Reloading app <a target="other" href="'
							+ '/sense/app/' + layout.appid + '/sheet/' + layout.sheetid + '">' + layout.appid + '</a>';
							return vizapp.doReload();
						}).then(function(reloadedapp){							
							console.log('reloadedapp:');
							console.log(reloadedapp);
							document.getElementById('feedback' + ownId).innerHTML = '<a target="other" href="'
							+ '/sense/app/' + layout.appid + '/sheet/' + layout.sheetid + '">Open App</a>';
						}).catch(function(error){
							alert('Error ' + error);
						});
					  }
					});

					xhr.open(apiConfig.method, apiConfig.url);
					xhr.setRequestHeader("Content-Type", "application/json");
					xhr.setRequestHeader("Cache-Control", "no-cache");
					xhr.send(JSON.stringify(body));			

				} 
			})	
			//needed for export
			return qlik.Promise.resolve();
		}
	};

} );

