// chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
//   if (request.data) {
//     chrome.storage.sync.set({'access_token': request.data.access_token}, function() {
//       sendResponse(true);
//     });
//   }
// });