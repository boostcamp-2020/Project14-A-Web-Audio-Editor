import { WidthUtil, AudioUtil, EffectUtil } from '@util';
import { StoreChannelType, EffectType } from '@types';
import { Source, Track, TrackSection, AudioSourceInfoInTrack, Effect } from '@model';
import { storeChannel } from '@store';
import { Controller, ZoomController } from '@controllers';

const TIMER_TIME = 100;
const QUANTUM = 3;
const INF = 987654321;

class AudioManager {
  private audioContext: AudioContext;
  private trackList: Track[];
  private sourceList: Source[];
  private sourceInfo: AudioSourceInfoInTrack[];
  private mutedTrackList: Number[];
  private soloTrackList: Number[];
  private analyser: AnalyserNode | null;
  private maxPlayTime: number;
  private prevCurrentTime: number;

  constructor() {
    this.audioContext = new AudioContext();
    this.trackList = [];
    this.sourceList = [];
    this.sourceInfo = [];
    this.mutedTrackList = [];
    this.soloTrackList = [];
    this.analyser = null;
    this.maxPlayTime = INF;

    this.prevCurrentTime = 0;
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
    if (idx > -1) this.mutedTrackList.splice(idx, 1);

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
    if (idx > -1) this.soloTrackList.splice(idx, 1);

    const isPause = Controller.getIsPauseState();
    if (!isPause) {
      this.play();
    }
  }

  audioCursorPlay(): void {
    this.play();
  }

  checkRepeatPause(): boolean {
    const markerTime = Controller.getMarkerTime();
    const [loopStartTime, loopEndTime] = Controller.getLoopTime();
    if (markerTime >= loopStartTime && markerTime <= loopEndTime) {
      return true;
    }
    return false;
  }

  audioPlayOrPause(): number {
    if (this.trackList.length === 0) return 0;
    const isPause = Controller.getIsPauseState();
    const isRepeat = Controller.getIsRepeatState();

    if (isPause) {
      Controller.changeIsPauseState(false);
      if (isRepeat) {
        if (this.checkRepeatPause()) {
          this.play();
        } else {
          this.repeat();
        }
        this.moveMarkerInRepeatState();

        return 1;
      }
      this.play();
      this.moveMarkerInPlayState();

      return 1;
    } else {
      Controller.changeIsPauseState(true);

      this.pause();

      return 2;
    }
  }

  audioRestart(): void {
    const isPause = Controller.getIsPauseState();
    if (isPause) return;
    this.play();
  }

  audioStop(): void {
    if (this.trackList.length === 0) return;

    Controller.changeIsPauseState(true);
    this.prevCurrentTime = 0;
    this.stop(false);
  }

