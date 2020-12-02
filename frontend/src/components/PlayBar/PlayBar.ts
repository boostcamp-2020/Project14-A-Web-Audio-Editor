import './PlayBar.scss';
import { PlayBarUtil } from '@util';
import { EventUtil } from '@util';
import { EventType, EventKeyType } from '@types';
import { Controller } from '@controllers';

(() => {
  const PlayBar = class extends HTMLElement {
    private defaultStartX: number;
    private playBarElement: HTMLElement | null;
    private markerElementLeft: HTMLElement | null;
    private markerElementRight: HTMLElement | null;
    private currentLocation: number;
    private playtime: string[];
    private totalPlayTime: string;

    constructor() {
      super();
      this.defaultStartX = 0;
      this.playBarElement = null;
      this.markerElementLeft = null;
      this.markerElementRight = null;
      this.currentLocation = 0;
      this.playtime = [];
      this.totalPlayTime = '';
    }

    connectedCallback(): void {
      this.totalPlayTime = this.getTotalTime();
      this.playtime = PlayBarUtil.getStringTime();
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
                  <audi-marker type='left'></audi-marker>
                  <audi-marker type='right'></audi-marker>
                  ${this.setStringTime()}
                </div>
            `;
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.mousemove, EventType.dblclick],
        eventKey: EventKeyType.PLAYBAR_MULTIPLE,
        listeners: [this.mousemovePlayBarListener, this.dblclickPlayBarListener],
        bindObj: this
      });
    }

    initElement(): void {
      this.playBarElement = document.querySelector('audi-playbar');
      this.markerElementLeft = document.getElementById('playbar-marker-left');
      this.markerElementRight = document.getElementById('playbar-marker-right');
    }

    mousemovePlayBarListener(e: Event): void {
      if (!this.playBarElement) return;
      e.preventDefault();
      this.defaultStartX = this.playBarElement.getBoundingClientRect().left;

      const cursorPosition = e.pageX;
      const [minute, second, milsecond, location] = PlayBarUtil.getCursorPosition(this.defaultStartX, cursorPosition);

      this.currentLocation = location;
      Controller.changeCursorTime(minute.toString(), second.toString(), milsecond.toString());
    }

    dblclickPlayBarListener(): void {
      if (!this.markerElementLeft || !this.markerElementRight) return;

      if (this.compareCloseMarker()) {
        this.markerElementLeft.style.left = `${this.currentLocation}px`;
        return;
      }

      this.markerElementRight.style.left = `${this.currentLocation}px`;
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
      const [minute, second] = PlayBarUtil.setTime(300);
      return `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
    }

    compareCloseMarker(): boolean {
      const markerLeft = Number(this.markerElementLeft?.style.left.split('px').join(''));
      const markerRight = Number(this.markerElementRight?.style.left.split('px').join(''));

      const offsetLeft = Math.abs(this.currentLocation - markerLeft);
      const offsetRight = Math.abs(this.currentLocation - markerRight);

      if (offsetLeft <= offsetRight) return true;

      return false;
    }
  };

  customElements.define('audi-playbar', PlayBar);
})();
export {};
