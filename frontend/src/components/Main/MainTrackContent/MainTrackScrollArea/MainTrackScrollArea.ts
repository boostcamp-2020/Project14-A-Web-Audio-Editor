import './MainTrackScrollArea.scss';
import { ZoomController } from '@controllers';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Track } from '@model'

(() => {
  const MainTrackScrollArea = class extends HTMLElement {
    private trackScrollAreaElement: HTMLDivElement | null;
    private trackOptionListAreaElement: HTMLDivElement | null;

    constructor() {
      super();
      this.trackScrollAreaElement = null;
      this.trackOptionListAreaElement = null;
    }

    connectedCallback(): void {
      try {
        this.render();
        this.initElement();
        this.initEvent();
        this.calculateCurrentPixelPerSecond();
        this.renderScrollAreaContent();
        this.subscribe();
      } catch (e) {
        console.log(e);
      }
    }

    render(): void {
      this.innerHTML = `
            <div class="audi-main-audio-track-scroll-area">
            </div>
        `;
    }

    initElement() {
      this.trackScrollAreaElement = this.querySelector('.audi-main-audio-track-scroll-area');
      this.trackOptionListAreaElement = document.querySelector('.audi-main-track-option-area');
    }

    initEvent() {
      if (!this.trackScrollAreaElement) return;
      this.trackScrollAreaElement.addEventListener('scroll', this.scrollAreaScrollListener.bind(this));

    }

    scrollAreaScrollListener(e) {
      const scrollAmount = e.target.scrollTop;
      this.scrollTrackOptionListArea(scrollAmount);
    }

    scrollTrackOptionListArea(scrollAmount: number) {
      if (!this.trackOptionListAreaElement) return;
      this.trackOptionListAreaElement.scrollTop = scrollAmount;
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
      this.initElement();
      this.initEvent()
    }

    calculateCurrentPixelPerSecond() {
      if (!this.trackScrollAreaElement) return;

      const trackScrollAreaWidth = this.trackScrollAreaElement.getBoundingClientRect().right - this.trackScrollAreaElement.getBoundingClientRect().left;
      const currentDefaultTrackTime = ZoomController.getCurrentDefaultTrackTime();

      const pixelPerSecond = trackScrollAreaWidth / currentDefaultTrackTime;

      ZoomController.setPixelPerSecond(pixelPerSecond);
    }

    renderScrollAreaContent() {
      if (!this.trackScrollAreaElement) return;

      this.trackScrollAreaElement.innerHTML = `
            <audi-marker></audi-marker>
            <audi-main-track-list-area></audi-main-track-list-area> 
        `;
    }
  };

  customElements.define('audi-main-track-scroll-area', MainTrackScrollArea);
})();

export { };
