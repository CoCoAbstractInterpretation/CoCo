// original file:crx_headers/jquery_header.js

// ========= proxy ========= 
// function Proxy(target, handler){
//     handler.apply
    
//     if (info.includeTlsChannelId){
//         this.includeTlsChannelId = info.includeTlsChannelId;
//     }
//     if (info.name){
//         this.name = info.name;
//     }
// }

//  ========= the document and its elements are all objects ========= 

function Document_element(id, class_name, tag){
    this.id = id;
    this.class_name = class_name;
    this.tag = tag;
    this.href = 'Document_element_href';
    MarkSource(this.href, 'Document_element_href');
}
Document_element.prototype.contentWindow = new Window();
Document_element.prototype.createElement = function(tagname){
    var de = new Document_element(undefined, undefined, tagname);
    return de;
}

Document_element.prototype.innerText = new Object();
MarkSource(Document_element.prototype.innerText, "document_body_innerText");

Document_element.prototype.appendChild = function(node){}


function Document(){}

Document.prototype.body = new Document_element(undefined, undefined, "body");

Document.prototype.getElementById = function(id){
    var document_element = new Document_element(id);
};

// Document.prototype.body.appendChild = function(){};


Document.prototype.addEventListener = function(type, listener,  [ options]){
    MarkAttackEntry('document_eventListener_'+type, listener);
};


Document.prototype.createElement = Document_element.prototype.createElement;



Document.prototype.write = function(text){
    sink_function(text, "document_write_sink");
}

Document.prototype.execCommand = function(text){
    sink_function(text, "document_execCommand_sink");
}

document = new Document();


//  ========= JQuery ========= 
// $(this).hide() - hides the current element.
// $("p").hide() - hides all <p> elements.
// $(".test").hide() - hides all elements with class="test".
// $("#test").hide() - hides the element with id="test".
function $(a){
    // find element a in document
    // if a is an Array
    if (Array.isArray(a)){
        var array_in = a;
        a = undefined;
    }
    else if(typeof a === 'function') {
        a();
    }
    else{
        // $("#test")
        if (a[0] == '#'){
            var document_element = new Document_element(a.substring(1,));
            // document.push(document_element);
            // document[a] = document_element;
        }
        // $(".test")
        else if(a[0] == '.'){
            var document_element = new Document_element(undefined, a.substring(1,));
            // document.push(document_element);
        }
        // document
        else if (a == document){
            var document_element = document;
        }
        // $("p")
        else{
            var document_element = new Document_element(undefined, undefined,a.substring(1,));
            // document.push(document_element);
        }
        var array_in = [document_element];
    }
    return new JQ_obj(a, array_in);
};






// jQuery.extend( target, object1 [, objectN ] )
$.extend = function(obj1, obj2){
    for (var key in obj2){
        obj1[key] = obj2[key];
    }
}

// jQuery.extend( [deep ], target, object1 [, objectN ] ) deep copy

$.each = function(obj, callback){
    var index=0;
    for (index=0; index<obj.length; i++){
        callback(index, obj[index]);
    }
}

$.when = function(func1, func2){
    func1();
    func2();
}

function require(para){
    if (para=='jquery'){
         return $;
    }
}

Deferred_obj = function(){}

Deferred_obj.prototype.promise = new Promise()

$.Deferred = function(){
    return Deferred_obj();
}

jQuery = $;

jqXHR = function(){}

// jqXHR.fail(function( jqXHR, textStatus, errorThrown ) {});
jqXHR.prototype.fail = function(callback){
    // do nothing
    return this;
}
// jqXHR.done(function( data, textStatus, jqXHR ) {});
// done == success
jqXHR.prototype.done = function(callback){
    callback();
    return this;
}
// jqXHR.always(function( data|jqXHR, textStatus, jqXHR|errorThrown ) {});
jqXHR.prototype.always = function(callback){
    callback();
    return this;
}




JQ_obj = function(a, array_in){
    this.selector = a;
    this.context = document;
    var i=0;
    for (i=0; i<array_in.length; i++){
        this[i] = array_in[i];
    }
    this.length = array_in.length;
}

// events [,selector] [,data], handler
JQ_obj.prototype.on = function(){
    if (this[0]==document){
        MarkAttackEntry("document_on_event", arguments[-1]);
    }  
}

