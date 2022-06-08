/////////////////////////////////////////////////////////////////
///
///		Global L64P object
///
/////////////



var L64P=
{
	vars:{},
	util:
	{
		_generateGUID:function()
		{
			'xxxxxxxx0xxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) 
			{
    			var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    			return v.toString(16);
			});
		},
    	_crctable: "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D",     
	    _crc32: function(str, crc ) 
		{ 
	        if( crc == window.undefined ) crc = 0; 
	        var n = 0;
	        var x = 0;
	        crc = crc ^ (-1); 
	        for( var i = 0, iTop = str.length; i < iTop; i++ ) { 
	            n = ( crc ^ str.charCodeAt( i ) ) & 0xFF; 
	            x = "0x" + L64P.util._crctable.substr( n * 9, 8 ); 
	            crc = ( crc >>> 8 ) ^ x; 
	        } 
	        return crc ^ (-1); 
	    } 	

	},
	
	video:
	{
		saveItems:function(details)
		{
			L64P._db.set({id:'video_items', data:JSON.stringify(details.id), type:'sync'}); 
			return; 
		}, 
		getWatchedItems:function(details, callback)
		{
			/// get te cache first
			var cacheItems = false; 
			var sCacheItems = L64P._db._locStorage.getItem("video_cacheItems"); 
			if ((sCacheItems == null)||(typeof(sCacheItems)=='undefined'))
				cacheItems = new Array();
			else 
				cacheItems = JSON.parse(sCacheItems);
				
			L64P._db.get({id:'video_items', type:'sync'}, function(data)
			{
			    var sitems = data; 
			    if ((sitems == null)||(typeof(sitems)=='undefined'))
				    items = new Array();
			    else 
				    items = JSON.parse(sitems);
				var aValues = [];
			    var objs = new Object();
			    for (var i =0; i<items.length; i++)
				{
					if(items[i]!= null)
					{
					    var crc = L64P.util._crc32(items[i]); // Don't show duplicates
					    if ( objs[crc])
					        continue;
					    objs[crc]=true;
						aValues.push("video_item_"+crc); 
					}
				}
				L64P._db.getMulti({ids: aValues}, function (data)
				{
					var retval = [];
					if ((data !== false))
					{
						//for(var propertyName in data) 
						//	retval.push(data[propertyName]); 
                        for(var j in aValues)  // Keep the same order like aValues ( not the database order)
                        {
                            var s = data[aValues[j]];
                            if ( s)
                            {
							    retval.push( s);  // Check+++
                            }
						}						
					}
					L64P._db._locStorage.setItem("video_cacheItems", JSON.stringify(retval));
					if (typeof(callback)== "function")
						callback({items:retval});
				});
			});
		}
	},
	browser:
	{	
		showSettings:function(details){return false;},
		navigateChromeURL:function(details){window.location.replace( details.url);return false;}
	},
	events:
	{
		onTopLinkChanged:function(details){},
		onTopNewSearchURL:function(details){},
		onNewVideo:function(details){},
	},
	settings:
	{
		set:function(details)
		{
			details.id = 'settings_'+details.id;
			
			if (typeof(details.data.sync) != 'undefined')
			{
				L64P._db.doSync=details.data.sync; 
				L64P._db.set({type:'loc', id: 'dbsync', data: details.data.sync });
				L64P._db.setSync(); 
			}
				
			
			if (typeof(details.data) == 'object')
				details.data = "L64O_"+ JSON.stringify(details.data);
			return L64P._db.set(details);
		}, 
		get:function(details, callback)
		{
			var info = {call: callback};
			L64P._db.get({id:'settings_'+details.id},function(data)
			{
				if (typeof(data)=='string')
				{
					if (data.indexOf("L64O_")==0)
						data = JSON.parse(data.slice(5)); 
				}
				if (typeof(callback)== 'function')
					callback(data); 
			}); 
		},
	},
	toplinks:
	{
		_retree:function(data, all)
		{
			if (data == null)
				return data; 
			for (var i = 0; i < data.length; i++)
			{
				var toplinks = false;
				if (typeof(data[i].Toplinks) != 'undefined')
				{
					toplinks = L64P.toplinks._retree(data[i].Toplinks, all);
				}
				if (typeof(all["tls_id_" + data[i].huId])!= 'undefined')
				{
					var id = "tls_id_" + data[i].huId; 
					var tl = JSON.parse(all[id]);
					data[i] = tl;
					//data[i].id = control.sId++	
					if(toplinks)
					 data[i].Toplinks =toplinks;
					if (all.nextID< data[i].id)
						all.nextID =  data[i].id;
				}
				else
					console.log("no Item!");
			}
			return data;
		},
	
		_untree:function(data, details)
		{
			var treeRoot = new Array(); 
			var arr = data;
			
			for (var i = 0; i < arr.length; i++)
			{
				var obj = arr[i];
				var objTree = new Object(); 
				var objNew = new Object(); 
				///// check functions
				if (obj.id> details.sId)
					details.sId = obj.id; 
				obj.huId = details.shuId++; 
				objTree.huId = obj.huId;
				/// linear list; 
				
				details.items.push(objNew); 
				for(var propertyName in obj) 
				{
					if (propertyName == 'Toplinks')
					{
						//alert("toplinks");
					    objTree[propertyName] = L64P.toplinks._untree(obj[propertyName], details);
					    //delete obj[propertyName];
					}
					else
						objNew[propertyName] = obj[propertyName]; 
					

				}
				treeRoot.push(objTree);
			}
			
			
			return treeRoot; 
		},
		getLocal:function(details, callback)
		{
			//alert("Pause");
			L64P._db.get({id:'tls_count'},function(data)
			{
			    if (typeof(data) == 'undefined')
				{
					if (typeof(callback)== 'function')
					{
						//alert("false");
						callback({toplinks:false, nextid:1});
					}	 
					return;  
				}
				
			    var geti = new Array("tls_tree", "tls_count", "tls_next"); 
			    for (var x=0; x < data; x++)
				    geti.push("tls_id_" + x);
				L64P._db.getMulti({ids: geti}, function (data)
				{
					
					if ((data !== false)&& (data !== null))
					{
						data.nextID =0; 
						var tree = JSON.parse(data["tls_tree"]);
				    	var tlj = L64P.toplinks._retree(tree, data); 
						if (typeof(callback)== 'function')
						callback({toplinks:tlj, nextid:data.nextID*1+1}); 
					}
					else if (typeof(callback)== 'function')
						callback({toplinks:false, nextid:1}); 
					
					  
				});    
			}); 
			
		},
		setLocal:function(details)
		{
			if (!details.type)
				details.type = 'user'; 
			if (!details.data)
				return false; 
			if (typeof(details.data) !== 'object')
				return false; 
			//alert("set");
			var tlj = JSON.stringify(details.data);
			
			
			details.sId =1; 
			details.shuId =0;
			details.items = new Array(); 
			//details.tree = new Array(); 
			details.tree = L64P.toplinks._untree(details.data,  details);
			
			//L64P._db.set({id:'tls_json', data:tlj, type:'user' }); 
			
			var set = {
				data: {
					"tls_tree": JSON.stringify(details.tree),
					"tls_count":details.items.length,
					"tls_next":details.sId*1 +1				}  
			};
			//alert(details.items.length);
			for (x=0; x < details.items.length; x++)
			{
				set.data["tls_id_" + details.items[x].huId] =  JSON.stringify(details.items[x]);
			}

			L64P._db.setMulti(set); 
			
			if (details.type == 'user')/// increment userwatch
			{
				L64P._db.get({id:'tls_watchuser'}, function(data)
				{
					var cn = data*1+1;
					L64P._db.set({id:'tls_watchuser', data:cn});  
					L64P._db._curUserWatch = cn; 
				});
				
			}
		},
	},
	_db:
	{
		_curUserWatch:0,
		_bindList: new Array(), 
		_locStorage : false, 
		setSync:function(){}, 
		setStorage:function()
		{
			L64P._db._locStorage = localStorage; 
		},
		addListener:function(details)
		{
			L64P._db._bindList.push({key: details.key, callback: details.callback }); 
		},
		bindStorageChanges:function()
		{
			window.addEventListener("storage", L64P._db._onLocalStorageStorageChange, true);
		}, 
		setMulti:function(details)
		{
			//for details.data
			var obj = details.data; 
			if (typeof(obj)!= 'object')
				return false; 
			
			for(var propertyName in obj) 
			{
				L64P._db._locStorage.setItem(propertyName, obj[propertyName]);	
			}
		},
		getMulti:function(details, callback)
		{
			var ids = details.ids; 
			var data ={}; 
			for (var i =0; i< ids.length; i++)
			{
				data[ids[i]] = L64P._db._locStorage.getItem(ids[i]); 
			}
			setTimeout(function(){callback(data)}, 0);
			
		},
		_onLocalStorageStorageChange:function(event)
		{
			
		},
		onStorageChanged:function(details)
		{
			
		},
		set:function(details)
		{
			//return content.localStorage.wrappedJSObject.setItem(details.id, details.data);
			try
			{
				return L64P._db._locStorage.setItem(details.id, details.data);
			}
			catch(err){
			}
			return null; 
			
		}, 
		get:function(details, callback)
		{
			var data = L64P._db._locStorage.getItem(details.id);
			if (typeof(callback) == 'function')
				setTimeout(function(){callback(data)}, 0);
				//callback(data);
		},
		initWatch:function()
		{
			L64P._db.setStorage(); 
			L64P._db.bindStorageChanges();			
			L64P._db.get({id:'tls_watchuser'},function(data)
			{
				cn = data; 
				if (cn == null)
				{
					cn = 1;
					L64P._db.set({id:'tls_watchuser', data:cn}); 
				}
				L64P._db._curUserWatch = cn; 
				setTimeout(function(){L64P._db.checkWatch();}, 2000); 
			}); 
			
		}, 
		checkWatch:function()
		{
			setTimeout(function(){L64P._db.checkWatch();}, 2000);
			L64P._db.get({id:'tls_watchuser'}, function(data)
			{
				var cn = data;
				if (L64P._db._curUserWatch == cn)
					return; 
				L64P._db._curUserWatch = cn; 
				L64P.events.onTopLinkChanged({type:'user'});
			}); 
			 
			 
		} 
	},
	
	
};






