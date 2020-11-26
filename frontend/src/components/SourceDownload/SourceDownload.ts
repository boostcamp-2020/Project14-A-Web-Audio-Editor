import { registerEventToRoot } from "@util";
import { EventType } from "@types";
import { saveFile } from '@util'
import './SourceDownload.scss'

(() => {
  const SourceDownload = class extends HTMLElement {
    private formElement: HTMLFormElement | null;
    private saveButton: HTMLButtonElement | null;
    constructor() {
      super();
      this.downloadModal = null;
      this.formElement = null
      this.saveButton = null;
    }

    connectedCallback() {
      this.render();
      this.initElement();
      // this.initEvent();
      console.log('click');

      this.saveButton?.addEventListener('click', this.onSubmitHandler);
      this.formElement?.addEventListener('keyup', this.onChangeHandler);

    }

    initElement(): void {
      this.formElement = document.querySelector('.download-form');
      this.saveButton = document.querySelector('.save-button');
    }

    initEvent(): void {
      registerEventToRoot({
        eventTypes: [EventType.click, EventType.keyup],
        eventKey: 'save',
        listeners: [this.onSubmitHandler, this.onChangeHandler],
        bindObj: this
      });
    }

    onSubmitHandler = async (e) => {
      const fileNmae = `${this.formElement?.fileName.value}.${this.formElement?.extention.value}`;
      const quality = this.formElement?.quality.value;
      if (this.saveButton) {
        this.saveButton.innerText = '압축 중'
        this.disabeldButton(this.saveButton)

        // test용 음원파일
        const URL = 'https://s3-us-west-2.amazonaws.com/s.cdpn.io/123941/Yodel_Sound_Effect.mp3';
        const response = await window.fetch(URL);
        const arrayBuffer = await response.arrayBuffer();

        // arrayBuffer만 있으면 됨
        await saveFile(arrayBuffer, quality, fileNmae)

        this.saveButton.innerText = '저장하기'
        this.abeldButton(this.saveButton);
      }
    }

    onChangeHandler = (e) => {
      if (this.saveButton) {
        if (this.formElement?.fileName.value.length > 0) {
          this.abeldButton(this.saveButton)
          this.saveButton.addEventListener('click', this.onSubmitHandler);
        } else {
          console.log(this.formElement?.fileName.value.length);

          this.disabeldButton(this.saveButton);
          this.saveButton.removeEventListener('click', this.onSubmitHandler)
        }
      }
    }

    abeldButton = (button) => {
      button.style.backgroundColor = "#03c75a";
      button.disabled = false;
    }

    disabeldButton = (button) => {
      button.style.backgroundColor = "#212121";
      button.disabled = true;
    }

    render() {
      this.innerHTML = `
              <form class="download-form">
                <div class="file-name">
                  <h4>파일 이름</h4>
                  <input id="fileName" type="text" name="fileName" required> </input>
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
            `;
    }
  };
  customElements.define('audi-source-download', SourceDownload);
})()

export { };
