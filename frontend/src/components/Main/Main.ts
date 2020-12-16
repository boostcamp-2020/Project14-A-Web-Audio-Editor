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
                      <div class="main-track-content-area">
                        <audi-main-track-content></audi-main-track-content>
                        <audi-main-controller-content></audi-main-controller-content>
                      </div>
                    </div>
                  </main>
              `;
    }
  };

  customElements.define('audi-main', Main);
})();

export { };
