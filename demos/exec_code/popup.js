var cor = 0;
var color = 'red';
var drive = '*';
	  
function click(e) {

}

function clicbtn(e) {
	chrome.runtime.sendMessage({greeting: "status"}, function(response) {
	console.log(response);

		try {
			cor = response.stat;
		}
		catch(err) {
			cor = 0;
		}
		
		try {
			drive = response.driv;
		}
		catch(err) {
			drive = '*';
		}
		
	 if(cor == 1){color = 'green';}
	  
	  document.getElementById("divstatus").style.backgroundColor = color;
	  document.getElementById("drive").innerHTML = 'Drive:'+drive;
  
	});	
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
		console.log(request);
});

document.addEventListener('DOMContentLoaded', function () {
  var divs = document.querySelectorAll('div');
  for (var i = 0; i < divs.length; i++) {
    divs[i].addEventListener('click', click);
  }
  
  var btn = document.querySelectorAll('button');
  for (var i = 0; i < btn.length; i++) {
    btn[i].addEventListener('click', clicbtn);
  }
});
