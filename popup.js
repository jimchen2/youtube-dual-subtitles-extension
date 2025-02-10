async function getStor(key) {
  return new Promise((resolve) => {
      if (!key)
          chrome.storage.local.get(null, resolve);
      else
          chrome.storage.local.get([key], (result) => resolve(result[key]));
  });
}

async function setStor(key, val) {
  return new Promise((resolve) => {
      var obj = {};
      obj[key] = val;
      chrome.storage.local.set(obj, resolve);
  });
}


var onrd = new Array();
document.addEventListener("DOMContentLoaded", (event) => {
  for (var i = 0; i < onrd.length; ++i) {
    try {
      onrd[i]();
    } catch (err) {
      console.error(err);
    }
  }
});

var cur_tab;
var playerResponse;
var captionTracks;
var translationLanguages;

onrd.push(function () {
  chrome.tabs.query({
    currentWindow: true,
    active: true,
  }, function(tabs) {
    cur_tab = tabs[0];

    chrome.tabs.executeScript(cur_tab.id, {
      code: `// window.tabid=${cur_tab.id};`,
      runAt: "document_start"
    }, function() {
      chrome.tabs.executeScript(cur_tab.id, {
        file: "inject.js"
      });
    });
  });

  chrome.runtime.onMessage.addListener(function (message, sender) {
    if (sender.tab.id == cur_tab.id) {
      try {
        playerResponse = JSON.parse(message["playerResponse_json"]);

        if (!playerResponse) {
          throw new Error("No player response");
        }

        document.getElementById("div_connecting_tip").style.display = "none";

        var ytplayer_videoid = playerResponse.videoDetails?.videoId;
        if (!ytplayer_videoid || !cur_tab.url.includes(ytplayer_videoid)) {
          throw new Error("Invalid video ID");
        }

        parse_ytplayer();
      } catch (err) {
        console.error("Error processing player response:", err);
        show_refresh();
      }
    }
  });
});

function show_refresh() {
  document.getElementById("div_refresh_tip").style.display = "";
  document.getElementById("div_page_title").style.color = "orange";
}

function parse_ytplayer() {
  if (playerResponse.captions) {
    captionTracks = playerResponse.captions.playerCaptionsTracklistRenderer.captionTracks;
    translationLanguages = playerResponse.captions.playerCaptionsTracklistRenderer.translationLanguages;
  } else {
    captionTracks = [];
    translationLanguages = [];
  }

  document.getElementById("div_page_title").textContent = playerResponse.videoDetails.title;

  const selector_sub_lang = document.getElementById("selector-sub-lang");
  selector_sub_lang.innerHTML = "";
  captionTracks.forEach(function (c, i) {
    var option = document.createElement("option");
    option.setAttribute("value", i);
    var text = c.name.simpleText;
    option.textContent = text;
    selector_sub_lang.appendChild(option);

    chrome.storage.local.get("orig_sub_lang", function(result) {
      if (result.orig_sub_lang == c.vssId) {
        selector_sub_lang.value = i;
      }
    });
  });

  const selector_trans_lang = document.getElementById("selector-trans-lang");
  translationLanguages.forEach(function (c, i) {
    var option = document.createElement("option");
    option.setAttribute("value", i);
    var text = c.languageName.simpleText;
    option.textContent = text;
    selector_trans_lang.appendChild(option);

    chrome.storage.local.get("tran_sub_lang", function(result) {
      if (result.tran_sub_lang == c.languageCode) {
        selector_trans_lang.value = i;
      }
    });
  });
}

onrd.push(function () {
  document.getElementById("btn_disp_sub").onclick = function () {
    chrome.tabs.sendMessage(cur_tab.id, {
      action: "display_sub",
      url: get_subtitle_url(),
      kill_left: true,
    });

    const selector_sub_lang = document.getElementById("selector-sub-lang");
    const cbox_trans = document.getElementById("cbox_trans");
    const selector_trans_lang = document.getElementById("selector-trans-lang");

    var orig_vssid = captionTracks[selector_sub_lang.value].vssId;
    chrome.storage.local.set({ "orig_sub_lang": orig_vssid });

    if (cbox_trans.checked) {
      var tran_lang = translationLanguages[selector_trans_lang.value].languageCode;
      chrome.storage.local.set({ "tran_sub_lang": tran_lang });
    }
  };
});

onrd.push(function () {
  document.getElementById("btn_rm_sub").onclick = function () {
    chrome.tabs.sendMessage(cur_tab.id, {
      action: "remove_subs",
    });
  };
});

onrd.push(function () {
  document.getElementById("btn_url").onclick = function () {
    var url = get_subtitle_url();
    navigator.clipboard.writeText(url);
  };
});

onrd.push(function () {
  const cbox_trans = document.getElementById("cbox_trans");
  const selector_trans_lang = document.getElementById("selector-trans-lang");
  cbox_trans.addEventListener("change", function () {
    if (cbox_trans.checked) selector_trans_lang.removeAttribute("disabled");
    else selector_trans_lang.setAttribute("disabled", "true");
  });
});

function get_subtitle_url() {
  const selector_sub_lang = document.getElementById("selector-sub-lang");
  const cbox_trans = document.getElementById("cbox_trans");
  const selector_trans_lang = document.getElementById("selector-trans-lang");

  var url = captionTracks[selector_sub_lang.value].baseUrl + "&fmt=vtt";

  if (cbox_trans.checked) {
    var trans_to_lang_code = translationLanguages[selector_trans_lang.value].languageCode;
    url += `&tlang=${trans_to_lang_code}`;
  }
  return url;
}
