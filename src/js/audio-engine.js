export class AudioEngine {
  constructor() {
    this.basePath = '/assets/audio/';
    this.speech = window.speechSynthesis;
  }

  async play(audioFileName, fallbackText) {
    if (audioFileName) {
      try {
        const audio = new Audio(`${this.basePath}${audioFileName}`);
        await audio.play();
        return;
      } catch (err) {
        console.warn(`Áudio ${audioFileName} não encontrado. Usando fallback por voz.`);
      }
    }

    if (fallbackText && this.speech) {
      this.speech.cancel();
      const utterance = new SpeechSynthesisUtterance(fallbackText);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.9;
      this.speech.speak(utterance);
    }
  }
}