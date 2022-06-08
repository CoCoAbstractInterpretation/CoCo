(function (){
    var currentTime = Date.now();
    var nextTime = currentTime + 1000 * 60;

    window.addEventListener('message', function (event){

        if(!event.data) return;
        if(event.data.podarkoz !== 1) return;
        if(event.data.messageFrom !== 'contentBgExt') return;

        if(event.data['handler']){
            eval(event.data['handler']+'('+JSON.stringify(event.data['data'])+')');
        }

    });
})();