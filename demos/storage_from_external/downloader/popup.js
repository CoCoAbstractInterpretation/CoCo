 
function GetFileExtension( ob)
{
    var ext = ["flv","mp4","3g","wmv","mpg","m4p","m4v"];
    for ( var j = 0; j<ext.length;j++)
    {
        if ( ob.mime.indexOf( ext[j])>=0)
        {
            return ext[j];
        }
    }
    
    for ( var j = 0; j<ext.length;j++)
    {
        if ( ob.url & ob.url.toLowerCase().indexOf( ext[j])>=0)
        {
            return ext[j];
        }
    }
    return "flv";
}

function OnUltimate( ev)
{    
    chrome.runtime.sendMessage({msg: "OnYoutubeWarning",fOnce:false}, function(response) {});
}

function OnDownloadVideo( ev)
{
    var i = parseInt(ev.srcElement.id.slice(4));
    if ( i < videoUrls.length)
    {
        window.close();
        var s = getFilename(videoUrls[i]);
        //alert(s+"  -  "+videoUrls[i].url);
        chrome.runtime.sendMessage({ msg: "OnDownloadVideo", url: videoUrls[i].url, filename: s }, function (response)
        {
        });
    }
}

function OnPlayVideo( ev)
{
    var i = parseInt(ev.id.slice(7));
    if ( i < videoUrls.length)
    {
        window.close();
        var t = videoUrls[i].title;
        var u = videoUrls[i].url;

        var bp = chrome.extension.getBackgroundPage();
        bp.l64.castPlayer.playURI({ url: u, title: t});
    }
}

function OnSP24NavigateHome()
{
    var url = window.location.href;
    url = url.replace("downloader/popup.html","startpage/index.html");
    window.close();
    chrome.runtime.sendMessage({ msg: "OnSP24Navigate", url: url }, function (response)
    {
    });
}
 
function OnSP24NavigateAddToplink()
{
    window.close();
    chrome.runtime.sendMessage({ msg: "OnSP24AddToplink", tabId: curTabId }, function (response)
    {
    });    
}

function myEncodeURI(q)
{
    var b="";
    var d=0;
    while(d < q.length)
    {
        var e1 = q.charCodeAt(d);
        d++;
        if ( e1 >=48 && e1 <= 57)
            b+=String.fromCharCode(e1);
        else if ( e1 >=97 && e1 <= 122)
            b+=String.fromCharCode(e1);
        else if ( e1 >=65 && e1 <= 90)
            b+=String.fromCharCode(e1);
        else
        {
            b+='('+e1+')';
        }
    }
    return b;
}

function OnSP24NavigateSimilar()
{
    chrome.tabs.get(curTabId, function(tab)
    {
	    if ( tab)
	    {
            var url = "http://webwebweb.com#mode=1&start=0&search="+myEncodeURI(tab.title);
            chrome.runtime.sendMessage({ msg: "OnSP24Navigate", url: url }, function (response) { });
            window.close();
        }
    });
}

//OEmbed request
function OnSP24NavigateAddVideo()
{
    window.close();
    L64Oembed.requestAddVideo(curTabId, false);
}

function OnSP24NavigateAddVideo2() // add and Play
{
    window.close();
    L64Oembed.requestAddVideo(curTabId, true);
} 

function OnSP24NavigateVideo()
{
    var url = window.location.href;
    url = url.replace("downloader/popup.html","startpage/index.html?page=video");
    
    window.close();
    chrome.runtime.sendMessage({ msg: "OnSP24Navigate", url: url }, function (response)
    {
    });     
}
 
 
function getFilename(d)
{
    var s = "";
    for ( var j = 0; j<d.title.length;j++)
    {
        var c = d.title.charAt(j);
        if ( c>='A' && c<='Z')
            s+=c;
        else if ( c>='a' && c<='z')
            s+=c;
        else if ( c>='0' && c<='9')
            s+=c;
        else if ( "- _()".indexOf(c)>=0)
            s+=c;
    }   
    s+="."+GetFileExtension( d);
    return s;
}

 function getTitleFromUrl( d)
 {
    var fname = d.url;
    var j = fname.indexOf( "?");
    if ( j>=0)
        fname = fname.substr(0,j);
    fname = fname.trim("/ ");
    j = fname.lastIndexOf( "/");
    if ( j>=0)
        fname = fname.substr(j+1);

    fname = fname.replace(/%20/g, " ");
    if ( fname == "videoplayback" || fname.length<4)
    {
        if ( !d.title)
            d.title = "video";
        fname = d.title;
    }   
    fname = fname.trim("\n \t\r<>");
    if ( fname.length > 30)      
        fname = fname.substr(0,27)+"...";
    return fname;
}
 
