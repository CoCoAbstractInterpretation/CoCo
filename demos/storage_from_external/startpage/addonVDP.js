var nVersion=1; // will be replaced

var fVideo=true;
var defaults=defaults2;

var Frames = defaults.Frames;
var SearchURLs = defaults.SearchURLs;

var VideoSites = defaults.VideoSites;

var fr = {

    slastInner:"",
    fEditMode:false,
    nPages:0,
    nCurPage:0,
    lpToplinkBottomFolder:0,
    lpCurFolder:0,
    nToplinks:0,
    nToplinksPerPage:0,
    nCurFolderLevel:0,
    lpFolderStack:[{"page":"","parent":""},{"page":"","parent":""},{"page":"","parent":""},{"page":"","parent":""},{"page":"","parent":""},{"page":"","parent":""}],
    n1x1Count:0,
    nShoppingMode:0,
    FilterList:new Array(),
    FilterListCount:0,
    curFilter:"",
    fReadCookies:1,
    nCurSearchProvider:0,
    nToRender:0,
    nRenderd:0,
    lpOverlayPos:new Array(),
    lpDragTargets:0,
    curTimer:0,
    curVideo:-1,

    doNI2:function() 
    {
        alert( "Not implemented!");
    },

    doNI:function() 
    {
        alert( "Not implemented!");
    },
    strstr: function(b,c,a)
    {
        var d=0;b+="";d=b.indexOf(c);if(d==-1){return false}else{if(a){return b.substr(0,d)}else{return b.slice(d)}}
    },

FilterToplinks:function ( tl)
{
    var count = tl.length;
    var lwr = this.curFilter.toLowerCase();
    for (var j=0; j<count; j++)
    {
        if ( tl[j].type == "f")
            this.FilterToplinks( tl[j].Toplinks);
        else
        {
            if( tl[j].name.toLowerCase().indexOf( lwr) >= 0 || 
                (tl[j].url && tl[j].url.toLowerCase().indexOf( lwr) >= 0))
            {
                this.FilterList[this.FilterListCount] = tl[j];
                this.FilterListCount++;
            }
        }
    } 
},
        
        
SetVideoFilter:function ( txt)
{
    this.curFilter = txt;
    fr.checkAddButtons();
    this.FilterList = new Array();
    this.FilterListCount = 0;
    
    
    var videofolder = fr.FindToplinkType( 0, "v");
    if ( txt=="")
    {
        fr.doSetFolder( videofolder.id);
    }
    else
    {
        var tl = videofolder.Toplinks;
        var count = tl.length;
        var lwr = this.curFilter.toLowerCase();
        for (var j=0; j<count; j++)
        {
            if( tl[j].name.toLowerCase().indexOf( lwr) >= 0 || 
                (tl[j].url && tl[j].url.toLowerCase().indexOf( lwr) >= 0))
            {
                this.FilterList[this.FilterListCount] = tl[j];
                this.FilterListCount++;
            }
        } 
        this.lpCurFolder = new Object();
        this.lpCurFolder.id=0;
        this.lpCurFolder.type="v";
        this.lpCurFolder.Toplinks = this.FilterList;
        this.nCurPage=0;
    }
    this.doResize();
},

SetFilter:function ( txt)
{
    fr.SetVideoFilter(txt);
},

doSetFolder:function ( id)
{
    if ( this.lpCurFolder && id == this.lpCurFolder.id)
        return;
    
    fr.curTimer++;
    if ( id<0) // one level up
    {
        if ( this.nCurFolderLevel>0)
            this.nCurFolderLevel--;
        this.nCurPage = this.lpFolderStack[this.nCurFolderLevel].page;
        var tl = fr.FindToplink( 0, this.lpFolderStack[this.nCurFolderLevel].id);
        if ( tl)
            this.lpCurFolder = tl;
        else
            this.lpCurFolder = 0;
        this.doResizeHome();   
        
        fr.doShowHelp();
        fr.checkAddButtons();
        return;
    }
    
    var tl = fr.FindToplink( 0, id);

    this.ReloadFolder( tl);
    fr.checkAddButtons();
    fr.doShowHelp();
},

checkAddButtons:function()
{
    if ( !fr.curFilter && fr.settings.fShowToplinks && ( !fr.lpCurFolder || fr.lpCurFolder.type=="f"))
    {
        fr.jq.showD("#idAddFolder");
        fr.jq.showD("#idAddUrl");
    }
    else
    {
        fr.jq.hideD("#idAddFolder");
        fr.jq.hideD("#idAddUrl");
    }
    if ( fr.lpCurFolder && fr.lpCurFolder.type == "v")
    {
        fr.CreateVideoBar();
        fr.jq.showD("#idVideobar");
        fr.jq.hideD("#idBestofbar");
    }
    else
    {
        fr.jq.hideD("#idVideobar");
        fr.jq.showD("#idBestofbar");
    }
},
ReloadFolder:function( folder)
{        
    if ( fVideo && folder.type == "v")
    {
        fr.lpFolderStack[fr.nCurFolderLevel].page = fr.nCurPage;
        fr.lpFolderStack[fr.nCurFolderLevel].id = fr.lpCurFolder ? fr.lpCurFolder.id : -1;
        fr.nCurFolderLevel++;
        fr.lpCurFolder = folder;
        fr.lpCurFolder.Toplinks = new Array();
        
        var dataitems = L64P.video.getWatchedItems({},function(data)
        {
            fr.ConvertVideoData( data.items);
            fr.doResizeHome();
        }); 
        
        if (typeof(dataitems) != 'undefined')
            if ( dataitems)
                fr.ConvertVideoData( dataitems);
                
        fr.nCurPage=0;
        fr.doResizeHome();        
    }
},


ConvertVideoData:function( dataitems)
{
    fr.lpCurFolder.Toplinks = new Array();
    for (var i=0; i<dataitems.length; i++) 
    {
        var item = dataitems[i];
    
        var o = new Object();
        o.playhtml = item.html;
        o.searchurl="";
        o.type="video"
        o.url = item.video_url;
        //alert( i+": "+print_r(item));
        o.thumb=item.thumbnail_url;
        o.name = item.title;
        o.videoid = item.videoid;
        o.p1x1="";
        o.id=fr.nextfreeid++;
        if ( fr.lpCurFolder && fr.lpCurFolder.Toplinks && fr.lpCurFolder.type=="v")
            fr.lpCurFolder.Toplinks.push(o);
    }
},

resizeIFrame:function( )
{
    var o1 = document.getElementById("idPlayVideoThumbs"); 
    var o2 = document.getElementById("idPlayVideoInner"); 
    if ( !o2)
        return;
    var o3 = o2.firstChild;
    if ( !o3)
        return;
    var o4 = document.getElementById("idSlideshow"); 
    if ( !o4)
        return;
    if ( o4)
    {
        var dx = o4.offsetWidth;
        var dy = o4.offsetHeight;
        o3.id="idPV";
        o2.style.left="16px";
        o2.style.top="100px";
        o3.width=dx-300;
        o3.height=dy-60-18;
        o1.style.height=(dy-36)+"px";
    }
},

GetTagParam:function( s, tag)
{
    var i = s.indexOf(tag+'="');
    if ( i>=0)
    {
        i+=tag.length+2;
        var i2 = s.indexOf('"', i);
        if ( i2>i)
            return s.substr(i,i2-i);
    }
    var i = s.indexOf(tag+"='");
    if ( i>=0)
    {
        i+=tag.length+2;
        var i2 = s.indexOf("\'", i);
        if ( i2>i)
            return s.substr(i,i2-i);
    }
    return false;
        
    
},

videoPlaying:false,
PlayVideo:function( o)
{
    if ( !fVideo)
        return;
    if ( !o)
    {
        fr.videoPlaying=false;
        fr.removeAllChilds(document.getElementById("idPlayVideoInner"));
        fr.removeAllChilds(document.getElementById("idPlayVideoThumbs"));
        fr.jq.hideD("#idPlayVideo");
        fr.ShowToplinks(fr.settings.fShowToplinks);
        fr.doResize();
        fr.doShowHelp();
        document.title = fr.title;        
        return;
    }
    document.title = o.name;
    //document.title = "dummy";
    fr.videoPlaying=true;
    fr.doShowHelp();
    //var s="<a href='"+o.url+"'>"++"</a>";
    fr.jq.setText("#idVideoTitleA",t["original"]);
    fr.jq.setAttr("#idVideoTitleA", "href", o.url);
    fr.jq.setText("#idVideoClose",t["close"]);
    //fr.myBindClick("#idVideoTitle", { }, function(ev) {fr.removeAllChilds(document.getElementById("idPlayVideoInner"));window.location.replace( o.url);return false;});
    
    if ( o.playhtml)    
    {
        o.playhtml = o.playhtml.replace( "src=\"//","src=\"http://");
        fr.removeAllChilds(document.getElementById("idPlayVideoInner"));
        if ( o.playhtml.indexOf( "<iframe")==0)
        {
            var url = fr.GetTagParam( o.playhtml, "src");
            fr.co( 'iframe',document.getElementById("idPlayVideoInner"),{"id":'idPV',"src":url});
        }
        else
        {
            fr.co( 'iframe',document.getElementById("idPlayVideoInner"),{"id":'idPV',"src":"http://my.startpage24.com/_libs/extension.lib/index.php?cmd=Show&url="+o.url});
        }
        fr.resizeIFrame();
    }
    fr.jq.showD("#idPlayVideo");
    //fr.myBindClick("#idPlayVideo", { }, function(ev) {fr.PlayVideo(0);return false;});
    fr.myBindClick("#idVideoClose", { }, function(ev) {fr.PlayVideo(0);return false;});
    fr.myBindClick("#idPlayVideoBg", { }, function(ev) {fr.PlayVideo(0);return false;});
    fr.myBindClick("#idPlayVideoThumbs", { }, function(ev) {fr.PlayVideo(0);return false;});
    
    fr.jq.hideD("#idToplinks");
    
    fr.removeAllChilds(document.getElementById("idPlayVideoThumbs"));
    if ( !fr.curvideolist)
        return;
        
    var j = 0;
    var y=0;
    
    var a = new Array();
    var m = 0;
    var len=fr.curvideolist.length;
    for ( var i = 0; i < len; i++)
    {
        var cur = fr.curvideolist[i];
        if ( cur.url == o.url)
        {
            if ( i > 0)
                a.push( fr.curvideolist[i-1]);
            else
            {
                len--;
                a.push( fr.curvideolist[len]);
            }
            for ( var j = i+1; j < len; j++)
                a.push(fr.curvideolist[j]);
            for ( j=0; j+1 < i; j++)
                a.push(fr.curvideolist[j]);
            break;
        }
    }
    
    for ( var i = 0; i < a.length; i++)
    {
        var cur = a[i];
        if ( cur.type != "video")
            continue;        
            
        var oDiv = fr.co('div',document.getElementById("idPlayVideoThumbs"),{"style":"top:"+y+"px;background:#000", "id":"idv_"+j,"class":"clVideo"});
        var oA = fr.co('a',oDiv,{});
        
        y+=136;
        var thumb = fr.GetToplinkThumb(cur);
        var si = GetImageSize(thumb);
        var oInner = fr.createVideoItemHtml(j,cur,thumb, 224,126,si); 
        if ( oInner)
            oA.appendChild(oInner);
        var oDiv2 = fr.co('div',oDiv,{"id":"id4v_"+j,"class":"clOverlay"});
        var oA = fr.co('a',oDiv2,{});
        oA.textContent = cur.name;
        fr.myBindClick("#idv_" + j, { param: cur }, function (ev) {
            //ev.preventDefault();
            //ev.stopPropagation();
            //alert("play " + ev.data.param);
            fr.PlayVideo(ev.data.param);
            return false;});
        fr.myBindIn("#idv_"+j, { param: 'id4v_'+j }, function(ev) {
            fr.jq.setStyle("#" + ev.data.param,"visibility", "visible");
            });
        fr.myBindOut("#idv_"+j, { param: 'id4v_'+j }, function(ev) {
            fr.jq.setStyle("#" + ev.data.param, "visibility", "hidden");
            });
        j++;
    }
},

formatPrice:function ( value, currency)
{
    if ( !value)
        return "";
    if ( typeof(value) == "string")
        value = parseFloat(value);
    if ( currency == "EUR")
        return value.toFixed(2) + " €";
    return currency+" "+value.toFixed(2);
},

getSecondsLeft:function (reitime)
{
    if ( !reitime)
        return 0;
    if ( reitime == "")
        return 0;
	
	var date = new Date( reitime);
	var jetzt = new Date(); 
	var Zeit = jetzt.getTime() / 1000;
	var Endzeit = date.getTime() / 1000;
  	var sec = Math.floor(Endzeit - Zeit);
  	return sec;
},

formatTime:function (sec)
{	
    if (sec<=0)
        return t["beendet"];	
    s = sec%60;
    m = Math.floor(sec/60);
    h = Math.floor(m/60);
    m = m%60;
    d = Math.floor(h/24);
    h = h%24;
    
    
    var sInner = "";
    if (sec<=60)
        sInner = sec +" " + t["sekunden"];
    else if (sec<=60*60)
        sInner = m +t["min"]+" " + s + t["sek"];
    else if (sec<=24*60*60)
        sInner = h +t["std"]+" " + m + t["min"];
    else if ( d == 1)        
        sInner = d +t["tag"]+" " + h + t["std"];
    else
        sInner = d +t["tage"]+" " + h + t["std"];
            
    return sInner;
    
},

doSetPage:function ( p)
{
    this.nCurPage=p;
    this.doResizeHome();
},
 
doNav:function ( url)
{
    fr.jq.showD("#idAll");
    if ( url.indexOf("chrome:")>=0 && url.indexOf("downloads.xu")>=0)
    {
        window.location.replace( url);
    }
    else
        window.location.replace( url);
},

doChangePage:function ( d)
{
    if ( d == -1)
    {
        if ( this.nCurPage>0)
            this.nCurPage--;
        else
            this.nCurPage= this.nPages-1;
        fr.doResizeHome();   
    }
    else if ( d == 1)
    {
        if ( this.nCurPage+1<this.nPages)
            this.nCurPage++;
        else
            this.nCurPage=0;
        fr.doResizeHome();
    }
},

doShowName:function ( id)
{
    if (fr.drag)
        return;
    if ( fr.idCurrentEdit)
        return;
    var o = document.getElementById(id); 
    if ( o)
        o.style.visibility = "visible";
        
    //aaaaaaaaaaaaaaaaaaaaaaaaaa
    if ( !fr.idCurrentEdit)
    {
        fr.jq.setStyle('#' + id.replace("id4_", "idback_"), "opacity", "1.0"); // Chrome
        fr.jq.setStyle('#' + id.replace("id4_", "idback_"), "filter", "alpha(opacity = 100)");
    }
    
    //if ( this.fEditMode)
    {
        var o = document.getElementById(id.replace("id4_", "idBlack_")); 
        if ( o)
            o.style.visibility = "visible";
    }
},

doShowNameHome:function ( idText, idToplink, jpg)
{ 
    if (fr.drag)
        return;
    if ( fr.idCurrentEdit)
        return;
    if ( !jpg)
        return;
    jpg = jpg.replace("_224", "_448");
    fr.curTimer++;
    //setTimeout( fr.doShowScreenshot, 500, idToplink,jpg,fr.curTimer);
    setTimeout( function ( idToplink, url, timer){
                fr.doShowScreenshot(idToplink, url, timer);
                }, 500, idToplink,jpg,fr.curTimer);
    var o = document.getElementById(idText); 
    if ( o)
        o.style.visibility = "visible";
        
    var o = document.getElementById(idText.replace("id4_", "idBlack_")); 
    if ( o)
        o.style.visibility = "visible";
        
    if ( !fr.idCurrentEdit)
    {
        fr.jq.setStyle('#' + idText.replace("id4_", "idback_"), "opacity", "1.0"); // Chrome
        fr.jq.setStyle('#' + idText.replace("id4_", "idback_"), "filter", "alpha(opacity = 100)");
    }
},

doShowScreenshot:function ( idToplink, url, timer)
{   
    if ( timer != fr.curTimer)
        return;
    var o2 = document.getElementById("idOverlay"); 
    var o3 = document.getElementById( "id_"+idToplink); 
    if ( o2 && o3)
    {
        var x = fr.lpOverlayPos[idToplink].x;
        o2.style.left = x+"px";
        var y = fr.lpOverlayPos[idToplink].y;
        o2.style.top = y+"px";
        var dx = fr.lpOverlayPos[idToplink].dx;
        o2.style.width = dx+"px";
        var dy = fr.lpOverlayPos[idToplink].dy;
        o2.style.height = dy+"px";
        
        fr.removeAllChilds(o2);
        
        var si = GetImageSize(url);
        if ( si )
            fr.createVideoOverlay( o2, url, dx, dy,si);
        else
            fr.co('img',o2,{'width':"100%",'height':"100%",'src':url});
        
        o2.style.visibility = "visible";
    }
},

createVideoOverlay:function( o2, thumb, dx1, dy1,si)
{
    if ( !si)
        return;
    
    var w = dx1;
    var h = w*si.h/si.w;
    if ( h<dy1)
    {
        h = dy1;
        w = h*si.w/si.h;
    }
    var mx = (dx1-w)/2;
    var my = (dy1-h)/2;
    
    var o = fr.co('div',o2,{'class':"clThumb",'style':"overflow:hidden;padding:0px;height:100%;width:100%;"});
    fr.co('img',o,{'draggable':"false",'style':'width:'+w+'px;height:'+h+'px; margin-left:'+mx+'px;margin-top:'+my+'px;', src:thumb});    
},
removeAllChilds:function(o)
{
    if ( !o)
        return;
    var c = o.firstChild;
    while( c)
    {
        o.removeChild( c);
        c = o.firstChild;
    }
},

doHideName:function ( id)
{
    fr.curTimer++;
    var o = document.getElementById(id); 
    if ( o)
        o.style.visibility = "hidden";
    
    var o = document.getElementById(id.replace("id4_", "idBlack_")); 
    if ( o)
        o.style.visibility = "hidden";
    
    if ( !fr.idCurrentEdit)
        if ( !this.lpCurFolder || this.lpCurFolder.type != "v")
            fr.jq.setStyle('#' + id.replace("id4_", "idback_"), "opacity", fr.settings.trans); // Chrome
            
    //fr.jq.setStyle('#'+id.replace("id4_", "idback_"), "filter", "alpha(opacity = 80)");
    
    var o2 = document.getElementById("idOverlay"); 
    if ( o2)
        o2.style.visibility = "hidden";
},

doAdd1x1:function ( p1x1)
{
    if ( !p1x1 || p1x1=="")
        return;
        
    fr.co('div',document.body,{'id':"picload_"+this.n1x1Count, "style":'visibility:hidden;display:none;'});
    this.n1x1Count++;
    //f.style.cssText =;
    fr.co('img',f,{'src':p1x1});
},

doResize:function () 
{
    fr.resizeIFrame();
    fr.doResizeHome();
},

slideDX:0,
slideDY:0,
positionSlideshow:function()
{
    this.slideDX=0;
    this.slideDY=0;
    var o = document.getElementById("idSlide"); 
    if ( o && o.width && o.height)
    {
        fr.doResizeHome();
        fr.jq.setStyle("#body", "visibility", "visible");
    }
    else
        setTimeout( function(){fr.positionSlideshow(1);} , 50);        
},

myBind:function( id, what, ob, callback)
{
    if (typeof(callback) != "function")
        return;
    
    //ob.callback = callback;
    
    var f = function (ob, param) { callback({ "data": param } ) }
    fr.jq.setEvent(id, what, f, ob);
},

myBindIn:function( id, ob, callback)
{
    fr.myBind( id, "mouseenter", ob, callback);
},
myBindOut:function( id, ob, callback)
{
    fr.myBind( id, "mouseleave", ob, callback);
},
myBindClick:function( id, ob, callback)
{
    fr.myBind( id, "click", ob, callback);
},

curvideolist:0,
transToplinks:0,
doResizeHome:function ( ) 
{       
    var editAfterResize = fr.idCurrentEdit;
    var bkcolor = fr.GetBackgroundColor();
    if ( bkcolor != -1)
    {
        fr.jq.get("#idSlideshow").innerHTML = "";
        fr.jq.setStyle("#idSlideshow", "background", bkcolor);
        fr.jq.setStyle("#idSlideshow", "visibility", "visible");
        var b1 = bkcolor;
        var b2 = fr.GetGradientColor(b1);
        fr.jq.setStyle("#idSlideshow", "background", "linear-gradient(135deg, " + b1 + " 0%," + b2 + " 100%");

    }
     
    /*o = document.getElementById("idSearchButton"); 
    x = o.offsetWidth;
    var xx = o.offsetLeft;
    if ( x < 10)
        x = 10;           
        
    o = document.getElementById("idInput"); 
    o.style.width = x-10+"px";
    
    var o2 = document.getElementById("idSearchButton2"); 
    o2.style.left = xx+x+"px";
    */
    
    //-------------------------------- PrepareToplinks for drawing--------------------------------
    o = document.getElementById("toplinks"); 
    dx = o.offsetWidth;
    dy = o.offsetHeight;
    
    if ( dx < 860)
        fr.jq.hideD("#langKey_addfolder");
    else 
        fr.jq.showD("#langKey_addfolder");
       
    if ( dx < 750)
        fr.jq.hideD("#langKey_editToplinks-2");
    else 
        fr.jq.showDI("#langKey_editToplinks-2");
        
    if ( dx < 800)
        fr.jq.hideD("#langKey_addToplink");
    else 
        fr.jq.showD("#langKey_addToplink");
        
    dy-=5;
    dy1 = (dy-20)/3;
    if ( dy1 > 126)
        dy1 = 126;
        
    dx1 = 224*dy1/126;
    nCols = Math.floor((dx+10)/(dx1+10));
    
    var bottom2 = this.lpCurFolder ? this.lpCurFolder.Toplinks : fr.lpToplinkBottomFolder;
    var bottom = new Array();
     
    for ( var j = 0; j < bottom2.length; j++)
    {
        var cur = bottom2[j];
        if ( !cur)
            continue;
        if ( !(fr.settings.folder&1) && cur.type == "e")
                continue;
        if ( !(fr.settings.folder&2) && cur.type == "a")
            continue;
        if ( !(fr.settings.folder&4) && cur.type == "m")
            continue;
        if ( !(fr.settings.folder&8) && cur.type == "v")
            continue;
        bottom.push(cur);           
    }
    
    fr.curvideolist = 0;
    if ( this.lpCurFolder && this.lpCurFolder.type =="v")
    {
        fr.curvideolist = bottom;
        if ( this.fEditMode)
            fr.fVideosChanged=true; // we are in videofolder in edit mode
    }

    this.nToplinks=bottom.length;

    this.nToplinksPerPage=nCols*3;
    if ( this.nToplinksPerPage<1)
        this.nPages = 0;
    else
        this.nPages=Math.floor((this.nToplinks+this.nToplinksPerPage-1)/this.nToplinksPerPage);

    if ( this.nCurPage+1>this.nPages)
        this.nCurPage = this.nPages-1;
    if ( this.nCurPage<0)
        this.nCurPage = 0;
        
    ofs = this.nCurPage*this.nToplinksPerPage;
    
    var nTotal = this.nToplinks;
    count = this.nToplinksPerPage;
    
    if ( count+ofs > nTotal)
    {
        count = nTotal-ofs;
        nCols = Math.floor((count+2)/3);
    }
    
    var oHidden = document.getElementById("idHiddenThumbs"); 
    fr.removeAllChilds(oHidden);
    if ( oHidden)
    {
        for ( var j = 0; j<count; j++)
        {
            i = j+ofs;
            var cur = bottom[i];
            if ( !cur)
                continue;
            if ( !cur.screenshotURL)
            {
                this.GetScreenshotUrl( cur, !cur.thumb);
            }        
            var thumb = fr.GetToplinkThumb(cur);
            //sInner+= '<img class="clThumbBase" ="'+thumb+'"></img>';      
            
            fr.co('img',oHidden,{'src':thumb,"class":'clThumbBase'});
            if ( cur.p1x1 != "")
            {
                 this.doAdd1x1(cur.p1x1);
                 cur.p1x1= "";
            }
        }         
    }
    fr.transToplinks = new Object();
    //-------------------------------- DrawToplinks --------------------------------    

    var oParent = document.getElementById("toplinks");
    fr.removeAllChilds(oParent);
    {
        //sInner=""
        for ( var j = 0; j<count; j++)
        {
            i = j+ofs;
            
            var cur = bottom[i];
            if ( !cur)
                continue;
                
            var fFolder = ( cur.type == "f" || cur.type == "v");
            //var fShowSearchUrl = dy1>88 && !this.fEditMode && cur.searchurl != "" && !fFolder;
            var fShowTitle = false;//( cur.def && !fShowSearchUrl && cur.url && cur.url.indexOf("ebay")>=0);
            {
                var thumb = fr.GetToplinkThumb(cur);
                fr.transToplinks[cur.id] = 'idback_'+j;
                
                var oDiv1 = document.createElement('div');
                oDiv1.setAttribute('id', 'idback_'+j);
                oDiv1.setAttribute('class', 'clToplinkBack');
                oParent.appendChild(oDiv1);
                    
                    
                if ( !(fr.idCurrentEdit == cur.id || cur.type == "video"))
                    //sInner+= '<div id="idback_'+j+'" class="clToplinkBack" >'; // aaaaaaaaaaaaaaaaa
                //else
                    oDiv1.setAttribute('style', "opacity:"+fr.settings.trans);
                    //sInner+= '<div id="idback_'+j+'" class="clToplinkBack" style="opacity:'+fr.settings.trans+'">'; // aaaaaaaaaaaaaaaaa
                if ( fr.drag==2 && fr.dragToplinkId == cur.id) // Resize during D&D: Set new divId and make item hidden
                {
                    fr.dragId="id_"+j;
                    
                    var oDiv2 = document.createElement('div');
                    oDiv2.setAttribute('id', 'id_'+j);
                    oDiv2.setAttribute('class', 'clToplink');
                    oDiv2.setAttribute('style', 'visibility:hidden;cursor:default');
                    oDiv1.appendChild(oDiv2);
                    //sInner+= '<div style="visibility:hidden;cursor:default" id="id_'+j+'" class="clToplink"></div>';
                }
                
                else
                {
                    
                    {
                        
                        var oDiv2=false;
                         
                        {
                            oDiv2 = document.createElement('div');
                            oDiv2.setAttribute('id', 'id_'+j);
                            oDiv2.setAttribute('class', 'clToplink');                    
                            oDiv1.appendChild(oDiv2);
                            if ( cur.type == "video")
                            {
                                oDiv2.setAttribute('style', 'background:#000');                    
                                //sInner+= '<div id="id_'+j+'" style="background:#000" class="clToplink" ';
                            }
                            //else
                            //    sInner+= '<div id="id_'+j+'" class="clToplink" ';
                            var si = GetImageSize(thumb);
                                
                            var oA = document.createElement('a');
                            //#####oA.setAttribute('href', cur.url);
                            oDiv2.appendChild(oA);
                            
                            if ( cur.type == "video")
                            {
                                var oDiv3 = fr.createVideoItemHtml(j,cur,thumb, dx1,dy1,si);                                 
                                if ( oDiv3)
                                    oA.appendChild(oDiv3);
                            } 
                            
                            var oDiv3 = document.createElement('div');
                            oDiv3.setAttribute('id', 'id4_'+j);                    
                            oDiv3.setAttribute('class', 'clOverlay');                    
                            oDiv2.appendChild(oDiv3);
                            var oA = document.createElement('a');
                            oA.setAttribute('href', cur.url);
                            oA.textContent = cur.name;
                            oDiv3.appendChild(oA);
                            
                            var oDiv3 = document.createElement('div');
                            oDiv3.setAttribute('id', 'id5_'+cur.id);                    
                            oDiv3.setAttribute('class', 'clEditOverlay');                    
                            oDiv2.appendChild(oDiv3);

                        }
                        oDiv3 = fr.CreateEditModeButtons(j, cur, dy1);
                        if (oDiv3)
                            oDiv2.appendChild(oDiv3);
                    }
                    
                }

                /*if ( fShowSearchUrl)
                {                    
                    var oDiv2 = document.createElement('div');
                    oDiv2.setAttribute('id', 'id3_'+j);
                    oDiv2.setAttribute('class', 'clSearchToplink');
                    oDiv1.appendChild(oDiv2);
                    
                    var oDiv3 = document.createElement('div');
                    oDiv3.setAttribute('class', 'clSearchToplinkL');
                    oDiv2.appendChild(oDiv3);                    
                    //sInner+= '<div id="id3_'+j+'" class="clSearchToplink"><div class="clSearchToplinkL"></div>';
                    
                    var oDiv3 = document.createElement('div');
                    oDiv3.setAttribute('class', 'clSearchToplinkM');
                    oDiv2.appendChild(oDiv3);                    
                    
                    var oForm = document.createElement('form');
                    oForm.setAttribute('id', 'idform_'+j);
                    oDiv3.appendChild(oForm);                    
                    
                    var oInput = document.createElement('input');
                    oInput.setAttribute('id', 'idInput_'+j);
                    oInput.setAttribute('class', 'clInput');
                    oInput.setAttribute('type', 'text');
                    oForm.appendChild(oInput);                    

                    var oDiv3 = document.createElement('div');
                    oDiv3.setAttribute('id', 'idsearch_'+j);
                    oDiv3.setAttribute('class', 'clSearchToplinkR');
                    oDiv2.appendChild(oDiv3);                    
                }
                */
            }
            {
                
                fr.myBindClick("#idback_"+j, { }, function(ev) {return false;});
                
                if ( fFolder)
                {
                    fr.myBindClick("#id_"+j, { param: cur.id }, function(ev) {fr.doSetFolder( ev.data.param);return false;});
                }
                else if ( !this.fEditMode)
                {
                    fr.myBindClick("#id_" + j, { param: cur }, function (ev) {
                        //ev.preventDefault();
                        //ev.stopPropagation();
                        //alert("play2 " + ev.data.param);
                        fr.PlayVideo(ev.data.param); return false;
                    });
                }
                if ( cur.screenshotURL && cur.screenshotURL != "*" && !fFolder && !fShowTitle && !this.fEditMode && cur.type != "downloads")
                    fr.myBindIn("#id_"+j, { param1: 'id4_'+j,param2: j, param3: cur.screenshotURL }, 
                                     function(ev) {fr.doShowNameHome( ev.data.param1, ev.data.param2, ev.data.param3);});
                else
                    fr.myBindIn("#id_"+j, { param: 'id4_'+j }, function(ev) {fr.doShowName( ev.data.param);});
                    
                fr.myBindOut("#id_"+j, { param: 'id4_'+j }, function(ev) {fr.doHideName( ev.data.param);});
                                              
                if ( this.fEditMode)
                {
                    fr.myBind("#id_" + j, 'mousedown', { param: "#id_" + j, param2: cur.id }, function (ev) { fr.HandleDrag( 1,ev.data.param,ev.data.param2);});
                    fr.myBind("#id_"+j,'mouseup', { }, function(ev) {fr.HandleDrag( 0);});
                                        
                    fr.jq.unbind("#id5_"+j,'click');
                    
                    //fr.myBindClick("#idbegin_"+j, { param: cur.id }, function(ev) {fr.MoveBegin( ev.data.param);return false;});
                    //fr.myBindClick("#idend_"+j, { param: cur.id }, function(ev) {fr.MoveEnd( ev.data.param);return false;});
                }
                
                fr.myBindClick("#iddel_"+j, { param: cur.id }, function(ev) {fr.DelToplink( ev.data.param);return false;});
                
                
            }
    //        sInner+= '<div id="id4_'+j+'" class="clOverlay">'+cur.name+'</div>';
        }
        
        
        var oDiv1 = document.createElement('div');
        oDiv1.setAttribute('id', 'idOverlay');                    
        oParent.appendChild(oDiv1);
        
    }
    
    //-------------------------------- Toplink-Positionen berechnen --------------------------------
    x = (dx+10-(dx1+10)*nCols)/2;
    y = (dy-dy1*3-20)/2;
    row = 0;
    m = 2+5*dy1/126;
    var col = 0;
    
    
    var oParent = document.getElementById("toplinks"); 
    var xParent = parseInt(oParent.offsetLeft);
    var yParent = parseInt(oParent.offsetTop);  
        
    fr.lpDragTargets=0;
    var fdragitem=false;
    for (var j=0; j<count; j++)
    {
        var i = j+ofs;
        
        s = "idback_"+j;
        o2 = document.getElementById(s); 
        if ( !o2)
            continue;
        o2.style.width = dx1+"px";
        o2.style.height = dy1+"px";
        o2.style.left = x+"px";
        o2.style.top = y+"px";   
            
        if ( fr.drag)
        {
            
            var cur = i>=0?bottom[i]:0;
            if (!fr.lpDragTargets)
                fr.lpDragTargets = new Array();
            if ( cur)
            {
                if ( fr.dragToplinkId == cur.id)
                    fdragitem=true;    
                    
                var target = new Object(); // Insert before
                target.x = xParent+x;
                target.width = dx1;
                target.y = yParent+y-dy1/3;
                target.height = dy1*2/3;
                target.toplinkId = cur.id;
                target.divId = "#id_"+j;
                fr.lpDragTargets.push( target);
            }
            
            //if ( !cur || cur.type=="f")
            {
                var target = new Object(); // Insert into
                target.x = xParent+x;
                target.width = dx1;
                target.y = yParent+y+dy1/3;
                target.height = dy1/3;
                
                if ( !cur || cur.type=="f")
                {
                    target.toplinkId = cur ? cur.id : -1;
                    target.divId = "#id_"+j;
                    target.mode = 1;
                }
                else if ( fdragitem && i+1<bottom.length) // Lücke war schon, d.h. Mitte gehört dem nächsten
                {
                    target.toplinkId = bottom[i+1].id;
                    target.divId = "#id_"+(j+1);
                }
                else // Lücke kommt noch, d.h. Mitte gehört diesem
                {
                    target.toplinkId = cur.id;
                    target.divId = "#id_"+j;
                }
                fr.lpDragTargets.push( target);
            }
            
            if ( row == 2 && i+1<bottom.length)
            {
                var target = new Object(); // Insert after
                target.x = xParent+x;
                target.width = dx1;
                target.y = yParent+y-dy1/3 +dy1+10;
                target.height = dy1*2/3;
                target.toplinkId = bottom[i+1].id;
                target.divId = "#id_"+(j+1);
                fr.lpDragTargets.push( target);
            }
            else if ( i+1==bottom.length)
            {
                var target = new Object(); // Insert after
                target.x = xParent+x;
                target.width = dx1;
                target.y = yParent+y-dy1/3 +dy1+10;
                target.height = dy1*2/3;
                target.toplinkId = "end";
                target.divId = "#id_"+(j);
                target.mode = 2; // At the end
                fr.lpDragTargets.push( target);
            }
        }
        
        if ( !this.lpOverlayPos[j])
            this.lpOverlayPos[j] = new Object();
            
        if ( col*2+1 == nCols && nCols < 5) // exact in the middle
		{
		    
			if ( row != 1)
			    this.lpOverlayPos[j].x = x;
			else
			    this.lpOverlayPos[j].x = x+dx1+10;
				
			if ( row == 0)
				this.lpOverlayPos[j].y  = y+dy1+10;
			else if ( row == 2)
			    this.lpOverlayPos[j].y  = y-2*dy1-2*10;
		    else
				this.lpOverlayPos[j].y  = y;
		}
		else
		{
            if ( col>=nCols/2)
                this.lpOverlayPos[j].x = x-2*dx1-2*10;
            else
                this.lpOverlayPos[j].x = x+dx1+10;
            
            if ( j%3 == 2)
                this.lpOverlayPos[j].y  = y-dy1-10;
            else
                this.lpOverlayPos[j].y  = y;
        }
        this.lpOverlayPos[j].dx  = 2*dx1+16;
        this.lpOverlayPos[j].dy = 2*dy1+14;
        
        s = "id3_"+j;
        o2 = document.getElementById(s); 
        if ( o2)
        {
            o2.style.width = (dx1-10)+"px";
            o2.style.height = 24+"px";
            o2.style.left = (5)+"px";
            o2.style.top = (dy1-30)+"px";
        }
        
        row++;
        y+= dy1+10;
        if ( row > 2)
        {
            col++;
            y = (dy-dy1*3-20)/2;
            x+=dx1+10;
            row=0;
        }
    }
    
    

    var oParent = document.getElementById("divDots");
    fr.removeAllChilds(oParent);
    
    for (var i=0; i<this.nPages; i++)
    {
        var oA = document.createElement('a');
        oA.setAttribute('id', 'iddot_'+i);
        oA.setAttribute('class', 'clDots');
        
        var oImg = document.createElement('img');
        if ( i == this.nCurPage)
            oImg.setAttribute('src', "./png/dotSel.png");
        else
            oImg.setAttribute('src', "./png/dot.png");
        oA.appendChild(oImg);
        oParent.appendChild(oA);            
    }

    if ( this.nCurFolderLevel>0)
        fr.jq.setClick("#idDotUp",function() {fr.doSetFolder(-1);return false;});
    for (var i=0; i<this.nPages; i++)
    {  
        fr.myBindClick("#iddot_"+i, { param: i}, function(ev) {fr.doSetPage( ev.data.param);return false;});
    }
    
    o3 = document.getElementById("divLeft"); 
    o3.style.top = (80+(dy-38)/2)+"px";
    if ( this.nPages > 1)
        o3.style.display = 'block';
    else
        o3.style.display = 'none';
    o3 = document.getElementById("divRight"); 
    o3.style.top = (80+(dy-38)/2)+"px";
    if ( this.nPages > 1)
        o3.style.display = 'block';
    else
        o3.style.display = 'none';
        
},


drag:0,
dragId:0,
dragToplinkId:0,
dragX:0,dragY:0,
dragBefore:0,
dragAllowPage:true,
mousehandleradded:false,
HandleDrag:function( mode, divId, toplinkId)
{
    if ( fr.idCurrentEdit)
        return;
        
    if ( fr.lpCurFolder && fr.lpCurFolder.type != "f" && fr.lpCurFolder.type != "v")
        return;
    
    if ( mode == 1)
    {
        if ( !fr.mousehandleradded)
        {
            fr.mousehandleradded = true;
            // addEventListener only if user want to drag&drop toplinks
            document.addEventListener( "mousemove", this.myMouseMove,false); 
        }
    
        this.dragToplinkId = toplinkId; 
        this.dragId = divId;
        this.drag = 1;
        this.dragBefore = 0;
        this.dragX = parseInt( fr.jq.getStyle("#idDrag","left"));
        this.dragY = parseInt(fr.jq.getStyle("#idDrag", "top"));
        fr.dragLastTarget = -1;
    }
    else if ( mode == 0)
    {
        if ( !this.drag)
            return;
        this.drag = 0;
        fr.jq.hideD("#idDrag");
        fr.jq.get("#idDrag").innerHTML = ""
        fr.jq.setStyle(this.dragId, "visibility", "visible");
        if ( this.dragBefore)
        {
            if ( fr.dragBefore.toplinkId != fr.dragToplinkId)
                fr.MoveToplinkBefore( this.dragToplinkId, this.dragBefore, true);
        }
        fr.doResize();
    }
    else if ( this.drag)
    {
        var x = parseInt(fr.jq.getStyle("#idDrag", "left"));
        var y = parseInt(fr.jq.getStyle("#idDrag", "top"));
        if ( this.drag == 1) // Noch nicht gestartet
        {
            if (Math.abs(x - this.dragX) > 5 || Math.abs(y - this.dragY) > 5) {
                fr.jq.showD("#idDrag");
                fr.doResize();
                this.drag = 2; // Starte jetzt das D&D
                fr.jq.setStyle(this.dragId, "visibility", "hidden");

                var s = fr.jq.get(this.dragId).innerHTML; //Just copy the content
                fr.jq.get(this.dragId).innerHTML = "";
                fr.jq.get("#idDrag").innerHTML = s;
                
            }
            
            
                
        }
        else if ( fr.lpDragTargets)
        {
            x+=224/2;
            y+=126/2;
            
            var oParent = document.getElementById("toplinks"); 
            var xParent = parseInt(oParent.offsetLeft);
            var dxParent = parseInt(oParent.offsetWidth);
    
            if ( x < xParent&& this.nCurPage>0)
            {
                if ( fr.dragAllowPage)
                {
                    fr.dragAllowPage = false;
                    this.nCurPage--;
                    fr.doResize();
                }
                return;
            }
            else if ( x > dxParent+xParent && this.nCurPage+1<this.nPages)
            {
                if ( fr.dragAllowPage)
                {
                    fr.dragAllowPage = false;
                    this.nCurPage++;
                    fr.doResize();
                }
                return;
            }
            
            fr.dragAllowPage = true;
            this.dragBefore = 0;
            fr.jq.setStyle(".clToplink", "border", "1px solid #fff");
            for ( var j = 0; j < fr.lpDragTargets.length;j++)
            {
                var target = fr.lpDragTargets[j];                
                if ( x>=target.x && y>=target.y && x < target.x+target.width && y < target.y+target.height)
                {
                    this.dragBefore = target;
                    if ( 1)
                    {
                        if ( fr.dragBefore.toplinkId != fr.dragLastTarget)
                        {
                            fr.dragLastTarget = fr.dragBefore.toplinkId;
                            fr.MoveToplinkBefore( fr.dragToplinkId, fr.dragBefore, false);
                            fr.doResize();
                        }
                    }
                    if ( target.mode)
                        fr.jq.setStyle(target.divId, "border", "1px solid #f00");
                    else
                        fr.jq.setStyle(target.divId, "border", "1px solid #00f");
                    break;
                }
            }
            
        }
    }
},

CreateEditModeButtons: function (j, tl, dy1) {
    if (fr.drag)
        return false;

    if (fr.lpCurFolder && fr.lpCurFolder.type == "a") // Cannot delete an App
        return false;

    var oDiv = fr.co('div', 0, { "class": "clBlackButton", "id": 'idBlack_' + j });
    var oCenter = fr.co('center', oDiv, {});

    var w = 49 * dy1 / 126 / 2;
    var fFolder = (tl.type == "f" || tl.type == "m" || tl.type == "a" || tl.type == "e" || tl.type == "v");
    //if ( tl.type != "ebayitem")
    if (!fr.lpCurFolder || fr.lpCurFolder.type == "f") {
        if (tl.type != "downloads") {
            fr.co('img', oCenter, { "width": w, "id": 'idedit_' + j, "src": "./png/editurl.png", "title": fFolder ? t['ideditf'] : t['idedit'] });
        }
    }
    fr.co('img', oCenter, { "width": w, "id": 'iddel_' + j, "src": "./png/del.png", "title": fFolder ? t['iddelf'] : t['iddel'] });
    return oDiv;
},
coRemove:function( type, parentId, params, text)
{
    var oParent = document.getElementById( parentId);
    if ( !oParent)
        return;
    fr.removeAllChilds( oParent);
    return fr.co( type,oParent,params,text);
},

co:function( type, parent, params, text)
{
    var o = document.createElement(type);
    if (text)
        o.textContent = text;
    for(var item in params)
    {
        o.setAttribute(item, params[item]);
    }
    if ( parent)
        parent.appendChild(o);    
    return o;
},

createVideoItemHtml:function(j,cur,thumb, dx1,dy1,si)
{
    
    var oDiv = false;
    for ( var i = 0; i < VideoSites.length; i++)
    {
        if ( cur.url.toLowerCase().indexOf(VideoSites[i].filter)>=0)
        {
            //alert(j + "  " + cur.url)
            if ( !si)
            {
                si = new Object();
                si.w = VideoSites[i].w;
                si.h = VideoSites[i].h;
            }
            
            oDiv = document.createElement('div');
            oDiv.setAttribute('class', "clThumb");
            oDiv.setAttribute('style', "overflow:hidden;padding:0px;height:100%;width:100%;");
            
            if ( si)
            {
                var w = dx1;
                var h = w*si.h/si.w;
                if ( h<dy1)
                {
                    h = dy1;
                    w = h*si.w/si.h;
                }
                var mx = (dx1-w)/2;
                var my = (dy1-h)/2;
                
                //sInner+= '<div class="clThumb" style="overflow:hidden;padding:0px;height:100%;width:100%;" >'; 
                
                var oImg = document.createElement('img');
                oImg.setAttribute('draggable', "false");
                oImg.setAttribute('style', "width:"+w+"px;height:"+h+"px; margin-left:"+mx+"px;margin-top:"+my+"px;");
                oImg.setAttribute('src', thumb);
                oDiv.appendChild(oImg);
                //sInner+= '<img draggable=false style="width:'+w+'px;height:'+h+'px; margin-left:'+mx+'px;margin-top:'+my+'px;" src="'+thumb+'"></img>';
                //sInner+= '</div>'; 
            }
            else
            {
                var oImg = document.createElement('img');
                oImg.setAttribute('draggable', "false");
                oImg.setAttribute('width', "100%");
                oImg.setAttribute('height', "100%");
                oImg.setAttribute('src', thumb);
                oDiv.appendChild(oImg);
            //    sInner+= '<img draggable=false class="clThumb" width=100% height=100%  src="'+thumb+'"></img>'; 
            }
            
            var oDiv2 = document.createElement('div');
            oDiv2.setAttribute('style', "position:absolute; right:0;top:0;");
            var oImg = document.createElement('img');
            oImg.setAttribute('draggable', "false");
            oImg.setAttribute('class', "clVideoStrip");
            oImg.setAttribute('src', "./png/movie.png");
            oDiv2.appendChild(oImg);
            oDiv.appendChild(oDiv2);
            
            var oDiv2 = document.createElement('div');
            oDiv2.setAttribute('style', "position:absolute; right:-1px;bottom:0;height:24px;");
            var oImg = document.createElement('img');
            oImg.setAttribute('draggable', "false");
            oImg.setAttribute('class', "clVideoLogo");
            oImg.setAttribute('src', VideoSites[i].thumb);
            oDiv2.appendChild(oImg);
            oDiv.appendChild(oDiv2);
            //sInner+= '<div style="position:absolute; right:0;top:0;"><img draggable=false class="clVideoStrip"  src="./png/movie.png"></img></div>';  
            //sInner+= '<div style="position:absolute; right:-1px;bottom:0;height:24px;"><img draggable=false class="clVideoLogo"  src="'+VideoSites[i].thumb+'"></img></div>';  
            break;
        }        
    }
    return oDiv;
},
     
hideHelp:function( id, bit)
{
    fr.settings.help|=bit;
    fr.jq.hideD("#" + id);
    fr.SaveSettings();
},
/*
lastInput:"",
curSuggestion: -1,
setCurSuggestion:function (id) 
{
    fr.curSuggestion = id;
    var curId = "itemSuggestion" + fr.curSuggestion;
    fr.jq.getAllItems(".clInput_item", function (element)
    {
        if ( curId == element.id)
            element.className = "clInput_item clInput_item_selected";
        else
            element.className = "clInput_item";
    });
},
InitAutoComplete:function () 
{
    fr.jq.get("#idInput").addEventListener('keyup', function (e) {
        if (e.keyCode == 13)
        {
            fr.lastInput = fr.jq.getVal("#idInput");
            if (fr.lastInput.length > 0)
                setTimeout(function () { fr.doSearch(-1); }, 50);
            return;
        }
        if (e.keyCode == 38) // up
        {
            if ( fr.curSuggestion>=0)
            {
                fr.setCurSuggestion(fr.curSuggestion-1);
                if (fr.curSuggestion < 0)
                    fr.jq.setVal("#idInput", fr.lastInput);
                else {
                    var o = fr.jq.get("#itemSuggestion" + fr.curSuggestion);
                    if (o)
                        fr.jq.setVal("#idInput", o.textContent);
                }
            }
            return;
        }
        if (e.keyCode == 40) // down
        {
            fr.curSuggestion++;
            var o = fr.jq.get("#itemSuggestion" + fr.curSuggestion);
            if (o)
                fr.jq.setVal("#idInput", o.textContent);
            else
                fr.curSuggestion--;
            fr.setCurSuggestion(fr.curSuggestion);
            return;
        }
        if (e.keyCode == 27)
            fr.jq.hideD("#idInput_list");
        else if (fr.lastInput != fr.jq.getVal("#idInput"))
        {
            fr.lastInput = fr.jq.getVal("#idInput");
            if (fr.lastInput.length < 2)
            {
                fr.jq.hideD("#idInput_list");
                return;
            }
            fr.curSuggestion = -1;
            var autcompleteURL = "http://suggestqueries.google.com/complete/search?client=toolbar&hl=" + fr.curLang + "&q=" + fr.lastInput;
            var client = new XMLHttpRequest();
            client.onreadystatechange = function (data) {
                if (this.readyState != 4)
                    return;
                var s = this.responseText;
                var i1 = 0;
                var parent = fr.jq.get("#idInput_list");
                parent.innerHTML = "";
                for (var j = 0; j<10;j++) {
                    var i2 = s.indexOf("data=\"", i1);
                    if (i2 < 0)
                        break;
                    i1 = i2 + 6;
                    i2 = s.indexOf("\"", i1);
                    if (i2 < 0)
                        break;
                    
                    var o = document.createElement('div');
                    o.textContent = s.substr(i1, i2 - i1);
                    o.setAttribute("id", "itemSuggestion" + j);
                    o.className = "clInput_item";
                    parent.appendChild(o);
                    fr.myBindIn("#itemSuggestion" + j, { param: j }, function (ev) {
                        fr.setCurSuggestion(ev.data.param);
                    });
                }
                fr.jq.setClick(".clInput_item", function (e, data) {
                    fr.jq.setVal("#idInput", e.textContent);
                    fr.doSearch(-1);
                    return false;
                });
                
                fr.jq.showD("#idInput_list");
            }
            client.onerror = function () {
                
            }
            client.open("GET", autcompleteURL);
            client.send();

        }
    }, true);
},
*/
ResetTheme:function( )
{
    if ( !confirm(t["resethelp2"]))
        return;

    fr.curLang = navigator.userLanguage || navigator.language;
    if (fr.curLang.indexOf("de") >= 0)
        fr.curLang = "de"
    else
        fr.curLang = "en"
    L64P._db._locStorage.setItem("curlang", fr.curLang);
    chrome.runtime.sendMessage({ msg: "SP24SetLang", lang: fr.curLang }, function (response) { });
    fr.SetDefaultSettings();    
    SetLanguage();
    fr.setDefaultToplinks();    
    fr.ShowToplinks(fr.settings.fShowToplinks);
    fr.doResize();
    fr.doShowHelp();
    fr.ShowMsgDlg(0);
    fr.ShowMsgDlg(1);
},

SetDefaultSettings:function () 
{
    fr.settings = new Object();   
    fr.settings.fShowToplinks = true;
    fr.settings.folder=fVideo?255:(255-8);
    fr.settings.special=255;
    
    fr.settings.trans= "0.9";
    fr.settings.fUseThemeDefaults = true;    
    fr.settings.border=false;
    fr.settings.color_text = '#cccccc';
    fr.settings.color_border = '#333333';
    fr.settings.color_background = '#ffffff';

    fr.settings.help=15;
    fr.settings.help|=64
    fr.SaveSettings();

},

FindToplinkType:function( parent, type)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.type == type)
            return o;         
        if ( o.Toplinks)
        {
            var result = this.FindToplinkType( o, type);
            if ( result)
                return result;
        }
    }
    return 0;
},

