import './MainAsideContent.scss';

(() => {
  const MainAsideContent = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback(): void {
      this.render();
    }

    render(): void {
      this.innerHTML = `
                <aside>
                    <audi-side-bar></audi-side-bar>
                </aside>
              `;
    }
  };

  customElements.define('audi-main-aside-content', MainAsideContent);
})();

export { };
