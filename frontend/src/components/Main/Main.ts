import { Track } from '@model';
import { Controller } from '@controllers';
import { EventKeyType, EventType } from '@types'
import { EventUtil } from '@util';
import './Main.scss';

(() => {
  const Main = class extends HTMLElement {
    private trackList: Track[];

    constructor() {
      super();
      this.trackList = Controller.getTrackList();
    }

    connectedCallback(): void {
      this.render();
      this.initEvent()
    }

    render(): void {
      this.innerHTML = `
                  <main class="audi-main-container">
                    <div class="audi-main-content">
                        <aside>
                            <audi-side-bar></audi-side-bar>
                        </aside>
                        <section class="audi-main-audio-track-container" event-key=${EventKeyType.FOCUS_RESET_CLICK}>
                            <audi-playbar></audi-playbar>
                            ${this.getTrackList()}
                        </section>
                    </div>
                  </main>
              `;
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.FOCUS_RESET_CLICK,
        listeners: [this.focusResetListener],
        bindObj: this
      });
    }

    focusResetListener(e): void {
      const ctrlIsPressed = Controller.getCtrlIsPressed();
      if (!ctrlIsPressed) {
        Controller.resetFocus();
      }
    }

    getTrackList(): string {
      return this.trackList.reduce((acc, cur, idx) =>
        acc += `<audi-audio-track data-id=${cur.id}></audi-audio-track>`, "");
    }
  };

  customElements.define('audi-main', Main);
})();

export { };
