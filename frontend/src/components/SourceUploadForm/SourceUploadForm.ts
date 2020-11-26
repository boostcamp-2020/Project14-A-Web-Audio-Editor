import './SourceUploadForm.scss';
import Analyzer from '../audio-analyzer';

(() => {
  const SourceUploadForm = class extends HTMLElement {
    private filename: string;
    private sourceUploadElement: HTMLElement | null;
    constructor() {
      super();
      this.filename = '';
      this.sourceUploadElement = null;
    }

    connectedCallback() {
      this.render();
      this.initDOM();
      this.initEvent();
    }

    initDOM() {
      this.sourceUploadElement = document.querySelector('.source-upload-content');
    }

    initEvent() {
      this.addEventListener('dragover', this.dragOver.bind(this));
      this.addEventListener('drop', this.uploadFile.bind(this));
      this.addEventListener('change', this.uploadFile.bind(this));
    }

    dragOver(e) {
      e.preventDefault();
      const { target } = e;
      if (this.sourceUploadElement && e.type === 'dragover' && target === this.sourceUploadElement) {
        this.sourceUploadElement.style.background = 'lightgray';
      }
    }

    uploadFile(e) {
      e.preventDefault();

      const ORIGIN_BACKGROUNDCOLOR = '#212121';
      if (this.sourceUploadElement && e.type === 'drop') {
        this.sourceUploadElement.style.background = ORIGIN_BACKGROUNDCOLOR;
      }

      const files = e.target.files || e.dataTransfer.files;
      const file = files[0];

      if (file) {
        this.setFilename(file.name);
        const reader = new FileReader();
        reader.onload = (e) => Analyzer.setAudio(e?.target.result, this.filename);
        reader.readAsArrayBuffer(file);
      }
    }

    setFilename(filename) {
      this.filename = filename;
      this.render();

      const sourceEmpty: HTMLElement | null = document.querySelector('.source-empty');
      if (sourceEmpty) {
        sourceEmpty.className = 'hide-source-upload-content';
      }
    }

    render() {
      this.innerHTML = `
            <section class='source-upload-content' draggable='true'>
                <div class='source-fill'>${this.filename}</div>
                <label for='source-upload' class='source-empty'>
                    <div>+</div>
                    <input type='file' id='source-upload' hidden accept='audio/*'/>
                    <div>Click or Drag and Drop</div>
                </label>
            </section>
            `;
    }
  };

  customElements.define('source-upload-form', SourceUploadForm);
})();
