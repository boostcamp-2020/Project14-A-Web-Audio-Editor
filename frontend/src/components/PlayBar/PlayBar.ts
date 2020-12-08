import { TimeUtil, MarkerEventUtil, EventUtil } from '@util';
import { EventType, EventKeyType, StoreChannelType } from '@types';
import { Controller } from '@controllers';
import { storeChannel } from "@store";
import './PlayBar.scss';

(() => {
  const PlayBar = class extends HTMLElement {
    private defaultStartX: number;
    private mainWidth: number;
    private maxTrackWidth: number;
    private maxTrackPlayTime: number;
    private playBarTimeDatas: string[];
    private totalPlayTime: string;
    private markerID: string;
    private markerElement: HTMLElement | null;
    private playBarElement: HTMLElement | null;
    private playBarContainerElement: HTMLElement | null;
    private playbarMarkerElementLeft: HTMLElement | null;
    private playbarMarkerElementRight: HTMLElement | null;
    private playbarMarkerBlurZoneElementLeft: HTMLElement | null;
    private playbarMarkerBlurZoneElementRight: HTMLElement | null;
    private trackScrollAreaElement: HTMLDivElement | null;

    constructor() {
      super();
      this.defaultStartX = 0;
      this.mainWidth = 0;
      this.markerElement = null;
      this.maxTrackWidth = 0;
      this.maxTrackPlayTime = Controller.getMaxTrackPlayTime();
      this.totalPlayTime = '';
      this.playBarTimeDatas = [];
      this.markerID = '';
      this.playBarElement = null;
      this.playBarContainerElement = null;
      this.playbarMarkerElementLeft = null;
      this.playbarMarkerElementRight = null;
      this.playbarMarkerBlurZoneElementLeft = null;
      this.playbarMarkerBlurZoneElementRight = null;
      this.trackScrollAreaElement = null;

      this.setPlayBarTimeInfo();
    }

    setPlayBarTimeInfo(): void {
      this.totalPlayTime = this.parseTotalPlayTime(this.maxTrackPlayTime);
      this.playBarTimeDatas = TimeUtil.getPlayBarTimes(this.maxTrackPlayTime);
    }

    parseTotalPlayTime(maxTrackPlayTime: number): string {
      const [minute, second] = TimeUtil.getSplitTime(maxTrackPlayTime);
      return `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
    }

    connectedCallback(): void {
      try{
        this.init();
      }catch(e){
        console.log(e);
      }
    }

    init(): void {
      this.render();
      this.initProperty();
      this.initPlayBarMarkerLocation();
      this.initEvent();
      this.subscribe();
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
                  ${this.getPlayBarTimes()}
                </div>
            `;
    }

    getPlayBarTimes(): string {
      return this.playBarTimeDatas.reduce((acc, time) => {
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

    initProperty(): void {
      this.playBarElement = document.querySelector('audi-playbar');
      this.playBarContainerElement = this.querySelector('.playbar');
      this.playbarMarkerElementLeft = document.getElementById('playbar-marker-left');
      this.playbarMarkerElementRight = document.getElementById('playbar-marker-right');
      this.playbarMarkerBlurZoneElementLeft = document.getElementById('playbar-marker-blur-zone-left');
      this.playbarMarkerBlurZoneElementRight = document.getElementById('playbar-marker-blur-zone-right');
      this.markerElement = document.querySelector('.marker');
      this.trackScrollAreaElement = document.querySelector('.audi-main-audio-track-scroll-area');

      if(this.playBarElement){
        this.defaultStartX = this.playBarElement.getBoundingClientRect().left;
        this.mainWidth = this.playBarElement.getBoundingClientRect().right - this.defaultStartX;
      }
    }

    initPlayBarMarkerLocation(): void {
      if (
        this.playbarMarkerElementLeft &&
        this.playbarMarkerElementRight &&
        this.playbarMarkerBlurZoneElementLeft &&
        this.playbarMarkerBlurZoneElementRight
      ) {
        this.playbarMarkerElementLeft.style.left = '99.3%';
        this.playbarMarkerElementRight.style.left = '0px';
        this.playbarMarkerBlurZoneElementLeft.style.left = '100%';
        this.playbarMarkerBlurZoneElementRight.style.left = '0px';
      }
    }

    initEvent(): void {
      if(!this.markerElement) return;

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

    compareCloseMarker(currentPosition: number): boolean {
      const markerLeft = Number(this.playbarMarkerElementLeft?.style.left.split(/px|%/).join(''));
      const markerRight = Number(this.playbarMarkerElementRight?.style.left.split('px').join(''));

      const offsetLeft = Math.abs(currentPosition - markerLeft);
      const offsetRight = Math.abs(currentPosition - markerRight);

      if (offsetLeft <= offsetRight) return true;
      return false;
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.MAX_TRACK_WIDTH_CHANNEL, this.maxTrackWidthObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.MAX_TRACK_PLAY_TIME_CHANNEL, this.maxTrackPlayTimeObserverCallback, this);
    }

    maxTrackWidthObserverCallback(maxTrackWidth: number): void {
      this.maxTrackWidth = maxTrackWidth;
      this.resizePlayBarContainer();
    }

    maxTrackPlayTimeObserverCallback(maxTrackPlayTime: number): void {
      this.maxTrackPlayTime = maxTrackPlayTime;
      this.setPlayBarTimeInfo();
      this.render();
      this.initProperty();
      this.initPlayBarMarkerLocation();
      this.resizePlayBarContainer();
    }

    resizePlayBarContainer(){     
      if(!this.playBarContainerElement || !this.trackScrollAreaElement) return;
      
      const scrollAreaWidth = this.trackScrollAreaElement.getBoundingClientRect().right - this.trackScrollAreaElement.getBoundingClientRect().left;
      const ratio = this.maxTrackWidth / scrollAreaWidth;

      this.playBarContainerElement.style.width = `${100 * ratio}%`;
    }
  };

  customElements.define('audi-playbar', PlayBar);
})();
export {};
