import { Track } from '@model';
import { Controller } from '@controllers';
import './MainMiddleContent.scss';

(() => {
  const MainMiddleContent = class extends HTMLElement {
    private trackList: Track[];

    constructor() {
      super();
      this.trackList = Controller.getTrackList();
    }

    connectedCallback(): void {
      this.render();
    }

    render(): void {
      this.innerHTML = `
        <section class="audi-main-menu-container">
            <div class="audi-main-track-option-area">
                ${this.getTrackOptions()}
            </div>
            <audi-track-menu></audi-track-menu>
        </section>
        `;
    }

    getTrackOptions(): string {
      return this.trackList.reduce((acc, cur, idx) =>
        acc += `<audi-track-option data-id=${idx} data-track-id=${cur.id}></audi-track-option>`, "");
    }
  };

  customElements.define('audi-main-middle-content', MainMiddleContent);
})();

export { };
