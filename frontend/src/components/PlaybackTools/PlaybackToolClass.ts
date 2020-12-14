import { WidthUtil, AudioUtil } from '@util';
import { EffectTitleType, StoreChannelType } from '@types';
import { Source, Track, TrackSection, AudioSourceInfoInTrack, Effect } from '@model';
import { storeChannel } from '@store';
import { Controller } from '@controllers';
import { CompressorProperties, FilterProperties, GainProperties, ReverbProperties } from '../../model/EffectProperties';

const TIMER_TIME = 34;
const QUANTUM = 3;
const INF = 987654321;

class PlaybackToolClass {
  private audioContext: AudioContext;
  private trackList: Track[];
  private sourceList: Source[];
  private sourceInfo: AudioSourceInfoInTrack[];
  private mutedTrackList: Number[];
  private soloTrackList: Number[];
  private analyser: AnalyserNode|null;
  private maxPlayTime: number;
  private loopStartTime: number;
  private loopEndTime: number;

  constructor() {
    this.audioContext = new AudioContext();
    this.trackList = [];
    this.sourceList = [];
    this.sourceInfo = [];
    this.mutedTrackList = [];
    this.soloTrackList = [];
    this.analyser = null;
    this.maxPlayTime = INF;

    this.loopStartTime = 0;
    this.loopEndTime = 0;
    this.subscribe();
  }

  subscribe(): void {
    storeChannel.subscribe(StoreChannelType.TRACK_CHANNEL, this.trackListObserver, this);
    storeChannel.subscribe(StoreChannelType.SOURCE_LIST_CHANNEL, this.sourceListObserver, this);
  }

  trackListObserver(trackList): void {
    this.trackList = [...trackList];
  }

  sourceListObserver(sourceList): void {
    this.sourceList = [...sourceList];
  }

  setMute(trackId: number): void {
    this.mutedTrackList.push(trackId);

    const isPause = Controller.getIsPauseState();
    if (!isPause) {
      this.play();
    }
  }

  unsetMute(trackId: number): void {
    const idx = this.mutedTrackList.indexOf(trackId);
    if (idx > -1) this.mutedTrackList.splice(idx, 1)

    const isPause = Controller.getIsPauseState();
    if (!isPause) {
      this.play();
    }
  }

  setSolo(trackId: number): void {
    this.soloTrackList.push(trackId);

    const isPause = Controller.getIsPauseState();
    if (!isPause) {
      this.play();
    }
  }

  unsetSolo(trackId: number): void {
    const idx = this.soloTrackList.indexOf(trackId);
    if (idx > -1) this.soloTrackList.splice(idx, 1)

    const isPause = Controller.getIsPauseState();
    if (!isPause) {
      this.play();
    }
  }

  audioCursorPlay(): void {
    this.play();
  }

  audioPlayOrPause(): number {
    if (this.trackList.length == 0) return 0;
    const isPause = Controller.getIsPauseState();

    if (isPause) {
      Controller.changeIsPauseState(false);
      this.play();
      this.playTimer()

      return 1;
    }
    else {
      Controller.changeIsPauseState(true);
      this.pause();

      return 2;
    }
  }

  audioStop(): void {
    if (this.trackList.length == 0) return;

    Controller.changeIsPauseState(true);
    this.stop(false);
  }

  audioRepeat(): void {
    if (this.trackList.length == 0) return;

    const isRepeat = Controller.getIsRepeatState();

    if (isRepeat === false) {
      Controller.changeIsRepeatState(true);
    }
    else {
      Controller.changeIsRepeatState(false);
    }
  }

  audioFastRewind(): void {
    if (this.trackList.length == 0) return;

    this.fastRewind();
  }

  audioFastForward(): void {
    if (this.trackList.length == 0) return;

    this.fastForward();
  }

  audioSkipPrev(): void {
    if (this.trackList.length == 0) return;

    const isPause = Controller.getIsPauseState();
    this.stop(!isPause);
  }

  audioSkipNext(): void {
    if (this.trackList.length == 0) return;

    this.skipNext();
  }

