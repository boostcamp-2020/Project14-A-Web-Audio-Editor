import { CompressorOption } from '@types';
import * as lamejs from 'lamejs';

export const saveFile = async (arrayBuffer: ArrayBuffer, options: CompressorOption) => {
  const audioCtx: AudioContext = new AudioContext();
  const buffer = await audioCtx.decodeAudioData(arrayBuffer);
  const name = `${options.fileName}.${options.extention}`;

  const wavBuffer = await makeWaveBlob(buffer);

  if (options.extention === 'wav') {
    const wavFile = new Blob([wavBuffer], { type: `audio/wav` });
    makeDownload(wavFile, name);
  } else if (options.extention === 'mp3' && options.quality) {
    const mp3Blob = await makeMP3(wavBuffer, options.quality);
    makeDownload(mp3Blob, name);
  }
}

const makeWaveBlob = async (buffer: AudioBuffer) => {
  const offlineAudioCtx: OfflineAudioContext = new OfflineAudioContext({
    numberOfChannels: 2,
    length: (44100) * buffer.duration,
    sampleRate: 44100,
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
  return bufferToWave(renderedBuffer, offlineAudioCtx.length);
}

const bufferToWave = (abuffer: AudioBuffer, len: number) => {
  const numOfChan: number = abuffer.numberOfChannels;
  const length: number = len * numOfChan * 2 + 44;
  const buffer: ArrayBuffer = new ArrayBuffer(length);
  const view: DataView = new DataView(buffer);     // buffer를 다룰 때 사용
  const channels: Float32Array[] = [];
  let sample: number = 0;
  let offset: number = 0;
  let pos: number = 0;

  // 부호없는 16비트로 정수로 변환
  const setUint16 = (data) => {
    view.setUint16(pos, data, true);
    pos += 2;
  }

  // 부호없는 32비트로 정수로 변환
  const setUint32 = (data) => {
    view.setUint32(pos, data, true);
    pos += 4;
  }

  // wav 파일의 헤더구조
  setUint32(0x46464952);                              // "RIFF"
  setUint32(length - 8);                              // file length - 8
  setUint32(0x45564157);                              // "WAVE"

  setUint32(0x20746d66);                              // "fmt " chunk
  setUint32(16);                                      // length = 16
  setUint16(1);                                       // PCM (uncompressed)
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  setUint32(abuffer.sampleRate * 2 * numOfChan);      // avg. bytes/sec
  setUint16(numOfChan * 2);                           // block-align
  setUint16(16);                                      // 16-bit (hardcoded in this demo)

  setUint32(0x61746164);                              // "data" - chunk
  setUint32(length - pos - 4);                        // chunk length

  for (let i = 0; i < abuffer.numberOfChannels; i++)
    channels.push(abuffer.getChannelData(i));

  while (pos < length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][offset]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      view.setInt16(pos, sample, true);               // 부호있는 16비트 정수로 변환
      pos += 2;
    }
    offset++
  }

  return buffer;
}

const makeMP3 = async (wavBuffer: ArrayBuffer, quality: number) => {
  const mp3Data: Int8Array[] = [];

  const mp3encoder = new lamejs.Mp3Encoder(2, 44100, quality);

  const wavHdr = lamejs.WavHeader.readHeader(new DataView(wavBuffer));
  const wavSamples = new Int16Array(wavBuffer, wavHdr.dataOffset, wavHdr.dataLen / 2);

  //Stereo
  const leftData: number[] = [];
  const rightData: number[] = [];
  for (let i = 0; i < wavSamples.length; i += 2) {
    leftData.push(wavSamples[i]);
    rightData.push(wavSamples[i + 1]);
  }
  const mp3buf = mp3encoder?.encodeBuffer(leftData, rightData);
  if (mp3buf.length > 0) {
    mp3Data.push(mp3buf);//new Int8Array(mp3buf));
  }
  const d = mp3encoder?.flush();

  if (d.length > 0) {
    mp3Data.push(new Int8Array(d));
  }

  return new Blob(mp3Data, { type: 'audio/mp3' });
}

const makeDownload = (newFile: Blob, fileName: string) => {
  const audioFile = URL.createObjectURL(newFile);
  const downloadLink: HTMLElement | null = document.getElementById("download-link");

  downloadLink?.setAttribute('href', audioFile);
  downloadLink?.setAttribute('download', fileName);
}