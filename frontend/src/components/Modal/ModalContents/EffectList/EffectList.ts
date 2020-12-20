import "./EffectList.scss";
import { ButtonType, EventKeyType, EventType, ModalType, EffectType, SidebarMode } from "@types";
import { EventUtil } from "@util";
import { Controller } from "@controllers";

(() => {
  const EffectList = class extends HTMLElement {
    private effects: string[];
    private eventKeyList: string[];

    constructor() {
      super();
      this.effects = ['Gain', 'Compressor', 'Filter', 'Reverb', 'Fade In', 'Fade Out'];
      this.eventKeyList = [
        EventKeyType.GAIN_EFFECT_CLICK,
        EventKeyType.COMPRESSOR_EFFECT_CLICK,
        EventKeyType.FILTER_EFFECT_CLICK,
        EventKeyType.REVERB_EFFECT_CLICK,
        EventKeyType.FADE_IN_EFFECT_CLICK,
        EventKeyType.FADE_OUT_EFFECT_CLICK
      ];
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

    getEffectList(): string {
      return this.effects.reduce((acc, effect, idx) =>
        acc += `<li class="delegation" event-key="${this.eventKeyList[idx]}"><span event-delegation>${effect}</span></li>`, '');
    }

    initEvent() {
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
    }

    closeBtnClickListener() {
      Controller.changeModalState(ModalType.effect, true);
    }

    gainEffectClickListener() {
      this.closeBtnClickListener();
      this.showEffectOption(EffectType.gain);
    }

    compressorEffectClickListener() {
      this.closeBtnClickListener();
      this.showEffectOption(EffectType.compressor);
    }

    filterEffectClickListener() {
      this.closeBtnClickListener();
      this.showEffectOption(EffectType.filter);
    }

    reverbEffectClickListener() {
      this.closeBtnClickListener();
      this.showEffectOption(EffectType.reverb);
    }

    fadeInEffectClickListener() {
      this.closeBtnClickListener();
      this.showEffectOption(EffectType.fadein);
    }

    fadeOutEffectClickListener() {
      this.closeBtnClickListener();
      this.showEffectOption(EffectType.fadeout);
    }

    showEffectOption(effectType: EffectType): void {
      Controller.setIsEffectModifyMode(false);
      Controller.changeSidebarMode(SidebarMode.EFFECT_OPTION);
      Controller.changeEffectOptionType(effectType);
    }
  };

  customElements.define('audi-effect-list', EffectList);
})();

export { };

