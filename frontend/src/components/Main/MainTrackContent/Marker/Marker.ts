import './Marker.scss';
import { storeChannel } from '@store';
import { StoreChannelType } from '@types';
import { Controller, ZoomController } from '@controllers';

(() => {
  const Marker = class extends HTMLElement {
    private markerElement: HTMLElement | null;
    constructor() {
      super();
      this.markerElement = null;
    }

    connectedCallback(): void {
      this.render();
      this.initElement();
      this.initMarkerPosition();
      this.subscribe();
    }

    render(): void {
      this.innerHTML = `
            <div class='marker'></div>
        `;
    }

    initElement() {
      this.markerElement = this.querySelector('.marker');
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.CURRENT_POSITION_CHANNEL, this.updateMarkerPosition, this);
      storeChannel.subscribe(StoreChannelType.RESET_MARKER_POSITION_CHANNEL, this.changeMarkerPosition, this);
      storeChannel.subscribe(StoreChannelType.CHANGE_TRACK_CHANNEL, this.changeTrackObserverCallback, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.CURRENT_POSITION_CHANNEL, this.updateMarkerPosition, this);
      storeChannel.unsubscribe(StoreChannelType.RESET_MARKER_POSITION_CHANNEL, this.changeMarkerPosition, this);
      storeChannel.unsubscribe(StoreChannelType.CHANGE_TRACK_CHANNEL, this.changeTrackObserverCallback, this);
    }

    initMarkerPosition(): void {
      const markerTime = Controller.getMarkerTime();
      const pixelPerSecond = ZoomController.getCurrentPixelPerSecond();
      if (!this.markerElement) return;

      this.markerElement.style.left = `${markerTime * pixelPerSecond}px`;
    }

    changeMarkerPosition(newCurrentPosition): void {
      if (!this.markerElement) return;

      this.markerElement.style.left = `${newCurrentPosition}px`;
    }

    changeTrackObserverCallback(): void {
      const scrollAreaElement = document.querySelector('.audi-main-audio-track-scroll-area');
      if (!scrollAreaElement || !this.markerElement) return;
      this.markerElement.style.height = `${scrollAreaElement.scrollHeight}px`;
    }

    updateMarkerPosition(newCurrentPosition): void {
      const markerElement: HTMLElement | null = document.querySelector('.marker');

      if (!markerElement) return;

      const prevCurrentPosition = Number(markerElement?.style.left.split('px')[0]);
      let currentPosition = prevCurrentPosition + newCurrentPosition;
      if (currentPosition < 0) currentPosition = 0;
      markerElement.style.left = `${currentPosition}px`;
    }
  };
  customElements.define('audi-marker', Marker);
})();

export { };
