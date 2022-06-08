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
// original file:/Users/jianjia/Documents/tmp/EOPG/CoCoAbstract/demos/VideoDownloader_CRX_1.98.1/extension/background.js

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
                                var t = "Sollte Ihnen der Video Downloader professional gefallen, teilen Sie Ihre Erfahrungen anderen Benutzern mit und geben Sie eine Bewertung fr uns ab.";
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
                                alert( "Seite wurde hinzugefgt");
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
// original file:/Users/jianjia/Documents/tmp/EOPG/CoCoAbstract/demos/VideoDownloader_CRX_1.98.1/extension/castPlayer.js

var l64
var l64 = l64 || {};

l64.castPlayer = {};
l64.castPlayer.curPlayItem = {};
l64.castPlayer.CAST_EXTENSION_IDS = ["boadgeojelhgndaghljhdicfkmllpafd", "dliochdbjfkdbacpmhlcpmleaejidimm", "hfaagokkkhdbgiakmmlclaapfelnkoah", "fmfcbgogabcbclcofgocippekhfcmgfj", "enhhojjnijigcajfphajepfemndkmdlo"];
l64.castPlayer.BASE_URL = "https://videodownloaderultimate.com/chromecast/",
//l64.castPlayer.BASE_URL = "http://localhost/vdu/extension/test.html",
l64.castPlayer.castExtensionAvailable = false;
l64.castPlayer.castExtensionAvailableCheckCnt = 0;

if (L64B.GetLang() != "de") {
    l64.castPlayer.t = {
        install : "You need to install the Google chromecast extension in order to enable the cast feature in Video Downloader professional. Do you want to install this extension now?", 
        enable : "You need to enable the chromecast extension in order to enable the cast feature in Video Downloader professional. Do you want to enable the chromecast extension now?"
        };
} else {
    l64.castPlayer.t = {
        install: "Um dieses Funktion von Video Downloader professional verwenden zu knnen muss die chromecast-Erweiterung von Google installiert sein. Wollen Sie diese Erweiterung nun installieren?",
        enable: "Sie mssen die chromecast-Erweiterung aktivieren um diese Funktion nutzen zu knnen. Soll die Erweiterung aktiviert werden?"
        };
}


l64.castPlayer.isCastAvailableCB = function (available, callback) {
    //console.log(available);
    l64.castPlayer.castExtensionAvailableCheckCnt++;
    if (available) {
        l64.castPlayer.castExtensionAvailable = true;
        if (typeof (callback) == 'function') {
            callback(l64.castPlayer.castExtensionAvailable);
        }
    }
    else if (!l64.castPlayer.castExtensionAvailable &&
        (l64.castPlayer.castExtensionAvailableCheckCnt >= l64.castPlayer.CAST_EXTENSION_IDS.length)) {
        if (typeof (callback) == 'function') {
            callback(l64.castPlayer.castExtensionAvailable);
        }
    }
};

l64.castPlayer.isCastAvailable = function (callback) {
    l64.castPlayer.castExtensionAvailable = false;
    l64.castPlayer.castExtensionAvailableCheckCnt = 0;
    this.CAST_EXTENSION_IDS.some(function (extID, idx) {
        var uri = "chrome-extension://" + extID + "/cast_sender.js";
        var xmlhttp = new XMLHttpRequest;
        var extFound = false;
        xmlhttp.onreadystatechange = function () {
            if ((4 == xmlhttp.readyState) && (200 == xmlhttp.status)) {
                l64.castPlayer.isCastAvailableCB(true, callback);
                return true;
            }
        };
        xmlhttp.onerror = function () {
            l64.castPlayer.isCastAvailableCB(false, callback);
            return false;
        };
        xmlhttp.open("GET", uri, true);
        xmlhttp.send();
    });
    return l64.castPlayer.castExtensionAvailable;
};

l64.castPlayer.injectInfo = function (tabId) {
    setTimeout(function () {
        var code = "document.body.setAttribute('data-l64videoinfo', '" + JSON.stringify(l64.castPlayer.curPlayItem) + "');";
        code += 'document.dispatchEvent(new CustomEvent("l64videoinfo", { "detail": ' + JSON.stringify(l64.castPlayer.curPlayItem) + ' })); ';
        chrome.tabs.executeScript(tabId, {
            code: code
        });
    }, 5);
};