FindToplinkByUrl:function( parent, url)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.url == url)
            return o;         
        if ( o.Toplinks)
        {
            var result = this.FindToplinkByUrl( o, url);
            if ( result)
                return result;
        }
    }
    return 0;
},

AddDefaultFolder:function ( fSave) 
{
    
},
        
setDefaultToplinks:function () 
{
   
},

doShowHelp:function () 
{
    fr.jq.hideD(".clHelp");
   
    if ( fr.lpCurFolder && fr.lpCurFolder.type == "v")
    {
        if ( !(fr.settings.help&256) && !fr.videoPlaying)
            fr.jq.showD("#idHelpVideo");
    }
    else
    {
        if ( fr.fEditMode)
        {
            if ( !fr.lpCurFolder || fr.lpCurFolder.type == "f")
                if ( !(fr.settings.help&32))
                    fr.jq.showD("#idHelpDrag");
        }
        else
        {
            //if ( !(fr.settings.help&1))
            //    fr.jq.showD("#idHelpEdit");            
            if ( !(fr.settings.help&4))
                fr.jq.showD("#idHelpSearch");
            if ( !(fr.settings.help&8))
                fr.jq.showD("#idHelpSettings");
                
            if ( !fr.settings.fShowToplinks)
            {
                if ( !(fr.settings.help&128))
                    fr.jq.showD("#idHelpToggle");
            }
            
            if ( !(fr.settings.help&64))
                fr.jq.showD("#idHelpHomepage");
        }
    }
},

