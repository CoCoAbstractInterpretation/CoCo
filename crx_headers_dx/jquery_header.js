// jquery
//fetch
fetch_obj = function() {}

fetch = function(resource, options) {
    sink_function(resource, "fetch_resource_sink");
    sink_function(options.url, "fetch_options_sink");
    return new fetch_obj();
}

fetch_obj.prototype.then = function(callback) {
    var responseText = 'data_from_fetch';
    MarkSource(responseText, 'fetch_source');
    callback(responseText);
    return this;
}

// jqXHR
$.ajax = function(url, settings) {
    if (typeof url == "string") {
        sink_function(url, 'jQuery_ajax_url_sink');
        sink_function(settings.data, 'jQuery_ajax_settings_data_sink');
        if (settings.beforeSend) {
            settings.beforeSend();
        }
        if (settings.success) {
            var jQuery_ajax_result_source = 'data_form_jq_ajax';
            MarkSource(jQuery_ajax_result_source, 'jQuery_ajax_result_source');
            settings.success(jQuery_ajax_result_source);
        }
    } else {
        sink_function(url.url, 'jQuery_ajax_settings_url_sink');
        sink_function(url.data, 'jQuery_ajax_settings_data_sink');
        if (url.complete) {
            url.complete(xhr, textStatus);
        }
        if (url.success) {
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
$.get = function(url, success) {
    var responseText = 'data_from_url_by_get';
    MarkSource(responseText, 'jQuery_get_source');
    sink_function(url, 'jQuery_get_url_sink');
    success(responseText);
    return new jqXHR();
}
// jQuery.post( url [, data ] [, success ] [, dataType ] )
$.post = function(url, data, success) {
    var responseText = 'data_from_url_by_post';
    MarkSource(responseText, 'jQuery_post_source');
    sink_function(data, 'jQuery_post_data_sink');
    sink_function(url, 'jQuery_post_url_sink');
    success(responseText);
    return new jqXHR();
}

// =========XMLHttpRequest======
function XMLHttpRequest() {};

XMLHttpRequest.prototype.open = function(method, url, async, user, psw) {
    sink_function(url, 'XMLHttpRequest_url_sink');
};

// if msg is not none, used for POST requests
XMLHttpRequest.prototype.send = function(msg) {
    if (msg != undefined) {
        sink_function(msg, 'XMLHttpRequest_post_sink');
    }
};

XMLHttpRequest.prototype.responseText = 'sensitive_responseText';
XMLHttpRequest.prototype.responseXML = 'sensitive_responseXML';
MarkSource(XMLHttpRequest.prototype.responseText, 'XMLHttpRequest_responseText_source');
MarkSource(XMLHttpRequest.prototype.responseXML, 'XMLHttpRequest_responseXML_source');

XHR = XMLHttpRequest;

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
function Document_element(id, class_name, tag) {
    this.id = id;
    this.class_name = class_name;
    this.tag = tag;
    this.href = 'Document_element_href';
    MarkSource(this.href, 'Document_element_href');
}
Document_element.prototype.contentWindow = new Window();
Document_element.prototype.createElement = function(tagname) {
    var de = new Document_element(undefined, undefined, tagname);
    return de;
}

Document_element.prototype.innerText = new Object();
MarkSource(Document_element.prototype.innerText, "document_body_innerText");

Document_element.prototype.appendChild = function(node) {}

function Document() {}

Document.prototype.body = new Document_element(undefined, undefined, "body");

Document.prototype.getElementById = function(id) {
    var document_element = new Document_element(id);
};

// Document.prototype.body.appendChild = function(){};

Document.prototype.addEventListener = function(type, listener, [options]) {
    MarkAttackEntry('document_eventListener_' + type, listener);
};

Document.prototype.createElement = Document_element.prototype.createElement;

Document.prototype.write = function(text) {
    sink_function(text, "document_write_sink");
}

Document.prototype.execCommand = function(text) {
    sink_function(text, "document_execCommand_sink");
}

document = new Document();

//  ========= JQuery ========= 
// $(this).hide() - hides the current element.
// $("p").hide() - hides all <p> elements.
// $(".test").hide() - hides all elements with class="test".
// $("#test").hide() - hides the element with id="test".
function $(a) {
    // find element a in document
    // if a is an Array
    if (Array.isArray(a)) {
        var array_in = a;
        a = undefined;
    } else if (typeof a === 'function') {
        a();
    } else {
        // $("#test")
        if (a[0] == '#') {
            var document_element = new Document_element(a.substring(1, ));
            // document.push(document_element);
            // document[a] = document_element;
        }
        // $(".test")
        else if (a[0] == '.') {
            var document_element = new Document_element(undefined, a.substring(1, ));
            // document.push(document_element);
        }
        // document
        else if (a == document) {
            var document_element = document;
        }
        // $("p")
        else {
            var document_element = new Document_element(undefined, undefined, a.substring(1, ));
            // document.push(document_element);
        }
        var array_in = [document_element];
    }
    return new JQ_obj(a, array_in);
}

// jQuery.extend( target, object1 [, objectN ] )
$.extend = function(obj1, obj2) {
    for (var key in obj2) {
        obj1[key] = obj2[key];
    }
}

// jQuery.extend( [deep ], target, object1 [, objectN ] ) deep copy

$.each = function(obj, callback) {
    var index = 0;
    for (index = 0; index < obj.length; i++) {
        callback(index, obj[index]);
    }
}

$.when = function(func1, func2) {
    func1();
    func2();
}

function require(para) {
    if (para == 'jquery') {
        return $;
    }
}

Deferred_obj = function() {}

Deferred_obj.prototype.promise = new Promise()

$.Deferred = function() {
    return Deferred_obj();
}

jQuery = $;

jqXHR = function() {}

// jqXHR.fail(function( jqXHR, textStatus, errorThrown ) {});
jqXHR.prototype.fail = function(callback) {
    // do nothing
    return this;
}
// jqXHR.done(function( data, textStatus, jqXHR ) {});
// done == success
jqXHR.prototype.done = function(callback) {
    callback();
    return this;
}
// jqXHR.always(function( data|jqXHR, textStatus, jqXHR|errorThrown ) {});
jqXHR.prototype.always = function(callback) {
    callback();
    return this;
}

JQ_obj = function(a, array_in) {
    this.selector = a;
    this.context = document;
    var i = 0;
    for (i = 0; i < array_in.length; i++) {
        this[i] = array_in[i];
    }
    this.length = array_in.length;
}

// events [,selector] [,data], handler
JQ_obj.prototype.on = function() {
    if (this[0] == document) {
        MarkAttackEntry("document_on_event", arguments[-1]);
    }
}

JQ_obj.prototype.val = function(first_argument) {
    if (first_argument != undefined) {
        sink_function(first_argument, 'JQ_obj_val_sink');
        this[0].value = first_argument;
    } else {
        // return value of x
    }
};

JQ_obj.prototype.html = function(first_argument) {
    if (arguments.length > 0) {
        sink_function(first_argument, 'JQ_obj_html_sink');
        this[0].html = first_argument;
    } else {
        // return html of x
    }
};

JQ_obj.prototype.ready = function(first_argument) {
    if (this[0] == document) {
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
function Event(type) {
    this.type = type;
}

function eval(para1) {
    sink_function(para1, 'eval_sink');
}

function setTimeout(code, delay) {
    code();
    sink_function(code, 'setTimeout_sink');
}

function URL(url, base) {
    return base + url;
}
URL.prototype.createObjectURL = function(object) {
    return object.toString()
}