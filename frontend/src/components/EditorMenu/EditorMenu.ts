import './EditorMenu.scss'

(() => {
  const EditorMenu = class extends HTMLElement {


    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
    }

    render() {
      this.innerHTML = `
              <div id="editor-menu">
                <div class="icon-wrap">
                  <icon-button id="upload" color="white" icontype="upload" size="32px"></icon-button>
                  <icon-button id="save" color="white" icontype="save" size="32px"></icon-button>
                </div>
                <edit-tools></edit-tools>
                <playback-tools></playback-tools>
                <div class="icon-wrap">
                  <icon-button id="record" color="white" icontype="record" size="32px"></icon-button>
                </div>

                <div id="user-menu" class="icon-wrap">
                  <icon-button color="white" icontype="user" size="32px"></icon-button>
                  <icon-button color="white" icontype="menu" size="32px"></icon-button>
                </div>
              </div>
            `;
    }
  };
  customElements.define('editor-menu', EditorMenu);
})()

export {};
