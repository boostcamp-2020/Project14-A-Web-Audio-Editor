import { EffectType } from '@types'
import { Effect, TrackSection } from '@model'
import { EffectUtil } from '@util'
import { Controller } from '@controllers';

const roundPropertyValue = (value: number, decimalPlace: number = 0): number => {
  const decimalNumber = 10 ** decimalPlace;
  const result = Math.round(value * decimalNumber) / decimalNumber;
  return result;
}

const floorPropertyValue = (value: number, decimalPlace: number = 0): number => {
  const decimalNumber = 10 ** decimalPlace;
  const result = Math.floor(value * decimalNumber) / decimalNumber;
  return result;
}

const connectGainNode = (audioContext: AudioContext | OfflineAudioContext, bufferSourceNode: AudioBufferSourceNode | GainNode, effect: Effect): GainNode => {
  const gainNode = audioContext.createGain();
  const outputNode = audioContext.createGain();

  gainNode.gain.value = effect.properties.getProperty('gain');

  bufferSourceNode.connect(gainNode);
  gainNode.connect(outputNode);
  return outputNode;
}

const connectCompressorNode = (audioContext: AudioContext | OfflineAudioContext, bufferSourceNode: AudioBufferSourceNode | GainNode, effect: Effect): GainNode => {
  const compressorNode = audioContext.createDynamicsCompressor();
  const outputNode = audioContext.createGain();

  compressorNode.threshold.setValueAtTime(effect.properties.getProperty('threshold'), 0);
  compressorNode.attack.setValueAtTime(effect.properties.getProperty('attack'), 0);
  compressorNode.release.setValueAtTime(effect.properties.getProperty('release'), 0);
  compressorNode.ratio.setValueAtTime(effect.properties.getProperty('ratio'), 0);
  compressorNode.knee.setValueAtTime(effect.properties.getProperty('knee'), 0);

  bufferSourceNode.connect(compressorNode);
  compressorNode.connect(outputNode);
  return outputNode;
}

const connectFilterNode = (audioContext: AudioContext | OfflineAudioContext, bufferSourceNode: AudioBufferSourceNode | GainNode, effect: Effect): GainNode => {
  const filterNode = audioContext.createBiquadFilter();
  const outputNode = audioContext.createGain();

  filterNode.type = effect.properties.getType();
  filterNode.frequency.value = effect.properties.getProperty('frequency');
  filterNode.Q.value = effect.properties.getProperty('Q');

  bufferSourceNode.connect(filterNode);
  filterNode.connect(outputNode);
  return outputNode;
}

const connectReverbNode = (audioContext: AudioContext | OfflineAudioContext, bufferSourceNode: AudioBufferSourceNode | GainNode, effect: Effect): GainNode => {
  const convolverNode = audioContext.createConvolver();
  const wetGainNode = audioContext.createGain();
  const dryGainNode = audioContext.createGain();
  const time = effect.properties.getProperty('time');
  const decay = effect.properties.getProperty('decay');
  const mix = effect.properties.getProperty('mix');

  const outputNode = audioContext.createGain();

  bufferSourceNode.connect(dryGainNode);
  dryGainNode.connect(outputNode);
  dryGainNode.gain.value = 1 - mix;

  convolverNode.buffer = generateImpulseResponse(audioContext, time, decay);

  bufferSourceNode.connect(convolverNode);
  convolverNode.connect(wetGainNode);
  wetGainNode.connect(outputNode);
  wetGainNode.gain.value = mix;

  return outputNode;
}