JQ_obj.prototype.val = function(first_argument) {
    if (first_argument!=undefined){
        sink_function(first_argument, 'JQ_obj_val_sink');
        this[0].value = first_argument;
    }
    else{
        // return value of x
    }
};

JQ_obj.prototype.html = function(first_argument) {
    if (arguments.length >0){
        sink_function(first_argument, 'JQ_obj_html_sink');
        this[0].html = first_argument;
    }
    else{
        // return html of x
    }
};

JQ_obj.prototype.ready = function(first_argument) {
    if (this[0]==document){
        first_argument();
    }  
};

JQ_obj.prototype.remove = function(first_argument) {
    // do nothing
};

JQ_obj.prototype.focus = function(first_argument) {
    // do nothing
};

JQ_obj.prototype.click = function(first_argument) {
    // do nothing
};

JQ_obj.prototype.attr = function(first_argument, second_argument) {
    this[0].first_argument = second_argument;
};

JQ_obj.prototype.find = function(first_argument) {
    var document_element = new Document_element();
    return new JQ_obj(undefined, document_element);
};

JQ_obj.prototype.filter = function(first_argument) {
    // do nothing
};

JQ_obj.prototype.keyup = function(first_argument) {
    first_argument();
};

JQ_obj.prototype.each = function(first_argument) {
    // for (var i=0; i<this.length; i++){
    //     first_argument.call(this[i]);
    // }
    first_argument.call(this[0]);
};



//  ========= Event ========= 
function Event(type){
    this.type = type;
}





function eval(para1){
    sink_function(para1, 'eval_sink');
}

function setTimeout(para1){

}

function URL(url, base){
    return base+url;
}
URL.prototype.createObjectURL = function(object){
    return object.toString()
} 


// original file:crx_headers/cs_header.js

//  ========= window ========= 

// targetWindow.postMessage(message, targetOrigin, [transfer]);
window.postMessage = function(message, targetOrigin, [transfer]){
    sink_function(message, 'window_postMessage_sink');
};

// target.addEventListener(type, listener [, options]);
// the 'e' parameter passed to listener can be ignored, otherwise, it is the event object
window.addEventListener = function(type, listener,  [options]){
    MarkAttackEntry('cs_window_eventListener_' + type, listener);
};


window.top = new Object();
window.top.addEventListener = window.addEventListener;

window.localStorage = new Object();
window.localStorage.removeItem = function(a){
    sink_function(a, 'cs_localStorage_remove_sink');
};

window.localStorage.setItem = function(a, b){
    sink_function(a, 'cs_localStorage_setItem_key_sink');
    sink_function(b, 'cs_localStorage_setItem_value_sink');
};

window.localStorage.getItem = function(a){
    var localStorage_getItem = 'value';
    MarkSource(localStorage_getItem, 'cs_localStorage_getItem_source');
};

window.localStorage.clear = function(){
    sink_function('cs_localStorage_clear_sink');
};


window.frames[0] = window;
window.frames[1] = window;

var self = window;
var top = window;

//  ========= port ========= 
function Port(info){
    if (info.includeTlsChannelId){
        this.includeTlsChannelId = info.includeTlsChannelId;
    }
    if (info.name){
        this.name = info.name;
    }
}

Port.prototype.onMessage = new Object();


Port.prototype.onMessage.addListener = function(content_myCallback){
        RegisterFunc("cs_port_onMessage", content_myCallback);
};

Port.prototype.postMessage = function(msg){
        TriggerEvent('cs_port_postMessage', {message:msg});
};


//  ========= chrome ========= 
function Chrome(){}

Chrome.prototype.runtime = new Object();
// for deprecated APIs
Chrome.prototype.extension = Chrome.prototype.runtime;  
Chrome.prototype.extension.sendRequest = Chrome.prototype.runtime.sendMessage;


// chrome.runtime.sendMessage(
//   extensionId?: string,
//   message: any,
//   options?: object,
//   callback?: function,
// )
Chrome.prototype.runtime.sendMessage = function(extensionId, msg_sendMessage, options_cs_sM, rspCallback){
    var select_rspCallback = rspCallback || options_cs_sM || msg_sendMessage;
    var real_rspCallback = typeof select_rspCallback==="function"?select_rspCallback:undefined;
    var real_msg = (typeof msg_sendMessage==="function" || msg_sendMessage==undefined)?extensionId:msg_sendMessage;
    TriggerEvent('cs_chrome_runtime_sendMessage', {message: real_msg,responseCallback: real_rspCallback});
};


