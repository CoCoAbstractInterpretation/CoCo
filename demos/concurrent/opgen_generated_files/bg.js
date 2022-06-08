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


// original file:crx_headers/bg_header.js

// jquery
//fetch
fetch_obj = function(){}

fetch = function(resource, options){
    sink_function(resource, "fetch_resource_sink");
    sink_function(options.url, "fetch_options_sink");
    return new fetch_obj();
}

fetch_obj.prototype.then = function(callback){
    var responseText = 'data_from_fetch';
    MarkSource(responseText, 'fetch_source');
    callback(responseText);
    return this;
}

// jqXHR
$.ajax = function(url, settings){
    if (typeof url=="string"){
        sink_function(url, 'jQuery_ajax_url_sink');
        sink_function(settings.data, 'jQuery_ajax_settings_data_sink');
        if(settings.beforeSend){
            settings.beforeSend();
        }
        if (settings.success){
            var jQuery_ajax_result_source = 'data_form_jq_ajax';
            MarkSource(jQuery_ajax_result_source, 'jQuery_ajax_result_source');
            settings.success(jQuery_ajax_result_source);
        }
    }
    else{
        sink_function(url.url, 'jQuery_ajax_settings_url_sink');
        sink_function(url.data, 'jQuery_ajax_settings_data_sink');
        if (url.complete){
            url.complete(xhr, textStatus);
        }
        if (url.success){
            var jQuery_ajax_result_source = 'data_form_jq_ajax';
            MarkSource(jQuery_ajax_result_source, 'jQuery_ajax_result_source');
            url.success(jQuery_ajax_result_source);
        }
    }
}
// jQuery.get( url [, data ] [, success ] [, dataType ] )
// data: Type: PlainObject or String
// success: Type: Function( PlainObject data, String textStatus, jqXHR jqXHR )
// dataType: Type: String
$.get = function(url , success){
    var responseText = 'data_from_url_by_get';
    MarkSource(responseText, 'jQuery_get_source');
    sink_function(url, 'jQuery_get_url_sink');
    success(responseText);
    return new jqXHR();
}
// jQuery.post( url [, data ] [, success ] [, dataType ] )
$.post = function( url , data, success){
    var responseText = 'data_from_url_by_post';
    MarkSource(responseText, 'jQuery_post_source');
    sink_function(data, 'jQuery_post_data_sink');
    sink_function(url, 'jQuery_post_url_sink');
    success(responseText);
    return new jqXHR();
}

// =========XMLHttpRequest======
function XMLHttpRequest(){};

XMLHttpRequest.prototype.open = function(method, url, async, user, psw){
    sink_function(url, 'XMLHttpRequest_url_sink');
};

// if msg is not none, used for POST requests
XMLHttpRequest.prototype.send = function(msg){
    if (msg!=undefined){
        sink_function(msg, 'XMLHttpRequest_post_sink');
    }
};


XMLHttpRequest.prototype.responseText = 'sensitive_responseText';
XMLHttpRequest.prototype.responseXML = 'sensitive_responseXML';
MarkSource(XMLHttpRequest.prototype.responseText, 'XMLHttpRequest_responseText_source');
MarkSource(XMLHttpRequest.prototype.responseXML, 'XMLHttpRequest_responseXML_source');


XHR = XMLHttpRequest;

//  ========= window ========= 

// targetWindow.postMessage(message, targetOrigin, [transfer]);
// window.postMessage = function(message, targetOrigin, [transfer]){
//     sink_function(message, 'window_postMessage_sink');
// };

// // target.addEventListener(type, listener [, options]);
// // the 'e' parameter passed to listener can be ignored, otherwise, it is the event object
// window.addEventListener = function(type, listener,  [options]){
//     MarkAttackEntry('cs_window_eventListener_' + type, listener);
// };


window.top = new Object();
window.top.addEventListener = window.addEventListener;

window.localStorage = new Object();
window.localStorage.removeItem = function(a){
    sink_function(a, 'bg_localStorage_remove_sink');
};

window.localStorage.setItem = function(a, b){
    sink_function(a, 'bg_localStorage_setItem_key_sink');
    sink_function(b, 'bg_localStorage_setItem_value_sink');
};

