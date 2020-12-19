import { TimeUtil, MarkerEventUtil, EventUtil, WidthUtil } from '@util';
import { EventType, EventKeyType, StoreChannelType } from '@types';
import { Controller, ZoomController } from '@controllers';
import { storeChannel } from '@store';
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
    private playbarMarkerBlurZoneElement: HTMLElement | null;
    private playbarTimeElements: NodeListOf<HTMLDivElement> | null;
    private playbarEventZoneElement: HTMLElement | null;
    private markerElement: HTMLElement | null;
    private trackScrollAreaElement: HTMLDivElement | null;

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
      this.playbarMarkerBlurZoneElement = null;
      this.playbarTimeElements = null;
      this.markerElement = null;
      this.trackScrollAreaElement = null;
      this.playbarEventZoneElement = null;

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
      try {
        this.init();
      } catch (e) {
        console.log(e);
      }
    }

    init(): void {
      this.render();
      this.initProperty();
      this.resizePlayBarContainer();
      this.spreadPlayTimes();
      this.initPlayBarMarkerLocation();
      this.initEvent();
      this.subscribe();
    }

    render(): void {
      this.innerHTML = `
                <div class='playbar'>
                  <div class='playbar-event-zone' droppable='true' event-key=${EventKeyType.PLAYBAR_MULTIPLE}>
                    <audi-playbar-marker type='left'></audi-playbar-marker>
                    <audi-playbar-marker type='right'></audi-playbar-marker>
                  </div> 
                  <audi-playbar-marker-blur-zone></audi-playbar-marker-blur-zone>
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
      this.playbarMarkerBlurZoneElement = document.getElementById('playbar-marker-blur-zone');
      this.playbarTimeElements = this.querySelectorAll('.playbar-time-container');
      this.markerElement = document.querySelector('.marker');
      this.trackScrollAreaElement = document.querySelector('.audi-main-audio-track-scroll-area');
      this.playbarEventZoneElement = this.querySelector('.playbar-event-zone');
      this.maxTrackWidth = Controller.getMaxTrackWidth();

      if (this.playBarContainerElement) {
        this.playBarLeftX = this.playBarContainerElement.getBoundingClientRect().left;
        this.playBarWidth = this.playBarContainerElement.getBoundingClientRect().right - this.playBarLeftX;
      }
    }

    spreadPlayTimes() {
      if (!this.playbarTimeElements || !this.playBarTimeDatas ) return;

      const pixelPerSecond = ZoomController.getCurrentPixelPerSecond();
      const playTimeInterval = ZoomController.getCurrentPlayTimeInterval();

      this.playbarTimeElements.forEach((playbarTimeElement, idx) => {
        const playBarTimeLeftX = pixelPerSecond * playTimeInterval * (idx + 1);
        const ratio = playBarTimeLeftX / this.playBarWidth;

        playbarTimeElement.style.left = `${100 * ratio}%`;
      });
    }

    initPlayBarMarkerLocation(): void {
      if (this.playbarMarkerElementLeft && this.playbarMarkerElementRight) {
        this.playbarMarkerElementLeft.style.left = '0px';
        this.playbarMarkerElementRight.style.left = '99.3%';
      }
    }

    initEvent(): void {
      if (!this.markerElement) return;

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.mousemove, EventType.dblclick, EventType.click, EventType.dragover, EventType.drop],
        eventKey: EventKeyType.PLAYBAR_MULTIPLE,
        listeners: [
          this.mousemoveMarkerListener,
          this.dblclickPlayBarListener,
          MarkerEventUtil.clickMarkerListener(this.markerElement),
          this.dragoverPlayBarListener,
          this.dropPlayBarListener
        ],
        bindObj: this
      });

      this.addEventListener('dragstart', this.dragStartPlayBarMarkerListener.bind(this));
    }

    mousemoveMarkerListener(e): void {
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

    dragStartPlayBarMarkerListener(e): void {
      this.markerID = e.target.getAttribute('id').split('-')[2];
      const dragImage = document.createElement('div');
      dragImage.style.visibility = 'hidden';
      e.dataTransfer.setDragImage(dragImage, 0, 0);
    }

    dragoverPlayBarListener(e): void {
      e.preventDefault();
      if (!this.playbarMarkerBlurZoneElement || !this.playbarMarkerElementRight || !this.playbarMarkerElementLeft) return;
      if (!Controller.getIsPauseState()) return;
      const movingWidth: number = e.pageX - this.playBarLeftX + this.currentScrollAmount;
      const currentX = e.pageX + this.currentScrollAmount;

      const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
      const maxTrackWidth = Controller.getMaxTrackWidth();
      const playbarMarkerTime = TimeUtil.getNumberTime(this.playBarLeftX, currentX, maxTrackWidth, maxTrackPlayTime);

      if (this.markerID === 'right') {
        this.playbarMarkerElementRight.style.left = `${movingWidth}px`;

        Controller.changeLoopEndTime(playbarMarkerTime);
      } else {
        this.playbarMarkerElementLeft.style.left = `${movingWidth}px`;

        Controller.changeLoopStartTime(playbarMarkerTime);
      }

      this.playbarMarkerBlurZoneElement.style.left = this.playbarMarkerElementLeft.style.left;
      this.playbarMarkerBlurZoneElement.style.width = `${Number(this.playbarMarkerElementRight.style.left.split('px')[0]) - Number(this.playbarMarkerElementLeft.style.left.split('px')[0])
        }px`;
    }

    dropPlayBarListener(e): void {
      e.preventDefault();
    }

    dblclickPlayBarListener(e): void {
      if (!this.playbarMarkerElementLeft || !this.playbarMarkerElementRight || !this.playbarMarkerBlurZoneElement) return;
      const isPause = Controller.getIsPauseState();
      if (!isPause) return;
      const [currentPosition] = Controller.getCurrentPosition();
      const currentX = e.pageX + this.currentScrollAmount;

      const maxTrackPlayTime = Controller.getMaxTrackPlayTime();
      const maxTrackWidth = Controller.getMaxTrackWidth();

      const playbarMarkerTime = TimeUtil.getNumberTime(this.playBarLeftX, currentX, maxTrackWidth, maxTrackPlayTime);

      if (this.compareCloseMarker(currentPosition + this.currentScrollAmount)) {
        this.playbarMarkerElementLeft.style.left = `${currentPosition + this.currentScrollAmount}px`;

        Controller.changeLoopStartTime(playbarMarkerTime);
      } else {
        this.playbarMarkerElementRight.style.left = `${currentPosition + this.currentScrollAmount}px`;

        Controller.changeLoopEndTime(playbarMarkerTime);
      }

      this.playbarMarkerBlurZoneElement.style.left = this.playbarMarkerElementLeft.style.left;
      this.playbarMarkerBlurZoneElement.style.width = `${Number(this.playbarMarkerElementRight.style.left.split('px').join('')) - Number(this.playbarMarkerElementLeft.style.left.split('px').join(''))
        }px`;
    }

    compareCloseMarker(currentPosition: number): boolean {
      const markerLeft = Number(this.playbarMarkerElementLeft?.style.left.split(/px|%/).join(''));
      const markerRight = Number(this.playbarMarkerElementRight?.style.left.split(/px|%/).join(''));

      const offsetLeft = Math.abs(currentPosition - markerLeft);
      const offsetRight = Math.abs(currentPosition - markerRight);

      if (offsetLeft <= offsetRight) return true;
      return false;
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.MAX_TRACK_WIDTH_CHANNEL, this.maxTrackWidthObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.MAX_TRACK_PLAY_TIME_CHANNEL, this.maxTrackPlayTimeObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.CURRENT_SCROLL_AMOUNT_CHANNEL, this.currentScrollAmountObserverCallback, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.MAX_TRACK_WIDTH_CHANNEL, this.maxTrackWidthObserverCallback, this);
      storeChannel.unsubscribe(StoreChannelType.MAX_TRACK_PLAY_TIME_CHANNEL, this.maxTrackPlayTimeObserverCallback, this);
      storeChannel.unsubscribe(StoreChannelType.CURRENT_SCROLL_AMOUNT_CHANNEL, this.currentScrollAmountObserverCallback, this);
    }

    maxTrackWidthObserverCallback(maxTrackWidth: number): void {
      this.maxTrackWidth = maxTrackWidth;
      this.initProperty();
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

    resizePlayBarContainer() {
      if (!this.playBarContainerElement || !this.trackScrollAreaElement || !this.playbarEventZoneElement || this.maxTrackWidth === 0) return;

      const scrollAreaWidth = this.trackScrollAreaElement.getBoundingClientRect().right - this.trackScrollAreaElement.getBoundingClientRect().left;
      const ratio = this.maxTrackWidth / scrollAreaWidth;
      
      this.playBarContainerElement.style.width = `${100 * ratio}%`;
      this.playbarEventZoneElement.style.width = `${100 * ratio}%`;

      this.playBarLeftX = this.playBarContainerElement.getBoundingClientRect().left;
      this.playBarWidth = this.playBarContainerElement.getBoundingClientRect().right - this.playBarLeftX;
    }

    currentScrollAmountObserverCallback(newCurrentScrollAmount: number): void {
      this.currentScrollAmount = newCurrentScrollAmount;
    }
  };

  customElements.define('audi-playbar', PlayBar);
})();
export { };
