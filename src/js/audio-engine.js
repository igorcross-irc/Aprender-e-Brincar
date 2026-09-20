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
        // Fallback automático caso o ficheiro mp3 não exista
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