import "./SourceList.scss";
import { StoreChannelType } from "@types";
import { storeChannel } from '@store';
import { Source } from '@model';

(() => {
  const SourceList = class extends HTMLElement {
    private sourceList: Source[];

    constructor() {
      super();
      this.sourceList = [];
    }

    connectedCallback() {
      this.render();
      this.subscribe();
    }

    getSources() {
      return this.sourceList.reduce((acc, source) =>
        acc + `<li class="audio-source">
                        <span>${source.fileName}</span>
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
    
    parseFileSize(fileSize: number){
      let parsedFileSize = fileSize / 1024 /1024
      parsedFileSize = parsedFileSize * 100;
      parsedFileSize = Math.floor(parsedFileSize);
      parsedFileSize = parsedFileSize / 100;

      return `${parsedFileSize}MB`;
    }

    parsePlayTime(playTime: number) {
      if(playTime < 60){
        const seconds = Math.round(playTime);
        return `${seconds}초`;
      }

      const minute = Math.floor(playTime / 60);
      const seconds = Math.round(playTime % 60);
      return `${minute}분 ${seconds}초`;
    }

    render() {
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

    subscribe(){
      storeChannel.subscribe(StoreChannelType.SOURCE_LIST_CHANNEL,this.updateSourceList,this);
    }

    updateSourceList(sourceList){
      this.sourceList = sourceList;
      this.render();
    }
  };
  customElements.define('audi-source-list', SourceList);
})();

export {};
