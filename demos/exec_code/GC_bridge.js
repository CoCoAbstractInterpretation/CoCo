var extid = 'bdiogkcdmlehdjfandmfaibbkkaicppk';
var appid = 'jlffnegbpbekpachncglchmlbieolnkh';

function loadConfiguracao(){
	
	chrome.storage.sync.get({
		favoriteColor: 'red',
		likesColor: true,
		page_idext: 'bdiogkcdmlehdjfandmfaibbkkaicppk',
		page_idapp: 'jlffnegbpbekpachncglchmlbieolnkh'
	  }, function(items) {
		extid = items.page_idext;
		appid = items.page_idapp;
		
		chrome.extension.sendRequest(extid, { message: "caregar-tab-id", telaid:telaid },
			function(response) {
				console.log(response);
				
				telaid= response.tabid;
				urltab= response.taburl
				
				console.log(extid);
				console.log(appid);
				
			}
		);
	});

}

var telaid = -1;
var urltab = '';

$(document).ready(function() {
	loadConfiguracao();
});

$(document).on('click','.gc-print-clear-log', function(e) {
	
	$('.gc-print-log').html('');
	
	chrome.runtime.sendMessage(extid, { message: "console-log", telaid:telaid },
		function(response) {}
	);

});

$(document).on('click','.gc-print-fechar-log', function(e) {
	$('.gc-print-log-tela').css('display','none');
});

$(document).on('click','.gc-print-abrir-log', function(e) {
	$('.gc-print-log-tela').css('display','table');
});


$(document).on('click','.usuario-logado', function(e) {
	chrome.extension.sendRequest(extid,{ message: "version2", telaid:telaid },	
		function( response ){
			console.log(response);

	} );
});

$(document).on('click','.gc-print-open-app', function(e) {
	chrome.extension.sendRequest(extid,{ message: "open-app", telaid:telaid },	
		function( response ){
	} );
});

$(document).on('click','.gc-print-get-version', function(e) {
	chrome.extension.sendRequest(extid,{ message: "get-version", telaid:telaid },	
		function( response ){
			$('.recebevalor').val(response.version);

	} );
});

$(document).on('click','.gc-print-list-com', function(e) {
	getPortsCOM();
});

$(document).on('click','.gc-print-set-config', function(e) {
	setConfig();
});

$(document).on('click','.gc-print-list-drive', function(e) {
	getDrive();
});

$(document).on('click','.gc-print-open-com', function(e) {
	openCOM();
});

$(document).on('click','.gc-print-close-com', function(e) {
	closeCOM();
});


$(document).on('click','.gc-print-pos-bit', function(e) {
	postBit();
});

$(document).on('click','.gc-print-get-bit', function(e) {
	getBit();
});

$(document).on('click','.gc-print-ler-peso', function(e) {
	lerPeso();
});

function setConfig(){
	
	var porta = ''; //$('.gc-print-set-config').attr('porta');
	var drive = ''; //$('.gc-print-set-config').attr('drive');
	var parit = ''; //$('.gc-print-set-config').attr('parit');
	
	chrome.runtime.sendMessage(appid, { message: "set-conf", porta: porta, drive:drive, parit:parit, telaid:telaid },function(response) {});
	
}

function getPortsCOM() {
	
	chrome.runtime.sendMessage(appid, { message: "list-com", telaid:telaid},
	function(response) {

	});

}

function getDrive() {
	
	chrome.runtime.sendMessage(appid, { message: "list-drive", telaid:telaid},
	function(response) {

	});

}

function openCOM() {
	var porta = ''; //$('.gc-print-ports').val();
	
	chrome.runtime.sendMessage(appid, { message: "conect-com", port: porta, telaid:telaid },
	function(response) {

	});

}

function closeCOM() {
	var porta = ''; //$('.gc-print-ports').val();
	
	chrome.runtime.sendMessage(appid, { message: "close-com", port: porta, telaid:telaid },
	function(response) {

	});
}

function postBit() {
	var valor = $('.gc-print-velue-bit').val();
	
	chrome.runtime.sendMessage(appid, { message: "post-bit", dados: valor, telaid:telaid },
	function(response) {
		//console.log(valor);
	});

}

function lerPeso(){	
	chrome.runtime.sendMessage(appid, { message: "ler-peso", telaid:telaid},
	function(response) {
		//console.log(valor);
	});
}

function getBit() {
	
	chrome.runtime.sendMessage(appid, { message: "get-bit", telaid:telaid},
	function(response) {
		//console.log(valor);
	});

}

