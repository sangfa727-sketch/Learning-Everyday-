import { TextToSpeech } from "@capacitor-community/text-to-speech";

// The browser SpeechSynthesis API is unreliable or incomplete in some Android
// WebViews. Keep the existing app API, but route native Android speech through
// Android's TextToSpeech engine. The web/PWA version remains unchanged.
const capacitor = window.Capacitor;
if (capacitor?.isNativePlatform?.() && capacitor.getPlatform?.() === "android") {
  let voices = [];
  let playbackToken = 0;
  let speech = window.speechSynthesis;

  if (!speech) {
    speech = new EventTarget();
    speech.speaking = false;
    speech.pending = false;
    speech.paused = false;
    speech.cancel = () => {};
    speech.speak = () => {};
    speech.getVoices = () => [];
    try {
      Object.defineProperty(window, "speechSynthesis", { configurable: true, value: speech });
    } catch {}
  }

  if (typeof window.SpeechSynthesisUtterance !== "function") {
    window.SpeechSynthesisUtterance = class SpeechSynthesisUtterance {
      constructor(text = "") {
        this.text = String(text);
        this.lang = "";
        this.rate = 1;
        this.pitch = 1;
        this.volume = 1;
        this.voice = null;
        this.onstart = null;
        this.onend = null;
        this.onerror = null;
        this.onpause = null;
        this.onresume = null;
        this.onboundary = null;
      }
    };
  }

  const dispatchVoicesChanged = () => {
    try { speech.dispatchEvent(new Event("voiceschanged")); } catch {}
  };

  speech.getVoices = () => voices.slice();
  speech.cancel = () => {
    playbackToken += 1;
    speech.speaking = false;
    void TextToSpeech.stop().catch(() => {});
  };
  speech.speak = (utterance) => {
    const token = ++playbackToken;
    speech.speaking = true;
    speech.pending = false;
    Promise.resolve().then(async () => {
      const options = {
        text: String(utterance?.text ?? ""),
        lang: /^en([_-]|$)/i.test(utterance?.lang || "") ? utterance.lang.replace("_", "-") : "en-US",
        rate: Math.min(2, Math.max(0.1, Number(utterance?.rate) || 1)),
        pitch: Math.min(2, Math.max(0, Number(utterance?.pitch) || 1)),
        volume: Math.min(1, Math.max(0, Number(utterance?.volume ?? 1)))
      };
      if (utterance?.voice) {
        const voiceIndex = voices.findIndex((voice) =>
          voice.voiceURI === utterance.voice.voiceURI || voice.name === utterance.voice.name
        );
        if (voiceIndex >= 0) options.voice = voiceIndex;
      }
      if (token !== playbackToken) return;
      utterance?.onstart?.(new Event("start"));
      await TextToSpeech.speak(options);
      if (token !== playbackToken) return;
      speech.speaking = false;
      utterance?.onend?.(new Event("end"));
    }).catch((error) => {
      if (token !== playbackToken) return;
      speech.speaking = false;
      utterance?.onerror?.({ error: "synthesis-failed", message: String(error?.message || error) });
    });
  };

  void TextToSpeech.getSupportedVoices()
    .then((result) => {
      voices = (result?.voices || []).filter((voice) => /^en([_-]|$)/i.test(voice.lang || ""));
      dispatchVoicesChanged();
    })
    .catch(() => {
      voices = [];
      dispatchVoicesChanged();
    });
}