/////////////////////////////////////////////////////////////////
///
///		Helper objects
///
/////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////
///
///		Google search API 
///

function L64GSearch() {
  this.details = false;
  this.filter = new Array({key:'RESTRICT_IMAGETYPE', val:'IMAGETYPE_PHOTO'}, {key:'RESTRICT_IMAGESIZE', val:'IMAGESIZE_LARGE'})
  this.callback = false; 
  this.searcher = false; 
  this.results = new Array(); 
}

L64GSearch.prototype._ecexuteQuery = function(pself)
{
	this.searcher = new google.search.ImageSearch();
	this.searcher.setRestriction(
  		google.search.ImageSearch.RESTRICT_IMAGETYPE,
  		google.search.ImageSearch.IMAGETYPE_PHOTO
	);
	this.searcher.setRestriction(
  		google.search.ImageSearch.RESTRICT_SAFESEARCH,
  		google.search.ImageSearch.SAFESEARCH_MODERATE
	);
	
	
	
	this.searcher.setRestriction(
  		google.search.ImageSearch.RESTRICT_IMAGESIZE,
 	 	google.search.ImageSearch.IMAGESIZE_LARGE
	);
	this.searcher.setSearchCompleteCallback(this, this._onGoogleComplete);
	//this.searcher.setSearchCompleteCallback(this, function() {
	//	var x = this; 	} );
	this.searcher.setResultSetSize(this.details.numPP);
	this.searcher.execute(this.details.query); 
};


