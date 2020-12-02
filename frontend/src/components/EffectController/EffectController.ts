import { EffectType, EffectTitleType, EffectContentType, ButtonType } from '@types';
import "./EffectController.scss";

(() => {
  const EffectController = class extends HTMLElement {
    private type: EffectType;
    constructor() {
      super();
      this.type = EffectType.gain;
    }


    connectedCallback() {
      this.render();
    }

    static get observedAttributes(): string[] {
      return ['type'];
    }

    attributeChangedCallback(attrName: string, oldVal: string, newVal: string): void {
      if (!newVal) return;

      if (oldVal !== newVal) {
        switch (attrName) {
          case 'type':
            this.type = EffectType[newVal];
            break;
        }
        this[attrName] = newVal;
      }
    }

    render() {
      this.innerHTML = `
          <div class="effect-controller-wrap">
            <div class="effect-controller-title">${EffectTitleType[`${this.type}`]} </div>
            ${EffectContentType[`${this.type}`]}
            <div class='effect-controller-btn-container'>
              <audi-button class='submit-btn'  data-value="적용" data-type=${ButtonType.modal}></audi-button>
              <audi-button data-value="취소" data-type=${ButtonType.modal}></audi-button>
            </div>
          </div>
      `;
    }
  };
  customElements.define('audi-effect-controller', EffectController);
})();

export { };
