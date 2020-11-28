import { ModalType, ModalTitleType, ModalContentType } from '@types';
import './Modal.scss';

(() => {
  const Modal = class extends HTMLElement {
    private isDoneInit: Boolean;
    private type: ModalType;
    private isHidden: Boolean;
    private modalElement: HTMLDivElement | null;

    constructor() {
      super();
      this.isDoneInit = false;
      this.type = ModalType.upload
      this.isHidden = true;
      this.modalElement = null;
    }

    static SELECTORS = {
      MODAL_SELECTOR : '.modal'
    }

    static get observedAttributes(): string[] {
      return ['type', 'aria-hidden'];
    }

    connectedCallback(): void {      
      try{
        this.init();
        this.isDoneInit = true;
      }catch(e){
        console.log(e);
      }
    }

    attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void {  
      if(!newVal) return;
      
      if (oldVal !== newVal) {
        switch (attrName) {
          case 'type':
            this.type = ModalType[newVal];
            if(this.isDoneInit) this.init();
            break;
          case 'aria-hidden':
            this.isHidden = (newVal === 'true');
            this.modalDisplayHandler();
            break;
        }
        this[attrName] = newVal;
      }
    }

    init(): void{
      this.render();
      this.initElement();
    }

    render(): void {
      this.innerHTML = `
        <div id=${this.type} class='modal hide' event-key=${this.type}>
          <div class='modal-content'>
              <span class="modal-title">${ModalTitleType[this.type]}</span>
              ${ModalContentType[`${this.type}`]}
          </div>
        </div>`;
    }

    initElement(): void {
      this.modalElement = this.querySelector(Modal.SELECTORS.MODAL_SELECTOR);     
    }

    modalDisplayHandler(): void {     
      if(this.isHidden){
        this.hideModal();
        return;
      }
      this.showModal();
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
