
function extractBanner(el) {
  var img = el.querySelector('img');
  if (!img) return false;
  return { img: img.src, url: el.href };
}

var ads = {
  '#adDiv a': extractBanner,
  '.adroll-block a': extractBanner,
  '#google_image_div a': extractBanner,
  'body[bgcolor=White] a[target=_blank]': extractBanner,
  '#google_image_div a': extractBanner,
  '.bsap a': extractBanner
};

var data = [];
var orig_location = window.location.hef;

function findFrames() {
  // find all iframes
  var ifrs = document.getElementsByTagName('iframe');
  var docs = [ document ];
  for (var i in ifrs) {
    try {
      var test = ifrs[i].contentDocument.body;
      if (test) {
        docs.push(ifrs[i].contentDocument);
      }
    } catch(e) {};
  }
  return docs;
}

function findAds(doc) {
  var out = [];
  for (var i in ads) {
    var el = doc.querySelectorAll(i);
    // console.log('QUERY SELECTOR', window.location.href, el);
    if (el && el.length) {
      for (var k=0; k<el.length; k++) {
        var ad = (ads[i])(el[k]);
        if (ad) {
          out.push(ad);
        }
      }
    }
  }
  return out;
}

function extractGoogleSearchAds() {
  var out = [];

  var extractGoogleAd = function(ad, location) {
    try {
      var anc =  ad.querySelector('h3 a:nth-child(2)');
      var title = anc.innerText;
      var url = anc.href;
      var visit_url = ad.querySelector('.ads-visurl cite').innerText;
      var text = ad.querySelector('.ads-creative').innerText;
    } catch(e) {
      console.log('ERROR', e);
      console.log(ad.innerHTML);
    }
    if (url && text) {
      out.push({ url: url, visit_url: visit_url, title: title, text: text, location: location});
    }
  };
  var tads = document.querySelectorAll('#tads li.ads-ad');
  // console.log('tads', tads);
  for (var i=0; i<tads.length; i++) {
    extractGoogleAd(tads[i], 'top');
  }

  var rhs = document.querySelectorAll('#rhs_block li.ads-ad');
  // console.log('rhs_block', rhs);
  for (var i=0; i<rhs.length; i++) {
    extractGoogleAd(rhs[i], 'right');
  }
  return out;
}

window.onload = function() {
  // console.log('onload', window.parent == window, window.location.href);

  var docs = findFrames();

  for (var i=0; i<docs.length; i++) {
    var ads = findAds(docs[i]);
    data = data.concat(ads);
  }
  // if (window.parent != window) {
  //   if (data.length) {
  //     chrome.extension.sendMessage({ data: data });
  //   }
  // } else {
  //   console.log('ADS FOUND', JSON.stringify(data, false, 2));
  // }

  if (data.length) {
    chrome.extension.sendMessage({ data: data });
  }
  if (location.href.indexOf('://www.google.') > -1) {
    var ads = extractGoogleSearchAds();
    // data = data.concat(ads);
    if (ads.length) {
      console.log('GOOGLE SEARCH ADS', JSON.stringify(ads, false, 2));
      chrome.extension.sendMessage({ data: ads });
    }
  }
}

// console.log('hi from extension', window.parent == window, window.location.href);


// if (window.parent == window) {
//   chrome.extension.onMessage.addListener(function(msg) {
//     if (msg.data) {
//       data = data.concat(msg.data);
//       console.log('IFRAME AD FOUND', JSON.stringify(msg.data, false, 2));
//     }
//   });
// } else {
//   chrome.extension.onMessage.addListener(function(data) {});
// }

//location change polling for dynamic ads
setInterval(function(){
  if (orig_location != window.location.href) {
    console.log('Location changed:', window.location.href);
    orig_location = window.location.href;
    window.onload();
  }
}, 1000);
