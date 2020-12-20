import "./ReverbEffect.scss";
import { EventType, EventKeyType } from '@types';
import { EventUtil, EffectUtil } from '@util';
import { Controller } from "@controllers";

(() => {
  const ReverbEffect = class extends HTMLElement {
    private mixRatioValue: HTMLDivElement | null;
    private timeValue: HTMLDivElement | null;
    private decayValue: HTMLDivElement | null;
    private mixRatioCurrentValue: string;
    private timeCurrentValue: string;
    private decayCurrentValue: string;

    constructor() {
      super();
      this.mixRatioValue = null;
      this.timeValue = null;
      this.decayValue = null;

      this.mixRatioCurrentValue = '0.5';
      this.timeCurrentValue = '0.5';
      this.decayCurrentValue = '0.5';
    }

    connectedCallback() {
      this.render();
      this.initElement();
      this.initEvent();
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.input],
        eventKey: EventKeyType.EFFECT_REVERB_INPUT_MIX_RATIO,
        listeners: [this.inputMixRatioListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.input],
        eventKey: EventKeyType.EFFECT_REVERB_INPUT_TIME,
        listeners: [this.inputTimeListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.input],
        eventKey: EventKeyType.EFFECT_REVERB_INPUT_DECAY,
        listeners: [this.inputDecayListener],
        bindObj: this
      });
    }

    inputMixRatioListener = (e) => {
      const { target } = e;

      if (!this.mixRatioValue) return;
      this.mixRatioValue.innerText = `${target.value}`;
    }

    inputTimeListener = (e) => {
      const { target } = e;

      if (!this.timeValue) return;
      this.timeValue.innerText = `${target.value}`;
    }

    inputDecayListener = (e) => {
      const { target } = e;

      if (!this.decayValue) return;
      this.decayValue.innerText = `${target.value}`;
    }

    initElement(): void {
      this.mixRatioValue = document.querySelector('.mix-ratio-value');
      this.timeValue = document.querySelector('.time-value');
      this.decayValue = document.querySelector('.decay-value');
    }

    setDefaultProperties() {
      if (Controller.getIsEffectModifyMode()) {
        const effectIds = Controller.getModifyingEffectInfo();
        const effect = Controller.getEffect(effectIds.id, effectIds.trackId, effectIds.trackSectionId);

        this.mixRatioCurrentValue = `${EffectUtil.roundPropertyValue(effect.properties.getProperty('mix'), 3)}`;
        this.timeCurrentValue = `${EffectUtil.roundPropertyValue(effect.properties.getProperty('time'), 3)}`;
        this.decayCurrentValue = `${EffectUtil.roundPropertyValue(effect.properties.getProperty('decay'), 3)}`;
      }
      else {
        this.mixRatioCurrentValue = '0.5';
        this.timeCurrentValue = '0.5';
        this.decayCurrentValue = '0.5';
      }
    }

    render() {
      this.setDefaultProperties();

      this.innerHTML = `
          <div class="effect-input">
            <div class="effect-option-name">Mix Ratio Value</div>
            <div class="property-percentage-input">
              <input class="property-percentage-input" type="range" value="${this.mixRatioCurrentValue}" min="0" max="1" step="0.001" event-key=${EventKeyType.EFFECT_REVERB_INPUT_MIX_RATIO}>
              <div class="property-percentage-value mix-ratio-value">${this.mixRatioCurrentValue}</div>
            </div>

            <div class="effect-option-name">Time Value</div>
            <div class="property-percentage-input">
              <input class="property-percentage-input" type="range" value="${this.timeCurrentValue}" min="0" max="1" step="0.001" event-key=${EventKeyType.EFFECT_REVERB_INPUT_TIME}>
              <div class="property-percentage-value time-value">${this.timeCurrentValue}</div>
            </div>

            <div class="effect-option-name">Decay Value</div>
            <div class="property-percentage-input">
              <input class="property-percentage-input" type="range" value="${this.decayCurrentValue}" min="0" max="1" step="0.001" event-key=${EventKeyType.EFFECT_REVERB_INPUT_DECAY}>
              <div class="property-percentage-value decay-value">${this.decayCurrentValue}</div>
            </div>
          </div>
      `;
    }
  };
  customElements.define('audi-effect-reverb', ReverbEffect);
})();

export { };
