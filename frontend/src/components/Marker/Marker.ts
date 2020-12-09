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
    }

    updateMarkerPosition(newCurrentPosition): void {
      const markerElement: HTMLElement | null = document.querySelector('.marker');

      if (!markerElement) return;

      if (!newCurrentPosition) {
        markerElement.style.left = `${newCurrentPosition}px`;
        return;
      }

      const prevCurrentPosition = Number(markerElement?.style.left.split('px')[0]);
      let currentPosition = prevCurrentPosition + newCurrentPosition;
      if (currentPosition < 0) currentPosition = 0;
      markerElement.style.left = `${currentPosition}px`;
    }
  };

  customElements.define('audi-marker', Marker);
})();

export {};
