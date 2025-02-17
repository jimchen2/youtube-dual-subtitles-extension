const onrd = [];
let cur_tab;
let playerResponse;
let captionTracks;
let translationLanguages;

// Function to construct subtitle url
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

  const selector_sub_lang = document.getElementById("selector-sub-lang");
  selector_sub_lang.innerHTML = "";

  // Loop through the original subtitle languages and find Russian(auto-generated) if applicable
  let aRuFound = false;

  for (let i = 0; i < captionTracks.length; i++) {
    const c = captionTracks[i];
    const option = document.createElement("option");
    option.setAttribute("value", i);
    option.textContent = c.name.simpleText;
    selector_sub_lang.appendChild(option);

    if (c.vssId === "a.ru") {
      selector_sub_lang.value = i;
      aRuFound = true;
      break;
    } else if (c.vssId === "ru" && !aRuFound) {
      selector_sub_lang.value = i;
    }
  }

  // Add the other original languages as well in the box
  const selector_trans_lang = document.getElementById("selector-trans-lang");
  translationLanguages.forEach((c, i) => {
    const option = document.createElement("option");
    option.setAttribute("value", i);
    option.textContent = c.languageName.simpleText;
    selector_trans_lang.appendChild(option);
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
  chrome.runtime.onMessage.addListener((message, sender) => {
    if (sender.tab.id === cur_tab.id) {
      playerResponse = JSON.parse(message["playerResponse_json"]);
      parse_ytplayer();
    }
  });
});

// Sending action to add subtitle
onrd.push(() => {
  document.getElementById("btn_disp_sub").onclick = () => {
    chrome.tabs.sendMessage(cur_tab.id, {
      action: "display_sub",
      url: get_subtitle_url(),
    });
  };
});

// Sending action to remove subtitle
onrd.push(() => {
  document.getElementById("btn_rm_sub").onclick = () => {
    chrome.tabs.sendMessage(cur_tab.id, {
      action: "remove_subs",
    });
  };
});

// In the popup this functions enables selection of different translations of subtitles
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
