
function extractBanner(el) {
  var img = el.querySelector('img');
  if (!img) return false;
  return { img: img.src, url: el.href, origin: origin };
}

var ads = {
  '#adDiv a': extractBanner,
  '.adroll-block a': extractBanner,
  '#google_image_div a': extractBanner,
  'body[bgcolor=White] a[target=_blank]': extractBanner,
  '#google_image_div a': extractBanner,
  '.bsap a': extractBanner
};

var orig_location = window.location.hef;
var isTop = window.parent == window;

var parent = window
var origin = location.href;

while(parent != window.parent) {
  origin = parent.location.href;
  parent = window.parent;
}

console.log('ORIGIN', origin);


function findFrames() {
  // find all iframes
  var ifrs = document.getElementsByTagName('iframe');
  var docs = [ document ];
  for (var i=0; i<ifrs.length; i++) {
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
      var title = anc.textContent;
      var url = anc.href;
      var visit_url = ad.querySelector('.ads-visurl cite').textContent;
      var text = ad.querySelector('.ads-creative').textContent;
    } catch(e) {
      console.log('ERROR', e);
      console.log(ad.innerHTML);
    }

    if (url && text) {
      out.push({ url: url, visit_url: visit_url, title: title, text: text, location: location, origin: 'google-search' });
    }
  };
  var tads = document.querySelectorAll('#tads li.ads-ad');
  // console.log('tads', tads.length);
  for (var i=0; i<tads.length; i++) {
    extractGoogleAd(tads[i], 'top');
  }

  var rhs = document.querySelectorAll('#rhs_block li.ads-ad');
  // console.log('rhs_block', rhs.length);
  for (var i=0; i<rhs.length; i++) {
    extractGoogleAd(rhs[i], 'right');
  }
  return out;
}

var onload = function() {
  console.log('onload', isTop, window.location.href);

  // apparently current version of firefox gives access to all frames
  // NB: check if changed in latest versions
  // var docs = findFrames();

  // var out = [];
  // for (var i=0; i<docs.length; i++) {
  //   var ads = findAds(docs[i]);
  //   out = out.concat(ads);
  // }

  var out = findAds(document);

  if (out.length) {
    self.port.emit("ads", out);
    // console.log('ADS FOUND', JSON.stringify(out, false, 2));
  }

  if (location.href.indexOf('://www.google.') > -1) {
    var ads = extractGoogleSearchAds();
    // console.log('GOOGLE ADS', ads.length);
    // out = out.concat(ads);
    if (ads.length) {
      // console.log('GOOGLE SEARCH ADS', JSON.stringify(ads, false, 2));
      self.port.emit("ads", ads);
    }
  }
}

//location change polling for dynamic ads
setInterval(function(){
  if (orig_location != window.location.href) {
    console.log('Location changed:', window.location.href);
    orig_location = window.location.href;
    onload();
  }
}, 1000);

onload();