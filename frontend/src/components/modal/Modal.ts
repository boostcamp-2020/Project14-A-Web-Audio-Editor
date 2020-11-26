import { modalContents } from './modalContents';
import { ModalType, ModalTitleType }  from "./modalType/modalType";
import { EventUtil } from "@util";
import { EventType } from "@types";
import './Modal.scss';

(() => {
  const Modal = class extends HTMLElement {
    public type: ModalType;
    private modalElement: HTMLDivElement | null;

    constructor() {
      super();
      this.type = ModalType.none;
      this.title = '';
      this.modalElement = null;
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
              <span class="modal-title">${this.title}</span>
              ${modalContents[this.type]}
              <modal-buttons type=${this.type}></modal-buttons>
          </div>
        </div>`;
    }

    initElement(): void{
      this.modalElement = this.querySelector('.modal');
    }

    initEvent(): void{
      EventUtil.registerEventToRoot({
        eventTypes:[EventType.click], 
        eventKey: this.type, 
        listeners:[this.modalClickListener], 
        bindObj: this 
      });

      EventUtil.registerEventToRoot({
        eventTypes:[EventType.click], 
        eventKey: 'modal-close', 
        listeners:[this.modalCloseBtnClickListener], 
        bindObj: this 
      });
    }

    modalCloseBtnClickListener(e): void{
      this.hideModal();
    }

    modalClickListener(e): void {
      this.hideModal();
    }

    showModal(): void{
      this.modalElement?.classList.remove('hide');
    }

    hideModal(): void{
      this.modalElement?.classList.add('hide');
    }
  }
  customElements.define('editor-modal', Modal);
})();

export {};

