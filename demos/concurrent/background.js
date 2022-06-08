// -- Variables -------------------------------------------------------
	var bDeleteLocalMemory = false;
	var vDebug = {normal:true, object:true};
	var slice = Array.prototype.slice;
	var manifest = chrome.runtime.getManifest();
	
//-- variables globales -----------------------------------------------
	var global  = {
		id						: 0,
		idTabGlobal		: 0,
		idLastSearch	: 0,
		
		aDirect		: [{id:0,url:""}],
		aSearch		: [], ///[{id:0, idTab: 0, idTabGlobal:0, search:"", idVisit:-1}],

		fnGetItemSearch: function(idTab) {
			//-Buscar por idTab
			var _oSearch = ""; 
			//_oSearch.idTab = -1;
			var bIsItemSearch = false;
			global.aSearch.forEach(function(item,index) {
				if (item.idTab === idTab) {
					_oSearch = item;
					_oSearch.index = index;
				}
			});
			return _oSearch;
		},
		
		//Nueva búsqueda o Nuevo Tab ... 		=> oSearch : {idTabPrev:-1;idTab;-1; search:""}
		fnSetItemSearch: function(oSearch) {
			//-HOWTO :: Poner el oSearch.url actual del oSearch.Tab
			var _oSearch = global.fnGetItemSearch( oSearch.idTabPrev == undefined ? oSearch.idTab : oSearch.idTabPrev );
			var _outSearch = "";
			if (oSearch.idTabPrev > -1 ) {
				//Nuevo Tab -- Viene de un tab previo
				console.log("Nuevo Tab -- Viene de un tab previo");

				var _oSearchTab = global.fnGetItemSearch(oSearch.idTab);
				
				if (_oSearchTab.idTab > -1 ) {
					//Está en la lista
					_oSearchTab.search 				=		(oSearch.search === "" ? _oSearchTab.search : oSearch.search) ;
					_oSearchTab.url		 				=	  oSearch.url;
					_oSearchTab.idVisit				=  	oSearch.idVisit;
				}
				else {
					//No está en la lista este Tab.. -> Insert
					global.idLastSearch++;
					global.idTabGlobal++;
					
					_oSearchTab								=		{};
					_oSearchTab.id 						= 	global.idLastSearch;
					_oSearchTab.idTabGlobal 	= 	global.idTabGlobal;
					_oSearchTab.idTab					=		oSearch.idTab;
					_oSearchTab.url		 				=	  oSearch.url;
					_oSearchTab.search 				=		_oSearch.search;
					_oSearchTab.idVisit				=  	oSearch.idVisit;
					
					global.aSearch.push(_oSearchTab);	
				}
				_outSearch									= 	_oSearchTab.search;
			}
			else {
				//Actualizamos el search
				console.log("Nuevo Tab -- Actualizamos el search");
				if (_oSearch.idTab > -1) {
					//Update search
					if (oSearch.search != "") {
						_oSearch.search	 				= 	oSearch.search;
						_oSearch.url		 				=	  oSearch.url;
						_oSearch.idVisit				=  	oSearch.idVisit;
					}
					_outSearch								= 	_oSearch.search;
				}
				else {
					//Crear el search
					global.idLastSearch++;
					global.idTabGlobal++;
					
					oSearch.id 								= 	global.idLastSearch;
					oSearch.idTabGlobal 			= 	global.idTabGlobal;
					
					global.aSearch.push(oSearch);
					_outSearch								= 	oSearch.search;
				}				
			}
			return _outSearch;
		},
		
		fnDelItemSearch: function(idTab) {
			function fnSetVisitEnd(_oSearch) {
				chrome.storage.local.get(function(items) {
					item = items[_oSearch.idVisit]; 
					item.visitEnd = Date.now();
					chrome.storage.local.set({ [_oSearch.idVisit]: item });
				});				
			}			

			//Saca un tab del array
			var _oSearch = global.fnGetItemSearch( idTab );
			global.aSearch.splice(_oSearch.index,1);
			//Poner el visitEnd al Visit
			fnSetVisitEnd( _oSearch );
		}
		
	}
	var vConfig = {
		mySite 	: "http://markingbook.com/markingbook/web/History.html"
	}