myGetLocalStorage:function( callback)
{
    //if ( typeof(chrome)!= 'undefined')
    {
        // Chrome
        chrome.storage.local.get('newToplinks', function(data)
        {
            //alert( languageList);
            callback(data);
        });
    }
    /*else // Firefox
    {
        if ( !fr._locStorage)
            fr.setStorage();
        var sitems = fr._locStorage.getItem('newToplinks')
        if ((sitems == null)||(typeof(sitems)== 'undefined'))
			aItems = new Array();
		else
			aItems = JSON.parse(sitems);
			
        callback({newToplinks:aItems});
    }
    */
},    

myDelLocalStorage:function()
{
    if ( typeof(chrome)!= 'undefined')
        chrome.storage.local.set({ newToplinks: 0 }, function () { });
    else
        fr._locStorage.setItem("newToplinks", 0); 
},

addNewToplinksFromList:function()
{
    fr.myGetLocalStorage( function(data)
        //chrome.storage.local.get('newToplinks', function(data)
	{

	    var sitems = data.newToplinks; 
	    if ( !sitems)
	        return;
        if ( !sitems.length)
        {
            fr.myDelLocalStorage();
          //  L64P._db._locStorage.setItem('newToplinks', 0);
            //chrome.storage.local.set({newToplinks: 0}, function(){}); 
	        return;
	       }
	    if ((sitems == null)||(typeof(sitems)=='undefined'))
		    return;
	    var fAdded = false;
	    for (var i =0; i<sitems.length; i++)
		{
		    var j = sitems[i].indexOf( '<->');
		    if ( j>=0)
		    {
    		    var title = sitems[i].substr(0,j);
    		    var url = sitems[i].substr(j+3);
            }
            else
            {
                var title = "";
                var url = sitems[i];
    		}   
    		
    		var tl = fr.FindToplinkByUrl( 0, url);
    		if ( !tl)
    		{
    		    var o = new Object();
                o.searchurl="";
                o.type="l"
                o.url = url;
                o.name = title;
                o.p1x1="";
                o.id=fr.nextfreeid++;
                fr.lpToplinkBottomFolder.splice(0,0,o);// = a.concat( fr.lpToplinkBottomFolder);
                fAdded=true;
    		}
			//alert( title+"   +   "+url);
		}
        if ( fAdded)
        {
            fr.SaveToplinks();
            fr.doResizeHome();
        }
		fr.myDelLocalStorage();
    });
},
				
