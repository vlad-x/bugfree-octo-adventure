
// accept messages from iframes and send it back to the top document content script
chrome.extension.onMessage.addListener(function(data, sender) {
  chrome.tabs.sendMessage(sender.tab.id, data);
});
