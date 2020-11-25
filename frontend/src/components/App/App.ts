import "./App.scss";

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
                    <audi-main></audi-main>
                  </div>
              `;
    }
  };
  customElements.define('audi-app', App);
})();

export { };

