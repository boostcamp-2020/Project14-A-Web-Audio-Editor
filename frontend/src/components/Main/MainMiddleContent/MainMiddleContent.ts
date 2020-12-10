import './MainMiddleContent.scss';

(() => {
  const MainMiddleContent = class extends HTMLElement {

    constructor() {
      super();
    }

    connectedCallback(): void {
      this.render();
    }

    render(): void {
      this.innerHTML = `
        <section class="audi-main-menu-container">
            <audi-main-track-option-list-area></audi-main-track-option-list-area>
            <audi-track-menu></audi-track-menu>
        </section>
        `;
    }
  };

  customElements.define('audi-main-middle-content', MainMiddleContent);
})();

export { };
