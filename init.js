

// A list of all the extensions that are going to be used.
//if an extension is 'required' for any page within the store to load properly, the extension should be added as a dependency within quickstart.js
var myExtensions = [
	{"namespace":"store_prodlist","filename":"extensions/store_prodlist.js"},
	{"namespace":"convertSessionToOrder","filename":"extensions/checkout_passive/extension.js"},  /* checkout_passive does not require buyer to login */
//	{"namespace":"convertSessionToOrder","filename":"extensions/checkout_nice/extension.js"},	/* checkout_nice prompts buyer to login */
	{"namespace":"store_checkout","filename":"extensions/store_checkout.js"},
	{"namespace":"store_navcats","filename":"extensions/store_navcats.js"},
	{"namespace":"store_search","filename":"extensions/store_search.js"},
	{"namespace":"store_product","filename":"extensions/store_product.js"},
	{"namespace":"store_cart","filename":"extensions/store_cart.js"},
	{"namespace":"store_crm","filename":"extensions/store_crm.js"},
	{"namespace":"myRIA","filename":"quickstart.js","callback":"startMyProgram"}];


/*
an object containing a list of scripts that are required/desired.
for each script, include:  
	pass -> scripts are loaded in a loop. pass 1 is loaded before app gets initiated and should only include 'required' scripts. Use > 1 for other scripts.
	location -> the location of the file. be sure to load a secure script on secure pages to avoid an ssl error.
	validator -> a function returning true or false if the script is loaded. Used primarily on pass 1.
optionally also include:
	callback -> a function to execute after the script is loaded.
*/
var acBaseScripts = new Array();


acBaseScripts.push({
	'pass':1,
	'location':(document.location.protocol == 'https:' ? 'https:' : 'http:')+'//ajax.googleapis.com/ajax/libs/jqueryui/1.8.21/jquery-ui.js',
	'validator':function(){return (typeof $ == 'function' && jQuery.ui) ? true : false;}
	})

acBaseScripts.push({'pass':1,'location':ac.baseURL+'model.js','validator':function(){return (typeof zoovyModel == 'function') ? true : false;}})
acBaseScripts.push({'pass':1,'location':ac.baseURL+'includes.js','validator':function(){return (typeof handlePogs == 'function') ? true : false;}})

//The config.js file is 'never' local. it's a remote file, so...
//when opening the app locally, always use the nonsecure config file. Makes testing easier.
//when opening the app remotely, use ac.baseURL which will be http/https as needed.

acBaseScripts.push({
	'pass':1,
	'location':(document.location.protocol == 'file:') ? ac.httpURL+'jquery/config.js' : ac.baseURL+'jquery/config.js',
	'validator':function(){return (typeof zGlobals == 'object') ? true : false;}
	})


acBaseScripts.push({
	'pass':1,
	'location':ac.baseURL+'controller.js',
	'validator':function(){return (typeof zController == 'function') ? true : false;},
	'callback':function(){acHandleAppInit()} //the acHandleAppInit callback is what instantiates the controller.
	})

//used for making text editable (customer address). non-essential. loaded late.
acBaseScripts.push({'pass':8,'location':ac.baseURL+'jeditable.js','validator':function(){return (typeof $ == 'function' && jQuery.editable) ? true : false;}})


var acScriptsInPass;
//don't execute script till both jquery AND the dom are ready.
$(document).ready(function(){
	acScriptsInPass = acLoadScriptsByPass(1,false)
	});


/*
Will load all the scripts from pass X where X is an integer less than 10.
This will load all of the scripts in the acBaseScripts object that have a matching 'pass' value.

*/

