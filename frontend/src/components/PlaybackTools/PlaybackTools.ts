import './PlaybackTools.scss';
import { EventUtil, PlayBarUtil } from '@util';
import { EventType, EventKeyType, StoreChannelType } from '@types';
import { Source, Track, TrackSection, AudioSourceInfoInTrack } from '@model';
import { storeChannel } from '@store';
import { Controller } from '@controllers';

const TIMER_TIME = 34;

(() => {
  const PlaybackTools = class extends HTMLElement {
    public iconlist: string[];
    public eventKeyList: string[];

    //TODO: 다른 ts로 옮기기
    private audioContext: AudioContext;
    private isPause: boolean;
    private trackList: Track[];
    private sourceList: Source[];
    private sourceInfo: AudioSourceInfoInTrack[];
    public markerTime: number;

    private passedTime: number;

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

      //옮기기
      this.audioContext = new AudioContext();
      this.isPause = Controller.getIsPauseState();
      this.trackList = [];
      this.sourceList = [];
      this.sourceInfo = [];
      this.markerTime = 0;
      this.passedTime = 0;
    }

    connectedCallback() {
      this.render();
      this.initEvent();
      this.subscribe();
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
      if (this.trackList.length == 0) return;

      if (this.isPause) {
        this.isPause = false;
        Controller.changeIsPauseState(false);

        this.iconlist[0] = 'pause';

        const markerTime = Controller.getMarkerTime();
        this.play(markerTime);
      } else {
        this.isPause = true;
        Controller.changeIsPauseState(true);

        this.iconlist[0] = 'play';

        this.pause(this.markerTime);
      }
      this.render();
    }

    audioStopListener() {
      if (this.trackList.length == 0) return;
    }

    audioRepeatListener() {
      if (this.trackList.length == 0) return;
    }

    audioFastRewindListener() {
      if (this.trackList.length == 0) return;
    }

    audioFastForwardListener() {
      if (this.trackList.length == 0) return;
    }

    audioSkipPrevListener() {
      if (this.trackList.length == 0) return;
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
        } catch (e) {}
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

    play(markerTime: number): void {
      this.stopAudioSources();
      this.sourceInfo = [];

      this.trackList.forEach((track: Track) => {
        if (track.trackSectionList.length != 0) {
          track.trackSectionList.forEach((trackSection: TrackSection, idx: number) => {
            this.updateSourceInfo(trackSection.sourceId, trackSection.trackId, trackSection.id);

            //when:얼마나 있다가 시작할 것인지, offset:음원을 몇 초에서 시작할 것인지, duration:몇 초 도안 재생할 것인지
            let when: number = 0;
            let offset: number = 0;
            let duration: number = 0;
            let diff: number = 0;

            if (markerTime <= trackSection.trackStartTime) {
              when = this.audioContext.currentTime + trackSection.trackStartTime - markerTime;
              offset = trackSection.audioStartTime;
              duration = trackSection.length;

              const sourceIdx = this.sourceInfo.length - 1;
              this.sourceInfo[sourceIdx].bufferSourceNode.start(when, offset);
            } else if (trackSection.trackStartTime + trackSection.length < markerTime) {
              //재생되지 않는 부분
            } else {
              when = 0;
              diff = markerTime - trackSection.trackStartTime;
              offset = trackSection.audioStartTime + diff;
              duration = trackSection.length - diff;

              const sourceIdx = this.sourceInfo.length - 1;
              this.sourceInfo[sourceIdx].bufferSourceNode.start(when, offset, duration);
            }
          });
        }
      });
      this.audioContext.resume();
      this.passedTime = this.audioContext.currentTime;

      let playTimer = setInterval(() => {
        if (Controller.getIsPauseState()) {
          clearTimeout(playTimer);
        }
        const widthPixel = PlayBarUtil.getSomePixel(TIMER_TIME);
        Controller.setMarkerWidth(widthPixel);
        Controller.changePlayTime(TIMER_TIME);
      }, TIMER_TIME);
    }

    pause(markerTime: number) {
      this.markerTime = markerTime;
      this.audioContext.suspend();

      const timeDiff = this.audioContext.currentTime - this.passedTime;
      Controller.pauseChangeMarkerTime(timeDiff);
    }
  };
  customElements.define('audi-playback-tools', PlaybackTools);
})();
export {};
