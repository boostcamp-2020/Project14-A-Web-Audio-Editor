const audioContext = new AudioContext();

const decodeArrayBufferToAudio = async(arrayBuffer) => {
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

export {
  decodeArrayBufferToAudio
}
