import "./CompressorEffect.scss";
import { EventType, EventKeyType } from '@types';
import { EventUtil, EffectUtil } from '@util';
import { Controller } from "@controllers";

(() => {
  const CompressorEffect = class extends HTMLElement {
    private thresholdValue: HTMLDivElement | null;
    private kneeValue: HTMLDivElement | null;
    private ratioValue: HTMLDivElement | null;
    private attackValue: HTMLDivElement | null;
    private releaseValue: HTMLDivElement | null;

    private thresholdCurrentValue: string;
    private kneeCurrentValue: string;
    private ratioCurrentValue: string;
    private attackCurrentValue: string;
    private releaseCurrentValue: string;

    constructor() {
      super();
      this.thresholdValue = null;
      this.kneeValue = null;
      this.ratioValue = null;
      this.attackValue = null;
      this.releaseValue = null;

      this.thresholdCurrentValue = '-24';
      this.kneeCurrentValue = '30';
      this.ratioCurrentValue = '12';
      this.attackCurrentValue = '0.003';
      this.releaseCurrentValue = '0.25';
    }

    connectedCallback() {
      this.render();
      this.initElement();
      this.initEvent();
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.input],
        eventKey: EventKeyType.EFFECT_COMPRESSOR_INPUT_THRESHOLD,
        listeners: [this.inputThresholdListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.input],
        eventKey: EventKeyType.EFFECT_COMPRESSOR_INPUT_KNEE,
        listeners: [this.inputKneeListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.input],
        eventKey: EventKeyType.EFFECT_COMPRESSOR_INPUT_RATIO,
        listeners: [this.inputRatioListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.input],
        eventKey: EventKeyType.EFFECT_COMPRESSOR_INPUT_ATTACK,
        listeners: [this.inputAttackListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.input],
        eventKey: EventKeyType.EFFECT_COMPRESSOR_INPUT_RELEASE,
        listeners: [this.inputReleaseListener],
        bindObj: this
      });
    }

    inputThresholdListener = (e) => {
      const { target } = e;

      if (!this.thresholdValue) return;
      this.thresholdValue.innerText = `${target.value}`;
    }

    inputKneeListener = (e) => {
      const { target } = e;

      if (!this.kneeValue) return;
      this.kneeValue.innerText = `${target.value}`;
    }

    inputRatioListener = (e) => {
      const { target } = e;

      if (!this.ratioValue) return;
      this.ratioValue.innerText = `${target.value}`;
    }

    inputAttackListener = (e) => {
      const { target } = e;

      if (!this.attackValue) return;
      this.attackValue.innerText = `${target.value}`;
    }

    inputReleaseListener = (e) => {
      const { target } = e;

      if (!this.releaseValue) return;
      this.releaseValue.innerText = `${target.value}`;
    }

    initElement(): void {
      this.thresholdValue = document.querySelector('.threshold-value');
      this.kneeValue = document.querySelector('.knee-value');
      this.ratioValue = document.querySelector('.ratio-value');
      this.attackValue = document.querySelector('.attack-value');
      this.releaseValue = document.querySelector('.release-value');
    }

    setDefaultProperties() {
      if (Controller.getIsEffectModifyMode()) {
        const effectIds = Controller.getModifyingEffectInfo();
        const effect = Controller.getEffect(effectIds.id, effectIds.trackId, effectIds.trackSectionId);

        this.thresholdCurrentValue = `${EffectUtil.roundPropertyValue(effect.properties.getProperty('threshold'))}`;
        this.kneeCurrentValue = `${EffectUtil.roundPropertyValue(effect.properties.getProperty('knee'))}`;
        this.ratioCurrentValue = `${EffectUtil.roundPropertyValue((effect.properties.getProperty('ratio')))}`;
        this.attackCurrentValue = `${EffectUtil.roundPropertyValue(effect.properties.getProperty('attack'), 3)}`;
        this.releaseCurrentValue = `${EffectUtil.roundPropertyValue(effect.properties.getProperty('release'), 3)}`;
      }
      else {
        this.thresholdCurrentValue = '-24';
        this.kneeCurrentValue = '30';
        this.ratioCurrentValue = '12';
        this.attackCurrentValue = '0.003';
        this.releaseCurrentValue = '0.25';
      }
    }

    render() {
      this.setDefaultProperties();

      this.innerHTML = `
          <div class="effect-input">

            <div class="effect-option-name">Threshold Value</div>
            <div class="property-percentage-input">
              <input class="property-percentage-input" type="range" value="${this.thresholdCurrentValue}" min="-100" max="0" step="1" event-key=${EventKeyType.EFFECT_COMPRESSOR_INPUT_THRESHOLD}>
              <div class="property-percentage-value threshold-value">${this.thresholdCurrentValue}</div>
            </div>

            <div class="effect-option-name">Knee Value</div>
            <div class="property-percentage-input">
              <input class="property-percentage-input" type="range" value="${this.kneeCurrentValue}" min="0" max="40" step="1" event-key=${EventKeyType.EFFECT_COMPRESSOR_INPUT_KNEE}>
              <div class="property-percentage-value knee-value">${this.kneeCurrentValue}</div>
            </div>

            <div class="effect-option-name">Ratio Value</div>
            <div class="property-percentage-input">
              <input class="property-percentage-input" type="range" value="${this.ratioCurrentValue}" min="1" max="20" step="1" event-key=${EventKeyType.EFFECT_COMPRESSOR_INPUT_RATIO}>
              <div class="property-percentage-value ratio-value">${this.ratioCurrentValue}</div>
            </div>

            <div class="effect-option-name">Attack Value</div>
            <div class="property-percentage-input">
              <input class="property-percentage-input" type="range" value="${this.attackCurrentValue}" min="0" max="1" step="0.001" event-key=${EventKeyType.EFFECT_COMPRESSOR_INPUT_ATTACK}>
              <div class="property-percentage-value attack-value">${this.attackCurrentValue}</div>
            </div>

            <div class="effect-option-name">Release Value</div>
            <div class="property-percentage-input">
              <input class="property-percentage-input" type="range" value="${this.releaseCurrentValue}" min="0" max="1" step="0.001" event-key=${EventKeyType.EFFECT_COMPRESSOR_INPUT_RELEASE}>
              <div class="property-percentage-value release-value">${this.releaseCurrentValue}</div>
            </div>
          </div>
      `;
    }
  };


  customElements.define('audi-effect-compressor', CompressorEffect);
})();

export { };