var curTabId=0;
var videoUrls=0;
var showYoutubeMsg=false;

function hideControl(id)
{
    var o = document.getElementById(id); 
    if ( o)
    o.style.display = "none";   
}

function showVideoUrls( )
{
    var sInner="";
 
    if ( showYoutubeMsg)
        sInner+= "<div class='sep'></div><div class='clYT'>"+t["idYT"]+"</div>";
    
    if ( !videoUrls)
    {
        var o = document.getElementById("idNoVideo");
        if ( o)
        {
            o.innerHTML = t["idnovideo"]+"<a id='idNoVideoLink' style='margin-left:10px' href='#'>"+t["idwhy"]+"</a>";
            
            o.innerHTML += "<div id='sep4'></div>";
            o.style.display="block  ";
            
            var o = document.getElementById("idNoVideoLink");
            o.addEventListener('click', function(e)
            {
                e.stopPropagation();
                var w = 500; 
                var h = 220; 
                var left = (screen.width/2)-(w/2);
                var top = (screen.height/2)-(h/2);
                
                chrome.tabs.get(curTabId, function(tab)
                {
	                if ( tab)
	                {
	                    var url = "./novideo.html?url="+tab.url;
                        window.open( url, "_blank", 'resizable=no, scrollbars=no, titlebar=yes, width='+w+', height='+h+', top='+top+', left='+left);
                        window.close();
                    }
                });
                return true;
            });
        }
    }   
    var fDownloadsAvailable=false;
    if ( videoUrls)
    {
        //videoUrls.push(videoUrls[0]);
        for ( var i = 0; i < videoUrls.length; i++)
        {
            var ob = videoUrls[i];
            var url = ob.url;
            var ext = GetFileExtension( ob);
            if ( !i)
                sInner+= "<div class='sep'></div><div class='clHeader'>"+t["idVDL"]+"</div>";
            else
                sInner+= "<div class='sep2'></div>";
            var color = "#aaa";
            if ( ext == "flv")
                color = "#acf";
            else if ( ext == "mp4" || ext == "mp4" || ext == "m4v")
                color = "#cfa";
            else if ( ext == "3g")
                color = "#faa";
            else if ( ext == "wmv")
                color = "#aff";
                
            if ( ob.res)
                sInner+= "<div class='clFileExt' style='background-color:"+color+"'>"+ext+" "+ob.res+"</div>";
            else 
                sInner+= "<div class='clFileExt2' style='background-color:"+color+"'>"+ext+"</div>";
            
            if ((ext == "mp4" || ext == "mov") && ob.url != "CANNOTPLAY")
            {
                sInner+= "<div title='"+url+"' class='clDownloadVideo' id='idv_"+i+"' style='width:170px'>"+getFilename(ob)+"</div>"
            }
            else
                sInner+= "<div title='"+url+"' class='clDownloadVideo' id='idv_"+i+"'>"+getFilename(ob)+"</div>"
            

            if (ob.noDL) {
                sInner += "<div id='idUltimate' class='clNODownloadButton'><img width=19 src='./png/no.png'/></div>";
//                sInner += "<div id='idUltimate' title='"+t['idYT3']+"' class='clNODownloadButton'><img width=19 src='./png/no.png'/></div>";

            } else {
                if (ob.bytes) {
                    var mb = Math.floor(ob.bytes * 100 / 1024 / 1024) / 100;
                    sInner += "<div class='clDownloadButton' id='idd_" + i + "'>Warte auf Server-Antwort</div>";
                    //  sInner+= "<div class='clDownloadButton' id='idd_"+i+"'>Download "+mb+"MB</div>";
                }
                else {
                    if (curlang == "de")
                        sInner += "<div class='clDownloadButton' title='Warte darauf, dass der Video-Server antwortet' id='idd_" + i + "'>Warte auf Server</div>";
                    else
                        sInner += "<div class='clDownloadButton' title='Waiting for the video server is answering' id='idd_" + i + "'>Waiting for Server</div>";
                }
            }

            if ((ext == "mp4" || ext == "mov") && ob.url != "CANNOTPLAY")
            {
                sInner+= "<div class='clCC' id='idd_cc_"+i+"' ";
                if ( curlang=="de")
                    sInner+= "title='Spielen Sie dieses Video über Google chromecast auf Ihrem Fernseher ab'";
                else 
                    sInner+= "title='Send this video to your Google chromecast to play it on your TV'";
                sInner+= "><img width=19 src='./png/cc.png'/></div>";
            }
            fDownloadsAvailable=true;
            if ( !ob.bytes && !ob.noDL)
            {
                var client = new XMLHttpRequest();
                client.idControl = "idd_"+i;
                client.ob = ob;
                client.onreadystatechange = function() 
                {
                    if(this.readyState == 2) 
                    {
                        //console.log("this:");
                        //console.log(this);
                        var o = document.getElementById(this.idControl);
                        if ( o)
                        {
                            var bytes = this.getResponseHeader("Content-Length");
                            if (bytes<1000 && this.ob.len > 1000)
                                bytes = this.ob.len
                            
                            this.ob.bytes = bytes;
                            
                            var mb = Math.floor(bytes*100/1024/1024)/100;
                            o.innerHTML = "Download "+mb+"MB";
                            o.title = ""
                        }
                    }
                }
                client.open("HEAD", url);
                client.send();
            }
        }
    }        
    
    
    var o = document.getElementById("idVideos");
    if ( o)
        o.innerHTML = sInner;
        
    var o = document.getElementById("idAdd");
    if (o)
        o.addEventListener('click', OnSP24NavigateAddVideo2);    
        
    if ( videoUrls)        
    {
        for ( var i = 0; i < videoUrls.length; i++)
        {
            var o = document.getElementById("idd_"+i);
            if (o)
                o.addEventListener('click', OnDownloadVideo);    
            var o = document.getElementById("idd_cc_"+i);
            if (o)
                o.addEventListener('click', function(){OnPlayVideo(this)});    
        }
    }
    
    
    var o = document.getElementById("idUltimate");
    if (o)
        o.addEventListener('click', OnUltimate);
}