L64GSearch.prototype._onGoogleComplete = function()
{
	var bExit =false; 
	if (typeof(this.searcher.results) !='undefined')
	{
		
		this.results = this.results.concat(this.searcher.results); 
	}
	else
		bExit = true;
	
	if (!this.searcher.cursor)
		bExit = true;
	
	if (this.results.length>= this.details.num)
		bExit = true; 
	
	if (bExit)	
	{
		for(i=0; i<this.results.length; i++)
		{
			var ti = this.results[i].html = false; 
		}
		try
  		{
  			L64P._db._locStorage.setItem("TEMP_GISearch", JSON.stringify(this.results));
  		}
		catch(err){}
		
		if (typeof(this.callback) =='function')
			this.callback({result:this.results}); 
	}
	else
		this.searcher.gotoPage(this.searcher.cursor.currentPageIndex+1);
	 
};

L64GSearch.prototype.getImages = function(details, callback)
{
	
	if (typeof(details.query)== 'undefined')	
		details.query = "Missing"; 
		
	if (typeof(details.num)== 'undefined')	
		details.num = 8;
	details.numPP = details.num;
	if (details.num > 8)
		details.numPP = 8; 
	if (typeof(google)!='object')
  		return false; 
	var now = new Date(); 
	var lastCache = L64P._db._locStorage.getItem("TEMP_GISearchID");
	try{
		L64P._db._locStorage.setItem("TEMP_GISearchID" , details.num + "_"+ details.query+ "_" +  now.getHours());  
	}catch(err){} 
	
	if (lastCache == details.num + "_"+ details.query+ "_" +  now.getHours())
	{
		var cache = L64P._db._locStorage.getItem("TEMP_GISearch");	
		if ((cache != null) && (cache != "[]") && (!details.noCache))
		{	
			setTimeout(function(){callback({result:JSON.parse(cache)})}, 0); 
			return true; 
		}
	} 
		
	
	L64P.vars.firstGSearch = true; 	
		
	this.callback = callback; 
  	this.details = details;	
	this.details.inst = Math.floor((Math.random()*10000)+1);	
	
 	if (typeof(google.search)== 'undefined')
	{
		var dol = {
			othis: this
		}
		google.load('search', 1,{"language" : "de", callback:function() {
			var p = dol.othis; 
			p._ecexuteQuery()} });
		
	}
	else
		this._ecexuteQuery();
   
};
 
