define(["qlik", "jquery"],
function (qlik, $) {

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
							ref: "tablename",
							label: "Table of this Set",
							expression: "optional",
							defaultValue: "Diagnose"
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
			var html = '';
			//add your rendering code here
			html += '<input class="lui-input" style="width:150px;display:inline;" id="SetName'+ ownId + '"/>&nbsp;'; 
			html += '<button class="lui-button" id="Reload' + ownId + '" data-cmd="Reload' + ownId + '">Save</button>';
			$element.html(html);

			$element.find('button').on('qv-activate', function() {
//-------------------------------------------------------------------------------						
				if ($(this).data('cmd') == ('Reload' + ownId)) {
//-------------------------------------------------------------------------------					
					console.log('Clicked Reload');
					var vTable = layout.tablename;
					var vSetName = document.getElementById("SetName" + ownId).value;
					document.getElementById("SetName" + ownId).disabled = true;
					document.getElementById("Reload" + ownId).disabled = true;
					var vVector = '';
					var vWhereCond = '';
					console.log ("vSetName", vSetName);
					app.model.enigmaModel.evaluate("$(vCurrSelections)")
					.then(function(eval){
						var selections = JSON.parse(eval);						
						for (var i = 0; i < selections.length; i++) {
							if (selections[i].indexOf('([' + vTable + '.') > -1) {
								vWhereCond += (vWhereCond == '' ? '' : ' AND ') + selections[i];
							};
						}
						return app.model.enigmaModel.evaluate("=Concat("+vTable+".AutoID,CHR(10),"+vTable+".AutoID)")
					}).then(function(eval){
						// set 4 variables: vSelections, vWhereCond, vTable, vSetName
						return app.variable.setStringValue('vSelections', eval)
					}).then(function(res) {
						console.log('var vSelections set.');
						return app.variable.setStringValue('vWhereCond', vWhereCond)
					}).then(function(res) {
						console.log('var vWhereCond set to ' + res.qText);
						return app.variable.setStringValue('vTable', vTable)
					}).then(function(res) {
						console.log('var vTable set to ' + res.qText);
						return app.variable.setStringValue('vSetName', vSetName)
					}).then(function(res) {
						console.log('var vSetName set to ' + res.qText);
						if (vSetName.length > 0) {
							return app.doReload(0, true)  // true = partial reload
						} else {
							alert('Incomplete entry.');
							return false ;
						}
					}).then(function(done) {
						console.log(done);	
						document.getElementById("SetName" + ownId).disabled = false;
						document.getElementById("Reload" + ownId).disabled = false;							
					}).catch(function(err) {
						console.log("Error: ", err);
						document.getElementById("SetName" + ownId).disabled = false;
						document.getElementById("Reload" + ownId).disabled = false;
					});

				} 
			})	
			//needed for export
			return qlik.Promise.resolve();
		}
	};

} );

