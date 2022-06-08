/**
 * Clear instance objects from download directory
 * Copyright (C) 2019 Lifetrack Medical Systems
 * http://lifetrackmed.com
 * 12 February 2019
 * Brendan Rees
 * brendan@client14.com
 */
"use strict";

function ClearDownload() {
	/**
	 * Note: This uses download history, it does not read the contents of the download directory.
	 * For whatever reason, chrome only seems to delete about half the files it creates. No idea why.
	 */
	this.clearDownload = function() {
		chrome.downloads.search({ }, function(file) {
			for (let x = 0; x < file.length; x++) {
				if (file[x].filename.indexOf("LMSRadiant") !== -1) {
					chrome.downloads.search({query : [file[x].id.toString()]}, function(item) {
						if (item.length) {
							chrome.downloads.removeFile(file[x].id, function() {
								if (chrome.runtime.lastError) {
									console.log(chrome.runtime.lastError.message);
								}
							});
							chrome.downloads.erase({query : [file[x].id.toString()]}, function() {
								if (chrome.runtime.lastError) {
									console.log(chrome.runtime.lastError.message);
								}
							});
						}
					});
				}
			}
		});
	}
}