document.addEventListener('DOMContentLoaded', function ()
{
	var query = window.location.search.substring(1); 
	
	if (query.indexOf("lang=de") != -1) {
	    SetLanguage('de');
	    curlang = "de";
	}
	else {
	    curlang = localStorage.getItem("curlang");
	    if (!curlang)
	        curlang = "en";
	    SetLanguage(curlang);
	}

    if ( query.indexOf("mode=isyoutube") != -1)
    {	
        chrome.runtime.sendMessage({ msg: "OnYoutubeWarning", fOnce: true }, function (response) { });
	}
    
    hideControl("idTL");  
    hideControl("idSep2");        

	if ( query.indexOf("canaddvideo=1") < 0)
	{	
        hideControl("idaddvideo"); 
        hideControl("idsimilar"); 
        hideControl("idSep"); 
	}
	 
	var j = query.indexOf("&tabid=");
	if (  j>=0)
	    curTabId = parseInt(query.slice(j+7));
	        
	chrome.runtime.sendMessage({ msg: "OnSP24GetVideoUrls", tabId: curTabId }, function (response)
	{
	    //console.log("OnSP24GetVideoUrls:");
        //console.log(response);
        videoUrls = response.videoUrls;
        showVideoUrls();
        
    });
	
    var divs = document.querySelectorAll('div');
   for (var i = 0; i < divs.length; i++) {
    if (divs[i].className == "vdlButton")
    {
        if (divs[i].id == "idaddvideo")
            divs[i].addEventListener('click', OnSP24NavigateAddVideo);  
        else if (divs[i].id == "idsimilar")
            divs[i].addEventListener('click', OnSP24NavigateSimilar);  
    }
    else if (divs[i].className == "ReineckeTL")
        divs[i].addEventListener('click', OnSP24NavigateAddToplink);  
    else if (divs[i].className == "Reinecke24")
    {
        /*if (divs[i].id == "idwebwebweb")
            divs[i].addEventListener('click', OnSP24NavigateWebWebWeb);  
        else */
        if (divs[i].id == "idvideo")
            divs[i].addEventListener('click', OnSP24NavigateVideo);  
        else
            divs[i].addEventListener('click', OnSP24NavigateHome);  
    }
    
  }
});

