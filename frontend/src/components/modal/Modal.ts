import { modalContents } from './modalContents';
import { ModalType, ModalTitleType }  from "./modalType/modalType";
import './Modal.scss';

(() => {
  const Modal = class extends HTMLElement {
    public type: ModalType;
    private modalElement: HTMLDivElement | null;
    private modalCloseButton: HTMLButtonElement | null;

    constructor() {
      super();
      this.type = ModalType.none;
      this.title = '';
      this.modalElement = null;
      this.modalCloseButton = null;
    }

    static get observedAttributes() {
      return ['type', 'title'];
    }

    connectedCallback() {
      this.render();
      this.initElement();
      this.initEvent();
    }

    attributeChangedCallback(attrName, oldVal, newVal) {
      if (oldVal !== newVal) {
        switch(attrName){
          case 'type':
            this.title = ModalTitleType[`${newVal}`];
            break;
        }
        this.type = newVal;  
        this[attrName] = newVal;
        this.render();
      }
    }

    render() {
      this.innerHTML = `
        <div id='modal' class='modal'>
          <div class='modal-content'>
              <span class="modal-title">${this.title}</span>
              ${modalContents[this.type]}
              <modal-buttons type=${this.type}></modal-buttons>
          </div>
        </div>`;
    }

    initElement(){
      this.modalElement = this.querySelector('.modal');
      this.modalCloseButton = this.querySelector('.modal-close-button');
    }

    initEvent(){
      this.addEventListener('click', this.modalClickListener.bind(this));
    }

    modalClickListener(e): void {
      this.hideModal();
    }

    hideModal(){
      this.modalElement?.classList.add('hide');
    }
  };
  customElements.define('editor-modal', Modal);
})();
