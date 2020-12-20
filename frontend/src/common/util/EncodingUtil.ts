import { Controller } from '@controllers';
import { CompressorOption } from '@types';
import { EffectUtil } from '@util';
import * as lamejs from 'lamejs';

const sampleRate = 48000;
const numberOfChannels = 2;

export const encodingAudio = async (options: CompressorOption) => {
  const arrayBufferList: ArrayBuffer[] = [];
  const trackList = Controller.getTrackList();

  for (let i = 0; i < trackList.length; i++) {
    const trackArrayBuffer = await getTrackArrayBuffer(trackList[i].id);

    if (trackArrayBuffer) {
      arrayBufferList.push(trackArrayBuffer);
    }
  }

  const mergedBuffer = await mergeTrackArrayBuffer(arrayBufferList);
  const leftChannel = mergedBuffer.getChannelData(0);
  const righttChannel = mergedBuffer.getChannelData(1);
  const length = leftChannel.length;
  const wavBuffer = ChannelDataToWave([leftChannel, righttChannel], length);
  const name = `${options.fileName}.${options.extention}`;

  if (options.extention === 'wav') {
    const wavFile = new Blob([wavBuffer], { type: `audio/wav` });
    makeDownload(wavFile, name);
  } else if (options.extention === 'mp3' && options.quality) {
    const mp3Blob = makeMP3(wavBuffer, options.quality);
    makeDownload(mp3Blob, name);
  }
}

const ChannelDataToWave = (channelDatas: Float32Array[], len: number) => {
  const numOfChan: number = numberOfChannels;
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
  setUint32(sampleRate);
  setUint32(sampleRate * 2 * numOfChan);      // avg. bytes/sec
  setUint16(numOfChan * 2);                           // block-align
  setUint16(16);                                      // 16-bit (hardcoded in this demo)

  setUint32(0x61746164);                              // "data" - chunk
  setUint32(length - pos - 4);                        // chunk length

  for (let i = 0; i < channelDatas.length; i++) {
    channels.push(channelDatas[i]);
  }

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

const getTrackArrayBuffer = async (trackId: number) => {
  const track = Controller.getTrack(trackId);
  if (!track || track.trackSectionList.length === 0) return null;

  const lastSection = track.trackSectionList[track.trackSectionList.length - 1];

  const bufferLength = (lastSection.trackStartTime + lastSection.length) * sampleRate;

  const leftChannel = new Float32Array(bufferLength);
  const rightChannel = new Float32Array(bufferLength);
  let offset = 0;

  for (let i = 0; i < track.trackSectionList.length; i++) {
    const section = track.trackSectionList[i];
    const audioSource = Controller.getSourceBySourceId(section.sourceId);

    if (!audioSource) return;

    const duration = section.trackStartTime + section.length;
    const offlineCtx = new OfflineAudioContext(numberOfChannels, duration * sampleRate, sampleRate);
    const source = offlineCtx.createBufferSource();

    source.buffer = audioSource.buffer;

    let inputNode: AudioBufferSourceNode | GainNode = source;

    let outputNode: GainNode | null = null;

    section.effectList.forEach(effect => {
      const connectedOutputNode = EffectUtil.connectEffect(offlineCtx, inputNode, effect, section);
      if (!connectedOutputNode) return;

      outputNode = connectedOutputNode;
      inputNode = outputNode;
    });

    if (section.effectList.length === 0) {
      outputNode = offlineCtx.createGain();
      source.connect(outputNode);
    }

    if (!outputNode) return;
    outputNode.connect(offlineCtx.destination);
    source.start(section.trackStartTime, section.channelStartTime, duration);

    const renderBuffer = await offlineCtx.startRendering();
    const left = renderBuffer.getChannelData(0);
    const right = renderBuffer.getChannelData(1);

    while (offset < left.length) {
      leftChannel[offset] = left[offset];
      rightChannel[offset] = right[offset];
      offset++;
    }
  }
  const len = leftChannel.length;
  const wave = ChannelDataToWave([leftChannel, rightChannel], len);

  return wave;
}

const mergeTrackArrayBuffer = async (arrayBufferList: ArrayBuffer[]) => {
  const audioBuffers: AudioBuffer[] = [];
  let maxLength = 0;
  for (let i = 0; i < arrayBufferList.length; i++) {
    const audioCtx: AudioContext = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBufferList[i]);

    audioBuffers.push(audioBuffer);
    maxLength = Math.max(maxLength, audioBuffer.length);
  }
  const numberOfChannels = 2;
  const offlineCtx = new OfflineAudioContext(numberOfChannels, maxLength, sampleRate);
  const merger = offlineCtx.createChannelMerger(numberOfChannels);

  audioBuffers.forEach(buffer => {
    const source = offlineCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(merger);
    source.connect(offlineCtx.destination);
    source.start();
  })
  const renderBuffer = await offlineCtx.startRendering();

  return renderBuffer;
}

const makeMP3 = (wavBuffer: ArrayBuffer, quality: number) => {
  const mp3Data: Int8Array[] = [];

  const mp3encoder = new lamejs.Mp3Encoder(numberOfChannels, sampleRate, quality);

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
    mp3Data.push(mp3buf);
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