page:0,
doInit:function () 
{
//var i = window.location.href;
    if ( window.location.href.indexOf( "page=video")>=0)
        fr.page="video";

    //fr.InitAutoComplete();
    fr.doShowHelp();
    // prevent Drag&Drop
    document.addEventListener("dragstart", function(e) {
        //$(document).bind("dragstart", function(e) {
        //alert(e.target.nodeName);
        //e.stopPropagation();
        e.preventDefault();
         if (e.target.nodeName.toUpperCase() == "IMG") 
             return false;
         else if (e.target.nodeName.toUpperCase() == "A") 
            return false;
         else
             alert(e.target.nodeName.toUpperCase());
         
    });

    //fr.jq.setClick("#idHelpEdit", function() { fr.hideHelp( "idHelpEdit",1);return false;});    
    
    fr.jq.setClick("#idHelpSearch", function () { fr.hideHelp("idHelpSearch", 4); return false; });
    fr.jq.setClick("#idHelpSettings", function () { fr.hideHelp("idHelpSettings", 8); return false; });
    fr.jq.setClick("#idHelpVideo", function () { fr.hideHelp("idHelpVideo", 256); return false; });
    fr.jq.setClick("#idHelpDrag", function () { fr.hideHelp("idHelpDrag", 32); return false; });
    fr.jq.setClick("#idHelpHomepage", function () { fr.hideHelp("idHelpHomepage", 64); return false; });
    fr.jq.setClick("#idHelpToggle", function () { fr.hideHelp("idHelpToggle", 128); return false; });
    
    fr.jq.setClick("#idChromeSettings", function () {
        L64P.browser.showSettings({where:'newTab'});
        return false;
    });    
    
    fr.jq.setClick("#idyoutube", function () {
        window.location.replace( "http://youtube.com");
        return false;
    });    
    fr.jq.setClick("#idvimeo", function () {
        window.location.replace( "http://vimeo.com");
        return false;
    });    

    var b1 = fr.GetBorderColor();
    var b2 = fr.GetGradientColor(b1);
    
    fr.jq.setStyle("#idBottombarGradient", "background", "linear-gradient(to bottom, " + b2 + " 0%," + b1 + " 100%");
    fr.jq.setStyle("#topbar","background", "linear-gradient(to bottom, " + b2 + " 0%," + b1 + " 100%");
    
    //fr.jq.setStyle("#body","background",fr.GetBorderColor());
    fr.jq.setStyle(".clTextColor", "color", fr.GetTextColor());
   
    var o = new Object();
    o.searchurl="";
    o.type="v"
    o.name = t["videolist"];
    o.Toplinks = new Array();
    o.p1x1="";
    o.id=fr.nextfreeid++;
    fr.lpToplinkBottomFolder = new Array();
    fr.lpToplinkBottomFolder.splice(0,0,o);
    fr.doSetFolder( o.id);
        
    fr.doResize();

    fr.RefreshBorder();
    
    window.addEventListener( "resize",this.doResize,false);
    //window.onresize = this.doResize; 
    fr.InitSearchProvider();

    fr.jq.setEvent("#idInputFilter", "keyup", function () { fr.SetFilter(fr.jq.getVal("#idInputFilter")); }, {});
    //$("#idInputFilter").keyup(function() { fr.SetFilter(this.value)});
    //######## $("#idForm").submit(function(){fr.doSearch(-1)});     
    
    //fr.jq.setClick("#idDelAll", function() {fr.DelAllToplinks();});
    fr.jq.setClick("#idSettings", function () { fr.ShowMsgDlg(1); return false; });
    fr.jq.setClick("#idEditMode", function () { fr.doEditMode(1); return false; });
    fr.jq.setClick("#idEditModeDone", function () { fr.doEditMode(0); return false; });
    fr.jq.setClick("#idEditModeCancel", function () { fr.doEditMode(-1); return false; });
    
    //fr.jq.setClick("#idSearchButton2", function () { fr.doSearch(-1); return false; });
    fr.jq.setClick("#divLeft", function () { fr.doChangePage(-1); return false; });
    fr.jq.setClick("#divRight", function () { fr.doChangePage(1); return false; });

    fr.jq.setStyle("#idSlideshow", "visibility", "hidden");
    fr.jq.setStyle("#body", "visibility", "visible");
    //setTimeout(function () { fr.jq.setStyle("#body", "idSlideshow", "visible"); }, 100);
    //setTimeout(function () {
        //var o = fr.jq.get('#idInput');
        //o.value = "";
        //document.getElementById("idInput").focus();
        //$('#idInput').focus().val("").scrollTop();
    //}, 150);
    
    fr.myBind("#idDrag",'mouseup', { }, function(ev) {fr.HandleDrag( 0);return false;});    
    
    fr.ShowToplinks(fr.settings.fShowToplinks);
    
},

