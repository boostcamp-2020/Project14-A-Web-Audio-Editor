export {};
import "./sidebar.scss"

(() => {
  const SideBar = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
                  <div id="sidebar">
                    <source-list class="sidebar-child"></source-list>
                  </div>
              `;
    }
  };
  customElements.define('side-bar', SideBar);
})();
