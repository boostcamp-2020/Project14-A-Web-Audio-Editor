import { modalContents } from './modalContents';
import { ModalType, ModalTitleType } from './modalType/modalType';
import './Modal.scss';

(() => {
  const Modal = class extends HTMLElement {
    public type: ModalType;
    private modalElement: HTMLDivElement | null;

    constructor() {
      super();
      this.type = ModalType.none;
      this.modalElement = null;
    }

    static get observedAttributes() {
      return ['type'];
    }

    connectedCallback() {
      this.render();
      this.initElement();
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
      if (oldVal !== newVal) {
        switch (attrName) {
          case 'type':
            this.type = newVal;
            break;
        }
        this[attrName] = newVal;
        this.render();
        this.initElement();
      }
    }

    render(): void {
      this.innerHTML = `
        <div id=${this.type} class='modal hide' event-key=${this.type}>
          <div class='modal-content'>
              <span class="modal-title">${ModalTitleType[this.type]}</span>
              ${modalContents[this.type]}
          </div>
        </div>`;
    }

    initElement(): void {
      this.modalElement = this.querySelector('.modal');
    }

    showModal(): void {
      this.modalElement?.classList.remove('hide');
    }

    hideModal(): void {
      this.modalElement?.classList.add('hide');
    }
  };

  customElements.define('audi-modal', Modal);
})();

export {};
