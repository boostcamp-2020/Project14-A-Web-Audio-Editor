import './style.scss'
export { };

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
                <div class="icon-wrap file-tools">
                  <icon-button color="white" icontype="upload" size="30px"></icon-button>
                  <icon-button color="white" icontype="save" size="30px"></icon-button>
                </div>
                <div class="icon-wrap edit-tools">
                  <icon-button color="white" icontype="cursor" size="30px"></icon-button>
                  <icon-button color="white" icontype="blade" size="30px"></icon-button>
                  <icon-button color="white" icontype="copy" size="30px"></icon-button>
                  <icon-button color="white" icontype="cut" size="30px"></icon-button>
                  <icon-button color="white" icontype="paste" size="30px"></icon-button>
                  <icon-button color="white" icontype="delete" size="30px"></icon-button>
                  <icon-button color="white" icontype="undo" size="30px"></icon-button>
                  <icon-button color="white" icontype="redo" size="30px"></icon-button>
                </div>
                <div class="icon-wrap play-tools">
                  <icon-button color="white" icontype="play" size="30px"></icon-button>
                  <icon-button color="white" icontype="stop" size="30px"></icon-button>
                  <icon-button color="white" icontype="repeat" size="30px"></icon-button>
                  <icon-button color="white" icontype="fast_rewind" size="30px"></icon-button>
                  <icon-button color="white" icontype="fast_forward" size="30px"></icon-button>
                  <icon-button color="white" icontype="skip_prev" size="30px"></icon-button>
                  <icon-button color="white" icontype="skip_next" size="30px"></icon-button>
                </div>
                <div class="icon-wrap">
                  <icon-button color="white" icontype="record" size="30px"></icon-button>
                </div>

                <div class="icon-wrap user-menu">
                  <icon-button color="white" icontype="user" size="30px"></icon-button>
                  <icon-button color="white" icontype="menu" size="30px"></icon-button>
                </div>
              </div>
            `;
    }
  };
  customElements.define('editor-menu', EditorMenu);
})()