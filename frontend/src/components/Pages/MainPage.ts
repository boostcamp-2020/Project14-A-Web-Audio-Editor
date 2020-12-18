import { storeChannel } from "@store";
import { StoreChannelType, ModalStateType, ModalType } from "@types";

(() => {
  const MainPage = class extends HTMLElement {
    private modalState: ModalStateType;
    private modalElement: HTMLElement | null;

    constructor() {
      super();
      this.modalState = {
        modalType: ModalType.upload,
        isHidden: true,
      }
      this.modalElement = null;
    }

    static SELECTORS = {
      MODAL_SELECTOR: 'audi-modal'
    }

    connectedCallback(): void {
      this.render();
      this.initElement();
      this.subscribe();
    }

    render(): void {
      const { modalType, isHidden } = this.modalState;

      this.innerHTML = `
                <audi-header></audi-header>
                <audi-modal type=${modalType} aria-hidden=${isHidden}></audi-modal>
                <audi-main></audi-main>
              `;
    }

    initElement(): void {
      this.modalElement = this.querySelector(MainPage.SELECTORS.MODAL_SELECTOR);
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.MODAL_STATE_CHANNEL, this.updateModalState, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.MODAL_STATE_CHANNEL, this.updateModalState, this);
    }

    updateModalState(newModalState: ModalStateType): void {
      this.modalState = newModalState;

      if (this.modalElement === null) return;
      const { modalType, isHidden } = newModalState;
      this.modalElement.setAttribute('type', modalType);
      this.modalElement.setAttribute('aria-hidden', `${isHidden}`);
    }
  };

  customElements.define('audi-main-page', MainPage);
})();

export { };
