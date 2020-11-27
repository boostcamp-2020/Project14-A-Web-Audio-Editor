import "./Sidebar.scss"

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
          <audi-time-info class="sidebar-child sidebar-time-info"></audi-time-info>
          <audi-source-list class="sidebar-child sidebar-source-list"></audi-source-list>
        </div>
      `;
    }
  };
  customElements.define('audi-side-bar', Sidebar);
})();

export {};
