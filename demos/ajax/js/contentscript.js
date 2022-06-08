var Version = "6.2",
    plugdata = null,
    query = [];
window.addEventListener("message", function(a) {
    if (a.data != undefined) {
        plugdata = a.data;
        if (plugdata.Action != undefined) switch (plugdata.Action) {
            case "GETCOOKIE":
                chrome.runtime.sendMessage(plugdata, function() {});
                break;
            default:
                if (plugdata.background == undefined || plugdata.background == false) $("#divDetail").html("<br/><center><img src='https://erail.in/images/progress.gif' /> Please wait....<br/>Please click on link again if you do not get status in 1 min.<br/><div id='divAvlCtr'></div></center>");
                chrome.runtime.sendMessage(plugdata,
                    function() {})
        }
    }
});
chrome.runtime.onMessage.addListener(function(a, b, c) {
    switch (a.Action) {
        case "IRCTCFareResult":
        case "ONRESULT":
            a = a.Data;
            SendMessageToMainPage(a.Action, a.Message, typeof a.Data === "string" ? a.Data : JSON.stringify(a.Data));
            break;
        case "GETIRCTCFARE":
            GetIRCTCFare(a)
    }
    c({})
});

function SendMessageToMainPage(a, b, c) {
    $("#IRData").val(c);
    $("#IRMessage").html(b);
    $("#IRCommand").html(a)
}
$(document).ready(function() {
    if (location.href.indexOf("?") > 0) {
        var a = location.href.split("?")[1].split("&");
        $(a).each(function() {
            var b = this.split("=");
            query[b[0]] = b[1]
        })
    }
    SendMessageToMainPage("VERSION", "{}", Version);
    SendMessageToMainPage("ONLOAD", "{}", "");
    if (location.href.indexOf("irctc.co.in") > 0) {
        $("#demon_shade").remove();
        $("#demon_container").remove();
        $("input.loginCaptcha").focus();
        if (query.irctcaction != undefined) {
            SaveInLocalStorage("irctc_action", query.irctcaction);
            SaveInLocalStorage("irctc_train",
                query.train);
            SaveInLocalStorage("irctc_from", query.from);
            SaveInLocalStorage("irctc_fromname", GetIRCTCStation(query.from));
            SaveInLocalStorage("irctc_to", query.to);
            SaveInLocalStorage("irctc_toname", GetIRCTCStation(query.to));
            SaveInLocalStorage("irctc_class", query["class"]);
            SaveInLocalStorage("irctc_quota", query.quota);
            SaveInLocalStorage("irctc_date", query.date)
        }
        $("input.loginCaptcha").keyup(function() {
            if (this.value.length == 5) {
                $("input.loginCaptcha").val(this.value.toUpperCase());
                $("#loginbutton").click()
            }
        });
        FillIRCTCForms()
    }
});

function GetIRCTCStation(a) {
    for (var b = 0; b < stationName.length; b++)
        if (stationName[b].indexOf(" - " + a) > -1) return stationName[b];
    return a
}

function FillIRCTCForms() {
    if (location.href.indexOf("https://www.irctc.co.in/eticketing/home") > -1) {
        var a = LoadFromLocalStorage("irctc_action", "");
        SaveInLocalStorage("irctc_action", "");
        switch (a) {
            case "seats":
                fillSearch()
        }
    }
}

function fillSearch() {
    $(".rf-tab-cnt").find('input[id^="jpform"]').filter(function() {
        this.id.indexOf("fromStation") != -1 && $(this).val(LoadFromLocalStorage("irctc_fromname"));
        this.id.indexOf("toStation") != -1 && $(this).val(LoadFromLocalStorage("irctc_toname"));
        this.id.indexOf("journeyDateInputDate") != -1 && $(this).val(LoadFromLocalStorage("irctc_date"));
        this.id.indexOf("jpsubmit") != -1 && $(this).css("background-color", "green").click()
    });
    setTimeout(function() {
        $('input:radio[name="quota"][value="' + LoadFromLocalStorage("irctc_quota") +
            '"]').attr("checked", true)
    }, 100)
}

function SaveInLocalStorage(a, b) {
    try {
        window.localStorage.removeItem(a);
        window.localStorage.setItem(a, b)
    } catch (c) {}
    return true
}

function LoadFromLocalStorage(a, b) {
    try {
        var c = window.localStorage.getItem(a);
        return b && !c ? b : c
    } catch (d) {
        return b
    }
};