  audioRepeat(): void {
    if (this.trackList.length === 0) return;

    const isRepeat = Controller.getIsRepeatState();
    const isPause = Controller.getIsPauseState();

    if (!isRepeat) {
      Controller.changeIsRepeatState(true);

      if (Controller.getIsPauseState()) {
        return;
      }
      this.audioContext.close();
      this.audioContext = new AudioContext();
      this.audioContext.suspend();
      this.repeat();
      this.moveMarkerInRepeatState();

      return;
    }

    Controller.changeIsRepeatState(false);
    if (isPause) return;

    this.audioContext.close();
    this.audioContext = new AudioContext();
    this.audioContext.suspend();
    this.play();
    this.moveMarkerInPlayState();
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

  updateSourceInfo(sourceId: number, trackId: number, sectionId: number): void {
    const bufferSourceNode = this.audioContext.createBufferSource();
    bufferSourceNode.buffer = this.sourceList[sourceId].buffer;

    let inputNode: AudioBufferSourceNode | GainNode = bufferSourceNode;
    let outputNode: GainNode | null = null;

    const selectedTrack = this.trackList.find((track: Track) => {
      return track.id === trackId;
    });

    const selectedSection = selectedTrack?.trackSectionList.find((section: TrackSection) => {
      return section.id === sectionId;
    });

    selectedSection?.effectList.forEach((effect) => {
      const connectedOutNode = EffectUtil.connectEffect(this.audioContext, inputNode, effect, selectedSection);
      if (!connectedOutNode) return;

      outputNode = connectedOutNode;
      inputNode = outputNode;
    });

    if (selectedSection?.effectList.length === 0) {
      outputNode = this.audioContext.createGain();
      bufferSourceNode.connect(outputNode);
    }

    if (!outputNode) return;
    outputNode.connect(this.audioContext.destination);
    this.sourceInfo.push({ trackId: trackId, sectionId: sectionId, bufferSourceNode: bufferSourceNode });
  }

  setMaxPlayTime(): void {
    const [loopStartTime, loopEndTime] = Controller.getLoopTime();

    if (Controller.getIsRepeatState()) {
      this.maxPlayTime = loopEndTime;
    } else {
      let tempMaxPlayTime = 0;
      this.trackList.forEach((track: Track) => {
        track.trackSectionList.forEach((trackSection: TrackSection) => {
          let time = trackSection.trackStartTime + trackSection.length;
          if (time > tempMaxPlayTime) {
            tempMaxPlayTime = time;
          }
        });
      });

      this.maxPlayTime = tempMaxPlayTime;
    }
  }

  createAndConnectAnalyser(): void {
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.smoothingTimeConstant = 0.6;
    this.analyser.fftSize = 1024;
    this.sourceInfo.forEach((source) => {
      try {
        if (!this.analyser) return;

        const selectedTrack = this.trackList.find((track: Track) => {
          return track.id === source.trackId;
        });

        const selectedSection = selectedTrack?.trackSectionList.find((section: TrackSection) => {
          return section.id === source.sectionId;
        });

        let inputNode: AudioBufferSourceNode | GainNode = source.bufferSourceNode;
        let outputNode: GainNode | null = null;

        selectedSection?.effectList.forEach((effect) => {
          const connectedOutNode = EffectUtil.connectEffect(this.audioContext, inputNode, effect, selectedSection);
          if (!connectedOutNode) return;

          outputNode = connectedOutNode;
          inputNode = outputNode;
        });

        if (selectedSection?.effectList.length === 0) {
          outputNode = this.audioContext.createGain();
          source.bufferSourceNode.connect(outputNode);
        }
        if (!outputNode) return;
        outputNode.connect(this.analyser);
      } catch (e) { }
    });
    this.analyser.connect(this.audioContext.destination);
  }

  checkMarkerIsAtMaxPlayTime(): boolean {
    if (Controller.getMarkerTime() >= this.maxPlayTime) {
      return true;
    }
    return false;
  }

  checkMarkerIsAtRepeatEndTime(): boolean {
    if (Controller.getMarkerTime() >= this.maxPlayTime) {
      return true;
    }
    return false;
  }

  stopAtMaxPlayTime() {
    Controller.audioStop();
  }

  checkMarkerIsBeforeRepeatStartTime() {
    const markerTime = Controller.getMarkerTime();
    const [loopStartTime] = Controller.getLoopTime();

    if (!this.prevCurrentTime) return false;

    if (markerTime < loopStartTime) {
      return true;
    }
    return false;
  }

  moveMarkerInRepeatState() {
    const volumeBar = document.getElementById('audio-meter-fill');
    const isRepeat = Controller.getIsRepeatState();
    const isPause = Controller.getIsPauseState();
    if (this.checkMarkerIsAtRepeatEndTime() || this.checkMarkerIsBeforeRepeatStartTime()) {
      this.repeat();
      this.prevCurrentTime = this.audioContext.currentTime;
    }

    if (Controller.getIsPauseState()) {
      if (volumeBar) {
        setTimeout(() => {
          volumeBar.style.width = '0';
        }, TIMER_TIME);
      }
    }
    const widthPixel: number = WidthUtil.getPlayingPixel((this.audioContext.currentTime - this.prevCurrentTime));

    const array = new Float32Array(1024);
    if (!this.analyser) return;
    this.analyser.getFloatTimeDomainData(array);
    if (!volumeBar) return;
    const colors = ['rgb(153, 194, 198)', 'rgb(110,204,136)', 'rgb(214,171,34)', 'rgb(209,81,16)'];
    let decibel = AudioUtil.getDecibel(array);
    if (decibel < -72) {
      decibel = -72;
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
    Controller.changePlayStringTime(this.audioContext.currentTime - this.prevCurrentTime);
    Controller.pauseChangeMarkerNumberTime(this.audioContext.currentTime - this.prevCurrentTime);

    this.prevCurrentTime = this.audioContext.currentTime;

    !isPause && isRepeat && setTimeout(this.moveMarkerInRepeatState.bind(this), TIMER_TIME);
  }

  moveMarkerInPlayState() {
    const volumeBar = document.getElementById('audio-meter-fill');
    const isPause = Controller.getIsPauseState();
    const isRepeat = Controller.getIsRepeatState();
    const isAtMaxPlayTime = this.checkMarkerIsAtMaxPlayTime();

    if (isAtMaxPlayTime) {
      this.stopAtMaxPlayTime();
    }

    if (Controller.getIsPauseState()) {
      if (volumeBar) {
        setTimeout(() => {
          volumeBar.style.width = '0';
        }, TIMER_TIME);
      }
    }
    const widthPixel: number = WidthUtil.getPlayingPixel((this.audioContext.currentTime - this.prevCurrentTime));

    const array = new Float32Array(1024);
    if (!this.analyser) return;
    this.analyser.getFloatTimeDomainData(array);
    if (!volumeBar) return;
    const colors = ['rgb(153, 194, 198)', 'rgb(110,204,136)', 'rgb(214,171,34)', 'rgb(209,81,16)'];
    let decibel = AudioUtil.getDecibel(array);
    if (decibel < -72) {
      decibel = -72;
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
    Controller.changePlayStringTime(this.audioContext.currentTime - this.prevCurrentTime);
    Controller.pauseChangeMarkerNumberTime(this.audioContext.currentTime - this.prevCurrentTime);

    this.prevCurrentTime = this.audioContext.currentTime;

    !isRepeat && !isPause && setTimeout(this.moveMarkerInPlayState.bind(this), TIMER_TIME);
  }

  play(): void {
    const markerTime = Controller.getMarkerTime();
    const [loopStartTime, loopEndTime] = Controller.getLoopTime();

    this.stopAudioSources();
    this.sourceInfo = [];

    this.setMaxPlayTime();
    this.trackList.forEach((track: Track) => {
      if (track.trackSectionList.length !== 0) {
        if (this.soloTrackList.length !== 0) {
          const soloTrackIdx = this.soloTrackList.indexOf(track.id);
          if (soloTrackIdx === -1) return;
        }

        const mutedTrackIdx = this.mutedTrackList.indexOf(track.id);
        if (mutedTrackIdx > -1) return;

        const isRepeat = Controller.getIsRepeatState();

        track.trackSectionList.forEach((trackSection: TrackSection) => {
          this.updateSourceInfo(trackSection.sourceId, trackSection.trackId, trackSection.id);
          const sourceIdx = this.sourceInfo.length - 1;

          let waitTime: number = 0;
          let audioStartTime: number = 0;
          let playDuration: number = 0;
          let diff: number = 0;

          if (isRepeat && !this.checkRepeatPause()) {
            if (trackSection.trackStartTime > loopEndTime || trackSection.trackStartTime + trackSection.length < loopStartTime) {
              return;
            } else if (trackSection.trackStartTime <= loopStartTime && trackSection.trackStartTime + trackSection.length >= loopEndTime) {
              waitTime = 0;
              audioStartTime = trackSection.channelStartTime + (loopStartTime - trackSection.trackStartTime);
              playDuration = loopEndTime - loopStartTime;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
            } else if (trackSection.trackStartTime >= loopStartTime) {
              waitTime = trackSection.trackStartTime - loopStartTime;
              audioStartTime = trackSection.channelStartTime;

              if (trackSection.trackStartTime + trackSection.length <= loopEndTime) {
                playDuration = trackSection.length;
              } else {
                playDuration = loopEndTime - trackSection.trackStartTime;
              }

              this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
            } else {
              waitTime = 0;
              audioStartTime = trackSection.channelStartTime + (loopStartTime - trackSection.trackStartTime);
              playDuration = trackSection.trackStartTime + trackSection.length - loopStartTime;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
            }
          } else {
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
          }
        });
      }
    });
    this.audioContext.resume();
    this.createAndConnectAnalyser();

    this.prevCurrentTime = 0;
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
        Controller.initMarkerWidth(0);

        if (restart) {
          this.play();
        }
      }, TIMER_TIME + 1);
    } catch (e) {
      console.log(e);
    }
  }

