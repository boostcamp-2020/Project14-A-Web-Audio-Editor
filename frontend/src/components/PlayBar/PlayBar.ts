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
    private mainWidth: number;
    private markerElement: HTMLElement | null;
    private playtime: string[];
    private totalPlayTime: string;

    constructor() {
      super();
      this.defaultStartX = 0;
      this.mainWidth = 0;
      this.playBarElement = null;
      this.playbarMarkerElementLeft = null;
      this.playbarMarkerElementRight = null;
      this.markerElement = null;
      this.playtime = [];
      this.totalPlayTime = '';
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
    }

    render(): void {
      this.innerHTML = `
                <div class='playbar' event-key=${EventKeyType.PLAYBAR_MULTIPLE}>
                  <audi-playbar-marker type='left'></audi-playbar-marker>
                  <audi-playbar-marker type='right'></audi-playbar-marker>
                  ${this.setStringTime()}
                </div>
            `;
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.mousemove, EventType.dblclick, EventType.click],
        eventKey: EventKeyType.PLAYBAR_MULTIPLE,
        listeners: [
          MarkerEventUtil.mousemoveMarkerListener(this, this.defaultStartX, this.mainWidth),
          this.dblclickPlayBarListener,
          MarkerEventUtil.clickMarkerListener(this.markerElement)
        ],
        bindObj: this
      });
    }

    initElement(): void {
      this.playBarElement = document.querySelector('audi-playbar');
      this.playbarMarkerElementLeft = document.getElementById('playbar-marker-left');
      this.playbarMarkerElementRight = document.getElementById('playbar-marker-right');
      this.markerElement = document.querySelector('.marker');
      this.defaultStartX = this.playBarElement?.getBoundingClientRect().left;
      this.mainWidth = this.playBarElement?.getBoundingClientRect().right - this.defaultStartX;
    }

    dblclickPlayBarListener(): void {
      if (!this.playbarMarkerElementLeft || !this.playbarMarkerElementRight) return;

      const [currentPosition] = Controller.getCurrentPosition();
      if (this.compareCloseMarker(currentPosition)) {
        this.playbarMarkerElementLeft.style.left = `${currentPosition}px`;
        return;
      }

      this.playbarMarkerElementRight.style.left = `${currentPosition}px`;
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
      const markerLeft = Number(this.playbarMarkerElementLeft?.style.left.split('px').join(''));
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
