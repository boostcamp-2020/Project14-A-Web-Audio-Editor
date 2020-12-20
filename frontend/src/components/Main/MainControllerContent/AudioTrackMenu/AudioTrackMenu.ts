import { IconType, EventType, EventKeyType, TrackMenuType, StoreChannelType, FocusInfo } from '@types';
import { EventUtil } from '@util';
import { CommandController, ZoomController, Controller } from '@controllers';
import { storeChannel } from '@store';
import './AudioTrackMenu.scss';

(() => {
  const AudioTrackMenu = class extends HTMLElement {
    private focusList: FocusInfo[];
    private colorChangeBtnElement: HTMLElement | null;
    private colorPickerElement: HTMLInputElement | null;
    private trackScrollAreaElement: HTMLElement | null;

    constructor() {
      super();
      this.focusList = [];
      this.colorChangeBtnElement = null;
      this.colorPickerElement = null;
      this.trackScrollAreaElement = null;
    }

    static ICON_SIZE: number = 25;

    connectedCallback(): void {
      try {
        this.render();
        this.initElement();
        this.initEvent();
        this.subscribe();
      } catch (e) {
        console.log(e);
      }
    }

    render(): void {
      const { headset, colorLens, zoomIn, zoomOut } = IconType;
      const { ICON_SIZE } = AudioTrackMenu;

      this.innerHTML = `
                <div class='audio-track-menu-container delegation' event-key=${EventKeyType.TRACK_MENU_CLICK} >
                    <div class='track-menu-area'>
                        <audi-icon-button 
                          event-delegation
                          icontype=${headset} 
                          size=${ICON_SIZE}
                          data-type=${TrackMenuType.ADD_TRACK}
                        ></audi-icon-button>
                        <audi-icon-button
                          class='track-menu__color disabled' 
                          event-delegation
                          icontype=${colorLens} 
                          size=${ICON_SIZE}
                          data-type=${TrackMenuType.CHANGE_COLOR}
                        ></audi-icon-button>
                        <input class='color-picker' type='color' value="#fdffff" event-key=${EventKeyType.TRACK_SECTION_COLOR_CHANGE}>
                    </div>
                    <div class='zoom-menu-area'>
                        <audi-icon-button 
                          event-delegation
                          icontype=${zoomIn} 
                          size=${ICON_SIZE}
                          data-type=${TrackMenuType.ZOOM_IN}
                        ></audi-icon-button>
                        <audi-icon-button 
                          event-delegation
                          icontype=${zoomOut} 
                          size=${ICON_SIZE}
                          data-type=${TrackMenuType.ZOOM_OUT}
                        ></audi-icon-button>
                    </div>
                </div>
            `;
    }

    initElement(): void {
      this.colorChangeBtnElement = this.querySelector('.track-menu__color');
      this.colorPickerElement = this.querySelector('.color-picker');
      this.trackScrollAreaElement = document.querySelector('.audi-main-audio-track-scroll-area');
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.TRACK_MENU_CLICK,
        listeners: [this.trackMenuClickListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.change],
        eventKey: EventKeyType.TRACK_SECTION_COLOR_CHANGE,
        listeners: [this.colorChangeListener],
        bindObj: this
      });
    }

    trackMenuClickListener(e): void {
      const iconBtnElement = e.target.closest('audi-icon-button')
      const type = iconBtnElement?.dataset.type;
      if (!type) return;

      switch (type) {
        case TrackMenuType.ADD_TRACK:
          this.trackAddMenuClickListener(e);
          break;
        case TrackMenuType.CHANGE_COLOR:
          this.trackColorChangeMenuClickListener(e);
          break;
        case TrackMenuType.ZOOM_IN:
          this.trackZoomInMenuClickListener(e);
          break;
        case TrackMenuType.ZOOM_OUT:
          this.trackZoomOutMenuClickListener(e);
          break;
      }
    }

    trackAddMenuClickListener(e): void {
      try {
        CommandController.executeAddTrackCommand();
        if (!this.trackScrollAreaElement) return;
        this.trackScrollAreaElement.scrollLeft = Controller.getCurrentScrollAmount();
      } catch (e) {
        console.log(e);
      }
    }

    trackColorChangeMenuClickListener(e): void {
      try {
        if (this.focusList.length < 0 || !this.colorPickerElement) return;
        this.colorPickerElement.click();

      } catch (e) {
        console.log(e);
      }
    }

    colorChangeListener(e): void {
      const colorPickerInput = e.target;
      const selectColor = colorPickerInput.value;
      CommandController.executeColorChangeCommand(this.focusList, selectColor);
    }


    trackZoomInMenuClickListener(e): void {
      try {
        const currentZoomRate = ZoomController.getCurrentRate();
        if (currentZoomRate < 3.5) {
          Controller.changeCurrentScrollAmount(0);
          ZoomController.setZoomRate(currentZoomRate + 0.25);
        }
      } catch (e) {
        console.log(e);
      }
    }

    trackZoomOutMenuClickListener(e): void {
      try {
        const currentZoomRate = ZoomController.getCurrentRate();
        if (currentZoomRate > 1) {
          Controller.changeCurrentScrollAmount(0);
          Controller.changeMaxTrackWidth(0);
          ZoomController.setZoomRate(currentZoomRate - 0.25);
        }
      } catch (e) {
        console.log(e);
      }
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.FOCUS_LIST_CHANNEL, this.focusListObserverCallback, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.FOCUS_LIST_CHANNEL, this.focusListObserverCallback, this);
    }

    focusListObserverCallback(newFocusList: FocusInfo[]) {
      try {
        this.trackColorChangeMenuActivationHandler(newFocusList);
      } catch (e) {
        console.log(e);
      }
    }

    trackColorChangeMenuActivationHandler(newFocusList: FocusInfo[]) {
      this.focusList = newFocusList;

      if (newFocusList.length > 0) {
        this.activeColorChangeMenu();
        return
      }
      this.inactiveColorChangeMenu();
    }

    activeColorChangeMenu() {
      if (!this.colorChangeBtnElement) return;
      this.colorChangeBtnElement.classList.remove('disabled');
    }

    inactiveColorChangeMenu() {
      if (!this.colorChangeBtnElement) return;
      this.colorChangeBtnElement.classList.add('disabled');
    }
  };

  customElements.define('audi-track-menu', AudioTrackMenu);
})();