  repeat(): void {
    const [loopStartTime] = Controller.getLoopTime();
    const widthPixel = ZoomController.getCurrentPixelPerSecond();

    Controller.initMarkerWidth(widthPixel * loopStartTime);
    Controller.changeMarkerPlayStringTime(loopStartTime);
    Controller.changeMarkerNumberTime(loopStartTime);

    this.play();
  }

  fastRewind(): void {
    let markerTime = Controller.getMarkerTime();

    this.stopAudioSources();
    this.sourceInfo = [];

    this.prevCurrentTime = 0;
    const widthPixel = WidthUtil.getPlayingPixel(QUANTUM);
    Controller.setMarkerWidth(-widthPixel);
    Controller.pauseChangeMarkerNumberTime(-QUANTUM);
    Controller.changePlayStringTimeFastPlaying(-QUANTUM);

    const isPause = Controller.getIsPauseState();

    if (isPause) {
      return;
    }

    this.setMaxPlayTime();
    this.trackList.forEach((track: Track) => {
      if (track.trackSectionList.length !== 0) {
        if (this.soloTrackList.length !== 0) {
          const soloTrackIdx = this.soloTrackList.indexOf(track.id);
          if (soloTrackIdx === -1) return;
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
    this.prevCurrentTime = 0;
    const widthPixel = WidthUtil.getPlayingPixel(QUANTUM);

    Controller.setMarkerWidth(widthPixel);
    Controller.pauseChangeMarkerNumberTime(QUANTUM);
    Controller.changePlayStringTimeFastPlaying(QUANTUM);

    const isPause = Controller.getIsPauseState();
    if (isPause) {
      return;
    }

    this.setMaxPlayTime();
    this.trackList.forEach((track: Track) => {
      if (track.trackSectionList.length !== 0) {
        if (this.soloTrackList.length !== 0) {
          const soloTrackIdx = this.soloTrackList.indexOf(track.id);
          if (soloTrackIdx === -1) return;
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

      this.setMaxPlayTime();

      setTimeout(() => {
        this.setMaxPlayTime();

        const widthPixel = ZoomController.getCurrentPixelPerSecond();
        Controller.initMarkerWidth(widthPixel * this.maxPlayTime);
        Controller.changeMarkerPlayStringTime(this.maxPlayTime);
        Controller.changeMarkerNumberTime(this.maxPlayTime);
      }, TIMER_TIME + 1);
    } catch (e) {
      console.log(e);
    }
  }

  //AudioTrack에 있는 함수.
  calculateTrackWidth(): number {
    let trackWidth = 0;
    const trackAreaElement = document.querySelector('.audio-track-area');
    if (trackAreaElement) {
      trackWidth = trackAreaElement.getBoundingClientRect().right - trackAreaElement.getBoundingClientRect().left;
    }
    return trackWidth;
  }
}

const audioManager = new AudioManager();
export default audioManager;
