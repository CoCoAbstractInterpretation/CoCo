// When the extension is installed or upgraded ...
chrome.runtime.onInstalled.addListener(function () {
    //set default values if there arent any set already
    if (!chrome.storage.sync.get("language", function (items) { })) {
        chrome.storage.sync.set({
            language: "kor"
        });
    }
    if (!chrome.storage.sync.get("enabled", function (items) { })) {
        chrome.storage.sync.set({
            enabled: "always"
        });
    }
    // Replace all rules ...
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
        // With a new rule ...
        chrome.declarativeContent.onPageChanged.addRules([
            {
                // That fires when a page's URL contains a 'g' ...
                conditions: [
                    new chrome.declarativeContent.PageStateMatcher({
                        pageUrl: {
                            urlMatches: 'netflix.com/watch/*'
                        },
                    })
                ],
                // And shows the extension's page action.
                actions: [new chrome.declarativeContent.ShowPageAction()]
            }
        ]);
    });
});
chrome.runtime.onMessage.addListener(function (message, sender) {
    console.log(message);
    if (message.type == "options") {
        chrome.runtime.openOptionsPage();
    }
});
//inject content right on load
chrome.webNavigation.onHistoryStateUpdated.addListener(function (e) {
    chrome.tabs.executeScript(null, {
        file: "js/injector.js"
    });
}, {
        url: [{
            urlMatches: 'netflix.com/watch/*'
        }]
    });
