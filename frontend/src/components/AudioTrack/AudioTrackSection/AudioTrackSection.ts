import { Controller, CommandController } from '@controllers';
import { CursorType, EventKeyType, EventType, StoreChannelType, SectionDataType } from '@types';
import { EventUtil, TimeUtil, ValidUtil, WidthUtil, DragUtil } from '@util';
import { storeChannel } from '@store';
import './AudioTrackSection.scss';

(() => {
  const AudioTrackSection = class extends HTMLElement {
    private trackId: number;
    private sectionId: number;
    private sectionData: SectionDataType | undefined;
    private cursorMode: CursorType | undefined;
    private canvasWidth: number;
    private canvasHeight: number;
    private maxTrackPlayTime: number;
    private maxTrackWidth: number;
    private currentScrollAmount: number;
    private trackCanvasElement: HTMLCanvasElement | undefined | null;
    private trackContainerElement: HTMLElement | null;
    private trackAreaElement: HTMLElement | null;
    private trackScrollAreaElement: HTMLElement | null;
    private cutLineElement: HTMLElement | undefined | null;
    private trackContainerWidth: number;
    private trackAfterimageElement: HTMLElement | null;

    constructor() {
      super();
      this.trackId = 0;
      this.sectionId = 0;
      this.sectionData;
      this.cursorMode;
      this.canvasWidth = 0;
      this.canvasHeight = 0;
      this.maxTrackWidth = 0;
      this.maxTrackPlayTime = 0;
      this.currentScrollAmount = 0;
      this.trackCanvasElement;
      this.trackContainerElement = null;
      this.trackAreaElement = null;
      this.trackScrollAreaElement = null;
      this.cutLineElement;
      this.trackContainerWidth = 0;
      this.trackAfterimageElement = null;
    }

    static get observedAttributes(): string[] {
      return ['data-id', 'data-track-id'];
    }

    attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void {
      if (oldVal !== newVal) {
        switch (attrName) {
          case 'data-id':
            this.sectionId = Number(newVal);
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
        this.initProperty();
        this.drawTrackSection();
        this.initEvent();
        this.initState();
        this.subscribe();
      } catch (e) {
        console.log(e);
      }
    }

    render(): void {
      this.innerHTML = `
                <canvas draggable="true" class="audio-track-section" event-key=${EventKeyType.AUDIO_TRACK_SECTION_MULTIPLE + this.sectionId}></canvas>
            `;
    }

    initProperty(): void {
      this.cursorMode = Controller.getCursorMode();
      this.sectionData = Controller.getSectionData(this.trackId, this.sectionId);
      this.maxTrackWidth = Controller.getMaxTrackWidth();
      this.maxTrackPlayTime = Controller.getMaxTrackPlayTime();
      this.currentScrollAmount = Controller.getCurrentScrollAmount();
      this.trackCanvasElement = this.querySelector<HTMLCanvasElement>('.audio-track-section');
      this.cutLineElement = document.getElementById(`section-cut-line-${this.trackId}`);
      this.trackContainerElement = document.querySelector('.audi-main-audio-track-container');
      this.trackAreaElement = document.querySelector('.audio-track-area');
      this.trackScrollAreaElement = document.querySelector('.audi-main-audio-track-scroll-area');
      this.trackAfterimageElement = document.querySelector(`#afterimage-${this.trackId}`);

      if (this.trackContainerElement) {
        this.trackContainerWidth = this.trackContainerElement.getBoundingClientRect().right - this.trackContainerElement.getBoundingClientRect().left;
      }
    }

    drawTrackSection(): void {
      if (!this.sectionData || !this.trackCanvasElement || !this.trackContainerElement) return;

      const { sectionChannelData, duration } = this.sectionData;
      this.calculateCanvasSize(duration);
      this.resizeCanvas();
      this.drawCanvas(sectionChannelData);
      this.resizeTrackArea();
    }

    calculateCanvasSize(duration: number): void {
      if (!this.trackContainerElement || !this.trackAreaElement) return;

      const trackWidth = this.trackAreaElement.getBoundingClientRect().right - this.trackAreaElement.getBoundingClientRect().left;
      const trackHeight = this.trackAreaElement.clientHeight;

      if (this.maxTrackWidth > trackWidth)
        this.canvasWidth = this.maxTrackWidth / (this.maxTrackPlayTime / duration);
      else
        this.canvasWidth = trackWidth / (this.maxTrackPlayTime / duration);

      this.canvasHeight = trackHeight;;
    }

    resizeCanvas(): void {
      if (!this.trackCanvasElement) return;

      this.style.width = `${this.canvasWidth}px`;
      this.trackCanvasElement.width = this.canvasWidth;
      this.trackCanvasElement.style.width = `${this.canvasWidth}px`;
      this.trackCanvasElement.height = this.canvasHeight;
    }

    drawCanvas(sectionChannelData: number[]): void {
      if (!this.trackCanvasElement) return;

      const canvasCtx = this.trackCanvasElement.getContext('2d');
      if (!canvasCtx) return;

      const numOfPeaks = sectionChannelData.length;
      const middleHeight = this.canvasHeight / 2;
      const defaultLineWidth = 1;

      canvasCtx.strokeStyle = '#2196f3';
      canvasCtx.lineWidth = defaultLineWidth / (numOfPeaks / 2 / this.canvasWidth);
      canvasCtx.beginPath();

      let offsetX = 0;
      let offsetY;
      for (let i = 0; i < numOfPeaks; i++) {
        offsetY = middleHeight + Math.floor((sectionChannelData[i] * this.canvasHeight) / 2);
        if (i % 2 == 0) canvasCtx.moveTo(offsetX, offsetY);
        else {
          canvasCtx.lineTo(offsetX, offsetY);
          offsetX += canvasCtx.lineWidth;
        }
      }
      canvasCtx.stroke();
    }

    resizeTrackArea() {
      if (!this.trackScrollAreaElement || !this.trackAreaElement) return;

      const scrollAreaWidth = this.trackScrollAreaElement.getBoundingClientRect().right - this.trackScrollAreaElement.getBoundingClientRect().left;
      const ratio = this.maxTrackWidth / scrollAreaWidth;

      this.trackAreaElement.style.width = `${100 * ratio}%`;
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click, EventType.mousemove, EventType.mouseout, EventType.dragstart, EventType.dragover, EventType.drop],
        eventKey: EventKeyType.AUDIO_TRACK_SECTION_MULTIPLE + this.sectionId,
        listeners: [
          this.trackSectionClickListener,
          this.trackSectionMouseMoveListener,
          this.trackSectionMouseoutListener,
          this.trackSectiondragStartListener,
          this.trackSectiondragoverListener,
          this.trackSectiondropListener
        ],
        bindObj: this
      });
      window.addEventListener('resize', this.windowResizeListener.bind(this));
    }

    trackSectiondragoverListener(e): void {
      e.preventDefault();
      if (!this.trackAfterimageElement) return;

      const currentCursorPosition = e.pageX + this.currentScrollAmount;

      DragUtil.showAfterimage(this.trackAfterimageElement, this.trackId, this.trackContainerWidth, currentCursorPosition);
    }

    trackSectiondropListener(e): void {
      e.preventDefault();
      e.stopPropagation();

      const currentCursorPosition = e.pageX + this.currentScrollAmount;

      DragUtil.dropTrackSection(this.trackId, currentCursorPosition, this.trackContainerWidth);
    }

    trackSectiondragStartListener(e): void {
      if (!this.trackContainerElement) return;
      const offsetLeft = this.trackContainerElement.getBoundingClientRect().left;

      this.maxTrackPlayTime = Controller.getMaxTrackPlayTime();
      const prevCursorPosition = e.pageX;
      const prevCursorTime = TimeUtil.calculateTimeOfCursorPosition(offsetLeft, prevCursorPosition, this.trackContainerWidth, this.maxTrackPlayTime);
      const trackSection = Controller.getTrackSection(this.trackId, this.sectionId);

      if (!trackSection) return;
      const currentScrollTime = Controller.getCurrentScrollTime();
      const sectionDragStartData = { trackSection, prevCursorTime: prevCursorTime + currentScrollTime, offsetLeft };

      Controller.changeSectionDragStartData(sectionDragStartData);
      e.dataTransfer.effectAllowed = 'move';

      const dragImage = document.createElement('div');
      dragImage.style.visibility = 'hidden';
      e.dataTransfer.setDragImage(dragImage, 0, 0);
    }

    trackSectionClickListener(e): void {
      switch (this.cursorMode) {
        case CursorType.SELECT_MODE:
          this.selectModeClickHandler(e);
          break;
        case CursorType.CUT_MODE:
          this.cutModeClickHandler(e);
          break;
      }
    }

    selectModeClickHandler(e): void {
      const trackSectionElement = e.target;
      Controller.toggleFocus(this.trackId, this.sectionId, trackSectionElement);
    }

    cutModeClickHandler(e): void {
      const cursorPosition = e.pageX;
      CommandController.executeSplitCommand(cursorPosition, this.trackId, this.sectionId);
    }

    trackSectionMouseMoveListener(e): void {
      if (!this.trackContainerElement || this.cursorMode !== CursorType.CUT_MODE) {
        this.hideCutLine();
        return;
      }
      const cursorPosition = e.pageX;
      const trackContainerLeftX = this.trackContainerElement.getBoundingClientRect().left;
      const cursorOffset = cursorPosition - trackContainerLeftX;

      this.showCutLine(cursorOffset + this.currentScrollAmount);
    }

    trackSectionMouseoutListener(e): void {
      this.hideCutLine();
    }

    hideCutLine(): void {
      if (!this.cutLineElement) return;
      this.cutLineElement?.classList.add('hide');
    }

    showCutLine(location: number): void {
      if (!this.cutLineElement) return;
      this.cutLineElement?.classList.remove('hide');
      this.cutLineElement.style.left = `${location}px`;
    }

    windowResizeListener(e) {
      this.drawTrackSection();
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.CURSOR_MODE_CHANNEL, this.cursorModeObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.CURRENT_SCROLL_AMOUNT_CHANNEL, this.currentScrollAmountObserverCallback, this);
    }

    cursorModeObserverCallback(newCursorMode) {
      this.cursorMode = newCursorMode;
    }

    currentScrollAmountObserverCallback(newCurrentScrollAmount: number): void {
      this.currentScrollAmount = newCurrentScrollAmount;
    }

    initState(): void {
      const focusList = Controller.getFocusList();
      const focusInfo = focusList.find(focus => focus.trackSection.id === this.sectionId);
      if (!focusInfo || !this.trackCanvasElement) return;

      focusInfo.element = this.trackCanvasElement;
      focusInfo.element.classList.add('focused-section');
    }
  };

  customElements.define('audi-track-section', AudioTrackSection);
})();
