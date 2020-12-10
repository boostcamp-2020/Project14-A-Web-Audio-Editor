import { Controller } from '@controllers';
import { EventKeyType, EventType, StoreChannelType } from '@types';
import { EventUtil, TimeUtil, WidthUtil, ValidUtil, DragUtil } from '@util';
import { storeChannel } from '@store';
import { TrackSection, SectionDragStartData } from '@model';
import './AudioTrack.scss';

(() => {
  const AudioTrack = class extends HTMLElement {
    private trackId: number;
    private trackMessageElement: HTMLDivElement | null;
    private trackDropzoneElement: HTMLDivElement | null;
    private trackSectionList: TrackSection[];
    private trackAreaElement: HTMLDivElement | null;
    private trackScrollAreaElement: HTMLDivElement | null;
    private afterimageElement: HTMLDivElement | null;
    private trackWidth: number;
    private maxTrackWidth: number;
    private maxTrackPlayTime: number;
    private sectionDragData: SectionDragStartData | null;

    constructor() {
      super();
      this.trackId = 0;
      this.trackMessageElement = null;
      this.trackDropzoneElement = null;
      this.trackSectionList = [];
      this.trackAreaElement = null;
      this.trackScrollAreaElement = null;
      this.afterimageElement = null;
      this.trackWidth = 0;
      this.maxTrackWidth = 0;
      this.maxTrackPlayTime = 0;
      this.sectionDragData = null;
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
        this.initPosition();
        this.subscribe();
      } catch (e) {
        console.log(e);
      }
    }
    
    render(): void {
      this.innerHTML = `
                    <div class="audio-track-container" event-key=${EventKeyType.FOCUS_RESET_CLICK + this.trackId}>
                      <div data-track-id=${this.trackId} class="audio-track-area" event-key=${EventKeyType.AUDIO_TRACK_AREA_MULTIPLE + this.trackId}>
                        ${this.getTrackSectionList()}
                        <div class="audio-track-message"><span>Drag & Drop</span></div>
                        <div id="section-cut-line-${this.trackId}" class="cut-line"></div>
                        <div id="afterimage-${this.trackId}" class="audio-track-afterimage" event-key=${EventKeyType.AUDIO_TRACK_AFTERIMAGE_DROP + this.trackId}></div>
                      </div>      
                    </div>
                `;
    }

    getTrackSectionList(): string {     
      return this.trackSectionList.reduce(
        (acc, trackSection) => (acc += `<audi-track-section data-id=${trackSection.id} data-track-id=${trackSection.trackId}></audi-track-section>`),
        ''
      );
    }

    initElement(): void {
      this.maxTrackWidth = Controller.getMaxTrackWidth();
      this.maxTrackPlayTime = Controller.getMaxTrackPlayTime();
      this.trackMessageElement = this.querySelector('.audio-track-message');
      this.trackDropzoneElement = this.querySelector('.audio-track-dropzone');
      this.trackAreaElement = this.querySelector('.audio-track-area');
      this.trackScrollAreaElement = document.querySelector('.audi-main-audio-track-scroll-area');
      this.afterimageElement = this.querySelector(`#afterimage-${this.trackId}`);
      
      if(this.trackAreaElement){
        this.trackWidth = this.trackAreaElement.getBoundingClientRect().right - this.trackAreaElement.getBoundingClientRect().left;
      }
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click, EventType.dragover, EventType.dragleave, EventType.drop, EventType.dragenter],
        eventKey: EventKeyType.AUDIO_TRACK_AREA_MULTIPLE + this.trackId,
        listeners: [this.focusResetListener, this.dragoverAudioTrackListener, this.dragleaveAudioTrackListener, this.dropAudioTrackListener, this.dragenterAudioTrackListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.FOCUS_RESET_CLICK + this.trackId,
        listeners: [this.focusResetListener],
        bindObj: this
      });
    }

    initPosition(): void {
      let prevEndOffset = 0;
      const trackSectionElements: NodeListOf<HTMLElement> = this.querySelectorAll('audi-track-section');

      if (!this.trackAreaElement || trackSectionElements.length === 0) return;
      const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
      const secondPerPixel = WidthUtil.getPixelPerSecond(this.trackWidth, maxTrackPlayTime);
      this.trackSectionList.forEach((section, idx) => {

        const marginValue = (section.trackStartTime - prevEndOffset) * secondPerPixel;
        if (!trackSectionElements[idx]) return;
        trackSectionElements[idx].style.marginLeft = `${marginValue}px`;
        prevEndOffset = section.trackStartTime + section.length;
      })
    }

    dragenterAudioTrackListener(e): void {
      e.preventDefault();
      e.stopPropagation();
      if (!this.afterimageElement) return;
      this.sectionDragData = Controller.getSectionDragStartData();
      this.afterimageElement.style.display = 'block';
    }

    dragleaveAudioTrackListener(e): void {
      e.preventDefault();
      e.stopPropagation();
      if (!this.afterimageElement) return;

      this.afterimageElement.style.display = 'none';
      this.afterimageElement.style.left = `0px`;
      this.afterimageElement.style.width = `0px`;
    }

    dragoverAudioTrackListener(e): void {
      e.preventDefault();
      if (!this.afterimageElement) return;

      const scrollAmount = Controller.getCurrentScrollAmount();
      const currentCursorPosition = e.pageX + scrollAmount;

      DragUtil.showAfterimage(this.afterimageElement, this.trackId, this.trackWidth, currentCursorPosition);
    }

    dropAudioTrackListener(e): void {
      e.preventDefault();
      e.stopPropagation();

      if (!this.afterimageElement) return;
      this.afterimageElement.style.display = 'none';

      const scrollAmount = Controller.getCurrentScrollAmount();
      const currentCursorPosition = e.pageX + scrollAmount;
      const currentTrackId: number = Number(e.target.dataset.trackId);

      DragUtil.dropTrackSection(currentTrackId, currentCursorPosition, this.trackWidth);
    }

    focusResetListener(e): void {
      const ctrlIsPressed = Controller.getCtrlIsPressed();
      if (!ctrlIsPressed) {
        Controller.resetFocus();
      }
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.TRACK_DRAG_STATE_CHANNEL, this.trackDragStateObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, this.trackSectionListObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.MAX_TRACK_WIDTH_CHANNEL, this.maxTrackWidthObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.MAX_TRACK_PLAY_TIME_CHANNEL, this.maxTrackPlayTimeObserverCallback, this);
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
      if (trackId !== this.trackId || !this.trackScrollAreaElement) return;

      this.trackSectionList = trackSectionList;
      this.render();
      this.initElement();
      this.initPosition();
      this.messageDisplayHandler();

      const scrollWidth = this.trackScrollAreaElement.scrollWidth;
      Controller.changeMaxTrackWidth(scrollWidth);  
      Controller.changeMaxTrackPlayTime(trackSectionList);

      if(this.maxTrackWidth === scrollWidth)
        this.resizeTrackArea(scrollWidth);
    }

    messageDisplayHandler(): void {
      if (!this.trackMessageElement) return;

      if (this.trackSectionList.length > 0) this.trackMessageElement.classList.add('hide');
      else this.trackMessageElement.classList.remove('hide');
    }

    maxTrackWidthObserverCallback(maxTrackWidth: number): void {
      this.maxTrackWidth = maxTrackWidth;
      this.resizeTrackArea(maxTrackWidth);
    }

    resizeTrackArea(maxTrackWidth: number) {
      if (!this.trackAreaElement || !this.trackScrollAreaElement) return;

      const scrollAreaWidth = this.trackScrollAreaElement.getBoundingClientRect().right - this.trackScrollAreaElement.getBoundingClientRect().left;
      const ratio = maxTrackWidth / scrollAreaWidth;

      this.trackAreaElement.style.width = `${100 * ratio}%`;
    }

    maxTrackPlayTimeObserverCallback(maxTrackPlayTime: number): void {
      this.maxTrackPlayTime = maxTrackPlayTime;
    }
  };

  customElements.define('audi-audio-track', AudioTrack);
})();
