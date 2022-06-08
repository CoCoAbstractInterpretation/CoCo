
function get_param( name )
{
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");

	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( window.location.href );

	if ( results == null )
		return "";
	else
		return results[1];
}
var curlang=navigator.userLanguage || navigator.language;

function UploadUrl( url)
{
    // Is called only on user request
    var url2 = "http://my.startpage24.com/_libs/extension.lib/?cmd=submitvideourl&browser=chrome&url="+url;
    var xmlHttpReq = new XMLHttpRequest();
    xmlHttpReq.open("GET", url2, true);
    xmlHttpReq.onreadystatechange = function(data) 
    {
        if (this.readyState!=4)
            return;
            
        if ( curlang.indexOf("de")>=0)
            alert("Vielen Dank, wir werden unser Bestes geben, um auch diese Seite zu unterstützen!");
        else
           alert("Thank you, we will give our best to support this site, too!");
        window.close();
    }
    xmlHttpReq.send( null);
}

window.addEventListener("load", function()
{
    if ( curlang.indexOf("de")<0)
        var a = document.getElementsByClassName("clDE");
    else
        var a = document.getElementsByClassName("clEN");
    for ( var i=0; i<a.length;i++)
    {
        a[i].style.display="none";
    }
    var url = get_param("url");
    var o = document.getElementById("idSubmitDE");
    o.addEventListener('click', function(data)
    {
        UploadUrl( url);
    });
    var o = document.getElementById("idSubmitEN");
    o.addEventListener('click', function(data)
    {
        UploadUrl( url);
    });
}, false);