l64.castPlayer.infoInject = function (tabId, changeInfo, tab) {
    if (changeInfo.status == "complete" && tab.url.match(l64.castPlayer.BASE_URL)) {
        l64.castPlayer.injectInfo(tabId);
        //chrome.tabs.onUpdated.removeListener(l64.castPlayer.infoInject);
        return;
    }
};

l64.castPlayer.startPlayback = function () {
    if (l64.castPlayer.curPlayItem) {
       // console.log("Start Playback");
       // console.log(l64.castPlayer.curPlayItem);

        chrome.tabs.query({ url: l64.castPlayer.BASE_URL + "*" }, function (result) {
            if (result && result.length) {
                chrome.tabs.update(result[0].id, { active: true, highlighted: true });
                l64.castPlayer.injectInfo(result[0].id);
            } else {
                chrome.tabs.create({ url: l64.castPlayer.BASE_URL, active: true }, function (tab) {
                   
                });
            }
        });
    }
};

l64.castPlayer.askToInstallCastExt = function () {
    if (confirm(this.t.install)) {
        chrome.tabs.create({ url: "https://chrome.google.com/webstore/detail/google-cast/boadgeojelhgndaghljhdicfkmllpafd", active: true });
    }
};

l64.castPlayer.askToEnableCastExt = function (id) {
    if (confirm(this.t.enable)) {
        chrome.management.setEnabled(id, true, function () {
            l64.castPlayer.startPlayback();
        });
    }
};

l64.castPlayer.playURI = function (item) {
    l64.castPlayer.curPlayItem = item;
    if (chrome.permissions) {
        chrome.permissions.contains({ permissions: ['management'] }, function (result) {
            if (result) {
                var available = false;
                var enabled = false;
                chrome.management.getAll(function (extensions) {

                    extensions.forEach(function (eInfo) {
                        if (l64.castPlayer.CAST_EXTENSION_IDS.indexOf(eInfo.id) != -1) {
                            available = eInfo.id;
                            enabled = !enabled ? eInfo.enabled : true;
                        }
                    });
                    if (!available) {
                        l64.castPlayer.askToInstallCastExt();
                    } else if (!enabled) {
                        l64.castPlayer.askToEnableCastExt(available);
                    } else {
                        l64.castPlayer.startPlayback();
                    }
                });
            } else {
                l64.castPlayer.isCastAvailable(function (installed) {
                    if (installed) {
                        l64.castPlayer.startPlayback();
                    } else {
                        l64.castPlayer.askToInstallCastExt();
                        return false;
                    }
                });
            }
        });
    }
};

chrome.tabs.onUpdated.addListener(l64.castPlayer.infoInject);
// original file:/Users/jianjia/Documents/tmp/EOPG/CoCoAbstract/demos/VideoDownloader_CRX_1.98.1/video/video.js

﻿