iCounter:0,

myMouseMove:function(ev) 
{
    if (!ev)
        ev = window.event;

    var xx = ev.pageX;
    var yy = ev.pageY;
    
    if ( !xx && !yy)
    {
        xx = ev.x;
        yy = ev.y;
    }
    var x = xx;     
    var y = yy;
    x-=224/2;
    y-=126/2;
    var scrY = document.documentElement.scrollTop;
    fr.jq.setStyle("#idDrag", "left", x + "px");
    fr.jq.setStyle("#idDrag", "top", y + "px");
    //console.log("myMouseMove" + x + "   " + y);
    if ( fr.drag)
        fr.HandleDrag( 2);
},


curframe:0,
RefreshBorder:function( )
{
    fr.curframe = 0;
    var border = fr.GetCurBorder();
    if (typeof(Frames) == 'undefined')
        Frames = new Array();
    
    var oParent = document.getElementById( "idFrame");
    if ( border)
    {
        fr.jq.setStyle("#topbar", "background", "");
        for ( var i = 0; i < Frames.length; i++)
        {
            var frame = Frames[i];
            if ( frame.id == border)
            {
                fr.curframe = frame;
                var ox = parseInt( frame.ox);
                var oy = parseInt( frame.oy);
                var w = parseInt( frame.width);
                var h = parseInt( frame.height);
                var ofs = parseInt( frame.offset);
                var x,y;
                
                fr.removeAllChilds(oParent);
                for ( y = -oy; y< 2000; y+=h-oy)
                {
                    var oDiv = fr.co('div',oParent,{'style':"-webkit-transform: rotate(-90deg);-moz-transform: rotate(-90deg);position:absolute;left:-"+ofs+"px;top:"+y+"px;"});
                    fr.co('img',oDiv,{'src':frame.png});
                    
                    var oDiv = fr.co('div',oParent,{'style':"-webkit-transform: rotate(90deg);-moz-transform: rotate(90deg);position:absolute;right:-"+ofs+"px;top:"+y+"px;"});
                    fr.co('img',oDiv,{'src':frame.png});
                }
                for ( x = -ox; x< 3000; x+=w-ox)
                {
                    var oDiv = fr.co('div',oParent,{'style':"position:absolute;left:"+x+"px;top:0px;"});
                    fr.co('img',oDiv,{'src':frame.png});                    
                }
            }
        }
    }   
    else
    {
        fr.removeAllChilds(oParent);
    }
},
  