/////////////////////////////////////////////////////////////////
///
///		chrome extension com code
///
/////////////////////////////////////////////////////////////////

if (typeof(chrome)=='object')
{
	if (typeof(chrome.storage)=='object')
	{

		L64P._db.doSync=true; 
		L64P._db.storage = chrome.storage.sync;
		L64P._db.backup = chrome.storage.local;
		L64P._db.sync = chrome.storage.sync;
		
		
		L64P._db.bindStorageChanges = function()
		{
			chrome.storage.onChanged.addListener(function(changes, areaName) 
			{
				for (var i =0; i<L64P._db._bindList.length; i++)
				{
					if (typeof (changes[L64P._db._bindList[i].key])!= 'undefined')
					{
						var call = L64P._db._bindList[i].callback; 
						var parm ={key: L64P._db._bindList[i].key, val: changes[L64P._db._bindList[i].key].newValue}; 
						setTimeout(function(){call(parm)},0); 
					}
						
				}
			});
		}
		
		
		L64P._db.setSync= function()
		{
			L64P._db.get({type:'loc', id: 'dbsync' }, function(data)
			{
				var sync = (typeof(data)!= 'undefined')?data:true; 
				if (sync)
				{
					L64P._db.doSync=true; 
					L64P._db.storage = chrome.storage.sync;
				}
				else
				{
					L64P._db.doSync=false; 
					L64P._db.storage = chrome.storage.local;
				}
					
			});
		}      
		
		L64P._db.set = function(details)
		{
			var data = new Object(); 
			data[details.id] = details.data; 
			
			var storage = L64P._db.storage; 
			if (details.type == "loc")
				storage = L64P._db.backup;
			else if (details.type == "sync")
				storage = L64P._db.sync;
			
			L64P._db.storage.set(data,function(){});
			if (L64P._db.doSync)
				L64P._db.backup.set(data,function(){});
				
			L64P._db.storage.getBytesInUse(null, function(data){
				//console.log("Bytes used:"  + data ); 
			});
		};
		L64P._db.get = function(details, callback)
		{
			var storage = L64P._db.storage; 
			if (details.type == "loc")
				storage = L64P._db.backup;
			else if (details.type == "sync")
				storage = L64P._db.sync;
		
			storage.get(details.id, function(data)
			{
				callback(data[details.id]); 
			});
			
		};
		L64P._db.setMulti = function(details)
		{
			L64P._db.storage.set(details.data,function(){});	
			if (L64P._db.sync)
				L64P._db.backup.set(details.data,function(){});	
		};
		L64P._db.getMulti = function(details, callback)
		{
			L64P._db.storage.get(details.ids, function(data)
			{
				callback(data); 
			});
		};
		
		L64P._db.setSync();
		
		
	}
	if (typeof(chrome.extension)=='object')
	{
		L64P.browser=
		{
			init:function()
			{
			
	    	},
			onMessage:function(details, sender)
			{
				if (details.msg=="OnNewTL")
	    			L64P.events.onTopLinkChanged({type:'system'}); 
				if (details.msg=="__L64_ON_NEW_VIDEO")
				{
					L64P.events.onNewVideo({info:details.videoInfo });
				}
				else if (details.msg=="__L64_ON_NEW_TOPLINK")
				{
					//alert("angekommen:"+details.url);
					fr.addNewToplinksFromList();
					//L64P.events.onNewVideo({info:details.videoInfo });
				}
	    			 
			},
			showSettings:function(details)
			{
				details.type = "__L64_SHOW_CHROME_SETTINGS"; 
				chrome.runtime.sendMessage(details, function (response) {
  					//console.log(response);
				});
			},
			navigateChromeURL:function(details)
			{
			    details.type = "__L64_NAVIGATE_CHROME_URL";
			    chrome.runtime.sendMessage(details, function (response) {
				    //console.log(response);
			    });
			}
		}
		////////////////// subscribe to the chrome messages	
		chrome.runtime.onMessage.addListener(L64P.browser.onMessage);
	}
	
}
 
 



