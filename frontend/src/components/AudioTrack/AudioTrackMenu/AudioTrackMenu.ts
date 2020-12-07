import { IconType } from '@types';
import './AudioTrackMenu.scss';

(() => {
  const AudioTrackMenu = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback(): void {
      try {
        this.render();
      } catch (e) {
        console.log(e);
      }
    }

    render(): void {
      this.innerHTML = `
                <div class='audio-track-menu-container'>
                    <div class='track-menu-area'>
                        <audi-icon-button icontype=${IconType.headset} size=${25}></audi-icon-button>
                        <audi-icon-button icontype=${IconType.colorLens} size=${25}></audi-icon-button>
                    </div>
                    <div class='zoom-menu-area'>
                        <audi-icon-button icontype=${IconType.zoomIn} size=${25}></audi-icon-button>
                        <audi-icon-button icontype=${IconType.zoomOut} size=${25}></audi-icon-button>
                    </div>
                </div>
            `;
    }
  };

  customElements.define('audi-track-menu', AudioTrackMenu);
})();
