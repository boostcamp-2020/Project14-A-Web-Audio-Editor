import { Track } from '@model';
import { Controller } from '@controllers';
import { EventUtil, MarkerEventUtil } from '@util';
import { EventType, EventKeyType } from '@types';

import './Main.scss';

(() => {
  const Main = class extends HTMLElement {
    private trackList: Track[];
    private mainAudioTrackContainerEventZone: HTMLElement | null;
    private defaultStartX: number;
    private markerElement: HTMLElement | null;
    private mainWidth: number;

    constructor() {
      super();
      this.trackList = Controller.getTrackList();
      this.mainAudioTrackContainerEventZone = null;
      this.defaultStartX = 0;
      this.markerElement = null;
      this.mainWidth = 0;
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
                  <main class="audi-main-container">
                    <div class="audi-main-content">
                        <aside>
                            <audi-side-bar></audi-side-bar>
                        </aside>
                        <section class="audi-main-audio-track-container">
                            <audi-marker></audi-marker>
                            <audi-playbar></audi-playbar>
                            ${this.getTrackList()}
                            <div class='audi-main-audio-track-container-event-zone hide' event-key=${
                              EventKeyType.AUDIO_TRACK_CONTAINER_MULTIPLE
                            }></div>
                        </section>
                    </div>
                  </main>
              `;
    }

    initElement(): void {
      const playbarElement = document.querySelector('.playbar');
      this.mainWidth = playbarElement?.getBoundingClientRect().right - playbarElement?.getBoundingClientRect().left;
      this.mainAudioTrackContainerEventZone = document.querySelector('.audi-main-audio-track-container-event-zone');
      this.defaultStartX = this.mainAudioTrackContainerEventZone?.getBoundingClientRect().left;
      this.markerElement = document.querySelector('.marker');
    }

    initEvent(): void {
      if (!this.markerElement) return;

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.mousemove, EventType.click],
        eventKey: EventKeyType.AUDIO_TRACK_CONTAINER_MULTIPLE,
        listeners: [
          MarkerEventUtil.mousemoveMarkerListener(this.mainAudioTrackContainerEventZone, this.defaultStartX, this.mainWidth),
          MarkerEventUtil.clickMarkerListener(this.markerElement)
        ],
        bindObj: this.mainAudioTrackContainerEventZone
      });
    }

    getTrackList(): string {
      return this.trackList.reduce((acc, cur, idx) => (acc += `<audi-audio-track data-id=${idx}></audi-audio-track>`), '');
    }
  };

  customElements.define('audi-main', Main);
})();

export {};
