import './PlaybackTools.scss';
import { EventUtil, PlayBarUtil, AudioUtil, WidthUtil } from '@util';
import { EventType, EventKeyType, StoreChannelType } from '@types';
import { Source, Track, TrackSection, AudioSourceInfoInTrack } from '@model';
import { storeChannel } from '@store';
import { Controller } from '@controllers';

const TIMER_TIME = 34;
const QUANTUM = 3;

(() => {
  const PlaybackTools = class extends HTMLElement {
    public iconlist: string[];
    public eventKeyList: string[];

    private audioContext: AudioContext;
    private isPause: boolean;
    private trackList: Track[];
    private sourceList: Source[];
    private sourceInfo: AudioSourceInfoInTrack[];

    constructor() {
      super();
      this.iconlist = ['play', 'stop', 'repeat', 'fastRewind', 'fastForward', 'skipPrev', 'skipNext'];
      this.eventKeyList = [
        EventKeyType.AUDIO_PLAY_OR_PAUSE,
        EventKeyType.AUDIO_STOP,
        EventKeyType.AUDIO_REPEAT,
        EventKeyType.AUDIO_FAST_REWIND,
        EventKeyType.AUDIO_FAST_FORWARD,
        EventKeyType.AUDIO_SKIP_PREV,
        EventKeyType.AUDIO_SKIP_NEXT
      ];

      this.audioContext = new AudioContext();
      this.isPause = true;
      this.trackList = [];
      this.sourceList = [];
      this.sourceInfo = [];
    }

    connectedCallback() {
      this.render();
      this.init();
      this.initEvent();
      this.subscribe();
    }

    init(){
      this.isPause = Controller.getIsPauseState();
      this.trackList = Controller.getTrackList();
      this.sourceList = Controller.getSourceList();
    }

    render() {
      this.innerHTML = `
                <div class="playback-tools">
                  ${this.iconlist.reduce(
        (acc, icon, idx) =>
          acc +
          `<audi-icon-button id="${icon}" color="white" icontype="${icon}" size="32px" data-event-key="${this.eventKeyList[idx]}"></audi-icon-button>`,
        ''
      )}
                </div>
            `;
    }

    initEvent() {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.AUDIO_PLAY_OR_PAUSE,
        listeners: [this.audioPlayOrPauseListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.AUDIO_STOP,
        listeners: [this.audioStopListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.AUDIO_REPEAT,
        listeners: [this.audioRepeatListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.AUDIO_FAST_REWIND,
        listeners: [this.audioFastRewindListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.AUDIO_FAST_FORWARD,
        listeners: [this.audioFastForwardListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.AUDIO_SKIP_PREV,
        listeners: [this.audioSkipPrevListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.AUDIO_SKIP_NEXT,
        listeners: [this.audioSkipNextListener],
        bindObj: this
      });
    }

    audioPlayOrPauseListener() {
      try{
        if (this.trackList.length == 0) return;

        if (this.isPause) {
          this.isPause = false;
          Controller.changeIsPauseState(false);

          this.iconlist[0] = 'pause';

          this.play();
          this.playTimer()
        } else{
          this.isPause = true;
          Controller.changeIsPauseState(true);
          
          this.iconlist[0] = 'play';

          this.pause();
        }
        this.render();
      }catch(e){
        console.log(e);
      }
    }

    audioStopListener() {
      if (this.trackList.length == 0) return;

      this.isPause = true;
      Controller.changeIsPauseState(true);

      this.iconlist[0] = 'play';

      this.stop(false);
      this.render();
    }

    audioRepeatListener() {
      if (this.trackList.length == 0) return;
    }

    audioFastRewindListener() {
      if (this.trackList.length == 0) return;

      if (this.isPause) {
        this.isPause = false;
        Controller.changeIsPauseState(false);

        this.iconlist[0] = 'pause';

        this.render();
        this.playTimer();
      }

      this.fastRewind();
    }

    audioFastForwardListener() {
      if (this.trackList.length == 0) return;

      //일지성지 상태에서 건너뛰기 버튼을 눌렀을 때
      if (this.isPause) {
        this.isPause = false;
        Controller.changeIsPauseState(false);

        this.iconlist[0] = 'pause';

        this.render();
        this.playTimer();
      }

      this.fastForward();
    }

    audioSkipPrevListener() {
      if (this.trackList.length == 0) return;

      this.stop(true);
    }

    audioSkipNextListener() {
      if (this.trackList.length == 0) return;
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
          };
          clearInterval(playTimer);
        }
        const widthPixel = WidthUtil.getPerPixel(TIMER_TIME);
        Controller.setMarkerWidth(widthPixel);
        Controller.changePlayTime(TIMER_TIME);
        Controller.pauseChangeMarkerTime(TIMER_TIME / 1000);

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
      }, TIMER_TIME);
    }

    play(): void {
      const markerTime = Controller.getMarkerTime();

      this.stopAudioSources();
      this.sourceInfo = [];

      this.trackList.forEach((track: Track) => {
        if (track.trackSectionList.length != 0) {
          track.trackSectionList.forEach((trackSection: TrackSection) => {
            this.updateSourceInfo(trackSection.sourceId, trackSection.trackId, trackSection.id);
            const sourceIdx = this.sourceInfo.length - 1;

            let waitTime: number = 0;
            let audioStartTime: number = 0;
            let playDuration: number = 0;
            let diff: number = 0;

            if (markerTime <= trackSection.trackStartTime) {
              waitTime = this.audioContext.currentTime + trackSection.trackStartTime - markerTime;
              audioStartTime = trackSection.audioStartTime;
              playDuration = trackSection.length;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
            } else if (trackSection.trackStartTime + trackSection.length < markerTime) {
              //재생되지 않는 부분
            } else {
              waitTime = 0;
              diff = markerTime - trackSection.trackStartTime;
              audioStartTime = trackSection.audioStartTime + diff;
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
      this.audioContext.close();
      this.audioContext = new AudioContext();
      this.audioContext.suspend();

      setTimeout(() => {
        Controller.changeMarkerPlayStringTime(0);
        Controller.changeCursorMarkerNumberTime(0);
        Controller.setMarkerWidth(0);
        
        if (restart) {
          this.play();
        }
      }, TIMER_TIME + 1);
    }

    fastRewind() {
      let markerTime = Controller.getMarkerTime();

      this.stopAudioSources();
      this.sourceInfo = [];

      const widthPixel = WidthUtil.getPerPixel(QUANTUM * 1000);
      Controller.setMarkerWidth(-widthPixel);
      Controller.pauseChangeMarkerNumberTime(-QUANTUM);
      Controller.changePlayStringTime(-QUANTUM * 1000);

      this.trackList.forEach((track: Track) => {
        if (track.trackSectionList.length != 0) {
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
              audioStartTime = trackSection.audioStartTime;
              playDuration = trackSection.length;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
            }
            else if (trackSection.trackStartTime <= markerTime - QUANTUM && markerTime <= trackSection.trackStartTime + trackSection.length) {
              diff = markerTime - trackSection.trackStartTime - QUANTUM;
              waitTime = 0;
              audioStartTime = trackSection.audioStartTime + diff;
              playDuration = trackSection.length - diff;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
            } else if (
              markerTime - QUANTUM <= trackSection.trackStartTime + trackSection.length &&
              trackSection.trackStartTime + trackSection.length <= markerTime
            ) {
              diff = markerTime - QUANTUM - trackSection.trackStartTime;
              waitTime = 0;
              audioStartTime = trackSection.audioStartTime + diff;
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

      const widthPixel = WidthUtil.getPerPixel(QUANTUM * 1000);
      Controller.setMarkerWidth(widthPixel);
      Controller.pauseChangeMarkerNumberTime(QUANTUM);
      Controller.changePlayStringTime(QUANTUM * 1000);

      this.trackList.forEach((track: Track) => {
        if (track.trackSectionList.length != 0) {
          track.trackSectionList.forEach((trackSection: TrackSection) => {
            this.updateSourceInfo(trackSection.sourceId, trackSection.trackId, trackSection.id);

            let waitTime: number = 0;
            let audioStartTime: number = 0;
            let playDuration: number = 0;
            let diff: number = 0;
            const sourceIdx = this.sourceInfo.length - 1;

            if (markerTime + QUANTUM <= trackSection.trackStartTime) {
              waitTime = this.audioContext.currentTime + trackSection.trackStartTime - (markerTime + QUANTUM);
              audioStartTime = trackSection.audioStartTime;
              playDuration = trackSection.length;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
            } else if (trackSection.trackStartTime <= markerTime && markerTime + QUANTUM <= trackSection.trackStartTime + trackSection.length) {
              diff = markerTime - trackSection.trackStartTime + QUANTUM;
              waitTime = 0;
              audioStartTime = trackSection.audioStartTime + diff;
              playDuration = trackSection.length - diff;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(waitTime, audioStartTime, playDuration);
            } else if (markerTime <= trackSection.trackStartTime && trackSection.trackStartTime <= markerTime + QUANTUM) {
              diff = markerTime + QUANTUM - trackSection.trackStartTime;
              waitTime = 0;
              audioStartTime = trackSection.audioStartTime + diff;
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
  };
  customElements.define('audi-playback-tools', PlaybackTools);
})();
export { };