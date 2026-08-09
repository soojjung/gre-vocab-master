// 현재 재생 중인 오디오
let currentAudio: HTMLAudioElement | null = null;

// 네이버 인앱 등 일부 WebView에는 Web Speech API 자체가 없음
const hasSpeechSynthesis =
  typeof window !== "undefined" && "speechSynthesis" in window;

/**
 * 영어 발음 재생 함수 (Google Cloud TTS via Vercel API)
 * 오류 시 Web Speech API로 폴백
 */
export function speakWord(word: string) {
  // 이전 발음 중지
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (hasSpeechSynthesis) {
    speechSynthesis.cancel();
  }

  const audio = new Audio(`/api/tts?text=${encodeURIComponent(word)}`);
  currentAudio = audio;

  audio.play().catch(() => {
    // 오류 시 Web Speech API로 폴백 (미지원 환경에선 조용히 스킵)
    if (!hasSpeechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  });
}

/**
 * 현재 재생 중인 오디오 중지
 */
export function stopSpeaking() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  if (hasSpeechSynthesis) {
    speechSynthesis.cancel();
  }
}
