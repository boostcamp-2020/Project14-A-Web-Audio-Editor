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
      markerElement.style.left = `${newCurrentPosition}px`;
    }
  };

  customElements.define('audi-marker', Marker);
})();

export {};
