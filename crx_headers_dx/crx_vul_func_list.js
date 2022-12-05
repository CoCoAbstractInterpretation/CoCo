
// Two catogories of vulnerabilities
// 1. SET1->SET2->SET3
// 2. SET1->SET4
// effective_sanitization: to move out exploitable ones

// SET 1
attacker_dispatchable_events = [
    // from console to content script
    "window.postMessage",
    "window.dispathEvent",
    "document.dispathEvent",
    "element.dispathEvent",
    // from app/other extension to background
    "chrome.runtime.sendMessage",  
    "chrome.runtime.connect" 
]

// SET 2
chrome_data_exfiltration_APIs = [
    "chrome.cookies.get",
    "chrome.cookies.getAll",
    "chrome.cookies.getAllCookieStores",
    "chrome.cookies.onChanged.addListener",
    "chrome.topSites.get",
    "chrome.storage.sync.get",
    "chrome.storage.local.get",
    "chrome.history.search",
    "chrome.history.getVisits",
    "chrome.downloads.search",
    "chrome.downloads.getFileIcon",
    "chrome.bookmarks.getTree",
    "chrome.management.getAll",
    "chrome.management.getSelf",
    "window.localStorage.getItem"
]

// SET 3
message_out_APIs = [
"port.postMessage where port = chrome.runtime.connect",
"sendResponse in chrome.runtime.onMessageExternal.addListener",
"window.postMessage"
]

// SET 4
chrome_API_execution_APIs = [
    "chrome.tabs.executeScript",
    "chrome.tabs.create",
    "chrome.tabs.update",
    "chrome.cookies.set",
    "chrome.cookies.remove",
    "chrome.storage.sync.set",
    "chrome.storage.sync.remove",
    "chrome.storage.sync.clear",
    "chrome.storage.local.set",
    "chrome.storage.local.remove",
    "chrome.storage.local.clear",
    "chrome.history.addUrl",
    "chrome.history.deleteUrl",
    "chrome.history.deleteRange",
    "chrome.history.deleteAll",
    "chrome.downloads.download",
    "chrome.downloads.pause",
    "chrome.downloads.resume",
    "chrome.downloads.cancel",
    "chrome.downloads.open",
    "chrome.downloads.show",
    "chrome.downloads.showDefaultFolder",
    "chrome.downloads.erase",
    "chrome.downloads.removeFile",
    "chrome.downloads.acceptDanger",
    "chrome.downloads.setShelfEnabled",
    "chrome.browsingData.remove",
    "chrome.management.setEnabled",
    "XMLHttpRequest.open",
    "XMLHttpRequest.send",
    "eval",
    "window.localStorage.setItem",
    "window.localStorage.removeItem",
    "window.localStorage.clear",
    "document.write",
    "$.ajax",
    "$.get",
    "$.post",
    "fetch",
    "documentElement.value",
    "documentElement.html"
]

effective_sanitization = [
"event.isTrusted",
"event.origin"
]
// NOTE: event.source does not promise sanitization

// Communication
// ####1. Simple one-time requests

// content_script.js
// cs sends message to bg
chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
  console.log(response.farewell);
});
// cs listens to message from bg
chrome.runtime.onMessage.addListener

// background.js
// bg sends message to cs
chrome.tabs.sendMessage(tabs[0].id, {greeting: "hello"}, function(response) {
    console.log(response.farewell);
  });
// bg listens to message from cs
chrome.runtime.onMessage.addListener

// ####2. Long-lived connections

// content_script.js
// cs create message port with connect
var port = chrome.runtime.connect({name: "knockknock"});
// cs sends message to bg
port.postMessage({joke: "Knock knock"});

// cs listens to message from bg
port.onMessage.addListener(function(msg) {
  if (msg.question === "Who's there?")
    port.postMessage({answer: "Madame"});
  else if (msg.question === "Madame who?")
    port.postMessage({answer: "Madame... Bovary"});
});

// background.js
chrome.runtime.onConnect.addListener(function(port) {
  // bg listens to message from cs
  port.onMessage.addListener(function(msg) {
        // bg listens to message from cs
        port.postMessage({question: "Who's there?"});
  });
});

// ####3. Cross-extension messaging
// background.js listens to External message 
// For simple requests:
chrome.runtime.onMessageExternal.addListener(
  function(request, sender, sendResponse) {
    if (sender.id === blocklistedExtension)
      return;  // don't allow this extension access
    else if (request.getTargetData)
      sendResponse({targetData: targetData});
    else if (request.activateLasers) {
      var success = activateLasers();
      sendResponse({activateLasers: success});
    }
  });

// For long-lived connections:
chrome.runtime.onConnectExternal.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    // See other examples for sample onMessage handlers.
  });
});

// external application send msg to bg
// The ID of the extension we want to talk to.
var editorExtensionId = "abcdefghijklmnoabcdefhijklmnoabc";

// Make a simple request:
chrome.runtime.sendMessage(editorExtensionId, {openUrlInEditor: url},
  function(response) {
    if (!response.success)
      handleError(url);
  });


