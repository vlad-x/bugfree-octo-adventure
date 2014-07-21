

function request(request, callback) {
  callback = callback || request.callback;
  var xhttp = new XMLHttpRequest();
  var method = request.method ? request.method.toUpperCase() : 'GET';

  xhttp.onload = function() {
    if (xhttp.readyState==4){
      callback(xhttp.responseText);
    }
  };
  xhttp.open(method, request.url, true);
  if (method == 'POST') {
    xhttp.setRequestHeader("Content-Type", request.contentType || "application/x-www-form-urlencoded");
  }
  xhttp.send(request.data);
}


// accept messages from iframes and send it back to the top document content script
chrome.extension.onMessage.addListener(function(data, sender) {
  //chrome.tabs.sendMessage(sender.tab.id, data);

  console.log('ADS FOUND', data.data);
  request({
    url: 'http://localhost:3000/api/savedata',
    method: 'POST',
    contentType: 'application/json',
    data: JSON.stringify(data.data),
    callback: function(text) {
      console.log('RESPONSE', text);
    }
  })
});
