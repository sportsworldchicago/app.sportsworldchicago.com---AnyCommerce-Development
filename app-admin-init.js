console.log(" ->>>> admin init file has been loaded");
adminApp.rq.push(['extension',0,'admin','extensions/admin/extension.js','initExtension']);
adminApp.rq.push(['extension',0,'admin_prodedit','extensions/admin/product_editor.js']);
adminApp.rq.push(['extension',0,'admin_orders','extensions/admin/orders.js']);
adminApp.rq.push(['extension',0,'admin_sites','extensions/admin/sites.js']);
//adminApp.rq.push(['extension',0,'admin_launchpad','extensions/admin/launchpad.js']); 

//these can be loaded later because none of them are required for a page to load.
//this will change going forward.
adminApp.rq.push(['extension',1,'store_prodlist','extensions/store_prodlist.js']);
adminApp.rq.push(['extension',1,'store_navcats','extensions/store_navcats.js']);
adminApp.rq.push(['extension',1,'store_search','extensions/store_search.js']);
adminApp.rq.push(['extension',1,'store_product','extensions/store_product.js']);



adminApp.rq.push(['extension',0,'cco','extensions/cart_checkout_order.js']);
adminApp.rq.push(['extension',0,'order_create','extensions/checkout/extension.js']);
adminApp.rq.push(['extension',0,'cart_message','extensions/cart_message/extension.js']);

adminApp.rq.push(['extension',0,'admin_support','extensions/admin/support.js']); 
adminApp.rq.push(['extension',0,'admin_tools','extensions/admin/tools.js']); 
adminApp.rq.push(['extension',0,'admin_navcats','extensions/admin/navcats.js']); 
adminApp.rq.push(['extension',0,'admin_task','extensions/admin/task.js']);
adminApp.rq.push(['extension',0,'admin_template','extensions/admin/template_editor.js']); 
adminApp.rq.push(['extension',0,'admin_marketplace','extensions/admin/marketplace.js']); //needs to be in pass 0 for linkFrom (links from marketplaces)
 
adminApp.rq.push(['extension',0,'admin_config','extensions/admin/config.js']);
adminApp.rq.push(['extension',0,'admin_reports','extensions/admin/reports.js']);
adminApp.rq.push(['extension',0,'admin_batchjob','extensions/admin/batchjob.js']);
adminApp.rq.push(['extension',0,'admin_customer','extensions/admin/customer.js']);
adminApp.rq.push(['extension',0,'admin_wholesale','extensions/admin/wholesale.js']);
adminApp.rq.push(['extension',0,'admin_user','extensions/admin/user.js']);
adminApp.rq.push(['extension',0,'admin_medialib','extensions/admin/medialib.js']); //do NOT set to zero. causes a script issue.
adminApp.rq.push(['extension',0,'admin_trainer','extensions/admin/trainer.js']); //load in pass 0 for local testing.

adminApp.rq.push(['extension',0,'tools_animation','extensions/tools_animation.js', function(){
	$('.mhTabsContainer [data-animation]').each(function(){
		var args = $(this).attr('data-animation');	
		var anim = args.split('?')[0];
		var params = adminApp.u.kvp2Array(args.split('?')[1]);
		adminApp.ext.tools_animation.u.loadAnim($(this),anim,params);
		});
	}]);

//required for init. don't change from 0.
adminApp.rq.push(['script',0,adminApp.vars.baseURL+'includes.js',function(){window.myCreole = new Parse.Simple.Creole();}]); //','validator':function(){return (typeof handlePogs == 'function') ? true : false;}})

adminApp.rq.push(['script',1,adminApp.vars.baseURL+'resources/jquery.ui.jeditable.js']); //used for making text editable (customer address). non-essential. loaded late. used in orders.
adminApp.rq.push(['script',0,adminApp.vars.baseURL+'app-admin/resources/highcharts-3.0.1/highcharts.js']); //used for KPI

adminApp.rq.push(['script',0,adminApp.vars.baseURL+'resources/crypto-md5-2.5.3.js']); //used for authentication and in various other places.

//have showLoading as early as possible. pretty handy feature. used everywhere.
adminApp.rq.push(['script',0,adminApp.vars.baseURL+'resources/jquery.showloading-v1.0.jt.js']);

//these are resources that are not currently used.
//adminApp.rq.push(['script',0,adminApp.vars.baseURL+'resources/jquery.mousewheel-3.0.6.min.js']);//used in the launchpad. needed early.
//adminApp.rq.push(['script',1,adminApp.vars.baseURL+'resources/jquery.fullscreen-1.2.js']); //used in template editor. will likely get used more.

//used in campaigns. probably get used more. allows for time selection in datepicker.
adminApp.rq.push(['css',1,adminApp.vars.baseURL+'resources/jquery-ui-timepicker-addon.css']);
adminApp.rq.push(['script',1,adminApp.vars.baseURL+'resources/jquery-ui-timepicker-addon.js']);

// required for building/restoring ebay item specifics from @RECOMMENDATIONS list + 'ebay:itemspecifics'
adminApp.rq.push(['script',1,adminApp.vars.baseURL+'app-admin/resources/jquery.ebay-specifics-form.js']);

