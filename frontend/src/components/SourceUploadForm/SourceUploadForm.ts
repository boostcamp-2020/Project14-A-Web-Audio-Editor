import './SourceUploadForm.scss';
import { FileUtil, AudioUtil } from '@util';
import { Source } from '@model';
import { Controller } from '@controllers';
import { EventUtil } from '@util';
import { EventType } from '@types';

(() => {
  const SourceUploadForm = class extends HTMLElement {
    private filename: string;
    private source: Source | null;
    private sourceUploadElement: HTMLElement | null;

    constructor() {
      super();
      this.filename = '';
      this.source = null;
      this.sourceUploadElement = null;
    }

    connectedCallback() {
      this.render();
      this.initElement();
      this.initEvent();
    }

    reset() {
      this.filename = '';
      this.source = null;
      this.render();
      this.initElement();
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
            <modal-buttons type=source></modal-buttons>
            `;
    }

    initElement() {
      this.sourceUploadElement = document.querySelector('.source-upload-content');
    }

    initEvent() {
      this.addEventListener('dragover', this.uploadFormDragOverListener.bind(this));
      this.addEventListener('drop', this.uploadFileListener.bind(this));
      this.addEventListener('change', this.uploadFileListener.bind(this));

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: 'source-upload',
        listeners: [this.uploadBtnClickListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: 'source-modal-close',
        listeners: [this.modalCloseBtnClickListener],
        bindObj: this
      });
    }

    modalCloseBtnClickListener(): void {
      const typeModalElement = document.getElementById('source');
      const modalElement = typeModalElement.closest('editor-modal');

      modalElement?.hideModal();
    }

    uploadBtnClickListener(e) {
      if (!this.source) {
        alert('소스를 등록해주세요.');
        return;
      }

      //로드중입니다....
      Controller.addSource(this.source);
      const modalElement = document.querySelector('editor-modal');
      modalElement?.hideModal();
      this.reset();
    }

    uploadFormDragOverListener(e) {
      e.preventDefault();
      const { target } = e;
      if (this.sourceUploadElement && e.type === 'dragover' && target === this.sourceUploadElement) {
        this.sourceUploadElement.style.background = 'lightgray';
      }
    }

    async uploadFileListener(e) {
      e.preventDefault();

      const ORIGIN_BACKGROUNDCOLOR = '#212121';
      if (this.sourceUploadElement && e.type === 'drop') {
        this.sourceUploadElement.style.background = ORIGIN_BACKGROUNDCOLOR;
      }

      const files = e.target.files || e.dataTransfer.files;
      const file = files[0];

      if (file) {
        const { name } = file;
        this.setFilename(name);
        await this.setSource(file);
      }
    }

    async setSource(file) {
      const arrayBuffer = await FileUtil.readFileAsync(file);
      const audioBuffer = await AudioUtil.decodeArrayBufferToAudio(arrayBuffer);
      this.source = new Source(file, audioBuffer);
    }

    setFilename(filename) {
      this.filename = filename;
      this.render();

      const sourceEmpty: HTMLElement | null = document.querySelector('.source-empty');
      if (sourceEmpty) {
        sourceEmpty.className = 'hide-source-upload-content';
      }
    }
  };

  customElements.define('source-upload-form', SourceUploadForm);
})();
