import './App.scss';

(() => {
  const App = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
                  <div class="audi-app-container">
                    <header-component></header-component>
                    <editor-modal type='source' title='소스 불러오기'></editor-modal>
                    <audi-main></audi-main>
                  </div>
              `;
    }
  };
  customElements.define('audi-app', App);
})();

export {};
