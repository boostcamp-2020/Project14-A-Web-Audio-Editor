import "./EffectList.scss";
import { ButtonType, EventKeyType, EventType, ModalType } from "@types";
import { EventUtil } from "@util";
import { Controller } from "@controllers";

(() => {
  const EffectList = class extends HTMLElement {
    private effects: string[];
    private eventKeyList: string[];

    constructor() {
      super();
      this.effects = ['Gain', 'Fade in', 'Fade out', 'Compressor', 'Filter', 'Reverb'];
      this.eventKeyList = [EventKeyType.GAIN_EFFECT_CLICK, EventKeyType.FADE_IN_EFFECT_CLICK, EventKeyType.FADE_OUT_EFFECT_CLICK, EventKeyType.COMPRESSOR_EFFECT_CLICK,
      EventKeyType.FILTER_EFFECT_CLICK, EventKeyType.REVERB_EFFECT_CLICK];
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
        return this.effects.reduce((acc,effect, idx)=>
            acc +=`<li class="delegation" event-key="${this.eventKeyList[idx]}"><span>${effect}</span></li>` ,'');
    }

    initEvent(){
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EFFECT_LIST_CLOSE_BTN_CLICK,
        listeners: [this.closeBtnClickListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.GAIN_EFFECT_CLICK,
        listeners: [this.gainEffectClickListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.FADE_IN_EFFECT_CLICK,
        listeners: [this.fadeInEffectClickListener],
        bindObj: this
      });   
      
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.FADE_OUT_EFFECT_CLICK,
        listeners: [this.fadeOutEffectClickListener],
        bindObj: this
      });    

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.COMPRESSOR_EFFECT_CLICK,
        listeners: [this.compressorEffectClickListener],
        bindObj: this
      });  

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.FILTER_EFFECT_CLICK,
        listeners: [this.filterEffectClickListener],
        bindObj: this
      });  

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.REVERB_EFFECT_CLICK,
        listeners: [this.reverbEffectClickListener],
        bindObj: this
      });  
    }

    closeBtnClickListener(){
      Controller.changeModalState(ModalType.effect, true);
    }

    gainEffectClickListener() {
      console.log('gain');
      this.closeBtnClickListener();
      Controller.showEffectSetting(1);
    }
    
    fadeInEffectClickListener() {
      console.log('fade in');
      this.closeBtnClickListener();
      Controller.showEffectSetting(2);
    }

    fadeOutEffectClickListener() {
      console.log('fade out');
      this.closeBtnClickListener();
      Controller.showEffectSetting(3);
    }

    compressorEffectClickListener() {
      console.log('compressor');
      this.closeBtnClickListener();
      Controller.showEffectSetting(4);
    }

    filterEffectClickListener() {
      console.log('filter');
      this.closeBtnClickListener();
      Controller.showEffectSetting(5);
    }

    reverbEffectClickListener() {
      console.log('reverb');
      this.closeBtnClickListener();
      Controller.showEffectSetting(6);
    }
  };
  
  customElements.define('audi-effect-list', EffectList);
})();

export {};

