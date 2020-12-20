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
                <div id="editor-menu">
                  <audi-file-tools></audi-file-tools>
                  <audi-edit-tools></audi-edit-tools>
                  <audi-playback-tools></audi-playback-tools>
                  <audi-zoom-rate-info></audi-zoom-rate-info>
                </div>
              </div>
            `;
    }
  };
  customElements.define('audi-header', Header);
})()

export { };
