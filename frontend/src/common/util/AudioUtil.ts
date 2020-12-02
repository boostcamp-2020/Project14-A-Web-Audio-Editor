const decodeArrayBufferToAudio = async(arrayBuffer) => {
  const audioContext = new AudioContext();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}

const mergeChannels = async (audioBuffer) => {
  const numberOfChannels = 1;
  const offlineCtx = new OfflineAudioContext(numberOfChannels,audioBuffer.length,audioBuffer.sampleRate);
  const source = offlineCtx.createBufferSource();
  const merger = offlineCtx.createChannelMerger(2);

  source.buffer = audioBuffer;
  source.connect(offlineCtx.destination);
  source.connect(merger);
  source.start();

  const renderBuffer = await offlineCtx.startRendering();
  return renderBuffer;
}

const parsePeaks = (audioBuffer: AudioBuffer): Promise<number[]> => new Promise((resolve, reject)=> {
    const {duration, numberOfChannels, sampleRate, length } = audioBuffer;
    const sampleSize = length / sampleRate;
    const sampleStep = Math.floor(sampleSize / 10) || 1;
    const channelPeaks :Float32Array = audioBuffer.getChannelData(0);
    let resultPeaks: number[] = []; 

    Array(sampleRate).fill(0).forEach((v, newPeakIndex) => {
      const start = Math.floor(newPeakIndex * sampleSize);
      const end = Math.floor(start + sampleSize);
      let min = channelPeaks[0];
      let max = channelPeaks[0];

      for (let sampleIndex = start; sampleIndex < end; sampleIndex += sampleStep) { //480
        const v = channelPeaks[sampleIndex];

        if (v > max) max = v;
        else if (v < min) min = v;
      }

      resultPeaks[2 * newPeakIndex] = max;
      resultPeaks[2 * newPeakIndex + 1] = min;
    });
    
    resolve(resultPeaks);
  });

export {
  decodeArrayBufferToAudio,
  mergeChannels,
  parsePeaks
}
