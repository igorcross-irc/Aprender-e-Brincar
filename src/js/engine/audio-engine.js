export class ResilientAudioEngine {
  constructor() {
    this.isMuted = this.getSafeMuteState();
    this.speech = window.speechSynthesis;
    this.audioCache = new Map();
  }

  getSafeMuteState() {
    try {
      return localStorage.getItem('ab_muted') === 'true';
    } catch (e) {
      return false;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('ab_muted', this.isMuted.toString());
    } catch (e) {}
    if (this.isMuted && this.speech) this.speech.cancel();
    return this.isMuted;
  }

  async play(audioPath, fallbackText) {
    if (this.isMuted) return;

    if (fallbackText && this.speech) {
      try {
        this.speech.cancel();
        const utterance = new SpeechSynthesisUtterance(fallbackText);
        utterance.lang = 'pt-BR';
        utterance.rate = 0.85;
        utterance.pitch = 1.1;
        this.speech.speak(utterance);
      } catch (e) {
        console.warn('Erro na síntese de voz:', e);
      }
    }
  }
}