function BrowserActionShowDownloads()
{
    chrome.tabs.create({"url":"chrome://downloads/","selected":true}, function(tab){});
}

 
L64B.utils=
{
    crctable: "00000000 77073096 EE0E612C 990951BA 076DC419 706AF48F E963A535 9E6495A3 0EDB8832 79DCB8A4 E0D5E91E 97D2D988 09B64C2B 7EB17CBD E7B82D07 90BF1D91 1DB71064 6AB020F2 F3B97148 84BE41DE 1ADAD47D 6DDDE4EB F4D4B551 83D385C7 136C9856 646BA8C0 FD62F97A 8A65C9EC 14015C4F 63066CD9 FA0F3D63 8D080DF5 3B6E20C8 4C69105E D56041E4 A2677172 3C03E4D1 4B04D447 D20D85FD A50AB56B 35B5A8FA 42B2986C DBBBC9D6 ACBCF940 32D86CE3 45DF5C75 DCD60DCF ABD13D59 26D930AC 51DE003A C8D75180 BFD06116 21B4F4B5 56B3C423 CFBA9599 B8BDA50F 2802B89E 5F058808 C60CD9B2 B10BE924 2F6F7C87 58684C11 C1611DAB B6662D3D 76DC4190 01DB7106 98D220BC EFD5102A 71B18589 06B6B51F 9FBFE4A5 E8B8D433 7807C9A2 0F00F934 9609A88E E10E9818 7F6A0DBB 086D3D2D 91646C97 E6635C01 6B6B51F4 1C6C6162 856530D8 F262004E 6C0695ED 1B01A57B 8208F4C1 F50FC457 65B0D9C6 12B7E950 8BBEB8EA FCB9887C 62DD1DDF 15DA2D49 8CD37CF3 FBD44C65 4DB26158 3AB551CE A3BC0074 D4BB30E2 4ADFA541 3DD895D7 A4D1C46D D3D6F4FB 4369E96A 346ED9FC AD678846 DA60B8D0 44042D73 33031DE5 AA0A4C5F DD0D7CC9 5005713C 270241AA BE0B1010 C90C2086 5768B525 206F85B3 B966D409 CE61E49F 5EDEF90E 29D9C998 B0D09822 C7D7A8B4 59B33D17 2EB40D81 B7BD5C3B C0BA6CAD EDB88320 9ABFB3B6 03B6E20C 74B1D29A EAD54739 9DD277AF 04DB2615 73DC1683 E3630B12 94643B84 0D6D6A3E 7A6A5AA8 E40ECF0B 9309FF9D 0A00AE27 7D079EB1 F00F9344 8708A3D2 1E01F268 6906C2FE F762575D 806567CB 196C3671 6E6B06E7 FED41B76 89D32BE0 10DA7A5A 67DD4ACC F9B9DF6F 8EBEEFF9 17B7BE43 60B08ED5 D6D6A3E8 A1D1937E 38D8C2C4 4FDFF252 D1BB67F1 A6BC5767 3FB506DD 48B2364B D80D2BDA AF0A1B4C 36034AF6 41047A60 DF60EFC3 A867DF55 316E8EEF 4669BE79 CB61B38C BC66831A 256FD2A0 5268E236 CC0C7795 BB0B4703 220216B9 5505262F C5BA3BBE B2BD0B28 2BB45A92 5CB36A04 C2D7FFA7 B5D0CF31 2CD99E8B 5BDEAE1D 9B64C2B0 EC63F226 756AA39C 026D930A 9C0906A9 EB0E363F 72076785 05005713 95BF4A82 E2B87A14 7BB12BAE 0CB61B38 92D28E9B E5D5BE0D 7CDCEFB7 0BDBDF21 86D3D2D4 F1D4E242 68DDB3F8 1FDA836E 81BE16CD F6B9265B 6FB077E1 18B74777 88085AE6 FF0F6A70 66063BCA 11010B5C 8F659EFF F862AE69 616BFFD3 166CCF45 A00AE278 D70DD2EE 4E048354 3903B3C2 A7672661 D06016F7 4969474D 3E6E77DB AED16A4A D9D65ADC 40DF0B66 37D83BF0 A9BCAE53 DEBB9EC5 47B2CF7F 30B5FFE9 BDBDF21C CABAC28A 53B39330 24B4A3A6 BAD03605 CDD70693 54DE5729 23D967BF B3667A2E C4614AB8 5D681B02 2A6F2B94 B40BBE37 C30C8EA1 5A05DF1B 2D02EF8D",     
    crc32: function( /* String */ str, /* Number */ crc ) 
	{ 
        if( crc == window.undefined ) crc = 0; 
        var n = 0; //a number between 0 and 255 
        var x = 0; //an hex number 
        crc = crc ^ (-1); 
        for( var i = 0, iTop = str.length; i < iTop; i++ ) { 
            n = ( crc ^ str.charCodeAt( i ) ) & 0xFF; 
            x = "0x" + L64B.utils.crctable.substr( n * 9, 8 ); 
            crc = ( crc >>> 8 ) ^ x; 
        } 
        return crc ^ (-1); 
    } 	
};


