import { TimeUtil, MarkerEventUtil, EventUtil } from '@util';
import { EventType, EventKeyType, StoreChannelType } from '@types';
import { Controller } from '@controllers';
import { storeChannel } from "@store";
import './PlayBar.scss';

(() => {
  const PlayBar = class extends HTMLElement {
    private playBarLeftX: number;
    private playBarWidth: number;
    private maxTrackWidth: number;
    private maxTrackPlayTime: number;
    private playBarTimeDatas: string[];
    private totalPlayTime: string;
    private markerID: string;
    private currentScrollAmount: number;
    private playBarContainerElement: HTMLElement | null;
    private playbarMarkerElementLeft: HTMLElement | null;
    private playbarMarkerElementRight: HTMLElement | null;
    private playbarMarkerBlurZoneElementLeft: HTMLElement | null;
    private playbarMarkerBlurZoneElementRight: HTMLElement | null;
    private playbarTimeElements: NodeListOf<HTMLDivElement> | null;
    private markerElement: HTMLElement | null;
    private trackScrollAreaElement: HTMLDivElement | null;
    private zoombarControllerElement: HTMLDivElement | null;

    constructor() {
      super();
      this.playBarLeftX = 0;
      this.playBarWidth = 0;
      this.maxTrackWidth = 0;
      this.maxTrackPlayTime = Controller.getMaxTrackPlayTime();
      this.totalPlayTime = '';
      this.playBarTimeDatas = [];
      this.markerID = '';
      this.currentScrollAmount = 0;
      this.playBarContainerElement = null;
      this.playbarMarkerElementLeft = null;
      this.playbarMarkerElementRight = null;
      this.playbarMarkerBlurZoneElementLeft = null;
      this.playbarMarkerBlurZoneElementRight = null;
      this.playbarTimeElements = null;
      this.markerElement = null;
      this.trackScrollAreaElement = null;
      this.zoombarControllerElement = null;

      this.setPlayBarTimeInfo();
    }

    setPlayBarTimeInfo(): void {
      this.totalPlayTime = this.parseTotalPlayTime(this.maxTrackPlayTime);
      this.playBarTimeDatas = TimeUtil.getPlayBarTimes(this.maxTrackPlayTime);
    }

    parseTotalPlayTime(maxTrackPlayTime: number): string {
      const [minute, second] = TimeUtil.splitTime(maxTrackPlayTime);
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
      this.spreadPlayTimes();
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
                  <div style="display:flex; width: 100%; position: relative">
                    ${this.getPlayBarTimes()}
                  </div>
                </div>
            `;
    }

    getPlayBarTimes(): string {
      return this.playBarTimeDatas.reduce((acc, time) => {
        if (time === '00:00' || time === this.totalPlayTime) {
          return (acc += `<div class='playbar-time-none'></div>`);
        }

        return (acc += `
            <div class='playbar-time-container'>
                <div class='playbar-time'>${time}</div>
                <div>|</div>
            </div>
        `);
      }, '');
    }

    initProperty(): void {
      this.playBarContainerElement = this.querySelector('.playbar');
      this.playbarMarkerElementLeft = document.getElementById('playbar-marker-left');
      this.playbarMarkerElementRight = document.getElementById('playbar-marker-right');
      this.playbarMarkerBlurZoneElementLeft = document.getElementById('playbar-marker-blur-zone-left');
      this.playbarMarkerBlurZoneElementRight = document.getElementById('playbar-marker-blur-zone-right');
      this.playbarTimeElements = this.querySelectorAll('.playbar-time-container');
      this.markerElement = document.querySelector('.marker');
      this.trackScrollAreaElement = document.querySelector('.audi-main-audio-track-scroll-area');

      if(this.playBarContainerElement){
        this.playBarLeftX = this.playBarContainerElement.getBoundingClientRect().left;
        this.playBarWidth = this.playBarContainerElement.getBoundingClientRect().right - this.playBarLeftX;
      }
    }

    spreadPlayTimes(){
      if(!this.playbarTimeElements || !this.playBarTimeDatas) return;

      const pixelPerSecond = this.playBarWidth / this.maxTrackPlayTime;
      const offsetOfPlayBarTimes = TimeUtil.getOffsetOfPlayBarTimes(this.maxTrackPlayTime);

      this.playbarTimeElements.forEach((playbarTimeElement, idx) => {
        const playBarTimeLeftX = (pixelPerSecond * offsetOfPlayBarTimes) * (idx + 1);
        const ratio = playBarTimeLeftX / this.playBarWidth;

        playbarTimeElement.style.left = `${100 * ratio}%`;
      });
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
          MarkerEventUtil.mousemoveMarkerListener(this, this.playBarLeftX, this.playBarWidth, this.currentScrollAmount, this.maxTrackPlayTime),
          this.dblclickPlayBarListener,
          MarkerEventUtil.clickMarkerListener(this.markerElement),
          this.dragoverPlayBarListener,
          this.dropPlayBarListener
        ],
        bindObj: this
      });

      this.addEventListener('dragstart', this.dragStartPlayBarMarkerListener.bind(this));
      window.addEventListener('resize', this.windowResizeListener.bind(this));
    }
    
    dragStartPlayBarMarkerListener(e): void {
      this.markerID = e.target.getAttribute('id').split('-')[2];
      const dragImage = document.createElement('div');
      dragImage.style.visibility = 'hidden';
      e.dataTransfer.setDragImage(dragImage, 0, 0);
    }

    dragoverPlayBarListener(e): void {
      e.preventDefault();
      const movingWidth: number = e.pageX - this.playBarLeftX;

      if (this.markerID === 'left' && this.playbarMarkerElementLeft) {
        this.playbarMarkerElementLeft.style.left = `${movingWidth}px`;

        if (this.playbarMarkerBlurZoneElementLeft) {
          const blurZone = this.playBarWidth - movingWidth;
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
        const blurZone = this.playBarWidth - currentPosition;
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

    windowResizeListener(e){
      const zoombarControllerElement = document.querySelector<HTMLDivElement>('.audi-zoombar-cotroller');
      if(!this.playBarContainerElement || !this.trackScrollAreaElement || !zoombarControllerElement) return;
      
      this.playBarLeftX = this.playBarContainerElement.getBoundingClientRect().left;
      this.playBarWidth = this.playBarContainerElement.getBoundingClientRect().right - this.playBarLeftX;

      const initScrollAmount = 0;
      
      this.trackScrollAreaElement.scrollLeft = initScrollAmount;
      zoombarControllerElement.style.left = `${initScrollAmount}`;
      this.currentScrollAmount = initScrollAmount;
      this.initEvent();
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.MAX_TRACK_WIDTH_CHANNEL, this.maxTrackWidthObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.MAX_TRACK_PLAY_TIME_CHANNEL, this.maxTrackPlayTimeObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.CURRENT_SCROLL_AMOUNT_CHANNEL, this.currentScrollAmountObserverCallback, this);
    }

    maxTrackWidthObserverCallback(maxTrackWidth: number): void {
      this.maxTrackWidth = maxTrackWidth;
      this.resizePlayBarContainer();
      this.spreadPlayTimes();
    }

    maxTrackPlayTimeObserverCallback(maxTrackPlayTime: number): void {
      this.maxTrackPlayTime = maxTrackPlayTime;
      this.setPlayBarTimeInfo();
      this.render();
      this.initProperty();
      this.initPlayBarMarkerLocation();
      this.resizePlayBarContainer();
      this.spreadPlayTimes();
      this.initEvent();
    }

    resizePlayBarContainer(){     
      if(!this.playBarContainerElement || !this.trackScrollAreaElement) return;
      
      const scrollAreaWidth = this.trackScrollAreaElement.getBoundingClientRect().right - this.trackScrollAreaElement.getBoundingClientRect().left;
      const ratio = this.maxTrackWidth / scrollAreaWidth;

      this.playBarContainerElement.style.width = `${100 * ratio}%`;
      this.playBarLeftX = this.playBarContainerElement.getBoundingClientRect().left;
      this.playBarWidth = this.playBarContainerElement.getBoundingClientRect().right - this.playBarLeftX;
    }

    currentScrollAmountObserverCallback(newCurrentScrollAmount: number): void {
      this.currentScrollAmount = newCurrentScrollAmount;
      this.initEvent();
    }
  };

  customElements.define('audi-playbar', PlayBar);
})();
export {};
