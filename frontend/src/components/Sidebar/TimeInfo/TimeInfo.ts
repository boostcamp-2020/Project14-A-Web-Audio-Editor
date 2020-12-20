import './TimeInfo.scss';
import { StoreChannelType } from '@types';
import { storeChannel } from '@store';
import { Track, TrackSection } from '@model';
import { TimeUtil } from '@util';

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
                            <div class="other-time-title">
                                <div class='total-time-title'>Total</div>    
                                <div class='cursor-time-title'>Cursor</div>
                            </div>
                            <div class="other-time-content">
                                <div>${this.totalTime}</div>
                                <div>${this.cursorTime}</div>
                            </div>
                        </div>
                    </div>
                  </div>
              `;
    }

    subscribe() {
      storeChannel.subscribe(StoreChannelType.CURSOR_TIME_CHANNEL, this.updateCursorTime, this);
      storeChannel.subscribe(StoreChannelType.PLAY_TIME_CHANNEL, this.updatePlayTime, this);
      storeChannel.subscribe(StoreChannelType.TOTAL_TIME_CHANNEL, this.updateTotalTime, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.CURSOR_TIME_CHANNEL, this.updateCursorTime, this);
      storeChannel.unsubscribe(StoreChannelType.PLAY_TIME_CHANNEL, this.updatePlayTime, this);
      storeChannel.unsubscribe(StoreChannelType.TOTAL_TIME_CHANNEL, this.updateTotalTime, this);
    }

    updateCursorTime(cursorTime) {
      this.cursorTime = cursorTime;
      this.render();
    }

    updatePlayTime(playTime) {
      this.playTime = playTime;
      this.render();
    }

    updateTotalTime(newTrackList: Track[]) {
      const trackSectionList = newTrackList.filter((track) => track.trackSectionList.length > 0).map((section) => section.trackSectionList);
      const eachLastTrackList = trackSectionList
        .reduce((acc, sectionList): TrackSection[] => {
          acc.push(sectionList[sectionList.length - 1]);
          return acc;
        }, [])
        .map((section) => section.trackStartTime + section.length);

      if (!eachLastTrackList.length) {
        this.totalTime = '00:00:000';
        this.render();
        return;
      }
      const maxTrackTime = Math.max(...eachLastTrackList);
      const [minute, second, milsecond] = TimeUtil.splitTime(maxTrackTime);
      this.totalTime = TimeUtil.getStringTime(minute, second, milsecond);
      this.render();
    }
  };

  customElements.define('audi-time-info', TimeInfo);
})();

export { };