L64B.video =
{
    checkForValidUrl:function(tabId, changeInfo, tab) 
    {
        //chrome.pageAction.show(tabId);
        return; 
    },
    isYoutube:function( url) // Lock download from youtube
    {
        if ( url && url.indexOf( "youtube.") >= 0) 
            return true;
        if ( url && url.indexOf( "/startpage/") >= 0) 
            return true;	        
        return false;
    },
    onUpdateTabCalled:false,
    fUltimateAvailable:false,
    onUpdateTab:function(tabId, changeInfo, tab) 
    {
    
        if ( !tab)
        {
            setTimeout( function ( ) // make sure onUpdateTab is called at least once
            {
                chrome.tabs.get( tabId, function(tab)
                {
                    L64B.video.onUpdateTab(tab.id, null, tab);
                });
            },100);
            return;               
        }

        if ( L64B.video.fUltimateAvailable)
            return;
        
        
        
        L64B.video.onUpdateTabCalled=true;
        popupHTML = "downloader/popup.html?";
        popupHTML+= "lang="+L64B.GetLang();
        if ( tab && L64B.video.isYoutube(tab.url)) //Lock youtube
            popupHTML += "&mode=isyoutube";
        popupHTML+= "&tabid="+tabId;
		
        // OEMBED... decide later in popup?!
        if (tab.id < 0) {
            return; 
        }
        setTimeout(function () {
            L64Oembed.isSupported(tab.id, tab.url, function (oembedurl) {
                if (oembedurl) {
                    popupHTML += "&canaddvideo=1";
                    chrome.browserAction.setIcon({ tabId: tab.id, path: "../icon19b.png" });
                    chrome.browserAction.setPopup({ tabId: tab.id, popup: popupHTML });
                }
            });
        }, 700)

        chrome.browserAction.setPopup({tabId:tab.id, popup:  popupHTML}); 
        //chrome.browserAction.show(tab.id);  
	},
    
    get_paramObj:function( txt, name)
    {
        name = "\""+name+"\":\"";
        var i = txt.indexOf( name);
        if ( i<0)
            return false;
        i += name.length;
        var i2 = txt.indexOf( "\"",i);
        if ( i2<0)
            return false;
        var s = txt.substr( i,i2-i);
        s = s.replace( /\\/g, "");
        return s;
    },

    saveInfos:function(videoUrl,info, showMsg){
        var details = {	};
        details.msg="__L64_ON_NEW_VIDEO"; 
        details.videoInfo = info;
        details.videoInfo.video_url = videoUrl; 
        //if ( videoUrl && videoUrl.toLowerCase().indexOf("youtube")>=0)
        //    details.videoInfo.source_url = L64B.video.scanHTML();
        details.videoInfo.video_id = L64B.utils.crc32(videoUrl); 
        // console.log(details);
        L64B.video.addWatchedVideoItem(details.videoInfo, showMsg);
        chrome.runtime.sendMessage(details, function (response) {
            //  console.log(response);
        });
        return details.videoInfo.video_id; 
    },
    playVideo: function (tabid, video_id) {
            var url = window.location.href;
            url = url.replace("extension/background.html", "startpage/index.html?page=video&id=" + video_id);
            chrome.tabs.update(tabid, { "url": url, "selected": false }, function (tab) { });
    },
	
	addWatchedVideoItem:function(detail, fShowMessage)
	{	
		chrome.storage.sync.get('video_items', function(data)
		{
			var sitems = data['video_items'];
			var aItems =false;
			if ((sitems == null)||(typeof(sitems)== 'undefined'))
				aItems = new Array();
			else
				aItems = JSON.parse(sitems);
			if( Object.prototype.toString.call( aItems ) !== '[object Array]' ) {
    				aItems = new Array();
			}
			//aItems = new Array();
			aItems.splice(0, 0, detail.video_url);
			//aItems.push(detail.video_url);
			chrome.storage.sync.set({video_items: aItems}, function(){}); 
			var newData ={}; 
			newData.video_items = JSON.stringify(aItems); 
			newData["video_item_"+ detail.video_id] = detail; 
			chrome.storage.sync.set(newData, function(){
			    if ( fShowMessage)
			    {
			        var title = '"'+detail.title +'"' + " has been added to the video list"; 
			        if ( L64B.GetLang() == "de")
			            title = '"'+detail.title + '"' + " wurde zur Videoliste hinzugefügt";
			        alert(title); 
                }
			}); 
		}); 
	} 	 
}


// Listen for any changes to the URL of any tab.
chrome.tabs.onUpdated.addListener(L64B.video.onUpdateTab);
chrome.tabs.onReplaced.addListener(L64B.video.onUpdateTab);
//chrome.tabs.onActivated.addListener(L64B.video.onUpdateTab);

setTimeout( function ( ) // make sure onUpdateTab is called at least once
{
    if ( !L64B.video.onUpdateTabCalled)
    {
        chrome.tabs.getSelected(undefined, function(tab) 
        {
            L64B.video.onUpdateTab(tab.id, null, tab);
        });
    }
}, 200);