//////////////
///
///


L64P._db.initWatch(); 
/// DB Version 
/*var dbVer = L64P._db._locStorage.getItem("sp24_dbVer"); 
if ((typeof(dbVer)=='undefined')||(dbVer < 8))
{
	L64P._db._locStorage.clear();
	L64P._db._locStorage.setItem("sp24_dbVer",8); 
}*/
	



///////////////////////////////////
///
///	md5
///
///



function md5cycle(x, k) {
var a = x[0], b = x[1], c = x[2], d = x[3];

a = ff(a, b, c, d, k[0], 7, -680876936);
d = ff(d, a, b, c, k[1], 12, -389564586);
c = ff(c, d, a, b, k[2], 17,  606105819);
b = ff(b, c, d, a, k[3], 22, -1044525330);
a = ff(a, b, c, d, k[4], 7, -176418897);
d = ff(d, a, b, c, k[5], 12,  1200080426);
c = ff(c, d, a, b, k[6], 17, -1473231341);
b = ff(b, c, d, a, k[7], 22, -45705983);
a = ff(a, b, c, d, k[8], 7,  1770035416);
d = ff(d, a, b, c, k[9], 12, -1958414417);
c = ff(c, d, a, b, k[10], 17, -42063);
b = ff(b, c, d, a, k[11], 22, -1990404162);
a = ff(a, b, c, d, k[12], 7,  1804603682);
d = ff(d, a, b, c, k[13], 12, -40341101);
c = ff(c, d, a, b, k[14], 17, -1502002290);
b = ff(b, c, d, a, k[15], 22,  1236535329);

a = gg(a, b, c, d, k[1], 5, -165796510);
d = gg(d, a, b, c, k[6], 9, -1069501632);
c = gg(c, d, a, b, k[11], 14,  643717713);
b = gg(b, c, d, a, k[0], 20, -373897302);
a = gg(a, b, c, d, k[5], 5, -701558691);
d = gg(d, a, b, c, k[10], 9,  38016083);
c = gg(c, d, a, b, k[15], 14, -660478335);
b = gg(b, c, d, a, k[4], 20, -405537848);
a = gg(a, b, c, d, k[9], 5,  568446438);
d = gg(d, a, b, c, k[14], 9, -1019803690);
c = gg(c, d, a, b, k[3], 14, -187363961);
b = gg(b, c, d, a, k[8], 20,  1163531501);
a = gg(a, b, c, d, k[13], 5, -1444681467);
d = gg(d, a, b, c, k[2], 9, -51403784);
c = gg(c, d, a, b, k[7], 14,  1735328473);
b = gg(b, c, d, a, k[12], 20, -1926607734);

a = hh(a, b, c, d, k[5], 4, -378558);
d = hh(d, a, b, c, k[8], 11, -2022574463);
c = hh(c, d, a, b, k[11], 16,  1839030562);
b = hh(b, c, d, a, k[14], 23, -35309556);
a = hh(a, b, c, d, k[1], 4, -1530992060);
d = hh(d, a, b, c, k[4], 11,  1272893353);
c = hh(c, d, a, b, k[7], 16, -155497632);
b = hh(b, c, d, a, k[10], 23, -1094730640);
a = hh(a, b, c, d, k[13], 4,  681279174);
d = hh(d, a, b, c, k[0], 11, -358537222);
c = hh(c, d, a, b, k[3], 16, -722521979);
b = hh(b, c, d, a, k[6], 23,  76029189);
a = hh(a, b, c, d, k[9], 4, -640364487);
d = hh(d, a, b, c, k[12], 11, -421815835);
c = hh(c, d, a, b, k[15], 16,  530742520);
b = hh(b, c, d, a, k[2], 23, -995338651);

a = ii(a, b, c, d, k[0], 6, -198630844);
d = ii(d, a, b, c, k[7], 10,  1126891415);
c = ii(c, d, a, b, k[14], 15, -1416354905);
b = ii(b, c, d, a, k[5], 21, -57434055);
a = ii(a, b, c, d, k[12], 6,  1700485571);
d = ii(d, a, b, c, k[3], 10, -1894986606);
c = ii(c, d, a, b, k[10], 15, -1051523);
b = ii(b, c, d, a, k[1], 21, -2054922799);
a = ii(a, b, c, d, k[8], 6,  1873313359);
d = ii(d, a, b, c, k[15], 10, -30611744);
c = ii(c, d, a, b, k[6], 15, -1560198380);
b = ii(b, c, d, a, k[13], 21,  1309151649);
a = ii(a, b, c, d, k[4], 6, -145523070);
d = ii(d, a, b, c, k[11], 10, -1120210379);
c = ii(c, d, a, b, k[2], 15,  718787259);
b = ii(b, c, d, a, k[9], 21, -343485551);

x[0] = add32(a, x[0]);
x[1] = add32(b, x[1]);
x[2] = add32(c, x[2]);
x[3] = add32(d, x[3]);

}