nPauseTimer:0,
degree:0,
 
SaveToplinks:function()
{

},

SaveSettings:function()
{
    L64P.settings.set({id:'settings', data:fr.settings});
},
    

testImage:function(url, callback, timeout) 
{
    timeout = timeout || 5000;
    var timedOut = false, timer;
    var img = new Image();
    img.onerror = img.onabort = function() {
        if (!timedOut) {
            clearTimeout(timer);
            callback(url, "error");
        }
    };
    img.onload = function() {
        if (!timedOut) {
            clearTimeout(timer);
            callback(url, "success");
        }
    };
    img.src = url;
    timer = setTimeout(function() {
        timedOut = true;
        callback(url, "timeout");
    }, timeout); 
},
 

ShowToplinks:function ( mode) 
{
    if ( mode == 2)
        fr.settings.fShowToplinks = !fr.settings.fShowToplinks;
    else
        fr.settings.fShowToplinks = mode;
    fr.SaveSettings();
    fr.doShowHelp();
    fr.checkAddButtons();
    if ( fr.settings.fShowToplinks)
    {
        fr.jq.showDI("#idFilterText");
        fr.jq.showDI("#idFilter");
        fr.jq.showDI("#idToplinks");
        fr.jq.showDI("#idEditMode");
        this.doResize();
    }
    else
    {
        fr.jq.hideD("#idFilterText");
        fr.jq.hideD("#idFilter");
        fr.jq.hideD("#idToplinks");
        fr.jq.hideD("#idEditMode");
    }
},
   
fDarkIcons:false,
InitSearchProvider:function () 
{
    var shadowcolor;
    var bkcolor = "";
    var textcolor;
    var bordercolor = fr.GetBorderColor();
    if ( fr.curframe)
    {   
        textcolor = fr.curframe.textcolor;
        bkcolor = fr.curframe.bkcolor;
    }
    else
    {   
        textcolor = fr.GetTextColor();
    }
    var c = textcolor.charAt(1);
    if ( !fr.curframe && (bordercolor=="#000" || bordercolor=="#000000"))
    {
        shadowcolor = "#000";
        fr.jq.setAttr("#idLogo", "src", "./png/logo_video.png");        
        fr.fDarkIcons=false;
    }
    else if ( c < '8')
    {
        shadowcolor = "#fff";
        fr.jq.setAttr("#idLogo", "src", "./png/logo_video_black.png");
        fr.fDarkIcons=true;
    }
    else
    {
        shadowcolor = "#000";
        fr.jq.setAttr("#idLogo", "src", "./png/logo_video.png");
        
        fr.fDarkIcons=false;
    }
    

    if ( fr.fDarkIcons)
    {
        fr.jq.setAttr("#idImgAddUrl", "src", "./png/addToplinks_dark.png");
        fr.jq.setAttr("#idImgEditMode", "src", "./png/moveToplink_dark.png");
        fr.jq.setAttr("#idImgSettings", "src", "./png/settings_dark.png");
    }
    else
    {
        fr.jq.setAttr("#idImgAddUrl", "src", "./png/addToplinks.png");
        fr.jq.setAttr("#idImgEditMode", "src", "./png/moveToplink.png");
        fr.jq.setAttr("#idImgSettings", "src", "./png/settings.png");
    }
    
    if ( fr.curframe)
        var color = 'color:'+textcolor+';text-shadow: '+shadowcolor+' 4px 4px 4px;';
    else
        var color = 'color:'+textcolor+';text-shadow: none;';
    
    if (typeof(SearchURLs) == 'undefined')
        SearchURLs = new Array();
        
        
    var oFont = document.createElement('font');
    oFont.setAttribute('face', "arial");
                
    /*
    for (var i=0; i<SearchURLs.length; i++)
    {
        var name = SearchURLs[i].name;
        if ( name.indexOf( "langkey")>=0)
            name = t[name];
            
        var oA = document.createElement('a');
        oA.setAttribute('id', "idSearch_"+i);
        oA.setAttribute('class', "clSearch");
        if ( fr.nCurSearchProvider == i)
            oA.setAttribute('style', color+ " font-weight:bold");        
        else
            oA.setAttribute('style', color);        
        oA.textContent = name;
        oFont.appendChild(oA);
    }
    
    var o = document.getElementById("searchProvider");
    fr.removeAllChilds(o);
    o.appendChild(oFont);
    
    if ( bkcolor)
    {
        var o2 = document.getElementById("searchProviderBackground");
        o2.style.width = o.clientWidth+"px";
        o2.style.height = "20px";
        o2.style.background = bkcolor;        
        fr.jq.showD("#searchProviderBackground");
    }
    else
    {        
        fr.jq.hideD("#searchProviderBackground");
    }
    
    for (var i=0; i<SearchURLs.length; i++)
    {
        fr.myBindClick("#idSearch_"+i, { param: i }, function(ev) {fr.doSearch( ev.data.param);return false;});
    }
    */
},
/*
doSearch:function ( i) 
{
    if( i < 0)
        i = fr.nCurSearchProvider;
    count = SearchURLs.length; 
    if ( i<count)
    {
        o = document.getElementById("idInput"); 
        sText = o.value;
        
        if ( sText.indexOf("changelanguage:")>=0)
        {
            var i = sText.indexOf(":");
            fr.curLang=sText.charAt(i+1)+sText.charAt(i+2);
            if ( fr.curLang =="de")
                t = t_de;
            else
                t = t_en;
            SetLanguage( );
            
            fr.InitSearchProvider();
            return; 
        }
        
        if ( sText.toLowerCase().indexOf( "http:") == 0 || sText.toLowerCase().indexOf( "https:") == 0)
        {
            fr.jq.showD("#idAll");
            window.location.replace( s);
            return;
        }
        if ( sText.toLowerCase().indexOf( "www.") == 0)
        {
            fr.jq.showD("#idAll");
            window.location.replace( "http://"+s);
            return;
        }
        if ( sText && sText !="")
        {
            s = fr.ReplaceRedirectLanguage(SearchURLs[i].url, true);
    	    sText = escape(sText);
            if ( s.indexOf( "startpage24.com/redirect.asp") >=0)
                sText = escape(sText);
                
            s = s.replace("LINK64SEARCHTEXT", sText);
            s = s.replace("%P1%", sText);
            fr.jq.showD("#idAll");
            window.location.href = s;
            //window.location.replace( s);
        }
        else
        {
            fr.nCurSearchProvider = i;
            fr.InitSearchProvider();
        }
    }
},
*/
mySetFocus:function( id)
{
    var fIE8 = false;
    var o = document.getElementById(id);    
    if ( o && o.focus)
    {
        o.selectionStart = 0;
        o.selectionEnd = 1000;
        o.focus();        
    }
},