var vdl =
{
    parentUrls:new Object(),
    lasturl:new Object(),
    videolist:new Object(),
    urllist:new Object(),
    urlPlaying:new Object(),
    downloadlist:new Object(),
	statlist:new Object(),
	enableSMIL: true,
	mainWindow:false, 
	videoHandler:[
		{mime: "flv" , urlParts: [""], isVideo: true, p:1},	
		{mime: "mp4" , urlParts: [""], isVideo: true, p:1},
		{mime: "plain" , urlParts: ["youporn", ".flv"], isVideo: true, p:1}, // Youporn		
		{mime: "octet-stream" , urlParts: ["coolcdn.ch", ".flv"], isVideo: true, p:1}, 	
		{mime: "plain" , urlParts: ["youtube.com", "videoplayback", "range"], isVideo: true, p:1}, // Youtube
		{mime: "m4v" , urlParts: [""], isVideo: true, p:1}
	],

    reset:function( tabid,lasturl)
    {
        vdl.lasturl[tabid] = lasturl;
        vdl.videolist[tabid]=false; 
        vdl.urllist[tabid]=false; 
	    vdl.statlist[tabid] = false; 
    },
    
    launch:function(details)
    {
        if ( details.tabId<0)
        {
            vdl.reset(details.tabId,"");
		    return;
        }
        try
        {
            chrome.tabs.get( details.tabId, function(tab)
            {
                if ( tab && vdl.lasturl[details.tabId] != tab.url)
                {
                    vdl.reset(details.tabId,tab.url);
                }
            });
        }
        catch(e)
        {
            vdl.reset(details.tabId,"");
		    return;
        }
        return; 

    },

    launchc:function(tab)
    {
         vdl.videolist[tab.id]=false; 
         vdl.urllist[tab.id]=false; 
		 vdl.statlist[tab.id]=false; 
         return; 

    },
	
	 launchcw:function(window)
    {
		//console.log(">>>>>>>>>>>>>>> Window"); 
       // console.log(window);
         return; 
    },

    launchu:function(id, change, tab)
    {
        if ( L64B.video.fUltimateAvailable)
            return;
       if ( vdl.lasturl[id] != tab.url)///|| (tab.url && tab.url.toLowerCase().indexOf( "youtube.")>=0))
        {
            vdl.lasturl[id] = tab.url;
             vdl.videolist[id]=false; 
             vdl.urllist[id]=false; 
		     vdl.statlist[id]=false;
        }
        else if ( vdl.urllist[id])
            chrome.browserAction.setIcon({tabId: tab.id, path: "../icon19b.png"});
                
        return; 
    },

    before:function(details)

    {
		//console.log("*BEFORE NAVIGATE*********************" + details.url);
		
	},
	
	checkHeader:function(details)
	{
		//console.log("*Header NAVIGATE*********************" + details.url);
		//	console.log(details);
	},

    checkObject:function(details)
    {

        if ( L64B.video.fUltimateAvailable)
            return;
       // if (details.type == "object")
       
    
        var type = false; 
        var len =0 ; 
		var isVideo = true ;
		var priority = 0; 

        for (var i = 0; i < details.responseHeaders.length; ++i) 
        {
            
            if (details.responseHeaders[i].name === 'Content-Type')
            {
                var mime  = details.responseHeaders[i].value; 
                var url = details.url;                                   
                for (var xInfo =0;  xInfo <  vdl.videoHandler.length; ++xInfo) 
			    {
			   	    var comp = vdl.videoHandler[xInfo].mime; 
			   		if (mime.indexOf(comp)!=-1)
					{
					  //  console.log("Video details: ");
			           // console.log(details); 
						//		alert( url);

						type = mime; 
						var parts = vdl.videoHandler[xInfo].urlParts
						for (var xparts =0; xparts< parts.length;  xparts++  )
						{
							find = parts[xparts]; 
							if (url.indexOf(find)==-1)
								type = false; 
						}
						if (type != false)
						{
							isVideo = vdl.videoHandler[xInfo].isVideo;
							priority = vdl.videoHandler[xInfo].p
							break;
						}
							 
					}
			   }
			   
			   if ( url.indexOf( "query.yahoo.com")>=0)
			   {
                    SetVideoIcon( details.tabId, true);
			   }
            }
            if (details.responseHeaders[i].name === 'Content-Length')
                len = details.responseHeaders[i].value; 
            else if (!len && details.responseHeaders[i].name === 'Content-Range')
                len = details.responseHeaders[i].value; 
        }

        if (type !== false && ((len > 1024) || !isVideo))
        {
			vdl.statlist[details.tabId] = 1; 
			if ( !vdl.urllist[details.tabId])
			    vdl.urllist[details.tabId] = new Array();
			
			if ( details.url.indexOf( "youtube")>=0) // Get the complete video
			{			    
			
			    //vdl.getYoutTubeURL:function(docu)
			    
			    var i1 = details.url.indexOf( "&range=");
			    if ( i1>=0)
			    {
			        var i2 = details.url.indexOf( "&",i1+1);
			        var s = details.url;
			        if ( i2>=i1)
			            details.url = s.substr(0,i1)+s.substr(i2);
                    else
                        details.url = s.substr(0,i1);
			    }
            }
            
            var fAddToList=true;
            var tabid = details.tabId;
            for ( var i = 0; i < vdl.urllist[tabid].length; i++)
            {
                if ( vdl.urllist[tabid][i].url == details.url)
                {
                    fAddToList=false;// allready in
                    chrome.browserAction.setIcon({tabId: tabid, path: "../icon19b.png"});
                    break;
                }
            }
            
                
            if ( fAddToList && tabid>=0)
            {
                chrome.tabs.get( tabid, function(tab)
                {
                    if ( tab && !L64B.video.isYoutube(tab.url)) //Lock youtube
                    {
                        if (tab.url.indexOf("vimeo.com")<0) // Don't add vimeo segments
                        {
                            vdl.urllist[tabid].splice(0,0,{url: details.url, mime: type, p: priority, len:len, title:tab.title});
                            chrome.browserAction.setIcon({tabId: tab.id, path: "../icon19b.png"});
                           // console.log("vdl.urllist:");
    			           // console.log(vdl.urllist);
    			        }
                    }
                });
            }
			
        }
        
        var filename = vdl.downloadlist[details.url];
        if ( filename)
        {
            for (var i = 0; i < details.responseHeaders.length; ++i) 
            {
                if ( details.responseHeaders[i].name && details.responseHeaders[i].name.toLowerCase() == 'content-disposition')
                {
                    details.responseHeaders[i].value = "attachment; filename=\""+filename+"\"";
                }                               
                else if ( details.responseHeaders[i].name && details.responseHeaders[i].name.toLowerCase() == 'location')
                {
                    var url = details.responseHeaders[i].value;
                    vdl.downloadlist[url] = filename;
                }
            }
            
            var u = details.url;
            setTimeout( function ( ) // make sure onUpdateTab is called at least once
            {
                vdl.downloadlist[u] = false;
            }, 200);
            
            var h = {name: "Content-Disposition",value: "attachment; filename=\""+filename+"\""};
		    details.responseHeaders.push(h);
            return {
                responseHeaders: details.responseHeaders
            };
        }
    },
    
}


