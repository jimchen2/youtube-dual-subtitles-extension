// Initialize global variables
const onrd = [];
let cur_tab;
let playerResponse;
let captionTracks;
let translationLanguages;

// Helper functions
function show_refresh() {
  document.getElementById("div_refresh_tip").style.display = "";
  document.getElementById("div_page_title").style.color = "orange";
}

function get_subtitle_url() {
  const selector_sub_lang = document.getElementById("selector-sub-lang");
  const cbox_trans = document.getElementById("cbox_trans");
  const selector_trans_lang = document.getElementById("selector-trans-lang");

  let url = captionTracks[selector_sub_lang.value].baseUrl + "&fmt=vtt";

  if (cbox_trans.checked) {
    const trans_to_lang_code = translationLanguages[selector_trans_lang.value].languageCode;
    url += `&tlang=${trans_to_lang_code}`;
  }
  return url;
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

  // Handle subtitle language selector
  const selector_sub_lang = document.getElementById("selector-sub-lang");
  selector_sub_lang.innerHTML = "";
  captionTracks.forEach((c, i) => {
    const option = document.createElement("option");
    option.setAttribute("value", i);
    option.textContent = c.name.simpleText;
    selector_sub_lang.appendChild(option);

    chrome.storage.local.get("orig_sub_lang", (result) => {
      if (result.orig_sub_lang === c.vssId) {
        selector_sub_lang.value = i;
      }
    });
  });

  // Handle translation language selector
  const selector_trans_lang = document.getElementById("selector-trans-lang");
  translationLanguages.forEach((c, i) => {
    const option = document.createElement("option");
    option.setAttribute("value", i);
    option.textContent = c.languageName.simpleText;
    selector_trans_lang.appendChild(option);

    chrome.storage.local.get("tran_sub_lang", (result) => {
      if (result.tran_sub_lang === c.languageCode) {
        selector_trans_lang.value = i;
      }
    });
  });
}

// Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  for (let i = 0; i < onrd.length; ++i) {
    try {
      onrd[i]();
    } catch (err) {
      console.error(err);
    }
  }
});

// Initialize tab and inject script
onrd.push(() => {
  chrome.tabs.query(
    {
      currentWindow: true,
      active: true,
    },
    (tabs) => {
      cur_tab = tabs[0];

      chrome.tabs.executeScript(
        cur_tab.id,
        {
          code: `// window.tabid=${cur_tab.id};`,
          runAt: "document_start",
        },
        () => {
          chrome.tabs.executeScript(cur_tab.id, {
            file: "inject.js",
          });
        }
      );
    }
  );

  // Message listener
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (sender.tab.id === cur_tab.id) {
      try {
        playerResponse = JSON.parse(message["playerResponse_json"]);

        if (!playerResponse) {
          throw new Error("No player response");
        }

        document.getElementById("div_connecting_tip").style.display = "none";

        const ytplayer_videoid = playerResponse.videoDetails?.videoId;
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

// Button click handlers
onrd.push(() => {
  document.getElementById("btn_disp_sub").onclick = () => {
    chrome.tabs.sendMessage(cur_tab.id, {
      action: "display_sub",
      url: get_subtitle_url(),
      kill_left: true,
    });

    const selector_sub_lang = document.getElementById("selector-sub-lang");
    const cbox_trans = document.getElementById("cbox_trans");
    const selector_trans_lang = document.getElementById("selector-trans-lang");

    const orig_vssid = captionTracks[selector_sub_lang.value].vssId;
    chrome.storage.local.set({ orig_sub_lang: orig_vssid });

    if (cbox_trans.checked) {
      const tran_lang = translationLanguages[selector_trans_lang.value].languageCode;
      chrome.storage.local.set({ tran_sub_lang: tran_lang });
    }
  };
});

onrd.push(() => {
  document.getElementById("btn_rm_sub").onclick = () => {
    chrome.tabs.sendMessage(cur_tab.id, {
      action: "remove_subs",
    });
  };
});

onrd.push(() => {
  document.getElementById("btn_url").onclick = () => {
    const url = get_subtitle_url();
    navigator.clipboard.writeText(url);
  };
});

onrd.push(() => {
  const cbox_trans = document.getElementById("cbox_trans");
  const selector_trans_lang = document.getElementById("selector-trans-lang");
  cbox_trans.addEventListener("change", () => {
    if (cbox_trans.checked) {
      selector_trans_lang.removeAttribute("disabled");
    } else {
      selector_trans_lang.setAttribute("disabled", "true");
    }
  });
});