window.localStorage.getItem = function(a){
    var localStorage_getItem = 'value';
    MarkSource(localStorage_getItem, 'bg_localStorage_getItem_source');
};

window.localStorage.clear = function(){
    sink_function('bg_localStorage_clear_sink');
};


window.frames[0] = window;
window.frames[1] = window;

var self = window;
var top = window;

// ========= port ========= 
function Port(info){
    if (info.includeTlsChannelId){
        this.includeTlsChannelId = info.includeTlsChannelId;
    }
    if (info.name){
        this.name = info.name;
    }
}

Port.prototype.onMessage = new Object();

Port.prototype.onMessage.addListener = function(myCallback){
    RegisterFunc("bg_port_onMessage", myCallback);
};

Port.prototype.postMessage = function(msg){
    TriggerEvent('bg_port_postMessage', {message:msg});
};

// ========= external port ========= 
function externalPort(info){
    this.includeTlsChannelId = info.includeTlsChannelId;
    this.name = info.name;
}

externalPort.prototype.onMessage = new Object();

externalPort.prototype.onMessage.addListener = function(myCallback){
    MarkAttackEntry("bg_external_port_onMessage", myCallback);
};

externalPort.prototype.postMessage = function(msg){
    sink_function(msg, 'bg_external_port_postMessage_sink');
};


// ========= external native port ========= 
function externalNativePort(info){
    this.includeTlsChannelId = info.includeTlsChannelId;
    this.name = info.name;
}

externalNativePort.prototype.onMessage = new Object();

externalNativePort.prototype.onMessage.addListener = function(myCallback){
    MarkAttackEntry("bg_externalNativePort_onMessage", myCallback);
};

externalNativePort.prototype.postMessage = function(msg){
};


// ========= tab ========= 
function Tab(){
    this.active = true;
    this.audible = true;
    this.autoDiscardable = true;
    this.discarded = true;
    this.favIconUrl = 'https://example.com/image.png';
    this.groupId = 1;
    this.height =  600;
    this.highlighted = true;
    this.id = 99;
    this.incognito = false;
    this.index = 2;
    this.mutedInfo = {muted:false};
    this.openerTabId = 1;
    this.pendingUrl = 'https://example2.com';
    this.pinned = true;
    this.sessionId = '23';
    this.status = 'complete';
    this.title = 'example';
    this.url = 'https://example.com';
    this.width =  800;
    this.windowId = 14;
}

//  ========= chrome ========= 
function Chrome(){}

Chrome.prototype.runtime = new Object();
// for deprecated APIs
Chrome.prototype.extension = Chrome.prototype.runtime;  
Chrome.prototype.extension.onRequest = Chrome.prototype.runtime.onMessage;

Chrome.prototype.runtime.onInstalled = new Object();
// this function be called righrt after all the 
Chrome.prototype.runtime.onInstalled.addListener = function(myCallback) {
    var details = {is:99, previousVersion:'0.0.1', reason:'install'};
    myCallback(details);
};


Chrome.prototype.runtime.onConnect = new Object();
Chrome.prototype.runtime.onConnect.addListener = function(myCallback) {
  RegisterFunc("bg_chrome_runtime_onConnect", myCallback);
};

Chrome.prototype.runtime.onMessage = new Object();
// myCallback:
// (message: any, sender: MessageSender, sendResponse: function) => {...}
// get message from chrome.runtime.sendMessage or chrome.tabs.sendMessage
Chrome.prototype.runtime.onMessage.addListener = function(myCallback) {
    RegisterFunc('bg_chrome_runtime_onMessage', myCallback);
};
MessageSender = function(){
    this.frameId = 123;
    this.guestProcessId=456;
    this.guestRenderFrameRoutingId = 109;
    this.id = 0;
    this.nativeApplication = 'nativeApplication';
    this.origin = 'back';
    this.tab = new Tab();
    this.tlsChannelId = 'tlsChannelId';
    this.url = 'url';
};
function sendResponse(message_back){
    // var eventName = 'bg_chrome_runtime_onMessage_response';
    // var info = {message: message_back};
    TriggerEvent('bg_chrome_runtime_onMessage_response', {message: message_back});
};


// chrome.runtime.onMessage.removeListener
Chrome.prototype.runtime.onMessage.removeListener = function(myCallback) {
    UnregisterFunc('bg_chrome_runtime_onMessage', myCallback);
};

