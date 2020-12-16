import './MainControllerContent.scss';
import { StoreChannelType } from '@types'
import { storeChannel } from '@store'

(() => {
  const MainControllerContent = class extends HTMLElement {

    constructor() {
      super();
    }

    connectedCallback(): void {
      this.render();
      this.subscribe();
    }

    render(): void {
      this.innerHTML = `
        <audi-track-menu></audi-track-menu>
        <div class="audi-main-right-bottom">
          <audi-zoom-bar></audi-zoom-bar>
          <audi-audio-meter></audi-audio-meter>
        </div>
        `;
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.ZOOM_RATE_CHANNEL, this.zoomRateObserverCallback, this);
    }

    zoomRateObserverCallback(newZoomRate) {
      this.render();
    }
  };

  customElements.define('audi-main-controller-content', MainControllerContent);
})();

export { };