function cmn(q, a, b, x, s, t) {
a = add32(add32(a, q), add32(x, t));
return add32((a << s) | (a >>> (32 - s)), b);
}

function ff(a, b, c, d, x, s, t) {
return cmn((b & c) | ((~b) & d), a, b, x, s, t);
}

function gg(a, b, c, d, x, s, t) {
return cmn((b & d) | (c & (~d)), a, b, x, s, t);
}

function hh(a, b, c, d, x, s, t) {
return cmn(b ^ c ^ d, a, b, x, s, t);
}

function ii(a, b, c, d, x, s, t) {
return cmn(c ^ (b | (~d)), a, b, x, s, t);
}

function md51(s) {
txt = '';
var n = s.length,
state = [1732584193, -271733879, -1732584194, 271733878], i;
for (i=64; i<=s.length; i+=64) {
md5cycle(state, md5blk(s.substring(i-64, i)));
}
s = s.substring(i-64);
var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0];
for (i=0; i<s.length; i++)
tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
tail[i>>2] |= 0x80 << ((i%4) << 3);
if (i > 55) {
md5cycle(state, tail);
for (i=0; i<16; i++) tail[i] = 0;
}
tail[14] = n*8;
md5cycle(state, tail);
return state;
}

/* there needs to be support for Unicode here,
 * unless we pretend that we can redefine the MD-5
 * algorithm for multi-byte characters (perhaps
 * by adding every four 16-bit characters and
 * shortening the sum to 32 bits). Otherwise
 * I suggest performing MD-5 as if every character
 * was two bytes--e.g., 0040 0025 = @%--but then
 * how will an ordinary MD-5 sum be matched?
 * There is no way to standardize text to something
 * like UTF-8 before transformation; speed cost is
 * utterly prohibitive. The JavaScript standard
 * itself needs to look at this: it should start
 * providing access to strings as preformed UTF-8
 * 8-bit unsigned value arrays.
 */
function md5blk(s) { /* I figured global was faster.   */
var md5blks = [], i; /* Andy King said do it this way. */
for (i=0; i<64; i+=4) {
md5blks[i>>2] = s.charCodeAt(i)
+ (s.charCodeAt(i+1) << 8)
+ (s.charCodeAt(i+2) << 16)
+ (s.charCodeAt(i+3) << 24);
}
return md5blks;
}

var hex_chr = '0123456789abcdef'.split('');

function rhex(n)
{
var s='', j=0;
for(; j<4; j++)
s += hex_chr[(n >> (j * 8 + 4)) & 0x0F]
+ hex_chr[(n >> (j * 8)) & 0x0F];
return s;
}

function hex(x) {
for (var i=0; i<x.length; i++)
x[i] = rhex(x[i]);
return x.join('');
}

function md5(s) {
return hex(md51(s));
}

function add32(a, b) {
return (a + b) & 0xFFFFFFFF;
}



function print_r(arr,level)
{
	var dumped_text = "";
	if(!level) level = 0;

	//The padding given at the beginning of the line.
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";

	if(typeof(arr) == 'object') 
	{ //Array/Hashes/Objects 
		for(var item in arr) 
		{
			var value = arr[item];	
			if(typeof(value) == 'object')
			{ //If it is an array,
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += print_r(value,level+1);
			} 
			else 
			{
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} 
	else 
	{ //Stings/Chars/Numbers etc.
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}