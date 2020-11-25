import { modalContents } from './modalContents';
import './style.scss';
(() => {
  const Modal = class extends HTMLElement {
    public type: string;

    constructor() {
      super();
      this.type = 'source';
      this.title = '소스 불러오기';
    }

    static get observedAttributes() {
      return ['type', 'title'];
    }

    connectedCallback() {
      this.render();
      addEventListener('click', this.closeModal.bind(this));
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
      if (oldVal !== newVal) {
        this[attrName] = newVal;
      }
    }

    closeModal(e): void {
      const { target } = e;
      const modalElement: HTMLElement | null = document.querySelector('.modal');
      const modalCloseButton: HTMLElement | null = document.querySelector('.modal-close-button');

      if (modalElement && (target === modalElement || target === modalCloseButton)) {
        modalElement.style.display = 'none';
      }
    }

    render() {
      this.innerHTML = `
        <div id='modal' class='modal'>
          <div class='modal-content'>
              <h2>${this.title}</h2>
              ${modalContents[this.type]}
              <modal-buttons type=${this.type}></modal-buttons>
          </div>
        </div>`;
    }
  };
  customElements.define('editor-modal', Modal);
})();
