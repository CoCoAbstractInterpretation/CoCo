/**
 * Browser <----> extension communication
 * Copyright (C) 2019 Lifetrack Medical Systems
 * http://lifetrackmed.com
 * 12 February 2019
 * Brendan Rees
 * brendan@client14.com
 */
"use strict";

let port = chrome.runtime.connect();

window.addEventListener("message", function(event) {
	if (event.source != window) {
		return;
	}
	if (!event.data && !event.data.type) {
		return;
	}

	if (event.data.type) {
		switch (event.data.type) {
			case "clear" :
			case "store" :
			case "shelf" :
			case "filesystem" :
			case "openStudyPage" :
			case "openWorkflowPage" :
				port.postMessage(event.data);
		}
	}
}, false);

port.onMessage.addListener(function(msg) {
	postMessage(msg, "*");
});