const generateImpulseResponse = (audioContext: AudioContext | OfflineAudioContext, time: number, decay: number) => {
  const sampleRate = audioContext.sampleRate;
  const length = sampleRate * time;
  const impulse = audioContext.createBuffer(2, length, sampleRate);

  const leftImpulse = impulse.getChannelData(0);
  const rightImpulse = impulse.getChannelData(1);

  for (let i = 0; i < length; i++) {
    leftImpulse[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    rightImpulse[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
  }

  return impulse;
}

const connectFadeInNode = (audioContext: AudioContext | OfflineAudioContext, bufferSourceNode: AudioBufferSourceNode | GainNode, effect: Effect, trackStartTime: number, trackLength: number): GainNode => {
  const gainNode = audioContext.createGain();
  const outputNode = audioContext.createGain();

  const fadeInProperty = effect.properties.getProperty('fadeInLength');
  const fadeInLength = EffectUtil.floorPropertyValue(Math.min(trackLength, fadeInProperty), 1);
  const increaseValue = 1.0 / fadeInLength;

  const markerTime = Controller.getMarkerTime();

  let fadeStartTime = 0;
  let fadeStartGain = 0;
  let loopTimes = fadeInLength;

  if (trackStartTime > markerTime) {
    fadeStartTime = trackStartTime - markerTime;
  } else if (trackStartTime <= markerTime && markerTime <= trackStartTime + fadeInLength) {
    fadeStartTime = 0;
    fadeStartGain = increaseValue * (markerTime - trackStartTime);
    loopTimes = fadeInLength - (markerTime - trackStartTime);
  } else {
    fadeStartTime = 0;
    fadeStartGain = 1.0;
    loopTimes = 0;
  }

  gainNode.gain.setValueAtTime(fadeStartGain, fadeStartTime);

  for (let i = 0.01; i <= loopTimes; i += 0.01) {
    gainNode.gain.exponentialRampToValueAtTime(fadeStartGain + (increaseValue * i), fadeStartTime + i);
  }

  bufferSourceNode.connect(gainNode);
  gainNode.connect(outputNode);
  return outputNode;
}

const connectFadeOutNode = (audioContext: AudioContext | OfflineAudioContext, bufferSourceNode: AudioBufferSourceNode | GainNode, effect: Effect, trackEndTime: number, trackLength: number): GainNode => {
  const gainNode = audioContext.createGain();
  const outputNode = audioContext.createGain();
  const fadeOutProperty = effect.properties.getProperty('fadeOutLength');
  const fadeOutLength = EffectUtil.floorPropertyValue(Math.min(trackLength, fadeOutProperty), 1);
  const fadeOutStart = trackEndTime - fadeOutLength;

  const decreaseValue = 1.0 / fadeOutLength;

  const markerTime = Controller.getMarkerTime();

  let fadeStartTime = 0;
  let fadeStartGain = 1.0;
  let loopTimes = fadeOutLength;

  if (markerTime < fadeOutStart) {
    fadeStartTime = fadeOutStart - markerTime;
  } else if (fadeOutStart <= markerTime && markerTime <= trackEndTime) {
    fadeStartTime = 0;
    fadeStartGain = 1.0 - (decreaseValue * (markerTime - fadeOutStart));
    loopTimes = trackEndTime - markerTime;
  } else {
    fadeStartTime = 0;
    fadeStartGain = 0;
    loopTimes = 0;
  }

  gainNode.gain.setValueAtTime(fadeStartGain, fadeStartTime);

  for (let i = 0.01; i <= loopTimes; i += 0.01) {
    gainNode.gain.exponentialRampToValueAtTime(fadeStartGain - (decreaseValue * i), fadeStartTime + i);
  }

  bufferSourceNode.connect(gainNode);
  gainNode.connect(outputNode);
  return outputNode;
}

const connectEffect = (audioContext: AudioContext | OfflineAudioContext, bufferSourceNode: AudioBufferSourceNode | GainNode, effect: Effect, trackSection: TrackSection): GainNode | void => {
  switch (effect.name) {
    case EffectType.gain:
      return connectGainNode(audioContext, bufferSourceNode, effect);
    case EffectType.compressor:
      return connectCompressorNode(audioContext, bufferSourceNode, effect);
    case EffectType.filter:
      return connectFilterNode(audioContext, bufferSourceNode, effect);
    case EffectType.reverb:
      return connectReverbNode(audioContext, bufferSourceNode, effect);
    case EffectType.fadein:
      const trackStartTime = trackSection.trackStartTime;
      return connectFadeInNode(audioContext, bufferSourceNode, effect, trackStartTime, trackSection.length);
    case EffectType.fadeout:
      const trackEndTime = trackSection.trackStartTime + trackSection.length;
      return connectFadeOutNode(audioContext, bufferSourceNode, effect, trackEndTime, trackSection.length);
    default:
      break;
  }
};

export {
  roundPropertyValue,
  floorPropertyValue,
  connectGainNode,
  connectCompressorNode,
  connectFilterNode,
  connectReverbNode,
  connectFadeInNode,
  connectFadeOutNode,
  generateImpulseResponse,
  connectEffect,
}