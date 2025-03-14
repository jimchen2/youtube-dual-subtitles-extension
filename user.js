// ==UserScript==
// @name         YouTube Dual Subtitles for French, German, Russian, Ukrainian
// @namespace    http://tampermonkey.net/
// @version      1.3
// @license      Unlicense
// @description  Add dual subtitles to YouTube videos
// @author       Jim Chen
// @homepage     https://jimchen.me
// @match        https://www.youtube.com/*
// @match        https://m.youtube.com/*
// @run-at       document-idle
// ==/UserScript==
(function () {
  "use strict";
  let lastUrl = location.href;
  let processingSubtitles = false;
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      handleVideoNavigation();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
  handleVideoNavigation();
  async function handleVideoNavigation() {
    removeSubs();

    if (processingSubtitles == true) return;
    processingSubtitles = true;
    let subtitleURL = await extractSubtitleUrl();
    processingSubtitles = false;

    if (subtitleURL == null) return;
    await addOneSubtitle(subtitleURL + "&tlang=en");
    await addOneSubtitle(subtitleURL);
  }
  async function extractSubtitleUrl() {
    function extractYouTubeVideoID() {
      const url = window.location.href;
      const patterns = {
        standard: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/watch\?v=([^&]+)/,
        embed: /(?:https?:\/\/)?(?:www\.)?youtube\.com\/embed\/([^?]+)/,
        mobile: /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([^?]+)/,
      };

      let videoID = null;

      if (patterns.standard.test(url)) {
        videoID = url.match(patterns.standard)[1];
      } else if (patterns.embed.test(url)) {
        videoID = url.match(patterns.embed)[1];
      } else if (patterns.mobile.test(url)) {
        videoID = url.match(patterns.mobile)[1];
      }

      return videoID;
    }
    let videoID = extractYouTubeVideoID();
    if (videoID == null) return;
    const playerData = await new Promise((resolve) => {
      const checkForPlayer = () => {
        let ytAppData = document.querySelector("#movie_player");
        let captionData = ytAppData?.getPlayerResponse()?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
        if (captionData) {
          const fetchedBaseUrl = captionData[0].baseUrl;
          const fetchedVideoID = fetchedBaseUrl.match(/[?&]v=([^&]+)/)?.[1];
          if (fetchedVideoID !== videoID) setTimeout(checkForPlayer, 1000);
          else resolve(captionData);
        } else setTimeout(checkForPlayer, 1000);
      };
      checkForPlayer();
    });

    if (!playerData) return;
    const hasForeignTrack = playerData.some(({ vssId }) => /(ru|uk|de|fr)/.test(vssId));
    if (hasForeignTrack) {
      const autoGeneratedTrack = playerData.find((track) => ["a.ru", "a.uk", "a.de", "a.fr"].includes(track.vssId));
      const manualTrack = playerData.find((track) => ["ru", "uk", "de", "fr"].some((code) => track.vssId.includes(code)));
      const otherTrack = autoGeneratedTrack || manualTrack;
      if (!otherTrack) return;
      return `${otherTrack.baseUrl}&fmt=vtt`;
    }
  }

  async function addOneSubtitle(url, maxRetries = 5, delay = 1000) {
    const video = document.querySelector("video");
    try {
      const response = await fetch(url);
      const subtitleData = (await response.text()).replaceAll("align:start position:0%", "");
      const track = document.createElement("track");
      track.src = "data:text/vtt," + encodeURIComponent(subtitleData);
      await new Promise((resolve) => setTimeout(resolve, delay));
      video.appendChild(track);
      track.track.mode = "showing";
    } catch (error) {
      if (maxRetries > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        return addOneSubtitle(url, maxRetries - 1, delay);
      }
    }
  }
  function removeSubs() {
    const video = document.getElementsByTagName("video")[0];
    if (!video) return;
    const tracks = video.getElementsByTagName("track");
    Array.from(tracks).forEach(function (ele) {
      ele.track.mode = "hidden";
      ele.parentNode.removeChild(ele);
    });
  }
})();
