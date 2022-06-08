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
        install: "Um dieses Funktion von Video Downloader professional verwenden zu können muss die chromecast-Erweiterung von Google installiert sein. Wollen Sie diese Erweiterung nun installieren?",
        enable: "Sie müssen die chromecast-Erweiterung aktivieren um diese Funktion nutzen zu können. Soll die Erweiterung aktiviert werden?"
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