import { EventUtil } from '@util';
import { EventType } from '@types';
import { saveFile } from '@util';
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

    connectedCallback() {
      this.render();
      this.initElement();
      this.initEvent();
    }

    render() {
      this.innerHTML = `
              <form class="download-form">
                <div class="file-name">
                  <h4>파일 이름</h4>
                  <input id="fileName" type="text" name="fileName" required event-key="audi-source-download-input"> </input>
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
              <audi-modal-buttons type='download'></audi-modal-buttons>
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
        eventKey: 'audi-source-download-input',
        listeners: [this.fileNameChangeListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: 'audi-source-download-button',
        listeners: [this.modalFormSubmitListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: 'download-modal-close',
        listeners: [this.modalCloseBtnClickListener],
        bindObj: this
      });
    }

    modalFormSubmitListener = async (e) => {
      const fileNmae = `${this.formElement?.fileName.value}.${this.formElement?.extention.value}`;
      const quality = this.formElement?.quality.value;
      if (this.saveButton) {
        this.saveButton.innerText = '압축 중';
        this.disabeldButton(this.saveButton);
        // test용 음원파일
        const URL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/Yodel_Sound_Effect.mp3';
        const response = await window.fetch(URL);
        const arrayBuffer = await response.arrayBuffer();
        // arrayBuffer만 있으면 됨
        await saveFile(arrayBuffer, quality, fileNmae);
        this.saveButton.innerText = '저장하기';
        this.abeldButton(this.saveButton);
      }
    };

    modalCloseBtnClickListener(): void {
      const typeModalElement = document.getElementById('download');
      const modalElement = typeModalElement.closest('audi-modal');
      modalElement?.hideModal();
      this.initForm()
    }
    
    initForm = () => {
      this.downloadLink?.removeAttribute('href');
      this.downloadLink?.removeAttribute('download');
      this.disabeldButton(this.saveButton);
      this.formElement.fileName.value = '';
      this.saveButton.innerText = '변환';
    }

    fileNameChangeListener = (e) => {
      console.log(this.saveButton);
      
      if (this.saveButton) {
        if (this.formElement?.fileName.value.length > 0) {
          this.abeldButton(this.saveButton);
        } else {
          this.disabeldButton(this.saveButton);
        }
      }
    };

    abeldButton = (button) => {
      button.style.backgroundColor = '#03C75A';
      button.disabled = false;
    };

    disabeldButton = (button) => {
      button.style.backgroundColor = '#212121';
      button.disabled = true;
    };
  };
  customElements.define('audi-source-download', SourceDownload);
})();
export { };
