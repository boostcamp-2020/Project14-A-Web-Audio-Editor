import { Controller } from '@controllers';
import { CursorType, EventKeyType, EventType } from '@types';
import { EventUtil, WidthUtil } from '@util';
import './AudioTrackSection.scss';

interface SectionData {
  sectionChannelData: number[];
  duration: number;
}

(() => {
  const AudioTrackSection = class extends HTMLElement {
    private trackId: number;
    private sectionId: number;
    private sectionData: SectionData | undefined;
    private trackCanvasElement: HTMLCanvasElement | undefined | null;
    private cutLineElement: HTMLElement | undefined | null;
    private trackContainerElement: HTMLElement | null;

    constructor() {
      super();
      this.trackId = 0;
      this.sectionId = 0;
      this.sectionData;
      this.trackCanvasElement;
      this.cutLineElement;
      this.trackContainerElement = null;
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
        this.init();
        this.draw();
        this.initEvent();
        this.initState();
      } catch (e) {
        console.log(e);
      }
    }

    render(): void {
      this.innerHTML = `
                <canvas class="audio-track-section" event-key=${EventKeyType.AUDIO_TRACK_SECTION_MULTIPLE + this.sectionId}></canvas>
            `;
    }

    init(): void {
      this.trackCanvasElement = this.querySelector<HTMLCanvasElement>('.audio-track-section');
      this.sectionData = Controller.getSectionChannelData(this.trackId, this.sectionId);
      this.cutLineElement = document.getElementById(`section-cut-line-${this.trackId}`);
      this.trackContainerElement = document.querySelector('.audi-main-audio-track-container');
    }

    draw(): void {
      if (!this.sectionData || !this.trackCanvasElement) return;

      const { sectionChannelData, duration } = this.sectionData;
      const trackWidth = this.trackCanvasElement.clientWidth;
      const trackHeight = this.trackCanvasElement.clientHeight;
      const canvasWidth = trackWidth / (300 / duration);

      this.style.width = `${canvasWidth}px`;
      this.trackCanvasElement.width = canvasWidth;
      this.trackCanvasElement.style.width = `${canvasWidth}px`;
      this.trackCanvasElement.height = trackHeight;

      const canvasHeight = this.trackCanvasElement.clientHeight;
      const canvasCtx = this.trackCanvasElement.getContext('2d');
      if (!canvasCtx) return;

      const numOfPeaks = sectionChannelData.length;
      const middleHeight = canvasHeight / 2;
      const defaultLineWidth = 1;

      canvasCtx.strokeStyle = '#2196f3';
      canvasCtx.lineWidth = defaultLineWidth / (numOfPeaks / 2 / canvasWidth);
      canvasCtx.beginPath();

      let offsetX = 0;
      let offsetY;
      for (let i = 0; i < numOfPeaks; i++) {
        offsetY = middleHeight + Math.floor((sectionChannelData[i] * canvasHeight) / 2);
        if (i % 2 == 0) canvasCtx.moveTo(offsetX, offsetY);
        else {
          canvasCtx.lineTo(offsetX, offsetY);
          offsetX += canvasCtx.lineWidth;
        }
      }
      canvasCtx.stroke();
    }

    initState(): void {
      const focusList = Controller.getFocusList();
      const focusInfo = focusList.find(focus => focus.trackSection.id === this.sectionId);
      if (!focusInfo || !this.trackCanvasElement) return;

      focusInfo.element = this.trackCanvasElement;
      focusInfo.element.classList.add('focused-section');
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click, EventType.mousemove, EventType.mouseout],
        eventKey: EventKeyType.AUDIO_TRACK_SECTION_MULTIPLE + this.sectionId,
        listeners: [this.clickListener, this.cutLineMouseMoveListener, this.mouseoutListener],
        bindObj: this
      });
    }

    clickListener(e): void {
      const cursorMode = Controller.getCursorMode();
      if (cursorMode === CursorType.SELECT_MODE) {
        Controller.toggleFocus(this.trackId, this.sectionId, e.target);
      } else if (cursorMode === CursorType.CUT_MODE) {
        const cursorPosition = e.pageX;
        Controller.splitCommand(cursorPosition, this.trackId, this.sectionId);
      }
    }

    cutLineMouseMoveListener(e): void {
      const cursorMode = Controller.getCursorMode();

      if (!this.cutLineElement || !this.trackContainerElement) return;

      if (cursorMode !== CursorType.CUT_MODE) {
        this.cutLineElement.classList.add('hide');
        return;
      }

      const cursorPosition = e.pageX;
      const startX = this.trackContainerElement.getBoundingClientRect().left;
      const endX = this.trackContainerElement.getBoundingClientRect().right;
      const cursorWidth = WidthUtil.getDifferenceWidth(startX, cursorPosition, endX - startX);

      this.cutLineElement.classList.remove('hide');
      this.cutLineElement.style.left = `${cursorWidth}px`;
    }

    mouseoutListener(e): void {
      if (!this.cutLineElement) return;

      this.cutLineElement.classList.add('hide');
    }
  };

  customElements.define('audi-track-section', AudioTrackSection);
})();
