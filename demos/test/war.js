// console.log("in war in test demo");
// views = chrome.extension.getViews();
// console.log(views);
// background = chrome.extension.getBackgroundPage()
// console.log(background);
// background.postMessage("wat sent message", "*");
// window.addEventListener("message", function(message){
//   console.log("war got message");
// });


// // New file: download/download.js
// chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
//       console.log("external message jianjia in test demo");
//     if (typeof request !== 'object') {
//         return;
//     }
//     if (request.action == "isinstall") {
//         sendResponse({
//             res: "yes"
//         })
//     }
//     return true;
// });
// var xhr = null;
// chrome.runtime.onConnectExternal.addListener(function(port) {
//     if (port.name === 'nrdownload') {
//         port.onMessage.addListener(function(msg) {
//             if (typeof msg !== 'object') {
//                 return;
//             }
//             if (msg.action == "isinstall") {
//                 port.postMessage({
//                     res: "yes"
//                 })
//             } else if (msg.action === 'download') {
//                 download(msg.url, function(data) {
//                     const arrayBuffer = data;
//                     const view = new Uint8Array(arrayBuffer);
//                     const array = Array.from(view);
//                     port.postMessage({
//                         state: 'success',
//                         data: array
//                     });
//                 }, function(data) {
//                     port.postMessage({
//                         state: 'error',
//                         data: data
//                     });
//                 }, function(data) {
//                     port.postMessage({
//                         state: 'progress',
//                         data: data
//                     });
//                 });
//             } else if (msg.action === 'cancel') {
//                 xhr.abort();
//             }
//             return true;
//         });
//     }
// });

// function download(url, success, error, progress) {
//     if (xhr != null) {
//         xhr.abort();
//     }
//     xhr = new XMLHttpRequest();
//     xhr.open("get", url);
//     xhr.onprogress = function(event) {
//         if (progress != null) {
//             progress({
//                 'loaded': event.loaded,
//                 'total': event.total
//             });
//         }
//     };
//     xhr.onload = function() {
//         if (xhr.status >= 400) {} else {
//             var response = xhr.response;
//             if (success != null) {
//                 success(response);
//             }
//         }
//     };
//     xhr.onerror = function(event) {
//         if (error != null) {
//             error(event.statusText);
//         }
//     };
//     try {
//         xhr.open('GET', url);
//         xhr.responseType = 'arraybuffer';
//         xhr.send();
//     } catch (e) {}
// }