// chrome.runtime.onMessageExternal.addListener
Chrome.prototype.runtime.onMessageExternal = new Object();
// myCallback parameters: (message: any, sender: MessageSender, sendResponse: function) => {...}
Chrome.prototype.runtime.onMessageExternal.addListener = function(myCallback){
    MarkAttackEntry("bg_chrome_runtime_MessageExternal", myCallback);
}
MessageSenderExternal = function(){
    this.frameId = 123;
    this.guestProcessId=456;
    this.guestRenderFrameRoutingId = 109;
    this.id = 0;
    this.nativeApplication = 'nativeApplication';
    this.origin = 'external';
    this.tab = new Tab();
    this.tlsChannelId = 'tlsChannelId';
    this.url = 'url';
};
function sendResponseExternal(message_out){
    sink_function(message_out, 'sendResponseExternal_sink');
};

function sendResponseExternalNative(message_out){};

// chrome.runtime.onConnectExternal.addListener
Chrome.prototype.runtime.onConnectExternal = new Object();
// myCallback parameters: (message: any, sender: MessageSender, sendResponse: function) => {...}
Chrome.prototype.runtime.onConnectExternal.addListener = function(myCallback){
    MarkAttackEntry("bg_chrome_runtime_onConnectExternal", myCallback);
}

Chrome.prototype.runtime.connectNative = function(extensionId, connectInfo){
    // var eventName = 'cs_chrome_runtime_connect';
    if (connectInfo===undefined){
        var connectInfo = extensionId;
        var extensionId = undefined;
    }
    // var info = {extensionId:extensionId, connectInfo:connectInfo};
    return new externalNativePort(connectInfo);
};

Chrome.prototype.runtime.sendNativeMessage = function(application, message, callback){
    var response;
    MarkSource(response, 'sendNativeMessage_response_source');
    callback();
}



Chrome.prototype.topSites = new Object();
Chrome.prototype.topSites.get = function(myCallback){
    var mostVisitedUrls_source = [{title:'title', url:'url'}];
    // mostVisitedUrls is sensitive data!
    MarkSource(mostVisitedUrls_source, 'topSites_source');
    myCallback(mostVisitedUrls_source);
};

// chrome.tabs.sendMessage(tabId: number, message: any, options: object, responseCallback: function)
// Chrome.prototype.tabs.sendMessage = function(tabId, message, options, responseCallback){
//     var eventName = 'bg_chrome_tabs_sendMessage';
//     var info =  {tabId:99, message:message, options:options, responseCallback:responseCallback};
//     TriggerEvent(eventName, info);
// };
// 
Chrome.prototype.tabs = new Object();
Chrome.prototype.tabs.sendMessage = function(tabId, message, responseCallback){
    // var eventName = 'bg_chrome_tabs_sendMessage';
    // var info =  {tabId:tabId, message:message, responseCallback:responseCallback};
    TriggerEvent('bg_chrome_tabs_sendMessage', {tabId:tabId, message:message, responseCallback:responseCallback});
};

// chrome.tabs.query(queryInfo: object, callback: function)
Chrome.prototype.tabs.query = function(queryInfo, callback){
    // queryInfo is to find corresponding tabs, ingore it now
    var tab = new Tab();
    var alltabs = [tab];
    callback(alltabs);
}

Chrome.prototype.tabs.getSelected = function(callback){
    var tab = new Tab();
    callback(tab);
}

Chrome.prototype.tabs.onActivated = new Object();
// the callback is called once a new tab is activated, we run the callback after all the others are set
Chrome.prototype.tabs.onActivated.addListener = function(myCallback){
    var activeInfo = new ActiveInfo();
    myCallback(activeInfo);
}

Chrome.prototype.tabs.onUpdated = new Object();
Chrome.prototype.tabs.onUpdated.addListener = function(myCallback){
    MarkAttackEntry("bg_tabs_onupdated", myCallback);
    // var tab = new Tab();
    // myCallback(99, {}, tab);
}

// for deprecated APIs
Chrome.prototype.tabs.onActiveChanged = Chrome.prototype.tabs.onActivated


