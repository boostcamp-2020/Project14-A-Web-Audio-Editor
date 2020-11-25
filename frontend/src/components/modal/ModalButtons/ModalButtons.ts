import { modalButtonType } from './modalButtonType';

(() => {
  const ModalButtons = class extends HTMLElement {
    private type: string;

    constructor() {
      super();
      this.type = 'source';
    }

    static get observedAttributes() {
      return ['type'];
    }

    connectedCallback() {
      this.render();

      const closeButtonElement: HTMLElement | null = document.querySelector('.modal-close-button');

      if (this.type === 'effect' && closeButtonElement) {
        closeButtonElement.style.marginLeft = '0rem';
      }
    }

    render() {
      this.innerHTML = `
        <section class='source-upload-buttons'>
            ${modalButtonType[this.type]}
        </section>
        `;
    }
  };
  customElements.define('modal-buttons', ModalButtons);
})();
