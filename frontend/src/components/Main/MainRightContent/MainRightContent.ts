import './MainRightContent.scss';
import { Track } from '@model';
import { Controller } from '@controllers';
import { EventUtil, MarkerEventUtil } from '@util';
import { EventType, EventKeyType, StoreChannelType } from '@types';
import { storeChannel } from "@store";

(() => {
  const MainRightContent = class extends HTMLElement {
    private trackList: Track[];
    private mainAudioTrackContainerEventZone: HTMLElement | null;
    private defaultStartX: number;
    private markerElement: HTMLElement | null;
    private mainWidth: number;
    private maxTrackPlayTime: number;

    constructor() {
      super();
      this.trackList = Controller.getTrackList();
      this.mainAudioTrackContainerEventZone = null;
      this.defaultStartX = 0;
      this.markerElement = null;
      this.mainWidth = 0;
      this.maxTrackPlayTime = Controller.getMaxTrackPlayTime();
    }

    connectedCallback(): void {
      this.init();
    }

    init(): void {
      this.render();
      this.initElement();
      this.initEvent();
    }

    render(): void {
      this.innerHTML = `
            <section class="audi-main-audio-track-container" event-key=${EventKeyType.FOCUS_RESET_CLICK}>
                <div>
                    <div class="audi-main-audio-track-scroll-area">
                        <audi-marker></audi-marker>
                        <audi-playbar></audi-playbar>
                        ${this.getTrackList()}
                    </div>
                    <div class='audi-main-audio-track-container-event-zone hide' event-key=${EventKeyType.AUDIO_TRACK_CONTAINER_MULTIPLE}></div>
                </div>
                <div>
                    <audi-zoom-bar></audi-zoom-bar>
                    <audi-audio-meter></audi-audio-meter>
                </div>
            </section>
        `;
    }

    initElement(): void {
      const playbarElement = document.querySelector('.playbar');
      this.mainAudioTrackContainerEventZone = document.querySelector('.audi-main-audio-track-container-event-zone');

      if(!playbarElement || !this.mainAudioTrackContainerEventZone) return;

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
          MarkerEventUtil.mousemoveMarkerListener(this.mainAudioTrackContainerEventZone, this.defaultStartX, this.mainWidth, this.maxTrackPlayTime),
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

    getTraclOptions(): string {
      return this.trackList.reduce((acc, cur, idx) =>
        acc += `<audi-track-option data-id=${idx} data-track-id=${cur.id}></audi-track-option>`, "");
    }

    getTrackList(): string {
      return this.trackList.reduce((acc, cur, idx) =>
        acc += `<audi-audio-track data-id=${cur.id}></audi-audio-track>`, "");
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.MAX_TRACK_PLAY_TIME_CHANNEL, this.maxTrackPlayTimeObserverCallback, this);
    }

    maxTrackPlayTimeObserverCallback(maxTrackPlayTime: number): void {
      this.maxTrackPlayTime = maxTrackPlayTime;
      this.initEvent();
    }
  };

  customElements.define('audi-main-right-content', MainRightContent);
})();

export { };