//anycommerce plugins, such as anycontent, anytable, anycb, etc.
adminApp.rq.push(['script',0,adminApp.vars.baseURL+'resources/jquery.ui.anyplugins.js']);
adminApp.rq.push(['css',1,adminApp.vars.baseURL+'resources/anyplugins.css']);


adminApp.rq.push(['script',0,adminApp.vars.baseURL+'resources/jquery.ui.qrcode-0.7.0.js']);


// jQuery-contextMenu - http://medialize.github.com/jQuery-contextMenu/  used in orders.
adminApp.rq.push(['css',1,adminApp.vars.baseURL+'app-admin/resources/jquery.contextMenu.css']);
adminApp.rq.push(['script',0,adminApp.vars.baseURL+'app-admin/resources/jquery.contextMenu.js']); //must be in first pass in case orders is the landing page.
adminApp.rq.push(['script',1,adminApp.vars.baseURL+'app-admin/resources/jquery.ui.position.js']);


//used for image enlargement in template chooser (in syndication but suspect it will be in email, newsletter, app, etc soon enough)
adminApp.rq.push(['script',1,adminApp.vars.baseURL+'resources/load-image.min.js']); //in zero pass in case product page is first page.
adminApp.rq.push(['script',1,adminApp.vars.baseURL+'resources/jquery.image-gallery.jt.js']); //in zero pass in case product page is first page.

//adminApp.rq.push(['script',0,adminApp.vars.baseURL+'app-admin/resources/jquery.ui.touch-punch.min.js']);
//adminApp.rq.push(['script',0,adminApp.vars.baseURL+'app-admin/resources/jquery.shapeshift.js']);


//gets executed from app-admin.html as part of controller init process.
//t is this instance of the app (adminApp).

adminApp.u.showProgress = function(t)	{
//	adminApp.u.dump("adminApp.u.initMVC activated ["+attempts+"]");
	var includesAreDone = true;
	if(typeof t.vars.rq == 'object')	{
//what percentage of completion a single include represents (if 10 includes, each is 10%).
		var percentPerInclude = (100 / t.vars.rq.length);  
		var resourcesLoaded = t.u.numberOfLoadedResourcesFromPass(0);
		if(resourcesLoaded >= 0)	{
			var percentComplete = Math.round(resourcesLoaded * percentPerInclude); //used to sum how many includes have successfully loaded.
		
			$('#appPreViewProgressBar').val(percentComplete);
			$('#appPreViewProgressText').empty().append(percentComplete+"% Complete");
		
			if(resourcesLoaded == t.vars.rq.length)	{
				//the app will handle hiding the loading screen.
				}
			else	{
				setTimeout(function(){adminApp.u.showProgress(t)},250);
				}
			}
		else	{
			//to get here, rq was empty. either everything was loaded (and the app will take it from here) or an error occured at some point.
			}
		}
	else	{
		//rq is set to null once all the resources are loaded. to get here, the resources have been loaded.
		}

	}

//don't execute script till both jquery AND the dom are ready.

	adminApp.cmr.push(["view",function(message,$context){
//		adminApp.u.dump(" -> executing cmr.view");
		var $history = $("[data-app-role='messageHistory']",$context);
		var $o = "<p class='chat_post'><span class='from'>"+message.FROM+"<\/span><span class='view_post'>sent page view:<br \/>";
		if(message.vars && message.vars.pageType)	{
//			adminApp.u.dump(' -> pageType is set to: '+message.vars.pageType);
			switch(message.vars.pageType)	{
				case 'product':
					if(message.vars.pid)	{
						$o += 'product: '+message.vars.pid+' has been added to the product task list.'
						adminApp.ext.admin_prodedit.u.addProductAsTask({'pid':message.vars.pid,'tab':'product','mode':'add'});
						}
					else	{$o += 'Page type set to product but no pid specified.'}
					break;
				case 'homepage':
					$o += 'homepage';
					break;
				case 'category':
					if(message.vars.navcat)	{
						$o += 'category: '+message.vars.navcat;
						if(message.vars.domain)	{$o.addClass('lookLikeLink').on('click',function(){
							window.open(message.vars.domain+"/category/"+message.vars.navcat+"/");
							})}
						}
					else	{$o += 'Page type set to category but no navcat specified.'}
					break;
				
				case 'search':
					if(message.vars.keywords)	{}
					else	{$o += 'Page type set to search but no keywords specified.'}
					break;
				
				case 'company':
					if(message.vars.show)	{}
					else	{$o += 'Page type set to company but show not specified.'}
					break;
				
				case 'customer':
					if(message.vars.show)	{}
					else	{$o += 'Page type set to customer but show not specified.'}
					break;
				
				default:
					$o += 'unknown page type: '+message.vars.pageType+' (console contains more detail)';
					adminApp.u.dump("Unrecognized pageType in cart message.vars. vars follow:"); adminApp.u.dump(message.vars);
				}
			}
		else	{
			$o += 'unspecified page type or no vars set in message. (console contains more detail)';
			adminApp.u.dump("Unspecified pageType in cart message.vars. vars follow:"); adminApp.u.dump(message.vars);
			}
		$o += "</span><\/p>";
		$history.append($o);
		$history.parent().scrollTop($history.height());
		}]);
