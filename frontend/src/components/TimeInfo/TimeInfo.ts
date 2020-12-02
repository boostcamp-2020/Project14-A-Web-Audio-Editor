import './TimeInfo.scss';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';

(() => {
  const TimeInfo = class extends HTMLElement {
    private playTime: string;
    private totalTime: string;
    private cursorTime: string;

    constructor() {
      super();

      this.playTime = '00:00:000';
      this.totalTime = '00:00:000';
      this.cursorTime = '00:00:000';
    }

    connectedCallback() {
      this.render();
      this.subscribe();
    }

    render() {
      this.innerHTML = `
                  <div class="time-info-outer-wrap">
                    <div class="time-info-wrap">
                        <div class="play-time">${this.playTime}</div>
                        <div class="other-time">
                            <div class="total-time">
                                <div>Total</div>    
                                <div>${this.totalTime}</div>
                            </div>
                            <div class="cursor-time">
                                <div>Cursor</div>
                                <div>${this.cursorTime}</div>
                            </div>
                        </div>
                    </div>
                  </div>
              `;
    }

    subscribe() {
      storeChannel.subscribe(StoreChannelType.CURSOR_TIME_CHANNEL, this.updateCursorTime, this);
    }

    updateCursorTime(cursorTime) {
      this.cursorTime = cursorTime;
      this.render();
    }
  };

  customElements.define('audi-time-info', TimeInfo);
})();

export {};