// chrome.tabs.executeScript
Chrome.prototype.tabs.executeScript = function(tabid, details, callback){
    sink_function(tabid, 'chrome_tabs_executeScript_sink');
    sink_function(details, 'chrome_tabs_executeScript_sink');
    sink_function(callback, 'chrome_tabs_executeScript_sink');
    callback();
}


function ActiveInfo(){
    this.tabId = 3;
    this.windowId = 1;
};


// chrome.tabs.create
Chrome.prototype.tabs.create = function(createProperties, callback){
    sink_function(createProperties.url, 'chrome_tabs_create_sink');
    callback();
}
// chrome.tabs.update
Chrome.prototype.tabs.update = function(tabId, updateProperties, callback){
    sink_function(updateProperties.url, 'chrome_tabs_update_sink');
    callback();
}
// chrome.tabs.getAllInWindow
Chrome.prototype.tabs.getAllInWindow = function(winId, callback){
    var tab = new Tab();
    var tabs = [tab];
    callback(tabs);
}



Chrome.prototype.cookies = new Object();
// chrome.cookies.get(details: CookieDetails, callback: function)
Chrome.prototype.cookies.get = function(details, callback){
    var cookie_source = {domain:'cookie_domain', expirationDate:2070, hostOnly:true, httpOnly: false, name:'cookie_name', path:'cookie_path',sameSite:'no_restriction', secure:true, session: true, storeId:'cookie_storeId', value: 'cookie_value' };
    MarkSource(cookie_source, 'cookie_source')
    callback(cookie_source);
};

// chrome.cookies.getAll(details: object, callback: function)
Chrome.prototype.cookies.getAll = function(details, callback){
    var cookie_source = {domain:'.uspto.gov', expirationDate:2070, hostOnly:true, httpOnly: false, name:'cookie_name', path:'cookie_path',sameSite:'no_restriction', secure:true, session: true, storeId:'cookie_storeId', value: 'cookie_value' };
    var cookies_source = [cookie_source];
    MarkSource(cookies_source, 'cookies_source')
    callback(cookies_source);
};


// chrome.cookies.getAllCookieStores(callback: function)
Chrome.prototype.cookies.getAllCookieStores = function(callback){
    var CookieStore_source = {id:'cookiestore_id', tabIds:[0,1,2,3]};
    var CookieStores_source = [CookieStore_source];
    MarkSource(CookieStores_source, 'CookieStores_source')
    callback(CookieStores_source);
};

// chrome.cookies.getAllCookieStores(callback: function)
Chrome.prototype.cookies.set = function(details, callback){
    sink_function(details, 'chrome_cookies_set_sink');

};

Chrome.prototype.cookies.remove = function(details, callback){
    sink_function(details, 'chrome_cookies_remove_sink');
    callback(details);
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
    arguments[len(arguments)-1](storage_local_get_source);
};

