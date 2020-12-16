import './Sidebar.scss';

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
          <audi-sidebar-list-info></audi-sidebar-list-info>
        </div>
      `;
    }
  };
  customElements.define('audi-side-bar', Sidebar);
})();

export { };
