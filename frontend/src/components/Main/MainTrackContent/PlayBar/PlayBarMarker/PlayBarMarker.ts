import './PlayBarMarker.scss';

(() => {
  const PlayBarMarker = class extends HTMLElement {
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
            <div id='playbar-marker-${this.type}' class='playbar-marker hide' draggable='true'></div>
        `;
    }
  };

  customElements.define('audi-playbar-marker', PlayBarMarker);
})();

export {};
