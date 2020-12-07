import './PlayBar.scss';
import { PlayBarUtil, MarkerEventUtil } from '@util';
import { EventUtil } from '@util';
import { EventType, EventKeyType } from '@types';
import { Controller } from '@controllers';

const INIT_DURATION = 300;

(() => {
  const PlayBar = class extends HTMLElement {
    private defaultStartX: number;
    private playBarElement: HTMLElement | null;
    private playbarMarkerElementLeft: HTMLElement | null;
    private playbarMarkerElementRight: HTMLElement | null;
    private playbarMarkerBlurZoneElementLeft: HTMLElement | null;
    private playbarMarkerBlurZoneElementRight: HTMLElement | null;
    private mainWidth: number;
    private markerElement: HTMLElement | null;
    private playtime: string[];
    private totalPlayTime: string;
    private markerID: string;

    constructor() {
      super();
      this.defaultStartX = 0;
      this.mainWidth = 0;
      this.playBarElement = null;
      this.playbarMarkerElementLeft = null;
      this.playbarMarkerElementRight = null;
      this.playbarMarkerBlurZoneElementLeft = null;
      this.playbarMarkerBlurZoneElementRight = null;
      this.markerElement = null;
      this.playtime = [];
      this.totalPlayTime = '';
      this.markerID = '';
    }

    connectedCallback(): void {
      this.totalPlayTime = this.getTotalTime();
      this.playtime = PlayBarUtil.getStringTime(INIT_DURATION);
      this.init();
    }

    init(): void {
      this.render();
      this.initElement();
      this.initEvent();
      this.initPlayBarMarkerLocation();
    }

    render(): void {
      this.innerHTML = `
                <div class='playbar'>
                  <div class='playbar-event-zone' droppable='true' event-key=${EventKeyType.PLAYBAR_MULTIPLE}>
                    <audi-playbar-marker type='right'></audi-playbar-marker>
                    <audi-playbar-marker type='left'></audi-playbar-marker>
                  </div> 
                  <audi-playbar-marker-blur-zone type='right'></audi-playbar-marker-blur-zone>
                  <audi-playbar-marker-blur-zone type='left'></audi-playbar-marker-blur-zone>
                  ${this.setStringTime()}
                </div>
            `;
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.mousemove, EventType.dblclick, EventType.click, EventType.dragover, EventType.drop],
        eventKey: EventKeyType.PLAYBAR_MULTIPLE,
        listeners: [
          MarkerEventUtil.mousemoveMarkerListener(this, this.defaultStartX, this.mainWidth),
          this.dblclickPlayBarListener,
          MarkerEventUtil.clickMarkerListener(this.markerElement),
          this.dragoverPlayBarListener,
          this.dropPlayBarListener
        ],
        bindObj: this
      });

      this.addEventListener('dragstart', this.dragStartPlayBarMarkerListener.bind(this));
    }

    initElement(): void {
      this.playBarElement = document.querySelector('audi-playbar');
      this.playbarMarkerElementLeft = document.getElementById('playbar-marker-left');
      this.playbarMarkerElementRight = document.getElementById('playbar-marker-right');
      this.playbarMarkerBlurZoneElementLeft = document.getElementById('playbar-marker-blur-zone-left');
      this.playbarMarkerBlurZoneElementRight = document.getElementById('playbar-marker-blur-zone-right');
      this.markerElement = document.querySelector('.marker');
      this.defaultStartX = this.playBarElement?.getBoundingClientRect().left;
      this.mainWidth = this.playBarElement?.getBoundingClientRect().right - this.defaultStartX;
    }

    initPlayBarMarkerLocation(): void {
      if (
        this.playbarMarkerElementLeft &&
        this.playbarMarkerElementRight &&
        this.playbarMarkerBlurZoneElementLeft &&
        this.playbarMarkerBlurZoneElementRight
      ) {
        this.playbarMarkerElementLeft.style.left = '100%';
        this.playbarMarkerElementRight.style.left = '0px';
        this.playbarMarkerBlurZoneElementLeft.style.left = '100%';
        this.playbarMarkerBlurZoneElementRight.style.left = '0px';
      }
    }

    dragStartPlayBarMarkerListener(e): void {
      this.markerID = e.target.getAttribute('id').split('-')[2];
      const dragImage = document.createElement('div');
      dragImage.style.visibility = 'hidden';
      e.dataTransfer.setDragImage(dragImage, 0, 0);
    }

    dragoverPlayBarListener(e): void {
      e.preventDefault();
      const movingWidth: number = e.pageX - this.defaultStartX;

      if (this.markerID === 'left' && this.playbarMarkerElementLeft) {
        this.playbarMarkerElementLeft.style.left = `${movingWidth}px`;

        if (this.playbarMarkerBlurZoneElementLeft) {
          const blurZone = this.mainWidth - movingWidth;
          this.playbarMarkerBlurZoneElementLeft.style.width = `${blurZone}px`;
          this.playbarMarkerBlurZoneElementLeft.style.left = `${movingWidth}px`;
        }
        return;
      }

      if (this.playbarMarkerElementRight) {
        this.playbarMarkerElementRight.style.left = `${movingWidth}px`;

        if (this.playbarMarkerBlurZoneElementRight) {
          this.playbarMarkerBlurZoneElementRight.style.width = `${movingWidth}px`;
        }
      }
    }

    dropPlayBarListener(e): void {
      e.preventDefault();
    }

    dblclickPlayBarListener(): void {
      if (
        !this.playbarMarkerElementLeft ||
        !this.playbarMarkerElementRight ||
        !this.playbarMarkerBlurZoneElementLeft ||
        !this.playbarMarkerBlurZoneElementRight
      )
        return;

      const [currentPosition] = Controller.getCurrentPosition();
      if (this.compareCloseMarker(currentPosition)) {
        const blurZone = this.mainWidth - currentPosition;
        this.playbarMarkerElementLeft.style.left = `${currentPosition}px`;
        this.playbarMarkerBlurZoneElementLeft.style.width = `${blurZone}px`;
        this.playbarMarkerBlurZoneElementLeft.style.left = `${currentPosition}px`;
        return;
      }

      this.playbarMarkerElementRight.style.left = `${currentPosition}px`;
      this.playbarMarkerBlurZoneElementRight.style.width = `${currentPosition}px`;
    }

    setStringTime(): string {
      return this.playtime.reduce((acc, time) => {
        if (time === '00:00' || time === this.totalPlayTime) {
          return (acc += `<div class='playbar-time-none'></div>`);
        }

        return (acc += `
            <div class='playbar-time'>
                <div>${time}</div>
                <div>|</div>
            </div>
        `);
      }, '');
    }

    getTotalTime(): string {
      const [minute, second] = PlayBarUtil.setTime(INIT_DURATION);
      return `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
    }

    compareCloseMarker(currentPosition: number): boolean {
      const markerLeft = Number(this.playbarMarkerElementLeft?.style.left.split(/px|%/).join(''));
      const markerRight = Number(this.playbarMarkerElementRight?.style.left.split('px').join(''));

      const offsetLeft = Math.abs(currentPosition - markerLeft);
      const offsetRight = Math.abs(currentPosition - markerRight);

      if (offsetLeft <= offsetRight) return true;

      return false;
    }
  };

  customElements.define('audi-playbar', PlayBar);
})();
export {};