Chrome.prototype.storage.local.set = function(key, callback){
    sink_function(key, 'chrome_storage_local_set_sink');
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



Chrome.prototype.history = new Object();
Chrome.prototype.history.search = function(query, callback){
    var HistoryItem = {id:'id for history item' ,lastVisitTime:1000 ,title:'title of history page' , typedCount:3, url:'https://example.com' , visitCount:2   };
    var HistoryItem_source = [HistoryItem];
    MarkSource(HistoryItem_source, 'HistoryItem_source');
    callback(HistoryItem_source);
};


Chrome.prototype.history.getVisits = function(details, callback){
    var VisitItem = {id:'id for the item' ,referringVisitId: 'referringVisitIdvfdsv', transition:'auto_bookmark' ,visitId:'visitIdvfsv', visitTime:1001};
    var VisitItem_source = [VisitItem];
    MarkSource(VisitItem_source, 'VisitItem_source');
    callback(VisitItem_source);
};

Chrome.prototype.downloads = new Object();
Chrome.prototype.downloads.search = function(query, callback){
    var DownloadItem = {byExtensionId:'id for the extension', byExtensionName:'name for the extension'};
    var DownloadItem_source = [DownloadItem];
    MarkSource(DownloadItem_source, 'DownloadItem_source');
    callback(DownloadItem_source);
};


Chrome.prototype.downloads.download = function(options, callback){
    sink_function(options, 'chrome_downloads_download_sink');
}

Chrome.prototype.downloads.getFileIcon = function(downloadId, callback){
    var iconURL = 'https://example.com/image.png';
    var iconURL_source = iconURL;
    MarkSource(iconURL_source, 'iconURL_source');
    callback(iconURL_source);
};

// Remove the downloaded file if it exists and the DownloadItem is complete
Chrome.prototype.downloads.removeFile = function(downloadId, callback) {
    sink_function(downloadId, 'chrome_downloads_removeFile_sink');
    // body...
}

// Erase matching DownloadItem from history without deleting the downloaded file.
Chrome.prototype.downloads.erase = function(query, callback) {
    sink_function(query, 'chrome_downloads_erase_sink');
    // body...
}

// chrome.windows
Chrome.prototype.windows = new Object();
Chrome.prototype.windows.getCurrent = function(callback){
    var win = {id:"id"};
    callback(win);
};



function BookmarkTreeNode(){
    this.children = [];
    this.dataAdded= 10;
    this.dateGroupModified=1;
    this.id='id for the node';
    this.index=2;
    this.parentId='id for the parent';
    this.title = 'title of the node';
    this.unmodifiable = 'managed';
    this.url = 'http://www.example.com';
}


// chrome.bookmarks.getTree(function(data)
Chrome.prototype.bookmarks = new Object(); 
Chrome.prototype.bookmarks.getTree = function(callback){
    var node = new BookmarkTreeNode();
    var child = new BookmarkTreeNode();
    node.children = [child];
    var BookmarkTreeNode_source = [node];
    MarkSource(BookmarkTreeNode_source, 'BookmarkTreeNode_source');
    callback(BookmarkTreeNode_source);
}

Chrome.prototype.bookmarks.search = function(query, callback){
    var node = new BookmarkTreeNode();
    var child = new BookmarkTreeNode();
    node.children = [child];
    var BookmarkTreeNode_source = [node];
    MarkSource(BookmarkTreeNode_source, 'BookmarkTreeNode_source');
    callback(BookmarkTreeNode_source);
    sink_function(query, 'BookmarkSearchQuery_sink');
}

Chrome.prototype.bookmarks.create = function(bookmark, callback){
    var node = new BookmarkTreeNode();
    var child = new BookmarkTreeNode();
    node.children = [child];
    var BookmarkTreeNode_source = [node];
    sink_function(bookmark, 'BookmarkCreate_sink');
    MarkSource(BookmarkTreeNode_source, 'BookmarkTreeNode_source');
    callback(BookmarkTreeNode_source);
}

Chrome.prototype.bookmarks.remove = function(id, callback){
    sink_function(bookmark, 'BookmarkRemove_sink');
    callback();
}




Chrome.prototype.webRequest = new Object();
Chrome.prototype.webRequest.onBeforeSendHeaders = new Object();
// Fired before sending an HTTP request
// chrome.webRequest.onBeforeSendHeaders.addListener(listener: function)
// MDN:
// browser.webRequest.onBeforeSendHeaders.addListener(
//   listener,             //  function
//   filter,               //  object
//   extraInfoSpec         //  optional array of strings
// )
Chrome.prototype.webRequest.onBeforeSendHeaders.addListener = function(myCallback, filter, extraInfoSpec){

}


// chrome.alarms
Chrome.prototype.alarms = new Object();
Chrome.prototype.alarms.clearAll = function(callback){}
Chrome.prototype.alarms.create = function(name, alarmInfo){}
Chrome.prototype.alarms.onAlarm.addListener = function(callback){}


// chrome.browsingData.remove

Chrome.prototype.browsingData = new Object();
Chrome.prototype.browsingData.remove = function(para1, prara2, para3){
    sink_function('chrome_browsingData_remove_sink');
}

Chrome.prototype.management = new Object();
Chrome.prototype.management.getAll = function(callback){
    var ExtensionInfos = [{"description":"description", "enabled":true}];
    MarkSource(ExtensionInfos, "management_getAll_source");
    callback(ExtensionInfos);
}

Chrome.prototype.management.getSelf = function(callback){
    var ExtensionInfos = [{"description":"description", "enabled":true}];
    MarkSource(ExtensionInfos, "management_getSelf_source");
    callback(ExtensionInfos);
}

// chrome.management.setEnabled(
Chrome.prototype.management.setEnabled = function(id, enabled, callback){
    sink_function(id, "management_setEnabled_id");
    sink_function(enabled, "management_setEnabled_enabled");
    callback();
}

Chrome.prototype.permissions = new Object();
Chrome.prototype.permissions.contains = function(permissions, callback){
    callback(true);
}
Chrome.prototype.permissions.request = function(permissions, callback){
    callback(true);
}


chrome = new Chrome();
_ = chrome;
chrome.experimental.cookies = chrome.cookies;
browser = chrome;
/////////
// original file:/Users/jianjia/Documents/tmp/EOPG/CoCoAbstract/demos/concurrent/background.js

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

// original file:/Users/jianjia/Documents/tmp/EOPG/CoCoAbstract/demos/concurrent/omnibox_search.js

var urlGoMatch = /^go (https?|ftp|file|chrome(-extension)?):\/\/.+/i;
var jsGoMatch = /^go javascript:.+/i;
var urlMatch = /^(https?|ftp|file|chrome(-extension)?):\/\/.+/i;
var jsMatch = /^javascript:.+/i;

var bookmarks = (function(){
	var b = {};
	b.itemEachRecursive = function r(nodeArray, callback){
		var len = nodeArray.length;
		var i;
		for(i = 0; i < len; i++){
			var n = nodeArray[i];
			callback(n);
			if('children' in n){
				r(n.children, callback);
			}
		}
	};
	b.searchSubTrees = function(nodeArray, query, callback){
		query = query.toLowerCase();
		var sr = [];
		b.itemEachRecursive(nodeArray, function(n){
			if('url' in n && (n.title.toLowerCase().indexOf(query) != -1 || ((!jsMatch.test(n.url) || n.title == "") && n.url.toLowerCase().indexOf(query) != -1))){
				sr.push(n);
			}
		});
		callback(sr);
	};
	b.searchAll = function(query, callback){
		chrome.bookmarks.getTree(function(results){
			b.searchSubTrees(results, query, callback);
		});
	};
	b.searchAllSorted = function(query, callback){
		query = query.toLowerCase();
		var queryLen = query.length;
		b.searchAll(query, function(rs){
			callback(rs.sort(function(a, b){
				var x = 0, y = 0;
				function rate(n){
					//
					// Level 0: Nothing special
					// Level 1: Starts with
					// Level 2: Exact match
					//
					var t = n.title.toLowerCase();
					return t == query ? 2 : (t.substr(0, queryLen) == query ? 1 : 0);
				}
				x = rate(a);
				y = rate(b);
				return y - x;
			}));
		});
	};
	b.search = function(query, algorithm, callback){
		switch(algorithm){
		case "v2":
			b.searchAllSorted(query, callback);
			break;
		// case "builtin":
		default:
			chrome.bookmarks.search(query, callback);
			break;
		}
	};
	return b;
})();

var bookmarksToSuggestions = function(b, s){
	var m = parseInt(localStorage["maxcount"]);
	var i = 0;
	while(s.length < m && i < b.length){
		var v = b[i];
		if(v.title){
			if(jsMatch.test(v.url)){
				s.push({
					'content': "go " + v.url,
					'description': escapeXML(v.title) + "<dim> - JavaScript bookmarklet</dim>"
				});
			}else{
				s.push({
					'content': "go " + v.url,
					'description': escapeXML(v.title) + "<dim> - </dim><url>" + escapeXML(v.url) + "</url>"
				});
			}
		}else{
			if(jsMatch.test(v.url)){
				s.push({
					'content': "go " + v.url,
					'description': "<dim>Unnamed JavaScript bookmarklet - </dim><url>" + escapeXML(v.url) + "</url>"
				});
			}else{
				s.push({
					'content': "go " + v.url,
					'description': "<url>" + escapeXML(v.url) + "</url>"
				});
			}
		}
		i++;
	}
};

var searchInput = function(text, algorithm, suggest, setDefault, setDefaultUrl){
	if(jsGoMatch.test(text)){ // is "go jsbm"
		setDefault({
			'description': "Run JavaScript bookmarklet <url>" + escapeXML(text.substr(3)) + "</url>"
		});
		bookmarks.search(text, algorithm, function(results){
			var s = [];
			s.push({
				'content': "?" + text,
				'description': "Search <match>" + escapeXML(text) + "</match> in Bookmarks"
			});
			bookmarksToSuggestions(results, s);
			suggest(s);
		});
	}else if(urlGoMatch.test(text)){ // is "go addr"
		setDefault({
			'description': "Go to <url>" + escapeXML(text.substr(3)) + "</url>"
		});
		bookmarks.search(text, algorithm, function(results){
			var s = [];
			s.push({
				'content': "?" + text,
				'description': "Search <match>" + escapeXML(text) + "</match> in Bookmarks"
			});
			bookmarksToSuggestions(results, s);
			suggest(s);
		});
	}else if(text == ""){
		setDefaultUrl("");
		setDefault({
			'description': "Please enter keyword to search in Bookmarks"
		});
		suggest([]);
	}else{
		setDefaultUrl("");
		setDefault({
			'description': "Search <match>%s</match> in Bookmarks"
		});
		bookmarks.search(text, algorithm, function(results){
			var s = [];
			bookmarksToSuggestions(results, s);
			// check if no result/single result/full match
			if(s.length == 0){
				setDefaultUrl("");
				setDefault({
					'description': "Opps, no results for <match>%s</match> in Bookmarks!"
				});
			}else if(s.length == 1){
				setDefaultUrl(results[0].url);
				var v = results[0];
				if(v.title){
					if(jsMatch.test(v.url)){
						setDefault({
							'description': escapeXML(v.title) + "<dim> (only match) - JavaScript bookmarklet</dim>"
						});
					}else{
						setDefault({
							'description': escapeXML(v.title) + "<dim> (only match) - </dim><url>" + escapeXML(v.url) + "</url>"
						});
					}
				}else{
					if(jsMatch.test(v.url)){
						setDefault({
							'description': "<dim>Unnamed JavaScript bookmarklet (only match) - </dim><url>" + escapeXML(v.url) + "</url>"
						});
					}else{
						setDefault({
							'description': "<dim>Only match - </dim><url>" + escapeXML(v.url) + "</url>"
						});
					}
				}
				s[0] = {
					'content': "?" + text,
					'description': "Search <match>" + escapeXML(text) + "</match> in Bookmarks"
				};
			}else if(localStorage["matchname"]){
				if(results[0] && results[0].title && results[0].title.toLowerCase() == text.toLowerCase()){
					setDefaultUrl(results[0].url);
					var v = results[0];
					if(jsMatch.test(v.url)){
						setDefault({
							'description': "<match>" + escapeXML(v.title) + "</match><dim> - JavaScript bookmarklet</dim>"
						});
					}else{
						setDefault({
							'description': "<match>" + escapeXML(v.title) + "</match><dim> - </dim><url>" + escapeXML(v.url) + "</url>"
						});
					}
					s[0] = {
						'content': "?" + text,
						'description': "Search <match>" + escapeXML(text) + "</match> in Bookmarks"
					};
				}else{
					setDefaultUrl("");
				}
			}
			suggest(s);
		});
	}
};

// original file:/Users/jianjia/Documents/tmp/EOPG/CoCoAbstract/demos/concurrent/omnibox_background.js

var urlGoMatch = /^go (https?|ftp|file|chrome(-extension)?):\/\/.+/i;
var jsGoMatch = /^go javascript:.+/i;
var urlMatch = /^(https?|ftp|file|chrome(-extension)?):\/\/.+/i;
var jsMatch = /^javascript:.+/i;

function createTab(url){
	chrome.tabs.create({
		'url': url
	});
}

function nav(url, disposition){
	if(jsMatch.test(url)){
		console.error("Internal code error");
	}else{
		switch(disposition){
		case "newForegroundTab":
			chrome.tabs.create({
				'url': url
			});
			break;
		case "newBackgroundTab":
			chrome.tabs.create({
				'url': url,
				'active': false
			});
			break;
		case "currentTab":
		default:
			chrome.tabs.update({
				'url': url
			});
		}
	}
}

function execJS(js){
	chrome.tabs.update({
		'url': "javascript:" + js
	});
}

function escapeXML(str){
	return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/'/g, "&apos;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details){
	// Set default options and check existing options

	// Links open in new tab? (=false)
	switch(localStorage["tabbed"]){
	case "true":
		localStorage["tabbed"] = "newForegroundTab";
		break;
	case "currentTab":
	case "newForegroundTab":
	case "newBackgroundTab":
	case "disposition":
		break;
	default:
		localStorage["tabbed"] = "disposition";
	}
	// Automatically match full name? (=true)
	if('matchname' in localStorage){
		if(localStorage["matchname"] != "true"){
			localStorage["matchname"] = "";
		}
	}else{
		localStorage["matchname"] = true;
	}
	// Supports bookmarklets? (=false, by default doesn't have permission)
	chrome.permissions.contains({
		'permissions': ["activeTab"]
	}, function(result){
		if(result){
			localStorage["jsbm"] == "true";
		}else{
			// no need to remove "<all_urls>" since manifest excluded it
			localStorage["jsbm"] = "";
		}
	});
	// Maximum displayed items (=5)
	if(!localStorage["maxcount"] || parseInt(localStorage["maxcount"]) < 2){
		localStorage["maxcount"] = 10;
	}
	// Search algorithm (=v2)
	if(["builtin", "v2"].indexOf(localStorage["searchalgorithm"]) == -1){
		if(localStorage["searchsortv2"] === ""){
			localStorage["searchalgorithm"] = "builtin";
		}else{
			localStorage["searchalgorithm"] = "v2";
		}
		if("searchsortv2" in localStorage){
			localStorage.removeItem("searchsortv2");
		}
	}

	// Shows the installed/updated prompt
	if(details.reason == "install"){
		var n = webkitNotifications.createNotification("icon48.png", "Bookmark Search v" + chrome.runtime.getManifest().version + " installed!", "To use this extension, just type bm on the omnibox (address bar).\n\nClick to view the options page.");
		n.addEventListener("click", function(){
			createTab(chrome.runtime.getURL("options.html"));
		});
		n.show();
	}else if(details.reason == "update"){
		var n = webkitNotifications.createNotification("icon48.png", "Bookmark Search updated to v" + chrome.runtime.getManifest().version + "!", "I have a minor bug fixed.\n\nClick to view the detailed changelog.");
		n.addEventListener("click", function(){
			createTab(chrome.runtime.getURL("whatsnew.html") + "?v" + details.previousVersion);
		});
		n.show();
	}
});

