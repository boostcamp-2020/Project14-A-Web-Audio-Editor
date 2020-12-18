import { Track } from '@model';
import { Controller } from '@controllers';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';
import './MainTrackOptionListArea.scss';

(() => {
  const MainTrackOptionListArea = class extends HTMLElement {
    private trackList: Track[];

    constructor() {
      super();
      this.trackList = Controller.getTrackList();
    }

    connectedCallback(): void {
      this.render();
      this.subscribe();
    }

    render(): void {
      this.innerHTML = `
            <div class="audi-main-track-option-area">  
              ${this.getTrackOptions()}
            </div>
        `;
    }

    getTrackOptions(): string {
      return this.trackList.reduce((acc, cur, idx) =>
        acc += `<audi-track-option data-id=${idx} data-track-id=${cur.id}></audi-track-option>`, "");
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.TRACK_LIST_CHANNEL, this.trackListObserverCallback, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.TRACK_LIST_CHANNEL, this.trackListObserverCallback, this);
    }

    trackListObserverCallback(newTrackList: Track[]): void {
      try {
        this.trackList = newTrackList;
        this.render();
      } catch (e) {
        console.log(e);
      }
    }
  };

  customElements.define('audi-main-track-option-list-area', MainTrackOptionListArea);
})();

export { };