  stopAudioSources(): void {
    this.sourceInfo.forEach((source) => {
      try {
        source.bufferSourceNode.stop();
        source.bufferSourceNode.buffer = null;
      } catch (e) { }
    });

    this.audioContext.close();
    this.audioContext = new AudioContext();
    this.audioContext.suspend();
  }

  generateImpulseResponse(time:number, decay:number) {
    const sampleRate = this.audioContext.sampleRate;
    const length = sampleRate * time;
    const impulse = this.audioContext.createBuffer(2, length, sampleRate);
  
    const leftImpulse = impulse.getChannelData(0);
    const rightImpulse = impulse.getChannelData(1);
  
    for (let i = 0; i < length; i++) {
      leftImpulse[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      rightImpulse[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  
    return impulse;
  }

  updateSourceInfo(sourceId: number, trackId: number, sectionId: number): void {
    const bufferSourceNode = this.audioContext.createBufferSource();
    bufferSourceNode.buffer = this.sourceList[sourceId].buffer;

    const outputNode = this.audioContext.createGain();

    const myTrack = this.trackList.find((track:Track)=>{
      return track.id === trackId;
    })
    
    const mySection = myTrack?.trackSectionList.find((section: TrackSection)=>{
      return section.id === sectionId;
    })
    
    //test1. gain
    const tempGain = new GainProperties({gain:2});
    // mySection?.effectList.push(new Effect({name:'gain', properties:tempGain}));

    //test2. compressor
    const tempCompressor = new CompressorProperties({});
    // mySection?.effectList.push(new Effect({name:'compressor', properties:tempCompressor}));

    //test3. filter
    const tempFilter = new FilterProperties({type:'lowpass'});
    // mySection?.effectList.push(new Effect({name:'filter', properties:tempFilter}));

    //test4. reverb
    const tempReverb = new ReverbProperties({});
    mySection?.effectList.push(new Effect({name:'reverb', properties:tempReverb}));

    mySection?.effectList.forEach((effect)=>{
      switch(effect.name) {
        case 'gain':
          const gainNode = this.audioContext.createGain();

          gainNode.gain.value = effect.properties.gain;

          bufferSourceNode.connect(gainNode);
          gainNode.connect(outputNode);
          break;

        case 'compressor':
          const compressorNode = this.audioContext.createDynamicsCompressor();

          compressorNode.threshold.setValueAtTime(effect.properties.threshold, 0);
          compressorNode.attack.setValueAtTime(effect.properties.attack, 0);
          compressorNode.release.setValueAtTime(effect.properties.release, 0);
          compressorNode.ratio.setValueAtTime(effect.properties.ratio, 0);
          compressorNode.knee.setValueAtTime(effect.properties.knee, 0);

          bufferSourceNode.connect(compressorNode);
          compressorNode.connect(outputNode);
          break;

        case 'filter':
          const filterNode = this.audioContext.createBiquadFilter();

          filterNode.type = effect.properties.type;
          filterNode.frequency.value = effect.properties.frequency;
          filterNode.Q.value = effect.properties.Q;

          bufferSourceNode.connect(filterNode);
          filterNode.connect(outputNode);
          break;

        case 'reverb':
          const convolverNode = this.audioContext.createConvolver();
          const wetGainNode = this.audioContext.createGain();
          const dryGainNode = this.audioContext.createGain();
      
          const time = effect.properties.time;
          const decay = effect.properties.decay;
          const mix = effect.properties.mix;

          bufferSourceNode.connect(dryGainNode);
          dryGainNode.connect(outputNode);
          dryGainNode.gain.value = 1 - mix;
          
          convolverNode.buffer = this.generateImpulseResponse(time, decay);
          
          bufferSourceNode.connect(convolverNode);
          convolverNode.connect(wetGainNode);
          wetGainNode.connect(outputNode);
          wetGainNode.gain.value = mix;

          break;

        default:
          break;
      }
    });

    if(mySection?.effectList.length === 0) {
      bufferSourceNode.connect(outputNode);
    }
    else { //삭제
      mySection?.effectList.pop();
    }

    outputNode.connect(this.audioContext.destination);
    this.sourceInfo.push({ trackId: trackId, sectionId: sectionId, bufferSourceNode: bufferSourceNode });
  }

  setMaxPlayTime(): void {
    let tempMaxPlayTime = 0;
    this.trackList.forEach((track: Track) => {
      track.trackSectionList.forEach((trackSection: TrackSection) => {
        let time = trackSection.trackStartTime + trackSection.length;
        if(time > tempMaxPlayTime){
          tempMaxPlayTime = time;
        }
      });
    });

    this.maxPlayTime = tempMaxPlayTime;
  }

  createAndConnectAnalyser(): void {
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.3;
    this.analyser.fftSize = 1024;
    this.sourceInfo.forEach((source) => {
      try {
        source.bufferSourceNode.connect(this.analyser);
      } catch (e) { }
    });
    this.analyser.connect(this.audioContext.destination);
  }
  
  checkMarkerIsAtMaxPlayTime(): boolean {
    if(Controller.getMarkerTime() >= this.maxPlayTime){
      return true;
    }
    return false;
  }

  checkMarkerIsAtRepeatEndTime(): boolean {
    //재생바 부분 반영되면 값 가져와서 사용    
    const loopEndTime = this.maxPlayTime;
    if(Controller.getMarkerTime() >= loopEndTime){
      return true;
    }
    return false;
  }

  stopAtMaxPlayTime() {
    Controller.audioPlayOrPause();
  }

  playTimer(): void {
    const volumeBar = document.getElementById("audio-meter-fill");

    let playTimer = setInterval(() => {
      if(Controller.getIsRepeatState()) {
        if(this.checkMarkerIsAtRepeatEndTime()){
          this.repeat();
        }
      }
      else {
        if(this.checkMarkerIsAtMaxPlayTime()) {
          this.stopAtMaxPlayTime();
          clearInterval(playTimer);  
        }
      }

      if (Controller.getIsPauseState()) {
        if (volumeBar) {
          setTimeout(() => {
            volumeBar.style.width = '0';
          }, TIMER_TIME)
        }
        clearInterval(playTimer);
      }
      const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
      const widthPixel = WidthUtil.getPerPixel(TIMER_TIME, maxTrackPlayTime);

      const array = new Float32Array(1024);
      this.analyser.getFloatTimeDomainData(array);
      if (!volumeBar) return;
      const colors = ['rgb(153, 194, 198)', 'rgb(110,204,136)', 'rgb(214,171,34)', 'rgb(209,81,16)']
      let decibel = AudioUtil.getDecibel(array);
      if (decibel < -72) {
        decibel = -72
      }
      const scaledDecibel = (decibel / 72) * 100;
      const percentage = 100 + scaledDecibel;
      volumeBar.style.width = `${percentage}%`;

      if (percentage > 98) {
        volumeBar.style.background = `linear-gradient(to right, ${colors[0]},  ${colors[1]} 70%,  ${colors[2]} 95%,  ${colors[3]} 99%)`;
      } else if (percentage > 80) {
        volumeBar.style.background = `linear-gradient(to right, ${colors[0]}, ${colors[1]} 80%,${colors[2]})`;
      } else {
        volumeBar.style.background = `linear-gradient(to right, ${colors[0]}, ${colors[1]} 90%)`;
      }

      Controller.setMarkerWidth(widthPixel);
      Controller.changePlayStringTime(TIMER_TIME);
      Controller.pauseChangeMarkerNumberTime(TIMER_TIME / 1000);
    }, TIMER_TIME);
  }

  play(): void {
    const markerTime = Controller.getMarkerTime();

    this.stopAudioSources();
    this.sourceInfo = [];

    this.setMaxPlayTime();
    this.trackList.forEach((track: Track) => {
      if (track.trackSectionList.length !== 0) {
        if (this.soloTrackList.length !== 0) { 
          const soloTrackIdx = this.soloTrackList.indexOf(track.id);
          if(soloTrackIdx === -1) return;
        }

        const mutedTrackIdx = this.mutedTrackList.indexOf(track.id);
        if (mutedTrackIdx > -1) return;

        track.trackSectionList.forEach((trackSection: TrackSection) => {
          this.updateSourceInfo(trackSection.sourceId, trackSection.trackId, trackSection.id);
          const sourceIdx = this.sourceInfo.length - 1;

          let waitTime: number = 0;
          let audioStartTime: number = 0;
          let playDuration: number = 0;
          let diff: number = 0;

          if (markerTime <= trackSection.trackStartTime) {
            waitTime = this.audioContext.currentTime + trackSection.trackStartTime - markerTime;
            audioStartTime = trackSection.channelStartTime;
            playDuration = trackSection.length;

            this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
          } else if (trackSection.trackStartTime + trackSection.length < markerTime) {
            //재생되지 않는 부분
          } else {
            waitTime = 0;
            diff = markerTime - trackSection.trackStartTime;
            audioStartTime = trackSection.channelStartTime + diff;
            playDuration = trackSection.length - diff;

            this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
          }
        });
      }
    });
    this.audioContext.resume();
    this.createAndConnectAnalyser();
  }

  pause(): void {
    this.audioContext.suspend();
  }

  stop(restart: boolean): void {
    try {
      this.audioContext.close();
      this.audioContext = new AudioContext();
      this.audioContext.suspend();

      setTimeout(() => {
        Controller.changeMarkerPlayStringTime(0);
        Controller.changeMarkerNumberTime(0);
        Controller.setMarkerWidth(0);

        if (restart) {
          this.play();
        }
      }, TIMER_TIME + 1);

    }
    catch (e) {
      console.log(e);
    }
  }

  repeat(): void {
    const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
    const widthPixel = WidthUtil.getPixelPerSecond(this.calculateTrackWidth(), maxTrackPlayTime);
    
    Controller.setMarkerWidth([widthPixel * this.loopStartTime, 1]);
    Controller.changeMarkerPlayStringTime(this.loopStartTime);
    Controller.changeMarkerNumberTime(this.loopStartTime);
    
    this.play();
  }

  fastRewind(): void {
    let markerTime = Controller.getMarkerTime();

    this.stopAudioSources();
    this.sourceInfo = [];

    this.createAndConnectAnalyser();

    const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
    const widthPixel = WidthUtil.getPerPixel(QUANTUM * 1000, maxTrackPlayTime);
    Controller.setMarkerWidth(-widthPixel);
    Controller.pauseChangeMarkerNumberTime(-QUANTUM);
    Controller.changePlayStringTime(-QUANTUM * 1000);

    const isPause = Controller.getIsPauseState();

    if (isPause) {
      return;
    }

    this.setMaxPlayTime();
    this.trackList.forEach((track: Track) => {
      if (track.trackSectionList.length !== 0) {

        if (this.soloTrackList.length !== 0) { 
          const soloTrackIdx = this.soloTrackList.indexOf(track.id);
          if(soloTrackIdx === -1) return;
        }

        const idx = this.mutedTrackList.indexOf(track.id);
        if (idx > -1) {
          return;
        }

        track.trackSectionList.forEach((trackSection: TrackSection) => {
          this.updateSourceInfo(trackSection.sourceId, trackSection.trackId, trackSection.id);

          let waitTime: number = 0;
          let audioStartTime: number = 0;
          let playDuration: number = 0;
          let diff: number = 0;
          const sourceIdx = this.sourceInfo.length - 1;

          if (markerTime - QUANTUM <= trackSection.trackStartTime) {
            if (markerTime - QUANTUM < 0) waitTime = trackSection.trackStartTime;
            else waitTime = this.audioContext.currentTime + trackSection.trackStartTime - markerTime + QUANTUM;
            audioStartTime = trackSection.channelStartTime;
            playDuration = trackSection.length;

            this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
          } else if (trackSection.trackStartTime <= markerTime - QUANTUM && markerTime <= trackSection.trackStartTime + trackSection.length) {
            diff = markerTime - trackSection.trackStartTime - QUANTUM;
            waitTime = 0;
            audioStartTime = trackSection.channelStartTime + diff;
            playDuration = trackSection.length - diff;

            this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
          } else if (
            markerTime - QUANTUM <= trackSection.trackStartTime + trackSection.length &&
            trackSection.trackStartTime + trackSection.length <= markerTime
          ) {
            diff = markerTime - QUANTUM - trackSection.trackStartTime;
            waitTime = 0;
            audioStartTime = trackSection.channelStartTime + diff;
            playDuration = trackSection.length - diff;

            this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
          } else {
            //재생 구간을 벗어난 경우
          }
        });
      }
    });
    this.audioContext.resume();
    this.createAndConnectAnalyser();
  }

  fastForward(): void {
    let markerTime = Controller.getMarkerTime();

    this.stopAudioSources();
    this.sourceInfo = [];

    this.createAndConnectAnalyser();

    const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
    const widthPixel = WidthUtil.getPerPixel(QUANTUM * 1000, maxTrackPlayTime);
    Controller.setMarkerWidth(widthPixel);
    Controller.pauseChangeMarkerNumberTime(QUANTUM);
    Controller.changePlayStringTime(QUANTUM * 1000);

    const isPause = Controller.getIsPauseState();
    if (isPause) {
      return;
    }

    this.setMaxPlayTime();
    this.trackList.forEach((track: Track) => {
      if (track.trackSectionList.length !== 0) {

        if (this.soloTrackList.length !== 0) { 
          const soloTrackIdx = this.soloTrackList.indexOf(track.id);
          if(soloTrackIdx === -1) return;
        }

        const idx = this.mutedTrackList.indexOf(track.id);
        if (idx > -1) {
          return;
        }

        track.trackSectionList.forEach((trackSection: TrackSection) => {
          this.updateSourceInfo(trackSection.sourceId, trackSection.trackId, trackSection.id);

          let waitTime: number = 0;
          let audioStartTime: number = 0;
          let playDuration: number = 0;
          let diff: number = 0;
          const sourceIdx = this.sourceInfo.length - 1;

          if (markerTime + QUANTUM <= trackSection.trackStartTime) {
            waitTime = this.audioContext.currentTime + trackSection.trackStartTime - (markerTime + QUANTUM);
            audioStartTime = trackSection.channelStartTime;
            playDuration = trackSection.length;

            this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
          } else if (trackSection.trackStartTime <= markerTime && markerTime + QUANTUM <= trackSection.trackStartTime + trackSection.length) {
            diff = markerTime - trackSection.trackStartTime + QUANTUM;
            waitTime = 0;
            audioStartTime = trackSection.channelStartTime + diff;
            playDuration = trackSection.length - diff;

            this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
          } else if (markerTime <= trackSection.trackStartTime && trackSection.trackStartTime <= markerTime + QUANTUM) {
            diff = markerTime + QUANTUM - trackSection.trackStartTime;
            waitTime = 0;
            audioStartTime = trackSection.channelStartTime + diff;
            playDuration = trackSection.length - diff;

            this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
          } else {
            //재생 구간을 벗어난 경우
          }
        });
      }
    });
    this.audioContext.resume();
    this.createAndConnectAnalyser();
  }

  skipNext(): void {
    try {
      this.audioContext.close();
      this.audioContext = new AudioContext();
      this.audioContext.suspend();

      //loop여부 관계없이 맨 마지막에 멈추게 하는 게 구현은 편할 것.
      this.setMaxPlayTime();

      setTimeout(() => {
        const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
        this.setMaxPlayTime();

        const widthPixel = WidthUtil.getPixelPerSecond(this.calculateTrackWidth(), maxTrackPlayTime);
        Controller.setMarkerWidth([widthPixel * this.maxPlayTime, 1]);
        Controller.changeMarkerPlayStringTime(this.maxPlayTime);
        Controller.changeMarkerNumberTime(this.maxPlayTime);

      }, TIMER_TIME + 1);
    }
    catch (e) {
      console.log(e);
    }
  }

  //AudioTrack에 있는 함수.
  calculateTrackWidth(): number{
    let trackWidth = 0;
    const trackAreaElement = document.querySelector('.audio-track-area');
    if(trackAreaElement){
      trackWidth = trackAreaElement.getBoundingClientRect().right - trackAreaElement.getBoundingClientRect().left;
    }
    return trackWidth;
  }
}

const playbackTool = new PlaybackToolClass();

export default playbackTool;
