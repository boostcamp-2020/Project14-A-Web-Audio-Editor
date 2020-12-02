import './PlayBarMarker.scss';

(() => {
  const Marker = class extends HTMLElement {
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
            <div id='marker-${this.type}' class='marker' draggable='true'></div>
        `;
    }
  };

  customElements.define('audi-marker', Marker);
})();

export {};
