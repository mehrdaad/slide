var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-57741199-3']);
_gaq.push(['_trackPageview']);

(function() {
  var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
  ga.src = 'https://ssl.google-analytics.com/ga.js';
  var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();

chrome.runtime.onMessage.addListener(function (msg, sender) {
    if ((msg.from === 'content') && (msg.subject === 'showNotification')) {
		chrome.notifications.create(
		    (Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000).toString() ,{   
		        type: "basic",
		        title: "Remote for Google Slides",
		        message: msg.msg,
      			buttons: [{title: 'Learn More',iconUrl: "info.png"}],
		        iconUrl: "logo_128.png",
		        priority: 0
		    },
		    function() {} 
		);
  }
});

chrome.runtime.onMessageExternal.addListener(
    function(request, sender, sendResponse) {
        if (request) {
            if (request.message) {
                if (request.message == "version") {
                    sendResponse({version: "2.0.2"});
				}
				if (request.message == "guide") {
					chrome.tabs.create({'url': chrome.extension.getURL('welcome.html')}, function(tab) {});
				}
            }
        }
        return true;
    });

chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
		chrome.tabs.create({'url': chrome.extension.getURL('welcome.html')}, function(tab) {});
	}
	else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
		chrome.notifications.create(
		    'updateNotification',{   
		        type:"basic",
		        title:"Remote for Google Slides",
		        message: "Updated to the latest version: Ver " + thisVersion,
		        iconUrl:"logo_128.png",
		        buttons: [{title: 'Learn More',iconUrl: "info.png"}],
		        priority: 0
		    },
		    function() {} 
		);
		if (thisVersion <= 2){
			chrome.tabs.create({'url': chrome.extension.getURL('welcome.html')}, function(tab) {});
		}
    }
});

chrome.notifications.onButtonClicked.addListener(function(){
  chrome.tabs.create({'url': chrome.extension.getURL('welcome.html')}, function(tab) {});
})