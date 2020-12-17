import './Header.scss'

(() => {
  const Header = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
              <div id="header">
                <audi-logo></audi-logo>
                <audi-editor-menu></audi-editor-menu>
              </div>
            `;
    }
  };
  customElements.define('audi-header', Header);
})()

export { };