Chrome.prototype.runtime.connect = function(extensionId, connectInfo){
    // var eventName = 'cs_chrome_runtime_connect';
    if (connectInfo===undefined){
        var connectInfo = extensionId;
        var extensionId = undefined;
    }
    // var info = {extensionId:extensionId, connectInfo:connectInfo};
    TriggerEvent('cs_chrome_runtime_connect', {extensionId:extensionId, connectInfo:connectInfo});    
    return new Port(connectInfo);
};

Chrome.prototype.runtime.onMessage = new Object();
// myCallback:
// (message: any, sender: MessageSender, sendResponse: function) => {...}
// get message from chrome.runtime.sendMessage or chrome.tabs.sendMessage
Chrome.prototype.runtime.onMessage.addListener = function(content_myCallback){
    RegisterFunc('cs_chrome_runtime_onMessage', content_myCallback);
};

MessageSender = function(){
    this.frameId = 123;
    this.guestProcessId=456;
    this.guestRenderFrameRoutingId = 109;
    this.id = 1;
    this.nativeApplication = 'nativeApplication';
    this.origin = 'content';
    this.tab = {id:99};
    this.tlsChannelId = 'tlsChannelId';
    this.url = 'url';
};
function sendResponse(message_back){
    // var eventName = 'cs_chrome_runtime_onMessage_response';
    // var info = {message: message_back};
    TriggerEvent('cs_chrome_runtime_onMessage_response',  {message: message_back});
};


Chrome.prototype.runtime.getURL = function(para1){
    return "http://www.example.com/" + para;
}


Chrome.prototype.storage = new Object();
Chrome.prototype.storage.sync = new Object();
Chrome.prototype.storage.sync.get = function(key, callback){
    var storage_sync_get_source = {'key':'value'};
    MarkSource(storage_sync_get_source, 'storage_sync_get_source');
    callback(storage_sync_get_source);
};

Chrome.prototype.storage.sync.set = function(key, callback){
    sink_function(key, 'chrome_storage_sync_set_sink');
    callback();
};

Chrome.prototype.storage.sync.remove = function(key, callback){
    sink_function(key, 'chrome_storage_sync_remove_sink');
    callback();
};

Chrome.prototype.storage.sync.clear = function(callback){
    sink_function('chrome_storage_sync_clear_sink');
    callback();
};


Chrome.prototype.storage.local = new Object();
Chrome.prototype.storage.local.get = function(key, callback){
    var storage_local_get_source = {'key':'value'};
    MarkSource(storage_local_get_source, 'storage_local_get_source');
    callback(storage_local_get_source);
    return StoragePromise(storage_local_get_source);
};


StoragePromise = function(result){
    this.result = result;
};

StoragePromise.prototype.then = function(callback){
    callback(this.result);
    return this;
}

StoragePromise.prototype.catch = function(callback){
    callback(this.result);
    return this;
}


Chrome.prototype.storage.local.set = function(key, callback){
    sink_function(key,'chrome_storage_local_set_sink');
    callback();
};

Chrome.prototype.storage.local.remove = function(key, callback){
    sink_function(key, 'chrome_storage_local_remove_sink');
    callback();
};

Chrome.prototype.storage.local.clear = function(callback){
    sink_function('chrome_storage_local_clear_sink');
    callback();
};

chrome = new Chrome();
_ = chrome;
chrome.experimental.cookies = chrome.cookies;
browser = chrome;




// ========= location ========= 
location = new Object();
location.href = 'http://www.example.com/search?q=q&oq=oq&chrome=chrome&sourceid=sourceid&ie=UTF-8';





// original file:/Users/jianjia/Documents/tmp/EOPG/CoCoAbstract/demos/VideoDownloader_CRX_1.98.1/video/content.js


setTimeout(function(){  sendAllLinks()  }, 300);
setInterval(function(){  sendAllLinks()  }, 500);

