import './PlaybackTools.scss';
import { EventUtil, PlayBarUtil, AudioUtil, WidthUtil } from '@util';
import { EventType, EventKeyType, StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Controller } from '@controllers';

(() => {
  const PlaybackTools = class extends HTMLElement {
    public iconlist: string[];
    public eventKeyList: string[];
    
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
      Controller.audioPlayOrPause(); 
    }

    audioStopListener() {
      Controller.audioStop();
      this.iconlist[0] = 'play';

      this.render();
    }

    audioRepeatListener() {
      Controller.audioRepeat();
    }

    audioFastRewindListener() {
      Controller.audioFastRewind();
    }

    audioFastForwardListener() {
      Controller.audioFastForward();
    }

    audioSkipPrevListener() {
      Controller.audioSkipPrev();
    }

    audioSkipNextListener() {
      Controller.audioSkipNext();
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.PLAY_OR_PAUSE_CHANNEL, this.changePlayOrPauseIcon, this);
      storeChannel.subscribe(StoreChannelType.IS_REPEAT_CHANNEL, this.changeRepeatIconColor, this);//repeat에 대한 정보를 render를 한다고 하면..
    }

    changePlayOrPauseIcon(iconType: number) {
      if(iconType === 0) {
        return;
      }
      // const isRepeat = Controller.getIsRepeatState();
      // if(isRepeat) this.changeRepeatIconColor(isRepeat);

      else if(iconType === 1) {
        this.iconlist[0] = 'pause';
      }
      else if(iconType === 2) {
        this.iconlist[0] = 'play';
      }
      this.render();
    }

    //수정 예정
    changeRepeatIconColor(isRepeat: boolean) {
      const repeatIcon = document.querySelector('#repeat');
      if(!repeatIcon) return;

      if(isRepeat){
        repeatIcon.classList.add('clicked');
      }
      else {
        repeatIcon.classList.remove('clicked');
      }
    }
  };
  customElements.define('audi-playback-tools', PlaybackTools);
})();

export { };
