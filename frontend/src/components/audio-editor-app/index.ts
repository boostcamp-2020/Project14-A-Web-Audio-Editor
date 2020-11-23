export {};

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
                    <sample-component></sample-component>
                  </div>
              `;
    }
  };
  customElements.define('audio-editor-app', AudioEditorApp);
})();