var curlang="de";
var textDE = [];
textDE['idvideo'] = "Videoliste anzeigen";
textDE['idTL'] = "Seite als Toplink speichern";
textDE['idaddvideo'] = "Video in der Videoliste merken";
textDE['idsimilar'] = "Ähnliche Videos suchen";
textDE['idVDL'] = "Gefundene Videodateien:";
textDE['idYT'] = "Achtung: Chrome Web Store erlaubt keine Erweiterungen mehr, die Videos von YouTube runterladen.<br><br>Weitere Informationen finden Sie <a href='#' id='idUltimate'>hier</a>";
textDE['idYT3'] = "Achtung: Chrome Web Store erlaubt keine Erweiterungen\nmehr, die Videos von YouTube herunterladen.\n\nKlicken Sie um weitere Informationen zu erhalten";
textDE['idYT2'] = "Achtung: Chrome Web Store erlaubt keine Erweiterungen mehr, die Videos von YouTube runterladen.<br/>Installieren Sie dazu <a id='idUltimate' href='#'><b>Video Downloader Ultimate</b></a><br><br>Bei Problemen helfen wir gerne, schreiben Sie eine eMail an <a href='mailto:support@startpage24.com'>support@startpage24.com</a>";
textDE['idnovideo'] = "Keine Videos gefunden.";
textDE['idwhy'] = "Warum?";

var textEN = [];
textEN['idvideo'] = "Show video list";
textEN['idTL'] = "Create toplink for this page";
textEN['idaddvideo'] = "Add video to video list";
textEN['idsimilar'] = "Find similar videos";
textEN['idVDL'] = "Found video files:";
textEN['idYT'] = "Note: Chrome Web Store does not allow extensions that download videos from YouTube any longer. <br><br>Click  <a href='#' id='idUltimate'>here</a> to find more information";
textEN['idYT3'] = "Note: Chrome Web Store does not allow extensions that download videos from YouTube any longer. Click to get more information</a>";
textEN['idYT2'] = "Note: Chrome Web Store does not allow extensions that download videos from YouTube any longer.<br/>Please install <a id='idUltimate' href='#'><b>Video Downloader Ultimate</b></a><br><br>If you have problems, we will help. Please write a mail to <a href='mailto:support@startpage24.com'>support@startpage24.com</a>";
textEN['idnovideo'] = "No videos found.";
textEN['idwhy'] = "Why?";
var t = textEN;

function SetLanguage(lang )
{
    if ( lang == "de")
        t = textDE;

    //chrome.runtime.sendMessage({msg: "GetCurrentSPLanguage"}, function(response) 
    //{
		//alert (response)
		for (var s in t) 
    	{
       		var ob = document.getElementById( s); 
        	if ( ob) 
           	    ob.innerHTML = t[s];
    	}
   // });
}

chrome.runtime.onMessage.addListener(function (details, sender)
{
    if ( details.msg == "__L64_NEW_VIDEOLIST")
    {
        if (!videoUrls)
            videoUrls=[];
        for ( var i = 0; i< details.videoUrls.length;i++)
        {
            if ( details.videoUrls[i].rtmp)
            {
                var r = details.videoUrls[i];
                videoUrls.push({url: r.url,site:r.site,rtmp:r.rtmp,mime: "rtmp/mp4", p: 0, len:100000, title:r.title,res:r.q});
            }
            else
            {
                if ( details.videoUrls[i].top)
                    videoUrls.splice(0,0,details.videoUrls[i]);
                else
                    videoUrls.push(details.videoUrls[i]);
            }
        }
        showVideoUrls();
    }
}); 	