function acLoadScriptsByPass(PASS,CONTINUE)	{
//	acDump("BEGIN acLoadScriptsByPass ["+PASS+"]");
	var L = acBaseScripts.length;
	var numIncludes = 0; //what is returned. The total number of includes for this pass.
	for(var i = 0; i < L; i += 1)	{
		if(acBaseScripts[i].pass == PASS)	{
			numIncludes++
			loadScript(acBaseScripts[i].location,acBaseScripts[i].callback);
			}
		}
	if(CONTINUE == true && PASS <= 10)	{acLoadScriptsByPass((PASS + 1),true)}
	return numIncludes;
	}




//put any code that you want executed AFTER the app has been initiated in here.  This may include adding onCompletes or onInits for a given template.
function acAppIsLoaded()	{
	
//	myControl.util.dump("Executing myAppIsLoaded code...");
//display product blob fields in tabbed format.
	myControl.ext.myRIA.template.productTemplate.onCompletes.push(function(P) {$( "#tabbedProductContent" ).tabs()}) 
//sample for adding a onInit
	myControl.ext.myRIA.template.homepageTemplate.onInits.push(function(P) {
		//do something.
		}) //display product blob fields in tabbed format.
	}

//gets executed once controller.js is loaded.
//check dependencies and make sure all other .js files are done, then init controller.
//function will get re-executed if not all the scripts in acBaseScripts pass 1 are done loading.
//the 'attempts' var is incremented each time the function is executed.
function acHandleAppInit(attempts){
//	acDump("acHandleAppInit activated");
	var includesAreDone = true;

//what percentage of completion a single include represents (if 10 includes, each is 10%). subtract 1 just to make sure percentComplete < 100
	var percentPerInclude = Math.round((100 / acScriptsInPass)) - 1;  
	var percentComplete = 0; //used to sum how many includes have successfully loaded.
	
	if(!attempts){attempts = 1} //the number of attempts that have been made to load. allows for error handling
	var L = acBaseScripts.length
//	acDump(" -> L: "+L+" and attempt: "+attempts);
//don't break out of the loop on the first false. better to loop the whole way through so that the progress bar can go up as quickly as possible.
	for(var i = 0; i < L; i += 1)	{
		if(acBaseScripts[i].pass == 1 && acBaseScripts[i].validator()){
			//this file is loaded.
			percentComplete += percentPerInclude;
			}
		else if(acBaseScripts[i].pass != 1)	{
			//only first pass items are validated for instantiting the controller.
			}
		else	{
			//file not loaded.
			acDump(" -> attempt "+attempts+" waiting on: "+acBaseScripts[i].location)
			includesAreDone = false;
			}
		}

	$('#appPreViewProgressBar').val(percentComplete);
	$('#appPreViewProgressText').empty().append(percentComplete+"% Complete");
	
	if(includesAreDone == true && jQuery)	{
		$.support.cors = true;  //cross site scripting for non cors sites. will b needed for IE10. IE8 & 9 don't support xss well.
		myControl = new zController({
			"release":"20120807135400" //increment this with each change. should solve caching issues.
			},myExtensions);  //instantiate controller. handles all logic and communication between model and view.

		//instantiate wiki parser.
		myCreole = new Parse.Simple.Creole();
		acLoadScriptsByPass(2,true);
		}
	else if(attempts > 80)	{
		acDump("WARNING! something went wrong in init.js");
		//this is 10 seconds of trying. something isn't going well.
		$('#appPreView').empty().append("<h2>Uh Oh. Something seems to have gone wrong. </h2><p>Several attempts were made to load the store but some necessary files were not found or could not load. We apologize for the inconvenience. Please try 'refresh' and see if that helps.<br><b>If the error persists, please contact the site administrator</b><br> - dev: see console.</p>");
//throw some debugging at the console to report what didn't load.
		for(var i = 0; i < L; i += 1)	{
			if(acBaseScripts[i].pass == 1)	{
				acDump(" -> "+acBaseScripts[i].location+": "+acBaseScripts[i].validator());
				}
			}
		
		}
	else	{
		setTimeout("acHandleAppInit("+(attempts+1)+")",250);
		}
	}
