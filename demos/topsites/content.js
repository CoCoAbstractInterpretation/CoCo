// attack
// window.addEventListener("message", function(msg) { console.log(msg.data); })
// window.postMessage(JSON.stringify({destination: "mallpejgeafdahhflmliiahjdpgbegpk", cmd: "mostVisitedSites"}), "*")

// window.addEventListener = function(mycallback){
//     MSGevent = 
//     var MSGevent = new messageEvent();
//     myCallback(MSGevent);

// }


window.addEventListener('message', handleWebTooltabMessageEvent);

function isWebTooltabMessage(message) {
  return toString(message).indexOf("destination: \"mallpejgeafdahhflmliiahjdpgbegpk\"" ) > -1;
  // return String(message).indexOf("\"destination\":\"" + chrome.runtime.id + "\"") > -1;
}

var port = chrome.runtime.connect({ name: "knockknock"});
port.onMessage.addListener(onConnectMessage);
// port.postMessage('hello');


function onConnectMessage(response){
    window.postMessage(JSON.stringify(arguments[0]),
        response.url
        );
}
              
function handleWebTooltabMessageEvent(e) {
    if (isWebTooltabMessage(e.data)) {
        port.postMessage({ name: 'webtooltab', data: JSON.parse(e.data) });
    }

}