export { };
import './style.scss'

(() => {
  const HeaderComponent = class extends HTMLElement {


    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
              <div id="header">
                <logo-component color="white"></logo-component>
                <editor-menu></editor-menu>
              </div>
            `;
    }
  };
  customElements.define('header-component', HeaderComponent);
})()