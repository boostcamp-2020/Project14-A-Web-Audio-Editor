import './Main.scss';

(() => {
  const Main = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback(): void {
      this.render();
    }

    render(): void {
      this.innerHTML = `
                  <main class="audi-main-container">
                    <div class="audi-main-content">
                        <audi-main-aside-content></audi-main-aside-content>
                        <audi-main-middle-content></audi-main-middle-content>
                        <audi-main-right-content></audi-main-right-content>
                    </div>
                  </main>
              `;
    }
  };

  customElements.define('audi-main', Main);
})();

export { };
