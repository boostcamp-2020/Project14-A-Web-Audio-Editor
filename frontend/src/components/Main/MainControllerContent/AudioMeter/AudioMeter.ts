import './AudioMeter.scss';

(() => {
  const AudioMeter = class extends HTMLElement {

    constructor() {
      super();
    }

    connectedCallback(): void {
      this.render();
    }

    render(): void {
      this.innerHTML = `
                <div id="audio-meter-container">
                  <div id="audio-meter-bar">
                    <div id="audio-meter-fill"></div>
                  </div>
                  <div class="decibel-markers">
                  ${this.getDecibelMarkers()}
                  </div>
                </div>
            `;
    }

    getDecibelMarkers(): string {
      let mindb = -68;
      let acc = `<div class='decibel-level'>
                            -INF
                        </div>`;

      while (mindb <= 0) {
        acc += `<div class='decibel-level'>
                    ${mindb}
                </div>`
        mindb += 4;
      }
      return acc;
    }
  };
  customElements.define('audi-audio-meter', AudioMeter);
})();

export { };
