import { EventKeyType, EventType, StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Source, SectionDragStartData } from '@model';
import { EventUtil, TimeUtil } from '@util';
import { Controller } from '@controllers';
import './SourceList.scss';

(() => {
  const SourceList = class extends HTMLElement {
    private sourceList: Source[];
    private hoverSource: Source | null;

    constructor() {
      super();
      this.sourceList = [];
      this.hoverSource = null;
    }

    connectedCallback(): void {
      this.initProperty();
      this.render();
      this.renderSourceInfo();
      this.initEvent();
      this.subscribe();
    }

    getSources(): string {
      return this.sourceList.reduce(
        (acc, source) =>
          acc +
          `<li class="audio-source" draggable="true" data-id=${source.id} event-key=${EventKeyType.SOURCE_LIST_MULTIPLE}>
              <span class='audio-source-fileName'>${source.fileName}</span>
            </li>`,
        ''
      );
    }

    parseFileSize(fileSize: number): string {
      let parsedFileSize = fileSize / 1024 / 1024;
      parsedFileSize = parsedFileSize * 100;
      parsedFileSize = Math.floor(parsedFileSize);
      parsedFileSize = parsedFileSize / 100;

      return `${parsedFileSize}MB`;
    }



    render(): void {
      this.innerHTML = `
          <div class='source-list-container'>
            <div class="source-list-title">
                Source       
            </div>
            <ul class="source-list-wrap">
                ${this.getSources()}
            </ul>
            <div class='source-file-info-wrap'>
              <ul class="source-info">
                  <li class='source-info-item'>파일명: - </li>
                  <li class='source-info-item'>재생시간: - </li>
                  <li class='source-info-item'>용량: - </li>
                  <li class='source-info-item'>채널 수: - </li>
                  <li class='source-info-item'>샘플레이트: - </li>
                </ul>
            </div>
          </div>
      `;
    }

    initProperty(): void {
      this.sourceList = Controller.getSourceList();
      this.hoverSource = Controller.getHoverSource();
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.dragstart, EventType.mousemove, EventType.mouseout],
        eventKey: EventKeyType.SOURCE_LIST_MULTIPLE,
        listeners: [this.sourceListDragstartListener, this.sourceListMousemoveListener, this.sourceListMouseoutListener],
        bindObj: this
      });
    }

    renderSourceInfo(): void {
      const fileInfoElement = this.querySelector('.source-file-info-wrap');
      if (!fileInfoElement) return;
      if (!this.hoverSource) {
        fileInfoElement.innerHTML = `<ul class="source-info">
                <li class='source-info-item'>파일명: - </li>
                <li class='source-info-item'>재생시간: - </li>
                <li class='source-info-item'>용량: - </li>
                <li class='source-info-item'>채널 수: - </li>
                <li class='source-info-item'>샘플레이트: - </li>
              </ul>`
      } else {
        fileInfoElement.innerHTML = `<ul class="source-info">
                <li class='source-info-item'>파일명: ${this.hoverSource.fileName}</li>
                <li class='source-info-item'>재생시간: ${TimeUtil.parsePlayTime(this.hoverSource.duration)}</li>
                <li class='source-info-item'>용량: ${this.parseFileSize(this.hoverSource.fileSize)}</li>
                <li class='source-info-item'>채널 수: ${this.hoverSource.numberOfChannels}</li>
                <li class='source-info-item'>샘플레이트: ${this.hoverSource.sampleRate}</li>
              </ul>`
      }
    }

    sourceListMousemoveListener(e): void {
      const currentSourceId = Number(e.target.dataset.id);
      if (currentSourceId === this.hoverSource?.id) return;

      const fileInfoElement = this.querySelector('.source-file-info-wrap');
      if (!fileInfoElement) return;

      const newSource = Controller.getSourceBySourceId(currentSourceId);
      if (!newSource) return;

      Controller.changeHoverSourceInfo(newSource);
    }

    hoverSourceObserverCallback(newSource: Source | null): void {
      this.hoverSource = newSource;

      this.renderSourceInfo();
    }

    sourceListMouseoutListener(): void {
      Controller.resetHoverSourceInfo();
    }

    sourceListDragstartListener(e): void {
      const dragImage = document.createElement('div');
      dragImage.style.visibility = 'hidden';
      e.dataTransfer.setDragImage(dragImage, 0, 0);

      const sourceId = Number(e.target.dataset.id);

      const trackSection = Controller.createTrackSectionFromSource(sourceId);
      if (!trackSection) return;
      const trackContainerElement = document.querySelector('.audio-track-container');;

      if (!trackContainerElement) return;

      const offsetLeft = trackContainerElement.getBoundingClientRect().left;

      const sectionDragStartData = new SectionDragStartData({ trackSection, offsetLeft });
      Controller.changeSectionDragStartData(sectionDragStartData);

    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.SOURCE_LIST_CHANNEL, this.updateSourceList, this);
      storeChannel.subscribe(StoreChannelType.SOURCELIST_SOURCE_INFO_CHANNEL, this.hoverSourceObserverCallback, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.SOURCE_LIST_CHANNEL, this.updateSourceList, this);
      storeChannel.unsubscribe(StoreChannelType.SOURCELIST_SOURCE_INFO_CHANNEL, this.hoverSourceObserverCallback, this);
    }

    updateSourceList(sourceList: Source[]): void {
      this.sourceList = sourceList;
      this.render();
    }

    hide(): void {
      this.classList.add('hide');
    }

    show(): void {
      this.classList.remove('hide');
    }
  };

  customElements.define('audi-source-list', SourceList);
})();

export { };
