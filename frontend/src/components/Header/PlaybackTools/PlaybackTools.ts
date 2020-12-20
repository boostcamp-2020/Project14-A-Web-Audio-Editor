import './PlaybackTools.scss';
import { EventUtil } from '@util';
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
      ${this.iconlist.reduce((acc, icon, idx) => {
        const checkRepeat = Controller.getIsRepeatState() && icon === 'repeat';
        return (
          acc +
          `<audi-icon-button id="${icon}" class="${checkRepeat ? 'clicked' : ''
          } delegation"  icontype="${icon}" size="32px" event-key="${this.eventKeyList[idx]}"></audi-icon-button>`
        );
      }, '')}
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
      this.changePlaybarMarkerClass();
      Controller.audioPlayOrPause();
    }

    audioStopListener() {
      Controller.audioStop();
      this.iconlist[0] = 'play';

      this.changePlaybarMarkerClass();
      this.render();
    }

    audioRepeatListener() {
      Controller.audioRepeat();

      this.changePlaybarMarkerClass();
      this.render();
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
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.PLAY_OR_PAUSE_CHANNEL, this.changePlayOrPauseIcon, this);
    }

    changePlayOrPauseIcon(iconType: number) {
      if (iconType === 0) {
        return;
      } else if (iconType === 1) {
        this.iconlist[0] = 'pause';
      } else if (iconType === 2) {
        this.iconlist[0] = 'play';
      }
      this.render();
    }

    changePlaybarMarkerClass(): void {
      const isRepeat = Controller.getIsRepeatState();

      const playbarMarkerLeftElement = document.getElementById('playbar-marker-left');
      const playbarMarkerRightElement = document.getElementById('playbar-marker-right');
      const playbarMarkerBlurElement = document.getElementById('playbar-marker-blur-zone');
      const playbarEventZoneElement = document.querySelector('.playbar-event-zone');
      const scrollAreaElement = document.querySelector('.audi-main-audio-track-scroll-area');

      if (!playbarEventZoneElement || !scrollAreaElement) return;
      const playbarEventZoneRightX = playbarEventZoneElement.getBoundingClientRect().right;
      const scrollAreaRightX = scrollAreaElement.getBoundingClientRect().right;

      if (!playbarMarkerLeftElement || !playbarMarkerRightElement || !playbarMarkerBlurElement) return;

      if (isRepeat) {
        playbarMarkerLeftElement.classList.remove('hide');
        playbarMarkerRightElement.classList.remove('hide');
        playbarMarkerBlurElement.classList.remove('hide');
      } else {
        playbarMarkerLeftElement.classList.add('hide');
        playbarMarkerRightElement.classList.add('hide');
        playbarMarkerBlurElement.classList.add('hide');
      }

      //TODO: merge후 재구현할 것
      if (playbarEventZoneRightX > scrollAreaRightX) {
        playbarMarkerRightElement.style.left = `${scrollAreaRightX}px`;
      }
    }
  };
  customElements.define('audi-playback-tools', PlaybackTools);
})();

export { };
