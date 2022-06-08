
chrome.runtime.onConnect.addListener(
  function(port) {
  // port.postMessage('hello');
  // console.assert(port.name == "knockknock");
  port.onMessage.addListener(function(msg) {
    // console.log(msg);
    if (msg.data.cmd == "mostVisitedSites")
      chrome.topSites.get(function (mostVisitedUrls) {
            // console.log(mostVisitedUrls);
            port.postMessage(mostVisitedUrls);
        });
  });
}
);
