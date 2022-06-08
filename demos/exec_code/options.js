// Saves options to chrome.storage
function save_options() {
	
  var idext = document.getElementById('idext').value;
  var idapp = document.getElementById('idapp').value;
  var mslog = document.getElementById('mslog').checked;

  chrome.storage.sync.set({
	page_idext: idext,
	page_idapp: idapp,
	mostra_log: mslog
  }, function() {
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

function restore_options() {
  chrome.storage.sync.get({
	page_idext: 'bdiogkcdmlehdjfandmfaibbkkaicppk',
	page_idapp: 'jlffnegbpbekpachncglchmlbieolnkh',
	mostra_log: true
  }, function(items) {
    document.getElementById('mslog').checked = items.mostra_log;
	document.getElementById('idext').value = items.page_idext;
    document.getElementById('idapp').value = items.page_idapp;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click',save_options);