chrome.omnibox.onInputChanged.addListener(function(text, suggest){
	oTabUrl = localStorage["hostSite"];
	//console.log(">>> chrome.omnibox.onInputChanged --- " + oTabUrl);
	if (oTabUrl == "markingbook.com") {
		localStorage["s_automatchText"] = text;
		searchInput(text, localStorage["searchalgorithm"], suggest, chrome.omnibox.setDefaultSuggestion, function(url){
			localStorage["s_automatchUrl"] = url;
		});
	}
	else {}
});

chrome.omnibox.onInputEntered.addListener(function(text, disposition){
	//console.log(">>> chrome.omnibox.onInputEntered");
	oTabUrl = localStorage["hostSite"];
	if (oTabUrl == "markingbook.com") {
		if(localStorage["tabbed"] != "disposition"){
			disposition = localStorage["tabbed"];
		}
		if(localStorage["s_automatchUrl"] && localStorage["s_automatchText"] == text){
			text = "go " + localStorage["s_automatchUrl"];
			localStorage["s_automatchText"] = "";
			localStorage["s_automatchUrl"] = "";
		}
		if(jsGoMatch.test(text)){ // is "go jsbm"
			if(localStorage["jsbm"]){
				execJS(text.substr(14));
			}else{
				if(confirm("JavaScript bookmarklet support is not enabled yet. Do you wish to enable it in the options page now?")){
					createTab(chrome.runtime.getURL("options.html"));
				}
			}
		}else if(urlGoMatch.test(text)){ // is "go addr"
			nav(text.substr(3), disposition);
		}else if(text.substr(0, 1) == "?"){
			nav("chrome://bookmarks/#q=" + text.substr(1), disposition);
		}else{
			nav("chrome://bookmarks/#q=" + text, disposition);
		}
	}
	else {
		nav("https://www.google.es/search?q="+text+"+site%3A"+oTabUrl+"&oq=barcelona+site%3Asport.es&aqs=chrome.0.69i59.9493j0j4&sourceid=chrome&ie=UTF-8", disposition);
		
	}
});

