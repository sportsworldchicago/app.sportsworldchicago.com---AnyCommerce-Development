/* **************************************************************

   Copyright 2011 Zoovy, Inc.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

************************************************************** */





var admin_customer = function() {
	var theseTemplates = new Array('customerSearchResultsTemplate','CustomerPageTemplate','customerEditorTemplate','customerEditorTicketListTemplate','customerEditorGiftcardListTemplate','customerEditorWalletListTemplate','customerEditorAddressListTemplate','customerEditorNoteListTemplate','customerAddressAddUpdateTemplate','customerEditorOrderListTemplate','customerWalletAddTemplate','customerCreateTemplate');
	var r = {


////////////////////////////////////   CALLBACKS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\



	callbacks : {
//executed when extension is loaded. should include any validation that needs to occur.
		init : {
			onSuccess : function()	{
				var r = true; //return false if extension won't load for some reason (account config, dependencies, etc).

				app.model.fetchNLoadTemplates(app.vars.baseURL+'extensions/admin/customer.html',theseTemplates);
//				app.rq.push(['css',0,app.vars.baseURL+'extensions/admin/customer.css','user_styles']);

				var $modal = $("<div \/>",{'id':'customerUpdateModal'}).appendTo('body'); //used for various update/add features.
				$modal.dialog({'autoOpen':false,'width':500,'height':500,'modal':true});
				
				return r;
				},
			onError : function()	{
//errors will get reported for this callback as part of the extensions loading.  This is here for extra error handling purposes.
//you may or may not need it.
				app.u.dump('BEGIN admin_orders.callbacks.init.onError');
				}
			}
		}, //callbacks



////////////////////////////////////   ACTION    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

		a : {
//This is how the task manager is opened. Just execute this function.
// later, we may add the ability to load directly into 'edit' mode and open a specific user. not supported just yet.
			showCustomerManager : function($target) {

				if($("[data-app-role='dualModeContainer']",$target).length)	{$target.show()} //already an instance of help open in this target. leave as is.
				else	{
					$target.anycontent({'templateID':'CustomerPageTemplate','showLoading':false}); //clear contents and add help interface
					app.ext.admin.u.handleAppEvents($target);
					}
				
//if the target is a tab, bring that tab/content into focus.
				if($target.data('section'))	{
					app.ext.admin.u.bringTabIntoFocus($target.data('section'));
					app.ext.admin.u.bringTabContentIntoFocus($target);
					}

				}, //showCustomerManager

//in obj, currently only CID is present (and required). but most likely, PRT will be here soon.
			showCustomerEditor : function($target,obj)	{
				
				if($target && typeof $target == 'object')	{
					if(obj && obj.CID)	{
						$target.showLoading("Fetching Customer Record");
						app.calls.appNewslettersList.init({},'mutable');
						app.ext.admin.calls.adminWholesaleScheduleList.init({},'mutable');
						console.warn('Giftcards currently disabled because they do not work. returns iseerr.');
						app.ext.admin.calls.adminCustomerDetail.init({'CID':obj.CID,'rewards':1,'wallets':1,'tickets':1,'notes':1,'events':1,'orders':1,'giftcards':1},{'callback':function(rd){
$target.hideLoading();

if(app.model.responseHasErrors(rd)){
	app.u.throwMessage(rd);
	}
else	{
	
	$target.anycontent({'templateID':'customerEditorTemplate','data':app.data[rd.datapointer]});
	
	$("div.panel",$target).each(function(){
		var PC = $(this).data('app-role'); //panel content (general, wholesale, etc)
		$(this).data('cid',obj.CID).anypanel({'wholeHeaderToggle':false,'showClose':false,'state':'persistent','extension':'admin_customer','name':PC,'persistent':true});
		})
	
	}

	var sortCols = $('.twoColumn').sortable({  
		connectWith: '.twoColumn',
		handle: 'h2',
		cursor: 'move',
		placeholder: 'placeholder',
		forcePlaceholderSize: true,
		opacity: 0.4,
//the 'stop' below is to stop panel content flicker during drag, caused by mouseover effect for configuration options.
		stop: function(event, ui){
			$(ui.item).find('h2').click();
			sortCols.each(function(){console.log($(this).sortable( "toArray" ))})
//			console.log(' -> here.');
			}
		});
	
	$("input",$target).each(function(){
		$(this).off('change.trackChange').on('change.trackChange',function(){
			$(this).addClass('edited');
			$('.numChanges').text($('.edited',sortCols).length).parents('button').addClass('ui-state-highlight').button('enable');
			});
		});

	app.ext.admin.u.handleAppEvents($target);
	$("table.gridTable thead",$target).parent().anytable();
	$("[type='checkbox']",$target).parent().anycb();
	app.ext.admin_customer.u.handleAnypanelButtons($target,obj);
	
							}},'mutable');
						app.model.dispatchThis('mutable');
						}
					else	{
						$target.anymessage({"message":"In admin_customer.a.showCustomerEditor, CID was not passed"});
						}
					}
				else	{
					$('#globalMessaging').anymessage({"message":"In admin_customer.a.showCustomerEditor, $target is blank or not an object."});
					}
				}, //showCustomerEditor

//obj should contain CID. likely will include partition soon too.
			showAddWalletModal : function(obj,$parent)	{
				var $target = $('#customerUpdateModal').empty();
				$('.ui-dialog-title',$target.parent()).text('Add a new wallet');
				$target.dialog('open');
				if(obj && obj.CID)	{
					$target.anycontent({'templateID':'customerWalletAddTemplate','showLoading':false,'dataAttribs':obj});
					app.ext.admin.u.handleAppEvents($target);
					}
				else	{
					$target.anymessage({'message':'In admin_customer.a.showAddWalletModal, no CID defined.',gMessage:true});
					}
				},


			showCustomerCreateModal : function(){
				var $target = $('#customerUpdateModal').empty();
				$('.ui-dialog-title',$target.parent()).text('Add a new customer'); //blank the title bar so old title doesn't show up if error occurs
				$target.dialog('open');
				$target.anycontent({'templateID':'customerCreateTemplate','showLoading':false});
				
				app.ext.admin.u.handleAppEvents($target);
				
				
				},

//obj required params are cid, type (bill or ship)
			showAddAddressModal : function(obj,$parent){
				var $target = $('#customerUpdateModal').empty();
				$('.ui-dialog-title',$target.parent()).text(''); //blank the title bar so old title doesn't show up if error occurs
				$target.dialog('open');
				
				if(obj && obj.CID && obj.type)	{
					$('.ui-dialog-title',$target.parent()).text('Add a new '+obj.type.substring(0).toLowerCase()+' customer address');
					$target.anycontent({'templateID':'customerAddressAddUpdateTemplate','showLoading':false});
				
					if(obj.type == '@SHIP')	{
						$("[type='email']",$target).parent().empty().remove();
						}
					else if(app.data["adminCustomerDetail|"+obj.CID] && app.data["adminCustomerDetail|"+obj.CID]._EMAIL )	{
						$("[type='email']",$target).val(app.data["adminCustomerDetail|"+obj.CID]._EMAIL); //populate email address w/ default.
						}
					else	{}
					
					var $form = $('form',$target),
					$btn = $("<button \/>").text('Add Address').button().on('click',function(event){
						event.preventDefault();
						app.ext.admin_customer.u.customerAddressAddUpdate($form,'ADDRCREATE',obj,$target);
						});

					$form.append($btn);
					$('input',$form).each(function(){
						if($(this).attr('name') != 'address2')	{$(this).attr('required','required')}
						});

					}
				else	{
					$target.anymessage({'message':'In admin_customer.a.showAddAddressInModal, either CID ['+obj.CID+'] or type ['+obj.type+'] is not set.','gMessage':true});
					}
				
				}
			
			}, //Actions

////////////////////////////////////   RENDERFORMATS    \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\

		renderFormats : {
//will generate a select list of wholesale schedules
//if the customer is already on a schedule, their schedule will be pre-selected.
//generates the select list too, instead of just the options, so that error messaging can be handled in a good manner.
//the customer object is what's passed in here.
			wholesaleScheduleSelect : function($tag,data)	{
				if(!app.data.adminWholesaleScheduleList)	{$tag.anymessage({'message':'Unable to fetch newsletter list'})}
				else if(!app.data.adminWholesaleScheduleList['@SCHEDULES'])	{
					$tag.anymessage({'message':'You have not created any schedules yet.'})
					}
				else if(!data.value)	{$tag.anymessage({'message':'No data passed into wholesaleScheduleSelect renderFormat'})}
				else	{
					var $select = $("<select \/>",{'name':'SCHEDULE'}),
					schedules =app.data.adminWholesaleScheduleList['@SCHEDULES'], //shortcut
					L = app.data.adminWholesaleScheduleList['@SCHEDULES'].length
					list = null;
					$select.append($("<option \/>",{'value':''}).text('none'));
					for(var i = 0; i < L; i += 1)	{
						$select.append($("<option \/>",{'value':schedules[i].id}).text(schedules[i].id));
						}
					
					$select.appendTo($tag);
					
					if(data.value.INFO && data.value.INFO.SCHEDULE)	{$select.val(data.value.INFO.SCHEDULE)} //preselect schedule, if set.
					
					}
				}, //wholesaleScheduleSelect
			
			newsletters : function($tag,data)	{
				
				if(!app.data.appNewslettersList)	{$tag.anymessage({'message':'Unable to fetch newsletter list'})}
				else if(!app.data.appNewslettersList['@lists'])	{
					$tag.anymessage({'message':'You have not created any subscriber lists.'})
					}
				else	{
					var $f = $("<fieldset \/>"),
					L = app.data.appNewslettersList['@lists'].length;
					
					for(var i = 0; i < L; i += 1)	{
						$("<label \/>").append($("<input \/>",{'type':'checkbox','name':'list_'+app.data.appNewslettersList['@lists'][i].ID})).append(app.data.appNewslettersList['@lists'][i].NAME + " [prt: "+app.data.appNewslettersList['@lists'][i].PRT+"]").appendTo($f);
						}
					$f.appendTo($tag);
					}
				
				} //newsletters

			}, //renderFormats
////////////////////////////////////   UTIL [u]   \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\


		u : {
//adds the extra buttons to each of the panels.
//obj should include obj.CID
			handleAnypanelButtons : function($target,obj){
				if($target && typeof $target == 'object')	{
					if(obj.CID)	{
						$('.panel_ship',$target).anypanel('option','settingsMenu',{'Add Address':function(){
							app.ext.admin_customer.a.showAddAddressModal({type:'@SHIP','CID':obj.CID},$target);
							}});
						$('.panel_bill',$target).anypanel('option','settingsMenu',{'Add Address':function(){
							app.ext.admin_customer.a.showAddAddressModal({type:'@BILL','CID':obj.CID},$target);
							}});
						$('.panel_wallets',$target).anypanel('option','settingsMenu',{'Add Wallet':function(){
							app.ext.admin_customer.a.showAddWalletModal(obj,$target);
							}});
						}
					else	{
						$target.anymessage({'message':'In admin_customer.u.handleAnypanelButtons, CID not passed.','gMessage':true});
						}
					}
				else	{
					$('#globalMessaging').anymessage({'message':'In admin_customer.u.handleAnypanelButtons, CID not passed.','gMessage':true});
					}
				}, //handleAnypanelButtons

//macro is the addr macro for adminCustomerUpdate (either addrcreate or addrupdate)
//obj should contain CID and type. in the future, likely to contain partition.
//$parent is optional. if passed, used for updating the panel that the address was added/updated from. This is not the parent of the form, but the originator of where add/edit was clicked.
			customerAddressAddUpdate : function($form,MACRO,obj,$parent)	{
				if(MACRO && $form && $form instanceof jQuery)	{
					if(app.ext.admin.u.validateForm($form))	{
						$('body').showLoading({"message":"Customer address being updated/added for "+obj.CID});
						var formObj = $form.serializeJSON();

						app.model.destroy("adminCustomerDetail|"+obj.CID);
//if a parent is defined, then update the appropriate panel within the parent.
						if($parent && typeof $parent == 'object' && $parent.length && $("[data-app-role='"+obj.type.substring(1).toLowerCase()+"']",$parent))	{}
						
						app.ext.admin.calls.adminCustomerUpdate.init([MACRO+"?"+encodeURIComponent(formObj)],{'callback':function(){
							$('body').hideLoading();
							if(app.model.responseHasErrors(rd)){
								$target.anymessage(rd);
								}
							else	{
								$target.empty().anymessage({'message':'Thank you, the address has been added'});
								}
							}},'immutable');
						app.model.dispatchThis('immutable');
						}
					else	{
						$form.anymessage({'message':'Some required fields were missing or left blank.'})
						}
					}
				else	{
					$('#globalMessaging').anymessage({'message':'In admin_customer.u.customerAddressAddUpdate, either $form or macro not passed.'});					
					}
				} //customerAddressAddUpdate
				
			}, //u [utilities]

		e : {
//use this on any delete button that is in a table row and that does NOT automatically delete, but just queue's it.
			'customerRowRemove' : function($btn)	{
				$btn.button({icons: {primary: "ui-icon-circle-close"},text: false});
				$btn.off('click.customerAddressRemove').on('click.customerAddressRemove',function(event){
					event.preventDefault();
//if this class is already present, the button is set for delete already. unset the delete.
					if($btn.hasClass('ui-state-error'))	{
						$btn.removeClass('ui-state-error').parents('tr').removeClass('ui-state-error').find('button').each(function(){
							$(this).button('enable')
							}); //enable the other buttons
						$btn.button('enable');
						}
					else	{

						$btn.addClass('ui-state-error').parents('tr').addClass('ui-state-error').find('button').each(function(){
							$(this).button('disable')
							}); //disable the other buttons
						$btn.button('enable');

						}
					});
				}, //customerRowRemove
//used for both addresses and wallets.
			'customerHandleIsDefault' : function($btn){
				$btn.button({icons: {primary: "ui-icon-check"},text: false});

				if($btn.closest('tr').data('_is_default') == 1)	{$btn.addClass('ui-state-highlight')}

				$btn.off('click.customerEditorSave').on('click.customerEditorSave',function(event){
					event.preventDefault();
					$btn.closest('table').find('button.ui-state-highlight').removeClass('ui-state-highlight'); //un-default the other buttons.
					$btn.addClass('ui-state-highlight'); //flag as default.
					});
				}, //customerHandleIsDefault

			'customerWalletDetail' : function($btn)	{
				$btn.button({icons: {primary: "ui-icon-check"},text: false});

				$btn.off('click.customerWalletDetail').on('click.customerWalletDetail',function(event){
					event.preventDefault();
					});				
				}, //customerWalletDetail
			
			'customerAddressUpdate' : function($btn){
				$btn.button({icons: {primary: "ui-icon-pencil"},text: false});
				console.warn('action on customerAddressUpdate not complete');
				$btn.off('click.customerEditorSave').on('click.customerEditorSave',function(event){
					event.preventDefault();
					var $target = $('#customerUpdateModal').empty();
					$('.ui-dialog-title',$target.parent()).text('Update customer address');
					$target.dialog('open');
					
					var CID = $(this).closest('.panel').data('cid'),
					type = $btn.closest("[data-address-type]").data('address-type'),
					index = Number($btn.closest('tr').data('obj_index'));
					
					if(CID && index >= 0 && type)	{
						$target.anycontent({'templateID':'customerAddressAddUpdateTemplate','showLoading':false,data:app.data['adminCustomerDetail|'+CID][type][index]});

						$("[name='SHORTCUT']",$target).attr('disabled','disabled').parent().append('not editable'); //once created, the shortcut is not editable.

						if(type == '@SHIP')	{
							$("[type='email']",$target).parent().empty().remove();
							}

						var $button = $("<button \/>").text('Save Address').button().on('click',function(event){
							event.preventDefault();
							app.ext.admin_customer.u.customerAddressAddUpdate($('form',$target),'ADDRUPDATE',{'CID':CID,'type':type},$target);
							});						
						$target.append($button);
						}
					else	{
						$target.anymessage({'message':'In admin_customer.e.customerAddressUpdate, unable to determine CID ['+CID+'] or address type ['+type+'] or address index ['+index+']',gMessage:true});
						}
					});
				}, //customerAddressUpdate

//saves all the changes to a customer editor			
			'customerEditorSave' : function($btn)	{
				$btn.button();
console.warn('action on customerEditorSave not complete');
				$btn.off('click.customerEditorSave').on('click.customerEditorSave',function(event){
					event.preventDefault();
					alert('this will do something');
					});
				}, //customerEditorSave

//run when searching the customer manager for a customer.
			'customerSearch' : function($btn){
				$btn.button({icons: {primary: "ui-icon-search"},text: false});
				$btn.off('click.customerSearch').on('click.customerSearch',function(event){
					event.preventDefault();

					var $parent = $btn.closest("[data-app-role='dualModeContainer']"),
					$form = $("[data-app-role='customerSearch']",$parent).first(),
					formObj = $form.serializeJSON(),
					$target = $('.dualModeListContent',$parent).first();
					
					$target.empty(); //make sure any previously open customers are cleared.
					$parent.showLoading("Searching for "+formObj.email);
//					app.u.dump(" -> formObj: "); app.u.dump(formObj);
					app.ext.admin.calls.adminCustomerSearch.init(formObj.email,{callback:function(rd){
						$parent.hideLoading();
						
$('.dualModeListMessaging',$parent).empty();
if(app.model.responseHasErrors(rd)){
	$parent.anymessage(rd);
	}
else	{
	if(app.data[rd.datapointer] && app.data[rd.datapointer].CID)	{
		app.ext.admin_customer.a.showCustomerEditor($target,{'CID':app.data[rd.datapointer].CID});
		}
	else	{
		$('.dualModeListMessaging',$parent).anymessage({'message':'No customers matched that email address. Please try again.<br />Searches are partition specific, so if you can not find this user on this partition, switch to one of your other partitions','persistant':true});
		}
	}
						}},'mutable');
					app.model.dispatchThis();

					});
				}, //customerSearch

			'walletCreate' : function($btn)	{
				$btn.button();
				$btn.off('click.walletCreate').on('click.walletCreate',function(event){
					event.preventDefault();
					
					var $form = $btn.closest('form'),
					CID = $btn.closest("[data-cid]").data('cid');
					
					if(!CID)	{
						$form.anymessage({'message':'in admin_customer.e.walletCreate, could not determine CID.','gMessage':true});
						}
					else if(app.ext.admin.u.validateForm($form))	{
						$form.showLoading({'message':'Adding wallet to customer record.'});
						app.ext.admin.calls.adminCustomerUpdate.init(["WALLETCREATE?"+encodeURIComponent($form.serializeJSON())],{'callback':function(){
							$form.hideLoading();
							if(app.model.responseHasErrors(rd)){
								$form.anymessage(rd);
								}
							else	{
								$form.parent().empty().anymessage({'message':'Thank you, the wallet has been added','errtype':'success'});
								}
							}},'immutable');
						app.model.dispatchThis('immutable');
						}
					else	{
						$form.anymessage({'message':'Please enter all the fields below.'});
						}
					});
				}

			} //e [app Events]
		} //r object.
	return r;
	}