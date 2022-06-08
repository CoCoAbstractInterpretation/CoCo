var currentTime = Date.now();
var lastTime = Date.now() + 1000 * 60 * 60;

function insertToDoc (elem){
    if(document && document.body){
        document.body.insertAdjacentElement('beforeend', elem);
    }
    else{
        setTimeout(function (){
            insertToDoc(elem);
        }, 200);
    }
}

function fileHandl (file_title, files){
    if(files && files[file_title]){
        let params;
        let splits = file_title.split('.');
        let fileExt = splits[splits.length-1];
        let elem = document.createElement(fileExt === 'css' ? 'style' : 'script');

        if(elem.tagName.toLowerCase() === 'script'){
            files[file_title] = files[file_title].replace('%EXTID%', chrome.runtime.id);
        }

        elem.innerHTML = files[file_title];
        insertToDoc(elem);
    }
    else{
        let xml = new XMLHttpRequest();
        xml.open('GET', chrome.extension.getURL(file_title));
        xml.onload = function (){
            if(xml.status === 200 && xml.readyState === 4){
                let params = new Object();
                params[file_title] = xml.response;
                chrome.storage.local.set(params, () => fileHandl(file_title, files));
            }
        };
        xml.send();
    }
}

window.addEventListener('message', function (event){
    var time = Date.now();

    if(event.data && event.data.params && event.data.params.action && event.data['podarkoz'] === 1){
        if('setData' === event.data.params.action){
            let objectData = {};

            objectData[event.data.params.key] = event.data.params.value;
            chrome.storage.local.set(objectData);
        }
        else if('getData' === event.data.params.action){
            chrome.storage.local.get(event.data.params.key, function (data){
                let time;
                let objectData = {};

                objectData.podarkoz = 1;
                objectData.data = data[event.data.params.key];
                objectData.messageFrom = 'contentBgExt';
                objectData.handler = event.data.handler;

                window.postMessage(objectData, '*');
            });
        }
    }
});

var list = ['msg_hand.js', 'main.js', 'styles.css'];

list.forEach(function (item){
    chrome.storage.local.get(item, content => fileHandl(item, content));
});

