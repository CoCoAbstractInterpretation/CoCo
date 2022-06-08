/**
 * Copyright (C) 2019 Lifetrack Medical Systems
 * http://lifetrackmed.com
 * 14 February 2019
 * Brendan Rees
 * brendan@client14.com
 */

chrome.runtime.onInstalled.addListener(function() {
	chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
		chrome.declarativeContent.onPageChanged.addRules([{
			conditions: [new chrome.declarativeContent.PageStateMatcher({
				pageUrl: { urlMatches: "(devfakedomain\.com|lifetrackmed\.com|lifetrackmedicalsystems\.com)" },
        		})],
            		actions: [new chrome.declarativeContent.ShowPageAction()]
      		}]);
	});
});

chrome.runtime.onConnect.addListener(function(port) {
	port.onMessage.addListener(function(event) {
		let currentID;

		if (event.type == "clear") {
			new ClearDownload().clearDownload();
		} else if (event.type == "shelf") {
			chrome.downloads.setShelfEnabled(true);
		} else if (event.type == "filesystem") {
			chrome.downloads.setShelfEnabled(false);
			let URL = event.link;
			let fileName = event.fileName;
			chrome.downloads.onChanged.addListener(onChanged);
			chrome.downloads.download({url : URL, filename : fileName}, id => {
				port.postMessage({"started" : "true"});
				currentID = id;
			});
		} else if (event.type == "openStudyPage") {
			chrome.windows.getAll({populate : true}, function(array) {
				for (let x = 0; x < array.length; x++) {
					if (array[x].tabs) {
						for (let y = 0; y < array[x].tabs.length; y++) {
							if (array[x].tabs[y].url.indexOf("ReportStudyPage") !== -1) {
								chrome.windows.update(array[x].tabs[y].windowId, {focused : true});
							}
						}
					}
				}
			});
		} else if (event.type == "openWorkflowPage") {
			chrome.windows.getAll({populate : true}, function(array) {
				for (let x = 0; x < array.length; x++) {
					if (array[x].tabs) {
						for (let y = 0; y < array[x].tabs.length; y++) {
							if (array[x].tabs[y].url.indexOf("WorklistStudyPage") !== -1) {
								chrome.windows.update(array[x].tabs[y].windowId, {focused : true});
							}
						}
					}
				}
			});
		}

		function onChanged({id, state}) {
			if (id == currentID && state && state.current !== "in_progress") {
				port.postMessage({"written" : "true"});
			}
		}
	});
});
