import './PlaybackTools.scss';
import { EventUtil, PlayBarUtil } from '@util';
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

    //TODO: 다른 ts로 옮기기.. 어디 옮겨야 할 지 모르겠음.
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

      //옮기기
      this.audioContext = new AudioContext();
      this.isPause = Controller.getIsPauseState();
      this.trackList = [];
      this.sourceList = [];
      this.sourceInfo = [];
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

        this.play();
        this.playTimer();
      } else {
        this.isPause = true;
        Controller.changeIsPauseState(true);

        this.iconlist[0] = 'play';

        this.pause();
      }
      this.render();
    }

    audioStopListener() {
      if (this.trackList.length == 0) return;

      this.isPause = true;
      Controller.changeIsPauseState(true);

      this.iconlist[0] = 'play';

      this.stop();
      this.render();
    }

    audioRepeatListener() {
      if (this.trackList.length == 0) return;
    }

    audioFastRewindListener() {
      if (this.trackList.length == 0) return;

      if(this.isPause === true){        
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
      if(this.isPause === true){        
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

    playTimer() {
      let playTimer = setInterval(() => {
        if (Controller.getIsPauseState()) {
          clearInterval(playTimer);
        }
        const widthPixel = PlayBarUtil.getSomePixel(TIMER_TIME);
        Controller.setMarkerWidth(widthPixel);
        Controller.changePlayTime(TIMER_TIME);
        Controller.pauseChangeMarkerTime(TIMER_TIME/1000);
      }, TIMER_TIME);
    }

    play(): void {      
      const markerTime = Controller.getMarkerTime();
      
      this.stopAudioSources();
      this.sourceInfo = [];

      this.trackList.forEach((track: Track) => {
        if (track.trackSectionList.length != 0) {
          track.trackSectionList.forEach((trackSection: TrackSection, idx: number) => {
            this.updateSourceInfo(trackSection.sourceId, trackSection.trackId, trackSection.id);
            const sourceIdx = this.sourceInfo.length - 1;
 
            //when:얼마나 있다가 시작할 것인지, offset:음원을 몇 초에서 시작할 것인지, duration:몇 초 도안 재생할 것인지
            let when: number = 0;
            let offset: number = 0;
            let duration: number = 0;
            let diff: number = 0;

            if (markerTime <= trackSection.trackStartTime) {
              when = this.audioContext.currentTime + trackSection.trackStartTime - markerTime;
              offset = trackSection.audioStartTime;
              duration = trackSection.length;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(when, offset);
            } else if (trackSection.trackStartTime + trackSection.length < markerTime) {
              //재생되지 않는 부분
            } else {
              when = 0;
              diff = markerTime - trackSection.trackStartTime;
              offset = trackSection.audioStartTime + diff;
              duration = trackSection.length - diff;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(when, offset, duration);
            }
          });
        }
      });
      this.audioContext.resume();
    }

    pause() {
      this.audioContext.suspend();      
    }

    stop() {
      this.audioContext.close();
      this.audioContext = new AudioContext();
      this.audioContext.suspend();
      
      //setInterval에서 멈췄는지를 확인하는 시간 간격이 있어서
      //정지 버튼을 누른 후에도 시간이 흘러가는 문제가 있어
      //그 시간간격보다 조금 흐른 후 호출헤서 완전히 0이 되도록 함.
      setTimeout(()=>{
        Controller.resetPlayTime(0); 

        //원하는 시간으로 바로 바꿔주는 기능이 cursorChangeMarkerTime이라서
        //이름과는 맞지 않지만 사용함.
        Controller.cursorChangeMarkerTime(0); //재생 시간을 0으로
        Controller.setMarkerWidthToZero(); //마커의 위치를 맨 앞으로
      }, TIMER_TIME+1);
    }

    fastRewind() {
      let markerTime = Controller.getMarkerTime();

      this.stopAudioSources();
      this.sourceInfo = [];

      const widthPixel = PlayBarUtil.getSomePixel(QUANTUM * 1000);
      Controller.setMarkerWidth(-widthPixel); //마커 위치 변경
      Controller.pauseChangeMarkerTime(-QUANTUM); //마커 시간 변경
      Controller.changePlayTime(-QUANTUM * 1000);

      this.trackList.forEach((track: Track) => {
        if (track.trackSectionList.length != 0) {
          track.trackSectionList.forEach((trackSection: TrackSection, idx: number) => {
            this.updateSourceInfo(trackSection.sourceId, trackSection.trackId, trackSection.id);

            //when:얼마나 있다가 시작할 것인지, offset:음원을 몇 초에서 시작할 것인지, duration:몇 초 도안 재생할 것인지
            let when: number = 0;
            let offset: number = 0;
            let duration: number = 0;
            let diff: number = 0;
            const sourceIdx = this.sourceInfo.length - 1;

            if (markerTime - QUANTUM <= trackSection.trackStartTime) {
              //건너뛰었는데 재생이 아니지만 시간이 흐르면 재생 될 때
              //재생 중이었는데 재생을 기다리게 된 때와 재생을 기다리고 있었는데 더 기다리게 된 두 개의 경우.
              when = this.audioContext.currentTime + trackSection.trackStartTime - markerTime + QUANTUM;
              offset = trackSection.audioStartTime;
              duration = trackSection.length;
              
              this.sourceInfo[sourceIdx].bufferSourceNode.start(when, offset);
            }
            else if(trackSection.trackStartTime<=markerTime- QUANTUM && markerTime <=trackSection.trackStartTime+trackSection.length)
            {
              //재생 중이었는데 또 재생일 때
              diff = markerTime - trackSection.trackStartTime - QUANTUM;
              when=0;
              offset = trackSection.audioStartTime + diff;
              duration = trackSection.length - diff;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(when, offset);
            }
            else if( markerTime - QUANTUM <= trackSection.trackStartTime+ trackSection.length  && trackSection.trackStartTime + trackSection.length <= markerTime) {              
              //재생 중이 아니었는데 건너뛰어서 재생이 됐을 때
              diff = markerTime - QUANTUM - trackSection.trackStartTime;
              when = 0;
              offset = trackSection.audioStartTime + diff;
              duration = trackSection.length - diff;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(when, offset);
            }
            else {
              //재생 구간을 벗어난 경우
            }
          });
        }
      });
      this.audioContext.resume();
    }

    fastForward() {
      let markerTime = Controller.getMarkerTime();

      //파기하고 다시 시작
      this.stopAudioSources();
      this.sourceInfo = [];

      const widthPixel = PlayBarUtil.getSomePixel(QUANTUM * 1000);
      Controller.setMarkerWidth(widthPixel); //마커 위치 변경
      Controller.pauseChangeMarkerTime(QUANTUM); //마커 시간 변경
      Controller.changePlayTime(QUANTUM * 1000);

      this.trackList.forEach((track: Track) => {
        if (track.trackSectionList.length != 0) {
          track.trackSectionList.forEach((trackSection: TrackSection, idx: number) => {
            this.updateSourceInfo(trackSection.sourceId, trackSection.trackId, trackSection.id);

            //when:얼마나 있다가 시작할 것인지, offset:음원을 몇 초에서 시작할 것인지, duration:몇 초 도안 재생할 것인지
            let when: number = 0;
            let offset: number = 0;
            let duration: number = 0;
            let diff: number = 0;
            const sourceIdx = this.sourceInfo.length - 1;

            if (markerTime + QUANTUM <= trackSection.trackStartTime) {
              //건너뛰었지만 재생이 아니지만 시간이 흐르면 재생 될 때
              when = this.audioContext.currentTime + trackSection.trackStartTime - (markerTime + QUANTUM);
              offset = trackSection.audioStartTime;
              duration = trackSection.length;
              
              this.sourceInfo[sourceIdx].bufferSourceNode.start(when, offset);
            }
            else if(trackSection.trackStartTime<=markerTime && markerTime + QUANTUM <=trackSection.trackStartTime+trackSection.length)
            {
              //재생 중이었는데 또 재생일 때
              diff = markerTime - trackSection.trackStartTime + QUANTUM;
              when = 0;
              offset = trackSection.audioStartTime + diff;
              duration = trackSection.length - diff;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(when, offset);
            }
            else if(markerTime <= trackSection.trackStartTime && trackSection.trackStartTime <=markerTime+QUANTUM) {
              //재생 중이 아니었는데 건너뛰어서 재생이 됐을 때
              diff = markerTime + QUANTUM - trackSection.trackStartTime;
              when = 0;
              offset = trackSection.audioStartTime + diff;
              duration = trackSection.length - diff;

              this.sourceInfo[sourceIdx].bufferSourceNode.start(when, offset);
            }
            else {
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
export {};
