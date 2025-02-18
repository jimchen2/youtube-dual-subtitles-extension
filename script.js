// ==UserScript==
// @name         YouTube Dual Subtitles for French, German, Russian, Ukrainian
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Add dual subtitles to YouTube videos
// @author       Jim Chen
// @homepage     https://jimchen.me
// @supportURL   https://github.com/jimchen2/youtube-dual-subtitles/issues
// @match        https://www.youtube.com/*
// @match        https://cdn.jimchen.me/*
// @run-at       document-idle
// ==/UserScript==

(() => {
  "use strict";

  const getPlayerData = () =>
    new Promise((resolve) => {
      const check = () => {
        const player = document.querySelector("#movie_player");
        player && window.ytInitialPlayerResponse ? resolve(window.ytInitialPlayerResponse) : setTimeout(check, 500);
      };
      check();
    });

  const addSubtitle = async (url, lang) => {
    const video = document.querySelector("video");
    const subtitleData = (await (await fetch(url)).text()).replaceAll("align:start position:0%", "");
    const track = Object.assign(document.createElement("track"), {
      default: true,
      src: `data:text/vtt,${encodeURIComponent(subtitleData)}`,
    });
    video.appendChild(track);
    track.track.mode = "showing";
  };

  const processSubtitles = async () => {
    const playerData = await getPlayerData();
    const captions = playerData?.captions?.playerCaptionsTracklistRenderer;
    if (!captions?.captionTracks || !captions?.translationLanguages) return;

    const learningTrack = captions.captionTracks.find((track) => ["a.ru", "a.uk", "a.de", "a.fr"].includes(track.vssId) || [".ru", ".uk", ".de", ".fr"].includes(track.vssId));
    if (!learningTrack) return;

    const englishLang = captions.translationLanguages.find((lang) => lang.languageName.simpleText === "English");

    if (englishLang) {
      await addSubtitle(`${learningTrack.baseUrl}&fmt=vtt&tlang=${englishLang.languageCode}`, "en");
    }
    await addSubtitle(`${learningTrack.baseUrl}&fmt=vtt`, learningTrack.vssId.replace(/[.a]/g, ""));
  };

  const handleVideoNavigation = async () => {
    const video = document.querySelector("video");
    if (video) {
      Array.from(video.getElementsByTagName("track")).forEach((track) => track.remove());
    }
    await processSubtitles();
  };

  // Observer setup
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(handleVideoNavigation, 1000);
    }
  }).observe(document.body, { childList: true, subtree: true });

  setTimeout(handleVideoNavigation, 1000);
})();
