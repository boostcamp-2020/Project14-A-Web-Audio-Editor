import { Controller } from '@controllers';
import { CursorType, EventKeyType, EventType, StoreChannelType, SectionDataType } from '@types';
import { EventUtil } from '@util';
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
    private trackCanvasElement: HTMLCanvasElement | undefined | null;
    private trackContainerElement: HTMLElement | null;
    private cutLineElement: HTMLElement | undefined | null;

    constructor() {
      super();
      this.trackId = 0;
      this.sectionId = 0;
      this.sectionData;
      this.cursorMode;
      this.canvasWidth = 0;
      this.canvasHeight = 0;
      this.trackCanvasElement;
      this.trackContainerElement = null;
      this.cutLineElement;
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
                <canvas class="audio-track-section" event-key=${EventKeyType.AUDIO_TRACK_SECTION_MULTIPLE + this.sectionId}></canvas>
            `;
    }

    initProperty(): void {
      this.cursorMode = Controller.getCursorMode();
      this.sectionData = Controller.getSectionData(this.trackId, this.sectionId);
      this.trackCanvasElement = this.querySelector<HTMLCanvasElement>('.audio-track-section');
      this.cutLineElement = document.getElementById(`section-cut-line-${this.trackId}`);
      this.trackContainerElement = document.querySelector('.audi-main-audio-track-container');
    }

    drawTrackSection(): void {
      if (!this.sectionData || !this.trackCanvasElement || !this.trackContainerElement) return;

      const { sectionChannelData, duration } = this.sectionData;
      this.calculateCanvasSize(duration);
      this.resizeCanvas();
      this.drawCanvas(sectionChannelData);
    }

    calculateCanvasSize(duration: number): void {
      if(!this.trackContainerElement || !this.trackCanvasElement) return;

      const trackWidth = this.trackContainerElement.getBoundingClientRect().right - this.trackContainerElement.getBoundingClientRect().left;
      const trackHeight = this.trackCanvasElement.clientHeight;
      this.canvasWidth = trackWidth / (300 / duration);
      this.canvasHeight = trackHeight;
    }

    resizeCanvas(): void {
      if(!this.trackCanvasElement) return;

      this.style.width = `${this.canvasWidth}px`;
      this.trackCanvasElement.width = this.canvasWidth;
      this.trackCanvasElement.style.width = `${this.canvasWidth}px`;
      this.trackCanvasElement.height = this.canvasHeight;
    }

    drawCanvas(sectionChannelData: number[]): void {
      if(!this.trackCanvasElement) return;

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

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click, EventType.mousemove, EventType.mouseout],
        eventKey: EventKeyType.AUDIO_TRACK_SECTION_MULTIPLE + this.sectionId,
        listeners: [this.trackSectionClickListener, this.trackSectionMouseMoveListener, this.trackSectionMouseoutListener],
        bindObj: this
      });
      window.addEventListener('resize', this.windowResizeListener.bind(this));
    }
    
    trackSectionClickListener(e): void {
      switch(this.cursorMode){
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
      Controller.splitTrackSection(cursorPosition, this.trackId, this.sectionId);
    }

    trackSectionMouseMoveListener(e): void {
      if (!this.trackContainerElement || this.cursorMode !== CursorType.CUT_MODE) return;

      const cursorPosition = e.pageX;
      const trackContainerLeftX = this.trackContainerElement.getBoundingClientRect().left;
      const cursorOffset = cursorPosition - trackContainerLeftX;
      
      this.showCutLine(cursorOffset);
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

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.CURSOR_MODE_CHANNEL, this.cursorModeObserverCallback, this);
    }

    cursorModeObserverCallback(newCursorMode){
      this.cursorMode = newCursorMode;
    }

    windowResizeListener(e){
      this.drawTrackSection();
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
