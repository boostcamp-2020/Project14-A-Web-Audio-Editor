import { FileUtil, AudioUtil } from '@util';
import { Source } from '@model';
import { Controller } from '@controllers';
import { EventUtil } from '@util';
import { EventType, ButtonType, EventKeyType, ModalType } from '@types';
import './SourceUpload.scss';

(() => {
  const SourceUpload = class extends HTMLElement {
    private filename: string;
    private source: Source | null;
    private sourceUploadElement: HTMLElement | null;

    constructor() {
      super();
      this.filename = '';
      this.source = null;
      this.sourceUploadElement = null;
    }

    connectedCallback(): void {
      try {
        this.init();
      } catch (e) {
        console.log(e);
      }
    }

    init(): void {
      this.render();
      this.initElement();
      this.initEvent();
    }

    reset(): void {
      this.filename = '';
      this.source = null;
      this.render();
      this.initElement();
    }

    render(): void {
      this.innerHTML = `
            <div class='source-upload-content' draggable='true' event-key=${EventKeyType.SOURCE_UPLOAD_CONTENT_MULTIPLE}>
                <audi-loading class='hide' type='source'></audi-loading>
                <div class='source-fill'>${this.filename}</div>
                <label for='source-upload' class='source-empty'>
                    <div>+</div>
                    <input type='file' id='source-upload' hidden accept='audio/*' event-key=${EventKeyType.SOURCE_UPLOAD_CONTENT_MULTIPLE} />
                    <div>Click or Drag and Drop</div>
                </label>
            </div>
            <div class='source-upload-btn-container'>
              <audi-button class='upload-btn' data-event-key=${EventKeyType.SOURCE_UPLOAD_LOAD_BTN_CLICK} data-value="불러오기" data-type=${ButtonType.modal}></audi-button>
              <audi-button data-event-key=${EventKeyType.SOURCE_UPLOAD_CLOSE_CLOSE_BTN_CLICK} data-value="취소" data-type=${ButtonType.modal}></audi-button>
            </div>
            `;
    }

    initElement(): void {
      this.sourceUploadElement = document.querySelector('.source-upload-content');
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.dragover, EventType.drop, EventType.change],
        eventKey: EventKeyType.SOURCE_UPLOAD_CONTENT_MULTIPLE,
        listeners: [this.uploadFormDragOverListener, this.uploadFileListener, this.uploadFileListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.SOURCE_UPLOAD_LOAD_BTN_CLICK,
        listeners: [this.uploadBtnClickListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.SOURCE_UPLOAD_CLOSE_CLOSE_BTN_CLICK,
        listeners: [this.modalCloseBtnClickListener],
        bindObj: this
      });
    }

    modalCloseBtnClickListener(): void {
      Controller.changeModalState(ModalType.upload, true);
      this.reset();
    }

    uploadBtnClickListener(): void {
      if (!this.source) {
        alert('소스를 등록해주세요.');
        return;
      }

      Controller.addSource(this.source);
      Controller.changeModalState(ModalType.upload, true);
      this.reset();
    }

    uploadFormDragOverListener(e: Event): void {
      e.preventDefault();
      const { target } = e;
      if (this.sourceUploadElement && e.type === 'dragover' && target === this.sourceUploadElement) {
        this.sourceUploadElement.style.background = 'lightgray';
      }
    }

    async uploadFileListener(e) {
      e.preventDefault();

      if (this.sourceUploadElement && e.type === 'drop') {
        const ORIGIN_BACKGROUNDCOLOR = '#212121';
        this.sourceUploadElement.style.background = ORIGIN_BACKGROUNDCOLOR;
      }

      const files = e.target.files || e.dataTransfer.files;
      const file = files[0];

      if (file) {
        const { name } = file;
        const loadingElement = document.querySelector('audi-loading');
        this.hideClickDiv();

        loadingElement?.startLoading();
        await this.setSource(file);
        loadingElement?.endLoading();

        this.setFilename(name);
      }
    }

    async setSource(file: File) {
      const arrayBuffer = await FileUtil.readFileAsync(file);
      const audioBuffer = await AudioUtil.decodeArrayBufferToAudio(arrayBuffer);
      const mergedBuffer = await AudioUtil.mergeChannels(audioBuffer);
      const channelData = mergedBuffer.getChannelData(0);

      const durationPerMinute = audioBuffer.duration / 60;
      // const peaksPerMinute = 2500;
      const peaksPerMinute = 4000;
      const pareseChannelDataLength = Math.round(durationPerMinute * peaksPerMinute)
      const parsedChannelData = await AudioUtil.parsePeaks(mergedBuffer, pareseChannelDataLength);

      this.source = new Source(file, audioBuffer, parsedChannelData, channelData);
    }

    setFilename(filename: string): void {
      this.filename = filename;
      this.render();

      this.hideClickDiv();
    }

    hideClickDiv() {
      const sourceEmpty: HTMLElement | null = document.querySelector('.source-empty');
      if (sourceEmpty) {
        sourceEmpty.className = 'hide-source-upload-content';
      }
    }
  };

  customElements.define('audi-source-upload', SourceUpload);
})();
