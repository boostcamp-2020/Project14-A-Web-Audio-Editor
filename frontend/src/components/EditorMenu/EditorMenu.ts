import './EditorMenu.scss';
import { Controller } from '@controllers';
import { ModalType, EventType, EventKeyType } from '@types';
import { EventUtil } from '@util';
 
(() => {
  const EditorMenu = class extends HTMLElement {
    constructor() {
      super();
    }

    connectedCallback(): void {
      this.render();
      this.initEvent();
    }

    render(): void {
      this.innerHTML = `
              <div id="editor-menu">
                <div class="icon-wrap">
                  <audi-icon-button id="upload" color="white" icontype="upload" size="32px" data-event-key=${EventKeyType.EDITOR_MENU_OPEN_UPLOAD_BTN_CLICK}></audi-icon-button>
                  <audi-icon-button id="save" color="white" icontype="save" size="32px" data-event-key=${EventKeyType.EDITOR_MENU_OPEN_DOWNLOAD_BTN_CLICK}></audi-icon-button>
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

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EDITOR_MENU_OPEN_UPLOAD_BTN_CLICK,
        listeners: [this.openUploadModalBtnClickListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EDITOR_MENU_OPEN_DOWNLOAD_BTN_CLICK,
        listeners: [this.openDownloadModalBtnClickListener],
        bindObj: this
      });
    }

    openUploadModalBtnClickListener(): void{
      Controller.changeModalState(ModalType.upload, false);
    }

    openDownloadModalBtnClickListener(): void{
      Controller.changeModalState(ModalType.download, false);
    }
  };

  customElements.define('audi-editor-menu', EditorMenu);
})();

export {};
