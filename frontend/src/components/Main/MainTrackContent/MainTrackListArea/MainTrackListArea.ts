import './MainTrackListArea.scss';
import { Track } from '@model';
import { Controller } from '@controllers';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';

(() => {
  const MainTrackListArea = class extends HTMLElement {
    private trackList: Track[];

    constructor() {
      super();
      this.trackList = Controller.getTrackList();
    }

    connectedCallback(): void {
      try {
        this.render();
        this.subscribe();
      } catch (e) {
        console.log(e);
      }
    }

    render(): void {
      this.innerHTML = `
                ${this.getTrackList()}
        `;
    }

    getTrackList(): string {
      return this.trackList.reduce((acc, cur, idx) =>
        acc += `<audi-audio-track data-id=${cur.id}></audi-audio-track>`, "");
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

  customElements.define('audi-main-track-list-area', MainTrackListArea);
})();

export { };
