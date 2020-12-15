import './PlayBarMarkerBlurZone.scss';

(() => {
  const PlayBarMarkerBlurZone = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback(): void {
      this.render();
    }

    render(): void {
      this.innerHTML = `
            <div id='playbar-marker-blur-zone' class='playbar-marker-blur-zone hide' droppable='true'></div>
        `;
    }
  };

  customElements.define('audi-playbar-marker-blur-zone', PlayBarMarkerBlurZone);
})();

export {};
