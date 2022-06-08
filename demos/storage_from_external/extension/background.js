String.prototype.hashCode = function(){
    var hash = 0;
    if (this.length == 0) return hash;
    for (i = 0; i < this.length; i++) {
        char = this.charCodeAt(i);
        hash = ((hash<<5)-hash)+char;
        hash = hash & hash; 
    }
    return hash;
}

var L64B=
{
    curlang: "en",
    fShowOnce:true,    
	vars:{}, 
 
	GetLang: function () {
	    L64B.curlang = localStorage.getItem("curlang");
	    if (!L64B.curlang) {
	        var lang = chrome.i18n.getMessage("language");
	        if (lang.indexOf("de") >= 0)
	            L64B.curlang = "de";
	        else
	            L64B.curlang = "en";
	    }
	    return L64B.curlang;
	},
	startpage:
	{
	    onMessageYT:function(details, sender, callback)
	    {
	        if (details.msg != "msgAddLinks") {
	            return; 
	        }
	        if (details.link[0]) {
	            details.link[0].noDL = true;
	        }
	        L64B.startpage.onMessage(details, sender, callback)
	    }, 
		onMessage:function(details, sender, callback)
		{
			if (details.type == "__L64_SHOW_CHROME_SETTINGS")
			{
				//if (details.where == "newTab")
					chrome.tabs.create({"url":"chrome://settings","selected":true}, function(tab){});
					
				/// add more if we need!

			}
			else if (details.type == "__L64_NAVIGATE_CHROME_URL")
			{
				if (details.where == "newTab")
					chrome.tabs.create({"url":details.url, "selected":true}, function(tab){});
				else
					chrome.tabs.update(null, {"url":details.url, "selected":true}, function(tab){});
			}
			
			if (details.msg=="OnSP24GetVideoUrls")
			{
			    callback( {videoUrls:vdl.urllist[details.tabId]});
			    return true;
                /*if ( callback)
                {
                    chrome.tabs.get(details.tabId, function(tab)
                    {
                        var sendFoundVidosToPopup = function(list)
	                    {
	                        var de = {	};
        		            de.msg="__L64_NEW_VIDEOLIST"; 
        		            de.videoUrls = list.videoUrls; 
		                    chrome.runtime.sendMessage(de, function(response) {
				               // console.log(response);
    	                        return true;
                            });
	                    }
                        if ( tab && tab.url.indexOf( "yahoo.com") >=0)
	                    {
	                        if ( localStorage.getItem("L64_enableFeatures"))
	                        {
	                            L64B.video.scanYahoo( tab, sendFoundVidosToPopup);
	                            return true;
	                        }
	                    }
	                    else if ( tab && tab.url.indexOf( "dailymotion.com") >=0)
	                    {
	                        if ( localStorage.getItem("L64_enableFeatures"))
	                        {
	                            L64B.video.scanDailyMotion( details.tabId, tab.url, sendFoundVidosToPopup);
	                            return true;
                            }
	                    }	
	                                  
                        callback( {videoUrls:vdl.urllist[details.tabId]});
                    });
                    return true;
                }*/
                
			}
			
			else if (details.msg=="IsAdDisabled")
            {                
                callback(localStorage.getItem("IsAdDisabled")=="true");
                return true;
            }
			else if (details.msg=="OnDownloadVideo")
            {
                chrome.tabs.getSelected(undefined, function(tab) 
                {
                    vdl.downloadlist[details.url]=details.filename;
                    var oldurl = tab.url;
                    vdl.parentUrls[details.url] = tab.url;
                    
                    /*if ( chrome.downloads && chrome.downloads.download)
                    {
                        myDownload( details);
                    }
                    else*/
                    {
                        if( tab.url.indexOf( "startpage/index.html?page=video") >=0)
                            chrome.tabs.create( {"url":details.url, "selected":false}, function(tab){});
                        else
                            chrome.tabs.update( tab.id, {"url":details.url, "selected":false}, function(tab){});
                    }
                    chrome.storage.local.get('video_downloads', function(data)
                    {
                        var count = parseInt(data["video_downloads"]);
                        if ( !count)
                            count = 0;
                        count++;
                        chrome.storage.local.set({'video_downloads':count}, function(){});
                        if ( count == 10)
                        {
                            if ( L64B.GetLang() == "de")
                                var t = "Sollte Ihnen der Video Downloader professional gefallen, teilen Sie Ihre Erfahrungen anderen Benutzern mit und geben Sie eine Bewertung für uns ab.";
                            else
                                var t = "You have downloaded multiple videos with Video Downloader professional. Please share your experience with others and make a review for us.";
                            if ( confirm(t))
                                chrome.tabs.create({"url":"https://chrome.google.com/webstore/detail/video-downloader-professi/elicpjhcidhpjomhibiffojpinpmmpil/reviews","selected":true}, function(tab){});
                            
                        }
                    });
                });
                return;
			}
			
			else if (details.msg=="OnYoutubeWarning")
            {
                chrome.tabs.getSelected(undefined, function(tab) 
                {
                    if ( L64B.fShowOnce || !details.fOnce)
                    {
                        L64B.fShowOnce=false;
                        chrome.tabs.create({"url": "https://videodownloaderultimate.com/?p=professional","selected":true}, function(tab){});
                    }
                });
            }
			else if (details.msg=="OnSP24Navigate")
            {
                chrome.tabs.getSelected(undefined, function(tab) 
                {
                    chrome.tabs.update({"url": details.url, "active": true}, function(tab){});
                });
            }
            else if (details.msg=="msgSetUrl")
            {
                callback( {tabId:sender.tab.id});
            }
            else if (details.msg=="msgAddLinks")
            {
                var a = details.link;
                for ( i in a)
                {
                    if ( !details.tabId)
                        details.tabId = sender.tab.id;
                    if ( !vdl.urllist[details.tabId])
                        vdl.urllist[details.tabId] = [];
                    var mime = "video/mp4";
                    if ( a[i].url.indexOf(".mov") != -1)
                        mime = "video/mov";
                    else if ( a[i].url.indexOf(".flv") != -1)
                        mime = "video/flv";
                    var found = false;
                    for ( var j = 0; j < vdl.urllist[details.tabId].length; j++)
                    {
                        if ( vdl.urllist[details.tabId][j].url == a[i].url)
                        {
                            found = true;
                            break;
                        }
                    }
                   // console.log( a[i]);
                    //alert(details.tabId+"   "+a[i].url);
                    if ( !found)                        
                        vdl.urllist[details.tabId].splice(0, 0, { url: a[i].url, mime: mime, title: a[i].title, noDL: a[i].noDL });
                }
            }
            else if (details.msg=="OnPlayVideo")
            {
                chrome.tabs.getSelected(undefined, function(tab) 
                {
                    var u = "https://videodownloaderultimate.com/chromecast/?url="+details.url;
                    chrome.tabs.create({"url": u,"selected":true}, function(tab){});
                });
            }
            else if (details.msg=="OnSP24Options")
            {
                chrome.tabs.getSelected(undefined, function(tab) 
                {
                    var url = window.location.href;
                    url = url.replace("extension/background.html","startpage/index.html?options=1");
                    //alert(url);
                    //chrome-extension://mlhmlmnkpgbbhkfngfbfhjnodaojojgm/startpage/index.html?options=1
                    chrome.tabs.create({"url":url,"selected":true}, function(tab){});
                });
            }
            else if (details.msg=="OnSP24AddVideo")// Add and Play
            {                
               
                var videoid = L64B.video.saveInfos(details.url, details.info, !details.play);
                if (details.play) {
                    L64B.video.playVideo(videoid, 0); 
                }

                   //L64B.video.getInfos(url, details.msg=="OnSP24AddVideo2" ? details.tabId : false); 
                   
            }
            
            else if (details.msg=="OnSP24AddToplink")
            {
                 chrome.tabs.get(details.tabId, function(tab){
                        var url = vdl.parentUrls[tab.url];
                        if ( !url)
                            url = tab.url;
                        var details = {	};
			            details.msg="__L64_ON_NEW_TOPLINK"; 
			            details.url = url; 
			            details.title = tab.title;
			            details.id = L64B.utils.crc32(url); 
			            //console.log(details);
			            
			            chrome.storage.sync.get('newToplinks', function(data)
		                {
			                var sitems = data['newToplinks'];
			                var aItems =false;
			                if ((sitems == null)||(typeof(sitems)== 'undefined'))
				                aItems = new Array();
			                else
				                aItems = sitems;
			                if( Object.prototype.toString.call( aItems ) !== '[object Array]' ) {
    				                aItems = new Array();
			                }
			                //aItems.splice(0, 0, details.url);
			                aItems.push(details.title+"<->"+details.url);
			                chrome.storage.sync.set({newToplinks: aItems}, function(){}); 
			                 
                            if ( L64B.GetLang() == "de")
                                alert( "Seite wurde hinzugefügt");
                            else
                                alert( "Page has been added");
	                    
		                }); 
    			            
			            chrome.runtime.sendMessage(details, function (response) { });
				    
                    });
            }
            else if (details.msg=="OnSP24SetLang")
            {
                L64B.curlang = details.lang;
                localStorage.setItem("curlang", L64B.curlang);
                chrome.tabs.query({ active: true }, function (tab) {
                    L64B.video.onUpdateTab(tab.id, null, tab);
                });
            }
            else if (details.msg=="OnSP24PlayVideo")
            {
                chrome.tabs.getSelected(undefined, function(tab) 
                {
                    vdl.urllist[tab.id] = false;
                    if ( !vdl.urlPlaying)
                        vdl.urlPlaying = new Object();
                        
                    vdl.urlPlaying[tab.id] = new Object();
                    vdl.urlPlaying[tab.id].url = details.url;
                    vdl.urlPlaying[tab.id].title = details.title;
                    L64B.video.onUpdateTab(tab.id, null, tab);
                });  
            }
            
		}
	},
	request:
	{
		lshorthistory: new Object(), 
		/*onBeforeRequest:function(details)
	    {
	       // console.log("Request:" + details.url +" : "+ details.type);
	        //sph.request.injectList[details.requestId] = false;
			if (typeof(details.url)!= 'string')
				return;  
			if ((details.url.split("/").length >4)
					|| (details.url.split("?").length > 1))
				return; 
			var hash = "URL_"+ details.url; 
			var l = L64B.request.lshorthistory;
			if (typeof(l[hash])=='undefined')/// new URL
			{
				l[hash] = new Object(); 
				l[hash].details = details;
				l[hash].count =0; 	
				l[hash].submited =false;	
			}
			l[hash].count+=1;
			if (l[hash].count==2)
				var x=1;
			console.log("New URL : "+ details.url);
			console.log( l); 
										
		},*/
	}
}


chrome.runtime.onMessage.addListener(L64B.startpage.onMessage);
chrome.runtime.onMessageExternal.addListener(L64B.startpage.onMessageYT); 
 
chrome.storage.local.get('fu', function(data)
{
	var firstLaunch = data['fu'];
	chrome.storage.local.set({'fu':true}, function(){});
	
	//if ((firstLaunch == null)||(typeof(firstLaunch)== 'undefined'))
	//	chrome.tabs.create({"url":"chrome://newtab?firstLaunch=1","selected":true}, function(tab){});
}); 

function SetVideoIcon( tabid, fVideo)
{
    chrome.browserAction.setIcon({tabId: tabid, path: (fVideo?"../icon19b.png":"../icon19c.png")});
}

/*function myDownload( details)
{
    var options = { url:details.url, filename:details.filename, saveAs:true};    
    chrome.downloads.download(options, function(downloadId)
    {
    });
}*/