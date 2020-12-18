import './SidebarListInfo.scss';
import { storeChannel } from "@store";
import { StoreChannelType, FocusInfo, SidebarMode } from '@types'
import { Controller } from '@controllers';

(() => {
  const SidebarListInfo = class extends HTMLElement {
    private isSelectSection: Boolean;
    private sidebarMode: SidebarMode;

    constructor() {
      super();
      this.sidebarMode = SidebarMode.SOURCE_LIST;
      this.isSelectSection = false;
    }

    connectedCallback(): void {
      try {
        this.render();
        this.subscribe();
      } catch (e) {
        console.log(e);
      }
    }

    render(): void {
      this.innerHTML = `
        <div class="sidebar-list-outer-wrap">
            ${this.getSideBarContent()}
        </div>
      `;
    }

    getSideBarContent(): string {
      switch (this.sidebarMode) {
        case SidebarMode.SOURCE_LIST:
          return `<audi-source-list class="sidebar-child sidebar-source-list"></audi-source-list>`;
        case SidebarMode.EFFECT_LIST:
          return `<audi-section-effect-list class="sidebar-child sidebar-source-list"></audi-section-effect-list>`;
        case SidebarMode.EFFECT_OPTION:
          return `<audi-section-effect-setting class="sidebar-child sidebar-source-list"></audi-section-effect-setting>`
      }
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.SIDEBAR_MODE_CHANNEL, this.sidebarModeObserverCallback, this);
      storeChannel.subscribe(StoreChannelType.FOCUS_LIST_CHANNEL, this.focusListObserverCallback, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.SIDEBAR_MODE_CHANNEL, this.sidebarModeObserverCallback, this);
      storeChannel.unsubscribe(StoreChannelType.FOCUS_LIST_CHANNEL, this.focusListObserverCallback, this);
    }

    sidebarModeObserverCallback(newSidebarMode: SidebarMode): void {
      this.sidebarMode = newSidebarMode;
      this.render();
    }

    focusListObserverCallback(newFocusList: FocusInfo[]): void {
      if (newFocusList.length > 0) {
        Controller.changeSidebarMode(SidebarMode.EFFECT_LIST);
      } else {
        Controller.changeSidebarMode(SidebarMode.SOURCE_LIST);
      }
    }
  }
  customElements.define('audi-sidebar-list-info', SidebarListInfo);
})();