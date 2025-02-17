// Main script initialization
if (!window.has_executed) {
  initializeMessageHandlers();
  window.has_executed = true;
}
sendYouTubePlayerData();

// Core message handling and initialization
function initializeMessageHandlers() {
  chrome.runtime.onMessage.addListener(async function (message, sender) {
    if (message.action == "display_sub") {
      var url = message.url;
      var video = document.getElementsByTagName("video")[0];
      subt = document.createElement("track");
      subt.default = true;

      if (!message.kill_left) {
        subt.src = url;
      } else {
        var sub_data;
        await fetch(url)
          .then((response) => response.text())
          .then((textString) => {
            sub_data = textString;
          });
        sub_data = sub_data.replaceAll("align:start position:0%", "");
        subt.src = "data:text/vtt," + encodeURIComponent(sub_data, true);
      }
      video.appendChild(subt);
      subt.track.mode = "showing";
    } else if (message.action == "remove_subs") {
      removeSubtitles();
    }
  });

  document.addEventListener("yt-navigate-finish", function () {
    removeSubtitles();
  });
}

// YouTube player related functions
async function sendYouTubePlayerData() {
  try {
    injectPlayerDataScript();
    const playerResponse_json = document.body.getAttribute("data-playerResponse");
    chrome.runtime.sendMessage({
      title: document.title,
      href: window.location.href,
      playerResponse_json: playerResponse_json,
    });
  } catch (err) {}
  cleanupPlayerDataScript();
}

var scriptElement;

function injectPlayerDataScript() {
  var scriptContent = `
      document.body.setAttribute("data-playerResponse", 
          JSON.stringify(document.getElementsByTagName("ytd-app")[0].data.playerResponse)
      );
  `;
  scriptElement = document.createElement("script");
  scriptElement.appendChild(document.createTextNode(scriptContent));
  (document.body || document.head || document.documentElement).appendChild(scriptElement);
}

function cleanupPlayerDataScript() {
  var scriptContent = `
      document.body.removeAttribute("data-playerResponse");
  `;
  scriptElement = scriptElement || document.createElement("script");
  scriptElement.innerHTML = "";
  scriptElement.appendChild(document.createTextNode(scriptContent));
  scriptElement.parentNode.removeChild(scriptElement);
}

// Subtitle handling functions
function removeSubtitles() {
  var video = document.getElementsByTagName("video")[0];
  Array.from(video.getElementsByTagName("track")).forEach(function (ele) {
    ele.track.mode = "hidden";
    ele.parentNode.removeChild(ele);
  });
}
