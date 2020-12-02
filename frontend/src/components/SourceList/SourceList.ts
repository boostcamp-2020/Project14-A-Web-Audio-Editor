import { EventKeyType, EventType, StoreChannelType } from "@types";
import { storeChannel } from '@store';
import { Source } from '@model';
import { EventUtil } from "@util";
import { Controller } from "@controllers";
import "./SourceList.scss";

(() => {
  const SourceList = class extends HTMLElement {
    private sourceList: Source[];

    constructor() {
      super();
      this.sourceList = [];
    }

    connectedCallback(): void {
      this.render();
      this.initEvent();
      this.subscribe();
    }

    getSources(): string {
      return this.sourceList.reduce((acc, source) =>
        acc + `<li class="audio-source" draggable="true" data-id=${source.id} event-key=${EventKeyType.SOURCE_LIST_MULTIPLE}>
                        <span event-key=${EventKeyType.SOURCE_LIST_MULTIPLE}>${source.fileName}</span>
                        <ul class="source-info">
                          <li><span>FileName: ${source.fileName}</span></li>
                          <li><span>FileSize: ${this.parseFileSize(source.fileSize)}</span></li>
                          <li><span>SampleRate: ${source.sampleRate}</span></li>
                          <li><span>Channel: ${source.numberOfChannels}</span></li>
                          <li><span>PlayTime: ${this.parsePlayTime(source.duration)}</span></li>
                        </ul>
                      </li>`
        , "")
    }
    
    parseFileSize(fileSize: number): string{
      let parsedFileSize = fileSize / 1024 /1024
      parsedFileSize = parsedFileSize * 100;
      parsedFileSize = Math.floor(parsedFileSize);
      parsedFileSize = parsedFileSize / 100;

      return `${parsedFileSize}MB`;
    }

    parsePlayTime(playTime: number): string {
      if(playTime < 60){
        const seconds = Math.round(playTime);
        return `${seconds}초`;
      }

      const minute = Math.floor(playTime / 60);
      const seconds = Math.round(playTime % 60);
      return `${minute}분 ${seconds}초`;
    }

    render(): void {
      this.innerHTML = `
          <div class="source-list-outer-wrap">
            <div class="source-list-title">
                <div> Source </div>        
            </div>
            <ul class="source-list-wrap">
                ${this.getSources()}
            </ul>
          </div>
      `;
    }

    initEvent(): void{
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.dragstart, EventType.dragend],
        eventKey: EventKeyType.SOURCE_LIST_MULTIPLE,
        listeners: [this.sourceListDragstartListener, this.sourceListDragendListener],
        bindObj: this
      })
    }

    sourceListDragstartListener(e): void{
      e.dataTransfer.setData("text/plain", e.target.dataset.id);
      e.dataTransfer.dropEffect = "link";

      Controller.changeTrackDragState(true);
    }

    sourceListDragendListener(e): void{
      Controller.changeTrackDragState(false);
    }

    subscribe(): void{
      storeChannel.subscribe(StoreChannelType.SOURCE_LIST_CHANNEL,this.updateSourceList,this);
    }

    updateSourceList(sourceList: Source[]): void{
      this.sourceList = sourceList;
      this.render();
    }
  };

  customElements.define('audi-source-list', SourceList);
})();

export {};
