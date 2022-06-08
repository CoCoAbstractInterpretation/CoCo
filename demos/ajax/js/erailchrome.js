var RequestQ = [],
    plugdata = null,
    IRTab = null,
    IRData = null,
    requestFilter = {
        urls: ["<all_urls>"]
    };
chrome.webRequest.onBeforeSendHeaders.addListener(function(a) {
    a = a.requestHeaders;
    try {
        if (plugdata != null) {
            plugdata.Referer != undefined && plugdata.Referer != "" && mod_headers(a, "Referer", plugdata.Referer);
            plugdata.Cookie != undefined && plugdata.Cookie != "" && mod_headers(a, "Cookie", plugdata.Cookie)
        }
    } catch (b) {}
    return {
        requestHeaders: a
    }
}, requestFilter, ["requestHeaders", "blocking"]);
chrome.runtime.onMessage.addListener(function(a, b, c) {
    $.extend(a, {
        TabID: b.tab.id
    });
    window.plugdata = a;
    switch (a.Action) {
        case "ONLOAD":
            c(IRData);
            break;
        case "ONRESULT":
            SendMessage(a.Action, a.Data, b.tab.id);
            c({});
            break;
        case "GETIRCTCFARE":
            IRData = a;
            $.extend(a, {
                RequesterTabID: b.tab.id
            });
            chrome.tabs.query({}, OngetAllInWindow);
            c({});
            break;
        case "IRCTCFareResult":
            SendMessage(a.Action, a.Data, a.Data.RequesterTabID);
            break;
        case "GETCOOKIE":
            // RequestQ.push(a);
            // DownloadData();
            // c({})
            GetIRCookie(a, b.tab.id);
            break;
        case "GET_BLOB":
            toDataUrl(a.URL, function(d) {
                a.Data = d;
                SendMessage("ONRESULT", a, a.TabID)
            });
            c({});
            break;
        default:
            // GetIRCookie(a, b.tab.id);
            RequestQ.push(a);
            DownloadData();
            c({})
    }
});

function toDataUrl(a, b) {
    var c = new XMLHttpRequest;
    c.onload = function() {
        var d = new FileReader;
        d.onloadend = function() {
            b(d.result)
        };
        d.readAsDataURL(c.response)
    };
    c.open("GET", a);
    c.responseType = "blob";
    c.send()
}

function GetIRCookie(a, b) {
    chrome.cookies.getAll({
        domain: plugdata.URL
    }, function(c) {
        var d = [];
        $(c).each(function() {
            d.push({
                name: this.name,
                value: this.value,
                domain: this.domain,
                secure: this.secure,
                path: this.path
            })
        });
        a.Data = JSON.stringify(d);
        SendMessage("ONRESULT", a, b)
    })
}

function DownloadData() {
    if (RequestQ.length != 0) {
        var a = RequestQ[0];
        plugdata = a;
        a.Method == "GET" ? x = x+1: $.post(a.URL,  a.post, function(b) {
            a.Data = b;
            if (typeof b === "string") a.Data = b.replace(/<img .*?>/g, "").replace(/<form .*?>/g, "<form action=''>").replace(/<FORM .*?>/g, "<form action=''>");
            SendMessage("ONRESULT", a, a.TabID);
            // DownloadData()
        }).fail(function() {
            a.Data = "Error";
            SendMessage("ONRESULT", a, a.TabID);
            // DownloadData()
        }).always(function() {}) 
        RequestQ.shift()
    }
}

// function DownloadData() {
//     if (RequestQ.length != 0) {
//         var a = RequestQ[0];
//         plugdata = a;
//         a.Method == "GET" ? $.post(a.URL,  a.post, function(b) {
//             a.Data = b;
//             if (typeof b === "string") a.Data = b.replace(/<img .*?>/g, "").replace(/<form .*?>/g, "<form action=''>").replace(/<FORM .*?>/g, "<form action=''>");
//             SendMessage("ONRESULT", a, a.TabID);
//             DownloadData()
//         }).fail(function() {
//             a.Data = "Error";
//             SendMessage("ONRESULT", a, a.TabID);
//             DownloadData()
//         }).always(function() {}) : $.get(a.URL,function(b) {
//             a.Data = b;
//             if (typeof b === "string") a.Data = b.replace(/<img .*?>/g, "").replace(/<form .*?>/g, "<form action=''>").replace(/<FORM .*?>/g, "<form action=''>");
//             SendMessage("ONRESULT", a, a.TabID);
//             DownloadData()
//         }).fail(function() {
//             a.Data = "Error";
//             SendMessage("ONRESULT", a, a.TabID);
//             DownloadData()
//         });
//         RequestQ.shift()
//     }
// }

function SendMessage(a, b, c) {
    chrome.tabs.sendMessage(c, {
        Action: a,
        Data: b
    }, function() {
        plugdata = null
    })
}

function OngetAllInWindow(a) {
    for (var b = 0; b < a.length; b++)
        if (a[b].url.toLowerCase().indexOf(plugdata.URL.toLowerCase()) > -1) {
            SendMessage(plugdata.Action, plugdata, a[b].id);
            break
        }
}

function rem_headers(a, b) {
    var c = -1,
        d = 0,
        e;
    for (e in a) {
        if (a[e].name == b) c = d;
        d++
    }
    c != -1 && a.splice(c, 1)
}

function mod_headers(a, b, c) {
    var d = false,
        e;
    for (e in a) {
        var f = a[e];
        if (f.name == b) {
            f.value = c;
            d = true
        }
    }
    d || a.push({
        name: b,
        value: c
    })
};