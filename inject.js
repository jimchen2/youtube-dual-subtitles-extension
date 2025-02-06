send_ytplayer();
if (!window.has_executed) {
  first_run();

  window.has_executed = true;
}

function first_run() {
  chrome.runtime.onMessage.addListener(async function (message, sender) {
    //console.log(message, sender);
    if (message.action == "display_sub") {
      var url = message.url;

      var video = document.getElementsByTagName("video")[0];
      subt = document.createElement("track");

      subt.default = true;

      if (!message.kill_left) subt.src = url;
      else {
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
      remove_subs();
    }
  });

  document.addEventListener("yt-navigate-finish", function () {
    remove_subs();
  });
}
function remove_subs() {
  var video = document.getElementsByTagName("video")[0];
  Array.from(video.getElementsByTagName("track")).forEach(function (ele) {
    ele.track.mode = "hidden";
    ele.parentNode.removeChild(ele);
  });
}
async function send_ytplayer() {
  //console.log(document.title);
  try {
    get_ytplayer_to_body();

    const playerResponse_json = document.body.getAttribute("data-playerResponse");
    //console.log( playerResponse_json );

    chrome.runtime.sendMessage({
      //tabid: window.tabid,
      title: document.title,
      href: window.location.href,
      playerResponse_json: playerResponse_json,
    });
  } catch (err) {}

  remove_page_change();
}

var script_tag;
function get_ytplayer_to_body() {
  var scriptContent = `
        document.body.setAttribute("data-playerResponse", JSON.stringify( document.getElementsByTagName("ytd-app")[0].data.playerResponse ));
    `;
  script_tag = document.createElement("script");
  script_tag.appendChild(document.createTextNode(scriptContent));

  (document.body || document.head || document.documentElement).appendChild(script_tag);
}
function remove_page_change() {
  var scriptContent = `
        document.body.removeAttribute("data-playerResponse");
    `;

  script_tag = script_tag || document.createElement("script");

  script_tag.innerHTML = "";
  script_tag.appendChild(document.createTextNode(scriptContent));

  script_tag.parentNode.removeChild(script_tag);
}
