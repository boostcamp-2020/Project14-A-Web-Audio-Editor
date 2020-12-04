import './Marker.scss';
import { storeChannel } from '@store';
import { StoreChannelType } from '@types';

(() => {
  const Marker = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback(): void {
      this.render();
      this.subscribe();
    }

    render(): void {
      this.innerHTML = `
            <div class='marker'></div>
        `;
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.CURRENT_POSITION_CHANNEL, this.updateMarkerPosition, this);
      storeChannel.subscribe(StoreChannelType.CURRENT_POSITION_ZERO_CHANNEL, this.updateMaerkerPosiionToZero, this);
    }

    updateMarkerPosition(newCurrentPosition): void {
      const markerElement: HTMLElement | null = document.querySelector('.marker');

      if (!markerElement) return;
      const prevCurrentPosition = Number(markerElement?.style.left.split('px')[0]);
      const currentPosition = prevCurrentPosition + newCurrentPosition;
      markerElement.style.left = `${currentPosition}px`;
    }

    //마커 위치를 0으로 초기화.
    updateMaerkerPosiionToZero():void {
      const markerElement: HTMLElement | null = document.querySelector('.marker');
      if (!markerElement) return;
      markerElement.style.left='0px';
    }
  };

  customElements.define('audi-marker', Marker);
})();

export {};
