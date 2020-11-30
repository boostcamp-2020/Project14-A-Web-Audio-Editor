import './Loading.scss';

(() => {
  const Loading = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback(): void {
      this.render();
    }

    render() {
      this.innerHTML = `
                <div class='loading-box'>
                    <div class='circle'></div>
                </div>
            `;
    }
  };
  customElements.define('audi-loading', Loading);
})();

export {};