//---------------------------------------------------------------------
function log(){
    var args = slice.call(arguments);
    var msg = args.shift();
    msg = "(%s)" + msg;
    args.unshift(manifest.version);
    args.unshift(msg);

    console.log.apply(console, args);
}	 
function fnSaveLink(oMessage, oTab, callback) {
	if (vDebug.normal) { log("[Event]>> fnSaveLink(tab) >>"); }

	oLinkMessage = {
		id						: oMessage.id,
		favIconUrl		: oTab.favIconUrl,
		title					: oTab.title,
		url						: oTab.url,
		site					: oMessage.site,
		pathname			: oMessage.pathname,
			
		search				: oMessage.search,
			
		TabId					: oTab.id,
		TabPrev				: oTab.openerTabId,
		TabIndex			: oTab.index,
		TabIncognito	: oTab.incognito
	}
	////console.log(oLinkMessage);
	
	function fnListItems(items) {
		console.log(items);
	}
	function cLink(oProperties, oLink) {
		if (oLink == undefined) {
			global.id++; oLink = this; 
			oLink.id = global.id;
		}
		var _wordSearch = global.fnSetItemSearch({idVisit: global.id,search: oLinkMessage.search, idTab: oLinkMessage.TabId, idTabPrev: oLinkMessage.TabPrev, url: oLinkMessage.url});

		oLink.idParent			= (oProperties.hasOwnProperty('idParent') ? oProperties.idParent : oLink.idParent);
		oLink.title					= (oProperties.hasOwnProperty('title') ? oProperties.title : oLink.title);
		oLink.favIconUrl		= (oProperties.hasOwnProperty('favIconUrl') ? oProperties.favIconUrl : oLink.favIconUrl);
		oLink.url						= (oProperties.hasOwnProperty('url') ? oProperties.url : oLink.url);
		oLink.urlparent			= (oProperties.hasOwnProperty('urlparent') ? oProperties.urlparent : oLink.urlparent);
		oLink.search				= _wordSearch;
		
		oLink.site					= (oProperties.hasOwnProperty('site') ? oProperties.site : oLink.site);
		pathname						= oMessage.pathname;
				
		/*
			if (oLink.oUrl == undefined) oLink.oUrl = {};
					oLink.oUrl.scheme					= "";
					oLink.oUrl.user						= "";
					oLink.oUrl.password				= "";
					oLink.oUrl.host						= oLink. (oProperties.hasOwnProperty('url') ? oProperties.url.split("/")[2] : oLink.url.split("/")[2]);
					oLink.oUrl.ip							= "";
					oLink.oUrl.port						= "";
					oLink.oUrl.path						= "";
					oLink.oUrl.query					= "";
					oLink.oUrl.fragment				= "";
					oLink.oUrl.url						= (oProperties.hasOwnProperty('url') ? oProperties.url : oLink.url);
		*/
		oLink.visitIni			= Date.now();			
		oLink.visitEnd			= null;
	}
	function fnSetLink(oLinkMessage, callback) {
		log("[Event]>> fnSaveLink(tab) >> fnSetLink >>");
		function fnSetVisitEnd(items, oVisitParent) {
			//- oVisitParent = { idVisit: item.idVisit, url:item.url, visitEnd: Date.Now };
			item = items[oVisitParent.idVisit]; 
			item.visitEnd = oVisitParent.visitEnd;
			chrome.storage.local.set({ [oVisitParent.idVisit]: item });
		}
		function fnSetUrlParent(items, oLinkMessage) {
			/*
				// While por global.aSearch
				//	[.TabId === oLinkMessage.TabId] 		oReturnTab = global.aSearch[.url]
				//	[.TabId === oLinkMessage.TabPrev] 	oReturnTabParent = global.aSearch[.url]
				// End While
				
				// 	[oReturnTab > -1] 			return oReturnTab;
				//	[oReturnTabParent > -1]	return oReturnTabParent;
				// 	return "";
			*/
			var oReturnTab = -1, oReturnTabParent = -1;
			global.aSearch.forEach(function(item,index) {
				if (item.idTab == oLinkMessage.TabId) 		oReturnTab = {idVisit: item.idVisit, url:item.url, visitEnd: Date.now() };
				if (item.idTab == oLinkMessage.TabPrev) 	oReturnTabParent = {url:item.url, visitEnd: -1, idVisit: -1};
			});
			///console.log("fnSetUrlParent -- TabId [" + oLinkMessage.TabId + "] -- TabPrev [" + oLinkMessage.TabPrev + "] -- urlParent [" + oReturnTabParent + "]");
			
			if (oReturnTab != -1) 			 return oReturnTab;
			if (oReturnTabParent != -1 ) return oReturnTabParent;
			return {url:"", visitEnd:-1, idVisit:-1};
		}
		function Main(items, callback) {
			//-Modificaciones en el array del Tab ...
			var oVisitParent = fnSetUrlParent(items, oLinkMessage);
			if (oVisitParent.idVisit > -1) fnSetVisitEnd(items, oVisitParent);
			
			var oLink = new cLink({site:oLinkMessage.site, title:oLinkMessage.title, favIconUrl:oLinkMessage.favIconUrl, url:oLinkMessage.url, urlparent:oVisitParent.url});

			console.log(global.aSearch);
			//console.log(oLink);
			callback(oLink);
			
		}
		chrome.storage.local.get(function(items) {
			Main(items, callback);
		});
	}
	
	fnSetLink(oLinkMessage, function (oLinkMessage) {
		chrome.storage.local.set({ [oLinkMessage.id]: oLinkMessage });
		chrome.storage.local.set({ [0]: global.id			 });
		if (vDebug.object) { chrome.storage.local.get(fnListItems); }
		if (typeof(callback) == "function") callback(oMessage);
	});
}
function fnGetBookmarks(callback) {
	//-HOWTO: Modificar esto porque sino problemas al crear/modificar/delete bookmarks
	var data = "";
	function processNode(node) {
		// recursively process child nodes
		var title = "";
		title = node.title.replace(/"/gm, '&apos;');
		title = title.replace(/&/gm, '&amp;');
		title = title.replace(/'/gm, '&apos;');
		title = title.replace(/</gm, '&lt;');
		title = title.replace(/>/gm, '&gt;');

		if(node.children) {
			if (node.title != "") data += "<concept dir=\"" + node.title + "\" >";
			node.children.forEach(function(child) { processNode(child); });
			if (node.title != "") data += "</concept>";
		}

		// print leaf nodes URLs to console
		if(node.url) {
			var url = "";
			url = node.url.replace(/"/gm, '&apos;');
			url = url.replace(/&/gm, '&amp;');
			url = url.replace(/'/gm, '&apos;');
			url = url.replace(/</gm, '&lt;');
			url = url.replace(/>/gm, '&gt;');
			
			data += "<item name=\"" + title + "\" url=\"" + url + "\" />"; 
		}
	}

	chrome.bookmarks.getTree(function(itemTree){ //- array of BookmarkTreeNode results) {
		data = "<root>";
		itemTree.forEach(function(item,index){
			processNode(item);
		});
		data += "</root>";
		
		//console.log(data);
		//-HOWTO: Modificar esto porque sino problemas al crear/modificar/delete bookmarks
		localStorage["bookmarks"] = JSON.stringify(data);
		
		
		if (typeof callback == "function") callback(data);				
	});
}

function fnSetLocalStorage(oHistory) {
	if (vDebug) { console.log("[ fnSetLocalStorage >> oHistory"); console.log(oHistory); }
	if (oHistory.sustituir == 1) { 
		/* Borrar todo el localStorage; */ 
		chrome.storage.local.clear(function() {
			var error = chrome.runtime.lastError;
			if (error) {
				console.error(error);
			}
		});

		global.id=0; 
		chrome.storage.local.set({ [0]: global.id	 });
	}
	
	for (var i in oHistory.aItems) {
		global.id++;
		oLink = {
			id			: global.id,
			favIconUrl	: oHistory.aItems[i].favIconUrl,
			search		: oHistory.aItems[i].search,
			site		: oHistory.aItems[i].site,
			title		: oHistory.aItems[i].title,
			url  		: oHistory.aItems[i].url,
			urlparent	: oHistory.aItems[i].urlparent,
			visitIni	: Number(oHistory.aItems[i].visitIni),
			visitEnd	: Number(oHistory.aItems[i].visitEnd)
		}
		chrome.storage.local.set({ [oLink.id]: oLink });
		chrome.storage.local.set({ [0]: global.id	 });	
	}
}
function init() {
	function fnGetLastId(items) {
		if (items[0] != null)
			global.id = items[0];
		else
			global.id = 0;
	}
	
	console.clear();
	if (vDebug.normal) { log("> init()---"); }
	
	//-Search-Obtenemos el último id
	if (bDeleteLocalMemory) { chrome.storage.local.clear(); }
	chrome.storage.local.get(fnGetLastId);
	
	//Creamos los bookmarks !!!
	fnGetBookmarks();
}

// -- Main ------------------------------------------------------------
	init();
	// -- Tabs ----------------------------------------------------------
	chrome.tabs.onCreated.addListener(function (tab) {
		//- Puede venir de un parent, de un omnibox o de un history
		if (vDebug.normal) { log("[Event :: chrome.tabs.onCreated]"); }
		
		if (tab.url == "chrome://newtab/")
			chrome.tabs.update(tab.id,{url: vConfig.mySite});

		//chrome.tabs.executeScript(tab.tabId, {file:"ContentScript.js"});
	});
	chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
		localStorage["oTab"] = tab.url;
		vDebug.tabs_onUpdated = true;
		if (vDebug.normal) {
			log("[Event :: chrome.tabs.onUpdated]");
			///if (vDebug.tabs_onUpdated) {
			///	console.log("Tab [object]----");
			///	console.log(tab); 
			///}
		}
		
		if (typeof(changeInfo.favIconUrl) == "undefined")
			return;

		var host = tab.url.split("/")[0] +"/"+ tab.url.split("/")[1] +"/"+ tab.url.split("/")[2];
		var hostSite = host.split("/")[2]; // www.sport.es
		hostSite = hostSite.split(".");
		hostSite = hostSite[hostSite.length-2]+"."+hostSite[hostSite.length-1];
		localStorage["hostSite"] = hostSite;
		
		console.log(">>> host --- " + hostSite);
		var hostName = tab.url.split("/")[2].split(".")[1];
		var pathName = (tab.url.indexOf(host));
		
		var messageType, vSearch;
		if (hostName === "google") {
			//Si contiene q= entonces messageType : "onSearchGoogle", sino "onCreateGoogle"
			var iIniPosSearch = (tab.url.indexOf("q="));
			var iIniPosSearchNothing = (tab.url.indexOf("q=&"));
			messageType = (iIniPosSearch > -1 ? "onSearchGoogle" : "");
			
			//- Si no hay palabras a buscar...
			if (iIniPosSearch === iIniPosSearchNothing)
				messageType = "onGoogle";
				//return;
			
			if (messageType == "onSearchGoogle") {
				vSearch = "";
				vPosition = tab.url.indexOf("q=");
				vPositionLast = tab.url.indexOf("&", vPosition);
				
				if (vPosition + 2 < vPositionLast) {
					vSearch = tab.url.slice(vPosition+2,vPositionLast);
				}			
			}
		}
		else {
			messageType = ( tab.openerTabId === undefined  ? "onClick" : "onClickNewTab");
			vSearch = "";
		}
		
		var oMessage = {
			messageType	: messageType,
			search			: vSearch,
			id					: -1,
			site				: host,
			hostName		: hostName,
			pathName 		: pathName
		}
		
		/*
			if (vDebug.normal) {
				if (vDebug.tabs_onUpdated) {
					console.log("Tab [object]----");
					console.log(tab); 
				}
			}
		*/
		fnSaveLink(oMessage, tab);
	});
	chrome.tabs.onRemoved.addListener(function (iTabId, oRemoveInfo) {
		if (vDebug.normal) { log("[ Event :: chrome.tabs.onRemoved ]"); }
		global.fnDelItemSearch(iTabId);
	});
	// -- BrowserAction -------------------------------------------------
	chrome.browserAction.onClicked.addListener(function (tab) {			
		function focusOrCreateTab(url) {
			chrome.windows.getAll({"populate":true}, function(windows) {
				var existing_tab = null;
				for (var i in windows) {
					var tabs = windows[i].tabs;
					for (var j in tabs) {
						var tab = tabs[j];
						if (tab.url == url) {
							existing_tab = tab;
							break;
						}
					}
				}
				if (existing_tab) {
					chrome.tabs.update(existing_tab.id, {"selected":true});
				} else {
					chrome.tabs.create({"url":url, "selected":true});
				}
			});
		}
		
		var manager_url = vConfig.mySite;
		focusOrCreateTab(manager_url);
	});
	// -- Runtime -------------------------------------------------------
	chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
		vDebug.onMessageExternal = false;
		log("[Event :: chrome.runtime.onMessageExternal ]");
		if (vDebug.onMessageExternal) {
			console.log("object request -----------------------------------");
			console.log(request); 
			console.log("object sender -----------------------------------")
			console.log(sender);
		}

		function fnGetStorage() {
			chrome.storage.local.get(
				function (items) {
					localStorage["historyAll"] = JSON.stringify(items);
				}
			);
		}
		
		if (request.method == "getLocalStorage") {
			fnGetStorage();
			var objectString = localStorage["historyAll"];
			///if (vDebug.object) { console.log(objectString); }
			sendResponse({data: objectString});
		}
		else if (request.method == "getFavorites") {
			var objectString = localStorage["bookmarks"];
			sendResponse({data: objectString});
		}
		else if (request.method == "reloadInfo") {
			fnGetBookmarks();
			///var objectString = localStorage["bookmarks"];
			///sendResponse({data: objectString});
			
			sendResponse({});
		}
		else if (request.method == "setLocalStorage"){
			fnSetLocalStorage(request.oHistory);
		}
		else {
			sendResponse({}); // snub them.
		}
	});
