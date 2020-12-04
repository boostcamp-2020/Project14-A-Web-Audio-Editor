import { Controller } from '@controllers';
import { EventKeyType, EventType } from '@types';
import { EventUtil } from '@util';

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

    constructor() {
      super();
      this.trackId = 0;
      this.sectionId = 0;
      this.sectionData;
      this.trackCanvasElement;
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
      } catch (e) {
        console.log(e);
      }
    }

    render(): void {
      this.innerHTML = `
                <canvas class="audio-track-section" event-key=${EventKeyType.AUDIO_TRACK_SECTION_CLICK + this.sectionId}></canvas>
            `;
    }

    init(): void {
      this.trackCanvasElement = this.querySelector<HTMLCanvasElement>('.audio-track-section');
      this.sectionData = Controller.getSectionChannelData(this.trackId, this.sectionId);
    }

    draw(): void {
      if (!this.sectionData || !this.trackCanvasElement) return;

      const { sectionChannelData, duration } = this.sectionData;

      const trackWidth = this.trackCanvasElement.clientWidth;
      const canvasWidth = trackWidth / (300 / duration);
      this.trackCanvasElement.width = canvasWidth;
      this.trackCanvasElement.style.width = `${canvasWidth}px`;

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

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.AUDIO_TRACK_SECTION_CLICK + this.sectionId,
        listeners: [this.clickListener],
        bindObj: this
      });
    }

    clickListener(e): void {
      Controller.toggleFocus(this.trackId, this.sectionId, e.target);
    }
  };

  customElements.define('audi-track-section', AudioTrackSection);
})();
