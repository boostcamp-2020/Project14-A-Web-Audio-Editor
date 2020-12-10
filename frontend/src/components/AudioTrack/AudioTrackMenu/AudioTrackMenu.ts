import { IconType, EventType, EventKeyType } from '@types';
import { EventUtil } from '@util';
import { CommandController } from '@controllers';
import './AudioTrackMenu.scss';

(() => {
  const AudioTrackMenu = class extends HTMLElement {
    constructor() {
      super();
    }

    static ICON_SIZE: number = 25;

    connectedCallback(): void {
      try {
        this.render();
        this.initEvent();
      } catch (e) {
        console.log(e);
      }
    }

    render(): void {
      const { headset, colorLens, zoomIn, zoomOut } = IconType;
      const { ICON_SIZE } = AudioTrackMenu;

      this.innerHTML = `
                <div class='audio-track-menu-container'>
                    <div class='track-menu-area'>
                        <audi-icon-button 
                          class="delegation" 
                          event-key=${EventKeyType.TRACK_ADD_MENU_CLICK} 
                          icontype=${headset} 
                          size=${ICON_SIZE}>
                        </audi-icon-button>
                        <audi-icon-button 
                          icontype=${colorLens} 
                          size=${ICON_SIZE}>
                        </audi-icon-button>
                    </div>
                    <div class='zoom-menu-area'>
                        <audi-icon-button 
                          icontype=${zoomIn} 
                          size=${ICON_SIZE}>
                        </audi-icon-button>
                        <audi-icon-button 
                          icontype=${zoomOut} 
                          size=${ICON_SIZE}>
                        </audi-icon-button>
                    </div>
                </div>
            `;
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.TRACK_ADD_MENU_CLICK,
        listeners: [this.trackAddMenuClickListener],
        bindObj: this
      });
    }

    trackAddMenuClickListener(e): void {
      try {
        CommandController.executeAddTrackCommand();
      } catch (e) {
        console.log(e);
      }
    }
  };

  customElements.define('audi-track-menu', AudioTrackMenu);
})();
