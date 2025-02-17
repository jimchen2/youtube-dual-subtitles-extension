// Main script
if (!window.has_executed) {
  window.has_executed = true;
  initializeAndAddSubtitles();
}

var executed = 0;

async function initializeAndAddSubtitles() {
  // Wait for video to be ready
  await waitForVideo();

  // Get player data
  const playerData = await getPlayerData();
  if (!playerData || !playerData.captions) return;

  const captionTracks = playerData.captions.playerCaptionsTracklistRenderer.captionTracks;
  const translationLanguages = playerData.captions.playerCaptionsTracklistRenderer.translationLanguages;
  // Find Russian subtitle
  let russianTrack = null;

  for (let track of captionTracks) {
    if (track.vssId === ".ru") {
      russianTrack = track;
      break;
    }
  }

  for (let track of captionTracks) {
    if (track.vssId === "a.ru") {
      russianTrack = track;
      break;
    }
  }

  if (executed) {
    return;
  }
  
  executed = 1;

  if (russianTrack) {
    // Find English translation option
    let englishLangCode = null;
    for (let lang of translationLanguages) {
      if (lang.languageName.simpleText === "English") {
        englishLangCode = lang.languageCode;
        break;
      }
    }

    // Add English translation first if available
    if (englishLangCode) {
      await addSubtitleTrack(`${russianTrack.baseUrl}&fmt=vtt&tlang=${englishLangCode}`, "en");
    }

    // Then add Russian subtitles
    await addSubtitleTrack(russianTrack.baseUrl + "&fmt=vtt", "ru");
  }
}

async function waitForVideo() {
  return new Promise((resolve) => {
    const checkVideo = () => {
      const video = document.querySelector("video");
      if (video) {
        resolve(video);
      } else {
        setTimeout(checkVideo, 500);
      }
    };
    checkVideo();
  });
}

async function getPlayerData() {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.textContent = `
        document.body.setAttribute('data-player-response', 
          JSON.stringify(document.getElementsByTagName('ytd-app')[0].data.playerResponse)
        );
      `;
    document.body.appendChild(script);
    script.remove();

    const playerResponse = document.body.getAttribute("data-player-response");
    document.body.removeAttribute("data-player-response");

    resolve(JSON.parse(playerResponse));
  });
}

async function addSubtitleTrack(url, language) {
  const video = document.querySelector("video");
  if (!video) return;

  // Fetch and process subtitle data
  const response = await fetch(url);
  let subtitleData = await response.text();
  subtitleData = subtitleData.replaceAll("align:start position:0%", "");

  // Create and add new track
  const track = document.createElement("track");
  track.default = true;
  track.srclang = language;
  track.src = "data:text/vtt," + encodeURIComponent(subtitleData);

  video.appendChild(track);
  track.track.mode = "showing";
}

// Listen for page navigation
document.addEventListener("yt-navigate-finish", function () {
  // Remove existing subtitles
  const video = document.querySelector("video");
  if (video) {
    Array.from(video.getElementsByTagName("track")).forEach((track) => {
      track.track.mode = "hidden";
      track.remove();
    });
  }

  // Add subtitles for new video
  initializeAndAddSubtitles();
});