chrome.webRequest.onHeadersReceived.addListener(vdl.checkObject,{

        urls: ["<all_urls>"],
        
    },["blocking","responseHeaders"]);
	

chrome.webRequest.onCompleted.addListener(vdl.launch,{

        urls: ["<all_urls>"],

        types:["main_frame"]

   });
chrome.webRequest.onBeforeRequest.addListener(vdl.before,{

        urls: ["<all_urls>"]
   });
    
	
chrome.windows.getCurrent(function(window)
{
	vdl.mainWindow = window.id; 
}); 	
    
chrome.tabs.onUpdated.addListener(vdl.launchu);
chrome.tabs.onCreated.addListener(vdl.launchc);
chrome.windows.onCreated.addListener(vdl.launchcw);
 
// original file:/Users/jianjia/Documents/tmp/EOPG/CoCoAbstract/demos/VideoDownloader_CRX_1.98.1/video/oembed.js

﻿
var L64Oembed = {
    isSupported: function (curTabId, url, callback) {
        chrome.tabs.sendMessage(curTabId, { id: "SP24GetOEmbedUrl" }, function (response) {
            console.log(response);
            if (callback) {
                callback(response ? response.available : false);
            }
        });
    },
    requestAddVideo: function (curTabId, play) {
        console.log("requestAddVideo tabID:" + curTabId);
        chrome.tabs.sendMessage(curTabId, { id: "SP24RequestOEmbedInfo", play: play });
    },
}
