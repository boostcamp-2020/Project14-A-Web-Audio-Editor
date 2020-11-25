import { modalContents } from './modalContents';
import { ModalType, ModalTitleType }  from "./modalType/modalType";
import { registerEventToRoot } from "@util";
import { EventType } from "@types";
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
        this.initElement();
      }
    }

    render(): void {
      this.innerHTML = `
        <div id=${this.type} class='modal' event-key='modal'>
          <div class='modal-content'>
              <span class="modal-title">${this.title}</span>
              ${modalContents[this.type]}
              <modal-buttons type=${this.type}></modal-buttons>
          </div>
        </div>`;
    }

    initElement(): void{
      this.modalElement = this.querySelector('.modal');
      this.modalCloseButton = this.querySelector('.modal-close-button');
    }

    initEvent(): void{
      registerEventToRoot({
        eventTypes:[EventType.click], 
        eventKey: 'modal', 
        listeners:[this.modalClickListener], 
        bindObj: this 
      });
    }

    modalClickListener(e): void {
      this.hideModal();
    }

    hideModal(): void{
      this.modalElement?.classList.add('hide');
    }
  };
  customElements.define('editor-modal', Modal);
})();
