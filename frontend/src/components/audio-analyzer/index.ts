class Analyzer {
  private audioContext: AudioContext;
  private audioBuffer: AudioBuffer | null;
  constructor() {
    this.audioContext = new AudioContext();
    this.audioBuffer = null;
  }

  setAudio(audioFile) {
    this.audioContext.decodeAudioData(audioFile).then((buffer: AudioBuffer) => {
      this.audioBuffer = buffer;
    });
  }
}

export default new Analyzer();
