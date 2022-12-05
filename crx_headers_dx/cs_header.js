//  ========= window ========= 

// targetWindow.postMessage(message, targetOrigin, [transfer]);
window.postMessage = function(message, targetOrigin, [transfer]) {
    sink_function(message, 'window_postMessage_sink');
};

// target.addEventListener(type, listener [, options]);
// the 'e' parameter passed to listener can be ignored, otherwise, it is the event object
window.addEventListener = function(type, listener, [options]) {
    MarkAttackEntry('cs_window_eventListener_' + type, listener);
};

window.top = new Object();
window.top.addEventListener = window.addEventListener;

window.localStorage = new Object();
window.localStorage.removeItem = function(a) {
    sink_function(a, 'cs_localStorage_remove_sink');
};

window.localStorage.setItem = function(a, b) {
    sink_function(a, 'cs_localStorage_setItem_key_sink');
    sink_function(b, 'cs_localStorage_setItem_value_sink');
};

window.localStorage.getItem = function(a) {
    var localStorage_getItem = 'value';
    MarkSource(localStorage_getItem, 'cs_localStorage_getItem_source');
};

window.localStorage.clear = function() {
    sink_function('cs_localStorage_clear_sink');
};

window.frames[0] = window;
window.frames[1] = window;

var self = window;
var top = window;

//  ========= port ========= 
function Port(info) {
    if (info.includeTlsChannelId) {
        this.includeTlsChannelId = info.includeTlsChannelId;
    }
    if (info.name) {
        this.name = info.name;
    }
}

Port.prototype.onMessage = new Object();

Port.prototype.onMessage.addListener = function(content_myCallback) {
    // debug_sink("cs_port_onMessageheader")
    RegisterFunc("cs_port_onMessage", content_myCallback);
};

Port.prototype.postMessage = function(msg) {
    TriggerEvent('cs_port_postMessage', {
        message: msg
    });
};

//  ========= chrome ========= 
function Chrome() {}

Chrome.prototype.runtime = new Object();

// chrome.runtime.sendMessage(
//   extensionId?: string,
//   message: any,
//   options?: object,
//   callback?: function,
// )
Chrome.prototype.runtime.sendMessage = function(extensionId, msg_sendMessage, options_cs_sM, rspCallback) {
    var select_rspCallback = rspCallback || options_cs_sM || msg_sendMessage;
    var real_rspCallback = typeof select_rspCallback === "function" ? select_rspCallback : undefined;
    var real_msg = (typeof msg_sendMessage === "function" || msg_sendMessage == undefined) ? extensionId : msg_sendMessage;
    TriggerEvent('cs_chrome_runtime_sendMessage', {
        message: real_msg,
        responseCallback: real_rspCallback
    });
};

Chrome.prototype.runtime.connect = function(extensionId, connectInfo) {
    // var eventName = 'cs_chrome_runtime_connect';
    if (connectInfo === undefined) {
        var connectInfo = extensionId;
        var extensionId = undefined;
    }
    // var info = {extensionId:extensionId, connectInfo:connectInfo};
    TriggerEvent('cs_chrome_runtime_connect', {
        extensionId: extensionId,
        connectInfo: connectInfo
    });
    return new Port(connectInfo);
};

Chrome.prototype.runtime.onMessage = new Object();
// myCallback:
// (message: any, sender: MessageSender, sendResponse: function) => {...}
// get message from chrome.runtime.sendMessage or chrome.tabs.sendMessage
Chrome.prototype.runtime.onMessage.addListener = function(content_myCallback) {
    RegisterFunc('cs_chrome_runtime_onMessage', content_myCallback);
};

MessageSender = function() {
    this.frameId = 123;
    this.guestProcessId = 456;
    this.guestRenderFrameRoutingId = 109;
    this.id = 1;
    this.nativeApplication = 'nativeApplication';
    this.origin = 'content';
    this.tab = {
        id: 99
    };
    this.tlsChannelId = 'tlsChannelId';
    this.url = 'url';
};

function sendResponse(message_back) {
    // var eventName = 'cs_chrome_runtime_onMessage_response';
    // var info = {message: message_back};
    TriggerEvent('cs_chrome_runtime_onMessage_response', {
        message: message_back
    });
}

Chrome.prototype.runtime.getURL = function(para1) {
    return "http://www.example.com/" + para;
}


Chrome.prototype.storage = new Object();
Chrome.prototype.storage.sync = new Object();
Chrome.prototype.storage.sync.get = function(key, callback) {
    var storage_sync_get_source = {
        'key': 'value'
    };
    MarkSource(storage_sync_get_source, 'storage_sync_get_source');
    callback(storage_sync_get_source);
};

Chrome.prototype.storage.sync.set = function(key, callback) {
    sink_function(key, 'chrome_storage_sync_set_sink');
    callback();
};

Chrome.prototype.storage.sync.remove = function(key, callback) {
    sink_function(key, 'chrome_storage_sync_remove_sink');
    callback();
};

Chrome.prototype.storage.sync.clear = function(callback) {
    sink_function('chrome_storage_sync_clear_sink');
    callback();
};

Chrome.prototype.storage.local = new Object();
Chrome.prototype.storage.local.get = function(key, callback) {
    var storage_local_get_source = {
        'key': 'value'
    };
    MarkSource(storage_local_get_source, 'storage_local_get_source');
    callback(storage_local_get_source);
    return StoragePromise(storage_local_get_source);
};

StoragePromise = function(result) {
    this.result = result;
};

StoragePromise.prototype.then = function(callback) {
    callback(this.result);
    return this;
}

StoragePromise.prototype.catch = function(callback) {
    callback(this.result);
    return this;
}

Chrome.prototype.storage.local.set = function(key, callback) {
    sink_function(key, 'chrome_storage_local_set_sink');
    callback();
};

Chrome.prototype.storage.local.remove = function(key, callback) {
    sink_function(key, 'chrome_storage_local_remove_sink');
    callback();
};

Chrome.prototype.storage.local.clear = function(callback) {
    sink_function('chrome_storage_local_clear_sink');
    callback();
};

// for deprecated APIs
Chrome.prototype.extension = Chrome.prototype.runtime;
Chrome.prototype.extension.sendRequest = Chrome.prototype.runtime.sendMessage;


chrome = new Chrome();
_ = chrome;
chrome.experimental.cookies = chrome.cookies;
browser = chrome;

// ========= location ========= 
location = new Object();
location.href = 'http://www.example.com/search?q=q&oq=oq&chrome=chrome&sourceid=sourceid&ie=UTF-8';

RegisterFunc('cs_chrome_tabs_executeScript_event', function() {});