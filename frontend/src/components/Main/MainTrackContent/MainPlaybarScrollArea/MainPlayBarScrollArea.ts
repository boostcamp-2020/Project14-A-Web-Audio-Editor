import './MainPlayBarScrollArea.scss';

(() => {
  const MainPlayBarScrollArea = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback(): void {
      this.render();
    }

    render(): void {
      this.innerHTML = `
                  <div class="main-playbar-scroll-area-container">
                    <audi-playbar></audi-playbar>
                  </div>
              `;
    }
  };

  customElements.define('audi-main-playbar-scroll-area', MainPlayBarScrollArea);
})();

export { };
