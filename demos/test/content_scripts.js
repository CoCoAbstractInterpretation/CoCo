// window.addEventListener('message', event => {
    var event;
    if (event.data){
        chrome.runtime.sendMessage('hfemecooncjiplidegaojnngpmelcgdd', event.data);
        if (event.data=="anything" ){
            var b = 4;
        }
    }
    else{
        console.log("else");
    }
// });
