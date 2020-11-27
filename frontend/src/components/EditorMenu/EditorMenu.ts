import './EditorMenu.scss';

(() => {
  const EditorMenu = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback() {
      this.render();
      this.initEvent();
    }

    initEvent() {
      this.addEventListener('click', this.openSourceUploadForm.bind(this));
      this.addEventListener('click', this.openSourceDownloadForm.bind(this));
    }

    openSourceUploadForm(e) {
      const { target } = e;
      const targetElement = target.closest('#upload');
      const uploadElement = document.getElementById('upload');

      if (targetElement === uploadElement) {
        const uploadModalElement = document.getElementById('source');
        const modalElement = uploadModalElement.closest('editor-modal');

        modalElement.showModal();
      }
    }

    openSourceDownloadForm(e) {
      const { target } = e;
      const targetElement = target.closest('#save');
      if (!targetElement) return;
      const downloadModal = document.getElementById('save');

      if (targetElement === downloadModal) {
        const downloadModalElement = document.getElementById('download');
        const modalElement = downloadModalElement.closest('editor-modal');

        modalElement.showModal();
      }
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
})();

export {};