lastState:0,
fVideosChanged: false,
orderBeforeMove:false,
doEditMode:function ( on) 
{
    if ( !fr.settings.fShowToplinks)
       return;
    
    if ( on > 0)
    {
        if ( !fr.mousehandleradded)
        {
            fr.mousehandleradded = true;
            // addEventListener only if user want to drag&drop toplinks
            document.addEventListener( "mousemove", this.myMouseMove,false); 
        }
    
        fr.jq.hideD("#idFilterText");
        fr.jq.hideD("#idFilter");
        fr.jq.hideD("#idEditMode");
        fr.jq.showD(".clEditMode");
        fr.jq.hideD("#idSettings");
        fr.jq.setStyle("#idTextLinks", "right", "320px");
        fr.jq.setStyle("#idTextLinks", "left", "260px");
        
        if ( fr.curFilter)
            fr.SetFilter( "");
            
        lastState = new Object();
        lastState.folder = this.lpCurFolder?this.lpCurFolder.id:0;
        lastState.page = fr.nCurPage;
        fr.fVideosChanged = false;

        var tl = fr.FindToplinkType(0, "v");
        if (tl) {
            fr.orderBeforeMove = [];
            for (var i = 0; i < tl.Toplinks.length; i++) {
                fr.orderBeforeMove.push(tl.Toplinks[i]);
            }
        }
    }
    else
    {
        
        fr.jq.showDI("#idFilterText");
        fr.jq.showDI("#idFilter");
        fr.jq.showDI("#idToplinks");
        
        fr.jq.showDI("#idEditMode");
        fr.jq.hideD(".clEditMode");
        fr.jq.showD("#idSettings");
        fr.jq.setStyle("#idTextLinks", "right", "130px");
        fr.jq.setStyle("#idTextLinks", "left", "380px");
        
        if ( on == -1) //Cancel edit mode
        {
            var tl = fr.FindToplinkType(0, "v");
            if (tl) {
                tl.Toplinks = [];
                for (var i = 0; i < fr.orderBeforeMove.length; i++) {
                    tl.Toplinks.push(fr.orderBeforeMove[i]);
                }
            }
            on = 0;
        }
        else
        {
            if ( fVideo && fr.fVideosChanged)
            {
                var tl = fr.FindToplinkType( 0, "v");
                if ( tl)
                {
                    var videoItemIds = new Array();
                    for ( var i = 0; i < tl.Toplinks.length;i++) 
                    {
                        videoItemIds.push( tl.Toplinks[i].url);
                    }
                    L64P.video.saveItems({id:videoItemIds});  //.videoid
                }
            }
            fr.SaveToplinks();
        }        
    }

    this.fEditMode = on;
    fr.doShowHelp();
    this.doResize();
},

DelAllToplinks:function ( ) 
{
    fr.lpToplinkBottomFolder = new Array();
    this.lpCurFolder = 0;
    this.curFilter="";
    this.nCurFolderLevel = 0;
    fr.SetFilter( "");
},
 

SetScreenshotUrl:function ( parent, url, screenshotURL)
{
    var j;
    var refresh = false;
    for( j = 0; j<parent.length;j++)
    {
        if ( parent[j].url == url && parent[j].screenshotURL != screenshotURL)
        {
            parent[j].screenshotURL = screenshotURL;
            refresh = true;
        }
        if ( parent[j].Toplinks)
            erg |= SetScreenshotUrl( parent[j].Toplinks, url, screenshotURL);
    }
    return refresh;
},

//ScreenshotWaiting:0,
GetScreenshotUrl:function ( o, frefresh)
{
    if ( o && o.type=="video")
    {
        o.screenshotURL = o.thumb;
        return;
    }
},

CreateVideoBar:function()
{
    if (fr.jq.get("#idVideobar").innerHTML)
        return;
    var a = new Array();
    for ( var i1 = 0; i1 < VideoSites.length; i1++)
    {
        a.push(VideoSites[i1]);
    }
    
    a.sort(function(a,b){return Math.round(Math.random()*20-10);});
    while ( a.length < 30)
    {
        a = a.concat( a);
    }
    var oBestOf = document.getElementById("idVideobar");
    var oA = fr.co('a',oBestOf,{"style":"font-size:12px;position:relative;top:-6px;"});
    oA.textContent = t["supported"];
    for ( i1 = 0; i1 < a.length; i1++)
    {
        var oA = fr.co('a',oBestOf,{"href":a[i1].url});
        fr.co('img',oA,{"style":"margin-left:5px;margin-top:3px;","src":a[i1].thumb,"height":"24px"});
    }
},
 
MoveBegin:function ( id)
{
    this.ModifyToplinkRecur( 0, id, "begin");
    this.doResize();
},
MoveEnd:function ( id)
{
    this.ModifyToplinkRecur( 0, id, "end");
    this.doResize();
},

idCurrentEdit:0,
delOnCancel:"",
 

GetToplinkThumb:function( tl)
{
    if ( tl.thumb)
        return tl.thumb;
    if ( tl.screenshotURL && tl.screenshotURL != "*" && tl.screenshotURL.indexOf("invalid_224")< 0)
        return tl.screenshotURL;
    return "./png/nothumb.png";
},   
 

FindToplink:function( parent, id)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.id == id)
            return o;         
        if ( o.Toplinks)
        {
            var result = this.FindToplink( o, id);
            if ( result)
                return result;
        }
    }
    return 0;
},

GetToplinkIndex:function( bottom, toplinkId)
{
    for ( var j = 0; j < bottom.length; j++)
    {
        if ( bottom[j].id == toplinkId)
            return j;
    }   
    return-1;
},

MoveToplinkBefore:function ( toplinkId, target, fAllowIntoFolder)
{
    if (target.mode == 1 && !fAllowIntoFolder) // Not into Folder during D&D
        return;
    var bottom = fr.lpCurFolder ? fr.lpCurFolder.Toplinks : fr.lpToplinkBottomFolder;
    var i = fr.GetToplinkIndex( bottom, toplinkId);
    if ( i<0)
        return;
    var o = bottom[i];

    if ( fr.lpCurFolder)
    {
        if ( target.toplinkId < 0 && target.mode == 1 && this.nCurFolderLevel>0) // Backbutton
        {
            if ( fr.lpCurFolder.type == "v") // Videos must not be move in any other folder
                return;
            bottom.splice(i,1); // Del 1 Element at i
            fr.lpCurFolder.Toplinks = bottom;
            var parent = fr.FindToplink( 0, this.lpFolderStack[this.nCurFolderLevel-1].id);
            if ( parent)
                parent.Toplinks.push(o);
            else
                fr.lpToplinkBottomFolder.push(o);
            return;
        }
    }
    
    if (target.mode == 2)  // At the end
    {
        bottom.splice(i,1); // Del 1 Element at i
        bottom.push(o); // insert 1 element at before
    }
    else
    {
        var before = fr.GetToplinkIndex( bottom, target.toplinkId);
        if ( before<0)
            return;
        if (target.mode == 1) 
        {
            var oFolder = bottom[before];
            if ( oFolder && oFolder.type !="f")
                return;            
            bottom.splice(i,1); // Del 1 Element at i
            if ( !oFolder.Toplinks)
                oFolder.Toplinks = new Array();
            oFolder.Toplinks.push( o);
        }
        else
        {
            if ( i > before)
            {   
                bottom.splice(i,1); // Del 1 Element at i
                bottom.splice(before,0,o); // insert 1 element at before
               
            }     
            else if ( i < before)
            {                
                bottom.splice(before,0,o); // insert 1 element at before
                bottom.splice(i,1); // Del 1 Element at i
                 
            }  
        }
    }
    if ( fr.lpCurFolder)
        fr.lpCurFolder.Toplinks = bottom;
    else
        fr.lpToplinkBottomFolder = bottom;
},

DelDefaultToplinks:function ( parent)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.def == true)
        { 
            bottom.splice( i,1);
            if ( !parent)
                fr.lpToplinkBottomFolder = bottom;
            else
                parent.Toplinks = bottom;
            i--;
            continue;
        }
        if ( o.Toplinks)
            this.DelDefaultToplinks( o);
    }
},

ModifyToplinkRecur:function ( parent, id, mode)
{
    var bottom = parent ? parent.Toplinks : fr.lpToplinkBottomFolder;
    for ( var i = 0; i < bottom.length; i++)
    {
        var o = bottom[i];
        if ( o.id == id)
        { 
            var a2 = bottom.slice( i+1);
            var a1 = bottom.slice( 0,i);
            bottom = a1.concat(a2);
            
            if ( mode == "begin")
            {
                a1 = new Array();
                a1.push( o);
                bottom = a1.concat(bottom);
            }
            else if ( mode == "end")
            {
                bottom.push(o);
            }
            else if ( mode == "del")
            {
                if ( o.type=="v")
                    fr.settings.folder &= (255-8);
                else if ( o.type=="downloads")
                    fr.settings.special &= (255-1);
                    
                if( parent && parent.type=="v" && !fr.fEditMode) // Video folder
                {
                    var videoItemIds = new Array();
                    for ( var i = 0; i < bottom.length;i++) 
                    {
                        videoItemIds.push( bottom[i].url);
                    }
                    L64P.video.saveItems({id:videoItemIds}); 
                }
            }
            if ( !parent)
                fr.lpToplinkBottomFolder = bottom;
                
            else
                parent.Toplinks = bottom;
            //this.lpCurFolder = bottom;
            return true;
        }
        if ( o.Toplinks)
            if ( this.ModifyToplinkRecur( o, id,mode))
                return true;
    }
    return false;
},

DelToplink:function ( id)
{
    this.ModifyToplinkRecur( 0, id, "del");
    this.doResize();
    fr.SaveToplinks();
},

nextfreeid:1,
 
SetIds:function( parent) // Make sure every toplink has an own id
{
    for (var i=0; i <parent.length; i++)
    {
        if ( !parent[i].id)
            parent[i].id=this.nextfreeid++;
        if ( parent[i].Toplinks)
            this.SetIds( parent[i].Toplinks);
    }
},

colorclicked:function( id)
{
    var i = id.indexOf( '_');
    var def = id.slice(i+1);
    id = id.slice(0,i);
    fr.CreateColorSectors( id, '#'+def);
},

dlgbackgroundcolor:-1,
dlgbordercolor:-1,
dlgtextcolor:-1,
CreateColorSectors:function( id, def)
{
    if ( id == "idbackgroundcolors")
    {
        fr.dlgbackgroundcolor = def;
        a = ["000","777","aaa","fff","f00","f80","ff0","8f0","0f0","0f8","0ff","08f","00f","008","80f","f0f","f08"];
    }
    else if ( id == "idbordercolors")
    {
        fr.dlgbordercolor = def;
        a = ["000","777","aaa","fff","f00","f80","ff0","8f0","0f0","0f8","0ff","08f","00f","008","80f","f0f","f08"];
    }
    else
    {
        fr.dlgtextcolor = def;
        a = ["000","777","c0c0c0","fff","f00","f80","ff0","8f0","0f0","0f8","0ff","08f","00f","008","80f","f0f","f08"];
    }
    if ( def == "#000000")
        def = "#000";
        
    var oParent = document.getElementById(id); 
    fr.removeAllChilds( oParent);
    for ( var i = 0; i < a.length; i++)
    {
        var id2 = id+"_"+a[i];
        var oDiv = fr.co('div',oParent,{"id":id2,"class":'clColorSelect',"style":'background:#'+a[i]});
        if ( def == ('#'+a[i]))
            fr.co('img',oDiv,{"style":'position:relative;left:3px;top:3px;',"src":'./png/radio1.png'});
    }
    
    for ( var i = 0; i < a.length; i++)
    {
        var id2 = id+"_"+a[i];
        fr.myBindClick("#"+id2, { param: id2}, function(ev) {fr.colorclicked( ev.data.param);return false;});
    }
},

