import { Controller } from '@controllers';
import { EventKeyType, EventType, StoreChannelType } from "@types";
import { EventUtil } from "@util";
import { storeChannel } from "@store";
import { TrackSection } from "@model";
import "./AudioTrack.scss";

(() => {
  const AudioTrack = class extends HTMLElement {
    private trackId: number;
    private trackMessage: HTMLDivElement | null;
    private trackDropzoneElement: HTMLDivElement | null;
    private trackSectionList: TrackSection[];

    constructor() {
      super();
      this.trackId = 0;
      this.trackMessage = null;
      this.trackDropzoneElement = null;
      this.trackSectionList = [];
    }

    static get observedAttributes(): string[] {
      return ['data-id'];
    }

    attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void {
      if (oldVal !== newVal) {
        switch (attrName) {
          case 'data-id':
            this.trackId = Number(newVal);
            break;
        }
        this[attrName] = newVal;
      }
    }

    connectedCallback(): void {
      try {
        this.render();
        this.initElement();
        this.initEvent();
        this.subscribe();
      } catch (e) {
        console.log(e);
      }
    }

    render(): void {
      this.innerHTML = `
                    <div class="audio-track-container" event-key=${EventKeyType.FOCUS_RESET_CLICK}>
                      <div class="audio-track-area" event-key=${EventKeyType.FOCUS_RESET_CLICK}>
                        ${this.getTrackSectionList()}
                        <div class="audio-track-message"><span>Drag & Drop</span></div>
                        <div class="audio-track-dropzone hide" event-key=${EventKeyType.AUDIO_TRACK_DRAGOVER_DROP + this.trackId}></div>
                      </div>      
                    </div>
                `;
    }

    getTrackSectionList(): string {
      return this.trackSectionList.reduce((acc, trackSection, idx) =>
        acc += `<audi-track-section data-id=${trackSection.id} data-track-id=${trackSection.trackId}></audi-track-section>`
        , "");
    }

    initElement(): void {
      this.trackMessage = this.querySelector('.audio-track-message');
      this.trackDropzoneElement = this.querySelector('.audio-track-dropzone');
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.dragover, EventType.drop, EventType.dragenter, EventType.dragleave],
        eventKey: EventKeyType.AUDIO_TRACK_DRAGOVER_DROP + this.trackId,
        listeners: [this.trackDragoverListener, this.trackDropListener, this.trackDragenterListener, this.trackDragleaveListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.FOCUS_RESET_CLICK,
        listeners: [this.focusResetListener],
        bindObj: this
      });
    }

    focusResetListener(e): void {
      const ctrlIsPressed = Controller.getCtrlIsPressed();
      if (!ctrlIsPressed) {
        Controller.resetFocus();
      }
    }

    trackDragoverListener(e): void {
      e.preventDefault();
      e.dataTransfer.dropEffect = "link";
    }

    trackDropListener(e): void {
      e.preventDefault();
      e.stopPropagation();
      const sourceId = e.dataTransfer.getData("text/plain");
      const source = Controller.getSourceBySourceId(Number(sourceId));
      if (!source) return;

      const { duration } = source;

      const trackSection = new TrackSection({
        id: 0,
        sourceId: source.id,
        trackId: this.trackId,
        channelStartTime: 0,
        channelEndTime: duration,
        parsedChannelStartTime: 0,
        parsedChannelEndTime: duration,
        trackStartTime: 0,
        audioStartTime: 0
      });

      Controller.addTrackSection(this.trackId, trackSection);
      this.hideMessage();
    }

    trackDragenterListener(e): void {
      e.preventDefault()
      this.trackDropzoneElement?.classList.add('focus');
    }

    trackDragleaveListener(e): void {
      e.preventDefault()
      this.trackDropzoneElement?.classList.remove('focus');
    }

    hideMessage(): void {
      this.trackMessage?.classList.add('hide');
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.TRACK_DRAG_STATE_CHANNEL, this.trackDragStateObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, this.trackSectionListObserverCallback, this);
    }

    trackDragStateObserverCallback(isTrackDraggable): void {
      if (isTrackDraggable) {
        this.activeTrackDropzone();
        return;
      }
      this.inactiveTrackDropzone();
    }

    activeTrackDropzone(): void {
      this.trackDropzoneElement?.classList.remove('hide');
    }

    inactiveTrackDropzone(): void {
      this.trackDropzoneElement?.classList.add('hide');
    }

    trackSectionListObserverCallback({ trackId, trackSectionList }): void {
      if (trackId !== this.trackId) return;

      this.trackSectionList = trackSectionList;
      this.render();
      this.initElement();
    }
  };

  customElements.define('audi-audio-track', AudioTrack);
})();

