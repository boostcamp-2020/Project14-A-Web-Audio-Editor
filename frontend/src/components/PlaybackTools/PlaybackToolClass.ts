import { WidthUtil, AudioUtil } from '@util';
import { StoreChannelType } from '@types';
import { Source, Track, TrackSection, AudioSourceInfoInTrack } from '@model';
import { storeChannel } from '@store';
import { Controller } from '@controllers';

const TIMER_TIME = 34;
const QUANTUM = 3;

class PlaybackToolClass {
  private audioContext: AudioContext;
  private trackList: Track[];
  private sourceList: Source[];
  private sourceInfo: AudioSourceInfoInTrack[];
  private mutedTrackList: Number[];
  private soloTrackList: Number[];

  constructor() {
    this.audioContext = new AudioContext();
    this.trackList = [];
    this.sourceList = [];
    this.sourceInfo = [];
    this.mutedTrackList = [];
    this.soloTrackList = [];
    this.subscribe();
  }

  subscribe(): void {
    storeChannel.subscribe(StoreChannelType.TRACK_CHANNEL, this.trackListObserver, this);
    storeChannel.subscribe(StoreChannelType.SOURCE_LIST_CHANNEL, this.sourceListObserver, this);
  }

  trackListObserver(trackList): void {
    this.trackList = trackList;
  }

  sourceListObserver(sourceList): void {
    this.sourceList = sourceList;
  }

  setMute(trackId: number) {
    this.mutedTrackList.push(trackId);

    const isPause = Controller.getIsPauseState();
    if (!isPause) {
      this.play();
    }
  }

  unsetMute(trackId: number) {
    const idx = this.mutedTrackList.indexOf(trackId);
    if (idx > -1) this.mutedTrackList.splice(idx, 1)

    const isPause = Controller.getIsPauseState();
    if (!isPause) {
      this.play();
    }
  }

  setSolo(trackId: number) {
    this.soloTrackList.push(trackId);

    const isPause = Controller.getIsPauseState();
    if (!isPause) {
      this.play();
    }
  }

  unsetSolo(trackId: number) {
    const idx = this.soloTrackList.indexOf(trackId);
    if (idx > -1) this.soloTrackList.splice(idx, 1)

    const isPause = Controller.getIsPauseState();
    if (!isPause) {
      this.play();
    }
  }

  //커서로 선택 시 play 되는거. 재생 중일때만 불림.
  audioCursorPlay() {
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

  audioStop() {
    if (this.trackList.length == 0) return;

    Controller.changeIsPauseState(true);

    this.stop(false);
  }

  audioRepeat() {
    if (this.trackList.length == 0) return;

    const isRepeat = Controller.getIsRepeatState();

    if (isRepeat === false) {
      Controller.changeIsRepeatState(true);
      this.repeat(2, 5);

      return true;
    }
    else {
      Controller.changeIsRepeatState(false);

      return false;
    }
  }

  audioFastRewind() {
    if (this.trackList.length == 0) return;

    this.fastRewind();
  }

  audioFastForward() {
    if (this.trackList.length == 0) return;

    this.fastForward();
  }

  audioSkipPrev() {
    if (this.trackList.length == 0) return;

    const isPause = Controller.getIsPauseState();
    this.stop(!isPause);
  }

  audioSkipNext() {
    if (this.trackList.length == 0) return;

    this.skipNext();
  }

  stopAudioSources() {
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

  updateSourceInfo(sourceId: number, trackId: number, sectionId: number) {
    const bufferSourceNode = this.audioContext.createBufferSource();
    bufferSourceNode.buffer = this.sourceList[sourceId].buffer;

    //TODO: effect가 적용된 노드에 대해 effect를 적용하기
    //trackId와 sectionId는 effectList에 내용이 있을 때 사용된다.
    //connect가 다르게 된다.
    bufferSourceNode.connect(this.audioContext.destination);

    this.sourceInfo.push({ trackId: trackId, sectionId: sectionId, bufferSourceNode: bufferSourceNode });
  }

  playTimer() {
    const volumeBar = document.getElementById("audio-meter-fill");
    const analyser = this.audioContext.createAnalyser();
    analyser.smoothingTimeConstant = 0.3;
    analyser.fftSize = 1024;
    this.sourceInfo.forEach((source) => {
      try {
        source.bufferSourceNode.connect(analyser);
      } catch (e) { }
    });
    analyser.connect(this.audioContext.destination);


    let playTimer = setInterval(() => {
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
      analyser.getFloatTimeDomainData(array);
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

    this.trackList.forEach((track: Track) => {
      if (track.trackSectionList.length != 0) {

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
  }

  pause() {
    this.audioContext.suspend();
  }

  stop(restart: boolean) {
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

  //동작 안됨.
  repeat(markerStart: number, markerEnd: number) {
    Controller.changeMarkerNumberTime(markerStart);
    const isPause = Controller.getIsPauseState();
    if (isPause === false) {
      this.play();
    }
  }

  fastRewind() {
    let markerTime = Controller.getMarkerTime();

    this.stopAudioSources();
    this.sourceInfo = [];
    const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
    const widthPixel = WidthUtil.getPerPixel(QUANTUM * 1000, maxTrackPlayTime);
    Controller.setMarkerWidth(-widthPixel);
    Controller.pauseChangeMarkerNumberTime(-QUANTUM);
    Controller.changePlayStringTime(-QUANTUM * 1000);

    const isPause = Controller.getIsPauseState();

    if (isPause) {
      return;
    }

    this.trackList.forEach((track: Track) => {
      if (track.trackSectionList.length != 0) {

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
            if (markerTime - QUANTUM < 0) waitTime = 0;
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
  }

  fastForward() {
    let markerTime = Controller.getMarkerTime();

    this.stopAudioSources();
    this.sourceInfo = [];
    const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
    const widthPixel = WidthUtil.getPerPixel(QUANTUM * 1000, maxTrackPlayTime);
    Controller.setMarkerWidth(widthPixel);
    Controller.pauseChangeMarkerNumberTime(QUANTUM);
    Controller.changePlayStringTime(QUANTUM * 1000);

    const isPause = Controller.getIsPauseState();
    if (isPause) {
      //일시정지상태였다면 점프만 해두고 시작안하면 되니까....
      return;
    }

    this.trackList.forEach((track: Track) => {
      if (track.trackSectionList.length != 0) {

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
  }

  skipNext() {
    try {
      this.audioContext.close();
      this.audioContext = new AudioContext();
      this.audioContext.suspend();

      //loop가 있든 말든 상관없이 맨 마지막에 멈추게 하는 게 구현은 편할 듯.
      Controller.changeIsPauseState(true);

      setTimeout(() => {
        //수정 필요.
        //마지막 시간(5분)
        Controller.changeMarkerPlayStringTime(300);
        //마커 시간을 맨 끝으로
        Controller.changeMarkerNumberTime(300);
        //마커 길이를 맨 끝으로
        Controller.setMarkerWidth(500);
      }, TIMER_TIME + 1);
    }
    catch (e) {
      console.log(e);
    }
  }
}

const playbackTool = new PlaybackToolClass();

export default playbackTool;