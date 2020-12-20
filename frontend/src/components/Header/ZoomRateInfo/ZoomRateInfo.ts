import './ZoomRateInfo.scss'
import { storeChannel } from '@store'
import { StoreChannelType } from '@types'

(() => {
  const ZoomRateInfo = class extends HTMLElement {
    private zoomRateElement: HTMLElement | null;
    constructor() {
      super();
      this.zoomRateElement = null;
    }

    connectedCallback() {
      this.render();
      this.initElement();
      this.subscribe();
    }

    initElement() {
      this.zoomRateElement = this.querySelector('.zoom-rate-percentage');
    }

    render() {
      this.innerHTML = `
                <div class="zoom-rate-info">
                  <audi-icon-button id="zoom-rate" icontype="zoomRate" size="32px"></audi-icon-button>
                  <div class="zoom-rate-percentage">100%</div>
                </div>
            `;
    }

    changeZoomRateInfo(newZoomRate): void {
      if (!this.zoomRateElement) return;
      this.zoomRateElement.innerText = `${newZoomRate * 100}%`;
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.ZOOM_RATE_CHANNEL, this.changeZoomRateInfo, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.ZOOM_RATE_CHANNEL, this.changeZoomRateInfo, this);
    }
  };
  customElements.define('audi-zoom-rate-info', ZoomRateInfo);
})()

export { };
