import "./GainEffect.scss";
import { EventType, EventKeyType } from '@types';
import { EventUtil, EffectUtil } from '@util';
import { Controller } from "@controllers";

(() => {
  const GainEffect = class extends HTMLElement {
    private percentageValue: HTMLDivElement | null;
    private currentValue: string;
    constructor() {
      super();
      this.percentageValue = null;
      this.currentValue = '100';
    }

    connectedCallback() {
      this.render();
      this.initElement();
      this.initEvent();
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.input],
        eventKey: EventKeyType.EFFECT_GAIN_INPUT_PERCENTAGE,
        listeners: [this.inputListener],
        bindObj: this
      });
    }

    inputListener = (e) => {
      const { target } = e;

      if (!this.percentageValue) return;
      this.percentageValue.innerText = `${target.value}%`;
    }

    initElement(): void {
      this.percentageValue = document.querySelector('.gain-percentage-value');
    }

    setDefaultProperties() {
      if (Controller.getIsEffectModifyMode()) {
        const effectIds = Controller.getModifyingEffectInfo();
        const effect = Controller.getEffect(effectIds.id, effectIds.trackId, effectIds.trackSectionId);

        this.currentValue = `${EffectUtil.roundPropertyValue(effect.properties.getProperty('gain') * 100)}`;
      }
      else {
        this.currentValue = '100';
      }
    }

    render() {
      this.setDefaultProperties();

      this.innerHTML = `
          <div class="effect-input">
            <div class="effect-option-name">Gain percentage</div>
            <div class="gain-percentage-input">
              <input class="gain-percentage-input" type="range" value="${this.currentValue}" min="0" max="250" event-key=${EventKeyType.EFFECT_GAIN_INPUT_PERCENTAGE}>
              <div class="gain-percentage-value">${this.currentValue}%</div>
            </div>
          </div>
      `;
    }
  };
  customElements.define('audi-effect-gain', GainEffect);
})();

export { };
