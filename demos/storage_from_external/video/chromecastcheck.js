function L64_CheckChromecastVideos() {
    var list = false;
    try {
        list = window.ytplayer.config.args.url_encoded_fmt_stream_map;
    }
    catch (ex) {
        return;;
    }
    var u = { URL: "url=", ITAG: "itag=", SIG: "sig=" }; 
    var CONN = "conn=";
    var formats = [18, 22, 37, 38];
    var lastiTag = 0;
    var bestURL = false;
    list = list.split(",");
    for (var i in list) {
        //list[i] = unescape(list[i]);
        var p = list[i].split("&");
        var url = false;
        for (var j in p) {
            if (p[j].indexOf(u.URL) != -1) { url = p[j].split(u.URL)[1]; url = unescape(url); }
            if (p[j].indexOf(u.ITAG) != -1) { var itag = parseInt(p[j].split(u.ITAG)[1]); }
            if (p[j].indexOf(u.SIG) != -1) { var sig = p[j].split(u.SIG)[1]; }
            if (p[j].indexOf(u.CONN) != -1) { var conn = p[j].split(u.CONN)[1]; }
        }
        if (sig && url && url.indexOf("signature") == -1) {
            url += "&signature=" + sig;
        }
        if (!url) {
            continue;
        }
        if (formats.indexOf(itag) == -1) {
            continue;
        }
        if (itag < lastiTag) {
            continue;
        }
        bestURL = url;
        lastiTag = itag;
    }
    if (bestURL !== false) {
       // alert("Found");
        var link = { url: bestURL, title: document.title };
        if ( bestURL.indexOf("signature") == -1)  {
            link.url = "CANNOTPLAY"; 
        }
        link.noDL = true;
        var msg = { "msg": "msgAddLinks", "url": document.location.href, "link": [link] };
		var event = new CustomEvent('link64_msgAddLinks', {detail: msg});
		document.dispatchEvent(event);
		
       // chrome.runtime.sendMessage("fbmnabgkgepaeaaaefbcifghilmficbd", msg); 
       // chrome.runtime.sendMessage("mlhmlmnkpgbbhkfngfbfhjnodaojojgm", msg); 
       // chrome.runtime.sendMessage("elicpjhcidhpjomhibiffojpinpmmpil", msg); //StoreId
        
    }
}

L64_CheckChromecastVideos(); 