## YouTube Dual Subtitles

A script to display dual subtitles on YouTube with sliding effect, utilizing VTT

[Userscript (native language: English)](https://update.greasyfork.org/scripts/528708/YouTube%20Dual%20Subtitles%20for%20French%2C%20German%2C%20Russian%2C%20Ukrainian.user.js)

![image](https://github.com/user-attachments/assets/859a8f94-ea0e-481b-bc92-08fabc7b94a8)

![image](https://github.com/user-attachments/assets/a836ae2e-d4ae-4b5d-91d7-20a3e24aaedc)

![image](https://github.com/user-attachments/assets/b9a299ba-e052-41e6-b9ef-e4fff9144784)

![image](https://github.com/user-attachments/assets/f1854223-396f-454b-ae54-6f3bb7473a78)

Use `document.querySelector("#movie_player").getPlayerResponse()?.captions?.playerCaptionsTracklistRenderer?.captionTracks`

### Example YouTube Subtitles URLs: (expired)

**Russian (Original):**

```
https://www.youtube.com/api/timedtext?v=6ytmu8BN8iI&ei=lEm0Z9ODOMKMvcAPmZukmQc&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1739893764&sparams=ip,ipbits,expire,v,ei,caps,opi,xoaf&signature=66237522F7C96BE2CAB01C096EF4D94C40D108CA.73DCA9268447F4BE6E796256D9CA6EEA1A893D30&key=yt8&kind=asr&lang=ru&fmt=vtt
```

**English (Translated):**

```
https://www.youtube.com/api/timedtext?v=6ytmu8BN8iI&ei=lEm0Z9ODOMKMvcAPmZukmQc&caps=asr&opi=112496729&xoaf=5&hl=en&ip=0.0.0.0&ipbits=0&expire=1739893764&sparams=ip,ipbits,expire,v,ei,caps,opi,xoaf&signature=66237522F7C96BE2CAB01C096EF4D94C40D108CA.73DCA9268447F4BE6E796256D9CA6EEA1A893D30&key=yt8&kind=asr&lang=ru&fmt=vtt&tlang=en
```

### Sample VTT Format:

```vtt
Сигма<00:00:02.320><c> Сигма</c><00:00:02.840><c> бой</c><00:00:03.240><c> Сигма</c><00:00:03.800><c> бой</c><00:00:04.200><c> Сигма</c><00:00:04.759><c> бой</c>

00:00:05.710 --> 00:00:05.720 align:start position:0%
Сигма Сигма бой Сигма бой Сигма бой


00:00:05.720 --> 00:00:09.470 align:start position:0%
Сигма Сигма бой Сигма бой Сигма бой
каждая<00:00:06.399><c> Девчонка</c><00:00:07.080><c> хочет</c><00:00:07.560><c> танцевать</c><00:00:08.280><c> с</c><00:00:08.480><c> тобой</c>

00:00:09.470 --> 00:00:09.480 align:start position:0%
каждая Девчонка хочет танцевать с тобой


00:00:09.480 --> 00:00:13.629 align:start position:0%
каждая Девчонка хочет танцевать с тобой
Сигма<00:00:10.000><c> Сигма</c><00:00:10.480><c> бой</c><00:00:10.920><c> Сигма</c><00:00:11.440><c> бой</c><00:00:11.880><c> Сигма</c><00:00:12.400><c> бой</c><00:00:13.360><c> я</c>

00:00:13.629 --> 00:00:13.639 align:start position:0%
Сигма Сигма бой Сигма бой Сигма бой я


00:00:13.639 --> 00:00:17.109 align:start position:0%
Сигма Сигма бой Сигма бой Сигма бой я
такая<00:00:14.200><c> всё</c><00:00:14.519><c> Что</c><00:00:14.799><c> добиваться</c><00:00:15.599><c> будешь</c><00:00:16.320><c> год</c>

00:00:17.109 --> 00:00:17.119 align:start position:0%
такая всё Что добиваться будешь год
```
