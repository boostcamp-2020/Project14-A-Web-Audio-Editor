import { Controller } from '@controllers';
import './MainControllerContent.scss';
import { StoreChannelType } from '@types'
import { storeChannel } from '@store'

(() => {
  const MainControllerContent = class extends HTMLElement {
    private resizeTimer: NodeJS.Timeout | null;

    constructor() {
      super();
      this.resizeTimer = null;
    }

    connectedCallback(): void {
      this.render();
      this.initEvent();
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

    initEvent(){
      window.addEventListener('resize', this.windowResizeListener.bind(this));
    }

    windowResizeListener(e) {
      if (this.resizeTimer) {
        clearTimeout(this.resizeTimer);
      }

      this.resizeTimer = setTimeout(() => {
        Controller.changeCurrentScrollAmount(0);
        this.render();
        this.initEvent();
      }, 100);
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.ZOOM_RATE_CHANNEL, this.zoomRateObserverCallback, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.ZOOM_RATE_CHANNEL, this.zoomRateObserverCallback, this);
    }

    zoomRateObserverCallback(newZoomRate) {
      this.render();
    }
  };

  customElements.define('audi-main-controller-content', MainControllerContent);
})();

export { };
