import './MainTrackContent.scss';
import { Track } from '@model';
import { Controller } from '@controllers';
import { EventUtil, MarkerEventUtil, TimeUtil, WidthUtil } from '@util';
import { EventType, EventKeyType, StoreChannelType } from '@types';
import { storeChannel } from "@store";

(() => {
  const MainTrackContent = class extends HTMLElement {
    private trackList: Track[];
    private mainAudioTrackContainerEventZone: HTMLElement | null;
    private defaultStartX: number;
    private markerElement: HTMLElement | null;
    private mainWidth: number;
    private maxTrackPlayTime: number;
    private currentScrollAmount: number;

    constructor() {
      super();
      this.trackList = Controller.getTrackList();
      this.defaultStartX = 0;
      this.markerElement = null;
      this.mainWidth = 0;
      this.maxTrackPlayTime = Controller.getMaxTrackPlayTime();
      this.mainAudioTrackContainerEventZone = null;
      this.currentScrollAmount = Controller.getCurrentScrollAmount();
    }

    connectedCallback(): void {
      try {
        this.init();
      } catch (e) {
        console.log(e);
      }
    }

    init(): void {
      this.render();
      this.initElement();
      this.initEvent();
      this.subscribe();
    }

    render(): void {
      this.innerHTML = `
            <section class="audi-main-audio-track-container" event-key=${EventKeyType.FOCUS_RESET_CLICK}>
              <section class="audi-main-track-left">
                <div class="audi-main-before-track-option"></div>
                <audi-main-track-option-list-area></audi-main-track-option-list-area>
              </section>    
              <div class="audi-main-track-right">
                <audi-main-playbar-scroll-area></audi-main-playbar-scroll-area> 
                <audi-main-track-scroll-area></audi-main-track-scroll-area>
                <div class='audi-main-audio-track-container-event-zone hide' event-key=${EventKeyType.AUDIO_TRACK_CONTAINER_MULTIPLE}></div>
              </div>
            </section>
        `;
    }

    initElement(): void {
      const playbarElement = document.querySelector('.playbar');
      this.mainAudioTrackContainerEventZone = document.querySelector('.audi-main-audio-track-container-event-zone');

      if (!playbarElement || !this.mainAudioTrackContainerEventZone) return;

      this.mainWidth = playbarElement?.getBoundingClientRect().right - playbarElement?.getBoundingClientRect().left;
      this.defaultStartX = this.mainAudioTrackContainerEventZone?.getBoundingClientRect().left;
      this.markerElement = document.querySelector('.marker');
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.FOCUS_RESET_CLICK,
        listeners: [this.focusResetListener],
        bindObj: this
      });

      if (!this.markerElement || !this.mainAudioTrackContainerEventZone) return;

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.mousemove, EventType.click],
        eventKey: EventKeyType.AUDIO_TRACK_CONTAINER_MULTIPLE,
        listeners: [
          this.mousemoveMarkerListener,
          MarkerEventUtil.clickMarkerListener(this.markerElement)
        ],
        bindObj: this.mainAudioTrackContainerEventZone
      });
    }

    focusResetListener(e): void {
      const ctrlIsPressed = Controller.getCtrlIsPressed();
      if (!ctrlIsPressed) {
        Controller.resetFocus();
      }
    }

    mousemoveMarkerListener(e): void {
      if (!this.mainAudioTrackContainerEventZone) return;
      const cursorPosition = e.pageX;
      const scrolledCursorPosition = cursorPosition + this.currentScrollAmount;


      const timeOfCursorPosition = TimeUtil.calculateTimeOfCursorPosition(this.defaultStartX, scrolledCursorPosition);
      const [minute, second, milsecond] = TimeUtil.splitTime(timeOfCursorPosition);
      const offesetOfCursorPosition = WidthUtil.getDifferenceWidth(this.defaultStartX, cursorPosition);

      if (minute < 0 && second < 0) return;
      Controller.changeCurrentPosition(offesetOfCursorPosition);
      Controller.changeCursorStringTime(minute, second, milsecond);
      Controller.changeCursorNumberTime(timeOfCursorPosition);
    };

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.MAX_TRACK_PLAY_TIME_CHANNEL, this.maxTrackPlayTimeObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.CURRENT_SCROLL_AMOUNT_CHANNEL, this.currentScrollAmountObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.ZOOM_RATE_CHANNEL, this.zoomRateObserverCallback, this);
    }

    maxTrackPlayTimeObserverCallback(maxTrackPlayTime: number): void {
      try {
        this.maxTrackPlayTime = maxTrackPlayTime;
        this.initEvent();
      } catch (e) {
        console.log(e);
      }
    }

    currentScrollAmountObserverCallback(newCurrentScrollAmount: number): void {
      this.currentScrollAmount = newCurrentScrollAmount;
      this.initEvent();
    }

    zoomRateObserverCallback(newZoomRate) {
      this.render();
      this.initElement();
    }
  };

  customElements.define('audi-main-track-content', MainTrackContent);
})();

export { };
