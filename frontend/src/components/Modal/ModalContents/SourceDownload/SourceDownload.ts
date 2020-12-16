import { EventUtil, EncodingUtil } from '@util';
import { EventType, EventKeyType, ModalType, ButtonType, CompressorOption, KeyBoard } from '@types';
import { Controller } from '@controllers';
import './SourceDownload.scss';

(() => {
  const SourceDownload = class extends HTMLElement {
    private formElement: HTMLFormElement | null;
    private saveButton: HTMLButtonElement | null;
    private downloadLink: HTMLElement | null;
    private qualityRadios: HTMLDivElement | null;

    constructor() {
      super();
      this.formElement = null;
      this.saveButton = null;
      this.downloadLink = null;
      this.qualityRadios = null;
    }

    connectedCallback(): void {
      this.render();
      this.initElement();
      this.initEvent();
      this.reset();
    }

    reset(): void {
      if (!this.downloadLink || !this.formElement || !this.saveButton) return;

      this.downloadLink.removeAttribute('href');
      this.downloadLink.removeAttribute('download');
      this.formElement.fileName.value = '';
      this.changeBtnValue('변환');
      this.inactiveSaveButton(this.saveButton);
    }

    render(): void {
      this.innerHTML = `
              <form class="download-form">
                <div class="file-name">
                  <h4>파일 이름</h4>
                  <input id="fileName" type="text" name="fileName" event-key=${EventKeyType.SOURCE_DOWNLOAD_FILE_NAME_INPUT_MULTIPLE} />
                </div>
                <div class="radios">
                  <h4>확장자</h4>
                  <label>
                    <input type="radio" name="extention" value="mp3" event-key=${EventKeyType.SOURCE_DOWNLOAD_EXTENTION_CHANGE}></input>
                    mp3
                  </label>
                  <label>
                    <input type="radio" name="extention" value="wav" checked event-key=${EventKeyType.SOURCE_DOWNLOAD_EXTENTION_CHANGE}></input>
                    wav (48kHz)
                  </label>
                </div>
                <div class="radios quality-radios visible-hidden">
                  <h4>해상도</h4>
                  <label>
                    <input type="radio" name="quality" value=128 checked event-key=${EventKeyType.SOURCE_DOWNLOAD_EXTENTION_CHANGE}></input>
                    128kbps
                  </label>
                  <label>
                    <input type="radio" name="quality" value=192 event-key=${EventKeyType.SOURCE_DOWNLOAD_EXTENTION_CHANGE}></input>
                    192kbps
                  </label>
                  <label>
                    <input type="radio" name="quality" value=256 event-key=${EventKeyType.SOURCE_DOWNLOAD_EXTENTION_CHANGE}></input>
                    256kbps
                  </label>
                </div>
              </form>
              <div class='source-download-btn-container'>
                <a class="compress-button" id="download-link">
                  <audi-button class='save-button' data-event-key=${EventKeyType.SOURCE_DOWNLOAD_SAVE_BTN_CLICK} data-value="변환" data-type=${ButtonType.modal}></audi-button>
                </a>
                <audi-button data-event-key=${EventKeyType.SOURCE_DOWNLOAD_CLOSE_BTN_CLICK} data-value="취소" data-type=${ButtonType.modal}></audi-button>
              </div>
            `;
    }

    initElement(): void {
      this.formElement = document.querySelector('.download-form');
      this.saveButton = document.querySelector('.save-button');
      this.downloadLink = document.getElementById("download-link");
      this.qualityRadios = document.querySelector('.quality-radios');
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.keyup, EventType.keydown],
        eventKey: EventKeyType.SOURCE_DOWNLOAD_FILE_NAME_INPUT_MULTIPLE,
        listeners: [this.fileNameKeyUpListener, this.fileNameKeyDownListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.SOURCE_DOWNLOAD_SAVE_BTN_CLICK,
        listeners: [this.modalFormSubmitListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.change],
        eventKey: EventKeyType.SOURCE_DOWNLOAD_EXTENTION_CHANGE,
        listeners: [this.extentionChangeListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.SOURCE_DOWNLOAD_CLOSE_BTN_CLICK,
        listeners: [this.modalCloseBtnClickListener],
        bindObj: this
      });
    }

    async modalFormSubmitListener(e) {
      if (!this.saveButton || !this.formElement || !this.downloadLink) return;

      if (this.downloadLink.getAttribute('href')) return;

      const compressorObject: CompressorOption = {
        fileName: this.formElement.fileName.value,
        extention: this.formElement.extention.value,
        quality: this.formElement.extention.value === 'mp3' ? this.formElement.quality.value : null
      };
      this.changeBtnValue('압축 중');
      this.inactiveSaveButton(this.saveButton);

      await EncodingUtil.encodingAudio(compressorObject);
      this.changeBtnValue('저장하기');

      this.activeSaveButton(this.saveButton);
    };

    changeBtnValue(value: string): void {
      if (!this.saveButton) return;
      this.saveButton.value = value;
    }

    modalCloseBtnClickListener(): void {
      this.reset();
      Controller.changeModalState(ModalType.download, true);
    }

    fileNameKeyUpListener(e): void {
      if (!this.saveButton) return;
      this.saveButtonActivationHandler();

      if (!this.downloadLink || !this.downloadLink.getAttribute('download') || !this.formElement) return;

      const fileName = `${this.formElement.fileName.value}.${this.formElement.extention.value}`;
      this.downloadLink.setAttribute('download', fileName);
    };

    async fileNameKeyDownListener(e) {
      if (e.which === KeyBoard.ENTER) {
        e.preventDefault();
        if (this.saveButton && this.downloadLink && this.saveButton.classList.contains('active')) {
          if (this.downloadLink.getAttribute('href')) {
            this.saveButton.click();
          } else {
            await this.modalFormSubmitListener(e);
          }
        }
      }
    };

    extentionChangeListener(e): void {
      const { target } = e;

      if (!this.formElement || !this.qualityRadios || !(target.name === 'extention' || target.name === 'quality')) return;

      const fileName = this.formElement.fileName.value;
      this.reset();
      this.formElement.fileName.value = fileName;
      this.saveButtonActivationHandler()

      if (target.name === 'extention') {
        if (target.value === 'mp3') {
          this.qualityRadios.classList.remove('visible-hidden')
        } else {
          this.qualityRadios.classList.add('visible-hidden')
        }
      }
    }

    saveButtonActivationHandler(): void {
      if (!this.saveButton || !this.formElement) return;

      if (this.formElement.fileName.value.length > 0) {
        this.activeSaveButton(this.saveButton);
        return;
      }
      this.inactiveSaveButton(this.saveButton);
    }

    activeSaveButton(button: HTMLButtonElement): void {
      button.classList.add('active');
      button.dataset.disabled = 'false';
    };

    inactiveSaveButton(button: HTMLButtonElement): void {
      button.classList.remove('active');
      button.dataset.disabled = 'true';
    };
  };

  customElements.define('audi-source-download', SourceDownload);
})();

export { };
