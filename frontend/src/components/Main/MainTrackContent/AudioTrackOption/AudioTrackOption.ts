import { EventKeyType, EventType, TrackOptionType } from '@types';
import { EventUtil } from '@util';
import { Controller, CommandController } from '@controllers';
import './AudioTrackOption.scss';

(() => {
  const AudioTrackOption = class extends HTMLElement {
    private trackOptionId: number;
    private trackId: number;
    private isSolo: boolean;
    private isMute: boolean;
    private isDelete: boolean;

    constructor() {
      super();
      this.trackOptionId = 0;
      this.trackId = 0;
      this.isSolo = false;
      this.isMute = false;
      this.isDelete = false;
    }

    static get observedAttributes(): string[] {
      return ['data-id', 'data-track-id'];
    }

    attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void {
      if (oldVal !== newVal) {
        switch (attrName) {
          case 'data-id':
            this.trackOptionId = Number(newVal);
            break;
          case 'data-track-id':
            this.trackId = Number(newVal);
            break;
        }
        this[attrName] = newVal;
      }
    }

    connectedCallback(): void {
      try {
        this.render();
        this.initEvent();
      } catch (e) {
        console.log(e);
      }
    }

    render(): void {
      this.innerHTML = `
                <ul class='audio-track-option-container delegation' event-key=${EventKeyType.AUDIO_TRACK_OPTION_CLICK + this.trackOptionId}>
                    <li class='${(!this.isSolo)? "" : 'clicked'}'><span event-delegation data-type="${TrackOptionType.solo}">Solo</span></li>
                    <li class='${(!this.isMute)? "" : 'clicked'}'><span event-delegation data-type="${TrackOptionType.mute}">Mute</span></li>
                    <li class='${(!this.isDelete)? "" : 'clicked'}'><span event-delegation data-type="${TrackOptionType.delete}">Delete</span></li>
                </ul>
            `;
    }

    initEvent(): void{
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.AUDIO_TRACK_OPTION_CLICK + this.trackOptionId,
        listeners: [this.trackOptionClickListener],
        bindObj: this
      });
    }

    trackOptionClickListener(e): void{
      const {type } = e.target.dataset;

      switch(type){
        case TrackOptionType.solo:
          this.soloClickListener();
          break;
        case TrackOptionType.mute:
          this.muteClickListener();
          break;
        case TrackOptionType.delete:
          this.deleteClickListener();
          break;
      }
    }

    soloClickListener(): void {      
      if(!this.isSolo) {
        this.isSolo = true;
        Controller.setSolo(this.trackId);
      }
      else {
        this.isSolo = false;
        Controller.unsetSolo(this.trackId);
      }

      this.render();
    }

    muteClickListener(): void {
      if(!this.isMute) {
        this.isMute = true;
        Controller.setMute(this.trackId);
      }
      else {
        this.isMute = false;
        Controller.unsetMute(this.trackId);
      }

      this.render();
    }

    deleteClickListener(): void {
      CommandController.executeDeleteTrackCommand(this.trackId);
    }
  };

  customElements.define('audi-track-option', AudioTrackOption);
})();
