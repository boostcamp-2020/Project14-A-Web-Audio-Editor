const decodeArrayBufferToAudio = async (arrayBuffer) => {
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

const mergeChannels = async (audioBuffer) => {
  const numberOfChannels = 1;
  const offlineCtx = new OfflineAudioContext(numberOfChannels, audioBuffer.length, audioBuffer.sampleRate);
  const source = offlineCtx.createBufferSource();
  const merger = offlineCtx.createChannelMerger(2);

  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.connect(merger);
  source.start();

  const renderBuffer = await offlineCtx.startRendering();
  return renderBuffer;
}

const parsePeaks = (audioBuffer: AudioBuffer, parsedBufferSize: number): Promise<number[]> => new Promise((resolve, reject) => {
  const { length } = audioBuffer;
  const sampleSize = length / parsedBufferSize;
  const sampleStep = Math.floor(sampleSize / 10) || 1;

  const channelData: Float32Array = audioBuffer.getChannelData(0);
  let parsedData: number[] = [];

  Array(parsedBufferSize).fill(0).forEach((v, newPeakIndex) => {
    const start = Math.floor(newPeakIndex * sampleSize);
    const end = Math.floor(start + sampleSize);
    let min = channelData[0];
    let max = channelData[0];

    for (let sampleIndex = start; sampleIndex < end; sampleIndex += sampleStep) {
      const v = channelData[sampleIndex];

      if (v > max) max = v;
      else if (v < min) min = v;
    }

    parsedData[2 * newPeakIndex] = max;
    parsedData[2 * newPeakIndex + 1] = min;
  });

  resolve(parsedData);
});

const getDecibel = (array: Float32Array) => {
  var sumOfSquares = 0;
  var average = 0;
  for (var i = 0; i < array.length; i++) {
    sumOfSquares += array[i] ** 2;
  }
  average = 10 * Math.log10(sumOfSquares / array.length);
  return average;
}


export {
  decodeArrayBufferToAudio,
  mergeChannels,
  parsePeaks,
  getDecibel
}
