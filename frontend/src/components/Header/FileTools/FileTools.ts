import './FileTools.scss';
import { ModalType, EventType, EventKeyType, StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Controller } from '@controllers'
import { EventUtil } from '@util';

(() => {
  const FileTools = class extends HTMLElement {
    private saveButton: HTMLElement | null;

    constructor() {
      super();
      this.saveButton = null;
    }

    connectedCallback(): void {
      this.render();
      this.initElement();
      this.initEvent();
      this.subscribe();
    }

    render(): void {
      this.innerHTML = `
                <div class="file-tools">
                  <audi-icon-button id="upload" class="delegation" icontype="upload" size="32px" event-key=${EventKeyType.EDITOR_MENU_OPEN_UPLOAD_BTN_CLICK}></audi-icon-button>
                  <audi-icon-button id="save" class="delegation disabled" icontype="save" size="32px" event-key=${EventKeyType.EDITOR_MENU_OPEN_DOWNLOAD_BTN_CLICK}></audi-icon-button>
                </div>
            `;
    }

    initElement(): void {
      this.saveButton = this.querySelector('#save');
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

    openUploadModalBtnClickListener(): void {
      Controller.changeModalState(ModalType.upload, false);
    }

    openDownloadModalBtnClickListener(): void {
      Controller.changeModalState(ModalType.download, false);
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.FILE_TOOLS_CHANNEL, this.sectionCountObserverCallback, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.FILE_TOOLS_CHANNEL, this.sectionCountObserverCallback, this);
    }

    sectionCountObserverCallback(newTrackList) {
      if (!this.saveButton) return;

      const possibleSave = newTrackList.find(track => track.trackSectionList.length > 0);

      if (possibleSave) {
        this.saveButton.classList.remove('disabled')
      } else {
        this.saveButton.classList.add('disabled')
      }
    }

  };

  customElements.define('audi-file-tools', FileTools);
})();

export { };
