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
        const modalElement = uploadModalElement?.closest('audi-modal');

        modalElement?.showModal();
      }
    }

    openSourceDownloadForm(e) {
      const { target } = e;
      const targetElement = target.closest('#save');
      if (!targetElement) return;
      const downloadModal = document.getElementById('save');

      if (targetElement === downloadModal) {
        const downloadModalElement = document.getElementById('download');
        const modalElement = downloadModalElement?.closest('audi-modal');

        modalElement?.showModal();
      }
    }

    render() {
      this.innerHTML = `
              <div id="editor-menu">
                <div class="icon-wrap">
                  <audi-icon-button id="upload" color="white" icontype="upload" size="32px"></audi-icon-button>
                  <audi-icon-button id="save" color="white" icontype="save" size="32px"></audi-icon-button>
                </div>
                <audi-edit-tools></audi-edit-tools>
                <audi-playback-tools></audi-playback-tools>
                <div class="icon-wrap">
                  <audi-icon-button id="record" color="white" icontype="record" size="32px"></audi-icon-button>
                </div>

                <div id="user-menu" class="icon-wrap">
                  <audi-icon-button color="white" icontype="user" size="32px"></audi-icon-button>
                  <audi-icon-button color="white" icontype="menu" size="32px"></audi-icon-button>
                </div>
              </div>
            `;
    }
  };

  customElements.define('audi-editor-menu', EditorMenu);
})();

export {};
