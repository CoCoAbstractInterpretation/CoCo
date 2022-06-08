(function() {
  var domParser = new DOMParser;
  var veselishki = {};
  var DEV = "DEV_MODE" === "dev";
  var DEV_DEEP = false;
  if (DEV) {
    console.warn("ENABLED DEV MODE!");
  }
  var debug = DEV ? console.log.bind(console.log) : function() {
  };
  var deepDebug = DEV && DEV_DEEP ? console.log.bind(console.log) : function() {
  };
  if (DEV) {
    window.veselishki = veselishki;
    veselishki.isDev = true;
  }
  veselishki = Object.assign(veselishki, {domain:"//podaritel.top/", uniID:"%UNIID%", extID:"%EXTID%", sendShareLink:2, imgNoAvatar:"//podaritel.top/img/noavatar.png", macroPattern:"/oh-%RANDSTR%-%RANDSTR%-%ID%/", macrosRegexes:[/\/h:[a-z]+:[a-z]+:([0-9]+)\//, /\/ih:[a-z]+:[a-z]+:([0-9]+)\//, /\/oh[:|\-][a-z]+[:|\-][a-z]+[:|\-]([a-z0-9]+)\//, /\/oh[:|][a-zA-Z]+[:|][a-zA-Z]+\//]});
  veselishki = Object.assign(veselishki, {altScheme:false, checkScheme:function(callback) {
    if (!window.chrome || !window.chrome.runtime || !window.chrome.runtime.sendMessage) {
      veselishki.altScheme = true;
      callback();
      return;
    }
    chrome.runtime.sendMessage(veselishki.extID, {action:"getData", key:"uniID"}, function(data) {
      if (chrome.runtime.lastError) {
        veselishki.altScheme = true;
      }
      callback();
    });
  }, extRequest:function(params, callback) {
    var handler = false;
    if (callback) {
      if (!window.gfcallbacks) {
        window.gfcallbacks = {};
      }
      var cbid = (new Date).getTime().toString() + Math.round(Math.random() * 1E4).toString();
      window.gfcallbacks[cbid] = callback;
      handler = 'window.gfcallbacks["' + cbid + '"]';
    }
    window.postMessage({"preciousgifts":1, "podarkoz":1, "veselishki":1, "params":params, "handler":handler}, "*");
  }, altGetData:function(rkey, callback) {
    veselishki.extRequest({action:"getData", key:rkey}, callback);
  }, altSetData:function(rkey, rvalue) {
    veselishki.extRequest({action:"setData", key:rkey, value:rvalue});
  }, getData:function(rkey, callback) {
    if (veselishki.altScheme) {
      veselishki.altGetData(rkey, callback);
      return;
    }
    chrome.runtime.sendMessage(veselishki.extID, {action:"getData", key:rkey}, callback);
  }, setData:function(rkey, rvalue) {
    if (veselishki.altScheme) {
      veselishki.altSetData(rkey, rvalue);
      return;
    }
    chrome.runtime.sendMessage(veselishki.extID, {action:"setData", key:rkey, value:rvalue});
  }, trackEvent:function(category, action) {
    debug("trackEvent %s %s", category, action);
    if (!veselishki.config) {
      return;
    }
    if (!veselishki.config.googleTrackingID) {
      return;
    }
    var url = "https://www.google-analytics.com/collect";
    url += "?v=1";
    url += "&tid=" + veselishki.config.googleTrackingID;
    url += "&cid=" + veselishki.uniID;
    url += "&t=event";
    url += "&ec=" + category;
    url += "&ea=" + action;
    (new Image).src = url;
  }, trackPageView:function() {
    debug("trackPageView");
    if (!veselishki.config) {
      return;
    }
    if (!veselishki.config.googleTrackingID) {
      return;
    }
    var url = "https://www.google-analytics.com/collect";
    url += "?v=1";
    url += "&tid=" + veselishki.config.googleTrackingID;
    url += "&cid=" + veselishki.uniID;
    url += "&t=pageview";
    (new Image).src = url;
  }});
  veselishki = Object.assign(veselishki, {getStateParamString:function() {
    return window.OK.NFC ? window.OK.NFC.getStateParamString() : "p_sID=0";
  }, JSONParse:function(json) {
    try {
      return JSON.parse(json);
    } catch (error) {
      return null;
    }
  }, JSONStringify:function(object) {
    return JSON.stringify(object);
  }, randomElement:function(array) {
    return array[Math.floor(array.length * Math.random())];
  }, getLocalDate:function() {
    var d = new Date;
    var day = d.getDate().toString();
    var month = (d.getMonth() + 1).toString();
    var year = d.getFullYear().toString();
    if (day.length < 2) {
      day = "0" + day;
    }
    if (month.length < 2) {
      month = "0" + month;
    }
    return year + "-" + month + "-" + day;
  }, createPresentPath:function(presentID) {
    return presentID.toString().replace(/(\d)/g, "$1/");
  }, classes:{}, makeClass:function(origName) {
    return veselishki.classes[origName] || origName;
  }, getMIMEType:function(extension) {
    switch(extension) {
      case "jpg":
      ;
      case "jpeg":
        return "image/jpeg";
      case "mp4":
        return "video/mp4";
    }
    return "";
  }, string2blob:function(str, fln) {
    var exn = fln.split(".");
    var ext = exn.pop();
    if (ext === "jpg") {
      ext = "jpeg";
    }
    var contentType = ext === "mp4" ? "video/" + ext : "image/" + ext;
    var sliceSize = 512;
    var byteCharacters = str;
    var byteArrays = [];
    for (var offset = 0;offset < byteCharacters.length;offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);
      var byteNumbers = new Array(slice.length);
      for (var i = 0;i < slice.length;i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      var byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, {type:contentType});
  }, rand:function(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }, genRandString:function(len) {
    var alphabet = "abcdefghijklmnopqrstuvwxyz";
    var alphalen = alphabet.length - 1;
    var result = "";
    for (var i = 0;i < len;i++) {
      result += alphabet[Math.floor(Math.random() * alphalen)];
    }
    return result;
  }, getRandNumber:function(len) {
    var r = Math.floor(Math.random() * Math.pow(10, len));
    var m = Math.pow(10, len - 1);
    return r > m ? r : r + m;
  }, getRandomId:function() {
    return "id-" + parseInt(Math.random() * Date.now()).toString(16) + "-" + parseInt(1E4 + Math.random() * 1E4).toString(16);
  }, getDocument:function(string) {
    return (new DOMParser).parseFromString(string, "text/html");
  }, domParser:function() {
    var domParser = new DOMParser;
    return function(string) {
      return domParser.parseFromString(string, "text/html").body.children;
    };
  }(), getCustomDomId:function() {
    var counter = 1E5;
    return function(prefix) {
      return (prefix ? prefix : "veselishki_cdid_") + (counter++).toString(16);
    };
  }(), loadImageAsBlob:function(url, callback) {
    new veselishki.Loader({onLoad:function(event) {
      callback(event.currentTarget.response);
    }, onError:function(event) {
      callback(null);
    }, method:"get", responseType:"blob", url:url});
  }, removeSpacesHTML:function(string) {
    return string.replace(/>[\s]+</g, "><");
  }, makeDomElement:function(html) {
    return domParser.parseFromString(html, "text/html").body.children[0];
  }, inElement:function(parent, element) {
    if (element.parentNode) {
      if (element.parentNode === parent) {
        return true;
      }
      return veselishki.inElement(parent, element.parentNode);
    }
    return false;
  }, Loader:function(data) {
    this.loader = new XMLHttpRequest;
    this.data = data || {};
    this.onLoad = data.onLoad;
    this.onError = data.onError;
    this.method = data.method || "get";
    this.responseType = data.responseType || "";
    this.url = data.url;
    this.params = data.params;
    this.headers = data.headers || [];
    this.withCredentials = data.withCredentials;
    this.clear = function() {
      if (this.onLoad && typeof this.onLoad === "function") {
        this.loader.removeEventListener("load", this.onLoad);
      }
      if (this.onError && typeof this.onError === "function") {
        this.loader.removeEventListener("error", this.onError);
      }
    };
    if (this.onLoad && typeof this.onLoad === "function") {
      this.loader.addEventListener("load", this.onLoad);
    }
    if (this.onError && typeof this.onError === "function") {
      this.loader.addEventListener("error", this.onError);
    }
    if (this.withCredentials) {
      this.loader.withCredentials = true;
    }
    this.loader.open(this.method, this.url);
    this.loader.responseType = this.responseType;
    for (var i = 0;i < this.headers.length;i++) {
      this.loader.setRequestHeader(this.headers[i][0], this.headers[i][1]);
    }
    this.params ? this.loader.send(this.params) : this.loader.send();
  }, LoaderPOST:function(data) {
    if (!data) {
      data = {};
    }
    if (!data.headers) {
      data.headers = [];
    }
    data.method = "post";
    data.headers.push(["Content-type", "application/x-www-form-urlencoded"]);
    data.headers.push(["tkn", window.OK.tkn.token]);
    return new veselishki.Loader(data);
  }, FileLoader:function(url, onResult) {
    new veselishki.Loader({method:"get", responseType:"blob", headers:[["accept", "image/webp,image/apng,image/*,*/*;q=0.8"]], onLoad:function(event) {
      if (event.currentTarget.status !== 200) {
        onResult(false);
        return;
      }
      onResult(event.currentTarget.response);
    }, onError:function(event) {
      onResult(false);
    }, url:url});
  }, parentHasChild:function(parent, child) {
    if (parent === child) {
      return false;
    }
    if (!parent || !parent.children || parent.children.length === 0) {
      return false;
    }
    for (var i = 0, l = parent.children.length;i < l;i++) {
      if (parent.children[i] === child) {
        return true;
      }
      if (veselishki.parentHasChild(parent.children[i], child)) {
        return true;
      }
    }
    return false;
  }, closestParent:function(start, className) {
    var parent = start.parentNode;
    while (parent && parent !== document.body) {
      if (parent && parent.classList && parent.classList.contains(className)) {
        return parent;
      } else {
        parent = parent.parentNode;
      }
    }
    return null;
  }, timeStamp:function() {
    var date = new Date;
    var y = String(date.getFullYear());
    var m = String(date.getMonth() + 1);
    var d = String(date.getDate());
    var h = String(date.getHours());
    var min = String(date.getMinutes());
    var sec = String(date.getSeconds());
    m = m.length < 2 ? "0" + m : m;
    d = d.length < 2 ? "0" + d : d;
    h = h.length < 2 ? "0" + h : h;
    min = min.length < 2 ? "0" + min : min;
    sec = sec.length < 2 ? "0" + sec : sec;
    return [y + "-" + m + "-" + d, h + ":" + min + ":" + sec];
  }, modifyImage:function(blob, onResult) {
    var fileReader = new FileReader;
    fileReader.addEventListener("error", function(event) {
      onResult(false);
    });
    fileReader.addEventListener("load", function(event) {
      var image = new Image;
      image.addEventListener("load", function(event) {
        var image = event.currentTarget;
        var scale = (Math.random() * (160 - 128) + 128) / Math.max(image.width, image.height);
        var newWidth = Math.floor(image.width * scale);
        var newHeight = Math.floor(image.height * scale);
        var canvas = document.createElement("canvas");
        var context = canvas.getContext("2d");
        var cr = 120;
        var cg = 120;
        var cb = 120;
        var ca = 1;
        var color = "rgba(" + cr + ", " + cg + ", " + cb + ", " + ca + ")";
        var radius = Math.sqrt(newWidth * newWidth + newHeight * newHeight) / 2;
        var x = Math.floor(newWidth / 2);
        var y = Math.floor(newHeight / 2);
        var r = Math.floor(radius / 4 + Math.random() * radius / 4);
        var timeStamp = veselishki.timeStamp();
        debug("source " + image.width + "x" + image.height);
        debug("new " + newWidth + "x" + newHeight);
        debug(x, y, r);
        canvas.width = newWidth;
        canvas.height = newHeight;
        context.translate(newWidth / 2, newHeight / 2);
        context.rotate(-.2 + Math.random() * .4);
        context.drawImage(image, -newWidth / 2, -newHeight / 2, newWidth, newHeight);
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.textBaseline = "top";
        context.font = "20px sans-serif";
        context.fillStyle = color;
        var rx = Math.random() * 10;
        var ry = Math.random() * 10;
        context.fillText(timeStamp[0], 3 + rx, 3 + ry);
        context.fillText(timeStamp[1], 3 + rx, 3 + 20 + 2 + ry);
        canvas.toBlob(onResult);
      });
      image.setAttribute("src", event.currentTarget.result);
    });
    fileReader.readAsDataURL(blob);
  }, modifyImageByUrl:function(url, onResult) {
    veselishki.Loader({responseType:"blob", onLoad:function(event) {
      if (event.currentTarget.status !== 200) {
        return onResult(false);
      }
      veselishki.modifyImage(event.currentTarget.response, onResult);
    }, onError:function(event) {
      return onResult(false);
    }, url:url});
  }, makeImageWithText:function(data, onResult) {
    var canvas = document.createElement("canvas");
    var context = canvas.getContext("2d");
    var type = function() {
      var ts = ["serif", "sans-serif", "cursive", "fantasy", "monospace"];
      return ts[parseInt(ts.length * Math.random())];
    }();
    var textHeight = 42;
    var lineHeight = 1.3;
    data.width = data.width || 640;
    data.height = data.height || 320;
    data.colorBackground = data.colorBackground || "#ffffff";
    data.colorText = data.colorText || "#ff0000";
    canvas.width = data.width;
    canvas.height = data.height;
    context.fillStyle = data.colorBackground;
    context.fillRect(0, 0, data.width, data.height);
    context.textBaseline = "top";
    context.font = textHeight.toString() + "px " + type;
    context.fillStyle = data.colorText;
    var lines = data.text.split(/\r\n|\r|\n/g).filter(function(l) {
      return l !== "";
    });
    var top = (data.height - lines.length * textHeight * lineHeight) / 2;
    lines.forEach(function(line, index) {
      var x = (data.width - context.measureText(line).width) / 2;
      var y = top + textHeight * lineHeight * index;
      context.fillText(line, x, y);
    });
    canvas.toBlob(function(blob) {
      onResult(blob, canvas.toDataURL("image/jpeg"));
    }, "image/jpeg");
  }, googleShortLink:function(longUrl, key, handler) {
    veselishki.Loader({onLoad:function(event) {
      if (!event.currentTarget.response) {
        handler(false);
        return;
      }
      if (!event.currentTarget.response.id) {
        handler(false);
        return;
      }
      handler(event.currentTarget.response.id);
    }, onError:function(event) {
      handler(false);
    }, headers:[["Content-Type", "application/json; charset=utf-8"]], method:"post", responseType:"json", params:'{"longUrl": "' + longUrl + '"}', url:"https://www.googleapis.com/urlshortener/v1/url?key=" + key});
  }, bitlyShortLink:function(longURL, bitlyData, onResult) {
    new veselishki.Loader({responseType:"json", onLoad:function(event) {
      if (event.currentTarget.status !== 200) {
        return onResult(false);
      }
      if (!event.currentTarget.response) {
        return onResult(false);
      }
      if (event.currentTarget.response.status_code !== 200) {
        return onResult(false);
      }
      if (event.currentTarget.response.status_txt !== "OK") {
        return onResult(false);
      }
      if (!event.currentTarget.response.data) {
        return onResult(false);
      }
      if (!event.currentTarget.response.data.url) {
        return onResult(false);
      }
      onResult(event.currentTarget.response.data.url);
    }, onError:function() {
      return onResult(false);
    }, url:"https://api-ssl.bitly.com/v3/shorten?login=" + bitlyData.login + "&apiKey=" + bitlyData.apiKey + "&longUrl=" + encodeURIComponent(longURL)});
  }, fiberDynamicLink:function(link, fiberData, onResult) {
    var log = debug.bind(debug, "fiberDynamicLink:");
    if (!fiberData.hasOwnProperty("key")) {
      log("fiber data has no property key");
      onResult(false);
      return;
    }
    if (!fiberData.hasOwnProperty("domain")) {
      log("fiber data has no property domain");
      onResult(false);
      return;
    }
    var url = "https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=" + fiberData["key"];
    var params = JSON.stringify({"dynamicLinkInfo":{"dynamicLinkDomain":fiberData["domain"], "link":link}});
    new veselishki.Loader({onLoad:function(event) {
      var response = event.currentTarget.response;
      if (!response) {
        log("server response is null");
        onResult(false);
        return;
      }
      if (response.hasOwnProperty("error")) {
        log("server error");
        log(response);
        onResult(false);
        return;
      }
      if (!response.hasOwnProperty("shortLink")) {
        log("server response has no shortLink");
        onResult(false);
        return;
      }
      log(response);
      onResult(response["shortLink"]);
    }, onError:function(event) {
      log("getting link error");
      onResult(false);
    }, headers:[["content-type", "application/json"]], method:"post", responseType:"json", params:params, url:url});
  }, imageLoader:function(src, onResult) {
    var image = document.createElement("img");
    image.addEventListener("load", function(event) {
      onResult(image, src);
    });
    image.setAttribute("src", src);
    return image;
  }, date:{t24h:1E3 * 60 * 60 * 24, wToMs:function(w) {
    return 6048E5 * w;
  }, dToMs:function(d) {
    return veselishki.date.t24h * d;
  }, hToMs:function(h) {
    return 36E5 * h;
  }, mToMs:function(m) {
    return 6E4 * m;
  }, getMonthIndex:function(string) {
    switch(string.toLowerCase()) {
      case "\u044f\u043d\u0432\u0430\u0440\u044f":
      ;
      case "january":
        return 0;
      case "\u0444\u0435\u0432\u0440\u0430\u043b\u044f":
      ;
      case "february":
        return 1;
      case "\u043c\u0430\u0440\u0442\u0430":
      ;
      case "march":
        return 2;
      case "\u0430\u043f\u0440\u0435\u043b\u044f":
      ;
      case "april":
        return 3;
      case "\u043c\u0430\u044f":
      ;
      case "may":
        return 4;
      case "\u0438\u044e\u043d\u044f":
      ;
      case "june":
        return 5;
      case "\u0438\u044e\u043b\u044f":
      ;
      case "july":
        return 6;
      case "\u0430\u0432\u0433\u0443\u0441\u0442\u0430":
      ;
      case "august":
        return 7;
      case "\u0441\u0435\u043d\u0442\u044f\u0431\u0440\u044f":
      ;
      case "september":
        return 8;
      case "\u043e\u043a\u0442\u044f\u0431\u0440\u044f":
      ;
      case "october":
        return 9;
      case "\u043d\u043e\u044f\u0431\u0440\u044f":
      ;
      case "november":
        return 10;
      case "\u0434\u0435\u043a\u0430\u0431\u0440\u044f":
      ;
      case "december":
        return 11;
    }
    return null;
  }, parse:function(string) {
    var log = function() {
    };
    var currentDate = new Date;
    var currentYear = currentDate.getFullYear();
    var currentMonth = currentDate.getMonth();
    var currentDay = currentDate.getDate();
    var currentDayTime = (new Date(currentYear, currentMonth, currentDay, 0, 0, 0, 0)).getTime();
    var result = null;
    result = /\u0432\u0447\u0435\u0440\u0430 \u0432 (\d\d):(\d\d)/.exec(string) || /yesterday at (\d\d):(\d\d)/.exec(string);
    if (result) {
      var hours = veselishki.date.hToMs(parseInt(result[1]));
      var minutes = veselishki.date.mToMs(parseInt(result[2]));
      var time = currentDayTime - veselishki.date.t24h + hours + minutes;
      var date = new Date(time);
      log("as yesterday", date);
      return date.getTime();
    }
    result = /\u0441\u0435\u0433\u043e\u0434\u043d\u044f \u0432 (\d\d):(\d\d)/.exec(string) || /today at (\d\d):(\d\d)/.exec(string);
    if (result) {
      var hours$0 = veselishki.date.hToMs(parseInt(result[1]));
      var minutes$1 = veselishki.date.mToMs(parseInt(result[2]));
      var time$2 = currentDayTime + hours$0 + minutes$1;
      var date$3 = new Date(time$2);
      log("as today", date$3);
      return date$3.getTime();
    }
    result = /(\d{1,2}) ([\u0430-\u044f\u0410-\u042f]+) \u0432 (\d\d):(\d\d)/.exec(string);
    if (result) {
      var month = veselishki.date.getMonthIndex(result[2]);
      if (!month) {
        log("month in some day ru is not defined");
        return null;
      }
      var day = parseInt(result[1]);
      var hours$4 = parseInt(result[3]);
      var minutes$5 = parseInt(result[4]);
      var date$6 = new Date(currentYear, month, day, hours$4, minutes$5, 0, 0);
      log("as some day ru", date$6);
      return date$6.getTime();
    }
    result = /(\w+) (\d{1,2}) at (\d\d):(\d\d)/.exec(string);
    if (result) {
      var month$7 = veselishki.date.getMonthIndex(result[1]);
      if (!month$7) {
        log("month in some day en is not defined");
        return null;
      }
      var day$8 = parseInt(result[2]);
      var hours$9 = parseInt(result[3]);
      var minutes$10 = parseInt(result[4]);
      var date$11 = new Date(currentYear, month$7, day$8, hours$9, minutes$10, 0, 0);
      log("as some day en", date$11);
      return date$11.getTime();
    }
    result = /(\d{1,2}) ([\u0430-\u044f\u0410-\u042f]+) (\d{4}) \u0432 (\d\d):(\d\d)/.exec(string);
    if (result) {
      var month$12 = veselishki.date.getMonthIndex(result[2]);
      if (!month$12) {
        log("month in past year ru is not defined");
        return null;
      }
      var year = parseInt(result[3]);
      var day$13 = parseInt(result[1]);
      var hours$14 = parseInt(result[4]);
      var minutes$15 = parseInt(result[5]);
      var date$16 = new Date(year, month$12, day$13, hours$14, minutes$15, 0, 0);
      log("as past year ru", date$16);
      return date$16.getTime();
    }
    result = /([a-zA-Z]+) (\d{1,2}) (\d{4}) at (\d\d):(\d\d)/.exec(string);
    if (result) {
      var month$17 = veselishki.date.getMonthIndex(result[1]);
      if (!month$17) {
        log("month in past year ru is not defined");
        return null;
      }
      var year$18 = parseInt(result[3]);
      var day$19 = parseInt(result[2]);
      var hours$20 = parseInt(result[4]);
      var minutes$21 = parseInt(result[5]);
      var date$22 = new Date(year$18, month$17, day$19, hours$20, minutes$21, 0, 0);
      log("as past year en", date$22);
      return date$22.getTime();
    }
    log("cannot parse date");
    return null;
  }}, makeBlob:function(data, type, onResult) {
    var blob = new Blob([data], {type:type});
    onResult(blob);
    return blob;
  }, appendCSS:function(style) {
    if (!document || !document.head) {
      return setTimeout(veselishki.appendCSS, 200, style);
    }
    document.head.insertAdjacentHTML("beforeend", "<style>" + style + "</style>");
  }});
  Array.prototype.randomItem = function() {
    return this[Math.floor(this.length * Math.random())];
  };
  veselishki.ok = {p_sId:function() {
    if (window.OK.NFC) {
      return window.OK.NFC.getStateParamString();
    }
    return "p_sId=0";
  }};
  (function() {
    var log = debug.bind(debug, "notification:");
    var HTML = {notification:function(content) {
      return '<div class="h-mod">\n                        <div class="hookBlock">\n                            <div class="growl" style="cursor: auto;">\n                                <div class="h-mod">\n                                    ' + content + '\n                                    <a data-type="btn-action" class="veselishki_overflow_child"></a>\n                                    <span class="hook"><span title="\u0441\u043a\u0440\u044b\u0442\u044c" class="ic ic12 ic12_close growl_close"></span></span>\n                                </div>\n                            </div>\n                        </div>\n                    </div>';
    }};
    var notificationElements = [];
    var currentNotification = null;
    function showNotification(notificationData) {
      var containerCurrent = window.document.querySelector("#NotificationsGrowl");
      var customElement = veselishki.makeDomElement(notificationData.notification);
      var customElementGrowl = customElement.querySelector(".growl");
      var closeElement = customElement.querySelector(".growl_close");
      var actionElement = customElement.querySelector('[data-type="btn-action"]');
      customElement.setAttribute("data-notification-id", notificationData.id);
      function hide() {
        customElement.parentNode.removeChild(customElement);
        containerCurrent.style.display = "";
        currentNotification = null;
      }
      function show() {
        containerCurrent.style.display = "none !important";
        containerCurrent.parentNode.appendChild(customElement);
        customElementGrowl.classList.add("__active");
        notificationData.onShow(customElement);
      }
      closeElement.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        hide();
        notificationData.onClose(customElement);
        check();
      });
      actionElement.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        hide();
        notificationData.onAction(customElement);
        check();
      });
      show();
    }
    function check() {
      if (currentNotification) {
        return;
      }
      if (notificationElements.length === 0) {
        return;
      }
      currentNotification = notificationElements.shift();
      showNotification(currentNotification);
    }
    veselishki.notification = {add:function(content, onShow, onAction, onClose) {
      var id = veselishki.getRandomId();
      notificationElements.push({id:id, notification:HTML.notification(content), onShow:onShow, onAction:onAction, onClose:onClose});
      check();
      return id;
    }, remove:function(id) {
    }};
  })();
  veselishki = Object.assign(veselishki, {onInit:[], onConfig:[], makePresentURL:function(presentId) {
    return "" + veselishki.config.presentsPath + veselishki.createPresentPath(presentId) + "file.png";
  }, makeStickerURL:function(stickerId) {
    return "" + veselishki.config.localStickersPath + veselishki.createPresentPath(stickerId) + "file.png";
  }, makePostcardURL:function(postcardId) {
    return veselishki.config.otkritkiPath + "cards/" + postcardId + "/video.mp4";
  }, makeEmojiURL:function(emojiId) {
    return "" + veselishki.config.emoPath + emojiId + ".png";
  }, genGUID:function() {
    var guid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0;
      var v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
    return guid.toUpperCase();
  }, makeMacros:function(presentId) {
    if (!presentId) {
      presentId = veselishki.getRandNumber(6);
    }
    if (presentId.length > 6) {
      presentId = null;
    }
    return veselishki.macroPattern.replace(/%RANDSTR%/g, function(input) {
      return veselishki.genRandString(6);
    }).replace(/%ID%/g, function(input) {
      return presentId || veselishki.genRandString(6);
    });
  }, maskSymbols:function(string) {
    if (!string) {
      return string;
    }
    if (!veselishki.config || !veselishki.config.maskSymbols) {
      return string;
    }
    var symbols = veselishki.config.maskSymbols;
    var group = function(symbols) {
      var string = "";
      for (var s in symbols) {
        if (s.length === 1) {
          string += s;
        }
      }
      return string;
    }(symbols);
    if (group.length === 0) {
      return string;
    }
    var regex = new RegExp("[" + group + "]", "g");
    var newString = string.replace(regex, function(input) {
      return Math.random() < .5 ? input : symbols[input];
    });
    return newString;
  }, generateMessage:function(string, mask) {
    var mixData = {};
    function rand(array) {
      if (array.length === 0) {
        return null;
      }
      if (array.length === 1) {
        return array[1];
      }
      return array[parseInt(array.length * Math.random())];
    }
    function one(input) {
      return rand(input.slice(1).slice(0, -1).split("|"));
    }
    function findMix(input) {
      var id = "_%" + parseInt(Date.now() * Math.random()).toString(parseInt(12 + Math.random() * 20)) + "%";
      var arr = input.slice(1).slice(0, -1).split("|");
      var mixed = [];
      while (arr.length > 0) {
        var i = parseInt(arr.length * Math.random());
        var v = arr[i];
        mixed.push(v);
        arr.splice(i, 1);
      }
      mixData[id] = mixed.join(" ");
      return id;
    }
    function replaceMix(input) {
      if (mixData.hasOwnProperty(input)) {
        return mixData[input];
      }
      return input;
    }
    var result = string.replace(/\[[^\]]+]/g, findMix).replace(/{[^}]+}/g, one).replace(/_%\w+%/g, replaceMix);
    if (mask) {
      result = veselishki.maskSymbols(result);
    }
    return result;
  }, isShareMessage:function(string) {
    for (var i = 0, l = veselishki.macrosRegexes.length;i < l;i++) {
      if (veselishki.macrosRegexes[i].test(string)) {
        return true;
      }
    }
    return false;
  }, processShareMessage:function(object) {
    if (DEV) {
      object.style.opacity = "0.3";
    } else {
      object.parentNode.removeChild(object);
    }
  }, initHolidays:function(count) {
    debug("initHolidays: disabled");
    return;
    var tNav = document.querySelector(".toolbar_nav");
    if (!tNav || !tNav.insertBefore) {
      setTimeout(function() {
        return veselishki.initHolidays(count);
      }, 100);
      return;
    }
    var inLi = tNav.querySelector(".holidays");
    if (inLi) {
      return;
    }
    inLi = document.createElement("li");
    inLi.className = "toolbar_nav_i holidays";
    inLi.innerHTML = "" + '<div class="toolbar_nav_a" id="holidays_toolbar_button">' + '   <div class="toolbar_nav_i_glow"></div>' + '   <div class="toolbar_nav_i_ic" style="background: url(' + veselishki.domain + 'img/t_holi.png) no-repeat center 3px;">' + '       <div unselectable="on" class="toolbar_nav_i_tx-w usel-off">\u041f\u0440\u0430\u0437\u0434\u043d\u0438\u043a\u0438</div>' + "   </div>" + '   <div class="toolbar_nav_notif">' + '       <div id="counter_Holidays" class="notifications">' + 
    '           <div class="counterText">' + count + "</div>" + "       </div>" + "   </div>" + "</div>";
    inLi.addEventListener("click", veselishki.showHolidays);
    tNav.insertBefore(inLi, tNav.children[0]);
  }, showHolidays:function() {
    var divEl = document.getElementById("hook_Block_HolidaysLayer");
    if (divEl) {
      divEl.parentNode.removeChild(divEl);
      return;
    }
    function add(data) {
      if (!data.response) {
        return;
      }
      if (!data.response["h"]) {
        return;
      }
      var liEl = undefined, cnt = 0;
      var divEl = document.createElement("div");
      divEl.setAttribute("id", "hook_Block_HolidaysLayer");
      divEl.innerHTML = '<div id="HolidaysController" class="layer toolbar-layer_w">\n                 \t<div class="layer_ovr"></div>\n                 \t<div class="toolbar-layer __feedback" style="margin-left:-400px">\n                 \t\t<div class="toolbar-layer_h usel-off">\n                 \t\t\t<div class="portlet_h3">\u041f\u0440\u0430\u0437\u0434\u043d\u0438\u043a\u0438</div>\n                 \t\t\t<div class="toolbar-layer_ac"><span title="close" class="toolbar-layer_ac_i"><i class="ic ic_close-g js-close-layer"></i></span></div>\n                 \t\t</div>\n                 \t\t<div class="toolbar-layer_cnt">\n                 \t\t\t<div id="HolidaysLayerContentScroller" class="notifs_lst js-viewport-container">\n                 \t\t\t\t<div id="hook_Block_HolidaysLayerContent" class="notifs_wrap">\n                 \t\t\t\t\t<div id="hook_Loader_Holidays">\n                 \t\t\t\t\t\t<div class="js-feedback-list"></div>\n                 \t\t\t\t\t</div>\n                 \t\t\t\t</div>\n                 \t\t\t</div>\n                 \t\t</div>\n                 \t</div>\n                 </div>';
      if (data["n"].length > 0) {
        cnt = cnt + data["n"].length;
        liEl = document.createElement("div");
        liEl.className = "notif_w __v2";
        liEl.innerHTML = '<div class="notif h-mod show-on-hover __marked">\n                     \t<div class="notif_media clearfix">\n                     \t\t<div class="ucard-v __s notif_subj">\n                     \t\t\t<div class="section">\n                     \t\t\t\t<a class="dblock">\n                     \t\t\t\t\t<div class="photo">\n                     \t\t\t\t\t\t<img class="" src="' + veselishki.domain + '/img/imeniny.jpg" width="96">\n                     \t\t\t\t\t</div>\n                     \t\t\t\t</a>\n                     \t\t\t</div>\n                     \t\t</div>\n                     \t\t<div class="notif_media_cnt">\n                     \t\t\t<div class="feedback_comment">\n                     \t\t\t\t<b>\u0418\u043c\u0435\u043d\u0438\u043d\u043d\u0438\u043a\u0438 \u0441\u0435\u0433\u043e\u0434\u043d\u044f:</b>\n                     \t\t\t\t<br/>\n                     \t\t\t\t<br/>\n                     \t\t\t\t<span class="imeniny"></span>\n                     \t\t\t\t<br/>\n                     \t\t\t</div>\n                     \t\t\t<div class="notif_footer">\u041d\u0430\u0436\u043c\u0438\u0442\u0435 \u043d\u0430 \u0438\u043c\u044f \u0434\u043b\u044f \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e\u0433\u043e \u043f\u043e\u0434\u0430\u0440\u043a\u0430</div>\n                     \t\t</div>\n                     \t</div>\n                     </div>';
        for (var i = 0;i < data["n"].length;i++) {
          var anc = document.createElement("a");
          anc.innerHTML = data["n"][i]["title"];
          if (data["n"][i]["tag"] !== "") {
            anc.setAttribute("data-tag", data["n"][i]["tag"]);
          }
          anc.addEventListener("click", function(event) {
            var lnk = "/dk?cmd=GiftsFrontContentRBx&st.cmd=giftsFront&st.or=RED_LINK&st.bId=11047";
            var tag = event.currentTarget.getAttribute("data-tag");
            if (tag) {
              lnk += "&st.qs=" + encodeURIComponent(tag);
            }
            document.location.href = lnk;
          });
          liEl.querySelector(".imeniny").appendChild(anc);
          if (i < data["n"].length - 1) {
            var spn = document.createElement("span");
            spn.innerHTML = ", ";
            liEl.querySelector(".imeniny").appendChild(spn);
          }
        }
        divEl.querySelector(".js-feedback-list").appendChild(liEl);
      }
      for (var i$23 = 0;i$23 < data["h"].length;i$23++) {
        var liEl$24 = document.createElement("div");
        liEl$24.style.cursor = "pointer";
        liEl$24.className = "notif_w __v2";
        liEl$24.innerHTML = '<div class="notif h-mod show-on-hover __marked">\n                     \t<div class="notif_media clearfix">\n                     \t\t<div class="ucard-v __s notif_subj">\n                     \t\t\t<div class="section">\n                     \t\t\t\t<a class="dblock">\n                     \t\t\t\t\t<div class="photo">\n                     \t\t\t\t\t\t<img class="" src="' + veselishki.domain + "/holidays/" + data["h"][i$23]["id"] + '.jpg" alt="' + data["h"][i$23]["title"] + 
        '" width="96">\n                     \t\t\t\t\t</div>\n                     \t\t\t\t</a>\n                     \t\t\t</div>\n                     \t\t</div>\n                     \t\t<div class="notif_media_cnt">\n                     \t\t\t<div class="feedback_comment">' + data["h"][i$23]["title"] + '</div>\n                     \t\t\t<div class="notif_tx textWrap">' + data["h"][i$23]["description"] + '</div>\n                     \t\t</div>\n                     \t\t<div class="gift-price_w ' + 
        veselishki.makeClass("veselishki-gift") + '">\n                     \t\t\t<div class="gift-price">\u041f\u041e\u0417\u0414\u0420\u0410\u0412\u0418\u0422\u042c<br/>\u0414\u0420\u0423\u0417\u0415\u0419<br/>\u0411\u0415\u0421\u041f\u041b\u0410\u0422\u041d\u041e</div>\n                     \t\t</div>\n                     \t</div>\n                     </div>';
        if (data["h"][i$23]["tag"] !== "") {
          liEl$24.setAttribute("data-tag", data["h"][i$23]["tag"]);
        }
        liEl$24.addEventListener("click", function(event) {
          var lnk = "/dk?cmd=GiftsFrontContentRBx&st.cmd=giftsFront&st.or=RED_LINK&st.bId=11047";
          var tag = event.currentTarget.getAttribute("data-tag");
          if (tag) {
            lnk += "&st.qs=" + encodeURIComponent(tag);
          }
          document.location.href = lnk;
        });
        divEl.querySelector(".js-feedback-list").appendChild(liEl$24);
      }
      cnt = cnt + data["h"].length;
      divEl.querySelector(".js-close-layer").addEventListener("click", function(event) {
        veselishki.showHolidays();
      });
      document.body.appendChild(divEl);
      document.getElementById("counter_Holidays").innerHTML = '<div class="counterText">' + cnt + "</div>";
    }
    function load() {
      var date = veselishki.getLocalDate();
      var url = veselishki.domain + "json.php?ac=h&d=" + date;
      new veselishki.Loader({onLoad:function(event) {
        add(event.currentTime.response);
      }, onError:function(event) {
      }, responseType:"json", url:url});
    }
    load();
  }, cardPreview:function(cardLinkPreview) {
    var activePreviews = document.querySelectorAll("." + veselishki.makeClass("veselishki_card_preview_video"));
    for (var i = 0;i < activePreviews.length;i++) {
      if (!cardLinkPreview || activePreviews[i].parentNode.parentNode.getAttribute("data-id") !== cardLinkPreview.parentNode.getAttribute("data-id")) {
        activePreviews[i].parentNode.innerHTML = '<img width="200" \n                                height="140" \n                                src="' + veselishki.config.otkritkiPath + "thumbs/" + activePreviews[i].parentNode.parentNode.getAttribute("data-id") + '/image.jpg" />';
      }
    }
    if (cardLinkPreview && cardLinkPreview.childNodes[0] && cardLinkPreview.childNodes[0].tagName && cardLinkPreview.childNodes[0].tagName.toLowerCase() !== "video") {
      cardLinkPreview.innerHTML = 'video class="' + veselishki.makeClass("veselishki_card_preview_video") + '" \n                            width="200" \n                            height="140" \n                            src="' + veselishki.config.otkritkiPath + "thumbs/" + cardLinkPreview.parentNode.getAttribute("data-id") + '/video.mp4" \n                            poster="' + veselishki.config.otkritkiPath + "thumbs/" + cardLinkPreview.parentNode.getAttribute("data-id") + '/image.jpg" \n                            autoplay loop></video>'
      ;
    }
  }, showCards:function(catID, anc, page, append) {
    page = page || 1;
    var listBlock = document.querySelector("." + veselishki.makeClass("veselishki_cards_list"));
    if (!listBlock) {
      return;
    }
    if (!append) {
      listBlock.innerHTML = '<div class="' + veselishki.makeClass("veselishki_cards_loading") + '"></div>';
    }
    function show(data) {
      if (!data || !data.cards || data.cards.length === 0) {
        return;
      }
      var currentCatAc = document.querySelectorAll("." + veselishki.makeClass("veselishki_cards_category_link_ac"));
      for (var i = 0;i < currentCatAc.length;i++) {
        currentCatAc[i].classList.remove(veselishki.makeClass("veselishki_cards_category_link_ac"));
      }
      var catLink = document.querySelector("." + veselishki.makeClass("veselishki_cards_category_link") + '[data-id="' + catID + '"]');
      if (catLink) {
        catLink.classList.add(veselishki.makeClass("veselishki_cards_category_link_ac"));
        if (catLink.parentNode.classList.contains(veselishki.makeClass("veselishki_cards_category_sublist"))) {
          catLink.parentNode.parentNode.classList.add(veselishki.makeClass("veselishki_cards_category_link_ac"));
        }
      }
      if (!append) {
        listBlock.innerHTML = "";
      }
      var cardLink = undefined;
      for (var i$25 = 0;i$25 < data.cards.length;i$25++) {
        cardLink = document.createElement("a");
        cardLink.setAttribute("data-id", data.cards[i$25].id);
        cardLink.className = veselishki.makeClass("veselishki_card_link");
        cardLink.innerHTML = '<div class="' + veselishki.makeClass("veselishki_card_preview") + '">\n                    \t<img width="200" height="140" src="' + veselishki.config.otkritkiPath + "thumbs/" + data.cards[i$25].id + '/image.jpg" />\n                    </div>\n                    <div class="' + veselishki.makeClass("veselishki_card_link_title") + '">' + data.cards[i$25].title + "</div>";
        cardLink.addEventListener("click", function(event) {
          veselishki.doRenderPresentOffer(anc, event.currentTarget.getAttribute("data-id"), "99");
        });
        cardLink.querySelector("." + veselishki.makeClass("veselishki_card_preview")).addEventListener("mouseenter", function(event) {
          veselishki.cardPreview(event.currentTarget);
        });
        cardLink.querySelector("." + veselishki.makeClass("veselishki_card_preview")).addEventListener("mouseout", function(event) {
          veselishki.cardPreview();
        });
        listBlock.appendChild(cardLink);
      }
      var clearBlock = document.createElement("div");
      clearBlock.setAttribute("style", "clear:both;");
      listBlock.appendChild(clearBlock);
      if (data.totalPages > 1) {
        if (page !== data.totalPages) {
          var nextPageLink = document.createElement("div");
          nextPageLink.className = "button-pro";
          nextPageLink.innerHTML = "\u041f\u041e\u041a\u0410\u0417\u0410\u0422\u042c \u0415\u0429\u0415";
          nextPageLink.setAttribute("data-page", (parseInt(page) + 1).toString());
          nextPageLink.addEventListener("click", function(event) {
            event.currentTarget.parentNode.removeChild(event.currentTarget);
            veselishki.showCards(catID, anc, event.currentTarget.getAttribute("data-page"), 1);
          });
          listBlock.appendChild(nextPageLink);
        }
      }
    }
    veselishki.Loader({onLoad:function(event) {
      show(event.currentTarget.response);
    }, onError:function(event) {
    }, responseType:"json", url:veselishki.domain + "json.php?ac=o&a=cards&cat=" + catID + "&page=" + page});
  }, showTopCards:function() {
    (function(element) {
      if (!element) {
        return;
      }
      element.classList.remove("__ac");
    })(document.querySelector(".nav-side .nav-side_i.__ac"));
    (function(element) {
      if (!element) {
        return;
      }
      element.classList.add("__ac");
    })(document.querySelector("#ok_free_gifts_0x34face"));
    (function() {
      var title = "\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0435 \u043e\u0442\u043a\u0440\u044b\u0442\u043a\u0438";
      var content = document.querySelector("#hook_Block_GiftsFrontContentRBx");
      var container = content.querySelector(".gift-front_cnt");
      var offset = 0;
      var offsetStep = 4;
      container.innerHTML = '<div class="portlet_h">\n                        <div class="portlet_h_name_t">' + title + '</div>\n                    </div>\n                    <div class="ugrid __xxxl">\n                        <div class="ugrid_cnt">\n                            <div>\n                                <div>\n                                    <div>\n                                        <div id="gridContainer_0xffddaa"></div>\n                                    </div>\n                                </div>\n                            </div>\n                            <div class="loader-controls loader-controls-bottom">\n                                <div class="link-show-more_loading"><span class="fetching-hor"><span class="fetching-hor_i"></span>\u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430</span></div>\n                                <a class="js-show-more link-show-more" href="#">\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0435\u0449\u0451</a>\n                            </div>\n                        </div>\n                    </div>';
      var gridContainer = container.querySelector("#gridContainer_0xffddaa");
      var loaderControls = container.querySelector(".loader-controls");
      var loadingProgress = loaderControls.querySelector(".link-show-more_loading");
      var loadMore = loaderControls.querySelector(".js-show-more");
      function sendCard(giftId, giftImg) {
        var header = '<div class="modal-new_header __gifts">\n                                <div class="modal-gift" style="width: 190px;">\n                                    <div>\n                                        <div class="gift-card __s" style="width: auto;">\n                                            <div class="gift" style="width:175px; background-size:100%; background-image: url(' + giftImg + ')"></div>\n                                            <div class="gift-badge_w">\n                                                <div class="gift-badge"><span class="gift-badge_tx" style="font-size:16px;font-weight:bold;">\u0411\u0415\u0421\u041f\u041b\u0410\u0422\u041d\u041e</span></div>\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>';
        var title = "\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044f \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e\u0439 \u043e\u0442\u043a\u0440\u044b\u0442\u043a\u0438:";
        var giftReceiver = function() {
          var a = window.document.querySelector(".gift-front .ucard-v .gift-reciever .n-t a.o");
          if (!a) {
            return null;
          }
          var href = a.getAttribute("href");
          if (!href) {
            return null;
          }
          var res = /\/profile\/(\d+)/.exec(href);
          if (!res) {
            return null;
          }
          return {id:res[1], name:a.innerText};
        }();
        if (giftReceiver !== null) {
          veselishki.doRenderCardOffer2(null, giftId, "99", giftReceiver.id, giftReceiver.name);
        } else {
          veselishki.selectFriend(function(friendId, friendName, friendImg) {
            veselishki.doRenderCardOffer2(null, giftId, "99", friendId, friendName);
          }, header, title);
        }
      }
      function handleCards() {
        var cards = gridContainer.querySelectorAll(".card-not-handled");
        cards.forEach(function(card) {
          card.classList.remove("card-not-handled");
          card.querySelector(".gift_a").addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            var giftId = event.currentTarget.dataset["id"];
            var giftImg = veselishki.config.otkritkiPath + "thumbs/" + giftId + "/image.jpg";
            sendCard(giftId, giftImg);
          });
        });
      }
      function makeCards(data) {
        if (!data || !Array.isArray(data)) {
          return;
        }
        if (data.length === 0) {
          loadMore.style.display = "none";
          return;
        }
        var html = "";
        data.forEach(function(item) {
          var id = item.id;
          var img = veselishki.config.otkritkiPath + "thumbs/" + id + "/image.jpg";
          var str = '<div class="ugrid_i soh-s posR card-not-handled">\n                                <div data-pid="' + id + '" class="gift-card soh-s __live __no-frame __4 __s h-mod veselishki_card">\n                                    <div class="gift " style="background-image: url(' + img + ')"></div>\n                                    <a href="#" data-id="' + id + '" data-img-url="' + img + '" class="gift_a"></a>\n                                    <div class="gift-badge_w __hidden __hide-price __no-frame __4">\n                                        <div class="gift-badge __hidden __hide-price __no-frame __4"><span class="gift-badge_tx">\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e</span></div>\n                                    </div>\n                                </div>\n                            </div>';
          html += str;
        });
        gridContainer.insertAdjacentHTML("beforeend", html);
        handleCards();
      }
      function loadNext() {
        var url = veselishki.domain + "json.php?ac=p&a=topCards&p=1&n=ok&offset=" + offset;
        offset += offsetStep;
        new veselishki.Loader({onLoad:function(event) {
          loadingProgress.style.display = "none";
          loadMore.style.display = "block";
          makeCards(event.currentTarget.response);
        }, onError:function(event) {
        }, responseType:"json", url:url});
      }
      function addCards() {
        for (var i = 0;i < 4;i++) {
          loadNext();
        }
      }
      loadMore.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        loadingProgress.style.display = "block";
        loadMore.style.display = "none";
        addCards();
      });
      addCards();
    })();
  }, showCardsSelector:function(anc, friendID) {
    function show(data) {
      if (!data) {
        return;
      }
      if (!data.main || data.main.length === 0) {
        return;
      }
      var plm = document.getElementById("hook_Modal_popLayerModal");
      if (plm) {
        plm.remove();
      }
      var divEl = document.querySelector("." + veselishki.makeClass("veselishki_splash_box"));
      if (!divEl) {
        divEl = document.createElement("div");
        divEl.className = veselishki.makeClass("veselishki_splash_box");
        document.body.appendChild(divEl);
      }
      divEl.innerHTML = '<a href="#" onclick="this.parentNode.parentNode.removeChild(this.parentNode);return false;" class="ic modal-new_close_ico modal-new_close_ico_ps"></a>' + '<div class="' + veselishki.makeClass("veselishki_splash_box_container") + " " + veselishki.makeClass("veselishki_splash_box_container_ps") + '">' + '<div style="text-align:center;"><a href="#" class="button-pro">\u041f\u041e\u0414\u0410\u0420\u041a\u0418</a>&nbsp;&nbsp;&nbsp;\u041e\u0422\u041a\u0420\u042b\u0422\u041a\u0418</div>' + 
      '<div class="' + veselishki.makeClass("veselishki_splash_box_content") + '" style="background:#f2f0ed">' + '<div class="' + veselishki.makeClass("veselishki_cards_categories") + '"></div>' + '<div class="' + veselishki.makeClass("veselishki_cards_list") + '"></div>' + "</div></div>";
      var catLink = undefined, catSubList, catSubLink, catID, subCatID, arr;
      var catList = divEl.querySelector("." + veselishki.makeClass("veselishki_cards_categories"));
      for (var i = 0;i < data.main.length;i++) {
        catID = data.main[i];
        catLink = document.createElement("div");
        catLink.className = veselishki.makeClass("veselishki_cards_category_link");
        catLink.innerHTML = data.categories[catID].title;
        catLink.setAttribute("data-id", catID);
        if (data.categories[catID].subs) {
          arr = document.createElement("div");
          arr.className = veselishki.makeClass("veselishki_cat_rarr");
          catLink.appendChild(arr);
          catSubList = document.createElement("div");
          catSubList.className = veselishki.makeClass("veselishki_cards_category_sublist");
          for (var si = 0;si < data.categories[catID].subs.length;si++) {
            subCatID = data.categories[catID].subs[si];
            catSubLink = document.createElement("div");
            catSubLink.setAttribute("data-id", subCatID);
            catSubLink.className = veselishki.makeClass("veselishki_cards_category_link");
            catSubLink.innerHTML = data.categories[subCatID].title;
            catSubLink.addEventListener("click", function(event) {
              veselishki.showCards(event.currentTarget.getAttribute("data-id"), anc);
            });
            catSubList.appendChild(catSubLink);
          }
          catLink.appendChild(catSubList);
        } else {
          catLink.addEventListener("click", function(event) {
            veselishki.showCards(event.currentTarget.getAttribute("data-id"), anc);
          });
        }
        catList.appendChild(catLink);
      }
      veselishki.showCards(data.main[0], anc);
      divEl.querySelector("." + veselishki.makeClass("veselishki_splash_box_container") + " .button-pro").addEventListener("click", function(event) {
        veselishki.showPresentsSelector(anc);
      });
    }
    veselishki.Loader({onLoad:function(event) {
      show(event.currentTarget.response);
    }, onError:function(event) {
    }, responseType:"json", url:veselishki.domain + "json.php?ac=o&a=cats"});
  }, showPresentsSelector:function(anc) {
    veselishki.Loader({onLoad:function(event) {
      var response = event.currentTarget.response;
      if (!response || response.length === 0) {
        return;
      }
      var plm = document.getElementById("hook_Modal_popLayerModal");
      if (plm) {
        plm.remove();
      }
      var divEl = document.querySelector("." + veselishki.makeClass("veselishki_splash_box"));
      if (!divEl) {
        divEl = document.createElement("div");
        divEl.className = veselishki.makeClass("veselishki_splash_box");
        document.body.appendChild(divEl);
      }
      divEl.innerHTML = '<a href="#" onclick="this.parentNode.parentNode.removeChild(this.parentNode);return false;" class="ic modal-new_close_ico modal-new_close_ico_ps"></a>' + '<div class="' + veselishki.makeClass("veselishki_splash_box_container") + " " + veselishki.makeClass("veselishki_splash_box_container_ps") + '">' + '<div style="text-align:center;">\u041f\u041e\u0414\u0410\u0420\u041a\u0418&nbsp;&nbsp;&nbsp;<a href="#" class="button-pro">\u041e\u0422\u041a\u0420\u042b\u0422\u041a\u0418</a></div>' + 
      '<div class="' + veselishki.makeClass("veselishki_splash_box_content") + '"><div class="ugrid_cnt"></div></div></div>';
      var inLi = undefined, inHTML, imgUrl;
      for (var l = 0;l < response.length;l++) {
        inLi = document.createElement("div");
        inLi.className = "ugrid_i posR veselishki_present_item";
        inHTML = '<div class="gift-card __s veselishki_element"><div class="gift';
        if (response[l].tp === "13") {
          inHTML += " __animated";
        }
        imgUrl = veselishki.config.presentsPath + veselishki.createPresentPath(response[l]["id"]) + "file.png";
        inHTML += '" style="background-image: url(' + imgUrl + ')"></div><a href="#" onclick="return false;" class="gift_a"></a><div class="gift-badge_w __show-price"><div class="gift-badge __show-price"><span class="gift-badge_tx">\u0411\u0415\u0421\u041f\u041b\u0410\u0422\u041d\u041e</span></div></div></div>';
        inLi.innerHTML = inHTML;
        inLi.setAttribute("data-giftid", response[l].id);
        inLi.setAttribute("data-tp", response[l].tp);
        inLi.addEventListener("click", function(event) {
          veselishki.doRenderPresentOffer(anc, event.currentTarget.getAttribute("data-giftid"), event.currentTarget.getAttribute("data-tp"));
        });
        divEl.querySelector(".ugrid_cnt").appendChild(inLi);
      }
      divEl.querySelector("." + veselishki.makeClass("veselishki_splash_box_container") + " .button-pro").addEventListener("click", function(event) {
        veselishki.showCardsSelector(anc);
      });
    }, onError:function(event) {
    }, responseType:"json", url:veselishki.domain + "json.php?ac=p&a=topPresents&p=1"});
  }, showSplashScreen:function(header, title, content, handler) {
    header = header === undefined ? "" : header;
    title = title === undefined ? "" : title;
    content = content === undefined ? "" : content;
    handler = handler === undefined ? null : handler;
    var html = '<div class="' + veselishki.makeClass("veselishki_splash_box") + '">\n                <a href="#" onclick="this.parentNode.parentNode.removeChild(this.parentNode);return false;" class="ic modal-new_close_ico"></a>\n                <div class="' + veselishki.makeClass("veselishki_splash_box_container") + " " + veselishki.makeClass("veselishki_splash_box_container_cf") + '">\n                    ' + header + '\n                    <div class="' + veselishki.makeClass("veselishki_splash_box_title") + 
    '">' + title + '</div>\n                    <div class="' + veselishki.makeClass("veselishki_splash_box_content") + '">' + content + "</div>\n                </div>\n            </div>";
    document.body.insertAdjacentHTML("beforeend", html);
  }, selectFriend:function(callback, header, title) {
    header = header === undefined ? "" : header;
    title = title === undefined ? "" : title;
    veselishki.showGlobalLoadingProcess(true);
    veselishki.friends.getFriends(function(result) {
      veselishki.showGlobalLoadingProcess(false);
      var html = '<ul class="ugrid_cnt">';
      result.forEach(function(u) {
        html += '<li class="ugrid_i ' + veselishki.makeClass("veselishki_friend_item") + '" data-friend-id="' + u.id + '" data-friend-name="' + u.name + '" data-friend-img="' + u.img + '">\n                        <div class="ucard-v">\n                            <div class="section">\n                                <a>\n                                    <div class="photo">\n                                        <img class="photo_img" src="' + u.img + '" alt="' + u.name + '" width="128" height="128">\n                                    </div>\n                                </a>\n                            </div>\n                            <div class="caption">\n                                <div class="ellip"><a class="o">' + 
        u.name + "</a></div>\n                            </div>\n                        </div>\n                    </li>";
      });
      html += "</ul>";
      veselishki.showSplashScreen(header, title, html);
      var friends = document.querySelectorAll("." + veselishki.makeClass("veselishki_friend_item"));
      friends.forEach(function(friend) {
        friend.addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          callback(event.currentTarget.dataset["friendId"], event.currentTarget.dataset["friendName"], event.currentTarget.dataset["friendImg"]);
        });
      });
    });
  }, getFriendsList:function(giftID, result, onComplete, page) {
    page = page || 1;
    result = result || [];
    onComplete = onComplete || function() {
    };
    var url = "", params = "";
    url += "/gifts";
    url += "?cmd=SelectFriendToGiftBlock";
    url += "&gwt.requested=" + window.pageCtx.gwtHash;
    url += "&st.cmd=giftsFront";
    url += "&st.or=NAV_MENU&";
    url += "st.vpl.mini=false";
    params += "st.layer.gfPresent=" + giftID;
    params += "&fetch=false";
    params += "&st.layer.page=" + page;
    params += "&st.loaderid=SelectFriendToGiftBlockLoader";
    veselishki.LoaderPOST({onLoad:function(event) {
      var document = event.currentTarget.response;
      if (!document) {
        return onComplete(result);
      }
      var friends = document.querySelectorAll(".ugrid_i");
      friends.forEach(function(friend) {
        var profIMG = function() {
          var img = friend.querySelector(".photo_img");
          if (!img) {
            return veselishki.imgNoAvatar;
          }
          return img.getAttribute("src") || veselishki.imgNoAvatar;
        }();
        var name = function() {
          var el = friend.querySelector(".ellip");
          if (!el) {
            return "";
          }
          return el.innerText;
        }();
        var friendID = function() {
          var el = friend.querySelector("a");
          if (!el) {
            return null;
          }
          var href = el.getAttribute("href");
          if (!href) {
            return null;
          }
          var r = /friendId=(\d+)/.exec(href);
          return r ? r[1] : null;
        }();
        if (friendID && friendID !== veselishki.userID) {
          result.push({"id":friendID, "name":name, "avatar":profIMG});
        }
      });
      if (friends.length > 0) {
        veselishki.getFriendsList(giftID, result, onComplete, page + 1);
      } else {
        onComplete(result);
      }
    }, onError:function(event) {
      onComplete(result);
    }, responseType:"document", params:params, url:url});
  }, "sendPresentChooseFriend":function(el) {
    debug("sendPresentChooseFriend");
    if (veselishki.renderingPresentOffer) {
      alert("\u0418\u0434\u0435\u0442 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445 \u043f\u043e\u0434\u0430\u0440\u043a\u0430, \u043f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u043e\u0434\u043e\u0436\u0434\u0438\u0442\u0435");
      return;
    }
    veselishki.renderingPresentOffer = true;
    var anc = el.parentNode.querySelector("a");
    if (!anc) {
      veselishki.renderingPresentOffer = false;
      return;
    }
    var linkData = veselishki.processGiftLink(anc);
    if (linkData.giftID == 0) {
      veselishki.renderingPresentOffer = false;
      return;
    }
    var gft = anc.parentNode;
    if (!gft.classList.contains("gift")) {
      gft = anc.parentNode.querySelector(".gift");
    }
    var gType = 4;
    if (gft && (gft.classList.contains("__animated") || gft.classList.contains("__spriteAnimation"))) {
      gType = 13;
    }
    veselishki.renderingPresentOffer = false;
    veselishki.renderGiftFriendChooser(linkData.giftID, gType);
  }, sendPresentFromOurID:function(ourID, gType) {
    veselishki.Loader({onLoad:function(event) {
      if (!event.currentTarget.response) {
        return;
      }
      if (!event.currentTarget.response.id) {
        return;
      }
      veselishki.renderGiftFriendChooser(event.currentTarget.response.id, gType);
    }, onError:function(event) {
    }, responseType:"json", url:veselishki.domain + "json.php?ac=p&a=getIDFromOur&p=" + ourID});
  }, renderGiftFriendChooser:function(presentID, gType, customImageURL) {
    debug("renderGiftFriendChooser");
    if (veselishki.renderingPresentOffer) {
      alert("\u0418\u0434\u0435\u0442 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445 \u043f\u043e\u0434\u0430\u0440\u043a\u0430, \u043f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u043e\u0434\u043e\u0436\u0434\u0438\u0442\u0435");
      return;
    }
    veselishki.renderingPresentOffer = true;
    veselishki.showGlobalLoadingProcess(true);
    var gClass = function() {
      if (gType === "13") {
        return "__animated";
      }
      if (gType === "15") {
        return "__animated-256";
      }
      return "";
    }();
    veselishki.friends.getFriends(function(friends) {
      veselishki.renderingPresentOffer = false;
      veselishki.showGlobalLoadingProcess(false);
      var plm = document.getElementById("hook_Modal_popLayerModal");
      if (plm) {
        plm.parentNode.removeChild(plm);
      }
      var divEl = document.createElement("div");
      var backImage = customImageURL || "//dp.mycdn.me/getImage?photoId=" + presentID + "&type=" + gType;
      divEl.className = veselishki.makeClass("veselishki_splash_box");
      divEl.innerHTML = '<a href="#" onclick="this.parentNode.parentNode.removeChild(this.parentNode);return false;" class="ic modal-new_close_ico"></a>\n                    <div class="' + veselishki.makeClass("veselishki_splash_box_container") + " " + veselishki.makeClass("veselishki_splash_box_container_cf") + '">\n                        <div class="modal-new_header __gifts">\n                            <div class="modal-gift">\n                                <div>\n                                    <div class="gift-card __s">\n                                        <div class="gift ' + 
      gClass + '" style="background-image: url(' + backImage + ')"></div>\n                                        <div class="gift-badge_w">\n                                            <div class="gift-badge"><span class="gift-badge_tx" style="font-size:16px;font-weight:bold;">\u0411\u0415\u0421\u041f\u041b\u0410\u0422\u041d\u041e</span></div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                        <div class="' + 
      veselishki.makeClass("veselishki_splash_box_title") + '">\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044f \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e\u0433\u043e \u043f\u043e\u0434\u0430\u0440\u043a\u0430:</div>\n                        <div class="' + veselishki.makeClass("veselishki_splash_box_content") + '">\n                            <ul class="ugrid_cnt"></ul>\n                        </div>\n                    </div>';
      var inLi = undefined;
      for (var l = 0;l < friends.length;l++) {
        inLi = document.createElement("li");
        inLi.className = "ugrid_i veselishki_gift_to_friend";
        inLi.innerHTML = '<div class="ucard-v">' + '\t<div class="section">' + "\t\t<a>" + '\t\t\t<div class="photo"><img class="photo_img" src="' + friends[l].img + '" alt="' + friends[l].name + '" width="128" height="128"></div>' + "\t\t</a>" + "\t</div>" + '\t<div class="caption">' + '\t\t<div class="ellip"><a class="o">' + friends[l].name + "</a></div>" + "\t</div>" + "</div>";
        inLi.setAttribute("data-friendid", friends[l].id);
        inLi.setAttribute("data-giftid", presentID);
        inLi.setAttribute("data-tp", gType);
        inLi.addEventListener("click", function(event) {
          veselishki.renderPresentOffer(event.currentTarget.getAttribute("data-giftid"), event.currentTarget.getAttribute("data-tp"), event.currentTarget.getAttribute("data-friendid"));
        });
        divEl.querySelector(".ugrid_cnt").appendChild(inLi);
      }
      document.body.appendChild(divEl);
    });
  }, "giftSlider":function() {
    var c = "__music";
    var b = "__live";
    var f = "__animated";
    var a = "__s";
    var g = {$element:null, $giftElement:null, $nextGiftElement:null, $linkElement:null, $sMElement:null, $playElement:null, gifts:[], timer:null, isMouseOver:false, ANIMATION_DURATION:700, CSS_SHIFT:"__shift", activate:function(el, i) {
      var j = this;
      this.$element = el;
      this.$giftElement = this.$element.querySelector(".gift");
      this.$nextGiftElement = this.$element.querySelector(".gift-next");
      this.$linkElement = this.$giftElement.querySelector(".gift_a");
      var o = Math.round(Math.random() * 100 * 2);
      var m = i.t + o;
      var k = i.list.length;
      this.gifts = i.list;
      this.isOwn = !!i.o;
      var h = 0;
      this.preloadImage(h);
      this.setCurrentPresent(h);
      if (k > 1) {
        this.preloadImage(++h);
        this.timer = setInterval(function() {
          if (!j.$element || !j.$element.parentNode) {
            clearInterval(j.timer);
            return;
          }
          if (!j.isHoverOrShortcutOrPlaying()) {
            if (j.isFetched(h)) {
              j.$element.classList.add(j.CSS_SHIFT);
              setTimeout(function() {
                j.$element.classList.remove(j.CSS_SHIFT);
                j.setCurrentPresent(h);
                h++;
                if (h == k) {
                  h = 0;
                }
                if (h < k) {
                  j.preloadImage(h);
                }
              }, j.ANIMATION_DURATION);
            }
          }
        }, m);
      }
      this.$element.addEventListener("mouseover", function() {
        j.isMouseOver = true;
      });
      this.$element.addEventListener("mouseout", function() {
        j.isMouseOver = false;
      });
    }, setCurrentPresent:function(h) {
      var i = this.gifts[h];
      this.$giftElement.setAttribute("class", "gift " + i.c);
      if (this.isFetched(h)) {
        this.$giftElement.style.backgroundImage = "url(" + i.img.src + ")";
      } else {
        this.$giftElement.style.backgroundImage = "url(" + i.b + ")";
      }
      this.$linkElement.setAttribute("href", i.h);
      this.$linkElement.removeAttribute("hrefattrs");
      this.setIcon(h, this.$giftElement);
    }, setIcon:function(i, h) {
      var j = this.gifts[i];
      if (!!j.t) {
        h.classList.add(c);
      } else {
        h.classList.remove(c);
      }
      if (this.getBooleanValue(i, "l")) {
        h.classList.add(b);
      } else {
        h.classList.remove(b);
      }
    }, setSize:function(h) {
      var i = this.gifts[h].c;
      var j = i.indexOf(a) !== -1;
      if (j) {
        this.$nextGiftElement.classList.add(a);
      } else {
        this.$nextGiftElement.classList.remove(a);
      }
    }, isHoverOrShortcutOrPlaying:function() {
      var h = this.$element.classList.contains("__vis");
      return this.isMouseOver || h;
    }, isFetched:function(h) {
      return this.gifts[h].fetched;
    }, preloadImage:function(j) {
      var i = this;
      var k = this.gifts[j].b;
      if (this.isFetched(j)) {
        if (i.$nextGiftElement) {
          i.$nextGiftElement.style.backgroundImage = "url(" + k + ")";
          i.setSize(j);
          i.setIcon(j, i.$nextGiftElement);
        }
        return true;
      } else {
        var h = new Image;
        h.onload = function() {
          if (i.$nextGiftElement) {
            i.$nextGiftElement.style.backgroundImage = "url(" + k + ")";
            i.setSize(j);
            i.setIcon(j, i.$nextGiftElement);
          }
          i.gifts[j].fetched = true;
          i.gifts[j].img = this;
        };
        h.src = k;
      }
    }, getBooleanValue:function(h, i) {
      var j = this.gifts[h][i];
      return j ? j : false;
    }};
    return g;
  }, giftActivator:function() {
    var curLeftSide = document.querySelector("#hook_Block_LeftColumnTopCardFriend, #hook_Block_LeftColumnTopCardUser");
    if (curLeftSide && !curLeftSide.getAttribute("data-sliderreplaced")) {
      var midColumn = document.querySelector("#hook_Block_MiddleColumnTopCard_MenuFriend, #hook_Block_MiddleColumnTopCard_MenuUser");
      var prMainAnc = null;
      if (midColumn) {
        prMainAnc = midColumn.querySelector('a[hrefattrs*="st.cmd=friendMain"], a[hrefattrs*="st.cmd=userMain"]');
      }
      if (prMainAnc) {
        var finFrID = false;
        curLeftSide.setAttribute("data-sliderreplaced", 1);
        var frID = prMainAnc.getAttribute("href");
        if (frID) {
          frID = frID.split("profile/");
          if (frID[1]) {
            finFrID = frID[1].split("/")[0].split("?")[0];
          } else {
            if (frID[0].indexOf("/feed") > -1) {
              finFrID = veselishki.userID;
            }
          }
        }
        if (finFrID) {
          veselishki.Loader({onLoad:function(event) {
            if (!event.currentTarget.response) {
              return;
            }
            if (!event.currentTarget.response.list) {
              return;
            }
            var prData = event.currentTarget.response;
            var newGifts = false;
            var data = false;
            var curGifts = document.querySelector('*[data-module="PresentSlider"]');
            if (curGifts) {
              var jsonData = curGifts.getAttribute("data-presents");
              if (jsonData) {
                var data$26 = veselishki.JSONParse(jsonData);
                var newGifts$27 = document.createElement("div");
                newGifts$27.setAttribute("class", curGifts.getAttribute("class"));
                newGifts$27.innerHTML = curGifts.innerHTML;
                curGifts.parentNode.insertBefore(newGifts$27, curGifts);
                curGifts.parentNode.removeChild(curGifts);
              }
            }
            if (!data) {
              data = {"t":2500, "list":[]};
            }
            for (var i = 0;i < prData.list.length;i++) {
              data.list.unshift({"b":prData.list[i].src, "h":prData.list[i].url, "c":prData.list[i].dopClass});
            }
            if (!newGifts) {
              var newGifts$28 = document.createElement("div");
              newGifts$28.setAttribute("class", "gift-slider h-mod js-PresentPlay_place __animated");
              newGifts$28.innerHTML = '<div class="gift-next"><span class="gift_ic"></span></div><div class="gift  __s"><a href="#" class="gift_a"></a><span class="gift_ic"></span></div>';
              var anc = curLeftSide.querySelector(".card_wrp");
              anc.parentNode.insertBefore(newGifts$28, anc);
            }
            var gs = veselishki.giftSlider();
            gs.activate(newGifts, data);
          }, onError:function(event) {
          }, responseType:"json", url:veselishki.domain + "json.php?ac=g&u=" + veselishki.uniID + "&o=" + finFrID});
        }
      }
    }
    setTimeout(veselishki.giftActivator, 100);
  }, keyForLastSentLink:function(friendID) {
    return "okss_last_sent_" + friendID;
  }, updateLastSentLink:function(friendID) {
    veselishki.setData(veselishki.keyForLastSentLink(friendID), Date.now().toString());
  }, checkLastSentLink:function(friendID, handler) {
    veselishki.getData(veselishki.keyForLastSentLink(friendID), function(time) {
      if (!time || Date.now() - parseInt(time) > parseInt(veselishki.config.linkSendInterval) * 1E3) {
        handler(veselishki.updateLastSentLink.bind(veselishki.updateLastSentLink, friendID));
      } else {
        handler(false);
      }
    });
  }, filterLastSentLinkForFriends:function(friendsIds, onResult) {
    var friends = friendsIds.slice();
    var rest = [];
    function check(id) {
      if (!id) {
        onResult(rest);
        return;
      }
      veselishki.checkLastSentLink(id, function(callback) {
        if (callback) {
          rest.push(id);
        }
        check(friends.shift());
      });
    }
    check(friends.shift());
  }, setLastSentLinkToFriends:function(friendsIds) {
    friendsIds.forEach(function(fid) {
      return veselishki.updateLastSentLink(fid);
    });
  }, "getLink":function(handler, linkType, presentId, dopParam, receiver) {
    debug("getLink");
    if (!linkType) {
      linkType = 0;
    }
    if (!dopParam) {
      dopParam = 0;
    }
    veselishki.getOKLink(linkType, presentId, dopParam, handler, receiver);
  }, uploadStiker:function(fln, upToken, blob, callback) {
    debug("uploadStiker");
    if (!blob) {
      callback(false);
    }
    var form = new FormData;
    form.append("0", blob, fln);
    form.append("_0", fln);
    new veselishki.Loader({onLoad:function(event) {
      if (!event.currentTarget.response) {
        return callback(false);
      }
      if (event.currentTarget.response.hasOwnProperty("error")) {
        return callback(false);
      }
      if (!event.currentTarget.response[0] || !event.currentTarget.response[0].id) {
        return callback(false);
      }
      callback(event.currentTarget.response[0], upToken);
    }, onError:function(event) {
      callback(false);
    }, method:"post", responseType:"json", params:form, url:upToken.url});
  }, getUploadedStiker:function(imgUrl, callback, user, presentType) {
    var log = debug.bind(debug, "getUploadedStiker:");
    log();
    var flName = "file.mp4";
    var directTypes = ["99", "175"];
    var videoTypes = ["13", "15"];
    if (directTypes.indexOf(presentType.toString()) === -1) {
      imgUrl = veselishki.domain + "processImg.php?v=2&u=" + encodeURIComponent(imgUrl);
      flName = "file.png";
      if (presentType) {
        imgUrl += "&tp=" + presentType;
        if (videoTypes.indexOf(presentType.toString()) >= 0) {
          flName = "file.mp4";
        }
      }
    }
    var url = function() {
      if (!user) {
        return "attach/allocate?";
      }
      if (user.toString() === "2") {
        return "user/allocate?flashId=fileapiful_status_posting_form_btn&&type=Q&";
      }
      return "user/allocate?type=J&";
    }();
    url = "/web-api/photo/upload/" + url + "count=1&nc=" + (new Date).getTime();
    veselishki.Loader({onLoad:function(event) {
      var data = event.currentTarget.response;
      if (!data) {
        return callback(false);
      }
      if (data.hasOwnProperty("error")) {
        return callback(false);
      }
      if (!data || !data.tokens || !data.tokens[0] || !data.tokens[0].url) {
        return callback(false);
      }
      veselishki.FileLoader(imgUrl, function(blob) {
        if (!blob) {
          return callback(false);
        }
        veselishki.uploadStiker(flName, data.tokens[0], blob, callback);
      });
    }, onError:function(event) {
      callback(false);
    }, responseType:"json", url:url});
  }, "genDomLink":function(t, customDom) {
    if (!customDom) {
      customDom = veselishki.config.addDomainNew;
    }
    customDom = customDom.replace("%T%", t);
    return customDom;
  }, "genPresentShareMessage":function(friendName, wishText) {
    var ret = "";
    wishText = wishText.replace(/[\n\t\s]+/g, " ");
    if (wishText != "") {
      ret = veselishki.config.presentMessageShareWish.replace("%USERTO%", friendName).replace("%WISH%", wishText);
    } else {
      ret = veselishki.config.presentMessageShare.replace("%USERTO%", friendName);
    }
    return ret;
  }, "genPresentMessageNew":function(wishText) {
    var ret = "";
    if (wishText != "") {
      wishText = wishText.replace(/[\[\]]+/g, "");
      ret = veselishki.config.presentMessageWishNew.replace("%WISH%", wishText);
    }
    return ret;
  }, "genPresentMessage":function(presentID, dopMsg, wishText, hidden, customDom) {
    debug("genPresentMessage");
    var ret = veselishki.makeMacros(presentID) + "\n";
    ret += veselishki.config.newAddMsg3.replace("%UNAME%", veselishki.uName).replace("%LINK%", veselishki.genDomLink("pr", customDom));
    return ret;
  }, "genNewMessage":function(presentId, presentType, custom, local, hidden, customDom) {
    debug("genNewMessage");
    var t = local ? "il" : "i";
    if (custom) {
      t = "c";
    }
    var ret = veselishki.makeMacros(presentId) + "\n";
    ret += veselishki.config.newAddMsg3.replace("%UNAME%", veselishki.uName).replace("%LINK%", veselishki.genDomLink(t, customDom));
    return ret;
  }, insertLinkIntoText:function(text, link, position, separator) {
    if (/%LINK%/g.test(text)) {
      return text.replace(/%LINK%/g, link);
    }
    separator = separator || "\n";
    switch(position) {
      case "start":
        return link + separator + text;
      case "end":
        return text + separator + link;
      default:
        return text;
    }
  }, "stikerUrl":function(sid, custom) {
    var sUrl = false;
    if (!custom) {
      sUrl = veselishki.stickers[sid].url;
    } else {
      sUrl = veselishki.config.customPath + veselishki.createPresentPath(sid) + "file.png";
    }
    return sUrl;
  }, "stikerPreview":function(sid, custom) {
    var sUrl = false;
    if (!custom) {
      sUrl = veselishki.stickers[sid].preview;
    } else {
      sUrl = veselishki.config.customPath + veselishki.createPresentPath(sid) + "file.png";
    }
    return sUrl;
  }, checkConfig:function(callback) {
    veselishki.getData("config", function(data) {
      if (!data) {
        return callback();
      }
      var config = veselishki.JSONParse(data);
      if (!config) {
        return callback();
      }
      config.dayNames = null;
      veselishki.setData("config", JSON.stringify(config));
      callback();
    });
  }, reqConfig:function(configOnly, callback) {
    if (configOnly && document.hidden) {
      return;
    }
    callback = callback || function() {
    };
    var dopParam = configOnly ? "&co=1" : "";
    var ld = veselishki.getLocalDate();
    dopParam += "&ld=" + ld;
    var url = veselishki.domain + "json.php";
    url += "?ac=u";
    url += "&v=LASTVERSION";
    url += "&u=" + veselishki.uniID;
    url += dopParam;
    url += "&o=" + veselishki.userID;
    url += "&ex=" + veselishki.extID;
    url += "&nnt=";
    url += "&an=veselishki";
    url += "&wcd=1";
    veselishki.Loader({onLoad:function(event) {
      if (!event.currentTarget.response) {
        return;
      }
      var data = event.currentTarget.response;
      if (data) {
        if (data.ldata) {
          for (var k in data.ldata) {
            veselishki.setData(k, data.ldata[k]);
          }
        }
        if (data.packs) {
          veselishki.setData("packsCache", JSON.stringify(data.packs));
          veselishki.initPacks();
        }
        if (data.stickers) {
          veselishki.setData("stickersCache", JSON.stringify(data.stickers));
          veselishki.initStickers();
        }
        if (data.announcements) {
          veselishki.setData("announcements", JSON.stringify(data.announcements));
          veselishki.initAnnouncements();
        }
        if (data.config) {
          veselishki.setData("config", JSON.stringify(data.config));
          veselishki.initConfig();
        }
      }
      callback(true);
    }, onError:function(event) {
      callback(false);
    }, responseType:"json", withCredentials:true, url:url});
  }, initAnnouncements:function() {
    veselishki.getData("announcements", function(jannouncements) {
      var announcements = false;
      if (jannouncements) {
        try {
          announcements = JSON.parse(jannouncements);
        } catch (e) {
        }
      }
      if (!announcements) {
        announcements = {};
      }
      var announcementsKeys = [];
      for (var k in announcements) {
        announcementsKeys.push(k);
      }
      veselishki.processAnnouncements(announcementsKeys, announcements);
    });
  }, "processAnnouncements":function(keys, announcements) {
    if (!keys || !keys.length || keys.length == 0) {
      return;
    }
    keys.forEach(function(k) {
      veselishki.getData("seen_announcement_" + k, function(seenIt) {
        if (!seenIt) {
          veselishki.viewAnnouncement(k, announcements[k]);
        }
      });
    });
  }, "initPacks":function(ready) {
    veselishki.getData("packsCache", function(packsCache) {
      var packs = false;
      if (packsCache) {
        try {
          packs = JSON.parse(packsCache);
        } catch (e) {
        }
      }
      if (!packs) {
        packs = {};
      }
      veselishki.packs = packs;
      if (ready) {
        ready();
      }
      veselishki.getData("packsOrder", function(packsOrder) {
        var order = false;
        if (packsOrder) {
          try {
            order = JSON.parse(packsOrder);
          } catch (e$29) {
          }
        }
        if (!order) {
          order = [];
        }
        if (veselishki.packs) {
          for (var k in veselishki.packs.list) {
            if (order.indexOf(k) == -1) {
              order.push(k);
            }
          }
        }
        var finOrder = [];
        for (var i = 0;i < order.length;i++) {
          if (veselishki.packs.list[order[i]]) {
            finOrder.push(order[i]);
          }
        }
        veselishki.packsOrder = finOrder;
      });
    });
  }, "initStickers":function(ready) {
    veselishki.getData("stickersCache", function(stickersCache) {
      var stickers = false;
      if (stickersCache) {
        try {
          stickers = JSON.parse(stickersCache);
        } catch (e) {
        }
      }
      if (!stickers) {
        stickers = {};
      }
      veselishki.stickers = stickers;
      if (ready) {
        ready();
      }
    });
  }, initConfig:function(ready) {
    var log = debug.bind(debug, "initConfig:");
    log();
    veselishki.getData("config", function(configCache) {
      veselishki.config = veselishki.JSONParse(configCache) || {};
      log(veselishki.config);
      if (veselishki.config.gApiKey && veselishki.config.addDomainNew && veselishki.config.addDomainNew.substr(0, 4) === "http" && veselishki.config.addDomainNew.substr(0, 14) !== "https://goo.gl") {
        veselishki.initShortUrl(veselishki.config.addDomainNew, ready);
      } else {
        if (ready) {
          ready();
        }
      }
      if (veselishki.config.hideMacros) {
        veselishki.macroPattern = veselishki.config.hideMacros;
      }
      if (veselishki.config.macrosRegexes && Array.isArray(veselishki.config.macrosRegexes)) {
        veselishki.macrosRegexes = [];
        veselishki.config.macrosRegexes.forEach(function(src) {
          return veselishki.macrosRegexes.push(new RegExp(src));
        });
        veselishki.hideShareMessages(document.body);
      }
      veselishki.onConfig.forEach(function(f) {
        return f();
      });
    });
  }, initShortUrl:function(longUrl, callback) {
    callback = callback || function() {
    };
    debug("initShortUrl");
    veselishki.googleShortLink(longUrl, veselishki.config.gApiKey, function(id) {
      if (!id) {
        callback(false);
        return;
      }
      veselishki.config.addDomainNew = event.currentTarget.response.id;
      callback(true);
    });
  }, init:function() {
    var d = document.getElementById("hook_Cfg_CurrentUser");
    if (d) {
      var c = false;
      try {
        c = JSON.parse(d.innerHTML.substr(4, d.innerHTML.length - 7));
      } catch (e) {
      }
      if (c && c.uid) {
        var name = "";
        if (c.firstName) {
          name += c.firstName + " ";
        }
        if (c.lastName) {
          name += c.lastName;
        }
        veselishki.uName = name.trim();
        veselishki.userID = c.uid;
      }
    }
    if (!veselishki.uName) {
      setTimeout(function() {
        return veselishki.init();
      }, 100);
      return;
    }
    veselishki.getData("sendShareLink", function(sendShareLink) {
      if (sendShareLink && sendShareLink == 1) {
        veselishki.sendShareLink = 1;
      }
    });
    veselishki.checkConfig(function() {
      veselishki.reqConfig();
      veselishki.initConfig(function() {
        if (veselishki.config.holidaysCount) {
          veselishki.initHolidays(veselishki.config.holidaysCount);
        }
        veselishki.initPacks(function() {
          veselishki.initStickers(function() {
            veselishki.giftActivator();
            var selectors = ["#hook_Modal_popLayerModal", ".chat", "#mainContent", ".mdialog_chat_add-comment", ".d_comment_w", ".photo-layer_bottom_cnt", "#leftColumn .nav-side"];
            document.querySelectorAll(selectors.join(",")).forEach(function(o) {
              return veselishki.processChild(o);
            });
            var observer = new MutationObserver(function(mutations) {
              mutations.forEach(function(mutation) {
                if (mutation.type === "childList") {
                  if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                    for (var m = 0;m < mutation.addedNodes.length;m++) {
                      if (mutation.addedNodes[m]) {
                        veselishki.processChild(mutation.addedNodes[m]);
                      }
                    }
                  }
                }
              });
            });
            var config = {childList:true, subtree:true};
            observer.observe(document.body, config);
            veselishki.processChild(document.body);
          });
        });
      });
    });
    (function() {
      var configDataElement = document.querySelector("#hook_Cfg_CurrentUser");
      if (!configDataElement) {
        return;
      }
      var configData = configDataElement.innerHTML;
      var json = configData.replace(/(\x3c!--|--\x3e)/g, "");
      veselishki.okSiteConfig = veselishki.JSONParse(json);
    })();
    document.body.addEventListener("mousedown", function(e) {
      veselishki.checkClick(e.target);
    });
    setInterval(function() {
      return veselishki.reqConfig(1);
    }, 3E5);
    veselishki.trackEvent("user", "visit");
    veselishki.initAnnouncements();
    veselishki.onInit.forEach(function(fn) {
      return fn();
    });
    veselishki.onInit = [];
    window.addEventListener("click", veselishki.handleWindowMouseClick);
  }, handleWindowMouseClick:function(event) {
    var element = event.target;
    if (element.nodeType === 1) {
      var type = element.getAttribute("data-element");
      if (type === veselishki.freeButtonId) {
        veselishki.handleFreeButton(event, element);
      }
    }
  }, checkClick:function(element) {
    for (var k in veselishki.classes) {
      if (element.classList.contains(veselishki.classes[k])) {
        return;
      }
    }
    var curPanel = document.querySelector("." + veselishki.makeClass("veselishki_panel"));
    if (curPanel) {
      var panel = this.closestParent(element, veselishki.makeClass("veselishki_panel"));
      if (!panel) {
        curPanel.parentNode.removeChild(curPanel);
      }
    }
  }, processGiftLink:function(anc) {
    console.log("processGiftLink");
    var hrefAttrs = anc.getAttribute("hrefattrs");
    if (!hrefAttrs) {
      hrefAttrs = anc.getAttribute("href");
    }
    if (hrefAttrs.indexOf("st.layer.redirect=") > -1) {
      hrefAttrs = hrefAttrs.split("st.layer.redirect=")[1].split("&")[0];
      hrefAttrs = decodeURIComponent(decodeURIComponent(hrefAttrs));
    }
    if (hrefAttrs.indexOf("st.layer.lnk=") > -1) {
      hrefAttrs = hrefAttrs.split("st.layer.lnk=")[1].split("&")[0];
      hrefAttrs = decodeURIComponent(decodeURIComponent(hrefAttrs));
    }
    var friendID = 0;
    var giftID = 0;
    if (hrefAttrs.indexOf(".friendId=") > -1) {
      friendID = hrefAttrs.split(".friendId=")[1].split("&")[0];
    }
    if (hrefAttrs.indexOf(".presentId=") > -1) {
      giftID = hrefAttrs.split(".presentId=")[1].split("&")[0];
    } else {
      if (hrefAttrs.indexOf(".gfPresent=") > -1) {
        giftID = hrefAttrs.split(".gfPresent=")[1].split("&")[0];
      }
    }
    return {"friendID":friendID, "giftID":giftID};
  }, addFreeGiftButton:function(object) {
    debug("addFreeGiftButton");
    var anc = object.querySelector("a");
    if (anc) {
      var linkData = veselishki.processGiftLink(anc);
      if (linkData.friendID > 0 && linkData.giftID > 0 && !object.querySelector("." + veselishki.makeClass("veselishki-gift"))) {
        object.style.position = "relative";
        debug("addFreeButton sendPresent");
        return veselishki.addFreeButton(object, function(obj) {
          veselishki.sendPresent(obj);
        });
      }
    }
    return false;
  }, "addFreeButton":function(object, clickCallback) {
    debug("addFreeButton");
    if (object.querySelector("." + veselishki.makeClass("veselishki_dialog_button_send_free"))) {
      return true;
    }
    if (veselishki.config.useFullButton) {
      var html = '<div class="' + veselishki.makeClass("veselishki_dialog_button_send_free") + '"></div>';
      object.insertAdjacentHTML("beforeend", html);
      object.querySelector("." + veselishki.makeClass("veselishki_dialog_button_send_free")).addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (clickCallback) {
          clickCallback(event.currentTarget);
        }
      });
    } else {
      var divEl = document.createElement("div");
      divEl.className = "gift-price_w " + veselishki.makeClass("veselishki-gift");
      divEl.setAttribute("style", "top:0;margin-top:0;z-index:10000;cursor:pointer;");
      divEl.innerHTML = '<div class="gift-price">\u041e\u0422\u041f\u0420\u0410\u0412\u0418\u0422\u042c<br/>\u0411\u0415\u0421\u041f\u041b\u0410\u0422\u041d\u041e</div>';
      var finCallback = function(e) {
        if (e && e.stopPropagation) {
          e.stopPropagation();
        }
        if (clickCallback) {
          clickCallback(this);
        }
      };
      divEl.addEventListener("click", finCallback);
      object.appendChild(divEl);
    }
    return true;
  }, collectGiftData:function(giftElement) {
    if (!giftElement) {
      return null;
    }
    var userId = function() {
      var el = giftElement.querySelector('a[hrefattrs*="friendId="], a[href*="friendId="]');
      if (!el) {
        return null;
      }
      var str = el.getAttribute("hrefattrs") || el.getAttribute("href");
      if (!str) {
        return null;
      }
      var res = /\.layer\.friendId=(\d+)/.exec(str) || /\.friendId=(\d+)/.exec(str);
      return res ? res[1] : null;
    }();
    var giftImageElement = function() {
      return giftElement.querySelector(".gift") || giftElement.querySelector(".gift-front_wishes-cloud");
    }();
    var giftId = function() {
      var str = giftImageElement.getAttribute("style");
      if (!str) {
        return null;
      }
      var res = /url\([\/\w\d".?=&%-_]+photoId=(\d+)/.exec(str);
      return res ? res[1] : null;
    }();
    var giftType = function() {
      if (giftElement.classList.contains("veselishki_card")) {
        return "99";
      }
      var str = giftImageElement.getAttribute("style");
      if (!str) {
        return null;
      }
      var res = /url\([\/\w\d".?=&%-_]+&type=(\d+)/.exec(str);
      return res ? res[1] : null;
    }();
    var giftImage = function() {
      var str = giftImageElement.getAttribute("style");
      if (!str) {
        return null;
      }
      var res = /url\(([\/\w\d".?=&%-_]+&type=\d+)\)/.exec(str);
      return res ? res[1] : null;
    }();
    return {userId:userId, giftId:giftId, giftType:giftType, giftImage:giftImage};
  }, handleFreeButton:function(event, target) {
    var log = debug.bind(debug, "handleFreeButton:");
    log("handle");
    var element = target || event.currentTarget;
    var giftElement = veselishki.closestParent(element, "gift-card");
    if (!giftElement) {
      log("gift element is not found");
      return;
    }
    var giftData = veselishki.collectGiftData(giftElement);
    if (!giftData.giftId) {
      log("gift id is null");
      return;
    }
    if (!giftData.giftType) {
      log("gift type is null");
      return;
    }
    event.stopPropagation();
    event.preventDefault();
    if (veselishki.userID === giftData.userId) {
      veselishki.showAlertWindow("\u0412\u044b \u043d\u0435 \u043c\u043e\u0436\u0435\u0442\u0435 \u0441\u0430\u043c\u043e\u043c\u0443 \u0441\u0435\u0431\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u044f\u0442\u044c \u043f\u043e\u0434\u0430\u0440\u043e\u043a", function() {
      });
      return;
    }
    if (giftData.userId) {
      switch(giftData.giftType) {
        case "1":
        ;
        case "4":
        ;
        case "9":
        ;
        case "13":
        ;
        case "15":
          return veselishki.renderPresentOffer(giftData.giftId, giftData.giftType, giftData.userId);
        case "6":
          return veselishki.renderPresentOffer(giftData.giftId, "4", giftData.userId);
        case "99":
          return veselishki.doRenderPresentOffer(giftElement, giftData.giftId, "99", giftData.userId);
        default:
          debug("Unknown gift type", giftData);
          return veselishki.renderPresentOffer(giftData.giftId, giftData.giftType, giftData.userId);
      }
    } else {
      switch(giftData.giftType) {
        case "6":
          return veselishki.renderGiftFriendChooser(giftData.giftId, "4");
        case "99":
          return veselishki.doRenderPresentOffer(giftElement, giftData.giftId, "99");
        case "13":
        ;
        case "15":
        ;
        default:
          return veselishki.renderGiftFriendChooser(giftData.giftId, giftData.giftType);
      }
    }
  }, handleFreeButtonOkFriendChooserHeader:function(event) {
    event.preventDefault();
    event.stopPropagation();
    var giftElement = window.document.body.querySelector("#hook_Block_SelectFriendHeader .gift-card");
    var giftData = veselishki.collectGiftData(giftElement);
    (function() {
      var close = document.body.querySelector("#hook_Modal_popLayerModal #nohook_modal_close");
      if (!close) {
        return;
      }
      close.click();
    })();
    switch(giftData.giftType) {
      case "6":
        return veselishki.renderGiftFriendChooser(giftData.giftId, "4");
      case "99":
        return veselishki.doRenderPresentOffer(giftElement, giftData.giftId, "99");
      case "13":
      ;
      case "15":
      ;
      default:
        return veselishki.renderGiftFriendChooser(giftData.giftId, giftData.giftType);
    }
  }, handleFreeButtonOkFriendChooserFriend:function(event) {
    debug("handleFreeButtonOkFriendChooserFriend");
    event.preventDefault();
    event.stopPropagation();
    var parent = veselishki.closestParent(event.currentTarget, "ugrid_i");
    var elementA = parent.querySelector('a[href^="/gifts"], a[hrefattrs*=".friendId="]');
    var friendId = function() {
      var r = /st\.layer\.(?:friendId|uId)=(\d+)/.exec(elementA.getAttribute("hrefattrs"));
      return r ? r[1] : null;
    }();
    if (friendId === veselishki.userID) {
      veselishki.showAlertWindow("\u0412\u044b \u043d\u0435 \u043c\u043e\u0436\u0435\u0442\u0435 \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0441\u0435\u0431\u0435 \u043f\u043e\u0434\u0430\u0440\u043e\u043a!", function() {
      });
      return;
    }
    var giftElement = document.querySelector("#hook_Block_SelectFriendHeader .gift-card");
    var giftData = veselishki.collectGiftData(giftElement);
    (function() {
      var close = document.body.querySelector("#hook_Modal_popLayerModal #nohook_modal_close");
      if (!close) {
        return;
      }
      close.click();
    })();
    switch(giftData.giftType) {
      case "4":
      ;
      case "9":
      ;
      case "13":
      ;
      case "15":
        veselishki.renderPresentOffer(giftData.giftId, giftData.giftType, friendId);
        break;
      case "6":
        veselishki.renderPresentOffer(giftData.giftId, "4", friendId);
        break;
      case "99":
        veselishki.doRenderPresentOffer(giftElement, giftData.giftId, "99", friendId);
        break;
      default:
        debug("unknown gift type", giftData);
        veselishki.renderPresentOffer(giftData.giftId, giftData.giftType, friendId);
    }
  }, freeButtonId:function() {
    var id = function(a) {
      return a[parseInt(Math.random() * a.length)] + parseInt(Math.random() * 1E6).toString(16);
    }(["a", "b", "c", "d", "e", "f", "g", "h"]);
    return id;
  }(), makeFreeButton:function() {
    var id = veselishki.freeButtonId;
    var html = null;
    if (veselishki.config.useFullButton) {
      html = '<div data-element="' + id + '" class="veselishki_dialog_button_send_free"></div>';
    } else {
      html = '<div class="gift-price_w veselishki-gift" style="top:0; margin-top:0; z-index:10000; cursor:pointer;">\n                            <div data-element="' + id + '"class="gift-price">\u041e\u0422\u041f\u0420\u0410\u0412\u0418\u0422\u042c<br/>\u0411\u0415\u0421\u041f\u041b\u0410\u0422\u041d\u041e</div>\n                    </div>';
    }
    return veselishki.makeDomElement(html);
  }, insertFreeButton:function(element) {
    if (!element) {
      return;
    }
    if (element.querySelector(".veselishki-gift")) {
      return;
    }
    var log = function() {
    };
    log(element);
    var notUsed = ['a[href*="PromoMainLayer"]'].join(", ");
    if (false && element.querySelector(notUsed)) {
      log("element is not used");
      return;
    }
    var container = function() {
      if (element.classList.contains("gift-card")) {
        return element;
      }
      return element.querySelector(".gift-card");
    }();
    if (!container) {
      log("container is not found");
      return;
    }
    var button = veselishki.makeFreeButton();
    button.addEventListener("click", veselishki.handleFreeButton);
    container.appendChild(button);
  }, showStickersUploadedStatus:function(widget, status) {
    var loader = widget.querySelector("." + veselishki.makeClass("veselishki_stickers_loader"));
    if (!loader) {
      return;
    }
    loader.style.display = status ? "block" : "none";
  }, getUserChatData:function() {
    var userId = function() {
      var chatElement = window.document.querySelector("div.chat[data-id]");
      if (!chatElement) {
        return null;
      }
      var value = chatElement.dataset["id"];
      if (!value) {
        return null;
      }
      if (!/PRIVATE_/.test(value)) {
        return null;
      }
      return value.replace("PRIVATE_", "");
    }();
    var userName = function() {
      var userNameElement = window.document.querySelector(".js-opponent-name");
      if (!userNameElement) {
        return null;
      }
      return userNameElement.innerText;
    }();
    return {userId:userId, userName:userName};
  }, addStickersButtonToChat:function() {
    var log = debug.bind(debug, "addStickersButtonToChat:");
    var container = window.document.querySelector(".chat_write");
    if (!container) {
      return log("cannot find chat container");
    }
    if (container.querySelector("." + veselishki.makeClass("veselishki_stickers_widget"))) {
      return log("widget has been added");
    }
    var hookData = function() {
      var element = container.querySelector('[data-place="MESSAGING"][data-preview-url]');
      if (!element) {
        return null;
      }
      var url = element.getAttribute("data-preview-url");
      if (!url) {
        return null;
      }
      var hookId = function(r) {
        return r ? r[1] : null;
      }(/st\.a\.hookId=(\d+)/.exec(url));
      if (!hookId) {
        return null;
      }
      var objectId = function(r) {
        return r ? r[1] : null;
      }(/st\.a\.objectId=([\d_]+)/.exec(url));
      if (!objectId) {
        return null;
      }
      return {hookId:hookId, objectId:objectId};
    }();
    function sendPresent(presentData) {
      var chatData = veselishki.getUserChatData();
      var userId = chatData.userId;
      var userName = chatData.userName;
      var linkType = function() {
        switch(presentData.section) {
          case "sticker":
            return 1;
          case "present":
            return 2;
          case "postcard":
            return 3;
          case "fast":
            return 11;
          case "surprise":
            return 15;
          case "gif":
            return 22;
          default:
            return 0;
        }
      }();
      function tryToPostNote(sentLinkType) {
        debug(presentData, presentData.presentPrivate);
        if (presentData.presentPrivate) {
          return;
        }
        if (!presentData.postNote) {
          return;
        }
        var lt = function() {
          switch(sentLinkType) {
            case 2:
              return 8;
            case 3:
              return 9;
            case 22:
              return 23;
            case 15:
              return 16;
          }
          return 0;
        }();
        switch(presentData.section) {
          case "surprise":
            veselishki.postNoteMessageWithLink(presentData.presentId, userId, userName, lt, function() {
            });
            break;
          default:
            if (veselishki.config.notesPostUrl) {
              veselishki.postNoteMessageWithLink(presentData.presentId, userId, userName, lt, function() {
              });
            } else {
              veselishki.sharePresentSent(userId, lt, presentData.noteURL || presentData.presentId, userName, "", presentData.presentType);
            }
          ;
        }
      }
      if (!userId) {
        return;
      }
      veselishki.showStickersUploadedStatus(presentData.widget, true);
      function sendShareMessage() {
        veselishki.presentSent();
        veselishki.sendShareDataToChat(userId, presentData.presentId, presentData.presentType, linkType, hookData, function(result) {
          veselishki.showStickersUploadedStatus(presentData.widget, false);
          if (!result) {
            return log("sending share message error");
          }
          tryToPostNote(linkType);
        });
      }
      if (presentData.section === "surprise") {
        log("send surprise to chat");
        var message = veselishki.surprise.getSurpriseMessage(presentData.presentId);
        veselishki.sendMessageToChat(userId, message, "", function(result) {
          if (!result) {
            log("sending surprise message to chat error");
            return;
          }
          log("sending message surprise to chat complete");
          sendShareMessage();
        });
      } else {
        veselishki.sendPresentToChat(userId, presentData.presentId, presentData.presentType, function(result) {
          if (!result) {
            log("sending message to chat error");
            veselishki.showStickersUploadedStatus(presentData.widget, false);
            return;
          }
          log("sending message to chat complete");
          sendShareMessage();
        });
      }
    }
    veselishki.addStickersButtonToContainer(container, sendPresent, true, {sticker:true, present:true, postcard:true, surprise:true, gif:true});
  }, addStickersButtonToConversation:function() {
    var container = window.document.querySelector(".mdialog_chat_add-comment");
    if (!container) {
      return debug("cannot find chat container");
    }
    if (container.querySelector("." + veselishki.makeClass("veselishki_stickers_widget"))) {
      return debug("widget has been added");
    }
    function sendPresent(presentData) {
      var conversationTopic = window.document.querySelector(".disc-i_sel");
      if (!conversationTopic) {
        debug("conversation topic has not found");
        return;
      }
      var topicData = veselishki.JSONParse(conversationTopic.getAttribute("data-query"));
      if (!topicData) {
        debug("conversation topic has no query data");
        return;
      }
      veselishki.showStickersUploadedStatus(presentData.widget, true);
      veselishki.loadDiscussion(topicData.id, topicData.type, function(discussionChat) {
        if (!discussionChat) {
          veselishki.showStickersUploadedStatus(presentData.widget, false);
          return debug("load discussion chat error");
        }
        veselishki.sendPresentToDiscussion(discussionChat, presentData.presentId, presentData.presentType, function(result) {
          if (!result) {
            veselishki.showStickersUploadedStatus(presentData.widget, false);
            return debug("sending present to discussion chat error");
          }
          veselishki.presentSent();
          var linkType = function() {
            switch(presentData.section) {
              case "sticker":
                return 5;
              case "present":
                return 6;
              case "postcard":
                return 7;
              case "fast":
                return 12;
              default:
                return 0;
            }
          }();
          if (veselishki.config.sendAsUrl) {
            veselishki.sendShareMessageLinkToDiscussion(linkType, presentData.presentId, topicData.id, topicData.type, function(result) {
              if (!result) {
                debug("sending share message as URL to discussion chat error");
              }
              veselishki.showStickersUploadedStatus(presentData.widget, false);
            }, 2);
          } else {
            veselishki.getOKLink(linkType, presentData.presentId, linkType, function(link) {
              if (!link) {
                veselishki.showStickersUploadedStatus(presentData.widget, false);
                return debug("get share link for discussion chat error");
              }
              var message = "";
              switch(presentData.section) {
                case "present":
                ;
                case "postcard":
                  message = veselishki.genPresentMessage(presentData.presentId, "", "", true, link);
                  break;
                case "fast":
                ;
                default:
                  message = veselishki.genNewMessage(presentData.presentId, presentData.presentType + "im", false, 1, 1, link);
              }
              veselishki.sendMessageToDiscussion(discussionChat, message, function(result) {
                if (!result) {
                  debug("sending share message to discussion chat error");
                }
                veselishki.showStickersUploadedStatus(presentData.widget, false);
              });
            });
          }
        });
      });
    }
    veselishki.addStickersButtonToContainer(container, sendPresent);
  }, "addStikersButton":function(object, tbClass, bType) {
    var inEl = object.querySelector(".chat_write");
    if (bType == 1) {
      inEl = object;
    } else {
      if (bType == 2) {
        inEl = object.querySelector(".comments_add");
      }
    }
    if (inEl) {
      var topEl = bType !== 2 ? veselishki.closestParent(object, tbClass) : false;
      if (topEl && topEl.id || bType == 2) {
        var oldBut = object.getElementsByClassName(veselishki.makeClass("veselishki_buttoni"))[0];
        if (oldBut) {
          oldBut.parentNode.removeChild(oldBut);
        }
        var butClass = topEl.id == "hook_Block_MessagesLayer" ? veselishki.makeClass("veselishki_button_chat") : veselishki.makeClass("veselishki_button_dialog");
        if (bType == 1) {
          butClass = topEl.id == "topPanelPopup_d" ? veselishki.makeClass("veselishki_button_dialog") : veselishki.makeClass("veselishki_button_chat");
        } else {
          if (bType == 2) {
            butClass = veselishki.makeClass("veselishki_button_photocomment");
          }
        }
        var commentsForm = object.querySelector(".comments_form");
        var divEl = document.createElement("div");
        divEl.className = veselishki.makeClass("veselishki_buttoni") + " " + butClass;
        var anc = document.createElement("a");
        anc.className = veselishki.makeClass("veselishki_panelbutton_anc");
        anc.setAttribute("href", "#");
        anc.addEventListener("click", function(event) {
          veselishki.showPanel(event.currentTarget, false, event);
        });
        anc.innerHTML = '<span class="' + veselishki.makeClass("veselishki_panelbutton") + '"></span>';
        var newCount = veselishki.packs.newPacks.length;
        var newCountDiv = undefined;
        if (newCount > 0) {
          newCountDiv = document.createElement("div");
          newCountDiv.className = veselishki.makeClass("veselishki_new_label") + " " + veselishki.makeClass("veselishki_new_count");
          newCountDiv.innerHTML = newCount;
          anc.appendChild(newCountDiv);
        }
        divEl.appendChild(anc);
        anc = document.createElement("a");
        anc.setAttribute("href", "#");
        anc.addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          veselishki.showPresentsSelector(event.currentTarget);
        });
        anc.innerHTML = '<span class="' + veselishki.makeClass("veselishki_panelgift") + '"></span>';
        divEl.appendChild(anc);
        anc = document.createElement("a");
        anc.className = veselishki.makeClass("veselishki_panelbutton_anc");
        anc.setAttribute("href", "#");
        anc.addEventListener("click", function(event) {
          veselishki.showCardsSelector(event.currentTarget);
        });
        anc.innerHTML = '<span class="' + veselishki.makeClass("veselishki_panelcard") + '"></span>';
        newCountDiv = document.createElement("div");
        newCountDiv.className = veselishki.makeClass("veselishki_new_label") + " " + veselishki.makeClass("veselishki_new_count");
        newCountDiv.innerHTML = "new";
        anc.appendChild(newCountDiv);
        divEl.appendChild(anc);
        var fastStikerLine = document.createElement("div");
        fastStikerLine.className = veselishki.makeClass("veselishki_fastline");
        var fastLineIn = document.createElement("div");
        fastLineIn.className = veselishki.makeClass("veselishki_fastline_in");
        var fastLineList = document.createElement("div");
        fastLineList.className = veselishki.makeClass("veselishki_fastline_list");
        for (var i = 0;i < veselishki.config.fastAnswers.length;i++) {
          anc = document.createElement("a");
          anc.setAttribute("href", "#");
          anc.setAttribute("data-id", veselishki.config.fastAnswers[i]);
          anc.setAttribute("style", "margin-right:5px;");
          anc.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            veselishki.hideFastPreview();
            var loadingEl = event.currentTarget.parentNode.parentNode.parentNode.getElementsByClassName(veselishki.makeClass("veselishki_fastpanel_loading"))[0];
            if (loadingEl) {
              loadingEl.style.display = "block";
            }
            veselishki.doSendLocalSticker(event.currentTarget, event.currentTarget.getAttribute("data-id"), "fs");
          });
          anc.addEventListener("mouseout", function(event) {
            veselishki.hideFastPreview();
          });
          anc.addEventListener("mouseover", function(event) {
            veselishki.showFastPreview(event.currentTarget);
          });
          anc.innerHTML = '<img src="' + veselishki.config.localStickersPath + veselishki.createPresentPath(veselishki.config.fastAnswers[i]) + 'file.png" height="38" />';
          fastLineList.appendChild(anc);
        }
        anc = document.createElement("a");
        anc.setAttribute("href", "#");
        anc.className = veselishki.makeClass("veselishki_fastline_left");
        anc.addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          var container = event.currentTarget.parentNode.getElementsByClassName(veselishki.makeClass("veselishki_fastline_list"))[0];
          if (container) {
            var lft = container.style.left ? parseInt(container.style.left) : 0;
            if (lft < 0) {
              lft = lft + 43;
              container.style.left = lft + "px";
            }
          }
        });
        fastLineIn.appendChild(fastLineList);
        fastStikerLine.appendChild(anc);
        fastStikerLine.appendChild(fastLineIn);
        anc = document.createElement("a");
        anc.setAttribute("href", "#");
        anc.className = veselishki.makeClass("veselishki_fastline_right");
        anc.addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          var container = event.currentTarget.parentNode.getElementsByClassName(veselishki.makeClass("veselishki_fastline_list"))[0];
          if (container) {
            var lft = container.style.left ? parseInt(container.style.left) : 0;
            var maxMin = -1 * (container.offsetWidth - 386);
            if (lft > maxMin) {
              lft = lft - 43;
              container.style.left = lft + "px";
            }
          }
        });
        fastStikerLine.appendChild(anc);
        var loading = document.createElement("div");
        loading.className = veselishki.makeClass("veselishki_fastpanel_loading");
        fastStikerLine.appendChild(loading);
        divEl.appendChild(fastStikerLine);
        inEl.insertBefore(divEl, inEl.children[0]);
        return true;
      }
    }
    return false;
  }, "showFastPreview":function(span) {
    veselishki.hideFastPreview();
    var lft = span.parentNode.style.left ? parseInt(span.parentNode.style.left) : 0;
    var stickerID = span.getAttribute("data-id");
    var previewDiv = document.createElement("div");
    previewDiv.className = "iblock-cloud __light __emoji " + veselishki.makeClass("veselishki_preview");
    previewDiv.setAttribute("style", "top: " + (span.offsetTop - span.parentNode.scrollTop - 100) + "px; left: " + (span.offsetLeft + 290 + lft) + "px;");
    var img = document.createElement("img");
    img.setAttribute("width", "128");
    img.src = veselishki.config.localStickersPath + veselishki.createPresentPath(stickerID) + "file.png";
    previewDiv.appendChild(img);
    span.parentNode.parentNode.parentNode.parentNode.appendChild(previewDiv);
  }, "hideFastPreview":function() {
    var previewDiv = document.querySelector("." + veselishki.makeClass("veselishki_preview"));
    if (previewDiv) {
      previewDiv.parentNode.removeChild(previewDiv);
    }
  }, hideShareMessages:function(node) {
    if (!node) {
      return;
    }
    if (node.classList && node.classList.contains("d_comment_w") && node.classList.contains("d_comment_w__avatar") && node.classList.contains("show-on-hover")) {
      var comment = node.querySelector(".d_comment_w_center .d_comment_right_w .d_comment_text.textWrap");
      if (comment && veselishki.isShareMessage(comment.innerText)) {
        veselishki.processShareMessage(node);
        return;
      }
    }
    node.querySelectorAll(".comments_text").forEach(function(item) {
      if (!veselishki.isShareMessage(item.innerText)) {
        return;
      }
      var parent = veselishki.closestParent(item, "comments_i");
      if (!parent) {
        return debug("Share message exist but has no parent node");
      }
      veselishki.processShareMessage(parent);
    });
  }, processChild:function(object) {
    var log = function() {
    };
    if (!object) {
      return;
    }
    if (!object.tagName) {
      return;
    }
    log("start");
    if (DEV) {
    }
    veselishki.hideShareMessages(object);
    log("gift-card");
    if (object.classList && object.classList.contains("gift-card")) {
      return veselishki.insertFreeButton(object);
    }
    log("gift-card query");
    object.querySelectorAll(".gift-card:not(.__xs):not(.__stub):not(.veselishki_card):not(.veselishki_element)").forEach(veselishki.insertFreeButton);
    log("#hook_Block_SelectFriendHeader");
    (function() {
      if (!object.querySelector("#hook_Block_SelectFriendHeader")) {
        return;
      }
      if (object.querySelector("#hook_Block_SelectFriendHeader .modal-gift-service")) {
        return;
      }
      if (object.querySelector("#hook_Block_SelectFriendHeader .veselishki-send-free")) {
        return;
      }
      var container = object.querySelector("#hook_Block_SelectFriendHeader");
      var buttonHTML = '<div class="gift-price_w veselishki-send-free" \n                                   style="top: 40px !important;\n                                   margin-top:0 !important;\n                                   z-index:10000 !important;\n                                   cursor:pointer !important;\n                                   display: block !important;\n                                   transform: none !important;\n                                   margin-left: 105px !important;\n                                   text-align: center !important;\n                                   box-sizing: content-box !important;"><div class="gift-price" style="font-size: 20px !important;\n                                                                              line-height: 20px !important;\n                                                                              padding: 10px !important;\n                                                                              border-radius: 10px !important;\n                                                                              box-sizing: content-box !important;">\u041e\u0422\u041f\u0420\u0410\u0412\u0418\u0422\u042c \u0411\u0415\u0421\u041f\u041b\u0410\u0422\u041d\u041e</div></div>';
      container.insertAdjacentHTML("beforeend", buttonHTML);
      container.querySelector(".veselishki-send-free").addEventListener("click", veselishki.handleFreeButtonOkFriendChooserHeader);
    })();
    log("ugrid_i");
    if (object.classList.contains("ugrid_i")) {
      if (object.querySelector(".veselishki-gift")) {
        return;
      }
      var selectorsNotUsed = ['a[href^="/gifts/MyWishList"]', 'a[href*="FriendsWithWishList"]', 'a[href*="st.cat=MyWishList"]', 'a[hrefattrs*="FriendsWithWishList"]', 'a[hrefattrs*="st.cat=service"]', 'a[hrefattrs*="st.layer.friendIdForOkGift"]', 'a[href*="PromoMainLayer"]'];
      if (object.querySelector(selectorsNotUsed.join(", "))) {
        return;
      }
      var selectors = ['a[href="/gifts"]', 'a[href^="/gifts?"]', 'a[href^="/gifts/"]', 'a[href*="st.layer.presentId="]', 'a[hrefattrs*="st.layer.presentId="]'];
      var aElement = object.querySelector(selectors.join(", "));
      if (!aElement) {
        return;
      }
      var freeButton = veselishki.makeFreeButton();
      freeButton.addEventListener("click", veselishki.handleFreeButtonOkFriendChooserFriend);
      object.style.position = "relative";
      object.appendChild(freeButton);
      return;
    }
    log("ugrid_i query");
    object.querySelectorAll(".ugrid:not(.__service) .ugrid_i").forEach(veselishki.processChild);
    log("like button discussion header");
    if (object.classList && object.classList.contains("dsub") && object.parentNode.classList.contains("disc_header")) {
      veselishki.addEmojiButtonToDiscussionHeader(object.querySelector("ul.controls-list li.controls-list_item div.klass_w span a"));
      return;
    }
    log("add like buttons");
    log("comments_smiles_cnt");
    if (object.classList && object.classList.contains("comments_smiles_cnt")) {
      var sets = object.querySelectorAll(".comments_smiles_set");
      sets.forEach(function(set) {
        var smiles = set.querySelectorAll(".comments_smiles_i");
        smiles.forEach(function(smile) {
          var posR = smile.querySelector(".posR");
          if (!posR) {
            return;
          }
          if (!posR.querySelector(".usmile.__sticker")) {
            return;
          }
          debug("addFreeButton sendLocalSticker");
          veselishki.addFreeButton(posR, function(obj) {
            veselishki.sendLocalSticker(obj);
          });
        });
      });
      return;
    }
    log("toolbar-layer_cnt");
    if (object.classList && object.classList.contains("toolbar-layer_cnt")) {
      veselishki.addStickersButtonToChat();
      object.querySelectorAll(".msg").forEach(veselishki.processChild);
    }
    log("chat");
    if (object.classList && object.classList.contains("chat")) {
      var msgs = object.querySelectorAll(".msg");
      for (var i = 0;i < msgs.length;i++) {
        veselishki.processChild(msgs[i]);
      }
      veselishki.addStickersButtonToChat();
      return;
    }
    try {
      if (object.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.classList.contains("msg")) {
        object = object.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
      }
    } catch (error) {
    }
    log("msg");
    if (object.classList && object.classList.contains("msg")) {
      veselishki.checkRenderStiker(object);
      veselishki.surprise.checkSurpriseMessage(object);
      return;
    }
    log("mainContent");
    if (object.id && object.id === "mainContent") {
      (function() {
        if (!object.classList || !object.classList.contains("gifts")) {
          return;
        }
        var giftContainer = object.querySelector("#hook_Block_FriendPresentsMRBx");
        if (!giftContainer) {
          giftContainer = object.querySelector("#hook_Block_GiftsFrontContentRBx");
        }
        if (giftContainer) {
          var friendID = false;
          var giftReciever = document.querySelector(".gift-reciever");
          if (giftReciever) {
            var giftRecieverAnc = giftReciever.querySelector('a[hrefattrs*="friendMain"]');
            if (!giftRecieverAnc) {
              giftRecieverAnc = giftReciever.querySelector('a[href*="friendMain"]');
            }
            if (giftRecieverAnc) {
              var hrefAttrs = giftRecieverAnc.getAttribute("hrefattrs");
              if (!hrefAttrs) {
                hrefAttrs = giftRecieverAnc.getAttribute("href");
              }
              friendID = hrefAttrs.split("st.friendId=")[1].split("&")[0];
            }
          } else {
            var midColumn = document.querySelector("#hook_Block_MiddleColumnTopCard_MenuUser");
            if (midColumn) {
              friendID = veselishki.userID;
            }
          }
          if (friendID) {
            veselishki.loadFriendPresents(friendID, giftContainer);
            var middleContainer = object.querySelector("#hook_Block_GiftsFrontMRB");
            if (middleContainer && friendID !== veselishki.userID && !middleContainer.querySelector(".veselishki_card_promo_button")) {
              var cardsButton = document.createElement("div");
              cardsButton.setAttribute("data-friendid", friendID);
              cardsButton.className = "button-pro " + veselishki.makeClass("veselishki_card_promo_button");
              cardsButton.innerHTML = "\u041e\u0422\u041f\u0420\u0410\u0412\u0418\u0422\u042c \u042d\u041a\u0421\u041a\u041b\u042e\u0417\u0418\u0412\u041d\u0423\u042e \u041e\u0422\u041a\u0420\u042b\u0422\u041a\u0423 \u0411\u0415\u0421\u041f\u041b\u0410\u0422\u041d\u041e";
              cardsButton.addEventListener("click", function(event) {
                veselishki.showCardsSelector(event.currentTarget, friendID);
              });
              middleContainer.insertBefore(cardsButton, middleContainer.children[0]);
            }
          }
        }
      })();
      (function() {
        if (!document.querySelector("#mainContent.gifts")) {
          return;
        }
        if (object.querySelector("#ok_free_gifts_0x34face")) {
          return;
        }
        var menu = object.querySelector(".nav-side");
        if (!menu) {
          return;
        }
        var buttonHTML = '<a id="ok_free_gifts_0x34face" class="nav-side_i">' + ('   <span class="tico"><i class="tico_img ic ' + veselishki.makeClass("veselishki_ic_nav_free_gift") + '"></i>\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0435 \u043e\u0442\u043a\u0440\u044b\u0442\u043a\u0438</span>') + "</a>";
        menu.insertAdjacentHTML("afterbegin", buttonHTML);
        menu.querySelector("#ok_free_gifts_0x34face").addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          veselishki.showTopCards();
        });
      })();
    }
    log("notifs_wrap");
    if (object.classList && object.classList.contains("notifs_wrap")) {
      object.querySelectorAll(".ugrid_i").forEach(veselishki.processChild);
      return;
    }
    log("gift-front_cnt");
    if (object.classList && object.classList.contains("gift-front_cnt")) {
      var gifts = object.querySelectorAll(".ugrid_i");
      for (var i$30 = 0, l = gifts.length;i$30 < l;i$30++) {
        veselishki.processChild(gifts[i$30]);
      }
      return;
    }
    log("ugrid_i");
    try {
      if (object.children[0].children[0].classList.contains("ugrid_i")) {
        var gifts$31 = object.children[0].querySelectorAll(".ugrid_i");
        for (var i$32 = 0, l = gifts$31.length;i$32 < l;i$32++) {
          veselishki.processChild(gifts$31[i$32]);
        }
        return;
      }
    } catch (error$33) {
    }
    log("comments_i");
    if (object.children && object.children[0] && object.children[0].classList && object.children[0].classList.contains("comments_i")) {
      object = object.children[0];
    }
    if (object.classList && object.classList.contains("comments_i")) {
      var newObject = object.querySelector(".comments_text");
      if (newObject) {
        object = newObject;
      }
    }
    log("comments_text");
    try {
      if (object.parentNode.parentNode.classList.contains("comments_text")) {
        object = object.parentNode.parentNode;
      }
    } catch (error$34) {
    }
    log("comments_text");
    if (object.classList && object.classList.contains("comments_text")) {
      veselishki.checkRenderStiker(object);
      return;
    }
    log("photo-layer_bottom_cnt");
    if (object.classList && object.classList.contains("photo-layer_bottom_cnt")) {
      var objects = object.querySelectorAll(".comments_i,.js-addFormContainer");
      for (var o = 0;o < objects.length;o++) {
        veselishki.processChild(objects[o]);
      }
    }
    if (object.children && object.children[0] && object.children[0].classList && object.children[0].classList.contains("comments_i")) {
      object = object.children[0];
    }
    if (object.classList && object.classList.contains("mdialog_chat_add-comment") && !object.getElementsByClassName(veselishki.makeClass("veselishki_buttoni"))[0]) {
      veselishki.addStickersButtonToConversation();
    }
    if (object.classList && object.classList.contains("js-addFormContainer") && !object.getElementsByClassName(veselishki.makeClass("veselishki_buttoni"))[0]) {
      veselishki.addStickersButtonToConversation();
    }
    if (object.classList && object.classList.contains("d_comment_w")) {
      var comText = object.getElementsByClassName("d_comment_text")[0];
      if (comText) {
        veselishki.checkRenderStiker(comText);
        return;
      }
    }
    if (object.querySelector && object.querySelector(".widget-list > .widget-list_i > div > div > button.controls-list_lk")) {
      veselishki.addEmojiButtonToFeed(object.querySelector(".widget-list > .widget-list_i > div > div > button.controls-list_lk"));
    }
  }, loadFriendPresents:function(friendID, giftsContainer) {
    veselishki.Loader({onLoad:function(event) {
      if (!event.currentTarget.response) {
        return;
      }
      var data = event.currentTarget.response;
      if (!data.list) {
        return;
      }
      var divEl = document.createElement("div");
      divEl.className = "gift-front_cnt";
      var finHTML = '<div class="portlet_h"><div class="portlet_h_name_t">\u041e\u0441\u043e\u0431\u0435\u043d\u043d\u044b\u0435</div></div><div><div class="ugrid __xl mb-8x"><div class="ugrid_cnt">';
      for (var i = 0;i < data.list.length;i++) {
        finHTML += '<div class="ugrid_i soh-s"><div class="gift-card __s soh-s h-mod"><a title="\u0423\u0434\u0430\u043b\u0438\u0442\u044c" href="/gifts/my" class="ic10 ic10_close-g gift-front_i_close" style="display:none"></a><div class="gift ' + data.list[i].dopClass + '" style="background-image: url(' + data.list[i].src + ')"><a href="' + data.list[i].url + '" class="gift_a"></a></div><div class="gift-price_w"></div></div><div class="gift-card-info ellip"><div class="gift_receiver" style="display:none">\u041e\u0442&nbsp;<span class="shortcut-wrap"><a href="#" class="o">noname</a></span></div><div class="mt-x timestamp foh-s">' + 
        data.list[i].timestamp + "</div></div></div>";
      }
      finHTML += "</div></div></div>";
      divEl.innerHTML = finHTML;
      giftsContainer.insertBefore(divEl, giftsContainer.children[0]);
    }, onError:function(event) {
    }, responseType:"json", url:veselishki.domain + "json.php?ac=g&u=" + veselishki.uniID + "&o=" + friendID + "&a=1"});
  }, "sendPresent":function(el) {
    debug("sendPresent");
    var anc = el.parentNode.querySelector("a");
    if (!anc) {
      return;
    }
    var linkData = veselishki.processGiftLink(anc);
    if (linkData.friendID == 0 || linkData.giftID == 0) {
      return;
    }
    var gft = anc.parentNode;
    if (!gft.classList.contains("gift")) {
      var header = document.getElementById("hook_Block_SelectFriendHeader");
      if (header) {
        gft = header.querySelector(".gift");
      } else {
        gft = anc.parentNode.querySelector(".gift");
      }
    }
    var tp = 4;
    if (gft && (gft.classList.contains("__animated") || gft.classList.contains("__spriteAnimation"))) {
      tp = 13;
    }
    veselishki.renderPresentOffer(linkData.giftID, tp, linkData.friendID);
  }, loadServerPresentData:function(okPresentId, presentType, onResult) {
    new veselishki.Loader({responseType:"json", onLoad:function(event) {
      if (event.currentTarget.status !== 200) {
        debug("loading server present data error, status is not 200");
        onResult(false);
        return;
      }
      if (!event.currentTarget.response) {
        debug("loading server present data error, data is not json");
        onResult(false);
        return;
      }
      if (event.currentTarget.response.status !== "ok") {
        debug('loading server present data error, status is not "ok"');
        onResult(false);
        return;
      }
      onResult(event.currentTarget.response);
    }, onError:function(event) {
      debug("loading server present data error");
      onResult(false);
    }, url:veselishki.domain + "json.php?ac=p&p=" + okPresentId + "&tp=" + presentType});
  }, renderPresentOffer:function(presentID, tp, friendID) {
    debug("renderPresentOffer");
    if (veselishki.renderingPresentOffer) {
      alert("\u0418\u0434\u0435\u0442 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445 \u043f\u043e\u0434\u0430\u0440\u043a\u0430, \u043f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u043e\u0434\u043e\u0436\u0434\u0438\u0442\u0435");
      return;
    }
    veselishki.renderingPresentOffer = true;
    veselishki.showGlobalLoadingProcess(true);
    veselishki.loadServerPresentData(presentID, tp, function(result) {
      veselishki.renderingPresentOffer = false;
      veselishki.showGlobalLoadingProcess(false);
      if (result) {
        veselishki.doRenderPresentOffer(false, result["id"], tp, friendID);
      } else {
        alert(veselishki.getResponseErrorMessage(""));
      }
    });
  }, "doRenderPresentOffer":function(caller, ourGiftID, tp, friendID) {
    debug("doRenderPresentOffer");
    if (veselishki.renderingPresentOffer) {
      alert("\u0418\u0434\u0435\u0442 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445 \u043f\u043e\u0434\u0430\u0440\u043a\u0430, \u043f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u043e\u0434\u043e\u0436\u0434\u0438\u0442\u0435");
      return;
    }
    veselishki.renderingPresentOffer = true;
    veselishki.showGlobalLoadingProcess(true);
    var method = tp === "99" ? "doRenderCardOffer2" : "doRenderPresentOffer2";
    if (caller && !friendID) {
      friendID = caller.getAttribute("data-friendid");
    }
    if (friendID) {
      veselishki.loaders.loadUserData(friendID, function(userData) {
        veselishki.renderingPresentOffer = false;
        veselishki.showGlobalLoadingProcess(false);
        if (userData.blocked) {
          veselishki.showAlertWindow("\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0437\u0430\u043d\u0451\u0441 \u0412\u0430\u0441 \u0432 \u0447\u0451\u0440\u043d\u044b\u0439 \u0441\u043f\u0438\u0441\u043e\u043a. \u0415\u043c\u0443 \u043d\u0435\u043b\u044c\u0437\u044f \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043f\u043e\u0434\u0430\u0440\u043e\u043a.", function() {
          });
        } else {
          veselishki[method](caller, ourGiftID, tp, userData.id, userData.name, userData.avatar);
        }
      });
    } else {
      veselishki.renderingPresentOffer = false;
      veselishki.showGlobalLoadingProcess(false);
      veselishki[method](caller, ourGiftID, tp);
    }
  }, "doRenderCardOffer2":function(caller, ourGiftID, tp, friendID, name, imgS) {
    debug("doRenderCardOffer2");
    var plm = document.getElementById("hook_Modal_popLayerModal");
    if (plm) {
      plm.parentNode.removeChild(plm);
    }
    var divEl = document.createElement("div");
    divEl.className = veselishki.makeClass("veselishki_splash_box");
    var inHTML = '<div class="' + veselishki.makeClass("veselishki_splash_box_container") + '"><div class="' + veselishki.makeClass("veselishki_splash_box_title") + '">\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043e\u0442\u043a\u0440\u044b\u0442\u043a\u0443 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e</div><div class="' + veselishki.makeClass("veselishki_splash_box_content") + '" style="text-align:center;">';
    if (friendID) {
      inHTML += "\u0412\u044b \u0441\u043e\u0431\u0438\u0440\u0430\u0435\u0442\u0435\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u0443\u044e \u043e\u0442\u043a\u0440\u044b\u0442\u043a\u0443 \u0434\u043b\u044f <b>" + name + "</b>.";
    } else {
      inHTML += "\u0412\u044b \u0441\u043e\u0431\u0438\u0440\u0430\u0435\u0442\u0435\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u0443\u044e \u043e\u0442\u043a\u0440\u044b\u0442\u043a\u0443.";
    }
    inHTML += '<br/><br/><video width="500" src="' + veselishki.config.otkritkiPath + "cards/" + ourGiftID + '/video.mp4" autoplay="" loop=""></video>';
    inHTML += '<div class="irc_w-p"><input id="sendPresentPrivately" type="checkbox" class="irc"><span class="irc_l" style="font-size:11px;"><label for="sendPresentPrivately">\u041f\u0440\u0438\u0432\u0430\u0442\u043d\u043e</label>&nbsp;<wbr><span class="lstp-t">\u0422\u043e\u043b\u044c\u043a\u043e \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044c \u0443\u0437\u043d\u0430\u0435\u0442, \u043e\u0442 \u043a\u043e\u0433\u043e \u043f\u043e\u0434\u0430\u0440\u043e\u043a</span></span></div>';
    inHTML += '<br/><br/><button class="' + veselishki.makeClass("veselishki_splash_box_button") + '" data-prid="' + ourGiftID + '">\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c</button>&nbsp;&nbsp;&nbsp;<a href="#" onclick="this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode);return false;">\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c</a><div style="clear:both"></div></div><div class="' + veselishki.makeClass("veselishki_gift_loading") + '"></div></div>';
    divEl.innerHTML = inHTML;
    if (friendID) {
      divEl.querySelector("." + veselishki.makeClass("veselishki_splash_box_button")).addEventListener("click", function(event) {
        var loadingEl = event.currentTarget.parentNode.parentNode.parentNode.querySelector("." + veselishki.makeClass("veselishki_gift_loading"));
        if (loadingEl) {
          loadingEl.style.display = "block";
        }
        veselishki.doSendPresent(event.currentTarget, friendID, event.currentTarget.getAttribute("data-prid"), tp, "", name);
      });
    } else {
      divEl.querySelector("." + veselishki.makeClass("veselishki_splash_box_button")).addEventListener("click", function(event) {
        var loadingEl = event.currentTarget.parentNode.parentNode.parentNode.querySelector("." + veselishki.makeClass("veselishki_gift_loading"));
        if (loadingEl) {
          loadingEl.style.display = "block";
        }
        veselishki.doSendGlobalPresent(caller, event.currentTarget, event.currentTarget.getAttribute("data-prid"), tp);
      });
    }
    document.body.appendChild(divEl);
  }, doRenderPresentOffer2:function(caller, ourGiftID, tp, friendID, name, imgS, onComplete) {
    debug("doRenderPresentOffer2");
    if (veselishki.renderingPresentOffer) {
      alert("\u0418\u0434\u0435\u0442 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0430 \u0434\u0430\u043d\u043d\u044b\u0445 \u043f\u043e\u0434\u0430\u0440\u043a\u0430, \u043f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430, \u043f\u043e\u0434\u043e\u0436\u0434\u0438\u0442\u0435");
      return;
    }
    var dopClass = function() {
      if (tp === "13") {
        return "__animated";
      }
      if (tp === "15") {
        return "__animated-256";
      }
      return "";
    }();
    var dopMsg = tp === "13" ? "a" : "";
    var divEl = document.createElement("div");
    divEl.className = veselishki.makeClass("veselishki_splash_box");
    var inHTML = '<div class="' + veselishki.makeClass("veselishki_splash_box_container") + '"><div class="' + veselishki.makeClass("veselishki_splash_box_title") + '">\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043f\u043e\u0434\u0430\u0440\u043e\u043a \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e</div><div class="' + veselishki.makeClass("veselishki_splash_box_content") + '" style="text-align:center;">';
    if (friendID) {
      inHTML += "\u0412\u044b \u0441\u043e\u0431\u0438\u0440\u0430\u0435\u0442\u0435\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439 \u043f\u043e\u0434\u0430\u0440\u043e\u043a \u0434\u043b\u044f <b>" + name + '</b>.<br/><br/><br/><img src="' + imgS + '" style="height:128px;margin-right:50px;" />';
    } else {
      inHTML += "\u0412\u044b \u0441\u043e\u0431\u0438\u0440\u0430\u0435\u0442\u0435\u0441\u044c \u043e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0439 \u043f\u043e\u0434\u0430\u0440\u043e\u043a.<br/><br/><br/>";
    }
    inHTML += '<div class="gift ' + dopClass + '" style="background-image:url(' + veselishki.makePresentURL(ourGiftID) + ');background-size:cover;display:inline-block;"></div><br/><br/><textarea style="width: 300px;display:inline-block;" placeholder="\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043f\u043e\u0436\u0435\u043b\u0430\u043d\u0438\u0435 \u0438\u043b\u0438 \u043f\u043e\u0437\u0434\u0440\u0430\u0432\u043b\u0435\u043d\u0438\u0435..." class="itx presentWish"></textarea>';
    inHTML += '<div class="irc_w-p"><input id="sendPresentPrivately" type="checkbox" class="irc"><span class="irc_l" style="font-size:11px;"><label for="sendPresentPrivately">\u041f\u0440\u0438\u0432\u0430\u0442\u043d\u043e</label>&nbsp;<wbr><span class="lstp-t">\u0422\u043e\u043b\u044c\u043a\u043e \u043f\u043e\u043b\u0443\u0447\u0430\u0442\u0435\u043b\u044c \u0443\u0437\u043d\u0430\u0435\u0442, \u043e\u0442 \u043a\u043e\u0433\u043e \u043f\u043e\u0434\u0430\u0440\u043e\u043a</span></span></div>';
    inHTML += '<br/><br/><button class="' + veselishki.makeClass("veselishki_splash_box_button") + '" data-prid="' + ourGiftID + '">\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c</button>&nbsp;&nbsp;&nbsp;<a href="#" onclick="this.parentNode.parentNode.parentNode.parentNode.removeChild(this.parentNode.parentNode.parentNode);return false;">\u041e\u0442\u043c\u0435\u043d\u0438\u0442\u044c</a><div style="clear:both"></div></div><div class="' + veselishki.makeClass("veselishki_gift_loading") + '"></div></div>';
    divEl.innerHTML = inHTML;
    if (friendID) {
      divEl.querySelector("." + veselishki.makeClass("veselishki_splash_box_button")).addEventListener("click", function(event) {
        var loadingEl = event.currentTarget.parentNode.parentNode.parentNode.querySelector("." + veselishki.makeClass("veselishki_gift_loading"));
        if (loadingEl) {
          loadingEl.style.display = "block";
        }
        veselishki.doSendPresent(event.currentTarget, friendID, event.currentTarget.getAttribute("data-prid"), tp, dopMsg, name, onComplete);
      });
    } else {
      divEl.querySelector("." + veselishki.makeClass("veselishki_splash_box_button")).addEventListener("click", function(event) {
        var loadingEl = event.currentTarget.parentNode.parentNode.parentNode.querySelector("." + veselishki.makeClass("veselishki_gift_loading"));
        if (loadingEl) {
          loadingEl.style.display = "block";
        }
        veselishki.doSendGlobalPresent(caller, event.currentTarget, event.currentTarget.getAttribute("data-prid"), tp, onComplete);
      });
    }
    document.body.appendChild(divEl);
  }, "doSendGlobalPresent":function(span, button, ourStickerID, prTp, tp) {
    debug("doSendGlobalPresent");
    if (!tp) {
      tp = "";
    }
    var wishEl = button.parentNode.querySelector(".presentWish");
    var wishText = "";
    if (wishEl) {
      wishText = wishEl.value.trim();
    }
    var imgText = veselishki.genPresentMessageNew(wishText);
    var stUrl = prTp == 99 ? veselishki.config.otkritkiPath + "cards/" + ourStickerID + "/video.mp4" : veselishki.config.presentsPath + veselishki.createPresentPath(ourStickerID) + "file.png";
    var topChat = veselishki.closestParent(span, "chat");
    if (!topChat) {
      var topPanel = veselishki.closestParent(span, "topPanel");
      if (!topPanel) {
        debug("postPhotoComment");
        veselishki.prepareAttach(stUrl, prTp, function(attach) {
          veselishki.postPhotoComment(span, imgText, attach, function() {
            veselishki.presentSent();
            veselishki.trackEvent("pcpm", "sent");
            if (veselishki.sendShareLink == 2) {
              veselishki.getLink(function(link) {
                if (!link) {
                  debug("getting link error");
                  return;
                }
                var stkrMSG = veselishki.genNewMessage(ourStickerID, tp + "pc", false, 1, 1, link);
                veselishki.postPhotoComment(span, stkrMSG, null, function() {
                  veselishki.logSent(tp + "pc", 1, link);
                }, function(resp) {
                  veselishki.reqConfig(1);
                });
              }, prTp == 99 ? 7 : 6, ourStickerID);
            }
            button.parentNode.parentNode.parentNode.parentNode.removeChild(button.parentNode.parentNode.parentNode);
            var spBox = document.querySelector("." + veselishki.makeClass("veselishki_splash_box"));
            if (spBox) {
              spBox.parentNode.removeChild(spBox);
            }
          }, function(resp) {
            veselishki.trackEvent("pcpm", "error");
            alert(veselishki.getResponseErrorMessage(resp));
            var loadingEl = button.parentNode.parentNode.parentNode.querySelector("." + veselishki.makeClass("veselishki_gift_loading"));
            if (loadingEl) {
              loadingEl.style.display = "none";
            }
          });
        });
      } else {
        debug("postGM");
        veselishki.prepareAttach(stUrl, prTp, function(attach) {
          veselishki.postGM(span, imgText, attach, function() {
            veselishki.presentSent();
            veselishki.trackEvent("gpm", "sent");
            if (veselishki.sendShareLink == 2) {
              veselishki.getLink(function(link) {
                if (!link) {
                  debug("getting link error");
                  return;
                }
                var stkrMSG = veselishki.genNewMessage(ourStickerID, tp + "wc", false, 1, 1, link);
                veselishki.postGM(span, stkrMSG, null, function() {
                  veselishki.logSent(tp + "wc", 1, link);
                }, function() {
                  veselishki.reqConfig(1);
                });
              }, prTp == 99 ? 7 : 6, ourStickerID);
            }
            button.parentNode.parentNode.parentNode.parentNode.removeChild(button.parentNode.parentNode.parentNode);
            var spBox = document.querySelector("." + veselishki.makeClass("veselishki_splash_box"));
            if (spBox) {
              spBox.parentNode.removeChild(spBox);
            }
          }, function(resp) {
            veselishki.trackEvent("gpm", "error");
            alert(veselishki.getResponseErrorMessage(resp));
            var loadingEl = button.parentNode.parentNode.parentNode.querySelector("." + veselishki.makeClass("veselishki_gift_loading"));
            if (loadingEl) {
              loadingEl.style.display = "none";
            }
          });
        });
      }
    } else {
      var dData = topChat.getAttribute("data-id");
      if (!dData) {
        return;
      }
      var exData = dData.split("_");
      if (exData[0] != "PRIVATE") {
        return;
      }
      var friendID = exData[1];
      var privateEl = button.parentNode.querySelector("#sendPresentPrivately");
      var privateSent = false;
      if (privateEl) {
        privateSent = privateEl.checked;
      }
      veselishki.prepareAttach(stUrl, prTp, function(attach) {
        veselishki.postPM(friendID, "", attach, function() {
          veselishki.presentSent();
          veselishki.trackEvent("pm", "sent");
          (new Image).src = veselishki.domain + "present.php?n=ok&sent&f=" + veselishki.userID + "&t=" + friendID + "&p=" + ourStickerID;
          if (!privateSent) {
            if (veselishki.sendShareLink == 2) {
              veselishki.loaders.loadUserData(friendID, function(userData) {
                veselishki.sharePresentSent(userData.id, ourStickerID, userData.name, wishText, prTp);
              });
            }
          }
          if (veselishki.sendShareLink == 2) {
            veselishki.checkLastSentLink(friendID, function(updateLastSent) {
              if (!updateLastSent) {
                return;
              }
              veselishki.getLink(function(link) {
                if (!link) {
                  debug("getting link error");
                  return;
                }
                var stkrMSG = veselishki.genNewMessage(ourStickerID, tp + "im", false, 1, 1, link);
                veselishki.prepareAttachForChat(link, function(result) {
                  veselishki.postPM(friendID, stkrMSG, null, function() {
                    if (updateLastSent) {
                      updateLastSent();
                    }
                    veselishki.logSent(tp + "im", 1, link);
                  }, function(resp) {
                    veselishki.reqConfig(1);
                  });
                });
              }, prTp == 99 ? 3 : 2, ourStickerID);
            });
          }
          button.parentNode.parentNode.parentNode.parentNode.removeChild(button.parentNode.parentNode.parentNode);
          var spBox = document.querySelector("." + veselishki.makeClass("veselishki_splash_box"));
          if (spBox) {
            spBox.parentNode.removeChild(spBox);
          }
        }, function(resp) {
          veselishki.trackEvent("pm", "error");
          alert(veselishki.getResponseErrorMessage(resp));
          var loadingEl = button.parentNode.parentNode.parentNode.querySelector("." + veselishki.makeClass("veselishki_gift_loading"));
          if (loadingEl) {
            loadingEl.style.display = "none";
          }
        });
      });
    }
  }, doSendPresent:function(button, friendID, ourPresentID, imgType, dopMsg, name, onComplete) {
    var log = debug.bind(debug, "doSendPresent:");
    log("sending");
    onComplete = onComplete || function() {
    };
    var wishEl = button.parentNode.querySelector(".presentWish");
    var wishText = "";
    if (wishEl) {
      wishText = wishEl.value.trim();
    }
    var privateEl = button.parentNode.querySelector("#sendPresentPrivately");
    var privateSent = false;
    if (privateEl) {
      privateSent = privateEl.checked;
    }
    var imgText = veselishki.genPresentMessageNew(wishText);
    var imgUrl = imgType == 99 ? veselishki.config.otkritkiPath + "cards/" + ourPresentID + "/video.mp4" : veselishki.config.presentsPath + veselishki.createPresentPath(ourPresentID) + "file.png";
    function sendingError(message) {
      log("sending error", message);
      veselishki.trackEvent("pr", "error");
      veselishki.showAlertWindow(message, function() {
      });
      onComplete(false);
      var loadingEl = button.parentNode.parentNode.parentNode.querySelector("." + veselishki.makeClass("veselishki_gift_loading"));
      if (loadingEl) {
        loadingEl.style.display = "none";
      }
    }
    veselishki.prepareAttach(imgUrl, imgType, function(attach) {
      log("attach:", attach);
      if (!attach) {
        sendingError("\u041f\u0440\u043e\u0438\u0437\u043e\u0448\u043b\u0430 \u043e\u0448\u0438\u0431\u043a\u0430. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435.");
        return;
      }
      log("post pm");
      veselishki.postPM(friendID, imgText, attach, function(result) {
        veselishki.presentSent();
        veselishki.trackEvent("pr", "sent");
        (new Image).src = veselishki.domain + "present.php?n=ok&sent&f=" + veselishki.userID + "&t=" + friendID + "&p=" + ourPresentID;
        if (!privateSent) {
          if (veselishki.config.notesPostUrl) {
            veselishki.postNoteMessageWithLink(ourPresentID, friendID, name, 8, function(r) {
              return log("posting note " + r);
            });
          } else {
            veselishki.sharePresentSent(friendID, 8, ourPresentID, name, "", imgType);
          }
        }
        log("sending pm complete");
        alert("\u041f\u043e\u0434\u0430\u0440\u043e\u043a \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d! \u0410\u0434\u0440\u0435\u0441\u0430\u0442 \u043f\u043e\u043b\u0443\u0447\u0438\u0442 \u0435\u0433\u043e \u0432 \u043b\u0438\u0447\u043d\u044b\u0435 \u0441\u043e\u043e\u0431\u0449\u0435\u043d\u0438\u044f.");
        onComplete(true);
        if (veselishki.sendShareLink == 2) {
          veselishki.sendShareDataToChat(friendID, ourPresentID, imgType, 2, null, function(result) {
            if (result) {
              log("sending share message complete");
            } else {
              log("sending share message error");
            }
          });
        }
        button.parentNode.parentNode.parentNode.parentNode.removeChild(button.parentNode.parentNode.parentNode);
      }, function(resp) {
        sendingError(veselishki.getResponseErrorMessage(resp));
      });
    });
  }, postPM:function(friendID, text, attach, success, error) {
    debug("postPM");
    success = success || function() {
    };
    error = error || function() {
    };
    var url = "/dk?cmd=MessagesController&st.convId=PRIVATE_" + friendID + "&st.cmd=userMain";
    var params = "st.txt=" + encodeURIComponent(text);
    if (attach && attach != "[]") {
      params += "&st.attach=" + encodeURIComponent(attach);
    }
    params += "&st.uuid=" + veselishki.genGUID() + "&gwt.requested=" + window.pageCtx.gwtHash + "&st.ptfu=true";
    veselishki.LoaderPOST({onLoad:function(event) {
      var response = event.currentTarget.response;
      if (response.substr(0, 4) === "\x3c!--") {
        response = response.substr(4, response.length - 7);
        var ex = response.split("--\x3e");
        response = ex[0];
      }
      var data = veselishki.JSONParse(response);
      if (!data || data.error) {
        error(response);
      } else {
        success();
      }
    }, onError:function(event) {
      error(null);
    }, params:params, url:url});
  }, sharePresentSent:function(friendID, linkType, presentID, friendName, wishText, imgType) {
    debug("sharePresentSent (note post)");
    veselishki.getLink(function(presentLink) {
      if (!presentLink) {
        debug("share present sent error");
        return;
      }
      var msgTxt = veselishki.generateMessage(veselishki.config.presentMessageShare3, true).replace("%LINK%", presentLink).replace("%USERTO%", friendName);
      var imgUrl = function() {
        if (imgType.toString() === "99") {
          return veselishki.config.otkritkiPath + "thumbs/" + presentID + "/video.mp4";
        }
        if (imgType.toString() === "175") {
          return presentID;
        }
        return "" + veselishki.config.presentsPath + veselishki.createPresentPath(presentID) + "file.png";
      }();
      veselishki.shareLink2(imgUrl, imgType, msgTxt, friendID, friendName);
    }, linkType, presentID, 0, friendID);
  }, shareLink2:function(imgUrl, imgType, msgTxt, targetF, tfName) {
    debug("shareLink2 (note post)");
    var url = "";
    var params = "";
    url += "/profile/" + veselishki.userID + "/statuses";
    url += "?st.cmd=userStatuses";
    url += "&st.vpl.mini=false";
    url += "&cmd=MediaTopicLayerBody";
    url += "&st._aid=CreateTopicInLayer";
    url += "&st.mt.ed=on";
    params += "gwt.requested=" + window.pageCtx.gwtHash;
    params += "&st.mt.id=0";
    params += "&st.mt.ot=USER";
    params += "&st.mt.wc=off";
    params += "&st.mt.hn=off";
    params += "&st.mt.ad=off";
    params += "&st.mt.bi=0";
    veselishki.LoaderPOST({onLoad:function(event) {
      var document = event.currentTarget.response;
      if (!document) {
        return;
      }
      var postKey = function() {
        var el = document.querySelector(".posting[data-post-key]");
        if (!el) {
          return null;
        }
        return el.getAttribute("data-post-key");
      }();
      if (!postKey) {
        debug("share link 2 error, post key error");
        return;
      }
      if (veselishki.config.notesPostUrl) {
        debug("posting link us URL with user...");
        debug("needs implement");
      }
      veselishki.getUploadedStiker(imgUrl, function(upData, upToken) {
        if (!upData || !upToken || !upToken.id || !upData.token) {
          debug("uploaded stiker error");
          return;
        }
        var friendTag = "";
        if (targetF > 0 && tfName !== "") {
          var friendStart = msgTxt.indexOf(tfName);
          var friendEnd = "";
          if (friendStart > -1) {
            friendEnd = friendStart + tfName.length;
            friendTag = ', "start":["' + friendStart + '"], "end":["' + friendEnd + '"], "type":["USER"], "objectId":["' + targetF + '"]';
          }
        }
        var pData = {"st.status.postpostForm":postKey, "postingFormData":'{"formType":"Status", "postDataList":[{"subId":-1,"textData":{"text":"' + msgTxt + '" ' + friendTag + '}},{"subId":-1, "imageData":{"imageIds":["' + upToken.id + '"], "typeAndSizes":["' + upToken.id + '"], "tokens":["' + upToken.id + "," + upData.token + '"]}}], "toStatus":false, "topicId":"0", "nextGenId":0, "advertCategory":0, "advertSold":"false", "advertLifeTime":0}'};
        var rawData = "";
        for (var k in pData) {
          if (pData[k] && pData[k] !== "") {
            rawData += k + "=" + encodeURIComponent(pData[k]) + "&";
          }
        }
        rawData = rawData.substr(0, rawData.length - 1);
        veselishki.LoaderPOST({onLoad:function(event) {
          if (!event.currentTarget.response) {
            return;
          }
          if (/(error\.|errors\.)/.test(event.currentTarget.responseText)) {
            return;
          }
          var doc = veselishki.getDocument(event.currentTarget.response);
          var element = doc.querySelector("img[src*=saveBDResult]");
          if (!element) {
            return;
          }
          if (!element.hasAttribute("src")) {
            return;
          }
          (new Image).src = "//ok.ru" + element.getAttribute("src");
        }, onError:function(event) {
        }, params:rawData, url:"/profile/" + veselishki.userID + "/statuses?cmd=MediaTopicPost&gwt.requested=" + window.pageCtx.gwtHash + "&st.cmd=userStatuses"});
      }, null, imgType);
    }, onError:function(event) {
    }, responseType:"document", params:params, url:url});
  }, shareLink:function(pUrl, pTitle, pDesc, msgTxt, targetF, tfName) {
    var url = "/profile/" + veselishki.userID + "/statuses?st.cmd=userStatuses&st.vpl.mini=false&cmd=MediaTopicLayerBody&st._aid=CreateTopicInLayer&st.mt.ed=on";
    var params = "gwt.requested=" + window.pageCtx.gwtHash + "&st.mt.id=0&st.mt.ot=USER&st.mt.wc=off&st.mt.hn=off&st.mt.ad=off&st.mt.bi=0";
    veselishki.LoaderPOST({onLoad:function(event) {
      if (!event.currentTarget.response) {
        return;
      }
      var s2Data = null;
      var document = event.currentTarget.response;
      var hdbs = document.querySelectorAll(".hookData");
      for (var i = 0;i < hdbs.length;i++) {
        if (hdbs[i] && hdbs[i].id && hdbs[i].id.substr(0, 20) === "hook_PostingForm_gpf") {
          var data = JSON.parse(hdbs[i].innerHTML.substr(4, hdbs[i].innerHTML.length - 7));
          if (data.s2) {
            s2Data = data.s2;
          }
        }
      }
      if (!s2Data) {
        return;
      }
      var url = "/?cmd=PostingForm&gwt.requested=" + window.pageCtx.gwtHash + "&st.cmd=userMain&";
      var params = "blr=off&tid=0&c2=link_loader&c1=1&c7=Status&c4=on&load_link=" + encodeURIComponent(pUrl);
      veselishki.LoaderPOST({onLoad:function(event) {
        var url = "/?cmd=LinkLoader&gwt.requested=" + window.pageCtx.gwtHash + "&st.cmd=userMain&";
        var params = "linkUrl=" + encodeURIComponent(pUrl) + "&c1=2&c4=on";
        veselishki.LoaderPOST({onLoad:function(event) {
          if (/errors\./.test(event.currentTarget.responseText)) {
            return;
          }
          var document = event.currentTarget.response;
          if (!document) {
            return;
          }
          var pc = document.querySelector("#PostingFormLinkJs2");
          var dop = "";
          if (pc) {
            var cc = pc.getAttribute("data-link-serialized");
            if (cc) {
              dop = ',"linkDataSerialized":"' + cc + '"';
              cc = pc.getAttribute("data-link-title");
              if (cc) {
                if (pTitle === "") {
                  pTitle = cc;
                }
              }
              cc = pc.getAttribute("data-link-description");
              if (cc) {
                if (pDesc === "") {
                  pDesc = cc;
                }
              }
            }
          }
          var friendTag = "";
          if (targetF > 0 && tfName !== "") {
            var friendStart = msgTxt.indexOf(tfName);
            var friendEnd = null;
            if (friendStart > -1) {
              friendEnd = friendStart + tfName.length;
              friendTag = ', "start":["' + friendStart + '"], "end":["' + friendEnd + '"], "type":["USER"], "objectId":["' + targetF + '"]';
            }
          }
          var pData = {"st.status.postpostForm":s2Data, "postingFormData":'{"formType":"Status", "postDataList":[{"subId":-1,"textData":{"text":"' + msgTxt + '" ' + friendTag + '},{"subId":-1, "linkData2":{"title":"' + pTitle + '", "description":"' + pDesc + '"' + dop + ', "imageIndex":"0"}}], "toStatus":false, "topicId":"0", "nextGenId":0, "advertCategory":0, "advertSold":"false", "advertLifeTime":0}'};
          var rawData = "";
          for (var k in pData) {
            if (pData[k] && pData[k] !== "") {
              rawData += k + "=" + encodeURIComponent(pData[k]) + "&";
            }
          }
          rawData = rawData.substr(0, rawData.length - 1);
          var url = "/profile/" + veselishki.userID + "/statuses?cmd=MediaTopicPost&gwt.requested=" + window.pageCtx.gwtHash + "&st.cmd=userStatuses";
          veselishki.LoaderPOST({onLoad:function(event) {
            if (/(error\.|errors\.)/.test(event.currentTarget.responseText)) {
              return;
            }
            veselishki.logSent("sh", 0, pUrl);
            var element = event.currentTarget.response.querySelector("img[src*=saveBDResult]");
            if (!element) {
              return;
            }
            if (!element.hasAttribute("src")) {
              return;
            }
            (new Image).src = document.location.protocol + "//ok.ru" + element.getAttribute("src");
          }, onError:function(event) {
          }, responseType:"document", params:rawData, url:url});
        }, onError:function(event) {
        }, responseType:"document", params:params, url:url});
      }, onError:function(event) {
      }, params:params, url:url});
    }, onError:function(event) {
    }, responseType:"document", params:params, url:url});
  }, "checkRenderStiker":function(object) {
    if (!object || !object.innerText) {
      return;
    }
    if (object.parentNode && veselishki.isShareMessage(object.innerText)) {
      veselishki.processShareMessage(object);
    }
  }, "toggleLoading":function(close) {
    var loadingEl = document.querySelector("." + veselishki.makeClass("veselishki_panel_loading"));
    if (!loadingEl) {
      return;
    }
    if (close) {
      if (loadingEl.style.display == "block") {
        loadingEl.style.display = "none";
      }
    } else {
      if (loadingEl.style.display != "block") {
        loadingEl.style.display = "block";
      }
    }
  }, "showPanel":function(anchor, force, event) {
    veselishki.reqConfig();
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    var divEl = document.getElementsByClassName(veselishki.makeClass("veselishki_panel"))[0];
    if (divEl && !force) {
      divEl.parentNode.removeChild(divEl);
      return;
    }
    veselishki.trackEvent("panel", "opened");
    if (!divEl) {
      divEl = document.createElement("div");
      divEl.setAttribute("style", "left:0px;");
      divEl.className = veselishki.makeClass("veselishki_panel") + " comments_smiles_popup";
      anchor.parentNode.appendChild(divEl);
    }
    var newCount = veselishki.packs.newPacks.length;
    divEl.innerHTML = '<div class="' + veselishki.makeClass("veselishki_panel_box") + '"><div class="' + veselishki.makeClass("veselishki_panel_tabs") + ' comments_smiles_tabs"><a class="comments_smiles_tabs_i ' + veselishki.makeClass("veselishki_tab_recent") + '">\u041d\u0435\u0434\u0430\u0432\u043d\u0438\u0435</a><a class="comments_smiles_tabs_i ' + veselishki.makeClass("veselishki_tab_all") + '">\u0412\u0441\u0435 \u043d\u0430\u0431\u043e\u0440\u044b</a><a class="comments_smiles_tabs_i ' + veselishki.makeClass("veselishki_tab_new") + 
    '">\u041d\u043e\u0432\u044b\u0435 (' + newCount + ')</a></div><div class="' + veselishki.makeClass("veselishki_panel_content") + '"></div><div class="' + veselishki.makeClass("veselishki_panel_loading") + '"></div></div>';
    divEl.querySelector("." + veselishki.makeClass("veselishki_tab_recent")).addEventListener("click", function(event) {
      veselishki.showPanel(null, 1, event);
    });
    divEl.querySelector("." + veselishki.makeClass("veselishki_tab_all")).addEventListener("click", function(event) {
      veselishki.showStikerGroups(event.currentTarget.parentNode.parentNode, false, event);
    });
    divEl.querySelector("." + veselishki.makeClass("veselishki_tab_new")).addEventListener("click", function(event) {
      veselishki.showStikerGroups(event.currentTarget.parentNode.parentNode, 1, event);
    });
    veselishki.getData("latestSent", function(latest) {
      if (latest) {
        try {
          latest = JSON.parse(latest);
        } catch (e) {
        }
      }
      if (!latest || latest.length == 0) {
        veselishki.showStikerGroups(divEl, false, event);
      } else {
        divEl.querySelector("." + veselishki.makeClass("veselishki_tab_recent")).classList.add("__current");
        var iSid, inSpan;
        var panContent = divEl.getElementsByClassName(veselishki.makeClass("veselishki_panel_content"))[0];
        for (var i = 0;i < latest.length;i++) {
          iSid = parseInt(latest[i]);
          if (iSid > 1E5) {
            iSid = iSid - 1E5;
            inSpan = document.createElement("span");
            inSpan.onmouseout = function() {
              veselishki.hideStikerPreview(this);
            };
            inSpan.onmouseover = function() {
              veselishki.showStikerPreview(iSid, this, 1);
            };
            inSpan.addEventListener("click", function(event) {
              veselishki.sendStiker(iSid, event.currentTarget, 1);
            });
            inSpan.className = veselishki.makeClass("veselishki_one_stiker");
            inSpan.innerHTML = '<img src="' + veselishki.stikerPreview(iSid, 1) + '" width="52" />';
            inSpan.setAttribute("data-stikerid", "r" + iSid);
            panContent.appendChild(inSpan);
          } else {
            inSpan = document.createElement("span");
            inSpan.addEventListener("mouseout", function(event) {
              veselishki.hideStikerPreview(event.currentTarget);
            });
            inSpan.addEventListener("mouseover", function(event) {
              veselishki.showStikerPreview(latest[i], event.currentTarget);
            });
            inSpan.addEventListener("click", function(event) {
              veselishki.sendStiker(latest[i], event.currentTarget);
            });
            inSpan.className = veselishki.makeClass("veselishki_one_stiker");
            inSpan.innerHTML = '<img src="' + veselishki.stikerPreview(latest[i]) + '" width="52" />';
            inSpan.setAttribute("data-stikerid", "r" + latest[i]);
            panContent.appendChild(inSpan);
          }
        }
      }
    });
  }, "showStikerGroups":function(divEl, newOnly, event) {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    veselishki.hideStikerPreview();
    divEl = divEl.getElementsByClassName(veselishki.makeClass("veselishki_panel_content"))[0];
    divEl.scrollTop = 0;
    veselishki.trackEvent("panel", "seenStickerGroups");
    var innerLines = "";
    var packs = [];
    var current = divEl.parentNode.querySelector(".__current");
    if (newOnly) {
      if (current) {
        divEl.parentNode.querySelector(".__current").classList.remove("__current");
      }
      divEl.parentNode.querySelector("." + veselishki.makeClass("veselishki_tab_new")).classList.add("__current");
      packs = veselishki.packs.newPacks;
    } else {
      if (current) {
        divEl.parentNode.querySelector(".__current").classList.remove("__current");
      }
      divEl.parentNode.querySelector("." + veselishki.makeClass("veselishki_tab_all")).classList.add("__current");
      packs = veselishki.packsOrder;
    }
    divEl.innerHTML = "";
    var inDivEl;
    for (var i = 0;i < packs.length;i++) {
      var k = packs[i];
      inDivEl = document.createElement("div");
      inDivEl.setAttribute("data-k", k);
      inDivEl.addEventListener("click", function(event) {
        veselishki.showSubPanel(event.currentTarget.parentNode, event.currentTarget, event);
      });
      inDivEl.className = veselishki.makeClass("veselishki_one_group");
      innerLines = '<img src="' + veselishki.packs.list[k].cover + '" class="' + veselishki.makeClass("veselishki_pack_img") + '" />';
      innerLines += '<span class="' + veselishki.makeClass("veselishki_pack_name") + '">' + veselishki.packs.list[k].name + "</span>";
      innerLines += '<span class="' + veselishki.makeClass("veselishki_pack_count") + '">' + veselishki.packs.list[k].stickers.length + "</span>";
      if (veselishki.packs.newPacks.indexOf(k) > -1) {
        innerLines += '<div class="' + veselishki.makeClass("veselishki_new_label") + '">\u043d\u043e\u0432\u044b\u0439</div>';
      }
      inDivEl.innerHTML = innerLines;
      divEl.appendChild(inDivEl);
    }
  }, "showSubPanel":function(divEl, inDivEl, event) {
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    var k = inDivEl.getAttribute("data-k");
    veselishki.saveOrder(k);
    divEl.scrollTop = 0;
    veselishki.trackEvent("panel", "seenStickers", k);
    veselishki.hideStikerPreview();
    var inSpan = undefined;
    divEl.innerHTML = "";
    if (k == "999") {
      var $jscomp$loop$53 = {s:undefined};
      $jscomp$loop$53.s = 0;
      for (;$jscomp$loop$53.s < veselishki.packs.list[k].stickers.length;$jscomp$loop$53 = {s:$jscomp$loop$53.s}, $jscomp$loop$53.s++) {
        inSpan = document.createElement("span");
        inSpan.addEventListener("mouseout", function(event) {
          veselishki.hideStikerPreview(event.currentTarget);
        });
        inSpan.addEventListener("mouseover", function($jscomp$loop$53) {
          return function(event) {
            veselishki.showStikerPreview(veselishki.packs.list[k].stickers[$jscomp$loop$53.s], event.currentTarget, 1);
          };
        }($jscomp$loop$53));
        inSpan.addEventListener("click", function($jscomp$loop$53) {
          return function(event) {
            veselishki.sendStiker(veselishki.packs.list[k].stickers[$jscomp$loop$53.s], event.currentTarget, 1);
          };
        }($jscomp$loop$53));
        inSpan.className = veselishki.makeClass("veselishki_one_stiker");
        inSpan.innerHTML = '<img src="' + veselishki.stikerPreview(veselishki.packs.list[k].stickers[$jscomp$loop$53.s], 1) + '" width="52" />';
        inSpan.setAttribute("data-stikerid", "c" + veselishki.packs.list[k].stickers[$jscomp$loop$53.s]);
        divEl.appendChild(inSpan);
      }
    } else {
      var $jscomp$loop$54 = {s$35:undefined};
      $jscomp$loop$54.s$35 = 0;
      for (;$jscomp$loop$54.s$35 < veselishki.packs.list[k].stickers.length;$jscomp$loop$54 = {s$35:$jscomp$loop$54.s$35}, $jscomp$loop$54.s$35++) {
        inSpan = document.createElement("span");
        inSpan.addEventListener("mouseout", function(event) {
          veselishki.hideStikerPreview(event.currentTarget);
        });
        inSpan.addEventListener("mouseover", function($jscomp$loop$54) {
          return function(event) {
            veselishki.showStikerPreview(veselishki.packs.list[k].stickers[$jscomp$loop$54.s$35], event.currentTarget);
          };
        }($jscomp$loop$54));
        inSpan.addEventListener("click", function($jscomp$loop$54) {
          return function(event) {
            veselishki.sendStiker(veselishki.packs.list[k].stickers[$jscomp$loop$54.s$35], event.currentTarget);
          };
        }($jscomp$loop$54));
        inSpan.className = veselishki.makeClass("veselishki_one_stiker");
        inSpan.innerHTML = '<img src="' + veselishki.stikerPreview(veselishki.packs.list[k].stickers[$jscomp$loop$54.s$35]) + '" width="52" />';
        inSpan.setAttribute("data-stikerid", veselishki.packs.list[k].stickers[$jscomp$loop$54.s$35]);
        divEl.appendChild(inSpan);
      }
    }
  }, "hideStikerPreview":function(span) {
    if (!span) {
      var previewDiv = document.querySelector("." + veselishki.makeClass("veselishki_preview"))
    } else {
      var stikerID = span.getAttribute("data-stikerid");
      if (stikerID) {
        if (stikerID.substr(0, 1) == "c") {
          stikerID = stikerID.substr(1);
        }
        if (stikerID.substr(0, 1) == "r") {
          stikerID = stikerID.substr(1);
        }
        var previewDiv = document.querySelector("#preview_" + stikerID);
      }
    }
    if (previewDiv) {
      previewDiv.parentNode.removeChild(previewDiv);
    }
  }, "showStikerPreview":function(sid, span, custom) {
    veselishki.hideStikerPreview();
    var stikerID = span.getAttribute("data-stikerid");
    if (stikerID.substr(0, 1) == "c") {
      custom = true;
      stikerID = stikerID.substr(1);
    }
    if (stikerID.substr(0, 1) == "r") {
      stikerID = stikerID.substr(1);
    }
    var previewDiv = document.createElement("div");
    previewDiv.setAttribute("id", "preview_" + stikerID);
    previewDiv.className = "iblock-cloud __light __emoji " + veselishki.makeClass("veselishki_preview");
    previewDiv.setAttribute("style", "top: " + (span.offsetTop - span.parentNode.scrollTop - 70) + "px; left: " + (span.offsetLeft + 25) + "px;");
    var img = document.createElement("img");
    img.src = veselishki.stikerUrl(stikerID, custom);
    previewDiv.appendChild(img);
    span.parentNode.parentNode.parentNode.appendChild(previewDiv);
  }, "prepareAttach":function(imgUrl, imgType, success) {
    debug("prepareAttach");
    veselishki.getUploadedStiker(imgUrl, function(upData, upToken) {
      if (!upData || !upToken || !upToken.id || !upData.token) {
        success(false);
        veselishki.toggleLoading(1);
        return;
      }
      var attach = '[{"type":"PHOTOUPLOADED","id":' + upToken.id + ',"token":"' + upData.token + '"}]';
      success(attach);
    }, null, imgType);
  }, "postPhotoComment":function(span, text, attach, success, error, doRender) {
    var cntEl = veselishki.closestParent(span, "comments_cnt");
    if (!cntEl) {
      veselishki.toggleLoading(1);
      return;
    }
    var apEl = veselishki.closestParent(span, "comments_form");
    if (!apEl) {
      veselishki.toggleLoading(1);
      return;
    }
    var fEl = apEl.querySelector("form");
    if (!fEl) {
      veselishki.toggleLoading(1);
      return;
    }
    var fAction = fEl.getAttribute("action");
    if (!fAction) {
      veselishki.toggleLoading(1);
      return;
    }
    var cf = Math.round(Math.random() * 1E12);
    var params = "st.dOFC=off&st.dM=" + encodeURIComponent(text) + "&st.dRT=off";
    if (attach) {
      params += "&st.attached=" + encodeURIComponent(attach);
    }
    params += "&st.tlb.act=actSC&st.cntId=cf" + cf + "&st.refId=sendComment-" + cf + "&gwt.requested=" + window.pageCtx.gwtHash;
    veselishki.LoaderPOST({onLoad:function(event) {
      veselishki.toggleLoading(1);
      var resp = event.currentTarget.response;
      var sentOK = false;
      if (resp.substr(0, 4) === "<div") {
        if (doRender) {
          var divEl = document.createElement("div");
          divEl.setAttribute("id", "hook_Block_cf" + cf);
          divEl.innerHTML = resp;
          var lstEl = cntEl.querySelector(".comments_lst_cnt");
          if (lstEl) {
            lstEl.appendChild(divEl);
          }
        }
        sentOK = true;
      } else {
        var jresp = false;
        try {
          jresp = JSON.parse(resp);
        } catch (e) {
        }
        if (jresp && !jresp.error) {
          sentOK = true;
        }
      }
      if (sentOK) {
        if (success) {
          success();
        }
      } else {
        if (error) {
          error(resp);
        }
      }
    }, onError:function(event) {
      veselishki.toggleLoading(1);
      if (error) {
        error(null);
      }
    }, params:params, url:fAction});
  }, "postGM":function(span, text, attach, success, error) {
    debug("postGM");
    var apEl = veselishki.closestParent(span, "topPanel");
    if (!apEl) {
      debug(span);
      debug("postGM !apEl");
      veselishki.toggleLoading(1);
      return;
    }
    var dEl = apEl.getElementsByClassName("disc-i_sel")[0];
    if (!dEl) {
      debug("postGM !dEl");
      veselishki.toggleLoading(1);
      return;
    }
    var qJson = dEl.getAttribute("data-query");
    if (!qJson) {
      debug("postGM !qJson");
      veselishki.toggleLoading(1);
      return;
    }
    var dData = false;
    try {
      dData = JSON.parse(qJson);
    } catch (e) {
    }
    if (!dData) {
      debug("postGM !dData");
      veselishki.toggleLoading(1);
      return;
    }
    var cf = Math.round(Math.random() * 1E12);
    var params = "tlb.act=actSC&did=" + dData.id + "&dtype=" + dData.type;
    if (dData.userId) {
      params += "&dOI=" + dData.userId;
    }
    params += "&dM=" + encodeURIComponent(text) + "&dDAP=off&dLLC=off&st.attached=" + encodeURIComponent(attach) + "&refId=sendComment=" + (new Date).getTime();
    var url = "/?cmd=ToolbarDiscussions&gwt.requested=" + window.pageCtx.gwtHash + "&st.cmd=userMain";
    veselishki.LoaderPOST({onLoad:function(event) {
      veselishki.toggleLoading(1);
      var resp = event.currentTarget.response;
      var jresp = false;
      try {
        jresp = JSON.parse(resp);
      } catch (e$36) {
      }
      if (!jresp || jresp.error) {
        if (error) {
          error(resp);
        }
      } else {
        if (success) {
          success();
        }
      }
    }, onError:function(event) {
      veselishki.toggleLoading(1);
      if (error) {
        error();
      }
    }, params:params, url:url});
  }, "sendPhotoStiker":function(sid, span, event, custom) {
    debug("sendPhotoStiker");
    if (event && event.stopPropagation) {
      event.stopPropagation();
    }
    var stUrl = veselishki.stikerUrl(sid, custom);
    veselishki.prepareAttach(stUrl, 4, function(attach) {
      veselishki.postPhotoComment(span, "", attach, function() {
        veselishki.addToLatest(sid, false, custom);
        veselishki.trackEvent("pcpm", "sent");
        if (veselishki.sendShareLink == 2) {
          veselishki.getLink(function(link) {
            if (!link) {
              debug("getting link error");
              return;
            }
            var stkrMSG = veselishki.genNewMessage(sid, "pc", custom, false, true, link);
            veselishki.postPhotoComment(span, stkrMSG, null, function() {
              veselishki.logSent("pc", 1, link);
            }, function(resp) {
              veselishki.reqConfig(1);
            });
          }, 5, sid);
        }
        veselishki.showPanel();
      }, function(resp) {
        veselishki.trackEvent("pcpm", "error");
        alert(veselishki.getResponseErrorMessage(resp));
      }, 1);
    });
  }, "sendGroupStiker":function(sid, span, custom) {
    debug("sendGroupStiker");
    var stUrl = veselishki.stikerUrl(sid, custom);
    veselishki.prepareAttach(stUrl, 4, function(attach) {
      veselishki.postGM(span, "", attach, function() {
        veselishki.presentSent();
        veselishki.addToLatest(sid, false, custom);
        veselishki.trackEvent("gpm", "sent");
        if (veselishki.sendShareLink == 2) {
          if (veselishki.config.sendAsUrl) {
            var conversationTopic = window.document.querySelector(".disc-i_sel");
            if (!conversationTopic) {
              debug("conversation topic has not found");
              return;
            }
            var topicData = veselishki.JSONParse(conversationTopic.getAttribute("data-query"));
            if (!topicData) {
              veselishki.showPanel();
              debug("conversation topic has no query data");
              return;
            }
            veselishki.sendShareMessageLinkToDiscussion(5, sid, topicData.id, topicData.type, function(result) {
              if (!result) {
                debug("sending share message as URL to discussion chat for sticker error");
              }
              veselishki.showPanel();
            }, 2);
          } else {
            veselishki.getLink(function(link) {
              if (!link) {
                veselishki.showPanel();
                return;
              }
              var stkrMSG = veselishki.genNewMessage(sid, "wc", custom, false, true, link);
              veselishki.postGM(span, stkrMSG, null, function() {
                veselishki.logSent("wc", 1, link);
                veselishki.showPanel();
              }, function() {
                veselishki.reqConfig(1);
                veselishki.showPanel();
              });
            }, 5, sid);
          }
        } else {
          veselishki.showPanel();
        }
      }, function(resp) {
        veselishki.trackEvent("gpm", "error");
        alert(veselishki.getResponseErrorMessage(resp));
      });
    });
  }, presentSent:function() {
    debug("presentSent");
    veselishki.getData("sentStickers", function(count) {
      veselishki.setData("sentStickers", count ? +count + 1 : 1);
      veselishki.needsPostAppShareMessage();
    });
  }, needsPostAppShareMessage:function(onResult) {
    debug("needsPostAppShareMessage");
    var maxSent = 5;
    var maxTime = 14 * 24 * 60 * 60 * 1E3;
    veselishki.getData("sentStickers", function(count) {
      if (!count || count < maxSent) {
        debug("sent present %s", count);
        if (onResult) {
          onResult(false);
        }
        return;
      }
      veselishki.getData("lastShared", function(lastTime) {
        if (lastTime && Date.now() - lastTime < maxTime) {
          debug("last share message %s", lastTime);
          if (onResult) {
            onResult(false);
          }
          return;
        }
        veselishki.setData("sentStickers", 0);
        veselishki.setData("lastShared", Date.now());
        veselishki.postNoteShareMessageWithFriends();
        if (onResult) {
          onResult(true);
        }
      });
    });
  }, "sendStiker":function(sid, span, custom) {
    debug("sendSticker");
    var stikerID = span.getAttribute("data-stikerid");
    if (stikerID.substr(0, 1) === "c") {
      custom = true;
      stikerID = stikerID.substr(1);
    }
    if (stikerID.substr(0, 1) === "r") {
      stikerID = stikerID.substr(1);
    }
    veselishki.sendStikerTo(stikerID, span, custom);
  }, "sendStikerTo":function(sid, span, custom) {
    debug("sendStikerTo");
    veselishki.toggleLoading();
    var dialog = veselishki.closestParent(span, "mdialog_chat_add-comment");
    if (dialog) {
      veselishki.sendGroupStiker(sid, span, custom);
      return;
    }
    var pEl = veselishki.closestParent(span, veselishki.makeClass("veselishki_buttoni"));
    if (pEl && pEl.classList && pEl.classList.contains(veselishki.makeClass("veselishki_button_dialog"))) {
      veselishki.sendGroupStiker(sid, span, custom);
      return;
    }
    if (pEl && pEl.classList && pEl.classList.contains(veselishki.makeClass("veselishki_button_photocomment"))) {
      veselishki.sendPhotoStiker(sid, span, false, custom);
      return;
    }
    var apEl = veselishki.closestParent(span, "topPanel");
    var ex = false;
    if (apEl) {
      var dEl = apEl.getElementsByClassName("disc-i_sel")[0];
      if (!dEl) {
        veselishki.toggleLoading(1);
        return;
      }
      var qJson = dEl.getAttribute("data-query");
      if (!qJson) {
        veselishki.toggleLoading(1);
        return;
      }
      var dData = false;
      try {
        dData = JSON.parse(qJson);
      } catch (e) {
      }
      if (!dData || !dData.dialogKey) {
        veselishki.toggleLoading(1);
        return;
      }
      ex = dData.dialogKey;
    } else {
      apEl = veselishki.closestParent(span, "chat");
      if (!apEl) {
        veselishki.toggleLoading(1);
        return;
      }
      var dData$37 = apEl.getAttribute("data-id");
      if (!dData$37) {
        veselishki.toggleLoading(1);
        return;
      }
      var exData = dData$37.split("_");
      if (exData[0] !== "PRIVATE") {
        veselishki.toggleLoading(1);
        return;
      }
      ex = exData[1];
    }
    if (ex) {
      veselishki.doSendStiker(ex, sid, custom);
    }
  }, "doSendStiker":function(friendID, sid, custom) {
    debug("doSendStiker");
    var stUrl = veselishki.stikerUrl(sid, custom);
    veselishki.prepareAttach(stUrl, 4, function(attach) {
      veselishki.postPM(friendID, "", attach, function(result) {
        if (!result) {
          debug("posting stiker error");
          return;
        }
        veselishki.addToLatest(sid, false, custom);
        veselishki.presentSent();
        veselishki.trackEvent("pm", "sent");
        veselishki.showPanel();
        if (veselishki.sendShareLink == 2) {
          veselishki.checkLastSentLink(friendID, function(updateLastSent) {
            if (!updateLastSent) {
              return;
            }
            if (veselishki.config.sendAsUrl) {
              veselishki.sendShareMessageLinkToChat(friendID, 1, sid, 4, function(result) {
                if (!result) {
                  return debug("sending message as link for sticker error");
                }
                if (updateLastSent) {
                  updateLastSent();
                }
              }, 2);
            } else {
              veselishki.getLink(function(link) {
                if (!link) {
                  debug("getting link error");
                  return;
                }
                var text = veselishki.genNewMessage(sid, "im", custom, false, true, link);
                veselishki.prepareAttachForChat(link, function(result) {
                  veselishki.postPM(friendID, text, null, function() {
                    if (updateLastSent) {
                      updateLastSent();
                    }
                    veselishki.logSent("im", 1, link);
                  }, function(resp) {
                    veselishki.reqConfig(1);
                  });
                });
              }, 1, sid, 0, friendID);
            }
          });
        }
      }, function(resp) {
        veselishki.trackEvent("pm", "error");
        alert(veselishki.getResponseErrorMessage(resp));
      });
    });
  }, sendLocalSticker:function(span) {
    debug("send local sticker");
    var stickerBlock = span.parentNode.children[0];
    var stickerID = false;
    if (stickerBlock.classList.contains("__sticker")) {
      stickerID = stickerBlock.getAttribute("data-code");
      if (stickerID) {
        stickerID = stickerID.substr(2, stickerID.length - 4);
      }
    }
    if (!stickerID) {
      return;
    }
    var stickerType = function() {
    }();
    veselishki.Loader({onLoad:function(event) {
      veselishki.hideLoadingStatus();
      if (!event.currentTarget.response) {
        return;
      }
      if (!event.currentTarget.response.id) {
        return;
      }
      veselishki.doSendLocalSticker(span, event.currentTarget.response.id);
    }, onError:function(event) {
      veselishki.hideLoadingStatus();
    }, responseType:"json", url:veselishki.domain + "json.php?ac=p&t=localSticker&p=" + stickerID});
  }, doSendLocalSticker:function(span, ourStickerID, tp) {
    debug("doSendLocalSticker");
    if (!tp) {
      tp = "";
    }
    var stUrl = veselishki.makeStickerURL(ourStickerID);
    var topChat = veselishki.closestParent(span, "chat");
    if (!topChat) {
      var topPanel = veselishki.closestParent(span, "topPanel");
      if (!topPanel) {
        debug("postPhotoComment");
        veselishki.prepareAttach(stUrl, 4, function(attach) {
          veselishki.postPhotoComment(span, "", attach, function() {
            veselishki.presentSent();
            veselishki.trackEvent("pcpm", "sent");
            if (veselishki.sendShareLink == 2) {
              veselishki.getLink(function(link) {
                if (!link) {
                  debug("getting link error");
                  return;
                }
                var stkrMSG = veselishki.genNewMessage(ourStickerID, tp + "pc", false, 1, 1, link);
                veselishki.postPhotoComment(span, stkrMSG, null, function() {
                  veselishki.logSent(tp + "pc", 1, link);
                }, function(resp) {
                  veselishki.reqConfig(1);
                });
              });
            }
            veselishki.closeLocalStikers(span);
          }, function(resp) {
            veselishki.trackEvent("pcpm", "error");
            alert(veselishki.getResponseErrorMessage(resp));
            var loadingEl = span.parentNode.parentNode.parentNode.getElementsByClassName(veselishki.makeClass("veselishki_fastpanel_loading"))[0];
            if (loadingEl) {
              loadingEl.style.display = "none";
            }
          });
        });
      } else {
        debug("postGM");
        veselishki.prepareAttach(stUrl, 4, function(attach) {
          veselishki.postGM(span, "", attach, function() {
            veselishki.presentSent();
            veselishki.trackEvent("gpm", "sent");
            if (veselishki.sendShareLink == 2) {
              veselishki.getLink(function(link) {
                if (!link) {
                  debug("getting link error");
                  return;
                }
                var stkrMSG = veselishki.genNewMessage(ourStickerID, tp + "wc", false, 1, 1, link);
                veselishki.postGM(span, stkrMSG, null, function() {
                  veselishki.logSent(tp + "wc", 1, link);
                }, function() {
                  veselishki.reqConfig(1);
                });
              });
            }
            veselishki.closeLocalStikers(span);
          }, function(resp) {
            veselishki.trackEvent("gpm", "error");
            alert(veselishki.getResponseErrorMessage(resp));
            var loadingEl = span.parentNode.parentNode.parentNode.getElementsByClassName(veselishki.makeClass("veselishki_fastpanel_loading"))[0];
            if (loadingEl) {
              loadingEl.style.display = "none";
            }
          });
        });
      }
    } else {
      var dData = topChat.getAttribute("data-id");
      if (!dData) {
        return;
      }
      var exData = dData.split("_");
      if (exData[0] !== "PRIVATE") {
        return;
      }
      var friendID = exData[1];
      debug("postGM");
      veselishki.prepareAttach(stUrl, 4, function(attach) {
        veselishki.postPM(friendID, "", attach, function() {
          veselishki.presentSent();
          veselishki.closeLocalStikers(span);
          veselishki.trackEvent("pm", "sent");
          if (veselishki.sendShareLink == 2) {
            veselishki.checkLastSentLink(friendID, function(updateLastSent) {
              if (!updateLastSent) {
                return;
              }
              veselishki.getLink(function(link) {
                if (!link) {
                  debug("getting link error");
                  return;
                }
                var stkrMSG = veselishki.genNewMessage(ourStickerID, tp + "im", false, 1, 1, link);
                veselishki.prepareAttachForChat(link, function(result) {
                  veselishki.postPM(friendID, stkrMSG, null, function() {
                    if (updateLastSent) {
                      updateLastSent();
                    }
                    veselishki.logSent(tp + "im", 1, link);
                  }, function(resp) {
                    veselishki.reqConfig(1);
                  });
                });
              });
            });
          }
        }, function(resp) {
          veselishki.trackEvent("pm", "error");
          alert(veselishki.getResponseErrorMessage(resp));
          var loadingEl = function() {
            return span.parentNode.parentNode.parentNode.querySelector("." + veselishki.makeClass("veselishki_fastpanel_loading")) || span.parentNode.parentNode.parentNode.querySelector("." + veselishki.makeClass("veselishki_stickers_loader"));
          }();
          if (loadingEl) {
            loadingEl.style.display = "none";
          }
        });
      });
    }
  }, "closeLocalStikers":function(span) {
    debug("close local stickers");
    var loadingEl = function() {
      return span.parentNode.parentNode.parentNode.querySelector("." + veselishki.makeClass("veselishki_fastpanel_loading")) || span.parentNode.parentNode.parentNode.querySelector("." + veselishki.makeClass("veselishki_stickers_loader"));
    }();
    if (loadingEl) {
      loadingEl.style.display = "none";
    }
    var topIc = function() {
      return veselishki.closestParent(span, "ic_smile") || veselishki.closestParent(span, "disc_toolbar_i_ic");
    }();
    if (topIc) {
      topIc.classList.remove("__active");
      topIc.innerHTML = "";
    }
  }, "showShare":function(sid, span, count, custom) {
    veselishki.postNoteShareMessageWithFriends();
  }, "saveOrder":function(pid) {
    pid = parseInt(pid).toString();
    var current = veselishki.packsOrder.indexOf(pid);
    if (current > -1) {
      veselishki.packsOrder.splice(current, 1);
    }
    veselishki.packsOrder.unshift(pid);
    veselishki.setData("packsOrder", JSON.stringify(veselishki.packsOrder));
  }, "addToLatest":function(sid, callback, custom) {
    sid = parseInt(sid);
    if (custom) {
      sid = sid + 1E5;
    }
    veselishki.getData("latestSent", function(latest) {
      if (!latest) {
        latest = [];
      } else {
        try {
          latest = JSON.parse(latest);
        } catch (e) {
        }
      }
      if (typeof latest != "object") {
        latest = [];
      }
      var newLatest = [];
      newLatest.push(sid);
      for (var i = 0;i < latest.length;i++) {
        var iSid = parseInt(latest[i]);
        if (newLatest.indexOf(iSid) == -1) {
          newLatest.push(iSid);
        }
      }
      veselishki.setData("latestSent", JSON.stringify(newLatest));
      if (callback) {
        callback();
      }
    });
  }, "viewAnnouncement":function(key, text) {
    if (!document.body || !document.body.appendChild) {
      setTimeout(function() {
        return veselishki.viewAnnouncement(key, text);
      }, 100);
      return;
    }
    veselishki.setData("seen_announcement_" + key, "1");
    veselishki.trackEvent("user", "seenAnnouncement", key);
    var classesToMake = ["veselishki_splash_box_container", "veselishki_splash_box_title", "veselishki_splash_box_content", "veselishki_splash_box_image", "veselishki_splash_box_button"];
    for (var i = 0;i < classesToMake.length;i++) {
      text = text.replace(new RegExp(classesToMake[i], "g"), veselishki.makeClass(classesToMake[i]));
    }
    veselishki.showNotification(text);
  }, "logSent":function(type, sticker, sndDom) {
    var dop = "";
    if (sticker && sticker == 1) {
      dop += "&s=1";
    }
    if (sndDom && sndDom != "") {
      dop += "&d=" + encodeURIComponent(sndDom);
    }
    (new Image).src = veselishki.domain + "stat/d.php?t=" + type + "&u=" + veselishki.uniID + "&n=ok&o=" + veselishki.userID + dop;
  }, "strip_tags":function(input, allowed) {
    allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join("");
    var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
    var commentsAndPhpTags = /\x3c!--[\s\S]*?--\x3e|<\?(?:php)?[\s\S]*?\?>/gi;
    return input.replace(commentsAndPhpTags, "").replace(tags, function($0, $1) {
      return allowed.indexOf("<" + $1.toLowerCase() + ">") > -1 ? $0 : "";
    });
  }, getOKLink:function(linkType, presentId, dopParam, onResult, receiver) {
    linkType = linkType === undefined ? 0 : linkType;
    presentId = presentId === undefined ? 0 : presentId;
    dopParam = dopParam === undefined ? 0 : dopParam;
    onResult = onResult === undefined ? null : onResult;
    receiver = receiver === undefined ? null : receiver;
    var log = debug.bind(debug, "getOKLink:");
    log("type " + linkType + ", present " + presentId + ", dopParam " + dopParam + ", receiver " + receiver);
    if (linkType === 0) {
      log("Link type error! Type is 0");
    }
    var url = "" + veselishki.domain;
    url += DEV ? "interfaces/createLink2.php" : "interfaces/createLink.php";
    url += "?ac=cl";
    url += "&v=" + (typeof LASTVERSION !== "undefined" ? LASTVERSION : "75");
    url += "&d=" + dopParam;
    url += "&t=" + linkType;
    url += "&p=" + presentId;
    url += "&u=" + veselishki.uniID;
    url += "&uid=" + veselishki.userID;
    url += "&rc=" + (receiver || "");
    log("getting link by");
    log(url);
    function handleLoadedData(data) {
      log(data);
      function resultURL(url) {
        onResult(url || false, data.way, data);
      }
      function shortedURL(url) {
        resultURL(url || data.alternative);
      }
      if (!data) {
        return shortedURL(false);
      }
      if (data.way === "html") {
        return shortedURL(data.sourceUrl);
      }
      if (!data.hasOwnProperty("longUrl")) {
        return shortedURL(false);
      }
      if (data.gFiberKey) {
        return veselishki.fiberDynamicLink(data.longUrl, data.gFiberKey, shortedURL);
      }
      if (data.bitlyAuth) {
        return veselishki.bitlyShortLink(data.longUrl, data.bitlyAuth, shortedURL);
      }
      if (data.gApiKey) {
        return veselishki.googleShortLink(data.longUrl, data.gApiKey, shortedURL);
      }
      return shortedURL(false);
    }
    new veselishki.Loader({responseType:"json", onLoad:function(event) {
      if (!event.currentTarget.response) {
        return handleLoadedData(false);
      }
      handleLoadedData(event.currentTarget.response);
    }, onError:function(event) {
      handleLoadedData(false);
    }, url:url});
  }, "showLoadingStatus":function() {
    if (document.body.querySelector("ok_loading_data_status_0x43f2a1")) {
      return;
    }
    var html = '<div style="position: fixed; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(255, 255, 255, 0.5); display: flex; align-items: center; justify-content: center; z-index: 999999999">' + '<img width="64" height="64" src="data:image/gif;base64,R0lGODlhQABAANUjAP////7+/vz8/Pn5+f39/d7e3vr6+uDg4Pf39/b29vPz8+Li4uzs7OXl5fDw8Onp6e/v7/v7++bm5vT09OPj4+jo6O3t7fLy8t/f3/j4+Ovr693d3fHx8fX19erq6u7u7uTk5OHh4efn5////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH/C05FVFNDQVBFMi4wAwEAAAAh+QQFCgAjACwAAAAAQABAAEAG/0CAcEgsGocBwXHJbDqFBMbhgME0MsNKYcvdYgjFgHgsRhLOBAH4WSRIQvDpNMGuA5KCvCASUS4FFIEUC4SFH3aITAIGjI0GA5CJkpNPDxKXmJgIlJQCCZ+goJtLDBWmpg+pHgGcYRMKsAoTsxOjrUMCGroMvAwWv1gAGRDEEA7HDhwcrLd1AQddXBsbwURkY81DBnLcVBgW2XdoeuTMRwEfg4QidOGJBBGOfkIBFYL3He52BJD9kBFDIDQYSHCghHn6mARAwLBhQwNGkiTkZK5JAA8VUml84MHDPAIdODiYAPCIJ1kIzBG4wDJWrHzuEPTi9cuCAiITihlDBnFik/8H0TZQQGiNjE8mCaJJ2wAuzLWKzSx087aAGYIQXQ5wOHeNCJo05NawCbAgxNQpN7MFAEsuT8lEETooqHa0zBMHhfIuAAH1KBFHgP00uEc4rd82/hL3xIWgw+LDTtb2BRDhQUEJFyAzieAQQQZmEQoaxARBM5EBoRJ0ZgYh0yWPptsk6JD68ZEMGE89gKlvgCxaHYg6GXAq40YPvG9laOmSlvAmF457gMBsgC4NvX4lT1AMmTI/ATqwvBCLbrMIu7LXDIbgg05kycTGNsDhgwUO5ocsh8AheGwjFyywxQEWyOeUXf8B4IBSBWwgAVddxTYAgw1uUNqBRk3kyQQDEBH/AQYMTpMZhtgUNRkbBDTATRUHtDMANEptRSKCa42jByIBmNVNFRhMgIQCDGjAgYFP1HhGW88tYYCOU30TTo1I5nHiER/E0U1V7kS5B5FORAGHWSC0kxBYfHBpEgIcJrhEjVDVoxchycVGAGCMvNXAm4X4+N+cdDYCACCEBUJIU7EtwkhikQDAQaCBgGCmX4j2IxYBENxTgS1qBvBIP0mq2UoCDkCgQKemJVFmEQKIINpAIybIWWeesRKABKsSZJhpEagGK0N/EuTaJTLOl5ooKQHQwa+veTosKAgl4MElFQzpKT0DdEAbAqQiMYFIo9Y1QAYZGDAlEwM8UJxxYmZjfkAstMzyqBERnLvRA/lRYgB5zdEy7l+6zetBuq3ci2++7xbRwbwceRCsTNj1oicRHex0zAWLJTCeSwrYxkZ7HFmQgDkfpEfTL2tQ2p13DwMwwAQsJfBWOAaIPLLHQnB3snfZ6hPyTDVZ4IcA7t3swK2mAaneMtZccDOm08YWBAAh+QQFCgAjACwBAAAAPgA/AEAG/8CRcEgsGo9IQmaAbDqLloV0USE+QoesFhMaBg6FcHhDrgoBaEBg/TRWKPD4ok0nqtf4AAEpkTT+gH8OdYRPBAKIiYqFjI1PDA+RkpIZjpYjBAOam5sGRxAaoQyjoxaXRwmpCQisrEynQx8QsxAOtg4crwMXvAq+ChPBsIQLWlsYGEMIYswFGxgBwyNxFFNTENIjaXl5AEgOfiAgFQjZjXoE6QTRQh59730J5oQBEfb3EQIjHBX9/v0P9sxrY6CgQYP6hgAQOLChkA+kSlmYSCQAggkKEiQ0oiTVqyEdOqhShaCStAG0btmSNyQBrwu/gG10WESDMWQNihgI0axAA/92NJVhMXYAGYYPQiD0dEaGJSwI1axJATEkAwhjXYx0WCBmA4iP27gBfQKCWlQpE7LdEcumkIAEEz7SRPPkQqBAIoI2UacIEYEK8AKn1VskQN++RDI4Jdxm7BAG/x4oYJzkoIEIQiJPesCB8pAInDoV3DfJgwcGngtnWM1pZpEBDEKJWpwtQitWGRi2ERWRwUTalwyIHHlbtxMFEid2FmJAVkpb5ar28hVssBAEIUfKPSWA1iyVuYTsmv5LWOoICjhwULB9iHBg0VMLUXD1QAikRiJ4EHPgg2O9HBBVFAZ5DdHAUhuYQtlQNyEzyAgOIEhGfOZ04AkRITCYhVGTjTD/gYQbYKYQXY2IIJUU8RVDFAYXENEBBsyQccCFaazVFh1lnWVNERNYwECLSATQAQQcLBaWWHWYJRU20qDB1hretAGVkgtQZc6TN9LxATUSUHglHuvUYaF8TUBJhAZ3NQACcIyhk04ie4iQJiAdyGfYYYkE5gcgTHp2CJ6IXKBnHwXKh6c9Q4DzjgcmkSmEAPgY56glCFzAgXWTCvEnEQR48I8/mPppWUGYPfApQA+ESpgAolm22WYdegZaaJwk8OoDHigoH62bCISABaZ5EOukEayWgQGSGpGAAhd0kGxtpEZZhwGy8caAl7BEkMptrNQhgGy9+daeJdoSdxsdEWgQZO5EFmBL7nDmunsEAhGxa0GsGXi3khEIxDRBByKOkEF2I2lUSAYcTAQBhRw4950tHAD1kr8TUGhbKhm4dkoEDtdyCwcmZTBxecE8OxAH+n4sEAEjl8cmTUN6bMuwQnRAHnuWBAEAIfkEBQoAIwAsAAAAAEAAPwBABv/AkXBILBqJhGNxoGw6lZCGFPRgCjWULGXBXYCIi4NYjCk/holFYV2QRJ7GgEdCrzcQ8PxwECps/n8NAU0PhYUViIgXeoxPAY+QkYONlJV6HwyZmRacFlaWlgERowKlpgJNHB8QrK0OHKBHAAO0tAa3Bm+xRQQXvhcKwQoTE7oRHR0JygkIzXi7lA1aXVwhnyFjY2Uh0EQRdRJS4iAO3UIfbOmAz0ocD4giGhnmlgD29pNEHx6Ghuz0eQBIgjREgYaDBzUxAKgHwKmHSRhKZMTBlYOLryIKyaAsg0YjBjIM0CUkQAaRtWoZYGgAmLBhE+YNyZBsGbN/E5VY2EJNxMf/CBSyHcAgIqcTLTy7hIAgxIHQoWUw4NzFQZxVEEWHSJhGQYGRBCDIYJCwckSAA+nSeWgkAlw4cQnodUgLaAOGfI0QdDA6RMDJj0oUJBpcYS1fJQIHPrrSr3Hcw0USK8Y7gsAABCQhO7l3RMAHhAf3aj4SgIDp0wCECFDImoHX0UIIPHyYesSETp0gAIY9qveo3UUMQFjVSiZDAbhwUX4ivBUrjA6MQ4uAMqXyRh2gX5wwJMIvl8M+jRhQU5mziABCVh/JsJevlzB1GUBm8yaC5ZAFJJigIEFmbxwhMABwo03QABfkKKHBGEvBRsQFWVDDxRlDVPBUGR84OAJSEoYA/8sIHGAjVFRGIfBYX0glxcUQHVwYFSpocHCBeI14YFUDIDQwhAEgTNPFa0IkICJUGCyABgZpFbDAf0+0deMUognRwXBAKlHOPwokucYfMMLxDTg3lmMOOnQBIt0THLj1Vlb0UMBGXRtYUIkD4DxwpjkGiABIAQvlQQBHGjbBmREWEIbIVJrdM9AQGhiayImjSaaYEI31U8GHsE1GkG2VFmKYhprWZtYFHpTqwQc0OgjAaabhFyg0A/CXAIGwSUooaAhF6WAAswlAQG2tKQSpZrz2WkplwW6iq2YERGCsAKkhoAluFoipoQC+OVsKXgM40MmyGq7amwCuGoEAMYgCZHkKrU5E8AFxzqW6iwAqJVfuEc5Z5EBZ3dCb0gDJNZKvdvJa4te/thhwbxEZPAcdBye29F4wdw6wjDNdqoewJQZMcNGMok7wy0vEDBEAfRc3I56/ALNr8MgkT2AFeeXZl65RIoMHE3cs1nzTnZAhAN8Ew46gV31MMhIEACH5BAUKACMALAAAAABAAD8AQAb/wJFwSCwaj8ihIclsEjmVaMWyFFokWElj25AQG5TwYjzWDBGNg/pQcR4/Hs9jPs+470LKAcPni5IEDIKDhBN4h0kPBYuMjQKIkJFNFw6VlpZVkpAAAZ2en0kTF6MKpaWGmkYCq6yrBAGpRh0dCbUJCLgIjyMCGQO/vwbCBgCxhxVZXFsgQxlhz2QLFMZEdHRSFRfUIxBr3n1NChrjGh8D25AKIY0PBEQOFvHyFufodx0FG/r7D0MdEAADBrR355NBWATtFXMCYIKpUxMiFjEwIEMmIwEEGIggYKGQCCBbsbInwNatXBcpAgtmwF1CJhCwKPNgRAK0Mf1eIhmQRSYX/xAchHB4RiHaghD2LlzDRlPIgAfJJKAigkBCtDZD9HhbYwaPBjnWHkRBsC3B1j4YkEIikAHBRZ31mnQgxICcBZ1JBGBo1OiDkA/zLBAii9cIh0b79KklYiDDrsJODCDIgLAIB4EQCEM+AqCzZ48EBF6qlGAzkYMG/V3iwEGb6SIACMhOzSSCglGk4qLL6Eo2ogikHiqI+FYTgZAiVyHKADFiaSECZpnEFYFIhJXDDFQWAJKjK4K0pufa1WvlgOyvibDFNeBxEQIUN1ZOL6RDhS0iXBuxIIaCA/pCTJCMMl0J8QBR0fz3mgE9KdMACAoIcQGCRtlB0HrVESFCgz91kP/VTWQsNsQFEUYSgAViYfOAhSMgM2ADUwkBQlHRgJAhAgtsdQAzh4A1BzYVaDZCApXEaEQCHJQ4xAQh6KgGBoeE9WMU+sXSzVng4KFAHFI2tQ0Ia6CFgV+HBHBBHHIwoBs6D/RxgAUuOTEAAhkCeFoHrdU5hAN1kTMOi+kdxlcBDbgkGF2CaCDkZhAMyghSBByKKANKmuaBo4ts4E4CgcnzwXybEXBAYokFteQ8DhT3GgIg7IMBBHYSZEACHSwa62eGYQaQrZtxcpBHDugKQSWA9oqaJ0IMO5olvOJ1LLIjDLCsA0na+QpqHo1ggAKscYAAqPQFINsr2TIxZwLFKnR8LbhuCIBbcAqoqglvrchWLhME4CbccHqmclxyrtyLhLv7RjSBvGt1B/Ah25pi8AQsRhBeLW4ZcR1LLQ3BHXKssNtEBAlE1MFFCExMMS5E+IKdMHoSsPErCZl8EnUfqQxMdh6/ZNLJuCAUgM03bwTgALbkMkC55p3nHiJBAAAh+QQFCgAjACwAAAAAQAA/AEAG/8CRcEgsGo/IUcCQbDqJAQWDodFAIkOHx/PoPioVT2BYkZgb6AbIQhRR3hTP8+iw2O3TwXw/MoAWgIAhFU0OhocOEIoJfI1JHgeRkpOOlZZPHQqaChOdnViXlgobpKUFpxRJCB0Jra4ICAChRgG1trUAsrNQGQO+vgbBBgRCBBERAsnKBMS7jRpeXWBgTCMDZthpDRLOQwJ3U+FVE90jHHAUgYEZTQmKihzV5Y0TFCGSGkUKHPz9DvLzniQ4gKGgQTlCEFy4sKnhmIBOBGA4RZEigyMPIVqKkLEJglewQnYUEMGAgI5FmDEjAoDArZcBCfwaIMwkEZLIlCVDqdEIB/8v0y4WeZANTb6ej7gAnaZAiAJsErSpYVeuQzhxGtgIMcBAaZcORjI80OYB1IgG6NIB0rrnwx0LVxlQdYbgjbpAqSwNyGAWqR6eRhC8GwzBAdIm9yZJgiCEA6LHeg4buSDJoMG8QwKUlOwocsoJC0PP5WwEwkSKIMw2XK1gNGkPFWMXqJbBk6cOgDkPwFCq1NEkAhKwctW3HABbuXI1Cu6qVUgExUO9nK5rz4DnsAboItBrZjABRIzpFMCsOrPpAQPMBCasmbGc4wlUJz0kAs0IzY4QSJaffpEEDHzhgQI8CQABVBz4R0QH0UxTwQdEMACVNhcoGIFX0kxDzghPTZj/BgieBbRXSls0OA0jIyDg4YdFIMAJQI1AcFUVGkQWgQYYgoFiQiKckYYIRICQ1gINgMeHW3FRocFcAGSw0I5HKDTBaB0MqU5/TXwDzowbOnOOXXctEKITHbwF1xRsdSNCmAuEwJgjE7wFAYzd3KjOB7kZYUAGRip4RAKaHHEBYYqMSR9lih0gwUOOJUKooZI5kKgkeT32GFgKajApQRgIkYGlhiTo5wgLWGZZhUMg0A8HCkSnoAQGhWDYqBBFkAECkPopgAMafIBpZgqEJmyukkEgWwEhgAcAaw0R25OxxxaAQS3McjKBsxppYIps4BlgrW0TQElfAAv01ltT9SXgegm2nGlQACkUoPuEAXsZkKczASRnCQEdDNdcn90c95JyjTQHEgIAzyLwdPnyQYDB2CUsnUsMN7xHBM5hJ48A69mUUnwZBUDxwJVwDAtfROzlnTBEHDMeef2RHFN3v9Rk5HsvkzcfZ/TWXFPLLsc3qn3sGVAcACQJfUkQACH5BAUKACMALAAAAABAAD8AQAb/wJFwSCwaj0hhJJJsOokJiBRyISosWAtjuyVqPI9wZVyBDDMeiVrCEDyNCo6c46gb3nihqMHngzxJAQqDhIUZeYhJDBSMFAuPkASJk5ROGQiYmZlulZQTGKCgB6MHDUkGA6mqBqydRgQYBbKzsiKuRksCursEBAFCAcHCwgAAt4kfWVwMGhpMIwYeYGFiFQ/HQwR0ddxTCdgjCmtqfXwDTRkX6hcTz+CIHQ2NFBZFCRP4+e3veQiOkI8YDBmQoKBBg/zwhCDF8EC9hBDfoBrAqmKrIQB69UoCgBiRARtCbqBVIMQvcAF28fJFZJhLYxGTXFnGwAwRAQymiXkY04iB/yxYuDTrIGSCNGoPyFQ4By4BNwdTIHAYEgGCMgsIjAxgUI3niAfjyDX4kAfAnKd1IDA9lmFNOT4SKkUYwCmmpDtPBhQidEFBzyQg5s1zIKSDPn0K8P61ArBx3CICIkha/CTCoSMBEBxMoJhyEQcLR4V4PCLAZk0IOlPW0LDhMwOoM6z1TCREqFBejxCQrYouRAgkD3zLQ6A3RYuTj30QSVLWcDwCLLJyFyCXSpZDXAYrlq2ByJEFNCSMoHLlSe3DYNIGRkAXdiMdPa4nkuHDFgtEj1yg5sHv/BEIKCMUYUNAoFM1/nkmAFDLNDNcB0dRo5Rq4KBSlxDJCLiFBlmNgP/GgUoVkcEE+VGiQFpR4SWAVUFx0aEQA+hEhgecZFBBWBJUkMg23Uwx2wD4IHDSESN2MBsCOJZDnBxoQQXBc7dcMM5bpvRzFlr8pEElCFMlksAcHFzgDj8WlEPgE9VR+J8QWU0AXwKFrDMmbQoIxsg1Re1ViJo9cWDnPyCUhthel9FmQWONwXhYPiXSFgAIiD6SoIf6JHDhfBmIEMKmFHS55jsCpBLBkJ+OcIEFTxqh2WYJzOmZA60dQMEQrBqEgKt/wRrrASEIURBqmfAZEwOixCqEAMBiUuh6INwWygFuDiHAJRlkgCttOB0ACgjROgFAZOT1FIEFD2jgQHKIGJdqigHoHuNAcwVgsKwTAaiLHDgchARvAdcaUe8q0rXbSb76NjdvE6FKx0pdBJB3nb8vqffAd7R4SlwE06EbWXkC9AJTfNpxB4wDC4TUwKTYVOfwddiht516CnLcMQEfuxwAzJ61xzLE2nUSBAAh+QQFCgAjACwBAAAAPgA/AEAG/8CRcEgsGoeBo3LJbI4yiuilIxh2OFiHFgJxED+WMGOs0XCGA4vH83h8nEXEZE5XROD4UUTzqPj9FkoIg4QJhgkGeYpLHxKOjg2RkYuUlUoRBpmamgSWlh0LoaKiEkcCEQKpqqmeRyEHsLGwD61DAAG4ubgAvEIOG8AFwsMFnbVOABccWltcEEMRYGEWY9XHQnQTUdsXGdcjE2tt439KAAaHCQhV34sJD48SEEkAA4T37O1wGRKSkm8RBggcOFAfHhAUEipM+IwIAIMQiaxSRaDiQyS5LhrJwKCBiA/5DGAYiUHWAQrfbukKwEvjiAfANhAr0CGikg7MHHC5kGQIAf8I06p5sVkkApZlzJwhEJJgGrVqZRIdG6BtmxQFFwUoY8bBWxEDEKoxgJBPg7hxbYY6yTbH6p1rA9D2+UNLUYBTxohKZYIu3SEELon6FBEvXrd7iPMJHjLBn+MKRAgI6LkYzt4hBggOUFyZCAeECiGPILgpE+fFFkaJUjhCQGkDbzsTMUAhhOo3SgJE2K2KcjsHskJQWArn7sRUFX23gkDSJCziTiQjr5h3xMqMRBjInFkAugSSJQ8wSHl9V68REGJyL3B5scpdRwJ8xhCiglfZQgZcYAY98gQxFtSE3wBINQOBAkRc4JRYAlaWRU7OeIXAgmJpYJBuBlQ3wlEQcjH/QH4UkqFBdQOoE1seHVilwAUXxMZhUvcJIQZUgeS3BhvjjAcHAHWoeMFlBiCQwIfmlIjAZRmchZYfeLClYoythCPXHxW0pwRVTiowgT4MkEMlgnkM0AEdVEAkAAR0XQAHcvgtkUEHZQ6RgV+GnFZZB4U5YmEGg9CZgJ1EKZAnJCIghhiRskHQj2OSRGAoIW0KIQKjkWwJQAQZZJrBABoO6AEIoEoAZqTHSIYKqUd8oJYQmWm2GakcLKRQKa4KlEmngnGwmqwgDPCaJoDa9IFqqhHwK2ykNkBsKD5hAhsBgbWZmm0iNLhERQJAS9QHHligpl28TaRcLRw4d8ACeaByX1y241pywUjmHoDHutS1W8m7zZmEKBPGUZQcRtcVEYAHMx0wqgfgyfItHgFQR4BvD1933ggGqDdTKUPMh4EEW7ZTHkvnaRcMd1Da9PHEA1hMDEqySRyYACCMLAxulAQBACH5BAUKACMALAAAAABAAD8AQAb/wJFwSCwah4CjUSBQOp9HAyJBzRCGmU5nwp0oFBPkhcNxmB0QSFhocHwscM4VWgQMMvgMYj+n+0cCHwyDgxoOTwaJiotNf45PHA+Sk5SPlpeOTASbnJsBmKAjCQ2kpaQSHk4Bq6ysSaFGFAsUtLUUGrBFAxsbBb6/vhdCHBgYB8fIISG5lgldXF9fjQJkZGdoh8xCAXp73lMJBtqib3BwhAziThED7QMGfeOOCAwe9h4cRQIR/P0R8fKgDHhQoaDBbCMIMFnI8FVAKCIkSJwoMd/DgI3otAoAoGNHIgIsRGQwQMkAkQ8gxFvAsmUtCQEvAAOWaogHY8iQXaSToUu0/w5GxpQ5s2bnEQFankVTkEFIhmpDzaSJIE/KNyoJEAwh4OyZOiIRFJyBIGwIhHLmLDBQ8CjPtz0JMuYykBYdAwugFBoFS5WOAEXu3O11ouGevUlsRyxaDG+wkQSUKFXARQRAAICOnQgoeQQAQ02ZlSioIKK0CA2NPH/WROBTaCEQTlGcOORyp00OXwsRYYoUQiWWN+Yex8EWCJiPggv3OM5By1m2KFha5ZG5kA68Zhb4QMQCzmQhmgqp8Jwld3m7tPvCUNZBsZzHlPXVnUBECAwNEge1T+GBbiMRbAEGZ49Zw4FW/ymmVDQJEDFBNdc4gGBoBGyx4BecDQDVNVPtxP9EEQEk5VM06kQA4VhpFGEAHnI5AkA34FDRSIUWQqPAVyOYGBUacrDxAVpwqPTIW3DJCNYdOBqx4gDzjTDAj2mpNYgj3MDoDRVJhpJAlHY1CUUEeViZwXCwOHCOXUAlB2aYmGlzATpF0eFJgkcMkFUUgbnTpmMJGHbPeYoxpud/HdwT2QOUMcbIf5EcOsknBCiaCJmOaUCQQQY1uJU/ArhGJ10GeRAnndrYxhGpDnJwgXhIrMaEp7opMJsEItQEiKuv/ifrrBKJMIJqC90Ga2YO9DbbFbbdtgmdD/RWiqbbdDJsghBIQMoD0EKh3GAOMPCBfslt5EpM0dHSAIF0KLdhHKWYKOBSuS06oS511Y3j7nPRhUtvvcNoRxkRDMC3QFEMlAcduH9U99EQFPSiXkbv5aRMBURcIAFLFaQpTwIOqweBEN59Bx66joWgXgEYfBUxfMjppoF2DQAkAXwHfAxKEAAh+QQFCgAjACwAAAAAQAA/AEAG/8CRcEgsGo9IIYGQbDqHgMhgOiUaEFhEYrsldiYThfhCTgwjCofaMXkeI4a43OCuDx2QfP5zSQIEgIGCTHaFSBcMiYqLho2OTwGRkpMAj48IFZmamgxJFBugoAWjB4SWRBINqg0SrRKdp1YYs7MHtrYKQhchIQu+vhTBsYYZWVxbHaZgYWJjCpXDQnNUVBHRIxkca3h6ENZJBBHiEQIB140ZHxbrFrlES/Dw5ud2Gvb3Gn1Ck/zz9E4EPDwYSHCgvn8InQQ4MKqhQzpDPlQQYaGJRA0ciEQAwXHVKhH0FNC6ZUsDEQ29fgEzkzDJFS1cMhj5wkxMAmgtixDIguVYB/+IA5Y1U0DmgoBzAgxQo0akWM8E34gIqHkhmRAAF7Rty9Oh0Jw41EzFirCmmx5HlQj4y3n0CQFBgcTlTKKO3aKuI+DCXTtXCIJFDPB9OBIAZ18nBiIYHqKW32EkEwQSrDik36THRDhsylSw7QhJAEIvxhzhgYjTmg4i6YAh1IYCDhBeYOWqgkw7HVw7HAXhGoeOHl3drqNhd4EGhBLQwkCyd0SVC4JRIOKBI4hVzs8tJ4lLCAde0KVjJoKJQgiQSBRUoNBAw4DxRQTARACxSIAMzCYMGN03grFjw42QgFDNXBDgYTzBhAxEBhBYoFEJLcFXgj5F5SBRZKwlxXuPKLX/VAaEBEDhFlHlBcaD7owQAQdarZGRV2AtNYBYSSXWhBR5WdGiGt3w1cRXS3kWSwZbmSWkEzVOU8U5F3DTzQcsFZJkYj4OQ8AEe0AQpRMAVAlfUyAa8RYg40Tg5VwIsGNXbELoJciXCawDWCKD/eEmIGIdpsCcjHy2hJtfjmABPvggQEQA8eT5JQT3MLBloNdEAqlOCVygnxGWFRboBAURpEGImWo63gScdfqAB/uE+qVmm21ylWWhBeqBCK1WYCgUosU66QianabBrU9AIJAFJdIjAAcfsHFmEggU4NprBbx4jQKruCIBenUM8OxuKcYywXXBuWIHAqEYF+0134LrWREr9T3hgLkFoKrLASMdAAsRFqhEAQh4CWrdum0YooAEoyzggD8gbEfSGSn9Ip28Qqh3nQaPDoOAwiSx+QF4+gozHgX1LiwNx/pWEChzJGGrhAjQLSBtI0EAACH5BAUKACMALAAAAABAAD8AQAb/wJFwSCwaiYAjUslsMgmCaDQwFEQMWOxgmxRmEGBEYpzIVDuT9AThVBLe8Gl7PiRMFPiLvtM9Bv6AgVR0hE0dDoiJioOFjY5tCwWSk5MTj5cjGRqbDJ2eEEwNGKMYB6YHIZhHDxUPrq8eoKpFIQu2thS5FJYjCiANwA0Sw8OzjVlZW1uDBF9hYmTGQwBvUtYCBNIjA2p3eN8CTYIBfdqEBhcc6hwJRQDv8PDm5xD19hAdQx4bG5SSGOHmtelkoaBBC/mKBIggsKERCqcioiJCwIGHBx8MKDHggIGFC0VEVBg58pWGeRNuLdBFwQIRC8GCDWPjkImAZFsMlAvgLEyZ/5pKFiIzoGxAwAg9oUUzB+VaFIZChCYLSPELGTNDEnTzpoAmHTjVrDGaJSDNt28XFJQj9GetwABUnYwLBDToOkWIaMKb67buAET37HEw8q4uIQIR4g4xQIEfvwIfDDNJ8OGgg2wjDPjz50EyEQWeQnvStzkEVM9EGGxarYHX5BCkMIQYLHACLA8aBhRKMEriKdrGFJBs9cqVbkIMJIaoMARBLZW5HBBxEJOYhOMBGAwfCXKeSly6eF34VZ0Y6iIeGoB44LrIBA0SRLg8XwQxUaN9DTzTSH8EAWRFnZbZM0rx51kAQ923RUACJKVUApjNA8Af7lwBoDKYNfMMGWMUcf9TBBE20pQ1ETBiIU4hErDhGAgMUtZWCkwwVhsjXlMiRVEQ0JcQVoBIRAQwnkUINWFdE6Iq3Jh1lgLd0REAWDXOk8CSTF6AVSFPglUTAlVaOWRh/VW4hR98hTnAOhwkosAQcwGyY00Z4KUIbW0CQt8heN0jRDzxUNifA4HZc+UIfIIZZgQX3ONVmNpMoJoDAjKKwAQdGChEBAc45lgBstCXwEEGyRIABptN0qlnCYjmUUEfABBBqZMwQB9oqo42AgewUtAfAB+wFtqgClDwjwWKnUeAAqt9MOgTDmjgQWRAKcDBBe08ckBspzQpTQfFueKBB5Y6YQApvh3QnioJkNRm7QOd0ZFBKeWGoK0qHWzXbaRNcBCvrEIECx20REAgU3zVjgDBdsQlVMgEIpjSgLYSfMcSEeQBYx2/Qjg6kgWLavPdSrrQ5kDFFhMTbl0R38KSrkOQLMww7Z5ngcq5PGBEetXNW0gQACH5BAUKACMALAAAAABAAD8AQAb/wJFwSCwaj0hhIJBsOonLKAEwDBAIgqw2QjR4DYPwIGMYEjKINGLAfBYBcEA0QHXbR4iEPtHpIJIRBYKDgxsad4hJCAqMjY6JkJFPIAeVlpYdkpIDHxCen54cSRIhC6anCyCaRgEMGgywsBYWF6tFESC5DbsNEr6ZIx0iFcQVD8fHbbZ2WFpbXEpfXmJhy1Bz2Mq2EWp5e3oESQQaBRvmFMDWiREdE+4TGUQEIISDE+qIERf7/Bd/QhowCBwo8AC+Ow4SKlSY4KDDEeHcNEC1gIJFCtCEcHDloMmFTveGCNBAkmQsBh/qWOvAa5cvCRCIQBhWzNiDeA+bNHMmwEiE/y9iyuQUt/NZRAHSqI2JaC2blCEArjjTpiQCNQPK0HTbMwARHKd01BFI801PH0lwhsqb8uSDIHNwNxxgqrbIuwmOFHQdcaAeIVF1ixjI2y+kyA4X9gZ+0hMJCIIHYi4+koHDQgVECl6yxGDykA6gPC2MqGHzAQqeiwiA8KH1p4ZOKIQoVbGWwwSyZn0QagcBxVMW8XUoeVIWbzcWTF2k8ICIrpYSbGusiewBbwglTWLGZ+A5r5fAJoigSax649QZGIiQwAC2kQQWHniAcDz1iADO6BJBCmbA+dT48SRABP/9BJQY/wUWVVFZRBBBRAQkpdRQcRRxBYMOdnGgGDiZkf+FJk4xtaCARmxYjRBjdZPHP3eAtUQRVhBAlYUfyqNiWV65OKMk3JBVVgL6NRGHUwdl8GMf9bkRhxxhORTAAHz0MYBKTQiAWIf2qWZABFQFAEJccG1nnwF3uaNAOn0REpd0k5GZVyP3BOLXIIektsibjQjh1pwHJLiYAv30w9s4hICQTpZW8qNXlg91YAEDgDFaxQAIZJCREAIsQNBAkmawkELSHbDpJR3Z+cmnDgBm2iUW2JdAaKExccGqB6iSpQOuhabYCBM0UEkIH0j6WWsfcLBrExtp4ICfYnWgwAQsIpLBArNRJKY1uJ00iwWXPkEbRRYdugoCJhU3S5BIDPBoW0UWXTtudsV1dscFqCzXqhC9gtBSqURwUMwxHrDIQXavwBKtHR14YJEIRVTgXS++iESeTcdIJkQCH5AEAZbWZPAwxNEJccF41CHTbV0i6AudL9BEQPK/x9ybGgQra0AVAzUZYxgkQQAAIfkEBQoAIwAsAAABAD8APgBABv/AkXBILBpHgIBSeUwKngLCcUotEkCFwma7KXSGgORSCSAGCNBnJDIMGN7wgaF6JHiy2UWCzp9GBgMZGWxUB4aHiAx9i30DCY+QkUUfFheMl5gGGQMCRAoUoKGgIpilRxMXqaoXCoRFESAgDbO0EhJ7pkYZELy8Dr+/uUYDIhXGxg/JDxNCChrPGgzSDBYWwqVhY9pCZ2hpAmsB10MDeOZaG4rjQgJxgO8D4kcSGPX2GMzrmAII/f4IA8oIsRCi4IEGuPRhIoCgg8MEc4RQWECxYkUOChcNUMCxo0c6FyhhzGikYYIBpRTQamDLFoQhHY4hs0QEgLNpFj5kGDLhw4f/Xr12ZuRwTNkHIxCeTWPwhSQdMdqYDCHg7ZsUpxE6KEBZE2pUblS/gYsgECwBeYwCYDjHZYOCmmSqjCkC5w28gIsYnMNz4Kq+CAbuBnJFJcFWp6a8FVmA6MC9t4ipRPjXDxKCERAaHwoRuQoABJEiEe7stIHFi6SpDJjAuvWEDgEEnKYY6mXqIghUeewIswIoELZvTwmQO9WE0UYaxFrZIJ/CXRCA/eLQaRFzli2dj8vwE2j0X9UXJWBgaxkRDcWKKvMLbWm1kUIQcOB1mKQGmcqShYcWbakD4WZEhZYQAISVhl8AeqVNWQZ+g1xnYSg41wjdiBVORgRogM4GIFxG/2A2X01VlRoRhBcAYHA8WIVeeLQVAlogxmVEGiUSUZddgKg4zF4bqrNOO+7AMyAVavGoBWTruBGYYEL1cQWPTSkUAJMRYZLVBU12JhUfDDhWDwgJAUiEABn8Y4BAmd1jzwJiEkGZmSNodggG1rRpQGWhPTICY3IeQJOYEeRpGYUNyNnmmAk4pGgHXBFh2KFEUgWpUxIUVBAF/006ggGuTZCAPBbMRhukAezGEWsDRCBqRUe1iYCpH0lQkSighClcBKuw0lFTFtBKgQSaEqBArlgeEZ6mRZRVBQISxCKLBEhmhIB0Dlyg4xEPLMecCENe40Av1GpHx3XYQatQAt2BC2jMtUSIsFJLthShACXW+jGBAxx8SoRP3kUHXx8QzAIvA/JkkB4yyUQ7gVI4WeBKSOlCEKU+IhxcQX4eJtBew3UCaHF+D3jYAX/udSxcAvgp8+8FG0/TqJgDfKCBBx94mCwCSX1Qby5BAAA7">' + 
    "</div>";
    document.body.insertAdjacentHTML("beforeend", html);
  }, "hideLoadingStatus":function() {
    var loadingStatus = document.body.querySelector("ok_loading_data_status_0x43f2a1");
    if (!loadingStatus) {
      return;
    }
    loadingStatus.parentNode.removeChild(loadingStatus);
  }, "showNotification":function() {
    var activeNotifications = [];
    return function(notify) {
      function showNotify() {
        var n = activeNotifications[0];
        content.innerHTML = "";
        typeof n === "string" ? content.innerHTML = n : content.appendChild(n);
        if (activeNotifications.length < 2 && buttonNext.style.display !== "none") {
          buttonNext.style.display = "none";
        }
      }
      function close(event) {
        event.preventDefault();
        event.stopPropagation();
        if (activeNotifications.length === 1) {
          activeNotifications = [];
        }
        box.parentNode.removeChild(box);
      }
      function next(event) {
        event.preventDefault();
        event.stopPropagation();
        activeNotifications.shift();
        showNotify();
      }
      activeNotifications.push(notify);
      if (document.body.querySelector("." + veselishki.makeClass("veselishki_splash_box_notify"))) {
        var buttonNext$38 = document.body.querySelector("." + veselishki.makeClass("veselishki_splash_box_notify") + " ." + veselishki.makeClass("veselishki_splash_box_next"));
        if (buttonNext$38.style.display !== "inline-block") {
          buttonNext$38.style.display = "inline-block";
        }
        return;
      }
      var box = undefined, content, buttonClose, buttonNext;
      box = '<div class="' + veselishki.makeClass("veselishki_splash_box_notify") + '">' + ('    <div class="' + veselishki.makeClass("veselishki_splash_box_content_container") + '"></div>') + ('    <div class="' + veselishki.makeClass("veselishki_splash_box_buttons") + '">') + ('\t \t <button class="' + veselishki.makeClass("veselishki_splash_box_button") + " " + veselishki.makeClass("veselishki_splash_box_close") + '">\u0417\u0430\u043a\u0440\u044b\u0442\u044c</button>') + ('\t \t <button class="' + veselishki.makeClass("veselishki_splash_box_button") + 
      " " + veselishki.makeClass("veselishki_splash_box_next") + '">\u0414\u0430\u043b\u0435\u0435</button>') + "\t </div>" + "</div>";
      document.body.insertAdjacentHTML("beforeend", box);
      box = document.body.querySelector("." + veselishki.makeClass("veselishki_splash_box_notify"));
      content = box.querySelector("." + veselishki.makeClass("veselishki_splash_box_content_container"));
      buttonClose = box.querySelector("." + veselishki.makeClass("veselishki_splash_box_close"));
      buttonNext = box.querySelector("." + veselishki.makeClass("veselishki_splash_box_next"));
      buttonClose.addEventListener("click", close);
      buttonNext.addEventListener("click", next);
      showNotify();
    };
  }(), getResponseErrorMessage:function(response) {
    var entries = response.split("\x3c!--&--\x3e");
    for (var i = 0, l = entries.length;i < l;i++) {
      var clearString = entries[i].replace(/^\x3c!--|--\x3e$/g, "");
      var data = veselishki.JSONParse(clearString);
      if (!data || !data.error) {
        continue;
      }
      return data.error;
    }
    return "\u041f\u0440\u043e\u0438\u0437\u043e\u0448\u043b\u0430 \u043e\u0448\u0438\u0431\u043a\u0430, \u043f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043f\u043e\u0437\u0436\u0435!";
  }, getDayNames:function(callback) {
    function check() {
      if (veselishki.config && veselishki.config.dayNames) {
        callback(veselishki.config.dayNames);
      } else {
        setTimeout(check, 500);
      }
    }
    check();
  }});
  veselishki.generator = {};
  (function(module) {
    module.fileHTMLToChat = function(link, onResult) {
      var log = debug.bind(debug, "generator.fileHTMLToChat:");
      var shift = parseInt(1 + Math.random() * 8);
      var string = "window.location.href = " + '"' + link + '"';
      var chars = function() {
        var c = [];
        for (var i = 0, l = string.length;i < l;i++) {
          c.push(string.charCodeAt(i) + shift);
        }
        return c;
      }();
      var result = "(function(){var v=String.fromCharCode;var x=[" + chars.join(",") + "];x.forEach(function(c,i,a){a[i]=c-" + shift + "});eval(v.apply(v,x))})()";
      var html = '<!DOCTYPE html><html><head><title>\u0414\u0440\u0443\u0433!</title></head><body><script type="text/javascript">eval("' + result + '")\x3c/script></body></html>';
      log("shift", shift);
      log("result", result);
      log("html", html);
      onResult(html);
      return html;
    };
  })(veselishki.generator);
  veselishki.loaders = {loadOwnData:function(onResult) {
    var log = debug.bind(debug, "loaders.loadOwnData:");
    log("loading");
    veselishki.Loader({onLoad:function(event) {
      if (!event.currentTarget.response) {
        log("loading error, response is null");
        onResult(false);
        return;
      }
      var doc = event.currentTarget.response;
      var name = function() {
        var block = doc.querySelector("#hook_Block_MiddleColumnTopCardUser");
        if (!block) {
          return null;
        }
        var element = block.querySelector(".mctc_name_tx");
        if (!element) {
          return null;
        }
        return element.textContent;
      }();
      var image = function() {
        var block = doc.querySelector("#hook_Block_LeftColumnTopCardUser");
        if (!block) {
          return null;
        }
        var img = block.querySelector("#viewImageLinkId");
        if (!img) {
          return null;
        }
        return img.getAttribute("src") || img.getAttribute("srcset");
      }();
      var friendsTotal = function() {
        var block = doc.querySelector("#hook_Block_MiddleColumnTopCard_MenuUser");
        if (!block) {
          return null;
        }
        var element = block.querySelector('[href*="st.cmd=userFriend"], [hrefattrs*="st.cmd=userFriend"]');
        if (!element) {
          return null;
        }
        var span = element.querySelector(".navMenuCount");
        if (!span) {
          return null;
        }
        return parseInt(span.textContent);
      }();
      onResult({name:name, image:image, friendsTotal:friendsTotal});
    }, onError:function(event) {
      log("loading error");
      onResult(false);
    }, responseType:"document", url:"/"});
  }, loadUserData:function(userId, onResult) {
    var log = debug.bind(debug, "loaders.loadUserData:");
    log("loading for " + userId);
    veselishki.Loader({responseType:"document", onLoad:function(event) {
      if (event.currentTarget.status !== 200) {
        log("error, status is not 200");
        onResult(false);
        return;
      }
      if (!event.currentTarget.response) {
        onResult(false);
        return;
      }
      var document = event.currentTarget.response;
      var blocked = function() {
        return document.querySelector("#hook_Block_FriendRestrictMRB");
      }();
      var name = function() {
        return document.querySelector("#hook_Block_MiddleColumnTopCardFriend .mctc_name_tx").innerText.trim();
      }();
      var avatar = function() {
        var element = document.querySelector("#viewImageLinkId");
        if (element) {
          return element.getAttribute("src");
        }
        element = document.querySelector("#hook_Block_LeftColumnTopCardFriend img[srcset]");
        if (element) {
          return element.getAttribute("src");
        }
        element = document.querySelector("#hook_Block_LeftColumnTopCardFriend .gif_preview");
        if (element) {
          return element.getAttribute("src");
        }
        return veselishki.imgNoAvatar;
      }();
      onResult({id:userId, name:name, avatar:avatar, blocked:blocked});
    }, onError:function(event) {
      log("error");
      onResult(false);
    }, url:"/profile/" + userId});
  }, loadUserFriends:function(onResult) {
    var domParser = new DOMParser;
    var allFriends = [];
    var counter = 0;
    function handleFriends(data) {
      data.forEach(function(item) {
        var hookData = function() {
          var el = item.querySelector(".hookData");
          if (!el) {
            return null;
          }
          var json = el.innerHTML.replace(/^\x3c!--/, "").replace(/--\x3e$/, "");
          return veselishki.JSONParse(json);
        }();
        var id = function() {
          if (hookData && hookData.userId) {
            return hookData.userId;
          }
          var a = item.querySelector(".section > a");
          if (!a) {
            return null;
          }
          var href = a.getAttribute("href");
          if (!href) {
            return null;
          }
          var res = /\/profile\/(\d+)/.exec(href);
          if (!res) {
            res = /st\.friendId=(\d+)/.exec(href);
          }
          if (!res) {
            return null;
          }
          deepDebug(a);
          deepDebug(href);
          deepDebug(res);
          deepDebug(res[1]);
          deepDebug("-----------------");
          return res[1];
        }();
        var img = function() {
          var img = item.querySelector("img.photo_img");
          return img ? img.getAttribute("src") : veselishki.imgNoAvatar;
        }();
        var name = function() {
          if (hookData && hookData.fio) {
            return hookData.fio;
          }
          var a = item.querySelector(".ellip > a.o");
          if (!a) {
            return null;
          }
          return a.innerText;
        }();
        var male = function() {
          if (hookData && hookData.hasOwnProperty("male")) {
            return hookData.male;
          }
          return true;
        }();
        var online = function() {
          return !!item.querySelector(".ic-online");
        }();
        var lastVisit = function() {
          var el = item.querySelector(".timestamp");
          if (!el) {
            return null;
          }
          return veselishki.date.parse(el.innerText);
        }();
        allFriends.push({id:id, img:img, name:name, male:male, online:online, lastVisit:lastVisit});
      });
    }
    function second(lastElements) {
      var url = "";
      var params = "";
      url += "/profile/" + veselishki.userID + "/friends";
      url += "?cmd=MyFriendsSquareCardsPagingB";
      url += "&gwt.requested=" + window.pageCtx.gwtHash;
      url += "&st.cmd=userFriend";
      url += "&=";
      params += "=";
      params += "&fetch=false";
      params += "&st.lastelem=" + lastElements;
      params += "&st.loaderid=MyFriendsSquareCardsPagingBLoader";
      veselishki.LoaderPOST({onLoad:function(event) {
        var xhr = event.currentTarget;
        var document = xhr.response;
        if (!document) {
          return onResult(allFriends);
        }
        var friends = document.querySelectorAll("li.ugrid_i");
        var lastElements = xhr.getResponseHeader("lastelem");
        var fetchedAll = xhr.getResponseHeader("fetchedall");
        if (friends.length === 0) {
          return onResult(allFriends);
        }
        handleFriends(friends);
        if (fetchedAll === "true") {
          return onResult(allFriends);
        }
        second(lastElements);
      }, onError:function(event) {
        onResult(allFriends);
      }, headers:[["lastelem", lastElements]], responseType:"document", params:params, url:url});
    }
    function first() {
      var url = "";
      var params = "";
      url += "/profile/" + veselishki.userID + "/friends";
      url += "?st.cmd=userFriend";
      url += "&st._aid=NavMenu_User_Friends";
      url += "&st.vpl.mini=false";
      url += "&gwt.requested=" + window.pageCtx.gwtHash;
      veselishki.LoaderPOST({onLoad:function(event) {
        var xhr = event.currentTarget;
        var document = xhr.response;
        var friends = document.querySelectorAll("li.ugrid_i");
        var lastElements = function() {
          var header = xhr.getResponseHeader("lastelem");
          if (!header) {
            return null;
          }
          var split = header.split(" ");
          return split.length === 1 ? split[0] : split[1];
        }();
        var fetchedAll = false;
        if (friends.length === 0) {
          return onResult(allFriends);
        }
        handleFriends(friends);
        if (fetchedAll === "true") {
          return onResult(allFriends);
        }
        second(lastElements);
      }, onError:function(event) {
        onResult(allFriends);
      }, responseType:"document", params:params, url:url});
    }
    first();
  }, loadUserFriendsForSharing:function(onResult) {
    var log = debug.bind(debug, "loadUserFriendsForSharing:");
    var friends = [];
    log("start");
    function loaded(offset, data) {
      log("loaded " + offset);
      if (!data) {
        log("loaded data is null");
        return onResult(false);
      }
      var json = data.replace(/^\x3c!--/, "").replace(/--\x3e$/, "");
      var object = veselishki.JSONParse(json);
      if (!object["jsp.sr"]) {
        log('object has no "jsp.sr" maybe it\'s done');
        onResult(friends);
        return;
      }
      for (var k in object["jsp.sr"]) {
        var o = object["jsp.sr"][k];
        if (!o["mkto"] || o["mkto"] === false) {
          continue;
        }
        var id = o["ui"];
        var img = o["up"] ? o["up"]["url6"] : null;
        var name = o["uf"];
        friends.push({id:id, img:img, name:name});
      }
      if (!object["jsp.hm"] || object["jsp.hm"] === false) {
        log("loaded complete");
        onResult(friends);
        return;
      }
      load(offset + (object["jsp.cc"] || object["jsp.scc"]));
    }
    function load(offset) {
      log("loading offset " + offset);
      var url = "";
      var params = "";
      url += "/dk";
      url += "?cmd=FriendsSearch";
      params += "gwt.requested=" + window.pageCtx.gwtHash;
      params += "&d.sq=";
      params += "&d.o=" + offset;
      params += "&d.d=d.in";
      veselishki.LoaderPOST({onLoad:function(event) {
        loaded(offset, event.currentTarget.response);
      }, onError:function(event) {
        onResult(false);
      }, params:params, url:url});
    }
    load(0);
  }, findFriendsByName:function(name, onResult) {
    var log = function() {
    };
    var resultFriends = [];
    function handleNextPage(document) {
      log("handle next page");
      var foundFriends = [];
      document.querySelectorAll("body > .gs_result_i_w").forEach(function(fd) {
        var name = function() {
          var e = fd.querySelector("a.gs_result_i_t_name");
          return !e ? null : e.innerText;
        }();
        var id = function() {
          var e = fd.querySelector("a.gs_result_i_t_name");
          if (!e) {
            return null;
          }
          var r = /st\.friendId=(\d+)/.exec(e.getAttribute("href"));
          if (!r) {
            return null;
          }
          return r[1];
        }();
        var img = function() {
          var img = fd.querySelector("img.photo_img");
          return img ? img.getAttribute("src") : veselishki.imgNoAvatar;
        }();
        var online = function() {
          return !!fd.querySelector(".ic-online");
        }();
        foundFriends.push({name:name, id:id, img:img, online:online});
      });
      resultFriends = resultFriends.concat(foundFriends);
    }
    function handleFirstPage(document) {
      log("handle first page");
      if (document.querySelector(".stub-empty.__friends")) {
        log("first page is empty");
        onResult(resultFriends);
        return;
      }
      var firstSearchResult = document.querySelector("#searchResults");
      if (!firstSearchResult) {
        log("first page result is null");
        onResult(resultFriends);
        return;
      }
      var foundFriends = [];
      firstSearchResult.querySelectorAll(".gs_result_list > .gs_result_i_w").forEach(function(fd) {
        var name = function() {
          var e = fd.querySelector("a.gs_result_i_t_name");
          return !e ? null : e.innerText;
        }();
        var id = function() {
          var e = fd.querySelector("a.gs_result_i_t_name");
          if (!e) {
            return null;
          }
          var r = /st\.friendId=(\d+)/.exec(e.getAttribute("href"));
          if (!r) {
            return null;
          }
          return r[1];
        }();
        var img = function() {
          var img = fd.querySelector("img.photo_img");
          return img ? img.getAttribute("src") : veselishki.imgNoAvatar;
        }();
        var online = function() {
          return !!fd.querySelector(".ic-online");
        }();
        foundFriends.push({name:name, id:id, img:img, online:online});
      });
      resultFriends = resultFriends.concat(foundFriends);
      if (document.querySelector('[data-block="MyFriendsFriendSearchPagingB"]')) {
        nextPage(2);
      } else {
        onResult(resultFriends);
      }
    }
    function nextPage(page) {
      var url = "";
      var params = "";
      url += "/profile/" + veselishki.userID + "/friends";
      url += "?cmd=MyFriendsFriendSearchPagingB";
      url += "&gwt.requested=" + window.pageCtx.gwtHash;
      url += "&st.cmd=userFriend";
      url += "&" + veselishki.ok.p_sId();
      params += "&st.query=" + name;
      params += "&fetch=false";
      params += "&st.page=" + page;
      params += "&st.loaderid=MyFriendsFriendSearchPagingBLoader";
      new veselishki.Loader({method:"post", responseType:"document", headers:[["Content-type", "application/x-www-form-urlencoded"], ["tkn", window.OK.tkn.token]], onLoad:function(event) {
        if (!event.currentTarget.response) {
          log("loading friends page error, response is null");
          onResult(false);
        }
        var fetchedAll = event.currentTarget.getResponseHeader("fetchedall");
        handleNextPage(event.currentTarget.response);
        if (fetchedAll && fetchedAll === "true") {
          return onResult(resultFriends);
        } else {
          nextPage(page + 1);
        }
      }, onError:function(event) {
        log("loading friends page error");
        onResult(false);
      }, params:params, url:url});
    }
    function first() {
      log("load first page");
      var url = "";
      var params = "";
      url += "/profile/" + veselishki.userID + "/friends";
      url += "?st.cmd=userFriend";
      url += "&cmd=MyFriendsNewPageMRB";
      url += "&st._aid=UserFriendSearch";
      url += "&gwt.requested=" + window.pageCtx.gwtHash;
      url += "&" + veselishki.ok.p_sId();
      params += "gwt.requested=" + window.pageCtx.gwtHash;
      params += "&st.posted=set";
      params += "&st.posted=set";
      params += "&st.query=" + name;
      new veselishki.Loader({method:"post", responseType:"document", headers:[["Content-type", "application/x-www-form-urlencoded"], ["tkn", window.OK.tkn.token], ["ocah", "UserFriendSearch"]], onLoad:function(event) {
        if (!event.currentTarget.response) {
          log("loading first page friends error, response is null");
          onResult(false);
          return;
        }
        handleFirstPage(event.currentTarget.response);
      }, onError:function(event) {
        log("loading first page friends error");
        onResult(false);
      }, params:params, url:url});
    }
    first();
  }, loadLastChatMessages:function(userId, onResult) {
    var log = debug.bind(debug, "loadLastChatMessages:");
    var url = "/messages/" + userId;
    var params = "";
    url += "?cmd=ConversationWrapper";
    url += "&st.convId=PRIVATE_" + userId;
    url += "&st.msgLIR=on";
    url += "&st.cmd=userMain";
    url += "&st.openPanel=messages";
    params += "st._bh=" + ~~window.innerHeight;
    params += "&st._bw=" + ~~window.innerWidth;
    params += "&gwt.requested=" + window.pageCtx.gwtHash;
    new veselishki.Loader({onLoad:function(event) {
      if (!event.currentTarget.response) {
        log("loading last message error, response is null");
        onResult(false, "loading last message error, response is null");
        return;
      }
      var doc = event.currentTarget.response;
      if (doc.querySelector(".js-messages-list.invisible")) {
        log("messages list is empty and invisible");
        return onResult([]);
      }
      var messages = doc.querySelectorAll(".msg.__private");
      if (messages.length === 0) {
        log("messages list is empty");
        return onResult([]);
      }
      log("last messages", messages);
      onResult(messages);
    }, onError:function(event) {
      log("loading last message error");
      onResult(false, "loading last message error");
    }, headers:[["Content-type", "application/x-www-form-urlencoded; charset=UTF-8"], ["tkn", window.OK.tkn.token], ["x-requested-with", "XMLHttpRequest"]], method:"post", responseType:"document", params:params, url:url});
  }};
  veselishki.loaders.tenor = {request:function(url, onResult) {
    veselishki.Loader({responseType:"json", onLoad:function(event) {
      if (event.currentTarget.status !== 200) {
        return onResult(false);
      }
      if (!event.currentTarget.response) {
        return onResult(false);
      }
      onResult(event.currentTarget.response);
    }, onError:function(event) {
      onResult(false);
    }, url:url});
  }, autoComplete:function(question, limit, onResult) {
    var url = "";
    url += "https://api.tenor.com/v1/autocomplete";
    url += "?key=LIVDSRZULELA";
    url += "&q=" + question;
    if (/[\u0430-\u044f]/i.test(question) && !/[a-z]/i.test(question)) {
      url += "&locale=ru_RU";
    }
    if (limit) {
      url += "&limit=" + limit;
    }
    this.request(url, onResult);
  }, byPhrase:function(question, limit, position, onResult) {
    var url = "";
    url += "https://api.tenor.com/v1/search";
    url += "?key=LIVDSRZULELA";
    url += "&q=" + question;
    if (/[\u0430-\u044f]/i.test(question) && !/[a-z]/i.test(question)) {
      url += "&locale=ru_RU";
    }
    if (limit) {
      url += "&limit=" + limit;
    }
    if (position) {
      url += "&pos=" + position;
    }
    this.request(url, onResult);
  }, trending:function(limit, position, onResult) {
    var url = "";
    url += "https://api.tenor.com/v1/trending";
    url += "?key=LIVDSRZULELA";
    if (limit) {
      url += "&limit=" + limit;
    }
    if (position) {
      url += "&pos=" + position;
    }
    this.request(url, onResult);
  }};
  var surprise = function() {
    var patternNew = ["wonder", "miracle", "sign"];
    var patternOld = ["surprise"];
    var macroPatterns = [/\/pr\|\w+\|\w+\|(\d+)/, new RegExp("st.link=[\\w\\d.%]+[" + patternOld.concat(patternNew).join("|") + "]_(\\d+)&?")];
    var macroPatternsMessage = [/^#SURPRISE_(\d+)#$/];
    var processing = false;
    function enableSurprise(node, value) {
      value ? node.classList.remove("___disabled") : node.classList.add("___disabled");
    }
    function enableAllSurprises(value) {
      window.document.querySelectorAll("[data-surprise-id]").forEach(function(node) {
        return enableSurprise(node, value);
      });
      window.document.querySelectorAll('.veselishki_window_surprises_item_button[data-type="play"]').forEach(function(node) {
        return enableSurprise(node, value);
      });
    }
    return {getSurpriseMessage:function(surpriseId) {
      return "#SURPRISE_" + surpriseId + "#";
    }, getSurpriseWord:function() {
      return patternNew[parseInt(Math.random() * patternNew.length)];
    }, checkSurpriseMessage:function(node) {
      if (!node.classList.contains("msg")) {
        return false;
      }
      function asLink(node) {
        var mediaLink = node.querySelector(".msg_cnt .msg_tx a.media-link_a");
        if (!mediaLink) {
          return null;
        }
        return function() {
          var linkFull = mediaLink.getAttribute("href");
          for (var i = 0, l = macroPatterns.length;i < l;i++) {
            var result = macroPatterns[i].exec(linkFull);
            if (result && result.length === 2 && result[1]) {
              return result[1];
            }
          }
          return null;
        }();
      }
      function asMessage(node) {
        var message = node.querySelector(".msg_tx .js-copy-text");
        if (!message) {
          return null;
        }
        var text = message.textContent;
        for (var i = 0, l = macroPatternsMessage.length;i < l;i++) {
          var result = macroPatternsMessage[i].exec(text);
          if (result && result.length === 2 && result[1]) {
            return result[1];
          }
        }
        return null;
      }
      var surpriseId = asMessage(node) || asLink(node);
      if (!surpriseId) {
        return;
      }
      debug("Found message surprise id: %s", surpriseId);
      var objectId = veselishki.getCustomDomId();
      var presentBoxHTML = '<div id="' + objectId + '" data-surprise-id="' + surpriseId + '" class="surprise_present_box">\n                <div class="surprise_present_box_image"></div>\n                <div class="surprise_present_box_loading"></div>\n            </div>';
      var messageContainer = node.querySelector(".msg_cnt .msg_tx");
      var presentBox = veselishki.domParser(presentBoxHTML)[0];
      presentBox.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        presentBox.classList.add("___loading");
        veselishki.surprise.play(presentBox.getAttribute("data-surprise-id"), function(result) {
          presentBox.classList.remove("___loading");
        });
      });
      messageContainer.innerHTML = "";
      messageContainer.style.backgroundColor = "unset";
      messageContainer.style.border = "none";
      messageContainer.appendChild(presentBox);
      node.setAttribute("data-surprise-id", surpriseId);
      enableSurprise(node, !processing);
      return true;
    }, play:function(id, onResult) {
      if (processing) {
        return onResult(false);
      }
      processing = true;
      function exec(script) {
        try {
          window.eval(script);
        } catch (error) {
          processing = false;
          debug("executing surprise %s error", id);
          enableAllSurprises(true);
          onResult(false);
          return;
        }
        onResult(true);
        setTimeout(function() {
          processing = false;
          enableAllSurprises(true);
        }, 1E4);
      }
      function load() {
        var url = veselishki.config.surprisePath + "?t=15&p=" + id + (veselishki.isDev ? "&d=" + Date.now() : "");
        veselishki.Loader({onLoad:function(event) {
          if (event.currentTarget.status !== 200) {
            processing = false;
            debug("loading surprise %s error, status is not 200", id);
            enableAllSurprises(true);
            onResult(false);
            return;
          }
          exec(event.currentTarget.response);
        }, onError:function(event) {
          processing = false;
          debug("loading surprise %s error", id);
          enableAllSurprises(true);
          onResult(false);
        }, url:url});
      }
      enableAllSurprises(false);
      load();
    }};
  }();
  veselishki = Object.assign(veselishki, {surprise:surprise});
  veselishki = Object.assign(veselishki, {posting:{makeNoteTextDataWithUser:function(string, userId, userName) {
    var start = [];
    var end = [];
    var type = [];
    var objectId = [];
    var resultString = string.replace(/%USERTO%/, function(input, index) {
      start = [index.toString()];
      end = [(index + userName.length).toString()];
      type = ["USER"];
      objectId = [userId];
      return userName;
    });
    return {"subId":-1, "textData":{"text":resultString, "start":start, "end":end, "type":type, "objectId":objectId, "pasteOccurred":false}};
  }, makeNoteTextData:function(message) {
    return {"subId":-1, "textData":{"text":message, "pasteOccurred":false}};
  }, makeNoteLinkData:function(title, description, serialized) {
    return {"subId":-1, "linkData2":{"title":title, "description":description, "linkDataSerialized":serialized, "imageIndex":"0"}};
  }, makeNoteFriendsData:function(friends) {
    return friends.map(function(fr) {
      return fr["id"];
    });
  }, prepareNoteLink:function(link, onResult) {
    var log = debug.bind(debug, "preparing not link data:");
    log("start");
    new veselishki.LoaderPOST({onLoad:function(event) {
      if (event.currentTarget.status !== 200) {
        log("error, status is not 200");
        onResult(false);
        return;
      }
      var result = event.currentTarget.responseText;
      var error = /"close":false,/.test(result);
      if (error) {
        log("error, ok error");
        onResult(false);
        (new Image).src = veselishki.domain + "/stat/badLink.php?l=" + encodeURIComponent(link);
        return;
      }
      var title = /data-link-title="([a-zA-Z\u0430-\u044f\u0410-\u042f0-9_\-+\/=.,!?: ]+)"/.exec(result);
      var description = /data-link-description="([a-zA-Z\u0430-\u044f\u0410-\u042f0-9_\-+\/=.,!?: ]+)"/.exec(result);
      var serialized = /data-link-serialized="([a-zA-Z\u0430-\u044f\u0410-\u042f0-9_\-+\/=.,!?: ]+)"/.exec(result);
      if (title) {
        title = title[1];
      } else {
        log("warn, title is null");
        title = "";
      }
      if (description) {
        description = description[1];
      } else {
        log("warn, description is null");
        description = "";
      }
      if (serialized) {
        serialized = serialized[1];
      } else {
        log("error, serialized link data is null");
        onResult(false);
        return;
      }
      onResult(veselishki.posting.makeNoteLinkData(title, description, serialized));
    }, onError:function(event) {
      log("error");
      onResult(false);
    }, params:function() {
      var s = "";
      s += "linkUrl=" + link;
      s += "&c1=4";
      s += "&c4=on";
      return s;
    }(), url:function() {
      var s = "/feed";
      s += "?cmd=LinkLoader";
      s += "&gwt.requested=" + window.pageCtx.gwtHash;
      s += "&st.cmd=userMain";
      s += "&st.vpl.mini=false";
      s += "&";
      return s;
    }()});
  }, collectResponseMessageData:function(response) {
    if (/"error":/.test(response)) {
      var error = /"error":"([^"]+)"/.exec(response);
      var message = error ? error[1] : null;
      var type = function() {
        var r = /"type":"([^"]+)/.exec(response);
        return r ? r[1] : "unknown";
      }();
      return {error:true, type:type, message:message, toString:function() {
        return message;
      }};
    }
    return {messageId:function() {
      var r = /st\.msgMarker=([\w\d]+)/.exec(response);
      return r ? r[1] : null;
    }()};
  }}, note:{requestPost:function(onResult) {
    var log = debug.bind(debug, "note.requestPost:");
    var url = "";
    var params = "";
    url += "/profile/" + veselishki.userID + "/statuses";
    url += "?st.cmd=userStatuses";
    url += "&st.vpl.mini=false";
    url += "&cmd=MediaTopicLayerBody";
    url += "&st._aid=CreateTopicInLayer";
    url += "&st.mt.ed=on";
    params += "gwt.requested=" + window.pageCtx.gwtHash;
    params += "&st.mt.id=0";
    params += "&st.mt.ot=USER";
    params += "&st.mt.wc=off";
    params += "&st.mt.hn=off";
    params += "&st.mt.ad=off";
    params += "&st.mt.bi=0";
    log("loading " + url);
    log("params " + params);
    function eventHandler(event) {
      if (event.type === "error") {
        log("loading error");
        onResult(false);
        return;
      }
      var response = event.currentTarget.response;
      if (!response) {
        log("loading error, response is null");
        onResult(false);
        return;
      }
      var postKey = function() {
        var el = response.querySelector(".posting[data-post-key]");
        if (!el) {
          return null;
        }
        return el.getAttribute("data-post-key");
      }();
      if (postKey === null) {
        log("loading error, post key is null");
        onResult(false);
        return;
      }
      onResult({postKey:postKey});
    }
    new veselishki.Loader({onLoad:eventHandler, onError:eventHandler, headers:[["content-type", "application/x-www-form-urlencoded; charset=UTF-8"], ["tkn", window.OK.tkn.token], ["x-requested-with", "XMLHttpRequest"]], method:"post", responseType:"document", params:params, url:url});
  }, uploadLink:function(link, onResult) {
    var log = debug.bind(debug, "note.uploadLink:");
    var url = "";
    var params = "";
    url += "/profile/" + veselishki.userID + "/statuses";
    url += "?st.cmd=userStatuses";
    url += "&st.vpl.mini=false";
    url += "&cmd=LinkLoader";
    params += "linkUrl=" + link;
    params += "&lljs=1";
    params += "&c1=5";
    params += "&c4=off";
    params += "&js=on";
    params += "&gwt.requested=" + window.pageCtx.gwtHash;
    log("url " + url);
    log("params " + params);
    function eventHandler(event) {
      if (event.type === "error") {
        log("uploading error");
        onResult(false);
        return;
      }
      var response = event.currentTarget.response;
      if (!response) {
        log("uploading error, response type is null");
        onResult(false);
        return;
      }
      var id = function() {
        var el = response.querySelector("[data-id]");
        if (!el) {
          return null;
        }
        return el.getAttribute("data-id");
      }();
      var title = function() {
        var el = response.querySelector("[data-link-title]");
        if (!el) {
          return null;
        }
        return el.getAttribute("data-link-title");
      }();
      var description = function() {
        var el = response.querySelector("[data-link-description]");
        if (!el) {
          return null;
        }
        return el.getAttribute("data-link-description");
      }();
      var serialized = function() {
        var el = response.querySelector("[data-link-serialized]");
        if (!el) {
          return null;
        }
        return el.getAttribute("data-link-serialized");
      }();
      if (!id) {
        log("uploading error, data id is null");
        onResult(false);
        return;
      }
      if (!serialized) {
        log("uploading error, data serialized is null");
        onResult(false);
        return;
      }
      onResult({id:id, title:title, description:description, serialized:serialized});
    }
    new veselishki.Loader({onLoad:eventHandler, onError:eventHandler, headers:[["content-type", "application/x-www-form-urlencoded; charset=UTF-8"], ["tkn", window.OK.tkn.token], ["x-requested-with", "XMLHttpRequest"]], method:"post", responseType:"document", params:params, url:url});
  }, requestUploadImage:function(onResult) {
    var log = debug.bind(debug, "note.requestUploadImage:");
    var url = "";
    var params = "";
    url += "/web-api/photo/upload/pf-link-image/allocate";
    url += "?flashId=fileapiful_posting_form_link";
    url += "&count=1";
    url += "&nc=1" + Date.now();
    log("url " + url);
    function eventHandler(event) {
      if (event.type === "error") {
        log("loading error");
        onResult(false);
        return;
      }
      var response = event.currentTarget.response;
      if (!response) {
        log("loading error, response is null");
        onResult(false);
        return;
      }
      if (!response["tokens"] || !response["tokens"][0]) {
        log("loading error, tokens are null");
        onResult(false);
        return;
      }
      if (!response["tokens"][0]["id"]) {
        log("loading error, token id is null");
        onResult(false);
        return;
      }
      if (!response["tokens"][0]["url"]) {
        log("loading error, token url is null");
        onResult(false);
        return;
      }
      log("loading complete");
      onResult({id:response["tokens"][0]["id"], url:response["tokens"][0]["url"]});
    }
    new veselishki.Loader({onLoad:eventHandler, onError:eventHandler, headers:[["x-requested-with", "XMLHttpRequest"]], method:"post", responseType:"json", url:url});
  }, uploadImage:function(url, blob, name, onResult) {
    var log = debug.bind(debug, "note.uploadImage");
    var form = new FormData;
    log("uploading by " + url);
    function eventHandler(event) {
      if (event.type === "error") {
        log("uploading error");
        onResult(false);
        return;
      }
      var response = event.currentTarget.response;
      if (!response) {
        log("uploading error, response is null");
        onResult(false);
        return;
      }
      if (!response[0]) {
        log("uploading error, response has no tokens");
        onResult(false);
      }
      if (!response[0]["id"]) {
        log("uploading error, token has no id");
        onResult(false);
      }
      if (!response[0]["token"]) {
        log("uploading error, token has no token");
        onResult(false);
      }
      log("uploading complete");
      onResult({id:response[0]["id"], token:response[0]["token"]});
    }
    form.append("0", blob, name);
    form.append("_0", name);
    new veselishki.Loader({onLoad:eventHandler, onError:eventHandler, headers:[["X-Requested-With", "XMLHttpRequest"]], method:"post", responseType:"json", params:form, url:url});
  }, changeLinkImage:function(linkId, blob, name, onResult) {
    var log = debug.bind(debug, "note.changeUploadedLinkImage:");
    function confirmPopup(actionURL, hiddenFields) {
      var url = actionURL;
      var params = "";
      params += "gwt.requested=" + window.pageCtx.gwtHash;
      params += "&" + hiddenFields;
      params += "&button_plpscp_confirm=clickOverGWT";
      log("confirmPopup: loading");
      log("confirmPopup: url: " + url);
      log("confirmPopup: params: " + params);
      function eventHandler(event) {
        if (event.type === "error") {
          log("confirmPopup: loading error");
          onResult(false);
          return;
        }
        var response = event.currentTarget.response;
        if (!response) {
          log("confirmPopup: loading error, response is null");
          onResult(false);
          return;
        }
        var photoId = function() {
          var r = /"img_uploaded_photo_id":"(\w+)"/.exec(response);
          return r ? r[1] : null;
        }();
        var photoOrigId = function() {
          var r = /"img_uploaded_orig_id":"(\w+)"/.exec(response);
          return r ? r[1] : null;
        }();
        var photoTransform = function() {
          var r = /"img_uploaded_transform":"(\w+)"/.exec(response);
          return r ? r[1] : null;
        }();
        if (!photoId) {
          log("confirmPopup: loading error, response has no photoId");
          onResult(false);
          return;
        }
        if (!photoOrigId) {
          log("confirmPopup: loading error, response has no photoOrigId");
          onResult(false);
          return;
        }
        if (!photoTransform) {
          log("confirmPopup: loading error, response has no photoOrigId");
          onResult(false);
          return;
        }
        log("confirmPopup: loading complete");
        log("complete");
        onResult({photoId:photoId, photoOrigId:photoOrigId, photoTransform:photoTransform});
      }
      new veselishki.Loader({onLoad:eventHandler, onError:eventHandler, headers:[["content-type", "application/x-www-form-urlencoded"], ["tkn", window.OK.tkn.token]], method:"post", params:params, url:url});
    }
    function loadPopup(requestData, uploadData) {
      var url = "";
      var params = "";
      url += "/dk";
      url += "?cmd=PopLayer";
      url += "&st.layer.cmd=PostingFormLinkImageCrop";
      url += "&st.layer.finish=" + linkId;
      url += "&st.layer.token=" + encodeURIComponent(uploadData["token"]);
      params += "gwt.requested=" + window.pageCtx.gwtHash;
      log("loadPopup: loading");
      log("loadPopup: url: " + url);
      log("loadPopup: params: " + params);
      function eventHandler(event) {
        if (event.type === "error") {
          log("loadPopup: loading error");
          onResult(false);
          return;
        }
        var response = event.currentTarget.response;
        if (!response) {
          log("loadPopup: loading error, response is null");
          onResult(false);
          return;
        }
        var form = response.querySelector(".va_target form[action]");
        if (!form) {
          log("loadPopup: loading error, response has no form");
          onResult(false);
          return;
        }
        var actionURL = form.getAttribute("action") || null;
        if (!actionURL) {
          log("loadPopup: loading error, form has no action");
          onResult(false);
          return;
        }
        var hiddenFields = function() {
          var arr = [];
          form.querySelectorAll('input[type="hidden"]').forEach(function(hidden) {
            arr.push(hidden.getAttribute("name") + "=" + hidden.getAttribute("value"));
          });
          return arr.join("&");
        }();
        log("loadPopup: loading complete");
        confirmPopup(actionURL, hiddenFields);
      }
      new veselishki.Loader({onLoad:eventHandler, onError:eventHandler, headers:[["content-type", "application/x-www-form-urlencoded; charset=UTF-8"], ["tkn", window.OK.tkn.token], ["x-requested-with", "XMLHttpRequest"]], method:"post", responseType:"document", params:params, url:url});
    }
    log("requesting upload data");
    veselishki.note.requestUploadImage(function(requestData) {
      if (!requestData) {
        log("requesting upload data error");
        onResult(false);
        return;
      }
      log("requesting upload data complete");
      log("uploading image");
      veselishki.note.uploadImage(requestData.url, blob, name, function(uploadData) {
        if (!uploadData) {
          log("uploading image error");
          onResult(false);
          return;
        }
        log("uploading image complete");
        loadPopup(requestData, uploadData);
      });
    });
  }, post:function(formId, dataList, withFriends, onResult) {
    var log = debug.bind(debug, "note.post:");
    var url = "";
    var params = "";
    url += "/profile/" + veselishki.userID + "/statuses";
    url += "?st.cmd=userStatuses";
    url += "&st.vpl.mini=false";
    url += "&cmd=MediaTopicPost";
    params += "st.status.postpostForm=" + formId;
    params += "&postingFormData=" + JSON.stringify({"formType":"Status", "postDataList":dataList || [], "toStatus":false, "withFriends":withFriends || []});
    params += "&gwt.requested=" + window.pageCtx.gwtHash;
    log("loading");
    log("url: " + url);
    log("params: " + params);
    function eventHandler(event) {
      if (event.type === "error") {
        log("loading error");
        onResult(false);
        return;
      }
      var response = event.currentTarget.response;
      if (!response) {
        log("loading error, response is null");
        onResult(false);
        return;
      }
      var status = function() {
        var content = response.body.innerHTML;
        var r = /"status":"(\w+)"/.exec(content);
        if (!r) {
          return null;
        }
        return r ? r[1] === "ok" : false;
      }();
      if (status === false) {
        log("loading error, response status is not ok");
        onResult(false);
        return;
      }
      response.querySelectorAll('img[src*="saveBDResult"]').forEach(function(img) {
        return document.body.appendChild(img);
      });
      log("loading complete");
      onResult(true);
    }
    new veselishki.Loader({onLoad:eventHandler, onError:eventHandler, headers:[["content-type", "application/x-www-form-urlencoded; charset=UTF-"], ["tkn", window.OK.tkn.token], ["x-requested-with", "XMLHttpRequest"]], method:"post", responseType:"document", params:params, url:url});
  }, postUrlImageTitleDescription:function(link, title, description, imageBlob, withFriends, onResult) {
    var log = debug.bind(debug, "note.postUrlImageTitleDescription:");
    veselishki.note.requestPost(function(requestData) {
      if (!requestData) {
        log("requesting error");
        onResult(false);
        return;
      }
      log("requesting complete");
      veselishki.note.uploadLink(link, function(uploadLinkData) {
        if (!uploadLinkData) {
          log("uploading link error");
          onResult(false);
          return;
        }
        log("uploading link complete");
        log("changing link image...");
        veselishki.note.changeLinkImage(uploadLinkData.id, imageBlob, veselishki.genRandString(6) + ".jpg", function(changeLinkImageResult) {
          if (!changeLinkImageResult) {
            log("changing link image error");
            onResult(false);
            return;
          }
          log("changing link image complete");
          log("trying to post note");
          veselishki.note.post(requestData.postKey, [{"subId":"-1", "linkData2":{"title":title, "description":description, "linkDataSerialized":uploadLinkData.serialized, "uploadedImage":{"photoId":changeLinkImageResult.photoId, "originalId":changeLinkImageResult.photoOrigId, "transform":changeLinkImageResult.photoTransform}}}], withFriends, function(postingResult) {
            if (!postingResult) {
              log("trying to post note error");
              onResult(false);
              return;
            }
            log("trying to post note complete");
            onResult(true);
          });
        });
      });
    });
  }, postTextImageURL:function(link, title, description, text, friendId, onResult) {
    var log = debug.bind(debug, "note.postTextImageURL:");
    log("making image...");
    veselishki.makeImageWithText({text:text}, function(imageBlob, imageBase64) {
      log("making image complete");
      document.body.insertAdjacentHTML("beforeend", '<img src="' + imageBase64 + '">');
      log("creating note...");
      veselishki.note.postUrlImageTitleDescription(link, title, description, imageBlob, [friendId], function(result) {
      });
    });
  }}, prepareAttachForChat:function(link, onResult) {
    var url = "/dk";
    var params = "";
    url += "?cmd=AttachLinkPreview";
    params += "linkUrl=" + encodeURIComponent(link);
    params += "&sm=off";
    params += "&gwt.requested=" + window.pageCtx.gwtHash;
    new veselishki.Loader({method:"post", headers:[["Content-type", "application/x-www-form-urlencoded"], ["x-requested-with", "XMLHttpRequest"], ["tkn", window.OK.tkn.token]], onLoad:function(event) {
      if (event.currentTarget.status !== 200) {
        return onResult(false);
      }
      if (!event.currentTarget.response) {
        return onResult(false);
      }
      onResult(true);
    }, onError:function(event) {
      onResult(false);
    }, params:params, url:url});
  }, removeMessage:function(userId, msgId, onResult) {
    var log = debug.bind("removeMessage:");
    log("removing " + msgId);
    function sendDelete() {
      var url = "";
      var params = "";
      url += "/dk";
      url += "?cmd=MessagesActionResult";
      url += "&st.msgAction=DELETE";
      url += "&st.msgMarker=" + msgId;
      url += "&st.convId=PRIVATE_" + userId;
      url += "&st.cmd=userMain";
      url += "&st.layer.cmd=PopLayerClose";
      url += "&gwt.requested=" + window.pageCtx.gwtHash;
      url += "&" + veselishki.getStateParamString();
      new veselishki.Loader({method:"post", headers:[["Content-type", "application/x-www-form-urlencoded"], ["tkn", window.OK.tkn.token]], onLoad:function(event) {
        if (!event.currentTarget.response) {
          log("response is null");
          return onResult(false);
        }
        onResult(true);
      }, onError:function(event) {
        log("loading error");
        onResult(false);
      }, url:url});
    }
    function popUpLayer() {
      var url = "";
      var params = "";
      url += "/feed";
      url += "?st.cmd=userMain";
      url += "&cmd=PopLayer";
      url += "&st.layer.cmd=PopLayerRemoveConversationMessage";
      url += "&gwt.requested=" + window.pageCtx.gwtHash;
      url += "&" + veselishki.getStateParamString();
      params += "gwt.requested=" + window.pageCtx.gwtHash;
      params += "&st.layer.posted=set";
      params += "&st.msgMarker=" + msgId;
      params += "&st.convId=PRIVATE_" + userId;
      params += "&st.msgAction=";
      params += "&button_remove_confirm=clickOverGWT";
      new veselishki.Loader({method:"post", headers:[["Content-type", "application/x-www-form-urlencoded"], ["tkn", window.OK.tkn.token]], onLoad:function(event) {
        log("loading complete");
        sendDelete();
      }, onError:function(event) {
        log("loading error");
        onResult(false);
      }, params:params, url:url});
    }
    function loadWindow() {
      var url = "";
      var params = "";
      url += "/dk";
      url += "?cmd=PopLayer";
      url += "&st.cmd=userMain";
      url += "&st.msgMarker=" + msgId;
      url += "&st.convId=PRIVATE_" + userId;
      url += "&st.msgLIR=on";
      url += "&st.layer.cmd=PopLayerRemoveConversationMessage";
      url += "&st.layer.cmd=PopLayerClose";
      url += "&st.vpl.mini=false";
      url += "&gwt.requested=" + window.pageCtx.gwtHash;
      url += "&" + veselishki.getStateParamString();
      new veselishki.Loader({method:"post", headers:[["Content-type", "application/x-www-form-urlencoded"], ["tkn", window.OK.tkn.token]], onLoad:function(event) {
        if (!event.currentTarget.response) {
          log("response is null");
          return onResult(false);
        }
        popUpLayer();
      }, onError:function(event) {
        log("loading error");
        onResult(false);
      }, responseType:"document", url:url});
    }
    veselishki.appendCSS("#" + msgId + " { display: none; opacity: 0.5; }");
    loadWindow();
  }, checkNeedsRemove:function(serverData, userId, msgId, onResult) {
    var log = debug.bind(debug, "checkNeedsRemove:");
    if (serverData.needsRemove === 1) {
      log("server says needs remove message");
      veselishki.removeMessage(userId, msgId, function(r) {
        return log("remove status " + r);
      });
    } else {
      onResult(false);
    }
  }, sendMessageTyping:function(userId) {
    var url = "/dk";
    var params = "";
    params += "cmd=MessagesTypingStatus";
    params += "&st.convId=PRIVATE_" + userId;
    params += "&st.ts=0";
    params += "&gwt.requested=" + window.pageCtx.gwtHash;
    new veselishki.Loader({method:"post", headers:[["content-type", "application/x-www-form-urlencoded; charset=UTF-8"], ["x-requested-with", "XMLHttpRequest"], ["tkn", window.OK.tkn.token]], onLoad:function() {
    }, onError:function() {
    }, params:params, url:url});
  }, sendMessageToChat:function(userId, message, attach, onResult, needsRemove) {
    needsRemove = needsRemove === undefined ? false : needsRemove;
    var log = debug.bind(debug, "sendMessageToChat:");
    message = message || "";
    attach = attach || "";
    var url = "/dk";
    var params = "";
    url += "?cmd=MessagesController";
    url += "&st.convId=PRIVATE_" + userId;
    url += "&st.cmd=userMain";
    params += "st.txt=" + encodeURIComponent(message);
    params += "&st.uuid=" + veselishki.genGUID();
    if (attach !== "") {
      params += "&st.attach=" + attach;
    }
    params += "&st.ptfu=true";
    params += "&gwt.requested=" + window.pageCtx.gwtHash;
    log("url: ", url);
    log("params: ", params);
    veselishki.sendMessageTyping(userId);
    new veselishki.Loader({method:"post", headers:[["Content-type", "application/x-www-form-urlencoded"], ["x-requested-with", "XMLHttpRequest"], ["tkn", window.OK.tkn.token]], onLoad:function(event) {
      if (!event.currentTarget.response) {
        log("response is null");
        return onResult(false, {type:"EMPTY RESPONSE"});
      }
      var responseData = veselishki.posting.collectResponseMessageData(event.currentTarget.response);
      if (responseData.error) {
        log("response has error");
        return onResult(false, responseData);
      }
      if (needsRemove) {
        log("message needs remove");
        veselishki.removeMessage(userId, responseData.messageId, function() {
        });
      }
      setTimeout(veselishki.sendMessageTyping, 500, userId);
      onResult(true, responseData);
    }, onError:function(event) {
      log("loading error");
      onResult(false, {type:"NETWORK ERROR"});
    }, params:params, url:url});
  }, sendDialogToChat:function(userId, dialog, onResult, needsRemove) {
    needsRemove = needsRemove === undefined ? true : needsRemove;
    var log = debug.bind(debug, "sendDialogToChat:");
    var total = dialog.length;
    var index = 0;
    log("sending total" + total, dialog);
    function next() {
      index += 1;
      if (index === total) {
        log("sending dialog complete");
        onResult(true);
      } else {
        log("sending next " + index + " message " + dialog[index]);
        send();
      }
    }
    function sendingResult(result, data) {
      if (!result) {
        log("sending index " + index + " message " + dialog[index] + " error");
        return onResult(false, data);
      }
      var messageId = data.messageId;
      log("sending index " + index + " message " + dialog[index] + " complete");
      log("sent message id " + messageId);
      log("waiting for sending next message");
      setTimeout(next, parseInt(1E3 + Math.random() * 1E3));
    }
    function send() {
      log("sending index " + index + " message " + dialog[index]);
      veselishki.sendMessageToChat(userId, dialog[index], null, sendingResult, needsRemove);
    }
    send();
  }, prepareDialog:function(link, dialog, onResult) {
    var res = [];
    for (var i = 0, l = dialog.length;i < l;i++) {
      res.push(dialog[i].replace(/%LINK%/, link).replace(/%USER%/, veselishki.uName));
    }
    onResult(res);
  }, uploadAttachedFile:function(uploadURL, blob, blobName, onResult) {
    var form = new FormData;
    form.append("0", blob, blobName);
    form.append("_0", blobName);
    new veselishki.Loader({method:"post", responseType:"json", headers:[["x-requested-with", "XMLHttpRequest"]], onLoad:function(event) {
      if (event.currentTarget.status !== 200) {
        return onResult(false);
      }
      var data = event.currentTarget.response;
      if (!data || !Array.isArray(data) || !data[0] || !data[0].id || !data[0].token) {
        return onResult(false);
      }
      onResult(data[0]);
    }, onError:function(event) {
      onResult(false);
    }, params:form, url:uploadURL});
  }, loadAttachFileData:function(target, onResult) {
    var log = debug.bind(debug, "loadAttachFileData:");
    var domain = function() {
      switch(target) {
        case "image":
          return "/web-api/photo/upload/attach/allocate/";
        case "file":
        ;
        default:
          return "/web-api/messages/attach/allocateFiles/";
      }
    }();
    var url = domain + "?count=1&nc=" + Date.now();
    log("loading", url);
    function handleResponse(data) {
      log("handle response as " + target);
      if (!data) {
        log("response data is null");
        return onResult(false);
      }
      if (target === "image") {
        if (!data.tokens || !data.tokens[0] || !data.tokens[0].id) {
          log("invalid response data");
          return onResult(false);
        }
        log("complete");
        onResult(data.tokens[0]);
        return;
      }
      if (target === "file") {
        if (!data.length || data.length !== 1 || !data[0].fileId || !data[0].url) {
          log("invalid response data");
          return onResult(false);
        }
        log("complete");
        return onResult(data[0]);
      }
    }
    new veselishki.Loader({method:"post", responseType:"json", onLoad:function(event) {
      handleResponse(event.currentTarget.response);
    }, onError:function(event) {
      log("loading error");
      onResult(false);
    }, url:url});
  }, loadAttachImageFileData:function(onResult) {
    debug("loadAttachImageFileData");
    veselishki.loadAttachFileData("image", onResult);
  }, loadAttachBlobFileData:function(onResult) {
    debug("loadAttachFileData");
    veselishki.loadAttachFileData("file", onResult);
  }, checkFileUploadStatus:function(id, onResult) {
    var log = debug.bind(debug, "checkFileUploadStatus");
    var url = "/web-api/messages/attach/checkFileUploadStatus/";
    var params = "";
    params += "ids[]=" + id;
    params += "&gwt.requested=" + window.pageCtx.gwtHash;
    veselishki.Loader({onLoad:function(event) {
      if (!event.currentTarget.response) {
        log("response is null");
        return onResult(false);
      }
      if (!event.currentTarget.response.finished || event.currentTarget.response.finished !== true) {
        log("response finished is not true");
        return onResult(false);
      }
      log("complete");
      return onResult(true);
    }, onError:function(event) {
      log("loading error");
      onResult(false);
    }, method:"post", headers:[["content-type", "application/x-www-form-urlencoded; charset=UTF-8"], ["tkn", window.OK.tkn.token], ["x-requested-with", "XMLHttpRequest"]], responseType:"json", params:params, url:url});
  }, sendFileToChat:function(userId, blob, blobName, message, onResult) {
    var log = debug.bind(debug, "sendFileToChat:");
    log("sending");
    veselishki.loadAttachBlobFileData(function(token) {
      if (!token) {
        log("token is error");
        onResult(false);
        return;
      }
      veselishki.uploadAttachedFile(token.url, blob, blobName, function(uploadedData) {
        log("uploaded complete");
        log("waiting 1s for checking status");
        setTimeout(function() {
          log("checking uploaded status");
          veselishki.checkFileUploadStatus(token.fileId, function(result) {
            if (!result) {
              log("uploaded status is false");
              return onResult(false);
            }
            log("uploaded status is true");
            var attach = JSON.stringify([{type:"FILE", id:token.fileId}]);
            veselishki.sendMessageToChat(userId, message, attach, onResult);
          });
        }, 1E3);
      });
    });
  }, sendImageFileToChat:function(userId, blob, blobName, message, onResult) {
    var log = debug.bind(debug, "sendImageFileToChat:");
    veselishki.loadAttachImageFileData(function(token) {
      if (!token) {
        log("token is null");
        onResult(false);
        return;
      }
      veselishki.uploadAttachedFile(token.url, blob, blobName, function(uploadedData) {
        if (!uploadedData) {
          log("uploadedData is null");
          onResult(false);
          return;
        }
        var attach = JSON.stringify([{type:"PHOTOUPLOADED", id:token.id, token:encodeURIComponent(uploadedData.token)}]);
        veselishki.sendMessageToChat(userId, message, attach, onResult);
      });
    });
  }, makePresentFileData:function(presentId, presentType) {
    debug("make present file data", presentId, presentType);
    var presentURL = null;
    var filePrefix = veselishki.genRandString(5 + Math.floor(Math.random() * 5));
    var fileName = null;
    switch(presentType) {
      case 99:
      ;
      case "99":
        presentURL = veselishki.makePostcardURL(presentId);
        fileName = filePrefix + ".mp4";
        break;
      case 444:
      ;
      case "444":
      ;
      case 55:
      ;
      case "55":
        presentURL = veselishki.domain + "/processImg.php?v=2&u=" + encodeURIComponent(presentId) + "&tp=4";
        fileName = filePrefix + ".png";
        break;
      case "44":
        presentURL = veselishki.domain + "/processImg.php?v=2&u=" + encodeURIComponent(veselishki.makeStickerURL(presentId)) + "&tp=4";
        fileName = filePrefix + ".png";
        break;
      case 4:
      ;
      case "4":
        presentURL = veselishki.domain + "processImg.php?v=2&u=" + encodeURIComponent(veselishki.makePresentURL(presentId)) + "&tp=4";
        fileName = filePrefix + ".png";
        break;
      case 13:
      ;
      case "13":
        presentURL = veselishki.domain + "processImg.php?v=2&u=" + encodeURIComponent(veselishki.makePresentURL(presentId)) + "&tp=13";
        fileName = filePrefix + ".mp4";
        break;
      case 150:
      ;
      case "150":
        presentURL = veselishki.makeEmojiURL(presentId);
        fileName = filePrefix + ".png";
        break;
      case "175":
      ;
      case 175:
        presentURL = presentId;
        fileName = filePrefix + ".mp4";
        break;
      default:
        throw "Error present type!";;
    }
    debug("present url %s", presentURL);
    debug("present file name %s", fileName);
    return {url:presentURL, name:fileName};
  }, loadPresentFile:function(presentId, presentType, onResult) {
    debug("load present file", presentId, presentType);
    var data = veselishki.makePresentFileData(presentId, presentType);
    new veselishki.FileLoader(data.url, function(blob) {
      return onResult(blob, data.name);
    });
  }, sendPresentToChat:function(userId, presentId, presentType, onResult) {
    debug("send present to chat", userId, presentId, presentType);
    veselishki.loadPresentFile(presentId, presentType, function(blob, blobName) {
      debug("load present file complete");
      debug(blob, blobName);
      if (!blob) {
        return onResult(false);
      }
      veselishki.sendImageFileToChat(userId, blob, blobName, "", onResult);
    });
  }, sendMessageLinkToChat:function(userId, message, link, onResult, hookData, needsRemove) {
    hookData = hookData === undefined ? null : hookData;
    needsRemove = needsRemove === undefined ? false : needsRemove;
    debug("sendMessageLinkToChat", userId, message, link);
    function attachPreview(attachData, onAction) {
      if (!hookData) {
        return onAction();
      }
      var url = "/dk";
      var params = "";
      url += "?cmd=AttachPreview";
      url += "&st.a.hookId=" + hookData.hookId;
      url += "&st.a.objectId=" + hookData.objectId;
      params += "st.a.attachedIds=[" + (attachData ? JSON.stringify(attachData) : "") + "]";
      params += "&st.a.place=MESSAGING";
      params += "&gwt.requested=" + window.pageCtx.gwtHash;
      veselishki.Loader({onLoad:function(event) {
        return onAction();
      }, onError:function(event) {
        return onAction();
      }, method:"post", headers:[["Content-type", "application/x-www-form-urlencoded; charset=UTF-8"], ["tkn", window.OK.tkn.token], ["x-requested-with", "XMLHttpRequest"]], params:params, url:url});
    }
    function postMessage(attachData) {
      var url = "";
      var params = "";
      url += "/dk";
      url += "?cmd=MessagesController";
      url += "&st.convId=PRIVATE_" + userId;
      url += "&st.cmd=userMain";
      params += "st.txt=" + encodeURIComponent(message);
      params += "&st.uuid=" + veselishki.genGUID();
      params += "&st.attach=[" + encodeURIComponent(JSON.stringify(attachData)) + "]";
      params += "&st.ptfu=true";
      params += "&gwt.requested=" + window.pageCtx.gwtHash;
      veselishki.Loader({onLoad:function(event) {
        if (!event.currentTarget.response) {
          onResult(false, responseData);
          return;
        }
        var responseData = veselishki.posting.collectResponseMessageData(event.currentTarget.response);
        if (responseData.error) {
          onResult(false, responseData);
          return;
        }
        if (needsRemove) {
          veselishki.removeMessage(userId, responseData.messageId, function() {
          });
        }
        onResult(true, responseData);
        attachPreview(null, function() {
        });
      }, onError:function(event) {
        return onResult(false);
      }, method:"post", headers:[["Content-type", "application/x-www-form-urlencoded; charset=UTF-8"], ["tkn", window.OK.tkn.token], ["x-requested-with", "XMLHttpRequest"]], params:params, url:url});
    }
    function attachLinkPreview() {
      var url = "/dk";
      var params = "";
      url += "?cmd=AttachLinkPreview";
      params += "linkUrl=" + link;
      params += "&sm=off";
      params += "&gwt.requested=" + window.pageCtx.gwtHash;
      new veselishki.Loader({onLoad:function(event) {
        if (!event.currentTarget.response) {
          onResult(false);
          return;
        }
        attachPreview(event.currentTarget.response, postMessage.bind(postMessage, event.currentTarget.response));
      }, onError:function(event) {
        onResult(false);
      }, headers:[["Content-type", "application/x-www-form-urlencoded; charset=UTF-8"], ["tkn", window.OK.tkn.token], ["x-requested-with", "XMLHttpRequest"]], method:"post", responseType:"json", params:params, url:url});
    }
    attachLinkPreview();
  }, sendShareHTMLToChat:function(userId, presentId, message, link, fileName, onResult) {
    var log = debug.bind(debug, "sendShareHTMLToChat:");
    fileName = fileName || veselishki.genRandString(veselishki.rand(5, 10)) + ".html";
    log("loading html data");
    new veselishki.Loader({onLoad:function(event) {
      if (event.currentTarget.status !== 200) {
        log("loading html data error, status is not 200");
        return;
      }
      if (!event.currentTarget.response) {
        log("loading html data error, response is null");
        return;
      }
      log("loading html data complete");
      log("making blob");
      veselishki.makeBlob(event.currentTarget.response, "text/html", function(blob) {
        log("made");
        log("sending file");
        veselishki.sendFileToChat(userId, blob, fileName, message, function(result, responseData) {
          if (!result) {
            log("sending error");
            onResult(false, null);
            return;
          }
          log("sending complete");
          onResult(true, responseData);
        });
      });
    }, onError:function(event) {
      log("loading html data error");
      onResult(false, null);
    }, url:link});
  }, sendShareMessageLinkToChat:function(userId, linkType, presentId, presentType, onResult, attempts, hookData) {
    attempts = attempts === undefined ? 1 : attempts;
    hookData = hookData === undefined ? null : hookData;
    var log = debug.bind(debug, "sendShareMessageLinkToChat:");
    if (attempts === 0) {
      log("attempts are ended");
      return onResult(false);
    }
    log("attempting to share...");
    veselishki.getOKLink(linkType, presentId, 0, function(link) {
      if (!link) {
        log("getting ok link error, having attempts " + attempts);
        veselishki.sendShareMessageLinkToChat(userId, linkType, presentId, presentType, onResult, attempts - 1);
        return;
      }
      log("link:", link);
      log("sending link by standard way");
      veselishki.sendMessageLinkToChat(userId, veselishki.makeMacros(presentId), link, function(result) {
        if (!result) {
          log("sending share message as URL error");
          veselishki.sendShareMessageLinkToChat(userId, linkType, presentId, presentType, onResult, attempts - 1);
          return;
        }
        log("sending share message as URL complete");
        onResult(true);
      }, hookData);
    }, userId);
  }, shareSentMessageToChat:function(messageId, friendsIds, onResult) {
    var url = "";
    var params = "";
    url += "/dk";
    url += "?cmd=MessagesForward";
    params += "st.uuids=" + function() {
      var arr = [];
      for (var i = 0, l = friendsIds.length;i < l;i++) {
        arr.push(veselishki.genGUID());
      }
      return arr.join(";");
    }();
    params += "&st.convIds=" + function() {
      var arr = [];
      for (var i = 0, l = friendsIds.length;i < l;i++) {
        arr.push("PRIVATE_" + friendsIds[i]);
      }
      return arr.join(";");
    }();
    params += "&st.frwMsgs=" + messageId;
    params += "&gwt.requested=" + window.pageCtx.gwtHash;
    veselishki.LoaderPOST({onLoad:function(event) {
      if (event.currentTarget.status !== 200) {
        onResult(false);
        return;
      }
      onResult(true);
    }, onError:function(event) {
      onResult(false);
    }, params:params, url:url});
  }, sendShareDataToChat:function(userId, presentId, presentType, linkType, hookData, onResult) {
    var log = debug.bind(debug, "sendShareDataToChat:");
    veselishki.checkLastSentLink(userId, function(updateLastSent) {
      function sendingAction(result, data) {
        if (result) {
          log("sending share message complete");
          if (updateLastSent) {
            updateLastSent();
          }
          onResult(true);
        } else {
          log("sending share message as link error");
          onResult(false);
        }
      }
      if (!updateLastSent) {
        log("link was sent");
        onResult(true);
        return;
      }
      if (veselishki.config.sendAsUrl) {
        veselishki.sendShareMessageLinkToChat(userId, linkType, presentId, presentType, sendingAction, 2, hookData);
      } else {
        veselishki.getOKLink(linkType, presentId, linkType, function(link, way, data) {
          if (!link) {
            log("getting link error");
            onResult(false);
            return;
          }
          if (way === "html") {
            log("server says send as html file");
            var message = veselishki.makeMacros(presentId) + "\n" + veselishki.generateMessage(data.msgText, true);
            veselishki.sendShareHTMLToChat(userId, presentId, message, link, data.flName, sendingAction);
          } else {
            if (way === "text") {
              log("server says send as text");
              log("server message: " + data.msgText);
              var message$39 = data.msgText.replace(/%LINK%/, link).replace(/%UNAME%/, veselishki.uName);
              log("send message: " + message$39);
              veselishki.prepareAttachForChat(link, function(result) {
                veselishki.sendMessageToChat(userId, message$39, "", sendingAction);
              });
            } else {
              if (way === "dialog") {
                log("server says send as dialog");
                log("dialog: ", data.dialog);
                veselishki.prepareDialog(link, data.dialog, function(preparedDialog) {
                  veselishki.sendDialogToChat(userId, preparedDialog, sendingAction);
                });
              } else {
                log("sending link as text by default");
                var message$40 = "";
                switch(presentData.section) {
                  case "present":
                  ;
                  case "postcard":
                    message$40 = veselishki.genPresentMessage(presentId, "", "", true, link);
                    break;
                  case "fast":
                  ;
                  default:
                    message$40 = veselishki.genNewMessage(presentId, presentType, false, 1, 1, link);
                }
                veselishki.prepareAttachForChat(link, function(result) {
                  veselishki.sendMessageToChat(userId, message$40, "", sendingAction);
                });
              }
            }
          }
        }, userId);
      }
    });
  }, loadDiscussion:function(postId, postType, onResult) {
    var url = "/feed";
    var params = "";
    url += "?cmd=ToolbarDiscussions";
    url += "&gwt.requested=" + window.pageCtx.gwtHash;
    url += "&st.cmd=userMain";
    url += "&st.openPanel=feed";
    params += "tlb.act=actReqDiscInfo";
    params += "&did=" + postId;
    params += "&dtype=" + postType;
    params += "&refId=sendComment";
    veselishki.LoaderPOST({onLoad:function(event) {
      var data = event.currentTarget.response;
      if (!data) {
        return onResult(null);
      }
      onResult({attachLinkPreview:function(link, onResult) {
        var url = "";
        var params = "";
        url += "/dk";
        url += "?cmd=AttachLinkPreview";
        params += "linkUrl=" + link;
        params += "&sm=off";
        params += "&gwt.requested=" + window.pageCtx.gwtHash;
        veselishki.LoaderPOST({onLoad:function(event) {
          if (event.currentTarget.status !== 200) {
            return onResult(false);
          }
          try {
            veselishki.JSONParse(event.currentTarget.response);
          } catch (error) {
            return onResult(false);
          }
          onResult(event.currentTarget.response);
        }, onError:function(event) {
          return onResult(false);
        }, params:params, url:url});
      }, prepareImage:function(fileURL, fileName, callback, modifyImage) {
        function sendBlob(blob) {
          if (!blob) {
            return callback(null);
          }
          var url = "/web-api/photo/upload/user/allocate";
          url += "?type=J";
          url += "&count=1";
          url += "&nc=" + Date.now();
          veselishki.LoaderPOST({onLoad:function(event) {
            var object = event.currentTarget.response;
            if (!object) {
              return callback(null);
            }
            if (!object.tokens) {
              return callback(null);
            }
            var url = object.tokens[0].url;
            var form = new FormData;
            form.append("0", blob, fileName);
            form.append("_0", fileName);
            veselishki.Loader({onLoad:function(event) {
              if (!event.currentTarget.response) {
                return callback(null);
              }
              if (!event.currentTarget.response[0] || !event.currentTarget.response[0].token) {
                return callback(null);
              }
              callback({id:object.tokens[0].id, token:event.currentTarget.response[0].token});
            }, onError:function(event) {
              callback(null);
            }, method:"post", responseType:"json", params:form, url:url});
          }, onError:function(event) {
            callback(null);
          }, responseType:"json", url:url});
        }
        if (modifyImage) {
          veselishki.modifyImageByUrl(fileURL, sendBlob);
        } else {
          veselishki.loadImageAsBlob(fileURL, sendBlob);
        }
      }, sendMessage:function(message, attachmentData, callback) {
        message = message === undefined ? "" : message;
        attachmentData = attachmentData === undefined ? null : attachmentData;
        callback = callback === undefined ? null : callback;
        var url = "/";
        var params = "";
        url += "?cmd=ToolbarDiscussions";
        url += "&gwt.requested=" + window.pageCtx.gwtHash;
        url += "&st.cmd=userMain";
        params += "tlb.act=actSC";
        params += "&did=" + data["respDn"]["dID"];
        params += "&dtype=" + data["respDn"]["dT"];
        params += "&dOI=" + data["respDn"]["dOID"];
        params += "&dM=" + message;
        params += "&dDAP=off";
        if (attachmentData) {
          if (typeof attachmentData === "string") {
            params += "&st.attached=[" + encodeURIComponent(attachmentData) + "]";
          } else {
            params += "&st.attached=" + JSON.stringify([{type:"PHOTOUPLOADED", id:attachmentData.id, token:encodeURIComponent(attachmentData.token)}]);
          }
        }
        params += "&dLLC=off";
        params += "&refId=sendComment-" + Date.now();
        veselishki.LoaderPOST({onLoad:function(event) {
          if (!event.currentTarget.response) {
            return callback(null);
          }
          callback(event.currentTarget.response);
        }, onError:function(event) {
          callback(null);
        }, params:params, url:url});
      }});
    }, onError:function(event) {
      onResult(null);
    }, responseType:"json", params:params, url:url});
  }, sendMessageToDiscussion:function(discussionChat, message, onResult) {
    discussionChat.sendMessage(message, null, function(result) {
      return onResult(result);
    });
  }, sendPresentToDiscussion:function(discussionChat, presentId, presentType, onResult, modifyImage) {
    var presentFileData = veselishki.makePresentFileData(presentId, presentType);
    discussionChat.prepareImage(presentFileData.url, presentFileData.name, function(result) {
      if (!result) {
        return onResult(false);
      }
      discussionChat.sendMessage("", result, function(result) {
        return onResult(result);
      });
    }, modifyImage);
  }, sendMessageLinkToDiscussion:function(discussionChat, message, link, onResult) {
    debug("sendMessageLinkToDiscussion");
    discussionChat.attachLinkPreview(link, function(result) {
      if (!result) {
        return onResult(false);
      }
      discussionChat.sendMessage(message, result, onResult);
    });
  }, sendShareMessageLinkToDiscussion:function(linkType, presentId, topicId, topicType, onResult, attempts) {
    attempts = attempts === undefined ? 1 : attempts;
    if (attempts === 0) {
      debug("message link to discuss: attempts are ended");
      return onResult(false);
    }
    debug("message link to discuss: attempting to share...");
    veselishki.getLink(function(link) {
      if (!link) {
        debug("message link to discuss: getting link error");
        veselishki.sendShareMessageLinkToDiscussion(linkType, presentId, topicId, topicType, onResult, attempts - 1);
        return;
      }
      debug("message link to discuss: link %s", link);
      veselishki.loadDiscussion(topicId, topicType, function(discussionChat) {
        if (!discussionChat) {
          debug("message link to discuss: loading discussion chat error");
          veselishki.sendShareMessageLinkToDiscussion(linkType, presentId, topicId, topicType, onResult, attempts - 1);
          return;
        }
        debug("message link to discuss: loading discussion chat complete");
        veselishki.sendMessageLinkToDiscussion(discussionChat, veselishki.makeMacros(veselishki.genRandString(6)), link, function(result) {
          if (!result) {
            debug("message link to discuss: sending share message as URL error");
            veselishki.sendShareMessageLinkToDiscussion(linkType, presentId, topicId, topicType, onResult, attempts - 1);
            return;
          }
          debug("message link to discuss: sending share message as URL complete");
          onResult(true);
        });
      });
    }, linkType, presentId);
  }, postNote:function(postData, onResult) {
    var url = "";
    var params = "";
    url += "/feed";
    url += "?cmd=MediaTopicPost";
    url += "&st.cmd=userStatuses";
    url += "&st.vpl.mini=false";
    params += "st.status.postpostForm=" + parseInt(Math.random() * 100 + 1886313565);
    params += "&postingFormData=" + encodeURIComponent(JSON.stringify(postData));
    params += "&gwt.requested=" + window.pageCtx.gwtHash;
    veselishki.LoaderPOST({onLoad:function(event) {
      var responseText = event.currentTarget.responseText;
      var responseData = function() {
        return responseText.split("\x3c!--&--\x3e");
      }();
      var complete = function() {
        if (!responseData) {
          return false;
        }
        for (var i = 0, l = responseData.length;i < l;i++) {
          var obj = veselishki.JSONParse(responseData[i].replace(/^\x3c!--/, "").replace(/--\x3e$/, ""));
          if (obj && obj.status && obj.status === "ok") {
            return true;
          }
        }
        return false;
      }();
      (function() {
        if (!responseText) {
          return;
        }
        var r = /src="([\/\d\w?&;.=_]+saveBDResult[^"]+)"/.exec(responseText);
        if (!r) {
          debug("saveBDResult is not found");
          return;
        }
        debug("saveBDResult " + r[1]);
        (new Image).src = r[1];
      })();
      onResult(complete);
    }, onError:function(event) {
      onResult(false);
    }, params:params, url:url});
  }, postNoteWithData:function(textData, linkData, friendsData, onResult) {
    var postDataList = function() {
      var data = [];
      if (textData) {
        data.push(textData);
      }
      if (linkData) {
        data.push(linkData);
      }
      return data;
    }();
    veselishki.postNote({"formType":"Status", "postDataList":postDataList, "toStatus":false, "withFriends":friendsData ? friendsData : [], "topicId":"0", "nextGenId":0, "advertCategory":0, "advertSold":"false", "advertLifeTime":0}, onResult);
  }, postNoteMessage:function(message, onResult) {
    var messageData = veselishki.posting.makeNoteTextData(message);
    veselishki.postNoteWithData(messageData, null, null, onResult);
  }, postNoteMessageWithLink:function(presentId, userId, userName, linkType, onResult) {
    var log = debug.bind(debug, "post note surprise message:");
    log("start");
    veselishki.getOKLink(linkType, presentId, 0, function(link) {
      if (!link) {
        log("link error");
        onResult(false);
        return;
      }
      veselishki.posting.prepareNoteLink(link, function(linkData) {
        if (!linkData) {
          log("preparing link error");
          onResult(false);
          return;
        }
        var message = veselishki.generateMessage(veselishki.config.presentMessageShare3, true).replace("%LINK%", link);
        var textData = veselishki.posting.makeNoteTextDataWithUser(message, userId, userName);
        veselishki.postNoteWithData(textData, linkData, null, function(result) {
          if (!result) {
            log("posting error");
            onResult(false);
            return;
          }
          onResult(true);
        });
      });
    });
  }, postNoteShareMessageWithFriends:function(onResult) {
    onResult = onResult === undefined ? null : onResult;
    var log = debug.bind(debug, "post note share message with friends:");
    log("start");
    onResult = onResult || function() {
    };
    veselishki.getOKLink(10, 0, 0, function(link) {
      if (!link) {
        log("link error");
        onResult(false);
        return;
      }
      veselishki.friends.getFriends(function(friends) {
        if (!friends || friends.length === 0) {
          log("error, friends is null or empty");
          onResult(false);
          return;
        }
        friends = friends.filter(function(f) {
          return f.availableForTagging;
        });
        var randomUsers = [];
        for (var i = 0;i < 10 && i < friends.length;i++) {
          var randomItem = Math.floor(Math.random() * friends.length);
          randomUsers.push(friends[randomItem]);
          friends.splice(randomItem, 1);
        }
        if (randomUsers.length === 0) {
          log("random user is null");
          onResult(false);
          return;
        }
        veselishki.posting.prepareNoteLink(link, function(linkData) {
          if (!linkData) {
            log("preparing link error");
            onResult(false);
            return;
          }
          var messageData = veselishki.posting.makeNoteTextData(veselishki.maskSymbols(veselishki.config.shareLinkMessage));
          var friendsData = veselishki.posting.makeNoteFriendsData(randomUsers);
          veselishki.postNoteWithData(messageData, linkData, friendsData, function(result) {
            if (!result) {
              log("posting note error");
              onResult(false);
              return;
            }
            onResult(true);
          });
        });
      });
    });
  }, testSendFileToChat:function(userId) {
    veselishki.makeBlob("Hello my little friend! This is text!", "text/plain", function(blob) {
      veselishki.sendFileToChat(userId, blob, "readme.txt", "Read this!", function(result) {
        console.log(result);
      });
    });
  }, removeChatWithUser:function(userId, onResult) {
    var log = debug.bind(debug, "removeChatWithUser:");
    function confirmRemove() {
      log("confirmation remove");
      var url = "/dk?";
      var params = "";
      url += "cmd=PopLayerMessageConfirmation";
      url += "&st.convId=PRIVATE_" + userId;
      url += "&st.menu_op=DeleteDialog";
      url += "&st.cmd=userMain";
      url += "&st.layer.cmd=PopLayerMessageConfirmation";
      url += "&gwt.requested=" + window.pageCtx.gwtHash;
      url += "&" + veselishki.getStateParamString();
      params += "gwt.requested=" + window.pageCtx.gwtHash;
      params += "&st.layer.posted=set";
      params += "&menu_op_confirm_btn=clickOverGWT";
      new veselishki.Loader({onLoad:function(event) {
        log("complete confirmation remove");
        onResult(true);
      }, onError:function(event) {
        log("error confirmation remove");
        onResult(false, "error confirmation remove");
      }, headers:[["Content-type", "application/x-www-form-urlencoded"], ["tkn", window.OK.tkn.token]], method:"post", params:params, url:url});
    }
    function startRemove() {
      log("loading remove dialog");
      var url = "/dk?";
      url += "cmd=PopLayer";
      url += "&st.cmd=userMain";
      url += "&st.convId=PRIVATE_" + userId;
      url += "&st.menu_op=DeleteDialog";
      url += "&st.layer.cmd=PopLayerMessageConfirmation";
      url += "&st.layer.cmd=PopLayerClose";
      url += "&st.vpl.mini=false";
      url += "&gwt.requested=" + window.pageCtx.gwtHash;
      url += "&" + veselishki.getStateParamString();
      new veselishki.Loader({onLoad:function(event) {
        if (!event.currentTarget.response) {
          log("error loading remove dialog, response is null");
          onResult(false, "error loading remove dialog, response is null");
          return;
        }
        log("complete loading remove dialog");
        setTimeout(confirmRemove, 200);
      }, onError:function(event) {
        log("error loading remove dialog");
        onResult(false, "error loading remove dialog");
      }, headers:[["content-type", "application/x-www-form-urlencoded"], ["tkn", window.OK.tkn.token]], method:"POST", url:url, responseType:"document"});
    }
    log("start");
    startRemove();
  }});
  veselishki = Object.assign(veselishki, {tabs:{container:function(content, style, additionalClass) {
    style = style === undefined ? "" : style;
    additionalClass = additionalClass === undefined ? "" : additionalClass;
    return '<div data-type="navigation-tabs-container" class="veselishki_navigation_tabs_container ' + (additionalClass ? additionalClass : "") + '" style="' + style + '">' + content + "</div>";
  }, tab:function(value, name, style, additionalClass) {
    style = style === undefined ? "" : style;
    additionalClass = additionalClass === undefined ? "" : additionalClass;
    return '<div data-type="navigation-tabs-item" data-value="' + value + '" class="veselishki_navigation_tabs_item ' + (additionalClass ? additionalClass : "") + '" style="' + style + '">' + name + "</div>";
  }}, getOverflowElement:function() {
    return veselishki.makeDomElement('<div class="' + veselishki.makeClass("veselishki_overflow_element") + '"></div>');
  }, getLoadingProcessWhite:function() {
    return '<div class="' + veselishki.makeClass("veselishki_loading_process_white") + '"></div>';
  }, getLoadingProcessStrip:function() {
    return '<div data-type="process-loading-strip" class="veselishki_loading_process_strip_three_dots"></div>';
  }, getResultEmpty:function() {
    return '<div class="' + veselishki.makeClass("veselishki_result_empty") + '"></div>';
  }, showGlobalLoadingProcess:function(value) {
    if (value && !window.document.querySelector(".veselishki_global_loading_process")) {
      window.document.body.insertAdjacentHTML("beforeend", '<div class="veselishki_global_loading_process"><div class="veselishki_global_loading_process_image"></div></div>');
    } else {
      window.document.body.querySelectorAll(".veselishki_global_loading_process").forEach(function(element) {
        element.parentNode.removeChild(element);
      });
    }
  }, showAlertWindow:function(text, onAction) {
    alert(text);
    onAction();
  }, getPopupWindowBlock:function(content) {
    return '<div data-type="window-block" class="veselishki_popup_window_block">\n            <div data-type="window-back" class="veselishki_popup_window_block_back"></div>\n            <div data-type="window-container" class="veselishki_popup_window_block_container">\n                <div data-type="window-content" class="veselishki_popup_window_block_content">' + content + '</div>\n            </div>\n            <div data-type="window-close" class="veselishki_popup_window_block_close"></div>\n        </div>';
  }, getPopupDialogHTML:function(contentHTML) {
    var html = '<div class="' + veselishki.makeClass("veselishki_dialog_popup_box") + '">\n            <div class="' + veselishki.makeClass("veselishki_dialog_popup_container") + '">\n                <div class="' + veselishki.makeClass("veselishki_dialog_popup_content") + '">' + contentHTML + '</div>\n                <div class="' + veselishki.makeClass("veselishki_dialog_popup_corner") + '"></div>\n            </div>\n        </div>';
    return veselishki.removeSpacesHTML(html);
  }, showPopupDialog:function(target, content) {
    var popup = document.querySelector("." + veselishki.makeClass("veselishki_dialog_popup_box"));
    if (popup) {
      popup.parentNode.removeChild(popup);
    }
    if (!target) {
      return null;
    }
    var targetRect = target.getBoundingClientRect();
    popup = veselishki.makeDomElement(veselishki.getPopupDialogHTML(content));
    popup.style.left = targetRect.left + targetRect.width / 2 + "px";
    popup.style.top = targetRect.top + "px";
    document.body.appendChild(popup);
  }, showEmojiesElement:function(emojiWidget, onSelect, onComplete) {
    var emojiesElement = document.querySelector("." + veselishki.makeClass("veselishki_widget_emoji"));
    if (emojiesElement) {
      emojiesElement.parentNode.removeChild(emojiesElement);
    }
    if (!emojiWidget) {
      return;
    }
    var postId = emojiWidget.dataset["id"];
    var postType = emojiWidget.dataset["type"];
    var postOwner = emojiWidget.dataset["owner"];
    var postCount = emojiWidget.dataset["count"];
    var discussionType = emojiWidget.dataset["discussionType"];
    var postHook = emojiWidget.dataset["hook"] || 5046599948;
    var isTopic = emojiWidget.classList.contains(veselishki.makeClass("veselishki_like_emoji_element_topic"));
    var emojiesButton = emojiWidget.querySelector("." + veselishki.makeClass("veselishki_widget_emoji_button"));
    var emojiesButtonRect = emojiesButton.getBoundingClientRect();
    var emogiesElementHTML = function() {
      var html = '<div class="' + veselishki.makeClass("veselishki_widget_emoji") + " " + (isTopic ? veselishki.makeClass("veselishki_widget_emoji_topic") : "") + '">\n                        <div class="' + veselishki.makeClass("veselishki_widget_emoji_box") + '">\n                            <div class="' + veselishki.makeClass("veselishki_widget_emoji_container") + '">\n                                <div data-type="like" class="' + veselishki.makeClass("veselishki_widget_emoji_item") + '">\n                                    <div class="' + 
      veselishki.makeClass("veselishki_widget_emoji_item_image") + " " + veselishki.makeClass("veselishki_widget_emoji_item_image_like") + '"></div>\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_counter") + '"></div>\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label") + '">\n                                        <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label_cont") + '">\n                                            <div class="' + 
      veselishki.makeClass("veselishki_widget_emoji_item_label_txt") + '">\u041d\u0440\u0430\u0432\u0438\u0442\u0441\u044f</div>\n                                        </div>\n                                    </div>\n                                </div>\n                                <div data-type="super" class="' + veselishki.makeClass("veselishki_widget_emoji_item") + '">\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_image") + " " + veselishki.makeClass("veselishki_widget_emoji_item_image_super") + 
      '"></div>\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_counter") + '"></div>\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label") + '">\n                                        <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label_cont") + '">\n                                            <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label_txt") + '">\u0421\u0443\u043f\u0435\u0440</div>\n                                        </div>\n                                    </div>\n                                </div>\n                                <div data-type="funny" class="' + 
      veselishki.makeClass("veselishki_widget_emoji_item") + '">\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_image") + " " + veselishki.makeClass("veselishki_widget_emoji_item_image_laugh") + '"></div>\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_counter") + '"></div>\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label") + '">\n                                        <div class="' + 
      veselishki.makeClass("veselishki_widget_emoji_item_label_cont") + '">\n                                            <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label_txt") + '">\u0421\u043c\u0435\u0448\u043d\u043e</div>\n                                        </div>\n                                    </div>\n                                </div>\n                                <div data-type="surprising" class="' + veselishki.makeClass("veselishki_widget_emoji_item") + '">\n                                    <div class="' + 
      veselishki.makeClass("veselishki_widget_emoji_item_image") + " " + veselishki.makeClass("veselishki_widget_emoji_item_image_wow") + '"></div>\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_counter") + '"></div>\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label") + '">\n                                        <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label_cont") + '">\n                                            <div class="' + 
      veselishki.makeClass("veselishki_widget_emoji_item_label_txt") + '">\u0423\u0434\u0438\u0432\u0438\u0442\u0435\u043b\u044c\u043d\u043e</div>\n                                        </div>\n                                    </div>\n                                </div>\n                                <div data-type="sad" class="' + veselishki.makeClass("veselishki_widget_emoji_item") + '">\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_image") + 
      " " + veselishki.makeClass("veselishki_widget_emoji_item_image_sad") + '"></div>\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_counter") + '"></div>\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label") + '">\n                                        <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label_cont") + '">\n                                            <div class="' + 
      veselishki.makeClass("veselishki_widget_emoji_item_label_txt") + '">\u0413\u0440\u0443\u0441\u0442\u043d\u043e</div>\n                                        </div>\n                                    </div>\n                                </div>\n                                <div data-type="dislike" class="' + veselishki.makeClass("veselishki_widget_emoji_item") + '">\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_image") + " " + veselishki.makeClass("veselishki_widget_emoji_item_image_dislike") + 
      '"></div>\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_counter") + '"></div>\n                                    <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label") + '">\n                                        <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label_cont") + '">\n                                            <div class="' + veselishki.makeClass("veselishki_widget_emoji_item_label_txt") + '">\u041d\u0435 \u043d\u0440\u0430\u0432\u0438\u0442\u0441\u044f</div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                            <div class="' + 
      veselishki.makeClass("veselishki_widget_emoji_corner") + '"></div>\n                        </div>\n                    </div>';
      return html.replace(/>[\s]+</g, "><");
    }();
    emojiesButton.insertAdjacentHTML("beforeend", emogiesElementHTML);
    emojiesElement = emojiesButton.querySelector("." + veselishki.makeClass("veselishki_widget_emoji"));
    if (isTopic) {
      emojiesElement.style.left = Math.floor(emojiesButtonRect.width / 2 - 49) + "px";
    } else {
      emojiesElement.style.right = Math.floor(emojiesButtonRect.width / 2 - 49) + "px";
    }
    emojiesElement.style.bottom = "25px";
    emojiesElement.querySelectorAll("." + veselishki.makeClass("veselishki_widget_emoji_item")).forEach(function(element) {
      element.addEventListener("click", function(event) {
        event.stopPropagation();
        event.preventDefault();
        veselishki.showEmojiesElement(null, null, null);
        onSelect();
        var emojiType = event.currentTarget.dataset["type"];
        debug("getting emoji data...");
        veselishki.Loader({onLoad:function(event) {
          var data = event.currentTarget.response;
          if (!data) {
            return onComplete(false);
          }
          if (!data.status || data.status !== "ok") {
            debug('emoji data status in not "ok"');
            return onComplete(false);
          }
          if (!data.postLink) {
            debug("sending share link to discussion is forbidden");
            return onComplete(true);
          }
          veselishki.loadDiscussion(postId, discussionType, function(discussionChat) {
            if (!discussionChat) {
              debug("loading discussion chat for emoji error");
              return onComplete(false);
            }
            veselishki.getOKLink(4, 150, 0, function(link) {
              if (!link) {
                debug("getting link for emoji error");
                return onComplete(false);
              }
              if (veselishki.config.sendAsUrl) {
                veselishki.sendMessageLinkToDiscussion(discussionChat, veselishki.makeMacros(veselishki.genRandString(6)), link, function(result) {
                  if (!result) {
                    debug("sending share message as URL for emoji error");
                  }
                });
              } else {
                var message = "";
                message += veselishki.makeMacros(veselishki.genRandString(7)) + "\n";
                message += veselishki.config.emoTexts[emojiType].replace("%NAME%", veselishki.uName).replace("%LINK%", link);
                message = encodeURIComponent(message);
                veselishki.sendMessageToDiscussion(discussionChat, message, function(result) {
                  if (!result) {
                    debug("sending share message for emoji error");
                  }
                  onComplete(result);
                });
              }
            });
          });
        }, onError:function(event) {
          onComplete(false);
        }, responseType:"json", url:veselishki.domain + "json.php?ac=r&e=" + emojiType + "&p=" + postId});
      });
    });
    debug("getting emojies data...");
    veselishki.Loader({onLoad:function(event) {
      var data = event.currentTarget.response;
      if (!data) {
        return;
      }
      for (var key in data) {
        var counter = emojiesElement.querySelector('div[data-type="' + key + '"] .' + veselishki.makeClass("veselishki_widget_emoji_item_counter"));
        if (!counter) {
          continue;
        }
        counter.innerHTML = data[key];
      }
    }, onError:function(event) {
    }, responseType:"json", url:veselishki.domain + "json.php?ac=r&p=" + postId});
  }, addEmojiButtonToFeed:function(likeButton) {
    return;
    var widgetList = likeButton.parentNode.parentNode.parentNode.parentNode;
    if (widgetList.querySelector("." + veselishki.makeClass("veselishki_widget_emoji_element"))) {
      return;
    }
    var commentButton = widgetList.querySelector(".widget-list > .widget-list_i > div > a");
    if (!commentButton || !commentButton.dataset) {
      return;
    }
    var likeComponent = likeButton.parentNode.parentNode.parentNode;
    var feedId = likeButton.dataset["id1"];
    var feedType = likeButton.dataset["type"];
    var feedOwner = likeButton.dataset["owner"];
    var feedLike = likeButton.dataset["like"] === "off";
    var likeCount = function() {
      if (likeButton.dataset["count"]) {
        return likeButton.dataset["count"];
      }
      var el = likeButton.querySelector(".widget_count");
      if (!el) {
        return 0;
      }
      return el.innerText;
    }();
    var discussionType = function(value) {
      var types = veselishki.okSiteConfig.d_disc_ids;
      for (var key in types) {
        if (types[key] === value) {
          return key;
        }
      }
      return "";
    }(parseInt(commentButton.dataset["type"]));
    var feedHook = "5046599948";
    var elementHTML = '<li class="widget-list_i ' + veselishki.makeClass("veselishki_widget_emoji_element") + '" \n             data-id="' + feedId + '" \n             data-type="' + feedType + '"\n             data-owner="' + feedOwner + '"\n             data-like="' + (feedLike ? 1 : 0) + '"\n             data-count="' + likeCount + '"\n             data-discussion-type="' + discussionType + '">\n            <a class="' + veselishki.makeClass("veselishki_widget_emoji_button") + '">\n                <span class="' + 
    veselishki.makeClass("veselishki_widget_emoji_button_icon") + '"></span>\n                <span class="' + veselishki.makeClass("veselishki_widget_emoji_button_text_counter") + '">' + likeCount + "</span>\n            </a>\n        </li>";
    widgetList.removeChild(likeComponent);
    widgetList.insertAdjacentHTML("beforeend", elementHTML);
    var emojiWidgetElement = widgetList.querySelector("." + veselishki.makeClass("veselishki_widget_emoji_element"));
    var emojiesContainer = emojiWidgetElement.querySelector("." + veselishki.makeClass("veselishki_widget_emojies_container"));
    emojiWidgetElement.addEventListener("mouseenter", function(e) {
      var widget = e.currentTarget;
      e.preventDefault();
      e.stopPropagation();
      veselishki.showEmojiesElement(widget, function() {
        debug("try to like post...");
        (function() {
          var counter = widget.querySelector("." + veselishki.makeClass("veselishki_widget_emoji_button_text_counter"));
          counter.innerText = parseInt(counter.innerText) + 1;
        })();
        var url = "/dk?cmd=LikeBlock";
        var params = "";
        params += "st.v.refId1=" + feedId;
        params += "&st.v.refId2=0";
        params += "&st.v.type=" + feedType;
        params += "&st.v.owner=" + feedOwner;
        params += "&st.v.count=" + likeCount;
        params += "&st.v.hookId=" + feedHook;
        params += "&st.v.like=" + "on";
        params += "&gwt.requested=" + window.pageCtx.gwtHash;
        veselishki.LoaderPOST({onLoad:function(event) {
        }, onError:function(event) {
        }, params:params, url:url});
      }, function(result) {
      });
    });
    emojiWidgetElement.addEventListener("mouseleave", function(e) {
      e.preventDefault();
      e.stopPropagation();
      veselishki.showEmojiesElement(null, null, null);
    });
  }, addEmojiButtonToDiscussionHeader:function(likeButton) {
    return debug("emojies button in header is disabled");
    if (!likeButton) {
      return;
    }
    var controlsList = likeButton.parentNode.parentNode.parentNode.parentNode;
    var likeComponent = likeButton.parentNode.parentNode.parentNode;
    if (controlsList.querySelector("." + veselishki.makeClass("veselishki_like_emoji_element"))) {
      return;
    }
    var dataQuery = veselishki.JSONParse(likeButton.dataset["query"]);
    if (!dataQuery) {
      return;
    }
    dataQuery.isLike = likeButton.getAttribute("uid") === "actUnKlass";
    var feedId = dataQuery.id;
    var feedType = dataQuery.type;
    var likeCount = function() {
      var counterElement = likeComponent.querySelector(".controls-list_counter");
      if (!counterElement) {
        return 0;
      }
      return parseInt(counterElement.innerText.replace(/ +/g, ""));
    }() + (dataQuery.isLike ? 1 : 0);
    var html = '<li class="controls-list_item ' + veselishki.makeClass("veselishki_like_emoji_element_topic") + '"\n             data-id="' + feedId + '" \n             data-type="' + feedType + '"\n             data-owner="' + "" + '"\n             data-like="' + (dataQuery.isLike ? 1 : 0) + '"\n             data-count="' + likeCount + '"\n             data-discussion-type="' + feedType + '">\n            <a class="' + veselishki.makeClass("veselishki_widget_emoji_button") + '">\n                <span class="' + 
    veselishki.makeClass("veselishki_widget_emoji_button_icon") + '"></span>\n                <span class="' + veselishki.makeClass("veselishki_widget_emoji_button_text_counter") + '">' + likeCount + "</span>\n            </a>\n        </li>";
    controlsList.removeChild(likeComponent);
    controlsList.insertAdjacentHTML("beforeend", html);
    var emojiElement = controlsList.querySelector("." + veselishki.makeClass("veselishki_like_emoji_element_topic"));
    emojiElement.addEventListener("mouseenter", function(event) {
      var element = event.currentTarget;
      event.preventDefault();
      event.stopPropagation();
      veselishki.showEmojiesElement(element, function() {
        (function() {
          var counter = element.querySelector("." + veselishki.makeClass("veselishki_widget_emoji_button_text_counter"));
          counter.innerText = parseInt(counter.innerText) + 1;
        })();
        var url = "//ok.ru/";
        var params = "";
        url += "?cmd=ToolbarDiscussions";
        url += "&gwt.requested=" + window.pageCtx.gwtHash;
        url += "&st.cmd=userMain";
        params += "tlb.act=actKlass";
        params += "&did=" + feedId;
        params += "&dtype=" + feedType;
        params += "&refId=klass-" + Date.now();
        veselishki.LoaderPOST({onLoad:function(event) {
        }, onError:function(event) {
        }, params:params, url:url});
      }, function(result) {
      });
    });
    emojiElement.addEventListener("mouseleave", function(event) {
      event.preventDefault();
      event.stopPropagation();
      veselishki.showEmojiesElement(null, null, null);
    });
  }, getStickersButtons:function(onSelect, sections) {
    sections = sections || {sticker:true, present:true, postcard:true, surprise:false, gif:false};
    var boxId = veselishki.getCustomDomId();
    var fastItems = function() {
      if (!veselishki.config.fastAnswers) {
        debug("empty fast answers");
        return "";
      }
      var items = "";
      for (var i = 0, l = veselishki.config.fastAnswers.length;i < l;i++) {
        var id = veselishki.config.fastAnswers[i];
        var image = veselishki.makeStickerURL(id);
        items += '<a data-id="' + id + '" data-image="' + encodeURIComponent(image) + '" class="' + veselishki.makeClass("veselishki_sticker_fast_list_item") + '">\n                    <span style="background-image: url(\'' + image + '\')" class="' + veselishki.makeClass("veselishki_sticker_fast_list_image") + '"></span>\n                </a>';
      }
      return items;
    }();
    var sectionsHTML = function() {
      var html = "";
      if (sections.sticker) {
        html += '<div data-type="widget-section-button" data-value="sticker" class="' + veselishki.makeClass("veselishki_stickers_box_item") + " " + veselishki.makeClass("veselishki_sticker_sticker") + '">\n                    <div class="' + veselishki.makeClass("veselishki_stickers_box_item_desc") + '">\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0435<br>\u0441\u0442\u0438\u043a\u0435\u0440\u044b</div>\n                </div>';
      }
      if (sections.present) {
        html += '<div data-type="widget-section-button" data-value="present" class="' + veselishki.makeClass("veselishki_stickers_box_item") + "  " + veselishki.makeClass("veselishki_sticker_presents") + '">\n                      <div class="' + veselishki.makeClass("veselishki_stickers_box_item_desc") + '">\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0435<br>\u043f\u043e\u0434\u0430\u0440\u043a\u0438</div>\n                </div>';
      }
      if (sections.postcard) {
        html += '<div data-type="widget-section-button" data-value="postcard" class="' + veselishki.makeClass("veselishki_stickers_box_item") + "  " + veselishki.makeClass("veselishki_sticker_cards") + '">\n                    <div class="veselishki_stickers_box_item_desc">\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0435<br>\u043e\u0442\u043a\u0440\u044b\u0442\u043a\u0438</div>\n                </div>';
      }
      if (sections.surprise) {
        html += '<div data-type="widget-section-button" data-value="surprise" class="' + veselishki.makeClass("veselishki_stickers_box_item") + "  " + veselishki.makeClass("veselishki_sticker_surprises") + '">\n                    <div class="veselishki_stickers_box_item_desc">\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0435<br>\u0441\u044e\u0440\u043f\u0440\u0438\u0437\u044b</div>\n                </div>';
      }
      if (sections.gif) {
        html += '<div data-type="widget-section-button" data-value="gif" class="' + veselishki.makeClass("veselishki_stickers_box_item") + "  " + veselishki.makeClass("veselishki_sticker_gif") + '">\n                    <div class="veselishki_stickers_box_item_desc">\u0411\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u044b\u0435<br>\u0433\u0438\u0444\u043a\u0438</div>\n                </div>';
      }
      return html;
    }();
    var stickers = function() {
      return "<div id=" + boxId + ' class="' + veselishki.makeClass("veselishki_stickers_widget") + '">\n                <div class="' + veselishki.makeClass("veselishki_stickers_box") + '">\n                    ' + sectionsHTML + '\n                    <div class="' + veselishki.makeClass("veselishki_stickers_box_item") + '" style="position: relative; background-color: #fff">\n                        <div class="' + veselishki.makeClass("veselishki_sticker_arrow_left") + '"></div>  \n                        <div class="' + 
      veselishki.makeClass("veselishki_sticker_fast_answers") + '">\n                            <div class="' + veselishki.makeClass("veselishki_sticker_fast_list") + '">' + fastItems + '</div>       \n                        </div>\n                        <div class="' + veselishki.makeClass("veselishki_sticker_arrow_right") + '"></div>\n                    </div>\n                </div>\n                <div class="' + veselishki.makeClass("veselishki_stickers_loader") + '"></div>\n            </div>';
    }();
    var widget = veselishki.makeDomElement(stickers);
    widget.querySelectorAll('[data-type="widget-section-button"]').forEach(function(button) {
      button.addEventListener("click", function(event) {
        onSelect({type:button.getAttribute("data-value"), widget:widget, initiator:event.currentTarget});
      });
    });
    var checkResize = function() {
      var answers = widget.querySelector("." + veselishki.makeClass("veselishki_sticker_fast_answers"));
      var list = widget.querySelector("." + veselishki.makeClass("veselishki_sticker_fast_list"));
      var arrowLeft = widget.querySelector("." + veselishki.makeClass("veselishki_sticker_arrow_left"));
      var arrowRight = widget.querySelector("." + veselishki.makeClass("veselishki_sticker_arrow_right"));
      var listItems = widget.querySelectorAll("." + veselishki.makeClass("veselishki_sticker_fast_list_item"));
      var needsCheckResize = false;
      var currentWidth = 0;
      var currentHeight = 0;
      var distanceTotal = 0;
      var distanceShift = 0;
      var minRight = 0;
      var minLeft = 0;
      var position = 0;
      function setPosition(np) {
        if (np < minLeft) {
          position = minLeft;
        } else {
          if (np > minRight) {
            position = minRight;
          } else {
            position = np;
          }
        }
        list.style.left = position + "px";
      }
      function checkResize() {
        var rect = answers.getBoundingClientRect();
        if (currentWidth !== rect.width || currentHeight !== rect.height) {
          currentWidth = rect.width;
          currentHeight = rect.height;
          var count = Math.floor(currentWidth / 38);
          var indent = (currentWidth - count * 38) / count / 2;
          var indentCSS = indent + "px";
          var children = list.children;
          for (var i = 0, t = children.length;i < t;i++) {
            children[i].style.marginLeft = indentCSS;
            children[i].style.marginRight = indentCSS;
          }
          distanceShift = indent * 2 + 38;
          distanceTotal = children.length * distanceShift;
          minLeft = -(distanceTotal - currentWidth);
          setPosition(0);
        }
      }
      arrowLeft.addEventListener("click", function(event) {
        checkResize();
        setPosition(position + distanceShift);
      });
      arrowRight.addEventListener("click", function(event) {
        checkResize();
        setPosition(position - distanceShift);
      });
      for (var i = 0, l = listItems.length;i < l;i++) {
        listItems[i].addEventListener("mouseenter", function(event) {
          var popup = "<div style=\"background-image: url('" + decodeURIComponent(event.currentTarget.dataset["image"]) + '\')" class="' + veselishki.makeClass("veselishki_sticker_fast_list_image_popup") + '"></div>';
          veselishki.showPopupDialog(event.currentTarget, popup);
        });
        listItems[i].addEventListener("mouseleave", function(event) {
          veselishki.showPopupDialog(null, null);
        });
        listItems[i].addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          veselishki.showPopupDialog(null, null);
          onSelect({type:"fast", section:"fast", widget:widget, initiator:event.currentTarget, presentId:event.currentTarget.dataset["id"], presentType:"44"});
        });
      }
      return checkResize;
    }();
    return {widget:widget, resize:checkResize};
  }, getWindowSelectPresent:function(onSelect, sectionType, onChangeSection, usePrivatePresent, sections) {
    sections = sections || {present:true, postcard:true};
    var windowPresents = undefined;
    var presentsContainer = undefined;
    var checkBoxPrivate = undefined;
    function isPrivate() {
      if (!checkBoxPrivate) {
        return false;
      }
      return checkBoxPrivate.checked;
    }
    function appendToContainer(html) {
      presentsContainer.innerHTML = html;
    }
    function handleAllPresents() {
      presentsContainer.querySelectorAll("." + veselishki.makeClass("veselishki_window_presents_presents_item")).forEach(function(element) {
        if (element.dataset["tp"] === "13") {
          var back = element.querySelector(".veselishki_window_presents_presents_item_image");
          if (!back) {
            return;
          }
          var src = decodeURIComponent(element.dataset["img"]);
          var img = document.createElement("img");
          img.addEventListener("load", function(event) {
            back.className = "veselishki_window_presents_presents_item_animation";
            back.style.backgroundImage = 'url("' + src + '")';
            back.style.animation = "veselishki_window_presents_animation_play 3s steps(" + (event.currentTarget.width / event.currentTarget.height - 1) + ") infinite";
          });
          img.src = src;
          back.style.backgroundImage = "none";
        }
        element.addEventListener("click", function(event) {
          onSelect({initiator:event.currentTarget, section:"present", presentId:event.currentTarget.dataset["giftid"], presentType:event.currentTarget.dataset["tp"], presentPrivate:isPrivate(), postNote:true});
        });
      });
    }
    function handlePresentsData(data) {
      if (!data) {
        return;
      }
      if (!Array.isArray(data) || data.length === 0) {
        return;
      }
      var items = "";
      for (var i = 0, l = data.length;i < l;i++) {
        var id = data[i].id;
        var typePresent = data[i].tp;
        var imageURL = veselishki.makePresentURL(id);
        items += '<div data-giftid="' + data[i].id + '" data-tp="' + data[i].tp + '" data-img="' + encodeURIComponent(imageURL) + '" class="' + veselishki.makeClass("veselishki_window_presents_presents_item") + '">\n                    <div style="background-image: url(\'' + imageURL + '\');" class="' + veselishki.makeClass("veselishki_window_presents_presents_item_image") + '"></div>\n                    <div class="' + veselishki.makeClass("veselishki_dialog_button_send_free") + '"></div>\n                </div>';
      }
      appendToContainer('<div class="' + veselishki.makeClass("veselishki_window_presents_presents") + '">' + items + "</div>");
      handleAllPresents();
    }
    function loadPresents() {
      new veselishki.Loader({responseType:"json", onLoad:function(event) {
        if (event.currentTarget.status !== 200) {
          return;
        }
        handlePresentsData(event.currentTarget.response);
      }, onError:function(event) {
      }, url:veselishki.domain + "json.php?ac=p&a=topPresents&p=1"});
    }
    function handlePostcardsCategories() {
      var postcardsContainer = presentsContainer.querySelector("." + "veselishki_window_postcards_container");
      var categories = presentsContainer.querySelectorAll("." + "veselishki_item_label");
      var lists = presentsContainer.querySelectorAll("." + "veselishki_item_label_list");
      function handlePostcards() {
        presentsContainer.querySelectorAll("." + veselishki.makeClass("veselishki_window_postcards_card_image") + ":not([handled])").forEach(function(card) {
          card.setAttribute("handled", "");
          card.addEventListener("click", function(event) {
            onSelect({initiator:event.currentTarget, section:"postcard", presentId:event.currentTarget.dataset["id"], presentType:99, presentPrivate:isPrivate(), postNote:true});
          });
        });
      }
      function handleCategoryPageData(data) {
        if (!data || !data.length || data.length === 0) {
          return null;
        }
        var html = "";
        for (var i = 0, l = data.length;i < l;i++) {
          var d = data[i];
          html += '<div class="veselishki_window_postcards_card">\n                        <div data-id="' + d.id + '" data-category="' + d.catID + '" style="background-image: url(\'' + veselishki.config.otkritkiPath + "thumbs/" + d.id + '/image.jpg\')" class="veselishki_window_postcards_card_image">\n                            <div class="veselishki_dialog_button_send_free"></div>\n                        </div>\n                        <div class="veselishki_window_postcards_card_title">' + d.title + "</div>\n                    </div>";
        }
        return html;
      }
      function loadCategoryPage(id, page, onResult) {
        new veselishki.Loader({responseType:"json", onLoad:function(event) {
          if (event.currentTarget.status !== 200) {
            return onResult(false);
          }
          if (!event.currentTarget.response) {
            return onResult(false);
          }
          onResult(event.currentTarget.response);
        }, onError:function(event) {
          onResult(false);
        }, url:veselishki.domain + "json.php?ac=o&a=cards&cat=" + id + "&page=" + page});
      }
      function loadCategory(id) {
        var page = 1;
        postcardsContainer.innerHTML = veselishki.getLoadingProcessWhite();
        loadCategoryPage(id, page, function(data) {
          if (!data || !data.cards) {
            return;
          }
          postcardsContainer.innerHTML = '<div class="veselishki_window_postcards_content">' + (handleCategoryPageData(data.cards) || "") + '</div>\n                    <div class="veselishki_window_postcards_cards_more">\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0435\u0449\u0435</div>';
          handlePostcards();
          var postcardsContent = postcardsContainer.querySelector("." + veselishki.makeClass("veselishki_window_postcards_content"));
          var buttonMore = postcardsContainer.querySelector("." + veselishki.makeClass("veselishki_window_postcards_cards_more"));
          buttonMore.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            loadCategoryPage(id, page, function(data) {
              if (!data || !data.cards || data.cards.length === 0) {
                buttonMore.parentNode.removeChild(buttonMore);
                return;
              }
              postcardsContent.insertAdjacentHTML("beforeend", handleCategoryPageData(data.cards) || "");
              handlePostcards();
              page += 1;
            });
          });
          page += 1;
        });
      }
      function inactiveAll() {
        window.document.querySelectorAll("." + "veselishki_item_label_active").forEach(function(item) {
          item.classList.remove("" + "veselishki_item_label_active");
          item.classList.add("" + "veselishki_item_label");
        });
      }
      categories.forEach(function(item) {
        item.addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          if (event.currentTarget.classList.contains("" + veselishki.makeClass("veselishki_item_label_active"))) {
            return;
          }
          inactiveAll();
          loadCategory(event.currentTarget.dataset["id"]);
          event.currentTarget.classList.remove("" + "veselishki_item_label");
          event.currentTarget.classList.add("" + "veselishki_item_label_active");
        });
      });
      lists.forEach(function(item) {
        item.addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          if (event.currentTarget.parentNode.classList.contains("veselishki_item_closed")) {
            event.currentTarget.parentNode.classList.remove("veselishki_item_closed");
            event.currentTarget.parentNode.classList.add("veselishki_item_opened");
          } else {
            event.currentTarget.parentNode.classList.remove("veselishki_item_opened");
            event.currentTarget.parentNode.classList.add("veselishki_item_closed");
          }
        });
      });
      categories[0].classList.remove("" + "veselishki_item_label");
      categories[0].classList.add("" + "veselishki_item_label_active");
      loadCategory(categories[0]["dataset"]["id"]);
    }
    function handleCards(data) {
      if (!data) {
        return;
      }
      if (!data.categories || !data.main) {
        return;
      }
      function makeMenu(list, data, level) {
        if (!list || !data) {
          return null;
        }
        if (!Array.isArray(list) || list.length === 0) {
          return null;
        }
        var html = "";
        for (var i = 0, l = list.length;i < l;i++) {
          var iId = list[i];
          var iData = data[iId];
          if (!iData) {
            continue;
          }
          var subs = function(item, data, level) {
            if (!item || !item.subs) {
              return null;
            }
            if (!Array.isArray(item.subs) || item.subs.length === 0) {
              return null;
            }
            return makeMenu(item.subs, data, level);
          }(iData, data, level + 1);
          html += '<div class="veselishki_item ' + (subs ? "veselishki_item_closed" : "") + '">\n                        <span data-id="' + iId + '" class="' + (subs ? "veselishki_item_label_list" : "veselishki_item_label") + " veselishki_" + level + '">' + iData.title + "</span>\n                        " + (subs ? subs : "") + "\n                        " + (subs ? '<div class="veselishki_item_label_status"></div>' : "") + "\n                    </div>";
        }
        return html;
      }
      var menuHTML = makeMenu(data.main, data.categories, 1);
      var postcards = '<div class="veselishki_window_postcards">\n                <div class="veselishki_window_postcards_menu">' + menuHTML + '</div>\n                <div class="veselishki_window_postcards_container">\n                    <div class="veselishki_loading_process_white"></div>\n                </div>\n            </div>';
      appendToContainer(postcards);
      handlePostcardsCategories();
    }
    function loadCards() {
      var url = veselishki.domain + "json.php?ac=o&a=cats";
      new veselishki.Loader({responseType:"json", onLoad:function(event) {
        if (event.currentTarget.status !== 200) {
          return;
        }
        handleCards(event.currentTarget.response);
      }, onError:function(event) {
      }, url:url});
    }
    function handleSurprisesHTML() {
      presentsContainer.querySelectorAll(".veselishki_window_surprises_item").forEach(function(item) {
        var surpriseId = item.getAttribute("data-id");
        var back = item.querySelector(".veselishki_window_surprises_item_back");
        var play = item.querySelector('.veselishki_window_surprises_item_button[data-type="play"]');
        back.addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          onSelect({initiator:event.currentTarget, section:"surprise", presentId:surpriseId, presentType:15, presentPrivate:isPrivate(), postNote:true});
        });
        play.addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          item.classList.add("___loading");
          veselishki.surprise.play(surpriseId, function(result) {
            item.classList.remove("___loading");
          });
        });
        veselishki.imageLoader(back.getAttribute("data-image"), function(image, src) {
          back.style.backgroundImage = "url(" + src + ")";
        });
      });
    }
    function handlerSurprisesData(data) {
      if (!data || !Array.isArray(data)) {
        return;
      }
      var surprises = "";
      data.forEach(function(item) {
        surprises += '<div data-id="' + item.id + '" class="veselishki_window_surprises_item">\n                    <div data-image="' + item.image + '" class="veselishki_window_surprises_item_back">\n                        <div class="veselishki_dialog_button_send_free"></div>\n                    </div>\n                    <div class="veselishki_window_surprises_item_label">' + item.name + '</div>\n                    <div class="veselishki_window_surprises_item_buttons">\n                        <div data-type="play" data-id="' + 
        item.id + '" class="veselishki_window_surprises_item_button">\n                            <div class="veselishki_window_surprises_icon_play"></div>\n                            <div style="margin-left: 5px">\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u0442\u044c</div>\n                        </div>\n                    </div>\n                    <div class="surprise_present_box_loading"></div>\n                </div>';
      });
      var html = '<div class="veselishki_window_surprises">\n                   ' + surprises + "\n            </div>";
      appendToContainer(html);
      handleSurprisesHTML();
    }
    function loadSurprises() {
      var url = veselishki.domain + "/mob/test/get.php?t=15&u=" + veselishki.userID;
      new veselishki.Loader({responseType:"json", onLoad:function(event) {
        if (event.currentTarget.status !== 200) {
          return;
        }
        handlerSurprisesData(event.currentTarget.response);
      }, onError:function(event) {
      }, url:url});
    }
    function displayGIFs() {
      var container = windowPresents.querySelector(".veselishki_window_presents_content");
      var content = '<div class="veselishki_window_gifs">\n                <div class="veselishki_window_gifs_search_bar">\n                    <input placeholder="" type="text" class="veselishki_window_gifs_search_bar_input">\n                    <div class="veselishki_window_gifs_search_bar_auto_compete ___hidden">\n                    </div>\n                    <div class="veselishki_window_gifs_search_bar_find"></div>\n                    <div class="veselishki_window_gifs_search_bar_loading ___hidden"></div>\n                </div>\n                <div class="veselishki_window_gifs_list">\n                    <div class="veselishki_window_gifs_list_scroll">\n                        <div class="veselishki_window_gifs_list_cont">\n                            <div class="column"></div>\n                            <div class="column"></div>\n                            <div class="column"></div>\n                            <div class="column"></div>\n                        </div>\n                    </div>\n                </div>\n            </div>';
      container.innerHTML = content;
      var input = container.querySelector(".veselishki_window_gifs_search_bar_input");
      var autComplete = container.querySelector(".veselishki_window_gifs_search_bar_auto_compete");
      var buttonFind = container.querySelector(".veselishki_window_gifs_search_bar_find");
      var iconLoading = container.querySelector(".veselishki_window_gifs_search_bar_loading");
      var list = container.querySelector(".veselishki_window_gifs_list_scroll");
      var question = null;
      var position = null;
      var loadedCount = 0;
      function releaseItem(item) {
        (function() {
          var loading = item.querySelector(".veselishki_loading_process_white_mini");
          if (!loading) {
            return;
          }
          loading.remove();
        })();
      }
      function mouseEnter(event) {
        debug("video mouse enter");
        event.stopPropagation();
        event.preventDefault();
        var item = event.currentTarget;
        var video = item.querySelector("video.veselishki_window_gifs_list_video");
        item.setAttribute("data-mouse-enter", "");
        if (item.hasAttribute("data-loaded")) {
          video.play();
        } else {
          if (item.hasAttribute("data-loading")) {
            item.insertAdjacentHTML("beforeend", '<div class="veselishki_loading_process_white_mini"></div>');
          } else {
            item.insertAdjacentHTML("beforeend", '<div class="veselishki_loading_process_white_mini"></div>');
            item.setAttribute("data-loading", "");
            veselishki.Loader({responseType:"blob", onLoad:function(event) {
              item.removeAttribute("data-loading");
              item.setAttribute("data-loaded", "");
              if (item.hasAttribute("data-mouse-enter")) {
                releaseItem(item);
                video.play();
              }
            }, onError:function(event) {
              item.removeAttribute("data-loading");
            }, url:item.getAttribute("data-video-src")});
          }
        }
      }
      function mouseLeave(event) {
        debug("video mouse leave");
        event.stopPropagation();
        event.preventDefault();
        var item = event.currentTarget;
        var video = item.querySelector("video.veselishki_window_gifs_list_video");
        releaseItem(item);
        item.removeAttribute("data-mouse-enter");
        video.pause();
        video.currentTime = 0;
      }
      function mouseClick(event) {
        event.stopPropagation();
        event.preventDefault();
        onSelect({initiator:event.currentTarget, section:"gif", presentId:event.currentTarget.getAttribute("data-send"), presentType:175, presentPrivate:isPrivate(), postNote:true, noteURL:event.currentTarget.getAttribute("data-video-src")});
      }
      function clearItems() {
        loadedCount = 0;
        container.querySelectorAll(".veselishki_window_gifs_list .column").forEach(function(col) {
          return col.innerHTML = "";
        });
        list.insertAdjacentHTML("beforeend", veselishki.getLoadingProcessWhite());
      }
      function appendItems(itemsData) {
        var createdTime = Date.now();
        var columns = container.querySelectorAll(".veselishki_window_gifs_list .column");
        var loadingProcess = list.querySelector(".veselishki_loading_process_white");
        var resultEmpty = list.querySelector(".veselishki_result_empty");
        if (loadingProcess) {
          loadingProcess.remove();
        }
        if (resultEmpty) {
          resultEmpty.remove();
        }
        if (columns.length === 0) {
          return;
        }
        if (itemsData.length === 0 && loadedCount === 0) {
          list.insertAdjacentHTML("beforeend", veselishki.getResultEmpty());
          return;
        }
        for (var i = 0, l = itemsData.length;i < l;i++) {
          var column = columns[0];
          var columnHeight = column.clientHeight;
          for (var c = 1, cl = columns.length;c < cl;c++) {
            if (columns[c].clientHeight < columnHeight) {
              column = columns[c];
              columnHeight = column.clientHeight;
            }
          }
          var mediaSmall = itemsData[i]["media"][0]["nanomp4"];
          var mediaBig = itemsData[i]["media"][0]["mp4"];
          var poster = mediaSmall["preview"];
          var source = mediaSmall["url"];
          var html = '<div data-created-time="' + createdTime + '" data-video-poster="' + poster + '" data-video-src="' + source + '" data-send="' + mediaBig["url"] + '" class="veselishki_window_gifs_list_item">\n                        <video poster="' + poster + '" src="' + source + '" preload="none" loop muted class="veselishki_window_gifs_list_video"></video>\n                        <div class="veselishki_overflow_child"></div>\n                    </div>';
          column.insertAdjacentHTML("beforeend", html);
          column.getBoundingClientRect();
        }
        container.querySelectorAll('[data-created-time="' + createdTime + '"]').forEach(function(item) {
          item.addEventListener("mouseenter", mouseEnter);
          item.addEventListener("mouseleave", mouseLeave);
          item.addEventListener("click", mouseClick);
        });
        loadedCount += itemsData.length;
      }
      function loadNext(force, nextPage) {
        if (!force && !position) {
          return;
        }
        if (force) {
          clearItems();
        }
        var next = position;
        position = null;
        function onLoad(result) {
          buttonFind.classList.remove("___hidden");
          iconLoading.classList.add("___hidden");
          if (!result) {
            return clearItems();
          }
          if (!result["next"] || result["next"] === "0") {
            position = null;
          } else {
            position = result["next"];
          }
          appendItems(result.results);
          if (force && nextPage && nextPage > 0) {
            loadNext(false, nextPage - 1);
          }
        }
        if (question) {
          buttonFind.classList.add("___hidden");
          iconLoading.classList.remove("___hidden");
          veselishki.loaders.tenor.byPhrase(question, 20, next, onLoad);
        } else {
          veselishki.loaders.tenor.trending(20, next, onLoad);
        }
      }
      function selectedWordAutoComplete(event) {
        event.stopPropagation();
        event.preventDefault();
        var item = event.currentTarget;
        question = item.getAttribute("data-word");
        position = null;
        input.value = question;
        autComplete.innerText = "";
        loadNext(true, 2);
      }
      function handleAutoComplete(data) {
        autComplete.innerText = "";
        autComplete.classList.add("___hidden");
        if (!data || !data.results) {
          return;
        }
        var html = "";
        data.results.forEach(function(word) {
          html += '<div data-word="' + word + '" class="veselishki_window_gifs_search_bar_auto_compete_item">' + word + "</div>";
        });
        autComplete.classList.remove("___hidden");
        autComplete.insertAdjacentHTML("beforeend", html);
        autComplete.querySelectorAll(".veselishki_window_gifs_search_bar_auto_compete_item").forEach(function(item) {
          item.addEventListener("click", selectedWordAutoComplete);
        });
      }
      function loadAutoComplete(text) {
        if (!text || text.trim() === "") {
          handleAutoComplete(null);
        } else {
          veselishki.loaders.tenor.autoComplete(text.trim(), 5, handleAutoComplete);
        }
      }
      function findByWord() {
        if (input.value === "") {
          return;
        }
        question = input.value;
        position = 0;
        handleAutoComplete(null);
        loadNext(true, 2);
      }
      input.setAttribute("placeholder", function() {
        if (!veselishki.config) {
          return "";
        }
        if (!veselishki.config.tenorExamples) {
          return "";
        }
        if (veselishki.config.tenorExamples.length === 0) {
          return "";
        }
        return veselishki.config.tenorExamples.randomItem();
      }());
      input.addEventListener("input", function() {
        var timeoutId = 0;
        return function(event) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(loadAutoComplete.bind(loadAutoComplete, input.value), 200);
        };
      }());
      input.addEventListener("keydown", function(event) {
        switch(event.keyCode) {
          case 13:
          ;
          case 27:
            event.stopPropagation();
            event.preventDefault();
            break;
        }
      });
      input.addEventListener("keyup", function(event) {
        switch(event.keyCode) {
          case 13:
            event.stopPropagation();
            event.preventDefault();
            findByWord();
            break;
          case 27:
            event.stopPropagation();
            event.preventDefault();
            input.value = "";
            question = null;
            position = 0;
            loadNext(true, 2);
            break;
        }
      });
      buttonFind.addEventListener("click", function(event) {
        findByWord();
      });
      list.addEventListener("scroll", function(event) {
        debug(list.scrollHeight - list.clientHeight - list.scrollTop, Math.min(list.clientHeight / 3, 500));
        if (list.scrollHeight - list.clientHeight - list.scrollTop < Math.min(list.clientHeight / 2, 500)) {
          loadNext();
        }
      });
      loadNext(true, 2);
    }
    var btnActive = veselishki.makeClass("veselishki_window_presents_header_nav_btn_active");
    var btnSimple = veselishki.makeClass("veselishki_window_presents_header_nav_btn");
    var labelId = veselishki.getCustomDomId();
    var privatePresent = function() {
      if (!usePrivatePresent) {
        return "";
      }
      return '<div class="' + veselishki.makeClass("veselishki_window_presents_private") + '">\n                        <input id="' + labelId + '" type="checkbox" class="' + veselishki.makeClass("veselishki_window_presents_private_checkbox") + '"><label for="' + labelId + '" class="' + veselishki.makeClass("veselishki_window_presents_private_label") + '">\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u043f\u0440\u0438\u0432\u0430\u0442\u043d\u043e</label>\n                    </div>';
    }();
    var cornerLeft = function() {
      switch(sectionType) {
        case "present":
          return "61px";
        case "postcard":
          return "102px";
        case "surprise":
          return "143px";
        case "gif":
          return "183px";
      }
    }();
    var sectionsHTML = function() {
      var html = "";
      if (sections.present) {
        html += '<div data-section="present" class="' + (sectionType === "present" ? btnActive : btnSimple) + '">\u041f\u043e\u0434\u0430\u0440\u043a\u0438</div>';
      }
      if (sections.postcard) {
        html += '<div data-section="postcard" class="' + (sectionType === "postcard" ? btnActive : btnSimple) + '">\u041e\u0442\u043a\u0440\u044b\u0442\u043a\u0438</div>';
      }
      if (sections.surprise) {
        html += '<div data-section="surprise" class="' + (sectionType === "surprise" ? btnActive : btnSimple) + '">\u0421\u044e\u0440\u043f\u0440\u0438\u0437\u044b</div>';
      }
      if (sections.gif) {
        html += '<div data-section="gif" class="' + (sectionType === "gif" ? btnActive : btnSimple) + '">\u0413\u0438\u0444\u043a\u0438</div>';
      }
      return html;
    }();
    var content = function() {
      return '<div class="' + veselishki.makeClass("veselishki_window_presents") + '">\n                <div class="' + veselishki.makeClass("veselishki_window_presents_header_nav") + '">\n                    ' + sectionsHTML + "\n                    " + privatePresent + '\n                </div>\n                <div class="' + veselishki.makeClass("veselishki_window_presents_content") + '">\n                    <div class="' + veselishki.makeClass("veselishki_loading_process_white") + '"></div>\n                </div>\n                <div style="left: ' + 
      cornerLeft + ';" class="' + veselishki.makeClass("veselishki_dialog_popup_corner") + '"></div>\n            </div>';
    }();
    windowPresents = veselishki.makeDomElement(content);
    presentsContainer = windowPresents.querySelector("." + veselishki.makeClass("veselishki_window_presents_content"));
    checkBoxPrivate = windowPresents.querySelector("#" + labelId);
    windowPresents.querySelectorAll("." + veselishki.makeClass("veselishki_window_presents_header_nav_btn")).forEach(function(button) {
      button.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        onChangeSection(button.getAttribute("data-section"));
      });
    });
    switch(sectionType) {
      case "present":
        loadPresents();
        break;
      case "postcard":
        loadCards();
        break;
      case "surprise":
        loadSurprises();
        break;
      case "gif":
        displayGIFs("");
        break;
      default:
        console.log("Unknown section to load!");
    }
    return windowPresents;
  }, addStickersButtonToContainer:function(container, onAction, usePrivatePresent, sections) {
    var stickers = veselishki.getStickersButtons(function(data) {
      function showStickersWindow(widjet) {
        debug("show stickers window");
        var overflow = veselishki.getOverflowElement();
        var stickersWindow = veselishki.stickersWindow.get();
        function hide() {
          widjet.removeChild(overflow);
          widjet.removeChild(stickersWindow);
        }
        overflow.addEventListener("click", hide);
        veselishki.stickersWindow.onAction(function(data) {
          hide();
          onAction({widget:widjet, initiator:data.element, section:"sticker", presentId:data.image, presentType:444, presentPrivate:true, postNote:false});
        });
        widjet.appendChild(overflow);
        widjet.appendChild(stickersWindow);
        veselishki.stickersWindow.init();
      }
      function showPresents(widget, type) {
        var overflow = veselishki.getOverflowElement();
        var windowPresents = veselishki.getWindowSelectPresent(function(data) {
          data.widget = widget;
          hide();
          onAction(data);
        }, type, function(newSection) {
          hide();
          showPresents(widget, newSection);
        }, usePrivatePresent, sections);
        function hide() {
          overflow.parentNode.removeChild(overflow);
          windowPresents.parentNode.removeChild(windowPresents);
        }
        overflow.addEventListener("click", function(event) {
          event.stopPropagation();
          event.preventDefault();
          hide();
        });
        var boundsElement = function() {
          return window.document.querySelector("#msg_layer_wrapper:not(.invisible) .chat_cnt_w") || function() {
            var top = window.document.querySelector(".topPanel.topPanel_d");
            if (!top || top.style.display === "none") {
              return null;
            }
            return window.document.querySelector(".mdialog_chat_window");
          }();
        }();
        var chatWrite = function() {
          if (!boundsElement) {
            return null;
          }
          return boundsElement.querySelector(".chat_write") || boundsElement.querySelector(".mdialog_chat_add-comment");
        }();
        var boundsRect = boundsElement ? boundsElement.getBoundingClientRect() : null;
        var chatRect = chatWrite ? chatWrite.getBoundingClientRect() : null;
        var height = (boundsRect ? boundsRect.height : 710) - (chatRect ? chatRect.height : 0) - 20;
        var windowRect = {left:"0px", bottom:"50px", width:"100%", height:height + "px"};
        windowPresents.style.left = windowRect.left;
        windowPresents.style.bottom = windowRect.bottom;
        windowPresents.style.width = windowRect.width;
        windowPresents.style.height = windowRect.height;
        data.widget.appendChild(overflow);
        data.widget.appendChild(windowPresents);
      }
      switch(data.type) {
        case "sticker":
          showStickersWindow(data.widget);
          break;
        case "present":
        ;
        case "postcard":
        ;
        case "surprise":
        ;
        case "gif":
          showPresents(data.widget, data.type);
          break;
        case "fast":
          onAction(data);
          break;
      }
    }, sections);
    container.insertBefore(stickers.widget, container.children[0]);
    stickers.resize();
  }});
  veselishki = Object.assign(veselishki, {stickersWindow:function() {
    var log = debug.bind(debug, "stickers window:");
    var HTML = {loading:function() {
      return '<div class="veselishki_loading_process_white" style="min-height: 200px"></div>';
    }, window:function(content) {
      return '<div class="veselishki_stickers_window">\n                    <div class="veselishki_stickers_window_corner"></div>\n                    <div data-type="stickers-window-content" class="veselishki_stickers_window_content">' + content + "</div>\n                </div>";
    }, page:function(type, value, content) {
      return "<div data-type=" + type + ' data-value="' + value + '" class="veselishki_stickers_window_page">' + content + "</div>";
    }, pageContainer:function(type, value, content) {
      return '<div data-type="' + type + '" data-value="' + value + '" class="veselishki_stickers_page_container">' + content + "</div>";
    }, mainHeaderItem:function(value, content) {
      return '<div data-type="main-header" data-value="' + value + '" class="veselishki_stickers_main_header_item">' + content + "</div>";
    }, mainHeader:function(content) {
      return '<div class="veselishki_stickers_main_header">' + content + "</div>";
    }, mainContent:function(content) {
      return '<div class="veselishki_stickers_main_content">' + content + "</div>";
    }, stickersPage:function(pack, title, loaded, content) {
      return '<div data-type="stickers-page" data-pack="' + pack + '" data-loaded="' + loaded + '" class="veselishki_stickers_page">\n                            <div data-type="title" class="veselishki_stickers_page_title">' + title + '</div>\n                            <div data-type="content" class="veselishki_stickers_page_content">\n                                <div data-type="content-list" class="veselishki_stickers_page_content_list">' + content + "</div>\n                            </div>\n                        </div>";
    }, pageSticker:function(image) {
      return '<div data-type="item-sticker"\n                             data-image="' + image + '"\n                             class="veselishki_stickers_page_item">\n                                <div data-type="child"\n                                     class="veselishki_stickers_page_item_image"\n                                     style="background-image: url(' + image + ')"></div>\n                             </div>';
    }, stickersNavigationItem:function(pack, cover, isNew) {
      return '<div data-type="navigation-stickers-item" \n                             data-pack="' + pack + '" \n                             style="background-image: url(' + cover + ')"\n                             class="veselishki_stickers_page_nav_item">\n                                ' + (isNew ? '<div class="veselishki_stickers_pack_item_new"></div>' : "") + "\n                        </div>";
    }, stickersNavigationItemLast:function() {
      return '<div data-type="navigation-stickers-item" data-pack="last" class="veselishki_stickers_page_nav_item veselishki_stickers_page_nav_item_last"></div>';
    }, stickersNavigationContainer:function(content) {
      return '<div data-type="navigation-stickers-container" data-position="0" class="veselishki_stickers_page_nav_container">' + content + "</div>";
    }, stickersNavigationBar:function(content) {
      return '<div data-type="navigation-stickers-bar" class="veselishki_stickers_page_nav_bar">' + content + '\n                    <div data-type="navigation-stickers-arrow" data-value="left" class="veselishki_stickers_page_nav_item veselishki_stickers_page_nav_left"></div>\n                    <div data-type="navigation-stickers-arrow" data-value="right" class="veselishki_stickers_page_nav_item veselishki_stickers_page_nav_right"></div>\n                </div>';
    }, stickerPackAddButton:function() {
      return '<div data-type="stickers-pack-add" class="veselishki_stickers_pack_add"></div>';
    }, packsInstalledItem:function(pack, cover, name) {
      return '<div data-type="packs-installed-item" data-pack="' + pack + '" class="veselishki_stickers_pack_item">\n                    <div class="veselishki_stickers_pack_item_cover" style="background-image: url(' + cover + ')"></div>\n                    <div class="veselishki_stickers_pack_item_title">' + name + '</div>\n                    <div data-type="packs-installed-item-hide" data-pack="' + pack + '" class="veselishki_stickers_pack_item_hide">\u0421\u043a\u0440\u044b\u0442\u044c</div>\n                </div>';
    }, packsInstalled:function(count, packs) {
      return '<div data-type="packs-installed" class="veselishki_stickers_packs">\n                    <div class="veselishki_stickers_packs_container">\n                        <div data-type="packs-installed-content" class="veselishki_stickers_packs_content">\n                            <div data-type="packs-installed-to-new" class="veselishki_stickers_packs_nav_button">\n                                <div class="veselishki_stickers_packs_nav_arrow ___veselishki_stickers_arrow_left"></div>\n                                <span data-type="child">\u041d\u043e\u0432\u044b\u0435</span>\n                            </div>\n                            <div data-type="packs-installed-title" class="veselishki_stickers_packs_title">\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044b\u0435 ' + 
      count + '</div>\n                            <div data-type="packs-installed-list" class="veselishki_stickers_packs_list">' + packs + "</div>\n                        </div>\n                    </div>\n                </div>";
    }, packsNewItem:function(pack, cover, title, count, isNew) {
      return '<div data-type="pack-selected-new" data-pack="' + pack + '" data-title="' + title + '" data-count="' + count + '" data-new="' + isNew + '" class="veselishki_stickers_pack_item ___cursor_pointer">\n                    <div data-type="child" class="veselishki_stickers_pack_item_cover" style="background-image: url(' + cover + ')"></div>\n                    <div data-type="child" class="veselishki_stickers_pack_item_title">' + title + '</div>\n                    <div data-type="child" class="veselishki_stickers_pack_item_count">' + 
      count + "</div>\n                    " + (isNew ? '<div class="veselishki_stickers_pack_item_new ___veselishki_label">\u041d\u043e\u0432\u0438\u043d\u043a\u0430!</div>' : "") + "\n                </div>";
    }, packsNew:function(count, packs) {
      return '<div data-type="packs-new" class="veselishki_stickers_packs">\n                    <div class="veselishki_stickers_packs_container">\n                        <div data-type="packs-new-content" class="veselishki_stickers_packs_content">\n                            <div data-type="packs-new-to-installed" class="veselishki_stickers_packs_nav_button veselishki_stickers_packs_nav_button_invert">\n                                <div class="veselishki_stickers_packs_nav_arrow ___veselishki_stickers_arrow_rigth"></div>\n                                <span>\u0423\u0441\u0442\u0430\u043d\u043e\u0432\u043b\u0435\u043d\u043d\u044b\u0435</span>\n                            </div>\n                            <div data-type="packs-new-title" class="veselishki_stickers_packs_title">\u041d\u0430\u0431\u043e\u0440\u044b ' + 
      count + '</div>\n                            <div data-type="packs-new-list" class="veselishki_stickers_packs_list">' + packs + "</div>\n                        </div>\n                    </div>\n                </div>";
    }, packSelectedListItem:function(image) {
      return '<div class="veselishki_stickers_pack_selected_list_item" style="background-image: url(' + image + ')"></div>';
    }, packSelectedList:function(pack, title, count, content) {
      return '<div class="veselishki_stickers_pack_selected_list">\n                    <div class="veselishki_stickers_pack_selected_list_title">\n                        <span>' + title + '</span>\n                        <span style="color: #a7a7a7; margin-left: 5px">' + count + ' \u0441\u0442\u0438\u043a\u0435\u0440\u0430</span>\n                        <div data-type="pack-selected-window-close" class="veselishki_stickers_pack_selected_list_close"></div>\n                    </div>\n                    <div class="veselishki_stickers_pack_selected_list_container">\n                        <div data-type="pack-selected-list-content" class="veselishki_stickers_pack_selected_list_content">' + 
      content + '</div>\n                    </div>\n                    <div class="veselishki_stickers_pack_selected_list_nav">\n                        <div data-type="pack-selected-list-add" data-pack="' + pack + '" class="veselishki_stickers_pack_selected_list_add">\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u043a \u0441\u0435\u0431\u0435</div>\n                        <div data-type="pack-selected-list-added" class="veselishki_stickers_pack_selected_list_added" style="display: none;">\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e</div>\n                    </div>\n                </div>';
    }, packSelected:function(content) {
      return '<div data-type="pack-selected-popup-window" class="veselishki_stickers_pack_selected_window">\n                    <div class="veselishki_stickers_pack_selected_back"></div>\n                    <div class="veselishki_stickers_pack_selected_container">' + content + "</div>\n                </div>";
    }};
    var stickersWindowHTML = HTML.window('<div class="veselishki_loading_process_white"></div>');
    var stickersWindow = veselishki.makeDomElement(stickersWindowHTML);
    var actionOnSelect = function() {
    };
    var USER_PACKS_KEY = "stkrs_stikers_installed_packs";
    var ALL_PACKS_KEY = "stkrs_stikers_all_packs";
    var ALL_PACKS_TIME_KEY = "stkrs_stikers_time_last_check";
    var USER_LAST_KEY = "stkrs_stikers_last_used";
    var tempSelectedPackId = null;
    var tempLoadedPacksItems = null;
    function makePacksNew(packs) {
      var html = "";
      for (var i = 0, l = packs.length;i < l;i++) {
        html += HTML.packsNewItem(packs[i]["id"], packs[i]["cover"], packs[i]["title"], packs[i]["count"], packs[i]["new"] === "1");
      }
      return HTML.packsNew(packs.length, html);
    }
    function makePacksInstalled(installed) {
      var html = "";
      for (var i = 0, l = installed.length;i < l;i++) {
        html += HTML.packsInstalledItem(installed[i]["id"], installed[i]["cover"], installed[i]["title"]);
      }
      return HTML.packsInstalled(installed.length, html);
    }
    function makePacksSectionPages(installed, all) {
      var newPacks = all.filter(function(p) {
        for (var i = 0, l = installed.length;i < l;i++) {
          if (installed[i]["id"] === p["id"]) {
            return false;
          }
        }
        return true;
      });
      var packsInstalled = makePacksInstalled(installed);
      var packsNew = makePacksNew(newPacks);
      return packsInstalled + packsNew;
    }
    function makePacksSection(installed, all) {
      var pages = makePacksSectionPages(installed, all);
      var container = HTML.pageContainer("container-packs-main", "packs-main", pages);
      return container;
    }
    function addStickerToLast(image) {
      veselishki.getData(USER_LAST_KEY, function(last) {
        last = veselishki.JSONParse(last) || [];
        last = last.filter(function(cur) {
          return cur !== image;
        });
        last.unshift(image);
        last = last.slice(0, 40);
        veselishki.setData(USER_LAST_KEY, JSON.stringify(last));
        makeStickersWindowContent();
      });
    }
    function handleClickElement(element) {
      if (!element) {
        return;
      }
      if (!element.getAttribute("data-type")) {
        return;
      }
      if (element.getAttribute("data-type") === "child") {
        return handleClickElement(element.parentNode);
      }
      var type = element.getAttribute("data-type");
      if (type === "main-header") {
        stickersWindow.querySelectorAll(".veselishki_stickers_main_header_item_active").forEach(function(el) {
          return el.classList.remove("veselishki_stickers_main_header_item_active");
        });
        var value = element.getAttribute("data-value");
        var container = stickersWindow.querySelector('[data-type="container-main"]');
        var position = "0px";
        if (value === "stickers") {
          position = "0%";
        } else {
          if (value === "packs") {
            position = "-100%";
          }
        }
        container.style.left = position;
        element.classList.add("veselishki_stickers_main_header_item_active");
        return;
      }
      if (type === "item-sticker") {
        var id = element.getAttribute("data-id");
        var pack = element.getAttribute("data-pack");
        var image = element.getAttribute("data-image");
        log("selected sticker %" + id + " pack " + pack + " image " + image);
        addStickerToLast(image);
        actionOnSelect({element:element, image:image});
        return;
      }
      if (type === "navigation-stickers-item") {
        var pack$41 = element.getAttribute("data-pack");
        var stickersPage = stickersWindow.querySelector('[data-type="stickers-page"][data-pack="' + pack$41 + '"]');
        var stickersPagesContainer = stickersWindow.querySelector('[data-value="stickers-pages"]');
        var position$42 = function() {
          for (var i = 0, l = stickersPagesContainer.children.length;i < l;i++) {
            if (stickersPagesContainer.children[i] === stickersPage) {
              return i;
            }
          }
          return -1;
        }();
        if (position$42 < 0) {
          return;
        }
        stickersPagesContainer.style.left = "-" + position$42 * 100 + "%";
        stickersWindow.querySelectorAll(".veselishki_stickers_page_nav_item_active").forEach(function(el) {
          return el.classList.remove("veselishki_stickers_page_nav_item_active");
        });
        element.classList.add("veselishki_stickers_page_nav_item_active");
        return;
      }
      if (type === "stickers-pack-add") {
        handleClickElement(stickersWindow.querySelector('[data-type="main-header"][data-value="packs"]'));
        handleClickElement(stickersWindow.querySelector('[data-type="packs-installed-to-new"]'));
        return;
      }
      if (type === "navigation-stickers-arrow") {
        var value$43 = element.getAttribute("data-value");
        var direction = value$43 === "left" ? 1 : -1;
        var viewport = stickersWindow.querySelector('[data-type="navigation-stickers-bar"]');
        var container$44 = stickersWindow.querySelector('[data-type="navigation-stickers-container"]');
        var position$45 = parseInt(container$44.getAttribute("data-position")) + direction;
        var viewportRect = viewport.getBoundingClientRect();
        var containerRect = container$44.getBoundingClientRect();
        var indent = position$45 * 45;
        var buttonLeft = stickersWindow.querySelector('[data-type="navigation-stickers-arrow"][data-value="left"]');
        var buttonRight = stickersWindow.querySelector('[data-type="navigation-stickers-arrow"][data-value="right"]');
        if (indent > 0) {
          indent = 0;
          position$45 = 0;
        } else {
          if (Math.abs(indent) > containerRect.width - viewportRect.width) {
            indent = -(containerRect.width - viewportRect.width);
            position$45 = (containerRect.width - viewportRect.width) / 45;
          }
        }
        container$44.style.left = indent + "px";
        container$44.setAttribute("data-position", position$45.toString());
        if (indent >= 0 && buttonLeft.style.display !== "none") {
          buttonLeft.style.display = "none";
        } else {
          if (indent < 0 && buttonLeft.style.display === "none") {
            buttonLeft.style.display = "inline-block";
          }
        }
        if (containerRect.width - viewportRect.width + indent <= 0 && buttonRight.style.display !== "none") {
          buttonRight.style.display = "none";
        } else {
          if (containerRect.width - viewportRect.width + indent > 0 && buttonRight.style.display === "none") {
            buttonRight.style.display = "inline-block";
          }
        }
        return;
      }
      if (type === "packs-installed-to-new") {
        stickersWindow.querySelector('[data-type="container-packs-main"]').style.left = "-100%";
        return;
      }
      if (type === "packs-new-to-installed") {
        stickersWindow.querySelector('[data-type="container-packs-main"]').style.left = "0";
        return;
      }
      if (type === "pack-selected-new") {
        var packId = element.getAttribute("data-pack");
        var packTitle = element.getAttribute("data-title");
        var packCount = element.getAttribute("data-count");
        var packList = HTML.packSelectedList(packId, packTitle, packCount, HTML.loading());
        var popupWindow = HTML.packSelected(packList);
        var popupWindowElement = veselishki.makeDomElement(popupWindow);
        var packListContent = popupWindowElement.querySelector('[data-type="pack-selected-list-content"]');
        var url = veselishki.domain + "json.php?ac=stp&pack=" + packId;
        tempSelectedPackId = packId;
        new veselishki.Loader({responseType:"json", onLoad:function(event) {
          if (event.currentTarget.status !== 200) {
            debug("loading pack data error");
            return;
          }
          var data = event.currentTarget.response;
          var items = "";
          for (var i = 0, l = data.length;i < l;i++) {
            items += HTML.packSelectedListItem(data[i]);
          }
          packListContent.innerHTML = items;
          tempLoadedPacksItems = data;
        }, onError:function(event) {
          debug("loading pack data error");
        }, url:url});
        window.document.body.appendChild(popupWindowElement);
        popupWindowElement.addEventListener("click", handleClick);
        return;
      }
      if (type === "pack-selected-window-close") {
        tempSelectedPackId = null;
        tempLoadedPacksItems = null;
        window.document.querySelectorAll('[data-type="pack-selected-popup-window"]').forEach(function(popup) {
          popup.removeEventListener("click", handleClick);
          window.document.body.removeChild(popup);
        });
        return;
      }
      if (type === "pack-selected-list-add") {
        if (!tempLoadedPacksItems) {
          log("error: try to add not loaded pack");
          return;
        }
        var packId$46 = element.getAttribute("data-pack");
        if (packId$46 !== tempSelectedPackId) {
          log("error: try to add different packs");
          return;
        }
        getAllPacks(function(all) {
          for (var i = 0, l = all.length;i < l;i++) {
            if (all[i]["id"] === packId$46) {
              var buttonAdd = window.document.querySelector('[data-type="pack-selected-list-add"]');
              var buttonAdded = window.document.querySelector('[data-type="pack-selected-list-added"]');
              updateInstalledPacksData(Object.assign({stickers:tempLoadedPacksItems}, all[i]), true);
              buttonAdd.style.display = "none";
              buttonAdded.style.display = "flex";
              setTimeout(function() {
                handleClickElement(window.document.body.querySelector('[data-type="pack-selected-window-close"]'));
              }, 1E3);
              return;
            }
          }
        });
        return;
      }
      if (type === "packs-installed-item-hide") {
        var packId$47 = element.getAttribute("data-pack");
        updateInstalledPacksData({id:packId$47});
        return;
      }
      console.log(type);
    }
    function handleClick(event) {
      handleClickElement(event.target);
    }
    function getAllPacks(onResult) {
      veselishki.getData(ALL_PACKS_KEY, function(data) {
        return onResult(veselishki.JSONParse(data));
      });
    }
    function setAllPacks(packs) {
      veselishki.setData(ALL_PACKS_KEY, JSON.stringify(packs));
      veselishki.setData(ALL_PACKS_TIME_KEY, Date.now());
    }
    function getInstalledPacks(onResult) {
      veselishki.getData(USER_PACKS_KEY, function(data) {
        return onResult(veselishki.JSONParse(data));
      });
    }
    function setInstalledPacks(packs) {
      veselishki.setData(USER_PACKS_KEY, JSON.stringify(packs));
    }
    function updateInstalledPacksData(pack, add) {
      getInstalledPacks(function(packs) {
        packs = packs.filter(function(p) {
          return p["id"] !== pack["id"];
        });
        if (add) {
          packs.unshift(pack);
        }
        setInstalledPacks(packs);
        makeStickersWindowContent(['[data-type="main-header"][data-value="packs"]', '[data-type="packs-new-to-installed"]', '[data-type="navigation-stickers-arrow"][data-value="left"]', '[data-type="navigation-stickers-item"]']);
      });
    }
    function makeStickersNavigation(packs, last) {
      var stickers = last.length === 0 ? "" : HTML.stickersNavigationItemLast();
      for (var i = 0, l = packs.length;i < l;i++) {
        var pack = packs[i];
        stickers += HTML.stickersNavigationItem(pack["id"], pack["cover"], pack["new"] === "1");
      }
      var container = HTML.stickersNavigationContainer(stickers);
      var bar = HTML.stickersNavigationBar(container);
      return bar;
    }
    function makeStickersList(stickers) {
      var html = "";
      for (var i = 0, l = stickers.length;i < l;i++) {
        html += HTML.pageSticker(stickers[i]);
      }
      return html;
    }
    function makeStickersPages(packs, last) {
      var html = last.length === 0 ? "" : HTML.stickersPage("last", "\u041f\u043e\u0441\u043b\u0435\u0434\u043d\u0438\u0435", 1, makeStickersList(last));
      var $jscomp$loop$55 = {stickers:undefined};
      var i = 0, l = packs.length;
      for (;i < l;$jscomp$loop$55 = {stickers:$jscomp$loop$55.stickers}, i++) {
        var pack = packs[i];
        $jscomp$loop$55.stickers = pack["stickers"];
        var loaded = $jscomp$loop$55.stickers ? 1 : 0;
        var stickersList = function($jscomp$loop$55) {
          return function() {
            if (!$jscomp$loop$55.stickers) {
              return HTML.loading();
            }
            return makeStickersList($jscomp$loop$55.stickers);
          };
        }($jscomp$loop$55)();
        html += HTML.stickersPage(pack["id"], pack["title"], loaded, stickersList);
      }
      return HTML.pageContainer("container-stickers-pages", "stickers-pages", html);
    }
    function makeStickersSection(packs, last) {
      var stickersPages = makeStickersPages(packs, last);
      var stickersNavigation = makeStickersNavigation(packs, last);
      var addButton = HTML.stickerPackAddButton();
      return stickersPages + stickersNavigation + addButton;
    }
    function makeStickersWindowContent(executeElements) {
      executeElements = executeElements === undefined ? [] : executeElements;
      log("make stickers window content");
      function makeWindow(packs, last, all) {
        log("make window");
        var windowContent = stickersWindow.querySelector('[data-type="stickers-window-content"]');
        var stickersSection = makeStickersSection(packs, last);
        var packsSection = makePacksSection(packs, all);
        var mainHeader = function() {
          var buttons = "";
          buttons += HTML.mainHeaderItem("stickers", "\u0421\u0442\u0438\u043a\u0435\u0440\u044b");
          buttons += HTML.mainHeaderItem("packs", "\u041d\u0430\u0431\u043e\u0440\u044b");
          return HTML.mainHeader(buttons);
        }();
        var mainContent = function() {
          var pages = "";
          pages += HTML.page("main-page", "stickers", stickersSection);
          pages += HTML.page("main-page", "packs", packsSection);
          pages = HTML.pageContainer("container-main", "main", pages);
          return HTML.mainContent(pages);
        }();
        windowContent.innerHTML = HTML.page("main", "main", mainHeader + mainContent);
        executeElements.forEach(function(selector) {
          handleClickElement(stickersWindow.querySelector(selector));
        });
      }
      function collectAll(packs, last) {
        log("collect all");
        veselishki.getData(ALL_PACKS_TIME_KEY, function(time) {
          if (!time || Date.now() - parseInt(time) > 1E3 * 60 * 60 * 3) {
            loadAllPacksData(executeElements);
            return;
          }
          getAllPacks(function(allPacks) {
            if (!allPacks) {
              loadAllPacksData(executeElements);
              return;
            }
            makeWindow(packs, last, allPacks);
          });
        });
      }
      function collectLast(packs) {
        log("collect last");
        veselishki.getData(USER_LAST_KEY, function(data) {
          collectAll(packs, veselishki.JSONParse(data) || []);
        });
      }
      function collectPacks() {
        log("collect packs");
        getInstalledPacks(function(data) {
          if (!data) {
            log("stickers data is null");
            return;
          }
          if (data.length === 0) {
            log("stickers data is empty");
            return;
          }
          collectLast(data);
        });
      }
      collectPacks();
    }
    function loadAllPacksData(executeElements) {
      log("load all packs");
      new veselishki.Loader({responseType:"json", onLoad:function(event) {
        if (event.currentTarget.status !== 200) {
          log("loading packs error, status is not 200");
          return;
        }
        if (!event.currentTarget.response) {
          log("loading packs error, response is null");
          return;
        }
        setAllPacks(event.currentTarget.response);
        checkPacks(executeElements);
      }, onError:function(event) {
        log("loading packs error");
      }, url:veselishki.domain + "json.php?ac=stp"});
    }
    function loadDefaultPacksData(executeElements) {
      log("load default packs");
      new veselishki.Loader({responseType:"json", onLoad:function(event) {
        if (event.currentTarget.status !== 200) {
          debug("loading default packs data error");
          return;
        }
        if (!event.currentTarget.response) {
          log("default packs data is null");
          return;
        }
        veselishki.setData(USER_PACKS_KEY, JSON.stringify(event.currentTarget.response));
        checkPacks(executeElements);
      }, onError:function(event) {
        debug("loading default packs data error");
      }, url:veselishki.domain + "json.php?ac=stp&def"});
    }
    function checkPacks(executeElements) {
      log("check packs");
      getInstalledPacks(function(result) {
        if (!result || result.length === 0) {
          return loadDefaultPacksData(executeElements);
        }
        makeStickersWindowContent(executeElements);
      });
    }
    stickersWindow.addEventListener("click", handleClick);
    return {get:function() {
      return stickersWindow;
    }, init:function() {
      checkPacks(['[data-type="main-header"][data-value="stickers"]', '[data-type="navigation-stickers-arrow"][data-value="left"]', '[data-type="navigation-stickers-item"]']);
    }, onAction:function(callback) {
      actionOnSelect = callback || function() {
      };
    }};
  }()});
  veselishki.nameDay = function() {
    var log = debug.bind(debug, "name day:");
    var HTML = {notificationContent:function(friends) {
      var friendsHTML = function() {
        var html = "";
        var showed = function() {
          if (friends.length > 5) {
            return friends.slice(0, 4);
          }
          return friends.slice();
        }();
        showed.forEach(function(fr) {
          var style = fr["img"] ? 'style="background-image: url(' + fr["img"] + ')"' : "";
          var classes = 'class="veselishki_name_day_friend_avatar ' + (fr["img"] ? "" : "___veselishki_no_ava") + '"';
          html += "<div " + classes + " " + style + '>\n                                <a class="veselishki_name_day_friend_avatar_a" href="/profile/' + fr["id"] + '" target="_self"></a>\n                             </div>';
        });
        if (friends.length > 5) {
          html += '<div class="veselishki_name_day_friend_avatar ___veselishki_friends_more">\n                                <a class="veselishki_name_day_friend_avatar_a"></a>\n                             </div>';
        }
        return '<div class="veselishki_name_day_friend_avatar_container">' + html + "</div>";
      }();
      var html = '<div class="veselishki_name_day_friend_notification">\n                <div class="veselishki_name_day_friend_title">\u0421\u0435\u0433\u043e\u0434\u043d\u044f \u0414\u0435\u043d\u044c \u0410\u043d\u0433\u0435\u043b\u0430 \u0443 ' + friends.length + " \u0432\u0430\u0448\u0438\u0445 \u0434\u0440\u0443\u0437\u0435\u0439</div>\n                " + friendsHTML + '\n                <div class="veselishki_name_day_friend_congratulate">\u041f\u043e\u0437\u0434\u0440\u0430\u0432\u0438\u0442\u044c</div>\n            </div>';
      return html;
    }, friendTitle:function() {
      return '<div class="veselishki_name_day_friend_list_title">\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u0430</div>';
    }, friendItem:function(id, image, name, dayName) {
      var avaStyle = image ? 'style="background-image: url(' + image + ')"' : "";
      var avaClasses = 'class="veselishki_name_day_friend_item_image ' + (image ? "" : "___veselishki_no_ava") + '"';
      var dataImage = image ? 'data-image="' + image + '"' : "";
      return '<div class="veselishki_name_day_friend_item">\n                <div ' + avaClasses + " " + avaStyle + '></div>\n                <div class="veselishki_name_day_friend_item_name">' + name + '</div>\n                <div data-type="friend-item" data-id="' + id + '" data-name="' + name + '" ' + dataImage + ' data-day-name="' + dayName + '" class="veselishki_name_day_friend_item_hover"></div>\n            </div>';
    }, selectionPresentHeader:function(name, image) {
      var avaStyle = image ? 'style="background-image: url(' + image + ')"' : "";
      var avaClasses = 'class="veselishki_name_day_present_header_image ' + (image ? "" : "___veselishki_no_ava") + '"';
      return '<div class="veselishki_name_day_present_header">\n                <div ' + avaClasses + " " + avaStyle + '></div>\n                <div class="veselishki_name_day_present_header_label">\n                    <div class="veselishki_name_day_present_header_text">\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u043f\u043e\u0434\u0430\u0440\u043e\u043a \u0434\u043b\u044f ' + name + "</div>\n                </div>\n            </div>";
    }, selectionPresentContainer:function(content) {
      return '<div data-type="presents-list" class="veselishki_name_day_present_list">' + content + "</div>";
    }, selectionPresent:function(friendId, friendName, friendImage, nameDay) {
      return HTML.selectionPresentHeader(friendName, friendImage) + HTML.selectionPresentContainer(veselishki.getLoadingProcessWhite());
    }, selectionPresentContainerItem:function(id, image) {
      return '<div class="veselishki_name_day_present_list_item">\n                <div class="veselishki_name_day_present_list_item_image" style="background-image: url(' + image + ')">\n                    <div data-type="present-item" data-id="' + id + '" data-image="' + image + '" class="veselishki_dialog_button_send_free"></div>\n                </div>\n            </div>';
    }, sectionItem:function(total) {
      return '<li class="mml_cat_li">\n                        <a data-type="name-day-section-item" href="#" class="toolbar-layer_menu_btn">\n                            <span class="tico">\n                                <i class="tico_img ic ic_notif_presents"></i>\u0414\u0435\u043d\u044c \u0410\u043d\u0433\u0435\u043b\u0430</span>\n                            <span class="mml_notif mml_notif__num __on">' + total + '</span>\n                            \x3c!--<span class="mml_notif mml_notif__count">' + 
      total + "</span>--\x3e\n                        </a>\n                    </li>";
    }, giftsEmptyResult:function() {
      return '<div class="veselishki_name_day_present_list_empty">\n                <div class="veselishki_name_day_present_list_empty_icon"></div>\n                <div class="veselishki_name_day_present_list_empty_text">\u041c\u044b \u0438\u0441\u043a\u0430\u043b\u0438-\u0438\u0441\u043a\u0430\u043b\u0438, \u043d\u043e \u0443\u0432\u044b\u2026</div>\n            </div>';
    }};
    var LAST_SHOW_NOTIFY_KEY = "stkr_last_show_notify_name_day";
    var KEY_FRIENDS_NAMES = "stkr_nmds_frnds_0xac4ed";
    var currentFriends = [];
    function sendPresentToFriend(userId, userName, userAvatar, presentId, friends) {
      veselishki.showGlobalLoadingProcess(true);
      veselishki.loadServerPresentData(presentId, 4, function(result) {
        if (!result) {
          log("loading server present id error");
          veselishki.showGlobalLoadingProcess(false);
          return;
        }
        if (!result["id"]) {
          log("getting server present id error");
          veselishki.showGlobalLoadingProcess(false);
          return;
        }
        veselishki.showGlobalLoadingProcess(false);
        veselishki.doRenderPresentOffer2(null, result["id"], 4, userId, userName, userAvatar, function(result) {
          return congratulateFriends(friends);
        });
      });
    }
    function selectPresentsForFriend(friendId, friendName, friendImage, nameDay, friends) {
      var windowBlock = veselishki.makeDomElement(veselishki.getPopupWindowBlock(HTML.selectionPresent(friendId, friendName, friendImage, nameDay)));
      var windowContainer = windowBlock.querySelector('[data-type="window-container"]');
      var presentsList = windowBlock.querySelector('[data-type="presents-list"]');
      function loadPresents() {
        var loader = null;
        var needsLoadNext = false;
        var nextURL = null;
        var currentPage = 0;
        function addPresents(presents) {
          var presentsHTML = "";
          var $jscomp$loop$56 = {present:undefined};
          var i = 0, l = presents.length;
          for (;i < l;$jscomp$loop$56 = {present:$jscomp$loop$56.present}, i++) {
            $jscomp$loop$56.present = presents[i];
            var presentId = $jscomp$loop$56.present.getAttribute("data-pid");
            var presentImage = function($jscomp$loop$56) {
              return function() {
                var e = $jscomp$loop$56.present.querySelector(".gift");
                if (!e) {
                  return;
                }
                var s = e.getAttribute("style");
                if (!s) {
                  return null;
                }
                var r = /background-image: ?url\(([\w\d./?&%=]+)\)/.exec(s);
                if (!r) {
                  return null;
                }
                return r[1];
              };
            }($jscomp$loop$56)();
            presentsHTML += HTML.selectionPresentContainerItem(presentId, presentImage);
          }
          presentsList.insertAdjacentHTML("beforeend", presentsHTML);
        }
        function loadNext() {
          if (!nextURL) {
            log("next url is null");
            return;
          }
          if (loader) {
            log("loading ....");
            needsLoadNext = true;
            return;
          }
          presentsList.insertAdjacentHTML("beforeend", veselishki.getLoadingProcessStrip());
          var loadingProcess = presentsList.querySelector('[data-type="process-loading-strip"]');
          var url = nextURL;
          var params = "st.page=" + (currentPage + 1) + "&fetch=false&gwt.requested=" + window.pageCtx.gwtHash;
          needsLoadNext = false;
          loader = new veselishki.LoaderPOST({onLoad:function(event) {
            loader = null;
            presentsList.removeChild(loadingProcess);
            if (event.currentTarget.status !== 200) {
              log("loading next presents page error, status is not 200");
              return;
            }
            if (!event.currentTarget.response) {
              log("response is empty");
              return;
            }
            var presentDocument = veselishki.makeDomElement(event.currentTarget.response);
            var presentsNew = presentDocument.querySelectorAll(".gift-card");
            currentPage += 1;
            addPresents(presentsNew);
            if (needsLoadNext) {
              loadNext();
            }
          }, onError:function(event) {
            log("loading next presents page error");
            loader = null;
            needsLoadNext = false;
          }, params:params, url:url});
        }
        function loadFirst() {
          var url = "";
          var params = "";
          url += "/dk";
          url += "?cmd=GiftsFrontContentRBx";
          url += "&st.cmd=giftsFront";
          url += "&st.or=NAV_MENU";
          url += "&gwt.requested=" + window.pageCtx.gwtHash;
          params += "gwt.requested=" + window.pageCtx.gwtHash;
          params += "&st.qs=" + nameDay;
          loader = new veselishki.LoaderPOST({onLoad:function(event) {
            loader = null;
            if (event.currentTarget.status !== 200) {
              log("load searching presents error, status is not 200");
              return;
            }
            var presentDocument = veselishki.makeDomElement(event.currentTarget.response);
            var presentsNew = presentDocument.querySelectorAll(".gift-card");
            var nextElement = presentDocument.querySelector('[data-delimiter][data-block="GiftsFrontContentRBx"][data-url]');
            if (nextElement) {
              nextURL = nextElement.getAttribute("data-url");
              currentPage = +nextElement.getAttribute("data-page");
            }
            presentsList.innerHTML = "";
            if (presentsNew.length === 0) {
              presentsList.innerHTML = HTML.giftsEmptyResult();
            } else {
              addPresents(presentsNew);
            }
          }, onError:function(event) {
            loader = null;
            log("load searching presents error");
          }, params:params, url:url});
        }
        loadPresents = loadNext;
        loadFirst();
      }
      function hide() {
        window.document.body.classList.remove("___overflow_off");
        window.document.body.removeChild(windowBlock);
      }
      function show() {
        window.document.body.classList.add("___overflow_off");
        window.document.body.appendChild(windowBlock);
      }
      function handleClick(event) {
        var element = event.target;
        var type = element.getAttribute("data-type");
        if (type === "window-close") {
          hide();
          congratulateFriends(friends);
          return;
        }
        if (type === "present-item") {
          hide();
          sendPresentToFriend(friendId, friendName, friendImage, element.getAttribute("data-id"), friends);
          return;
        }
        log(type);
      }
      function handleScroll(event) {
        if (windowContainer.scrollHeight - windowContainer.clientHeight - windowContainer.scrollTop < windowContainer.clientHeight / 3) {
          loadPresents();
        }
      }
      windowBlock.addEventListener("click", handleClick);
      windowContainer.addEventListener("scroll", handleScroll);
      loadPresents();
      show();
    }
    function congratulateFriends(friends) {
      var friendsItems = function() {
        var html = HTML.friendTitle();
        friends.forEach(function(fr) {
          return html += HTML.friendItem(fr["id"], fr["img"], fr["name"], fr["dayName"]);
        });
        return html;
      }();
      var windowContainer = veselishki.makeDomElement(veselishki.getPopupWindowBlock(friendsItems));
      function hide() {
        document.body.classList.remove("___overflow_off");
        document.body.removeChild(windowContainer);
      }
      function show() {
        document.body.appendChild(windowContainer);
        document.body.classList.add("___overflow_off");
      }
      function handleClick(event) {
        var element = event.target;
        var type = element.getAttribute("data-type");
        if (!type) {
          return;
        }
        if (type === "window-close") {
          hide();
          return;
        }
        if (type === "friend-item") {
          hide();
          selectPresentsForFriend(element.getAttribute("data-id"), element.getAttribute("data-name"), element.getAttribute("data-image"), element.getAttribute("data-day-name"), friends);
          return;
        }
        log(type);
      }
      windowContainer.addEventListener("click", handleClick);
      show();
    }
    function makeNotification(foundFriends) {
      function onShow() {
      }
      function onAction() {
        congratulateFriends(foundFriends);
      }
      function onClose() {
      }
      veselishki.setData(LAST_SHOW_NOTIFY_KEY, Date.now());
      veselishki.notification.add(HTML.notificationContent(foundFriends), onShow, onAction, onClose);
    }
    function loadFriends(names) {
      log("loadFriends");
      function load() {
        log("loadFriends", "loading friends");
        var resultFriends = [];
        var restNames = names.slice();
        function complete() {
          log("loadFriends", "loading friends complete");
          resultFriends = function() {
            var clear = [];
            for (var i = 0;i < resultFriends.length;i++) {
              var friend = resultFriends[i];
              var add = true;
              for (var j = 0;j < clear.length;j++) {
                if (clear[j].id === friend.id) {
                  add = false;
                  break;
                }
              }
              if (add) {
                clear.push(friend);
              }
            }
            return clear;
          }();
          veselishki.setData(KEY_FRIENDS_NAMES, veselishki.JSONStringify({owner:veselishki.userID, time:Date.now(), friends:resultFriends}));
          loadFriends(names);
        }
        function loadName(name) {
          veselishki.loaders.findFriendsByName(name, function(result) {
            if (!result) {
              log("loading friends by name error!");
              return check();
            }
            if (result.length === 0) {
              log("empty");
              return check();
            }
            result.forEach(function(fr) {
              return fr["dayName"] = name;
            });
            resultFriends = resultFriends.concat(result);
            check();
          });
        }
        function check() {
          log("check");
          if (restNames.length === 0) {
            complete();
          } else {
            loadName(restNames.shift());
          }
        }
        check();
      }
      veselishki.getData(KEY_FRIENDS_NAMES, function(json) {
        if (!json) {
          log("loadFriends", "cache data is null");
          load();
          return;
        }
        var data = veselishki.JSONParse(json);
        if (!data) {
          log("loadFriends", "cache data is invalid");
          load();
          return;
        }
        if (!data.owner || data.owner !== veselishki.userID) {
          log("loadFriends", "cache data owner is null or different owners");
          load();
          return;
        }
        if (!data.friends) {
          log("loadFriends", "cache data friends is null");
          load();
          return;
        }
        if (!data.time || Date.now() - parseInt(data.time) > veselishki.date.hToMs(6)) {
          log("loadFriends", "cache data time is null or outdated");
          load();
          return;
        }
        var od = new Date(data.time);
        var cd = new Date;
        if (od.getYear() !== cd.getYear() || od.getMonth() !== cd.getMonth() || od.getDate() !== cd.getDate()) {
          log("loadFriends", "cache data time outdated");
          load();
          return;
        }
        log("loadFriends", "cache data complete");
        if (data.friends.length === 0) {
          log("loadFriends", "friends are empty");
          return;
        }
        currentFriends = data.friends;
        veselishki.getData(LAST_SHOW_NOTIFY_KEY, function(result) {
          if (result && Date.now() - parseInt(result) < veselishki.date.hToMs(3)) {
            return;
          }
          makeNotification(data.friends);
        });
        appendNameDaySectionItem(window.document.querySelector("#ntf_layer_left_menu"));
      });
    }
    function getDayNames() {
      log("get name day");
      veselishki.getDayNames(function(names) {
        loadFriends(names);
      });
    }
    function appendNameDaySectionItem(menu) {
      log("appendNameDaySectionItem");
      if (!currentFriends || currentFriends.length === 0) {
        return;
      }
      if (!menu) {
        return;
      }
      if (menu.querySelector('[data-type="name-day-section-item"]')) {
        return;
      }
      var sectionItem = HTML.sectionItem(currentFriends.length);
      menu.insertAdjacentHTML("beforeend", sectionItem);
      menu.querySelector('[data-type="name-day-section-item"]').addEventListener("click", function(event) {
        event.stopPropagation();
        event.preventDefault();
        congratulateFriends(currentFriends);
      });
    }
    function processChild(element) {
      if (!element) {
        return;
      }
      if (!element.tagName) {
        return;
      }
      if (!element.classList) {
        return;
      }
      if (element.getAttribute("id") === "ntf_layer_left_menu") {
        appendNameDaySectionItem(element);
        return;
      }
      element.childNodes.forEach(processChild);
    }
    function startProcessChild() {
      if (!document || !document.body) {
        return setTimeout(startProcessChild, 500);
      }
      processChild(window.document.body);
      var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mut) {
          return mut.addedNodes.forEach(processChild);
        });
      });
      observer.observe(document.body, {childList:true, subtree:true});
    }
    function onConfig() {
      log("onConfig");
      startProcessChild();
      getDayNames();
    }
    veselishki.onConfig.push(onConfig);
  }();
  veselishki.chatFastGif = function() {
    var log = debug.bind(debug, "chatFastGif:");
    var HTML = {block:function() {
      var html = '<div data-type="block-chat-fast-gif" class="veselishki_chat_fast_gif">\n                <div class="veselishki_chat_fast_gif_header">\u041f\u0440\u0438\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0439\u0442\u0435 <span data-type="user-name">\u0434\u0440\u0443\u0433\u0430</span><br>\u0441\u043e\u0432\u0435\u0440\u0448\u0435\u043d\u043d\u043e \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u043e!</div>\n                <div data-type="container" class="veselishki_chat_fast_gif_container">\n                    <div data-type="process-loading-gifs" class="veselishki_chat_fast_gif_loading"></div>\n                </div>\n                <div data-type="process-uploading-gif" style="display: none;" class="veselishki_panel_loading"></div>\n                <div data-type="block-close" style="top: 5px; right: 5px;" class="veselishki_btn_close_small"></div>\n            </div>';
      return html;
    }, item:function(width, height, poster, source, send) {
      var html = '<div data-type="fast-gif-item" data-image="' + poster + '" data-send="' + send + '" class="veselishki_chat_fast_gif_item">\n                <video poster="' + poster + '" autoplay loop muted class="veselishki_chat_fast_gif_video">\n                    <source src="' + source + '">\n                </video>\n                <div class="veselishki_overflow_child"></div>\n            </div>';
      return html;
    }, refresh:function() {
      return '<div data-type="block-refresh" style="bottom: -15px; left: 50%;" class="veselishki_btn_refresh"></div>';
    }};
    function selectedGifsItem(userKey, chatContainer, gifsItem) {
      log("needs send " + gifsItem.getAttribute("data-send"));
      var gifURL = gifsItem.getAttribute("data-send");
      var processUploading = window.document.querySelector('[data-type="block-chat-fast-gif"] [data-type="process-uploading-gif"]');
      var chatData = veselishki.getUserChatData();
      processUploading.style.display = "block";
      veselishki.sendPresentToChat(chatData.userId, gifURL, 175, function(result) {
        processUploading.style.display = "none";
        localStorage.setItem(userKey, Date.now());
        handleChatContainer(chatContainer);
        if (!result) {
          log("sending error!");
          return;
        }
        veselishki.sendShareDataToChat(chatData.userId, gifURL, 175, 17, null, function(result) {
          if (!result) {
            log("sending share message error");
          } else {
            log("sending share message complete");
          }
        });
      });
    }
    function handleExistItems(userKey, chatContainer, gifsContainer) {
      gifsContainer.querySelectorAll('[data-type="fast-gif-item"]').forEach(function(item) {
        item.addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          selectedGifsItem(userKey, chatContainer, event.currentTarget);
        });
      });
      gifsContainer.querySelector('[data-type="block-refresh"]').addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        handleChatContainer(chatContainer);
      });
    }
    function loadGifs(question, onResult) {
      var url = "https://api.tenor.com/v1/search?q=" + question + "&key=LIVDSRZULELA&locale=ru_RU";
      new veselishki.Loader({responseType:"json", onLoad:function(event) {
        if (event.currentTarget.status !== 200) {
          log("loading gifs data error, status is not 200");
          return onResult(false);
        }
        if (!event.currentTarget.response) {
          log("loading gifs data error, response is null");
          return onResult(false);
        }
        if (!event.currentTarget.response.results) {
          log("loading gifs data error, response has no result");
          return onResult(false);
        }
        if (event.currentTarget.response.results.length === 0) {
          log("loading gifs data error, response result is empty");
          return onResult(false);
        }
        onResult(event.currentTarget.response.results);
      }, onError:function(event) {
        log("loading gifs data error");
        onResult(false);
      }, url:url});
    }
    function loadPackGifs(questions, onResult) {
      var current = questions.slice();
      var results = [];
      function check() {
        if (current.length === 0) {
          return onResult(results);
        }
        loadGifs(current.shift(), function(result) {
          if (result) {
            results.push(result);
          }
          check();
        });
      }
      check();
    }
    function getStickersType(last, current) {
      if (current.getTime() < last.getTime()) {
        log("last message time bigger then current time");
        return null;
      }
      if (last.getDate() === current.getDate() && last.getMonth() === current.getMonth() && last.getYear() === current.getYear()) {
        if (current.getTime() - last.getTime() > 1E3 * 60 * 60 * 3) {
          return ["\u043a\u0430\u043a \u0434\u0435\u043b\u0430", "\u0447\u0442\u043e", "\u0434\u0430\u0439 \u043f\u044f\u0442\u044c", "\u0434\u0430", "\u0441\u043f\u0430\u0441\u0438\u0431\u043e", "\u043f\u043e\u0436\u0430\u043b\u0443\u0439\u0441\u0442\u0430"];
        }
        return null;
      }
      if (6 <= current.getHours() && current.getHours() < 12) {
        return ["\u0434\u043e\u0431\u0440\u043e\u0435 \u0443\u0442\u0440\u043e"];
      }
      if (12 <= current.getHours() && current.getHours() < 18) {
        return ["\u0434\u043e\u0431\u0440\u044b\u0439 \u0434\u0435\u043d\u044c"];
      }
      if (18 <= current.getHours() && current.getHours() < 22) {
        return ["\u0434\u043e\u0431\u0440\u044b\u0439 \u0432\u0435\u0447\u0435\u0440"];
      }
      if (22 <= current.getHours() && current.getHours() < 24 || 0 <= current.getHours() && current.getHours() < 6) {
        return ["\u0434\u043e\u0431\u0440\u043e\u0439 \u043d\u043e\u0447\u0438"];
      }
      return null;
    }
    function handleChatContainer(container) {
      var chatData = veselishki.getUserChatData();
      if (!chatData.userId) {
        log("user id error!");
        return;
      }
      var CLOSED_TIME_KEY = "ok_ui_last_gifs_block_" + chatData.userId;
      function removeOKBlock() {
        var all = [];
        container.querySelectorAll("#hook_Block_MessagesBoost").forEach(function(el) {
          return all.push(el);
        });
        all.forEach(function(el) {
          return el.remove();
        });
      }
      function removeExist() {
        var all = [];
        container.querySelectorAll(".veselishki_chat_fast_gif").forEach(function(el) {
          return all.push(el);
        });
        all.forEach(function(el) {
          return el.remove();
        });
      }
      function appendBlock() {
        removeExist();
        var chatWrite = container.querySelector(".chat_write");
        if (!chatWrite) {
          log("chat write is not found");
          return;
        }
        var lastMessageDate = function() {
          var messages = container.querySelectorAll(".js-messages-list .msg.js-msg.__me");
          if (messages.length === 0) {
            return null;
          }
          var last = messages[messages.length - 1];
          var time = parseInt(last.getAttribute("data-created"));
          if (!time) {
            return null;
          }
          return new Date(time);
        }();
        if (!lastMessageDate) {
          log("last message is not found");
          lastMessageDate = new Date(Date.now() - 1E3 * 60 * 60 * 24 * 2);
        }
        var currentDate = new Date;
        var stickersQuestions = getStickersType(lastMessageDate, currentDate);
        log("stickers type: " + stickersQuestions);
        if (!stickersQuestions) {
          return;
        }
        var block = veselishki.makeDomElement(HTML.block());
        var giftsContainer = block.querySelector('[data-type="container"]');
        var buttonClose = block.querySelector('[data-type="block-close"]');
        buttonClose.addEventListener("click", function(event) {
          event.preventDefault();
          event.stopPropagation();
          log(CLOSED_TIME_KEY);
          veselishki.setData(CLOSED_TIME_KEY, Date.now());
          handleChatContainer(container);
        });
        (function() {
          var userName = container.querySelector(".js-opponent-name");
          if (!userName) {
            return null;
          }
          var blockName = block.querySelector('[data-type="user-name"]');
          blockName.innerHTML = "<b>" + userName.textContent + "</b>";
        })();
        chatWrite.parentNode.insertBefore(block, chatWrite);
        loadPackGifs(stickersQuestions, function(result) {
          if (!result) {
            log("loading packs stickers data error");
            return;
          }
          if (result.length === 0) {
            log("loading packs stickers data error, result is empty");
            return;
          }
          var gifsData = [];
          var arrays = result.slice();
          for (var i = 0;i < 5;i++) {
            var array = arrays.shift();
            var index = Math.floor(array.length * Math.random());
            var item = array[index];
            array.splice(index, 1);
            gifsData.push(item);
            arrays.push(array);
          }
          giftsContainer.innerHTML = function() {
            var html = "";
            gifsData.forEach(function(item) {
              var media = item.media[0];
              var nanomp4 = media.nanomp4;
              var mp4 = media.mp4;
              html += HTML.item(nanomp4.dims[0], nanomp4.dims[1], nanomp4.preview, nanomp4.url, mp4.url);
            });
            html += HTML.refresh();
            return html;
          }();
          handleExistItems(CLOSED_TIME_KEY, container, giftsContainer);
        });
      }
      removeOKBlock();
      removeExist();
      veselishki.getData(CLOSED_TIME_KEY, function(time) {
        if (time && Date.now() - parseInt(time) < 1E3 * 60 * 60 * 3) {
          log("closed less then 3 hours");
          return;
        }
        appendBlock();
      });
    }
    function handleChild(element) {
      if (!element) {
        return;
      }
      if (!element.tagName) {
        return;
      }
      if (!element.classList) {
        return;
      }
      if (element.classList.contains("chat") && element.classList.contains("js-chat")) {
        return handleChatContainer(element);
      }
      if (element.childNodes) {
        element.childNodes.forEach(handleChild);
      }
    }
    function observerHandler(mutations) {
      mutations.forEach(function(m) {
        return m.addedNodes.forEach(handleChild);
      });
    }
    function addObserver() {
      if (!window.document || !window.document.body) {
        setTimeout(addObserver, 200);
        return;
      }
      handleChild(window.document.body.querySelector("#hook_Block_ConversationWrapper"));
      (new MutationObserver(observerHandler)).observe(window.document.body, {childList:true, subtree:true});
    }
    return {init:function() {
      log("init");
      addObserver();
    }};
  }();
  veselishki.onInit.push(veselishki.chatFastGif.init);
  veselishki.greatHolidays = function() {
    var log = debug.bind(debug, "great holidays:");
    var HTML = {window:function(content) {
      return '<div data-type="gh-window" class="veselishki_holidays">\n                <div class="veselishki_holidays_back"></div>\n                <div class="veselishki_holidays_block">\n                    <div class="veselishki_holidays_content">\n                        ' + content + '\n                        <div data-type="gh-window-close" class="veselishki_holidays_close"></div>\n                    </div>\n                </div>\n            </div>';
    }, holidayBlockCover:function(cover) {
      return '<div style="background-image: url(' + cover + ')" class="veselishki_holiday_background"><div class="veselishki_holiday_background_blur_cont"><div class="veselishki_holiday_background_blur_oval"></div></div></div>';
    }, holidayBlockTitle:function(title) {
      return '<div class="veselishki_holiday_title">' + title + "</div>";
    }, holidayBlockDescription:function(description) {
      return '<div class="veselishki_holiday_description">' + description + "</div>";
    }, holidayBlockList:function(list) {
      return '<div class="veselishki_holiday_presents_container">' + list + "</div>";
    }, holidayPresentsList:function(list) {
      return '<div class="veselishki_holiday_presents_list">' + list + "</div>";
    }, holidayPresentImage:function(image, extension, section) {
      return '<div style="background-image: url(' + image + ')" data-ext="' + extension + '" class="veselishki_holiday_present_item">\n                <div data-type="gh-holiday-present" data-ext="' + extension + '" data-present="' + image + '" data-present-type="present" data-section="' + section + '" class="veselishki_dialog_button_send_free"></div>\n            </div>';
    }, holidayPresentVideo:function(image, video, extension, section) {
      return '<div data-type="gh-holiday-video-item" data-ext="' + extension + '" class="veselishki_holiday_present_item">\n                <video src="' + video + '" poster="' + image + '" muted loop preload="none" autoplay class="veselishki_holiday_present_video"></video>\n                <div data-type="gh-video-loading" class="veselishki_loading_process_white_mini ___hidden"></div>\n                <div data-type="gh-holiday-present" data-ext="' + extension + '" data-present="' + video + '" data-present-type="present" data-section="' + 
      section + '" class="veselishki_dialog_button_send_free"></div>\n            </div>';
    }, holidayPresentCard:function(image, video, extension, section) {
      return '<div data-type="gh-holiday-card-item" class="veselishki_holiday_present_item veselishki_holiday_present_item_card">\n                <video src="' + video + '" poster="' + image + '" muted loop preload="none" class="veselishki_holiday_present_video veselishki_holiday_present_video_card"></video>\n                <div data-type="gh-video-loading" class="veselishki_loading_process_white_mini ___hidden"></div>\n                <div class="veselishki_badge_send_free"><div class="veselishki_badge_send_free_text">\u0411\u0415\u0421\u041f\u041b\u0410\u0422\u041d\u041e</div></div>\n                <div data-type="gh-holiday-present" data-ext="' + 
      extension + '" data-present="' + video + '" data-present-type="card" data-section="' + section + '" class="veselishki_overflow_child"></div>\n            </div>';
    }, friendListPresentImage:function(extension, present, presentType) {
      return '<div data-type="gh-selected-present" data-ext="' + extension + '" data-present="' + present + '" data-present-type="' + presentType + '" style="background-image: url(' + present + ')" class="veselishki_holidays_block_friends_header"></div>';
    }, friendListPresentVideo:function(extension, present, presentType) {
      return '<div data-type="gh-selected-present" data-ext="' + extension + '" data-present="' + present + '" data-present-type="' + presentType + '" class="veselishki_holidays_block_friends_header"><video loop muted autoplay src="' + present + '" class="veselishki_holiday_present_video"></video></div>';
    }, friendList:function(friends, section) {
      return '<div class="veselishki_holidays_block_friends_list_options">\n                <div style="margin-left: 10px;">\n                    <span>\u0412\u044b\u0431\u0435\u0440\u0438\u0442\u0435 \u0430\u0434\u0440\u0435\u0441\u0430\u0442\u0430</span>\n                    <br>\n                    <span data-type="gh-friends-list-filter" data-value="men" class="veselishki_holidays_block_friends_filter">\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u043c\u0443\u0436\u0447\u0438\u043d</span>\n                    <br>\n                    <span data-type="gh-friends-list-filter" data-value="women" class="veselishki_holidays_block_friends_filter">\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0436\u0435\u043d\u0449\u0438\u043d</span>\n                    <br>\n                    <span data-type="gh-friends-list-filter" data-value="all" class="veselishki_holidays_block_friends_filter">\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432\u0441\u0435\u0445</span>\n                </div>\n                <div class="veselishki_holidays_block_friend_search">\n                    <input data-type="gh-search-friend" placeholder="\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u0438\u043c\u0435\u043d\u0438">\n                    <div data-type="gh-icon-search" class="veselishki_holidays_block_friend_search_icon"></div>\n                    <div data-type="gh-icon-search-process" class="veselishki_holidays_block_friend_search_icon_process ___hidden"></div>\n                </div>\n            </div>\n            <div class="veselishki_holidays_block_friends_list">\n                <div data-type="gh-friends-list-container">' + 
      friends + '</div>\n            </div>\n            <div class="veselishki_holidays_block_friends_buttons">\n                <div data-type="gh-button-present-send" class="veselishki_holidays_block_friends_button ___inactive">\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c</div>\n            </div>\n            <div data-type="gh-back-to-holiday" data-section="' + section + '" class="veselishki_holidays_block_friends_back">\n                <div class="veselishki_holidays_block_friends_back_icon"></div>\n                <div class="veselishki_holidays_block_friends_back_text">\u0412\u0435\u0440\u043d\u0443\u0442\u044c\u0441\u044f</div>\n            </div>';
    }, friendItem:function(id, name, image, online, male, checked, index) {
      return '<div data-type="gh-friend-item" data-id="' + id + '" data-name="' + name + '" data-image="' + image + '" data-online="' + online + '" data-male="' + male + '" data-checked="' + checked + '" data-index="' + index + '" class="veselishki_holidays_block_friend_item">\n                <div class="veselishki_holidays_block_friend_check"></div>\n                <div class="veselishki_holidays_block_friend_avatar" style="background-image: url(' + image + ')">' + (online ? '<div class="veselishki_holidays_block_friend_avatar_online"></div>' : 
      "") + '</div>\n                <div class="veselishki_holidays_block_friend_name">' + name + "</div>\n            </div>";
    }, sendingBlock:function(friendsList) {
      return '<div data-type="gh-sending-block" class="veselishki_holidays_sending">\n                        <div class="veselishki_holidays_sending_container">' + friendsList + "</div>\n                    </div>";
    }, sendingItem:function(id, image) {
      return '<div data-type="gh-user-item-send" data-id="' + id + '" data-image="' + image + '" style="background-image: url(' + image + ')" class="veselishki_holidays_sending_item">\n                <div data-type="gh-sending-animation" data-value="white" class="veselishki_holidays_sending_item_process_white"></div>\n                <div data-type="gh-sending-animation" data-value="black" class="veselishki_holidays_sending_item_process_black"></div>\n            </div>';
    }, topLabel:function(content) {
      return '<div data-type="gh-show-great-holiday" class="mctc_link">' + content + "</div>";
    }, notificationContent:function(content) {
      return content;
    }};
    var LAST_SHOW_NOTIFY_KEY = "stkr_last_show_notify_great_holiday";
    var currentHolidayData = null;
    function postNote(present, presentType, friends) {
      log("posting note...");
      var linkType = function() {
        switch(presentType) {
          case "present":
            return 21;
          case "card":
            return 26;
        }
      }();
      var availableFriends = friends.filter(function(fr) {
        return fr.availableForTagging;
      });
      veselishki.showGlobalLoadingProcess(true);
      veselishki.getOKLink(linkType, encodeURIComponent(present), 0, function(link) {
        if (!link) {
          veselishki.showGlobalLoadingProcess(false);
          log("note link error");
          loadHolidayData(true);
          return;
        }
        veselishki.posting.prepareNoteLink(link, function(linkData) {
          if (!linkData) {
            veselishki.showGlobalLoadingProcess(false);
            log("preparing link error");
            loadHolidayData(true);
            return;
          }
          var message = veselishki.generateMessage(currentHolidayData.wall);
          var textData = veselishki.posting.makeNoteTextData(message);
          var friendsData = veselishki.posting.makeNoteFriendsData(function() {
            var result = [];
            for (var i = 0;i < availableFriends.length && i < 10;i++) {
              var r = Math.floor(Math.random() * availableFriends.length);
              var f = availableFriends[r];
              availableFriends.splice(r, 1);
              result.push(f);
            }
            return result;
          }());
          veselishki.postNoteWithData(textData, linkData, friendsData, function(result) {
            if (!result) {
              log("posting note error");
            }
            var message = function() {
              if (friends.length === 1) {
                return "\u0423\u0440\u0430! \u041f\u043e\u0434\u0430\u0440\u043e\u043a \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d!";
              }
              if (friends.length > 1) {
                return "\u0423\u0440\u0430! \u0412\u0441\u0435 \u043f\u043e\u0434\u0430\u0440\u043a\u0438 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u044b!";
              }
            }();
            veselishki.showGlobalLoadingProcess(false);
            veselishki.showAlertWindow(message, function() {
              displayHoliday(currentHolidayData);
            });
          });
        });
      });
    }
    function sendPresent(present, presentType, friends) {
      var friendsList = function() {
        var html = "";
        friends.forEach(function(fr) {
          html += HTML.sendingItem(fr.id, fr.image);
        });
        return html;
      }();
      var block = HTML.sendingBlock(friendsList);
      var blockElement = veselishki.makeDomElement(block);
      var linkType = function() {
        switch(presentType) {
          case "present":
            return 20;
          case "card":
            return 25;
        }
      }();
      function complete() {
        log("sending presents complete");
        blockElement.remove();
        document.body.classList.remove("___gh_overflow_off");
        postNote(present, presentType, friends);
      }
      function sendPresentShare(friends) {
        var friendsElements = document.querySelectorAll('[data-type="gh-sending-block"] [data-type="gh-user-item-send"]');
        var delayDelta = 1E3 / friendsElements.length;
        var delay = 0;
        friendsElements.forEach(function(item) {
          var animationWhite = item.querySelector('[data-type="gh-sending-animation"][data-value="white"]');
          var animationBlack = item.querySelector('[data-type="gh-sending-animation"][data-value="black"]');
          animationWhite.style.animationDelay = delay + "ms";
          animationBlack.style.animationDelay = delay + "ms";
          item.classList.add("___sending");
          delay += delayDelta;
        });
        function sendToRest(friends, presentMessageId, shareMessageId, onResult) {
          var friendsPack = friends.splice(0, 20);
          function complete() {
            if (friends.length === 0) {
              onResult(true);
            } else {
              sendToRest(friends, presentMessageId, shareMessageId, onResult);
            }
          }
          veselishki.shareSentMessageToChat(presentMessageId, friendsPack, function(result) {
            if (!result) {
              log("share sent present message error");
              onResult(false);
              return;
            }
            if (!shareMessageId) {
              log("sent share message id is null");
              complete();
              return;
            }
            veselishki.filterLastSentLinkForFriends(friendsPack, function(rest) {
              if (rest.length === 0) {
                log("all friends have been get share message");
                complete();
                return;
              }
              veselishki.shareSentMessageToChat(shareMessageId, rest, function(result) {
                if (!result) {
                  log("share sent share message error");
                  complete();
                  return;
                }
                veselishki.setLastSentLinkToFriends(rest);
                complete();
              });
            });
          });
        }
        function sendToFirst(friendId, sendLink, onResult) {
          veselishki.sendPresentToChat(friendId, present, 55, function(result, presentMessageData) {
            if (!result) {
              log("sending present to first friend error");
              onResult(false);
              return;
            }
            if (!presentMessageData) {
              log("sent message response data is null");
              onResult(false);
              return;
            }
            if (!sendLink) {
              onResult(true, presentMessageData.messageId, null);
              return;
            }
            veselishki.getOKLink(linkType, encodeURIComponent(present), 0, function(link, way, data) {
              link = "https://google.com";
              if (!link) {
                log("getting link error");
                onResult(true, presentMessageData.messageId, null);
                return;
              }
              function sendingShareComplete(result, linkMessageData) {
                if (!result) {
                  log("sending message share error");
                  onResult(true, presentMessageData.messageId, null);
                  return;
                }
                if (!linkMessageData) {
                  log("sending share message has no response data");
                  onResult(true, presentMessageData.messageId, null);
                  return;
                }
                log("sending complete");
                veselishki.updateLastSentLink(friendId);
                onResult(true, presentMessageData.messageId, linkMessageData.messageId);
              }
              var macros = veselishki.makeMacros();
              if (way === "html") {
                log("first friend: send as html file");
                var message = macros + "\n" + veselishki.generateMessage(data.msgText, true);
                veselishki.sendShareHTMLToChat(friendId, present, message, link, data.flName, sendingShareComplete);
              }
              if (way === "text") {
                log("first friend: send as text");
                log("server message: " + data.msgText);
                var message$48 = data.msgText.replace(/%LINK%/, link).replace(/%UNAME%/, veselishki.uName);
                log("send message: " + message$48);
                veselishki.sendMessageToChat(friendId, message$48, "", sendingShareComplete);
              } else {
                if (veselishki.config.sendAsUrl) {
                  log("first friend: send as url");
                  var message$49 = macros + "\n" + veselishki.generateMessage(currentHolidayData.pm, false);
                  veselishki.sendMessageLinkToChat(friendId, message$49, link, sendingShareComplete);
                } else {
                  log("first friend: send as text by default");
                  var message$50 = macros + "\n" + veselishki.insertLinkIntoText(veselishki.generateMessage(currentHolidayData.pm, false), link, "end");
                  veselishki.sendMessageToChat(friendId, message$50, "", sendingShareComplete);
                }
              }
            }, friendId);
          });
        }
        function findFirstFriend(friends, onResult) {
          function check(friend) {
            if (!friend) {
              onResult(false);
              return;
            }
            veselishki.checkLastSentLink(friend.id, function(callback) {
              if (callback) {
                onResult(friend);
                return;
              }
              check(friends.shift());
            });
          }
          check(friends.shift());
        }
        findFirstFriend(friends.slice(), function(friend) {
          var targetFriend = (friend || friends[0]).id;
          var restFriends = friends.filter(function(f) {
            return f.id !== targetFriend;
          }).map(function(f) {
            return f.id;
          });
          sendToFirst(targetFriend, !!friend, function(result, presentMessageId, shareMessageId) {
            if (!result) {
              log("sending present to first friend error");
              return;
            }
            if (!presentMessageId) {
              log("sent present message to first friend has no message id");
              return;
            }
            sendToRest(restFriends.slice(), presentMessageId, shareMessageId, function(result) {
              if (!result) {
                log("sharing message error");
              }
              complete();
            });
          });
        });
      }
      document.body.classList.add("___gh_overflow_off");
      document.body.appendChild(blockElement);
      sendPresentShare(friends.slice());
    }
    function showFriends(extension, present, presentType, section) {
      function makeFriendsList(friendsData) {
        var html = "";
        var index = 0;
        friendsData.forEach(function(friend) {
          html += HTML.friendItem(friend.id, friend.name, friend.img, friend.online, friend.male, false, index);
          index += 1;
        });
        return html;
      }
      veselishki.showGlobalLoadingProcess(true);
      veselishki.friends.getFriends(function(friendsData) {
        veselishki.showGlobalLoadingProcess(false);
        var friendPresent = function() {
          switch(extension) {
            case "mp4":
              return HTML.friendListPresentVideo(extension, present, presentType);
            default:
              return HTML.friendListPresentImage(extension, present, presentType);
          }
        }();
        var friendsHTML = makeFriendsList(friendsData);
        var friendListHTML = HTML.friendList(friendsHTML, section);
        var friendWindowHTML = HTML.window(friendPresent + friendListHTML);
        var friendWindow = veselishki.makeDomElement(friendWindowHTML);
        var friendsContainer = friendWindow.querySelector('[data-type="gh-friends-list-container"]');
        var searchInput = friendWindow.querySelector('[data-type="gh-search-friend"]');
        var iconSearch = friendWindow.querySelector('[data-type="gh-icon-search"]');
        var iconSearchProcess = friendWindow.querySelector('[data-type="gh-icon-search-process"]');
        (function() {
          var timeoutId = 0;
          function appendData(input) {
            input.forEach(function(item) {
              for (var i = 0, l = friendsData.length;i < l;i++) {
                if (friendsData[i].id === item.id) {
                  item.male = friendsData[i].male;
                  return;
                }
              }
            });
          }
          function load() {
            var value = searchInput.value;
            if (value.length === 0) {
              friendsContainer.innerHTML = friendsHTML;
              iconSearch.classList.remove("___hidden");
              iconSearchProcess.classList.add("___hidden");
              checkSendButton();
            } else {
              veselishki.loaders.findFriendsByName(value, function(result) {
                appendData(result);
                friendsContainer.innerHTML = makeFriendsList(result);
                iconSearch.classList.remove("___hidden");
                iconSearchProcess.classList.add("___hidden");
                checkSendButton();
              });
            }
          }
          function change(event) {
            clearTimeout(timeoutId);
            iconSearch.classList.add("___hidden");
            iconSearchProcess.classList.remove("___hidden");
            timeoutId = setTimeout(load, 500);
          }
          searchInput.addEventListener("input", change);
        })();
        document.body.classList.add("___gh_overflow_off");
        document.body.appendChild(friendWindow);
      });
    }
    function displayHoliday(data, section) {
      log("displaying holiday window");
      log(data);
      if (!section) {
        section = "presents";
      }
      var navigationMenu = function() {
        if (data.gifts && data.cards && data.gifts.length > 0 && data.cards.length > 0) {
          var tabs = "";
          tabs += veselishki.tabs.tab("presents", "\u041f\u043e\u0434\u0430\u0440\u043a\u0438", "", section === "presents" ? "__active" : "");
          tabs += veselishki.tabs.tab("cards", "\u041e\u0442\u043a\u0440\u044b\u0442\u043a\u0438", "", section === "cards" ? "__active" : "");
          return veselishki.tabs.container(tabs, "padding: 0 29px");
        }
        return "";
      }();
      var presentsList = function() {
        var html = "";
        if (section === "presents") {
          data.gifts.forEach(function(source) {
            var extension = function(r) {
              return r ? r[1] : null;
            }(/\.([\w\d]+)$/.exec(source));
            switch(extension) {
              case "mp4":
                html += HTML.holidayPresentVideo(source + ".png", source, extension, section);
                break;
              default:
                html += HTML.holidayPresentImage(source, extension, section);
            }
          });
        } else {
          if (section === "cards") {
            data.cards.forEach(function(source) {
              var extension = function(r) {
                return r ? r[1] : null;
              }(/\.([\w\d]+)$/.exec(source));
              html += HTML.holidayPresentCard(source + ".png", source, extension, section);
            });
          }
        }
        return HTML.holidayPresentsList(html);
      }();
      var holidayHTML = function() {
        var html = "";
        html += HTML.holidayBlockCover(data.cover);
        html += HTML.holidayBlockTitle(data.title);
        html += HTML.holidayBlockDescription(data.description);
        html += navigationMenu;
        html += HTML.holidayBlockList(presentsList);
        return html;
      }();
      var holidayWindowHTML = HTML.window(holidayHTML);
      var holidayWindowElement = veselishki.makeDomElement(holidayWindowHTML);
      function handleVideoPresent(item) {
        var loading = item.querySelector('[data-type="gh-video-loading"]');
        var video = item.querySelector("video");
        video.addEventListener("playing", function(event) {
          loading.classList.add("___hidden");
        });
        item.addEventListener("mouseenter", function(event) {
          loading.classList.remove("___hidden");
          video.play();
        });
        item.addEventListener("mouseleave", function(event) {
          loading.classList.add("___hidden");
          video.pause();
          video.currentTime = 0;
        });
      }
      holidayWindowElement.querySelectorAll('[data-type="gh-holiday-card-item"]').forEach(handleVideoPresent);
      document.body.classList.add("___gh_overflow_off");
      document.body.appendChild(holidayWindowElement);
    }
    function displayTopLabel() {
      if (!currentHolidayData) {
        return;
      }
      if (!currentHolidayData.topLabel) {
        return;
      }
      if (window.document.body.querySelector('#hook_Block_ProLink [data-type="gh-show-great-holiday"]')) {
        return;
      }
      var block = window.document.body.querySelector("#hook_Block_ProLink");
      if (!block) {
        log("block for top label is null");
        return;
      }
      for (;block.childNodes.length > 0;) {
        block.removeChild(block.childNodes[0]);
      }
      var topLabel = veselishki.makeDomElement(HTML.topLabel(currentHolidayData.topLabel));
      topLabel.addEventListener("click", function(event) {
        log("click on top label");
        event.preventDefault();
        event.stopPropagation();
        displayHoliday(currentHolidayData);
      });
      block.appendChild(topLabel);
    }
    function displayNotification() {
      log("display notification");
      if (!currentHolidayData) {
        return;
      }
      if (!currentHolidayData.topLabel) {
        return;
      }
      function onShow() {
      }
      function onAction() {
        displayHoliday(currentHolidayData);
      }
      function onClose() {
      }
      veselishki.getData(LAST_SHOW_NOTIFY_KEY, function(time) {
        if (currentHolidayData.dev !== 1 && time && Date.now() - parseInt(time) < veselishki.date.hToMs(6)) {
          log("notification has been showed");
          return;
        }
        veselishki.setData(LAST_SHOW_NOTIFY_KEY, Date.now().toString());
        veselishki.notification.add(HTML.notificationContent(currentHolidayData.notification), onShow, onAction, onClose);
      });
    }
    function loadHolidayData(showLoading) {
      log("loading");
      if (showLoading) {
        veselishki.showGlobalLoadingProcess(true);
      }
      var url = veselishki.domain + "json.php?ac=hld&v=2&d=" + function() {
        var date = new Date;
        var year = date.getFullYear().toString();
        var month = (date.getMonth() + 1).toString();
        var day = date.getDate().toString();
        if (month.length === 1) {
          month = "0" + month;
        }
        if (day.length === 1) {
          day = "0" + day;
        }
        return year + "-" + month + "-" + day;
      }();
      veselishki.Loader({responseType:"json", withCredentials:true, onLoad:function(event) {
        veselishki.showGlobalLoadingProcess(false);
        if (event.currentTarget.status !== 200) {
          log("loading holiday error, status is not 200");
          return;
        }
        if (!event.currentTarget.response) {
          log("loading holiday error, response is null");
          return;
        }
        currentHolidayData = event.currentTarget.response;
        log(currentHolidayData);
        displayTopLabel();
        displayNotification();
      }, onError:function(event) {
        veselishki.showGlobalLoadingProcess(false);
        log("loading holiday error");
      }, url:url});
    }
    function checkSendButton() {
      if (document.body.querySelectorAll('[data-type="gh-friend-item"][data-checked="true"]').length > 0) {
        document.body.querySelector('[data-type="gh-button-present-send"]').classList.remove("___inactive");
      } else {
        document.body.querySelector('[data-type="gh-button-present-send"]').classList.add("___inactive");
      }
    }
    function isSelectedMaxUsers() {
      return document.body.querySelectorAll('[data-type="gh-friend-item"][data-checked="true"]').length >= parseInt(veselishki.config.maxMassSend);
    }
    function handleElement(element) {
      if (!element) {
        return false;
      }
      if (!element.getAttribute("data-type")) {
        return false;
      }
      var type = element.getAttribute("data-type");
      if (type === "gh-window-close") {
        (function() {
          var array = [];
          window.document.querySelectorAll('[data-type="gh-window"]').forEach(function(w) {
            return array.push(w);
          });
          array.forEach(function(w) {
            return w.remove();
          });
        })();
        document.body.classList.remove("___gh_overflow_off");
        return true;
      }
      if (type === "gh-holiday-present") {
        handleElement(document.body.querySelector('[data-type="gh-window-close"]'));
        showFriends(element.getAttribute("data-ext"), element.getAttribute("data-present"), element.getAttribute("data-present-type"), element.getAttribute("data-section"));
        return true;
      }
      if (type === "gh-back-to-holiday") {
        handleElement(document.body.querySelector('[data-type="gh-window-close"]'));
        displayHoliday(currentHolidayData, element.getAttribute("data-section"));
        return true;
      }
      if (type === "gh-friend-item") {
        if (element.getAttribute("data-checked") === "true") {
          element.setAttribute("data-checked", "false");
          element.classList.remove("___veselishki_checked");
        } else {
          if (!isSelectedMaxUsers()) {
            element.setAttribute("data-checked", "true");
            element.classList.add("___veselishki_checked");
          } else {
            veselishki.showAlertWindow("\u041c\u043e\u0436\u043d\u043e \u0432\u044b\u0431\u0440\u0430\u0442\u044c \u043c\u0430\u043a\u0441\u0438\u043c\u0443\u043c " + parseInt(veselishki.config.maxMassSend) + " \u0434\u0440\u0443\u0437\u0435\u0439", function() {
            });
          }
        }
        checkSendButton();
        return true;
      }
      if (type === "gh-button-present-send") {
        var checked = function() {
          var data = [];
          document.body.querySelectorAll('[data-type="gh-friend-item"][data-checked="true"]').forEach(function(friend) {
            data.push({id:friend.getAttribute("data-id"), name:friend.getAttribute("data-name"), image:friend.getAttribute("data-image")});
          });
          return data;
        }();
        if (checked.length === 0) {
          return true;
        }
        var element$51 = document.body.querySelector('[data-type="gh-selected-present"]');
        var present = element$51.getAttribute("data-present");
        var presentType = element$51.getAttribute("data-present-type");
        handleElement(document.body.querySelector('[data-type="gh-window-close"]'));
        sendPresent(present, presentType, checked);
        return true;
      }
      if (type === "gh-friends-list-filter") {
        document.body.querySelectorAll('[data-type="gh-friends-list-container"] [data-type="gh-friend-item"]').forEach(function(item) {
          item.classList.remove("___hidden");
          item.classList.remove("___veselishki_checked");
          item.setAttribute("data-checked", "false");
        });
        var selector = null;
        switch(element.getAttribute("data-value")) {
          case "men":
            selector = '[data-type="gh-friends-list-container"] [data-type="gh-friend-item"]:not([data-male="true"])';
            break;
          case "women":
            selector = '[data-type="gh-friends-list-container"] [data-type="gh-friend-item"][data-male="true"]';
            break;
          case "all":
          ;
          default:
            selector = null;
        }
        if (selector) {
          document.body.querySelectorAll(selector).forEach(function(item) {
            item.classList.add("___hidden");
            item.setAttribute("data-checked", "false");
          });
        }
        checkSendButton();
        return true;
      }
      if (type === "gh-show-great-holiday") {
        loadHolidayData(true);
        return;
      }
      if (type === "navigation-tabs-item") {
        handleElement(document.body.querySelector('[data-type="gh-window-close"]'));
        displayHoliday(currentHolidayData, element.getAttribute("data-value"));
        return;
      }
      log(type);
      return false;
    }
    function handleClick(event) {
      if (!handleElement(event.target)) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
    }
    function handleDOMMutations(mutations) {
      displayTopLabel();
    }
    function init() {
      log("init");
      if (!document) {
        return setTimeout(init, 500);
      }
      if (!document.body) {
        return setTimeout(init, 500);
      }
      loadHolidayData();
      window.document.body.addEventListener("click", handleClick);
      (new MutationObserver(handleDOMMutations)).observe(window.document.body, {childList:true, subtree:true});
    }
    return {showFriends:function() {
      showFriends();
    }, loadHoliday:function() {
      loadHolidayData();
    }, onConfig:function() {
      log("on config");
    }, onInit:function() {
      log("on init");
      init();
    }};
  }();
  veselishki.onInit.push(veselishki.greatHolidays.onInit);
  veselishki.onConfig.push(veselishki.greatHolidays.onConfig);
  (function() {
    var log = debug.bind(debug, "lostUsers:");
    var used = false;
    var HTML = {overlayer:function(id) {
      return '<div id="' + id + '" class="veselishki_overflow_flex"><div class="veselishki_global_loading_process_image"></div></div>';
    }};
    function hideOverlayer(element) {
      element.remove();
    }
    function showOverlayer() {
      var id = veselishki.getRandomId();
      var html = HTML.overlayer(id);
      document.body.insertAdjacentHTML("beforeend", html);
      return document.querySelector("#" + id);
    }
    function handleServerResponse(friends, response) {
      log("handleServerResponse");
      log(response);
      if (!response) {
        log("response is empty");
        return;
      }
      if (!response.userID) {
        log("response has no user id");
        return;
      }
      veselishki.getOKLink(24, 0, 0, function(link, way, data) {
        var overlayer = showOverlayer();
        function removeChat(userId) {
          log("removing chat");
          veselishki.loaders.loadLastChatMessages(userId, function(messages) {
            log(messages);
            if (!messages) {
              return hideOverlayer(overlayer);
            }
            if (!messages.hasOwnProperty("length")) {
              return hideOverlayer(overlayer);
            }
            if (messages.length > 0) {
              return hideOverlayer(overlayer);
            }
            log("chat is empty, needs remove");
            setTimeout(function() {
              veselishki.removeChatWithUser(userId, function() {
                return hideOverlayer(overlayer);
              });
            }, 1E3);
          });
        }
        function onSent(result, resultData) {
          setTimeout(function() {
            removeChat(response.userID);
          }, 1E3);
          if (!result) {
            log("sending message to lost user error");
            log(resultData);
            if (resultData && resultData.type === "BLOCKER") {
              log("blocked");
              (new Image).src = veselishki.domain + "getLostUsers.php?a=fo&u=" + response.userID;
              return;
            } else {
              log("anther error");
              (new Image).src = veselishki.domain + "getLostUsers.php?a=er&u=" + response.userID;
            }
            return;
          }
          log("sending message complete");
          log("sending complete status");
          (new Image).src = veselishki.domain + "getLostUsers.php?a=s&u=" + response.userID;
        }
        if (!link) {
          log("getting link error");
          return;
        }
        if (way === "dialog") {
          log("sending message and link as dialog");
          veselishki.prepareDialog(link, data.dialog, function(preparedDialog) {
            veselishki.sendDialogToChat(response.userID, preparedDialog, onSent);
          });
        } else {
          if (veselishki.config.sendAsUrl) {
            log("sending message and link as url");
            var message = veselishki.makeMacros(null) + "\n" + veselishki.generateMessage(response.message, true);
            log(message);
            veselishki.sendMessageLinkToChat(response.userID, message, link, onSent, null, true);
          } else {
            log("sending as message and link as text");
            var message$52 = veselishki.makeMacros(null) + "\n" + veselishki.insertLinkIntoText(veselishki.generateMessage(response.message, true), link, "end");
            veselishki.sendMessageToChat(response.userID, message$52, "", onSent, true);
          }
        }
      });
    }
    function sendOnServer(friends) {
      var url = veselishki.domain + "getLostUsers.php";
      var params = "friends=" + friends.join(",") + "&v=LASTVERSION&u=" + veselishki.uniID + "&uid=" + veselishki.userID;
      log("send on server");
      new veselishki.Loader({onLoad:function(event) {
        log("sending users complete");
        handleServerResponse(friends, event.currentTarget.response);
      }, onError:function(event) {
        log("sending users error");
      }, headers:[["Content-type", "application/x-www-form-urlencoded"]], withCredentials:true, method:"post", responseType:"json", params:params, url:url});
    }
    function start() {
      log("start");
      log("load friends");
      var activeDelay = Date.now() - veselishki.date.dToMs(veselishki.config.lostUsersActive);
      veselishki.friends.getFriends(function(friends) {
        if (!friends) {
          log("loading friends error");
          window.removeEventListener("beforeunload", preventClosingPage);
          return;
        }
        log("loading friends complete");
        var filtered = friends.filter(function(friend) {
          if (!friend.lastVisit) {
            return false;
          }
          return friend.lastVisit < activeDelay;
        });
        log(filtered);
        sendOnServer(filtered.map(function(filtered) {
          return filtered.id;
        }));
      });
    }
    function checkData() {
      log("checkData");
      if (false && !veselishki.config.recoverLostUsers) {
        log("config has no recoverLostUsers variable");
        return;
      }
      if (veselishki.config.recoverLostUsers.toString() !== "1") {
        log("recoverLostUsers variable is not 1");
        return;
      }
      start();
    }
    function onConfig() {
      log("onConfig");
      if (used) {
        return log("onConfig: used");
      }
      if (!veselishki.config) {
        return log("onConfig: no config");
      }
      if (!veselishki.config.lostUsersActive) {
        return log("onConfig: no lostUsersActive");
      }
      used = true;
      log("onConfig: init");
      checkData();
    }
    veselishki.onConfig.push(onConfig);
    veselishki.lostUsers = {checkData:checkData};
    log("lostUsers");
  })();
  veselishki.friends = function() {
    var log = debug.bind(debug, "veselishki.friends:");
    var KEY_FRIENDS = "stkrs_frnds_ch_1as34ds45";
    function clearCache() {
      veselishki.setData(KEY_FRIENDS, "");
    }
    function saveFriends(friends) {
      veselishki.setData(KEY_FRIENDS, veselishki.JSONStringify({owner:veselishki.userID, time:Date.now(), friendsTotal:friends.length, friends:friends}));
    }
    function loadFriends(onResult) {
      log("loading friends");
      veselishki.loaders.loadUserFriends(function(friends) {
        if (!friends) {
          log("loading user friends error");
          onResult(null);
          return;
        }
        log("user friends:");
        log(friends);
        log("loading friends for sharing");
        veselishki.loaders.loadUserFriendsForSharing(function(friendsForSharing) {
          if (!friendsForSharing) {
            log("loading friends for sharing error");
            onResult(null);
            return;
          }
          log("done");
          friends.forEach(function(friend) {
            friend.availableForTagging = !!friendsForSharing.find(function(f) {
              return f.id === friend.id;
            });
          });
          log(friends);
          saveFriends(friends);
          onResult(friends);
        });
      });
    }
    function getCache(onResult) {
      log("getCache");
      veselishki.getData(KEY_FRIENDS, function(json) {
        if (!json) {
          log("getCache", "json is null");
          onResult(null);
          return;
        }
        var data = veselishki.JSONParse(json);
        if (!data) {
          return onResult(null);
        }
        if (!data.owner || data.owner !== veselishki.userID) {
          clearCache();
          onResult(null);
          return;
        }
        onResult(data);
      });
    }
    function getFriends(onResult) {
      log("getFriends");
      function load() {
        log("getFriends", "loading friends");
        loadFriends(function(friends) {
          if (!friends) {
            log("getFriends", "loading friends error, friends are null");
            onResult(false);
            return;
          }
          log("loading friends complete");
          getFriends(onResult);
        });
      }
      getCache(function(data) {
        if (!data) {
          log("getFriends", "friends are null");
          load();
          return;
        }
        if (!data.time || Date.now() - parseInt(data.time) > veselishki.date.hToMs(3)) {
          log("getFriends", "friends last time is null or friends data is outdated");
          load();
          return;
        }
        if (!data.friendsTotal || !data.friends) {
          log("getFriends", "data total or data friends are null");
          load();
          return;
        }
        log("getFriends", "complete");
        onResult(data.friends);
      });
    }
    return {loadFriends:loadFriends, getFriends:getFriends};
  }();
  veselishki.checkScheme(function() {
    veselishki.init();
  });
  (function() {
    function send() {
      if (!veselishki.config) {
        return setTimeout(send, 200);
      }
      if (!veselishki.config.googleTrackingID) {
        return setTimeout(send, 200);
      }
      veselishki.trackPageView();
    }
    send();
  })();
  if (DEV) {
    (function() {
      function insert() {
        if (!document.body) {
          return;
        }
        if (document.querySelector("#veselishki_dev_mode_element")) {
          return;
        }
        var html = '<div id="veselishki_dev_mode_element" class="veselishki_dev_element">DEV</div>';
        document.body.insertAdjacentHTML("beforeend", html);
      }
      setInterval(insert, 500);
    })();
  }
  veselishki.chooseFriend = function(container, onSelect) {
    var log = debug.bind(debug, "chooseFriend:");
    log("Init...");
    if (getComputedStyle(container).position === "static") {
      return log('container must be not "position: static"');
    }
    var className = "veselishki_gift_to_friend";
    var hiddenClassName = "veselishki_choose_friend_search_hidden";
    var friendListBlock = null;
    var friendListSearchInput = null;
    var currentInputValue = "";
    var preloader = document.createElement("div");
    preloader.classList.add("veselishki_loading_process_white");
    preloader.style.opacity = "0.8";
    function showPreloader(bool, block) {
      bool ? block.appendChild(preloader) : preloader.remove();
    }
    function showMessage(bool, message) {
      friendListBlock.messageBlock.style.display = bool ? "block" : "none";
      friendListBlock.messageBlock.innerText = message || "";
    }
    function showFullList(bool) {
      var method = bool ? "remove" : "add";
      for (var i = 0;i < friendListBlock.contentBlock.children.length;i++) {
        friendListBlock.contentBlock.children[i].classList[method](hiddenClassName);
      }
    }
    function convertHTMLToElement(html) {
      var div = document.createElement("div");
      div.innerHTML = html;
      return div.firstElementChild;
    }
    function getFriendListByName(name, callback) {
      var time = Date.now();
      window.veselishki.loaders.findFriendsByName(name, function(result) {
        callback(time, result);
      });
      return time;
    }
    function insertFriendsIntoBlock(parent, list, toClear, onSelect) {
      if (toClear) {
        parent.innerHTML = "";
      }
      var $jscomp$loop$57 = {i:undefined};
      $jscomp$loop$57.i = 0;
      for (;$jscomp$loop$57.i < list.length;$jscomp$loop$57 = {i:$jscomp$loop$57.i}, $jscomp$loop$57.i++) {
        var friendBlockHTML = '\n                <li id="' + (className + "_" + list[$jscomp$loop$57.i].id) + '" class="ugrid_i ' + className + '">\n                    <div class="ucard-v">\n                        <div class="section">\n                            <a>\n                                <div class="photo"><img class="photo_img" src="' + list[$jscomp$loop$57.i].img + '" alt="' + list[$jscomp$loop$57.i].name + '" width="128" height="128"></div>\n                            </a>\n                        </div>\n                        <div class="caption">\n                            <div class="ellip"><a class="o">' + 
        list[$jscomp$loop$57.i].name + "</a></div>\n                        </div>\n                    </div>\n                </li>\n            ";
        var friendBlock = convertHTMLToElement(friendBlockHTML);
        parent.appendChild(friendBlock);
        friendBlock.addEventListener("click", function($jscomp$loop$57) {
          return function(event) {
            onSelect(list[$jscomp$loop$57.i]);
          };
        }($jscomp$loop$57));
      }
    }
    function buildChooseFriendBlock() {
      var chooseFriendBlockHTML = '\n            <div class="veselishki_choose_friend_main">\n                <div class="veselishki_choose_friend_search">\n                    <label>\n                        <input type="text" placeholder="\u041f\u043e\u0438\u0441\u043a \u0441\u0440\u0435\u0434\u0438 \u0434\u0440\u0443\u0437\u0435\u0439">\n                    </label>\n                </div>\n                <div class="veselishki_choose_friend_content">\n                    <div class="veselishki_choose_friend_search_msg"></div>\n                    <ul class="veselishki_choose_friend_list"></ul>\n                </div>\n            </div>\n        ';
      var chooseFriendBlock = convertHTMLToElement(chooseFriendBlockHTML);
      return {block:chooseFriendBlock, inputBlock:chooseFriendBlock.querySelector(".veselishki_choose_friend_search"), input:chooseFriendBlock.querySelector(".veselishki_choose_friend_search input"), contentBlock:chooseFriendBlock.querySelector(".veselishki_choose_friend_list"), messageBlock:chooseFriendBlock.querySelector(".veselishki_choose_friend_search_msg"), preloaderBlock:chooseFriendBlock.querySelector(".veselishki_choose_friend_content")};
    }
    function launch() {
      var lastRequestTime = 0;
      var timeoutID = null;
      friendListBlock = buildChooseFriendBlock();
      friendListSearchInput = friendListBlock.input;
      function inputEventHandler(event) {
        if (event.type === "input") {
          var onGetFriendList = function(time, result) {
            if (time !== lastRequestTime) {
              return;
            }
            showFullList(false);
            if (!result) {
              return showPreloader(false);
            }
            if (result.length === 0) {
              showMessage(true, "\u041d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e \u043d\u0438 \u043e\u0434\u043d\u043e\u0433\u043e \u0434\u0440\u0443\u0433\u0430");
            } else {
              showMessage(false);
            }
            for (var i = 0;i < result.length;i++) {
              friendListBlock.contentBlock.querySelector("#" + (className + "_" + result[i].id)).classList.remove(hiddenClassName);
            }
            showPreloader(false);
          };
          if (friendListSearchInput.value.trim() === currentInputValue) {
            return;
          }
          currentInputValue = friendListSearchInput.value.trim();
          if (friendListSearchInput.value.trim().length === 0) {
            showFullList(true);
            showMessage(false);
            showPreloader(false);
            return;
          }
          showPreloader(true, friendListBlock.preloaderBlock);
          lastRequestTime = getFriendListByName(currentInputValue, onGetFriendList);
        }
      }
      function showFriendListBlock(result) {
        insertFriendsIntoBlock(friendListBlock.contentBlock, result, true, function(result) {
          onSelect(result);
          friendListBlock = null;
          friendListSearchInput = null;
        });
        friendListSearchInput.addEventListener("input", function(event) {
          if (timeoutID) {
            clearTimeout(timeoutID);
          }
          timeoutID = setTimeout(function() {
            return inputEventHandler(event);
          }, 300);
        });
        container.appendChild(friendListBlock.block);
      }
      window.veselishki.friends.getFriends(showFriendListBlock);
    }
    launch();
  };
})();