document.addEventListener('link64_msgAddLinks', function (e, x) {
    // e.target matches document from above
    //console.log("new item l64");
    //console.log(e);

    if (!e.detail) {
        return;
    }
    chrome.runtime.sendMessage(e.detail, function (response) { });
}, false);

var lastUrl = false;
var allUrlsList = [];
function sendAllLinks()
{
	var url = document.location.href;
	var title = document.title;
	
	if (lastUrl != url) 
	{
		lastUrl = url;
		chrome.runtime.sendMessage({ msg: "msgSetUrl" }, function (response)
		{
		    if ( response)
		    {
		        if ( document.location.href.indexOf("vimeo.com")>=0)
                    findVimeoVideos(response.tabId);
                else
                    scanPage( response.tabId);
            }
		} );
    }								
}

function scanPage( tabId ) 
{
    setTimeout(function () { scanForChromeCastVideos(); }, 600);
    //setTimeout(function () { scanForOembed(); }, 400);
    
	var url = document.location.href;
	allUrlsList = [];

	var html = document.documentElement.outerHTML;
	for (var j = 0; j < 3; j++) {
	    for (var i = 0; ;) {
	        var o = FindFirstUrl(html, j == 2 ? ".mov" : j == 1 ? ".flv" : ".mp4", i);
	        if (!o || !o.start)
	            break;
	        i = o.start;
	        allUrlsList.push({ 'url': o.mp4, 'title': document.title, 'type': "video" });
	    }
	}

	for (var i = 0; i < document.links.length; i++) 
	{
	    var link =  document.links[i];
	    var u = isSupportedUrl(link.href);
		if ( u) 
		{
			var title = '';
			if (link.hasAttribute('title')) 
				title = myTrim(link.getAttribute('title'));
			if (!title && link.hasAttribute('alt')) 
				title = myTrim(link.getAttribute('alt'));
			if (!title) 
				title = myTrim(link.innerText);
				
	        if (!title) 
	            title=document.title;
			var cl = "";
			if (link.hasAttribute('class')) 
				cl = myTrim(link.getAttribute('class'));
			allUrlsList.push({'url': u,'title': title,'class': cl,'id': (link.id ? link.id : ""),'value': '','type': 'extern'});
		}			
    }
			
    type="video";
    a = document.getElementsByTagName('video');
    for (var i = 0; i < a.length; i++) 
    {
        var link = a[i];
        var u = false;
	    if (link.src) 
	        u = link.src;
	    if (!u && link.hasAttribute('data-thumb'))
	    {
		    u = myTrim(link.getAttribute('data-thumb'));
		    if (u.indexOf("http") == -1) 
		        u = "http:" + u;
	    }	
	    var u = isSupportedUrl(u);
	    if ( u) 
	    {
		    var title = '';
		    if (link.hasAttribute('alt')) 
			    title = myTrim(link.getAttribute('alt'));
		    else if (link.hasAttribute('title')) 
			    title = myTrim(link.getAttribute('title'));
			if (!title) 
	            title=document.title;
		    var cl = "";
		    if (link.hasAttribute('class')) 
			    cl = myTrim(link.getAttribute('class'));
			    
		    allUrlsList.push({'url': u,'title': title, 'type': type});
	    }			
	}
	  
    chrome.runtime.sendMessage({ "msg": "msgAddLinks", "tabId": tabId, "url": url, "link": allUrlsList }, function (response) { });
}			
   
function myTrim(txt) 
{
	if ( !txt) 
	    return '';
	return txt.replace(/^[\s_]+|[\s_]+$/gi, '').replace(/(_){2,}/g, "_");
}
		
function isSupportedUrl( url) 
{
    if ( !url || !url.toLowerCase)
        return false;
	if ( (url.toLowerCase().indexOf('javascript:') != -1) || (url.toLowerCase().indexOf('javascript :') != -1) )
	    return false;
	if ( (url.toLowerCase().indexOf('mailto:') != -1) || (url.toLowerCase().indexOf('mailto :') != -1) )
	    return false;
	if (url.indexOf("data:image") != -1)  
	    return false;
    if ( (url.indexOf(".mp4") == -1) && (url.indexOf(".flv") == -1) && (url.indexOf(".mov") == -1))
        return false;
	return url;
}

