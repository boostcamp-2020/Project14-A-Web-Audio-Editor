import { Controller, ZoomController } from '@controllers';
import { CursorType, EventKeyType, EventType, StoreChannelType } from '@types';
import { EventUtil, WidthUtil, DragUtil, TimeUtil } from '@util';
import { storeChannel } from '@store';
import { TrackSection, SectionDragStartData, SelectTrackData } from '@model';
import './AudioTrack.scss';

(() => {
  const AudioTrack = class extends HTMLElement {
    private trackId: number;
    private trackMessageElement: HTMLDivElement | null;
    private trackSectionList: TrackSection[];
    private trackAreaElement: HTMLDivElement | null;
    private trackScrollAreaElement: HTMLDivElement | null;
    private afterimageElement: HTMLDivElement | null;
    private trackAreaWidth: number;
    private maxTrackWidth: number;
    private sectionDragData: SectionDragStartData | null;
    private currentScrollAmount: number;

    constructor() {
      super();
      this.trackId = 0;
      this.trackMessageElement = null;
      this.trackSectionList = [];
      this.trackAreaElement = null;
      this.trackScrollAreaElement = null;
      this.afterimageElement = null;
      this.trackAreaWidth = 0;
      this.maxTrackWidth = 0;
      this.sectionDragData = null;
      this.currentScrollAmount = 0;
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

        const newMaxTrackWidth = this.calculateMaxTrackWidth();
        this.updateMaxTrackWidth(newMaxTrackWidth);
      } catch (e) {
        console.log(e);
      }
    }

    render(): void {
      this.innerHTML = `
                    <div class="audio-track-container" event-key=${EventKeyType.FOCUS_RESET_CLICK + this.trackId}>
                      <div data-track-id=${this.trackId} class="audio-track-area" event-key=${EventKeyType.AUDIO_TRACK_AREA_MULTIPLE + this.trackId}>
                        ${this.getTrackSectionList()}
                        <div id="section-cut-line-${this.trackId}" class="cut-line hide">
                          <div class="cut-line-border">
                            <div class="cut-line-cursor-time">00:00</div>
                          </div>
                        </div>
                        <div id="afterimage-${this.trackId}" class="audio-track-afterimage" event-key=${EventKeyType.AUDIO_TRACK_AFTERIMAGE_DROP + this.trackId}></div>
                        <div id="track-select-line-${this.trackId}" class="track-select-line"></div>
                      </div>      
                    </div>
                `;
    }
    getTrackSectionList(): string {
      const initTrack = Controller.getTrack(this.trackId);
      if (!initTrack) return '';
      this.trackSectionList = initTrack.trackSectionList;

      return this.trackSectionList.reduce(
        (acc, trackSection) => (acc += `<audi-track-section data-id=${trackSection.id} data-track-id=${trackSection.trackId}></audi-track-section>`),
        ''
      );
    }

    initElement(): void {
      this.maxTrackWidth = Controller.getMaxTrackWidth();
      this.trackMessageElement = this.querySelector('.audio-track-message');
      this.trackAreaElement = this.querySelector('.audio-track-area');
      this.trackScrollAreaElement = document.querySelector('.audi-main-audio-track-scroll-area');
      this.afterimageElement = this.querySelector(`#afterimage-${this.trackId}`);
      this.trackAreaWidth = this.calculateTrackWidth();
      this.trackScrollAreaElement = document.querySelector('.audi-main-audio-track-scroll-area');
    }

    calculateTrackWidth(): number {
      let trackWidth = 0;
      if (this.trackAreaElement) {
        trackWidth = this.trackAreaElement.getBoundingClientRect().right - this.trackAreaElement.getBoundingClientRect().left;
      }
      return trackWidth;
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click, EventType.dragover, EventType.dragleave, EventType.drop, EventType.dragenter, EventType.mousemove],
        eventKey: EventKeyType.AUDIO_TRACK_AREA_MULTIPLE + this.trackId,
        listeners: [
          this.trackClickListener,
          this.dragoverAudioTrackListener,
          this.dragleaveAudioTrackListener,
          this.dropAudioTrackListener,
          this.dragenterAudioTrackListener,
          this.trackMousemoveListener
        ],
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
      const currentPixelPerSecond = ZoomController.getCurrentPixelPerSecond();

      this.trackSectionList.forEach((section, idx) => {
        const marginValue = (section.trackStartTime - prevEndOffset) * currentPixelPerSecond;
        if (!trackSectionElements[idx]) return;
        trackSectionElements[idx].style.marginLeft = `${marginValue}px`;
        prevEndOffset = section.trackStartTime + section.length;
      });
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

      DragUtil.showAfterimage(this.afterimageElement, this.trackId, this.trackAreaWidth, currentCursorPosition);
    }

    dropAudioTrackListener(e): void {
      e.preventDefault();
      e.stopPropagation();

      if (!this.afterimageElement) return;
      this.afterimageElement.style.display = 'none';

      const scrollAmount = Controller.getCurrentScrollAmount();
      const currentCursorPosition = e.pageX + scrollAmount;
      const currentTrackId: number = Number(e.target.dataset.trackId);

      DragUtil.dropTrackSection(currentTrackId, currentCursorPosition, this.trackAreaWidth);
    }

    trackMousemoveListener(e): void {
      if (!this.trackScrollAreaElement) return;

      const cursorPosition = e.pageX;
      const scrolledCursorPosition = cursorPosition + this.currentScrollAmount;
      const trackScrollAreaLeft = this.trackScrollAreaElement.getBoundingClientRect().left;
      const timeOfCursorPosition = TimeUtil.calculateTimeOfCursorPosition(trackScrollAreaLeft, scrolledCursorPosition);

      const [minute, second, milsecond] = TimeUtil.splitTime(timeOfCursorPosition);
      const offesetOfCursorPosition = WidthUtil.getDifferenceWidth(trackScrollAreaLeft, cursorPosition);

      if (minute < 0 && second < 0) return;
      Controller.changeCurrentPosition(offesetOfCursorPosition);
      Controller.changeCursorStringTime(minute, second, milsecond);
      Controller.changeCursorNumberTime(timeOfCursorPosition);
    }

    trackClickListener(e): void {
      const ctrlIsPressed = Controller.getCtrlIsPressed();
      if (!ctrlIsPressed) {
        Controller.resetFocus();

        if (!this.trackAreaElement) return;
        const cursorPosition = e.pageX;
        const trackAreaElementLeftX = this.trackAreaElement.getBoundingClientRect().left;

        const secondPerPixel = ZoomController.getCurrentPixelPerSecond();

        const cursorOffset = cursorPosition - trackAreaElementLeftX;
        const selectedTime = cursorOffset / secondPerPixel;
        const selectLine = document.getElementById(`track-select-line-${this.trackId}`);
        const cursorMode = Controller.getCursorMode();
        if (!selectLine) return;

        if (cursorMode !== CursorType.SELECT_MODE) {
          Controller.changeSelectTrackData(0, 0);
          selectLine.style.display = 'none';
          return;
        }
        selectLine.style.display = 'block';
        selectLine.style.left = `${cursorOffset}px`;

        Controller.changeSelectTrackData(this.trackId, selectedTime);
      }
    }

    focusResetListener(e): void {
      const ctrlIsPressed = Controller.getCtrlIsPressed();
      if (!ctrlIsPressed) {
        Controller.resetFocus();
        Controller.changeSelectTrackData(0, 0);
      }
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, this.trackSectionListObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.MAX_TRACK_WIDTH_CHANNEL, this.maxTrackWidthObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.SELECT_AUDIO_TRACK, this.selectTrackDataObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.CURRENT_SCROLL_AMOUNT_CHANNEL, this.currentScrollAmountObserverCallback, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, this.trackSectionListObserverCallback, this);
      storeChannel.unsubscribe(StoreChannelType.MAX_TRACK_WIDTH_CHANNEL, this.maxTrackWidthObserverCallback, this);
      storeChannel.unsubscribe(StoreChannelType.SELECT_AUDIO_TRACK, this.selectTrackDataObserverCallback, this);
      storeChannel.unsubscribe(StoreChannelType.CURRENT_SCROLL_AMOUNT_CHANNEL, this.currentScrollAmountObserverCallback, this);
    }

    currentScrollAmountObserverCallback(newCurrentScrollAmount: number): void {
      this.currentScrollAmount = newCurrentScrollAmount;
    }

    trackSectionListObserverCallback({ trackId, trackSectionList }): void {
      if (trackId !== this.trackId || !this.trackScrollAreaElement) return;

      this.trackSectionList = trackSectionList;
      this.render();
      this.initElement();
      this.initPosition();

      const newMaxTrackWidth = this.calculateMaxTrackWidth();

      this.updateMaxTrackWidth(newMaxTrackWidth);
      Controller.changeMaxTrackPlayTime(newMaxTrackWidth);
    }

    updateMaxTrackWidth(newMaxTrackWidth: number): void {
      this.resizeTrackArea(newMaxTrackWidth);
      if (this.maxTrackWidth < newMaxTrackWidth) {
        Controller.changeMaxTrackWidth(newMaxTrackWidth);
      }
    }

    calculateMaxTrackWidth(): number {
      const trackSectionListElement: NodeListOf<HTMLElement> = this.querySelectorAll('audi-track-section');


      if (!this.trackAreaElement || trackSectionListElement.length === 0) {
        return Math.max(this.trackAreaWidth, this.maxTrackWidth);
      }

      const { left: areaLeftX } = this.trackAreaElement.getBoundingClientRect();
      const lastTrackSectionElement = trackSectionListElement[trackSectionListElement.length - 1];
      const lastTrackSectionRightX = lastTrackSectionElement.getBoundingClientRect().right;

      const widthOfTrackSections = lastTrackSectionRightX - areaLeftX;
      const maxTrackWidth = Math.max(this.trackAreaWidth, widthOfTrackSections, this.maxTrackWidth);

      return maxTrackWidth;
    }

    maxTrackWidthObserverCallback(maxTrackWidth: number): void {
      this.maxTrackWidth = maxTrackWidth;
      this.resizeTrackArea(maxTrackWidth);
    }

    selectTrackDataObserverCallback(selectTrackData: SelectTrackData): void {
      if (selectTrackData.trackId !== this.trackId) {
        const selectLine = document.getElementById(`track-select-line-${this.trackId}`);
        if (!selectLine) return;
        selectLine.style.display = 'none';
      }
    }

    resizeTrackArea(maxTrackWidth: number) {
      if (!this.trackAreaElement || !this.trackScrollAreaElement) return;

      const scrollAreaWidth = this.trackScrollAreaElement.getBoundingClientRect().right - this.trackScrollAreaElement.getBoundingClientRect().left;
      const ratio = maxTrackWidth / scrollAreaWidth;

      this.trackAreaElement.style.width = `${100 * ratio}%`;
    }

  };

  customElements.define('audi-audio-track', AudioTrack);
})();
