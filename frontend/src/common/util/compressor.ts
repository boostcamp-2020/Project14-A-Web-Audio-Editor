export const saveFile = async (arrayBuffer: ArrayBuffer, quality: number, fileName: string) => {
  const audioCtx: AudioContext = new AudioContext();
  const buffer = await audioCtx.decodeAudioData(arrayBuffer);
  const offlineAudioCtx: OfflineAudioContext = new OfflineAudioContext({
    numberOfChannels: 2,
    length: (buffer.sampleRate * quality) * buffer.duration,
    sampleRate: buffer.sampleRate * quality,
  });
  const soundSource = offlineAudioCtx.createBufferSource();
  soundSource.buffer = buffer;
  const compressor = offlineAudioCtx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-20, offlineAudioCtx.currentTime);
  compressor.knee.setValueAtTime(30, offlineAudioCtx.currentTime);
  compressor.ratio.setValueAtTime(5, offlineAudioCtx.currentTime);
  compressor.attack.setValueAtTime(.05, offlineAudioCtx.currentTime);
  compressor.release.setValueAtTime(.25, offlineAudioCtx.currentTime);
  const gainNode = offlineAudioCtx.createGain();
  gainNode.gain.setValueAtTime(1, offlineAudioCtx.currentTime);
  soundSource.connect(compressor);
  compressor.connect(gainNode);
  gainNode.connect(offlineAudioCtx.destination);
  soundSource.start(0);
  soundSource.loop = false;
  const renderedBuffer = await offlineAudioCtx.startRendering();
  makeDownload(renderedBuffer, offlineAudioCtx.length, fileName);
}
const makeDownload = (abuffer: AudioBuffer, total_samples: number, fileName: string) => {
  const extention = fileName.split('.')[1];
  const newFile = URL.createObjectURL(bufferToWave(abuffer, total_samples, extention));
  const downloadLink: HTMLElement | null = document.getElementById("download-link");
  downloadLink?.setAttribute('href', newFile);
  downloadLink?.setAttribute('download', fileName);
}
const bufferToWave = (abuffer: AudioBuffer, len: number, extention: string) => {
  const numOfChan: number = abuffer.numberOfChannels;
  const length: number = len * numOfChan * 2 + 44;
  const buffer: ArrayBuffer = new ArrayBuffer(length);
  const view: DataView = new DataView(buffer);
  const channels: Float32Array[] = [];
  let sample: number = 0;
  let offset: number = 0;
  let pos: number = 0;
  const setUint16 = (data) => {
    view.setUint16(pos, data, true);
    pos += 2;
  }
  const setUint32 = (data) => {
    view.setUint32(pos, data, true);
    pos += 4;
  }
  setUint32(0x46464952);
  setUint32(length - 8);
  setUint32(0x45564157);
  setUint32(0x20746d66);
  setUint32(16);
  setUint16(1);
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  setUint16(numOfChan * 2);
  setUint16(16);
  setUint32(0x61746164);
  setUint32(length - pos - 4);
  for (let i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));
  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);
      pos += 2;
    }
    offset++
  }
  return new Blob([buffer], { type: `audio/${extention}` });
}