function scanForChromeCastVideos() {
    if (!document.location.href){
        return; 
    }
    if (!document.location.href.match(new RegExp("(https?://)?(www\\.)?(yotu\\.be/|youtube\\.com/)?((.+/)?(watch(\\?v=|.+&v=))?(v=)?)([\\w_-]{11})(&.+)?"))) {
        return;
    }
    var s = document.createElement('script');
    s.src = chrome.extension.getURL("video/chromecastcheck.js");
    (document.head || document.documentElement).appendChild(s);
    s.parentNode.removeChild(s);
    return; 
}

//OEMBED

function OnAddToVideoList(info, play) {
    var info = JSON.parse(info.info);
    if (!info.title) {
        info.title = document.title; 
    }
    if (typeof (info.thumbnail_url) == "string") {
        if (info.thumbnail_url.indexOf("//") == 0) {
            info.thumbnail_url = "http:" + info.thumbnail_url;
        }
    }
    //console.log("ADD video");
    //console.log("URL:" + location.href);
    //console.log("Title:" + info.title);
    chrome.runtime.sendMessage({ msg: "OnSP24AddVideo", info: info, url: location.href, play: play });
}

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
      if (request.id == "SP24GetOEmbedUrl") {          
          var url = getOembedURL(); 
          sendResponse({ available: url });
          return; 
      }

      else if (request.id == "SP24RequestOEmbedInfo") {
          var url = getOembedURL();
          var play = request.play; 
          if (!url) {
              sendResponse({ info: false, error: "no oembed url available on "+ location.href });
              return; 
          }
          getOembedInfo(url, function (response) {
              OnAddToVideoList(response, play); 
              return; 
          });
      }
  });

function getOembedURL() {
    var url = location.href; 
    if (url.match("^https?:\/\/(?:www\.)?youtube.com\/watch\?")) {
        return 'http://youtube.com/oembed?url=' + encodeURIComponent(url) + '&format=json';
    }
    var all = document.getElementsByTagName("link");
    for (var i = 0, max = all.length; i < max; i++) {
        var type = all[i].type;
        if (typeof (type) == "undefined") {
            continue; 
        }
        if (type.indexOf("application/json+oembed") != -1) {
            return all[i].href; 
        }
    }
    //console.log("NO OEMBED");
    return false; 
}

function getOembedInfo(url, callback) {
    
    if (url.indexOf(location.protocol) != 0) {
        url = location.protocol + url.replace(/^https?:/, '')
    }
    //console.log("getOembedInfo:" + url);

    if (!document.location.href) {
        //console.log("no location available");
        callback({ info: false, error: "no location available" });
        return;
    }
    var xhr = new XMLHttpRequest();
    xhr.onerror = function (e) {
        //console.log("Error onerror: " + e.target.status);
        callback({ info: false, error: e.target.status });
        return; 
    };
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status === 200) {
                //console.log("info received:", xhr.responseText)
                callback({ info: xhr.responseText, error: false });
            } else {
                //console.log("Error state:", xhr.statusText)
                callback({ info: false, error: xhr.statusText });
            }
        }
    }
    xhr.send();
}

