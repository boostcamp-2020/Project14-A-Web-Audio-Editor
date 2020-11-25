export {};

import "./style.scss"

(() => {
  const Sidebar = class extends HTMLElement {

    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `

        <div id="sidebar">
          <time-info class="sidebar-child sidebar-time-info"></time-info>
          <source-list class="sidebar-child sidebar-source-list"></source-list>
        </div>
      `;
    }
  };
  customElements.define('side-bar', Sidebar);
})();
