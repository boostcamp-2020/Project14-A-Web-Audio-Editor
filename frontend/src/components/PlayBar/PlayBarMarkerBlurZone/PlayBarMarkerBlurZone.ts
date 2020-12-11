import './PlayBarMarkerBlurZone.scss';

(() => {
  const PlayBarMarkerBlurZone = class extends HTMLElement {
    private type: string;

    constructor() {
      super();
      this.type = '';
    }

    static get observedAttributes(): string[] {
      return ['type'];
    }

    connectedCallback(): void {
      this.render();
    }

    attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void {
      if (!newVal) return;

      if (oldVal !== newVal) {
        switch (attrName) {
          case 'type':
            this.type = newVal;
            break;
        }
        this[attrName] = newVal;
      }
    }

    render(): void {
      this.innerHTML = `
            <div id='playbar-marker-blur-zone-${this.type}' class='playbar-marker-blur-zone' droppable='true'></div>
        `;
    }
  };

  customElements.define('audi-playbar-marker-blur-zone', PlayBarMarkerBlurZone);
})();

export {};