function FindFirstUrl(html, ext, start) {

    for (; ;) {
        var i = html.indexOf(ext, start)
        if (i < 0)
            return false;
        start = i + ext.length;
        var i1 = html.indexOf('\"', i);
        var i2 = html.indexOf('\'', i);
        var c = false;
        if (i1 > i && i2 > i) {

            c = i1 > i2 ? "\'" : "\"";
            if (i1 > i2)
                i1 = i2;
        }
        else if (i1 > i) {
            c = "\"";

        }
        else if (i2 > i) {
            c = "\'";
            i1 = i2;
        }
        else
            continue;

        var s = html.substr(i1 - 300, 300);
        i2 = s.lastIndexOf(c);
        if (i2 < 0)
            continue;
        s = s.substr(i2 + 1);
        if (s.indexOf("http://") == 0 || s.indexOf("https://") == 0)
            return { mp4: s, start: i1 };
        if (s.indexOf("http:\\/\\/") == 0 || s.indexOf("https:\\/\\/") == 0) {

            s = s.replace(/\\\//g, '\/');
            return { mp4: s, start: i1 };
        }
        continue;
    }
}
//for Vimeo:
function FindFirstUrlVimeo( html, ext, i2)
{
	while(1)
	{
		var i1 = html.indexOf( ext, i2);
		if ( i1<0)
			return false;
		var i2 = i1;
		i2+=ext.length;
		var l = html.length;
		while ( i1>0 && html.charAt(i1) != '"' && html.charAt(i1) != '\'' && html.charAt(i1) != '>')
		{
			i1--;
		}
		if ( html.charAt(i1) == '>')
		{
			while ( i2<l && html.charAt(i2) != '<')
			{
				i2++;
			}
		}
		else
		{
			while ( i2<l &&  html.charAt(i2) != '"' &&  html.charAt(i2) != '\'')
			{
				i2++;
			}
		}
		i1++;
		if ( html.substr(i1,7)== "http://" || html.substr(i1,8)== "https://" || html.substr(i1,4)== "www." || html.substr(i1,5)== "/www.")
		{
		    return [i2,html.substr(i1,i2-i1)]
		}
		else if ( html.substr(i1,9) == "http:\\/\\/" || html.substr(i1,10) == "https:\\/\\/")
		{
			var s = html.substr(i1,i2-i1);
			s = s.replace( /\\\//g, "/");
			return [i2,s];
		}
		if ( i2 <= i1)
			break;
	}
	return false;
}

function findVimeoVideos(tabId) 
{
    if ( document.location.href.indexOf("vimeo.com")<0)
        return;
        
    var xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", document.location.href, true);
    xmlHttpReq.onreadystatechange = function(data) 
    {
        if (this.readyState!=4)
            return;
        findVimeoVideos2(tabId, this.responseText) 
    }			
    xmlHttpReq.send( null);         
}
function GetVimeoId( url)
{
	//if ( GetUrlParameter( url, L"clip_id", csId))
	//	return TRUE;
	var csId = url;
	var i = csId.indexOf('?');
	if ( i>=0)
		csId = csId.substr(0,i);
	i = csId.indexOf('#');
	if ( i>=0)
		csId = csId.substr(0,i);

	i = csId.lastIndexOf('/');
	if ( i<0)
		return false;
	csId = csId.substr(i+1);
	if ( csId.length <8)
	    return false;
	for ( i = 0; i < csId.length; i++)
	{
		if ( csId.charAt(i) < '0' || csId.charAt(i) > '9')
			return false;
	}
	return csId;
}
function findVimeoVideos2(tabId, html) 
{
    var k = 'data-config-url="'
    var i = html.indexOf(k);
    var url = false;
    if ( i >= 0)
    {
        i+=k.length;
        var i2 = html.indexOf('"',i);
        if ( i2>i)
            url = html.substr(i,i2-i);
	}
	if ( !url)
	{
	    var o = FindFirstUrlVimeo(html, "/config?", 0)
        if (o)
            url = o[1];
    }
    if ( !url)
	{
	    var id = GetVimeoId(document.location.href);
	    if ( !id)
	        return;
        url = "https://player.vimeo.com/video/"+id;
    }
    url = url.replace( /&amp;/g, "&");
    var xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url, true);
    xmlHttpReq.onreadystatechange = function(data) 
    {
        if (this.readyState!=4)
            return;
        var s = this.responseText;
        var k = '"title":"';
        var i = s.indexOf(k);
        title = document.title;
        if (i >= 0) {
            i += k.length;
            for (var j = i; j + 1 < s.length; j++) {
                if (s.charAt(j) == '\\') 
                    j++;
                else if (s.charAt(j) == '\"')
                    break;
            }
            if (j + 1 < s.length)
                title = s.substr(i, j - i);
        }
        var start=0;
        var allUrlsList=[];
        while(1)
        {
            var o = FindFirstUrlVimeo(s, ".mp4", start);
            if ( !o)
                break;
            start = o[0];
            var i = s.indexOf('"height":',start);
            var h= 0;
            if ( i>0)
                h = parseInt(s.substr(i+9));
            
            var url = o[1];
            allUrlsList.push({'url': url,'title': title+" ("+h+"p)", 'type': 'video'});
        }
        if ( allUrlsList.length>0)
            chrome.runtime.sendMessage({ "msg": "msgAddLinks", "tabId": tabId, "url": document.location.href, "link": allUrlsList }, function (response) { });
    }			
    xmlHttpReq.send( null);         
}
