import { EventUtil } from '@util';
import { EventType, EventKeyType, ModalType, ButtonType } from '@types';
import { saveFile } from '@util';
import { Controller } from '@controllers';
import './SourceDownload.scss';

(() => {
  const SourceDownload = class extends HTMLElement {
    private formElement: HTMLFormElement | null;
    private saveButton: HTMLButtonElement | null;
    private downloadLink: HTMLElement | null;

    constructor() {
      super();
      this.formElement = null;
      this.saveButton = null;
      this.downloadLink = null;
    }

    connectedCallback(): void {
      this.render();
      this.initElement();
      this.initEvent();
      this.reset();
    }

    reset(): void{
      if(!this.downloadLink || !this.formElement || !this.saveButton) return;

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
                  <input id="fileName" type="text" name="fileName" required event-key=${EventKeyType.SOURCE_DOWNLOAD_FILE_NAME_KEYUP} />
                </div>
                <div class="radios">
                  <h4>해상도</h4>
                  <label>
                    <input type="radio" name="quality" value=0.5></input>
                    저
                  </label>
                  <label>
                    <input type="radio" name="quality" value=0.75></input>
                    중
                  </label>
                  <label>
                    <input type="radio" name="quality" value=1 checked></input>
                    고
                  </label>
                </div>
                <div class="radios">
                  <h4>확장자</h4>
                  <label>
                    <input type="radio" name="extention" value="mp3"></input>
                    .mp3
                  </label>
                  <label>
                    <input type="radio" name="extention" value="wav" checked></input>
                    .wav
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
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.keyup],
        eventKey: EventKeyType.SOURCE_DOWNLOAD_FILE_NAME_KEYUP,
        listeners: [this.fileNameChangeListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.SOURCE_DOWNLOAD_SAVE_BTN_CLICK,
        listeners: [this.modalFormSubmitListener],
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
      if(!this.saveButton || !this.formElement) return; 

      const fileName = `${this.formElement?.fileName.value}.${this.formElement?.extention.value}`;
      const quality = this.formElement?.quality.value;

      this.changeBtnValue('압축 중');
      this.inactiveSaveButton(this.saveButton);
        
      const URL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/Yodel_Sound_Effect.mp3';
      const response = await window.fetch(URL);
      const arrayBuffer = await response.arrayBuffer();
        
      await saveFile(arrayBuffer, quality, fileName);
      this.changeBtnValue('저장하기');
        
      this.activeSaveButton(this.saveButton);
    };

    changeBtnValue(value: string): void{      
      if(!this.saveButton) return;     
      this.saveButton.value = value;
    }

    modalCloseBtnClickListener(): void {
      this.reset();
      Controller.changeModalState(ModalType.download, true);
    }

    fileNameChangeListener(e): void {    
      if (!this.saveButton) return;
      this.saveButtonActivationHandler();
    };

    saveButtonActivationHandler(): void {
      if(!this.saveButton || !this.formElement) return;

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
