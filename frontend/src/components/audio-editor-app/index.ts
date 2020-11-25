export { };

(() => {
  const AudioEditorApp = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
                  <div>
                    <header-component></header-component>
                    <sample-component></sample-component>
                  </div>
              `;
    }
  };
  customElements.define('audio-editor-app', AudioEditorApp);
})();
