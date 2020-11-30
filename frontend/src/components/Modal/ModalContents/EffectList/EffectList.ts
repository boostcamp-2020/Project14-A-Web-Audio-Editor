import "./EffectList.scss";
import { ButtonType, EventKeyType, EventType, ModalType } from "@types";
import { EventUtil } from "@util";
import { Controller } from "@controllers";

(() => {
  const EffectList = class extends HTMLElement {
    private effects: string[];

    constructor() {
      super();
      this.effects = ['Gain', 'Fade in', 'Fade out', 'Compressor'];
    }

    connectedCallback() {
      this.render();
      this.initEvent();
    }

    render(): void {
      this.innerHTML = `
                  <ul class="effect-list-container">
                    ${this.getEffectList()}
                  </ul>
                  <div class="effect-list-btn-container">
                    <audi-button class='close-btn' data-event-key=${EventKeyType.EFFECT_LIST_CLOSE_BTN_CLICK} data-value="취소" data-type=${ButtonType.modal}></audi-button>
                  </div>
              `;
    }

    getEffectList(): string{
        return this.effects.reduce((acc,effect)=>
            acc +=`<li><span>${effect}</span></li>` ,'');
    }

    initEvent(){
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EFFECT_LIST_CLOSE_BTN_CLICK,
        listeners: [this.closeBtnClickListener],
        bindObj: this
      });
    }

    closeBtnClickListener(){
      Controller.changeModalState(ModalType.effect, true);
    }
  };
  
  customElements.define('audi-effect-list', EffectList);
})();

export {};

