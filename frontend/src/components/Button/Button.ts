import { ButtonType } from "@types";
import './Button.scss';

(() => {
  const Button = class extends HTMLElement {
    private isDoneInit: Boolean;
    private value: string;
    private type: ButtonType;
    private eventKey: string;
    private isDisabled: Boolean;

    constructor() {
      super();
      this.isDoneInit = false;
      this.value = "";
      this.type = ButtonType.modal;
      this.eventKey = "";
      this.isDisabled = false;
    }

    static get observedAttributes(): string[] {
        return ['data-value', 'data-type', 'data-event-key', 'data-disabled'];
    }

    attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void {
        if (oldVal !== newVal) {
          switch(attrName){
            case 'data-type':
              this.type = ButtonType[`${newVal}`];
              break;
            case 'data-value':
              this.value = newVal;
              break;
            case 'data-event-key':
              this.eventKey = newVal;
              break;
            case 'data-disabled':
              this.isDisabled = (newVal === 'true');
              break;
          }
          this[attrName] = newVal;
          if(this.isDoneInit) this.render();
        }
    }

    connectedCallback(): void {
        try{    
            this.render();
            this.isDoneInit = true;
        }catch(e){
            console.log(e);
        }
    }

    render(): void {
      this.innerHTML = `
                  <button class="audi-button--${this.type}" ${(this.eventKey) && `event-key=${this.eventKey}`} ${(this.isDisabled) && `disabled`}>
                    ${this.value}
                  </button>
              `;
    }
  };

  customElements.define('audi-button', Button);
})();

export {};