radioclicked:function( )
{
    if (fr.jq.get("#idchecknodefaults").checked)
        fr.jq.showD("#idNoDefaults");
    else
        fr.jq.hideD("#idNoDefaults");
},

settings:0,
ShowMsgDlg:function( mode)
{
    if ( mode == 1)
    {
        fr.jq.hideD("#idToplinkSettings");
        fr.jq.hideD("#idsync");

        fr.jq.setClick("#b1", function () { fr.ShowMsgDlg(0); return false; });
        fr.jq.setClick("#b2", function () { fr.ShowMsgDlg(2); return false; });
        fr.jq.setClick("#b3", function () { fr.ShowMsgDlg(3); return false; });
            
        fr.jq.setVal("#b1", t['cancel']);
        fr.jq.setVal("#b2", t['ok']);
        fr.jq.setVal("#b3", t['apply']);
        
        fr.jq.hideD(".chromeOnly");
        
        if ( !fVideo)
        {
            fr.settings.folder&=(255-8);
            fr.jq.hideD("#idVideoSettings");
        }
        
        fr.jq.setVal("#idresethelp", t['resethelp']);
        fr.jq.setVal("#idresettheme", t['resettheme']);        
        fr.jq.setClick("#idresettheme", function () { fr.ResetTheme(); return false; });
        fr.jq.setClick("#idresethelp", function () { fr.settings.help = 64; fr.doShowHelp(); return false; });
        
        //fr.jq.get("#idcheckvideo").checked = !!(fr.settings.folder & 8);
        fr.jq.get("#idchecknodefaults").checked = !fr.settings.fUseThemeDefaults;
        
        fr.radioclicked();

        fr.jq.setClick("#idchecknodefaults", function () { fr.radioclicked(); });
        
        fr.CreateColorSectors( "idbackgroundcolors", fr.settings.color_background);
        fr.CreateColorSectors( "idbordercolors", fr.settings.color_border);
        fr.CreateColorSectors( "idtextcolors", fr.settings.color_text);
        
        var oSelect = document.getElementById("idSelectBorder"); 
        fr.removeAllChilds( oSelect);
        fr.co( 'option',oSelect,{"value":""},t["noborder"]);
        
        for ( var i = 0; i < Frames.length; i++)
        {
            var frame = Frames[i];
            if ( fr.curLang == "de")
                fr.co( 'option',oSelect,{"value":frame.id},frame.de);
            else
                fr.co( 'option',oSelect,{"value":frame.id},frame.en);
        }
        
        fr.jq.setVal("#idSelectBorder", fr.settings.border);
        fr.jq.setVal("#idSelectTrans", fr.settings.trans);
        
        fr.jq.hideD("#langKey_trans");
        fr.jq.hideD("#idSelectTrans");
        
        var oSelect = document.getElementById("idSelectCountry"); 
        fr.removeAllChilds( oSelect);
        fr.co( 'option',oSelect,{"value":"de"},t["langKey_de"]);
        fr.co( 'option',oSelect,{"value":"en"},t["langKey_en"]);
        
        fr.jq.setVal("#idSelectCountry", fr.curLang);
        
        {
            fr.jq.hideD("#langKey_icon");   
            fr.jq.hideD("#idSelectIcon");
        }
        
        fr.jq.showD("#idMsgDlg");
    }
    else if ( mode == 0) // cancel
        fr.jq.hideD("#idMsgDlg");
    else if ( mode == 2 || mode == 3) // 2 == ok   3 == apply
    {
        if ( mode == 2)
            fr.jq.hideD("#idMsgDlg");
        var o = 0;
        
        //if (fr.jq.get("#idcheckvideo").checked)
        //    o+=8;

        fr.settings.fUseThemeDefaults = !fr.jq.get("#idchecknodefaults").checked;
        fr.settings.color_background = fr.dlgbackgroundcolor;
        fr.settings.color_border = fr.dlgbordercolor;
        fr.settings.color_text = fr.dlgtextcolor;
        fr.settings.border = fr.jq.getVal("#idSelectBorder");
        fr.settings.trans = fr.jq.getVal("#idSelectTrans");
        
        var oldLang = fr.curLang;
        fr.curLang =  fr.jq.getVal("#idSelectCountry");
        
        
        //if ( !fr.fShowSettingsOnly)
            fr.RefreshBorder();

        var b1 = fr.GetBorderColor();
        var b2 = fr.GetGradientColor(b1);

        fr.jq.setStyle("#idBottombarGradient", "background", "linear-gradient(to bottom, " + b2 + " 0%," + b1 + " 100%");
        
        if (!fr.jq.get("#idFrame").innerHTML)
        {
            fr.jq.setStyle("#topbar","background", "linear-gradient(to bottom, " + b2 + " 0%," + b1 + " 100%");
            
        }

        fr.jq.setStyle(".clTextColor", "color", fr.GetTextColor());
        fr.settings.folder = o;
        fr.AddDefaultFolder( false);
        
        fr.SaveSettings();
        if (fr.curLang != oldLang) {
        
            SetLanguage();
            L64P._db._locStorage.setItem("curlang", fr.curLang);
            chrome.runtime.sendMessage({ msg: "SP24SetLang", lang: fr.curLang }, function (response) { });
        }
        fr.InitSearchProvider();             
        fr.doResize();
    }
},
 
ReplaceRedirectLanguage:function( url, fAllUrls)
{
    if ( !url)
        return "";
    var s = url;
    s = s.replace("[lang]", fr.curLang);
    s = s.replace("[country]", "");
    s = s.replace("[serial]", fr.settings.sn);
    s = s.replace("[postfix]", "com");
    return s;
},

CopyArray:function( aOld, fSave)
{
    var a = new Array();
    for ( var i = 0; i < aOld.length; i++)
    {
        if (fSave)
        {
            if ( aOld[i].type == "video") // save not all
                continue;
        }
        var o = fr.CopyObject(aOld[i], fSave);
        a.push(o);
    } 
    return a;
},

CopyObject:function(oOld, fSave)
{
    var o = new Object();
    for ( var name in oOld)
    {
        if ( name == "Toplinks")
        {
            o.Toplinks = fr.CopyArray(oOld.Toplinks,fSave);
        }
        else  
        {
            o[name] = oOld[name];
        }        
    } 
    return o;
},

GetBackgroundColor:function()
{
    if (fr.settings.fUseThemeDefaults)
        return "#ffffff";
    return fr.settings.color_background;
},

GetTextColor:function()
{
    if ( fr.settings.fUseThemeDefaults)
        return "#cccccc";
    return fr.settings.color_text;
},
GetBorderColor:function()
{
    if ( fr.settings.fUseThemeDefaults)
        return "#333333";
    return fr.settings.color_border;
},

GetGradientColor:function(b1)
{
    if ( !b1)
        b1 = "#000";
        
    if ( b1 == "#000" || b1 == "#000000")
        return "#333";
        
    var b2="";
    for ( var i = 0; i < b1.length; i++)
    {
        var c = b1.charAt(i);
        switch(c)
        {
        case '0':c='0';break;
        case '1':c='0';break;
        case '2':c='1';break;
        case '3':c='1';break;
        case '4':c='2';break;
        case '5':c='2';break;
        case '6':c='3';break;
        case '7':c='4';break;
        case '8':c='4';break;
        case '9':c='5';break;
        case 'a':c='6';break;
        case 'b':c='7';break;
        case 'c':c='8';break;
        case 'd':c='9';break;
        case 'e':c='a';break;
        case 'f':c='b';break;
        }
        b2 += c;
    }
    return b2;
},
GetCurBorder:function()
{
    if ( fr.settings.fUseThemeDefaults)
        return false;
    return fr.settings.border;
},


 
curLang:"en",
needRefresh:false,
fShowSettingsOnly:false

} // end of fr

function SetLanguage( )
{
    if (fr.curLang == "de")
        t = t_de;
    else
        t = t_en;
    fr.jq.getAllItems(".langKey", function (element)
    {
        var id = element.id;
	    var j = id.indexOf( '-');
	    if (j >= 0) {
	        element.textContent = t[id.slice(0, j)]; // This is no dynamic html code, but fixed text from text.js which is allready encoded 
	    }
	    else
	        element.textContent = t[id];// This is no dynamic html code, but fixed text from text.js which is allready encoded
	    if ( id == "langKey_helpvideo")
	        fr.co("img", element, { 'src': './png/icon.png' });
    });	
    
    fr.jq.setText("#idSearchButton2",t['search']);
    fr.jq.setText("#idFilterText", t['filter']);
    fr.jq.setVal("#idButtonDone",t['done']);
    fr.jq.setVal("#idButtonCancel",t['cancel']);
    
}

function GetImageSize(url)
{
    var o = 0;
    fr.jq.getAllItems(".clThumbBase", function (element) {    
        if (element.getAttribute("src") == url)
        {   
            o = new Object();   
            o.w = this.naturalWidth;
            o.h = this.naturalHeight;
            if ( !o.w)
            {
                o = 0;
            }
            else if ( o.w == 224 && o.h == 126)
                o = 0;
            else
                o = o;
        }
    });
    return o;        
}

L64P.events.onNewVideo = function(details)
{
    //alert("onNewVideo");
    if ( !fVideo)
        return;
    if ( fr.lpCurFolder && fr.lpCurFolder.type=="v")
    {
        var videoItems = L64P.video.getWatchedItems({},function(data)
        {
            fr.ConvertVideoData( data.items);
            fr.doResizeHome();
        }); 
        
        
        if ( videoItems)
        {
            fr.ConvertVideoData( videoItems);
            fr.doResizeHome();
        }
    }
}

L64P.events.onTopLinkChanged = function(details)
{
	
}

window.onload = function()
{
    fr.jq = new L64Jq();
    fr.jq.init({ doc: document });
    fr.curLang = L64P._db._locStorage.getItem("curlang");
    if (!fr.curLang)
    {
        var lang = navigator.userLanguage || navigator.language;
        if (lang.indexOf("de") >= 0)
            fr.curLang = "de";
        else
            fr.curLang = "en";
    }
    fr.title = "Video Downloader Professional";
    document.title = fr.title;   
    defaults = defaults2;
    
    fr._locStorage = chrome.storage.local;
    
    Frames = defaults.Frames;
    SearchURLs = defaults.SearchURLs;

    fr.settings = new Object(); 
    L64P.settings.get({id:'settings'}, function(data){
        if ( data)
        {
            fr.settings = data;
        }
        else
        {
            fr.SetDefaultSettings();
        }

        SetLanguage();

        if ( !fVideo)
            fr.settings.folder&=(255-8);
                                    
        if ( !fr.settings.trans)
        {   
            fr.settings.trans = "0.9";
        }

        if ( window.location.href.indexOf( "options=1")>=0)
            fr.fShowSettingsOnly=true;
        if ( fr.fShowSettingsOnly)
        {
            fr.doInit(); 
                    
            //fr.jq.setStyle("#body","visibility","visible");
            fr.ShowMsgDlg(1);
        }
        else
        {
            fr.doInit(); 
            
        }
        });
}




