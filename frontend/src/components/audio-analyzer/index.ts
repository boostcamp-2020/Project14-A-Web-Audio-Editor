class Analyzer {
  private audioContext: AudioContext;
  private audioFileName: string;
  private audioBuffer: AudioBuffer | null;
  constructor() {
    this.audioContext = new AudioContext();
    this.audioFileName = '';
    this.audioBuffer = null;
  }

  getAudio() {
    return { audioBuffer: this.audioBuffer, audioFileName: this.audioFileName };
  }

  setAudio(audioFile: ArrayBuffer, fileName: string) {
    this.audioContext.decodeAudioData(audioFile).then((buffer: AudioBuffer) => {
      this.audioBuffer = buffer;
    });
    this.audioFileName = fileName;
  }
}

export default new Analyzer();
