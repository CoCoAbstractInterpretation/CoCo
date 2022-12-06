
var injectJs = function (file) {
    var sc = document.createElement('script');
    sc.src = chrome.extension.getURL(file);
    (document.head).appendChild(sc);
}
var injectCss = function (file) {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.type = 'text/css';
    css.href = chrome.extension.getURL(file);
    (document.head).appendChild(css);
}

//wait for jq to inject
setTimeout(function () {
    injectCss("css/content.css");
    injectCss("css/toastr.css");
    injectJs("js/jquery-2.1.4.min.js");
    injectJs("js/content.js");
    injectJs("js/toastr.js");
}, 1000);

//communication
window.addEventListener("message", function (event) {
    if (event.data.jamakFlix && event.data.type) {
        if (event.data.type === "get") {
            chrome.storage.sync.get(null, function (items) {
                window.postMessage({
                    type: "update",
                    settings: items,
                    jamakFlix: true
                }, "*");
            });
        } else if (event.data.type === "set") {
            chrome.storage.sync.set(event.data.setting, function (items) {
            });
        }
    }
}, false);

chrome.storage.onChanged.addListener(function (changes) {
    window.postMessage({
        type: "get",
        jamakFlix: true
    }, "*");
});
