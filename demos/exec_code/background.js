var extid = 'bdiogkcdmlehdjfandmfaibbkkaicppk';
var appid = 'jlffnegbpbekpachncglchmlbieolnkh';
var mslog = true;

var drive   = '*';
var stastus = 0;

	chrome.storage.sync.get({
		page_idext: 'bdiogkcdmlehdjfandmfaibbkkaicppk',
		page_idapp: 'jlffnegbpbekpachncglchmlbieolnkh',
		mostra_log: true
	  }, function(items) {
		extid = items.page_idext;
		appid = items.page_idapp;
		mslog = items.mostra_log;
		console.log(extid);
		console.log(appid);
	});
	
function loadConfiguracao(){
	chrome.storage.sync.get({
		page_idext: 'bdiogkcdmlehdjfandmfaibbkkaicppk',
		page_idapp: 'jlffnegbpbekpachncglchmlbieolnkh',
		mostra_log: true
	  }, function(items) {
		extid = items.page_idext;
		appid = items.page_idapp;
		mslog = items.mostra_log;
		console.log(extid);
		console.log(appid);
	});
}

chrome.storage.onChanged.addListener(function(changes, areaName) {
	loadConfiguracao();	
});

var ultimopesolido = -1;

var telaid = -1;
var urltab = '';

chrome.tabs.onActiveChanged.addListener(function(tabId,selectInfo) {

  chrome.tabs.get(tabId, function(tab){
	 
	 if ((tab.url.indexOf("localhost") > 0) || (tab.url.indexOf("delfa.com.br") > 0) || (tab.url.indexOf("192.168.0.100") > 0)) {
		telaid = tabId;
		urltab = tab.url;
		
		chrome.tabs.executeScript( telaid, {code:"console.log('TabID:"+telaid+"');"},function(results){} );
		var porta = '';
		
		//chrome.runtime.sendMessage(appid, { message: "close-com", port: porta, telaid:telaid },
		//function(response) {
		//
		//});
	}
	
  });
  
	
});

function caregarTabID(Response){
	chrome.tabs.query({active:true},function(tabs) {
		
		var tabencontrada = null;
		
		tabs.forEach(function(tab){
	
			if ((tab.url.indexOf("localhost") > 0) || (tab.url.indexOf("delfa.com.br") > 0) || (tab.url.indexOf("192.168.0.100") > 0)) {
				
				tabencontrada = tab.id;
				chrome.tabs.executeScript( tabencontrada, {code:"console.log('TabID:"+tabencontrada+"');"},function(results){} );
				telaid = tab.id;
				urltab = tab.url;

			}
		});
		
		 //Response({tabid: telaid, taburl:urltab});
	});
};

function posmensage(){
	chrome.runtime.sendMessage({greeting: "status"}, function(response) {
		
	});
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		
		ScriptConsoleLog('Inicializando exten');
		ScriptConsoleLog('Ext:'+extid);
		ScriptConsoleLog('App:'+appid);

    });
});

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
		sendResponse({stat: stastus,driv: drive,ret:'retorno'});
});

  chrome.extension.onRequest.addListener(
  function(request, sender, sendResponse) {
    if (request) {
      if (request.message) {
		  
		//ScriptConsoleLog('Chamada:'+request.message);
		
		switch (request.message) {
		case "version":
			sendResponse({version: '3.0.0'}); ScriptConsoleLog('Version:3.0.0');
			break;
		case "version2":
			chrome.management.launchApp(appid); sendResponse({message: 'Exc Open'}); ScriptConsoleLog('Abrindo aplicativo'); 
			break;
		case "open-app":
			chrome.management.launchApp(appid); sendResponse({message: 'Exc Open'}); ScriptConsoleLog('Abrindo aplicativo'); 
			break;
		case "get-version":
			sendResponse({version: '3.0.0'}); ScriptConsoleLog('Version:3.0.0');
			break;
		case "get-port-com":
			var list = getCOM(); sendResponse({message: list});
			break;
		case "console-log":
			ScriptConsoleLog(request.retorno);
			break;
		case "ler-peso":
			posmensage();
			setarpeso();
			break;
		case "caregar-tab-id":
			caregarTabID(Response); setTimeout(function(){sendResponse({tabid: telaid, taburl:urltab})},2000);
			break;
		case "setar-status":
			ScriptConsoleLog('setar-status');
			drive = request.driv;  
			stastus = request.stat;  
			break;
		}
      }
    }
    return true;
  });
  
 // also please post how to fetch tab url using activeInfo.tabid
   function ScriptConsoleLog(msg){
	  
	  var data = new Date();
		myDate = new Date();
		myDate.setHours(10, 30, 53, 400);
		msg = msg+'';
		msg = msg.replace(/(\r\n|\n|\r)/gm,"");
		
		var src = "$('.gc-print-log').append('"+data.toLocaleDateString()+" "+myDate.getHours() + ":" + myDate.getMinutes() + ":" + myDate.getSeconds()+": "+msg+"<br>');";
		
		if(mslog){
			if(telaid > 0){
				chrome.tabs.executeScript( telaid, {code:src},function(results){} );
				
				msg = msg.replace(/(")/gm,'');
				chrome.tabs.executeScript( telaid, {code:'console.log("'+msg+'");'},function(results){} );
			}else{
				//chrome.tabs.executeScript( null, {code:src},function(results){} );
			}
		}		
  }
  
  function ScriptListCom(msg){
	  if(telaid > 0){
			chrome.tabs.executeScript( telaid, {code:"$('.gc-print-ports').html('"+msg+"');"},function(results){} );
	  }
  }
  
  function ScriptListDrive(msg){
	if(telaid > 0){
		chrome.tabs.executeScript( telaid, {code:"$('.gc-print-drive').html('"+msg+"');"},function(results){} );
	}
  }
  
  function ScriptOpenCom(msg){
	  if(telaid > 0){
		chrome.tabs.executeScript( telaid, {code:"$('.status').html('"+msg+"');"},function(results){} );
	  }
  }
  
  function setarpeso(peso){
	if(telaid > 0){
		ScriptConsoleLog(peso);
		chrome.tabs.executeScript( telaid, {code:"$('.gc-print-recebe-peso').val('"+peso+"').click(); $('.gc-print-recebe-peso').each(function(){$(this).change();});"},function(results){});
	}
  }
  
  function setarPesoLido(dados){
	ultimopesolido = dados;
	setarpeso(ultimopesolido);
  }
  
  chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
	  
	  switch (request.message) {
		case "version":
			sendResponse({version: '3.0.0'});
			break;
		case "retorno-list-com":
			ScriptListCom(request.retorno);
			break;
		case "retorno-list-drive":
			ScriptListDrive(request.retorno);
			break;
		case "retorno-conect-com":
			ScriptOpenCom(request.retorno);
			chrome.runtime.sendMessage(appid, { message: "ler-peso"},
			function(response) {
				//console.log(valor);
			});
			break;
		case "console-log":
			ScriptConsoleLog(request.retorno);
			break;
		case "setar-peso":
			setarPesoLido(request.retorno);
			break;
		case "setar-drive":
			setarDrive(request.retorno);
			break;
		case "setar-status":
			drive = request.driv;  
			stastus = request.stat;  
			break;
		}
		
	  }
 );