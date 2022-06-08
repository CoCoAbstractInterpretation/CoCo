"use strict";

var EXPORTED_SYMBOLS = ['L64Jq'];

//const Cu = Components.utils;
//Cu.import("resource://gre/modules/Timer.jsm");

jsonToDOM.namespaces = {
    html: "http://www.w3.org/1999/xhtml",
    xul: "http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul"
};
jsonToDOM.defaultNamespace = jsonToDOM.namespaces.html;
function jsonToDOM(xml, doc, nodes) {
    function namespace(name) {
        var reElemNameParts = /^(?:(.*):)?(.*)$/.exec(name);
        return { namespace: jsonToDOM.namespaces[reElemNameParts[1]], shortName: reElemNameParts[2] };
    }
    function tag(elemNameOrArray, elemAttr) {
        if (Array.isArray(elemNameOrArray)) {
            var frag = doc.createDocumentFragment();
            Array.forEach(arguments, function (thisElem) {
                frag.appendChild(tag.apply(null, thisElem));
            });
            return frag;
        }

        var elemNs = namespace(elemNameOrArray);
        var elem = doc.createElementNS(elemNs.namespace || jsonToDOM.defaultNamespace, elemNs.shortName);
        for (var key in elemAttr) {
            var val = elemAttr[key];
            if (nodes && key == "key") {
                nodes[val] = elem;
                continue;
            }

            var attrNs = namespace(key);
            if (typeof val == "function") {
                elem.addEventListener(key.replace(/^on/, ""), val, false);
            }
            else {
                elem.setAttributeNS(attrNs.namespace || "", attrNs.shortName, val);
            }
        }
        var childElems = Array.slice(arguments, 2);
        childElems.forEach(function (childElem) {
            if (childElem != null) {
                elem.appendChild(
                    typeof childElem == "object" ? tag.apply(null, childElem) :
                        childElem instanceof doc.defaultView.Node ? childElem :
                            doc.createTextNode(childElem)
                );
            }
        });
        return elem;
    }
    return tag.apply(null, xml);
}


function L64Jq(options) {
    this.init(options);
}

L64Jq.prototype =
{
    m_timeouts: [],
    doc: false,
    init: function (options) {
        if (options && options.doc) {
            this.doc = options.doc;
        }
    },
    exit: function () {
        this.doc = false;
    },

    domFromJson: function (xml, nodes) {
        if (!this.doc) {
            //console.log("No document");
            return;
        }
        return jsonToDOM(xml, this.doc, nodes);
    },
    getData: function (id, dataName) {
        if (!this.doc) {
            //console.log("No document");
            return;
        }
        var otype = this.doc.querySelector(id);
        var type = false;
        if (otype) {
            type = otype.dataset[dataName];
        }
        return type;
    },
    clear: function (id) {
        this.getAllItems(id, function (element) {
            if (element) {
                while (element.childNodes.length) {
                    element.removeChild(element.childNodes[0]);
                }
            }
        });
    },
    get: function (id){
        if (!this.doc) {
            //console.log("No document");
            return;
        }
        if (id.charAt(0) == ".") {
            id = id.substr(1);
            var a = this.doc.getElementsByClassName(id);
            return a.lenght ? a : false;
        }
        id = id.substr(1);
        return this.doc.getElementById(id);
    },
    getAllItems: function (id, func, funcfin) {
        if (!this.doc) {
            //console.log("No document");
            return;
        }
        var type = 1;
        if (id.charAt(0) == ".") {
            type = 2;
        }
        id = id.substr(1);
        if (type == 1) {
            var o = this.doc.getElementById(id);
            if (o) {
                func(o);
            }
        }
        else if (type == 2) {
            var ao = this.doc.getElementsByClassName(id);
            for (var i = 0; i < ao.length; i++) {
                func(ao[i]);
            }
        }
        if (typeof (funcfin) == 'function') {
            funcfin();
        }

    },

    removeClass: function (id, classname) {

        this.getAllItems(id, function (element) {
            if (element) {
                element.classList.remove(classname);
            }
        });
    },

    setClass: function (id, classname) {
        this.getAllItems(id, function (element) {
            if (element) {
                element.className = classname;
            }
        });
    },

    addClass: function (id, classname) {
        this.getAllItems(id, function (element) {
            if (element) {
                element.classList.add(classname);
            }
        });
    },

    setClick: function (id, func) {        
        return this.setEvent(id, 'click', func);
    },

    setHover: function (id, func) {
        this.setEvent(id, 'mouseenter', func, "enter");
        this.setEvent(id, 'mouseleave', func, "leave");
    },
    unbind: function (id, event) {
        this.getAllItems(id, function (element) {
            if (element && element.oldEvent && element.oldEvent[event]) {
                element.removeEventListener(event, element.oldEvent[event]);
                element.oldEvent[event] = false;
            }
        });
    },
    setEvent: function (id, event, func, param) {
        this.getAllItems(id, function (element) {
            if (element) {
                if (element.oldEvent) {
                    if (element.oldEvent[event])
                        element.removeEventListener(event, element.oldEvent[event]);
                }
                else
                    element.oldEvent = {};
                var f = function (e) { e.stopPropagation(); func(this, param); };
                element.oldEvent[event] = f;
                element.addEventListener(event, f);
            }
        });
    },

    setAttr: function (id, name, value) {
        this.getAllItems(id, function (element) {
            if (element) {
                element.setAttribute(name, value);
            }
        });
    },
    getAttr: function (id, name) {
        var element = this.get(id);
        if (element) 
            return element.getAttribute(name);
        return false;
    },
    setText: function (id, txt) {
        this.getAllItems(id, function (element) {
            if (element) {
                element.textContent = txt;
            }
        });
    },
    setVal: function (id, value) {
        this.getAllItems(id, function (element) {
            if (element) {
                element.value = value;
            }
        });
    },
    getVal: function (id) {
        var element = this.get(id);
        if (element)
            return element.value;
        return false;
    },
    setStyle: function (id, name, value) {
        this.getAllItems(id, function (element) {
            if (element) {
                element.style[name] = value;
            }
        });
    },
    getStyle: function (id, name) {
        var element = this.get(id);
        if (element)
            return element.style[name];
        return false;
    },
    show: function (id) {
        var inst = this;
        this.getAllItems(id, function (element) {
            if (element) {
                if (inst.m_timeouts[element.id]) {
                    clearTimeout(L64Jq.m_timeouts[element.id]);
                    inst.m_timeouts[element.id] = false;
                }
                element.style.display = "block";
            }
        });
    },
    hide: function (id) {
        var inst = this;
        this.getAllItems(id, function (element) {
            if (element) {
                if (inst.m_timeouts[element.id]) {
                    clearTimeout(inst.m_timeouts[element.id]);
                    inst.m_timeouts[element.id] = false;
                }
                inst.m_timeouts[element.id] = setTimeout(function () { element.style.display = "none"; }, 60);
            }
        });
    },
    hideD: function (id) {
        this.getAllItems(id, function (element) {
            if (element) {
                element.style.display = "none";
            }
        });
    },
    showD: function (id) {
        this.getAllItems(id, function (element) {
            if (element) {
                element.style.display = "block";
            }
        });
    },
    showDI: function (id) {
        this.getAllItems(id, function (element) {
            if (element) {
                element.style.display = "inline-block";
            }
        });
    },
}


