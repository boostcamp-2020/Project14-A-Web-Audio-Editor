import "./FadeInEffect.scss";
import { EventType, EventKeyType } from '@types';
import { EventUtil, EffectUtil } from '@util';
import { Controller } from "@controllers";

(() => {
  const FadeInEffect = class extends HTMLElement {
    private fadeInLengthValueElement: HTMLDivElement | null;
    private fadeInLengthCurrentValue: string;
    private sectionLength: number;
    constructor() {
      super();
      this.fadeInLengthValueElement = null;
      this.fadeInLengthCurrentValue = '0';
      this.sectionLength = 0;
    }

    connectedCallback() {
      this.setDefaultProperties();
      this.render();
      this.initElement();
      this.initEvent();
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.input],
        eventKey: EventKeyType.EFFECT_FADE_IN_INPUT_LENGTH,
        listeners: [this.inputFadeInLengthListener],
        bindObj: this
      });
    }

    inputFadeInLengthListener = (e) => {
      const { target } = e;
      if (!this.fadeInLengthValueElement) return;
      this.fadeInLengthValueElement.innerText = `${target.value}`;
    }

    initElement(): void {
      this.fadeInLengthValueElement = this.querySelector('.fade-in-length');
    }

    setDefaultProperties() {
      if (Controller.getIsEffectModifyMode()) {
        const effectIds = Controller.getModifyingEffectInfo();
        const effect = Controller.getEffect(effectIds.id, effectIds.trackId, effectIds.trackSectionId);

        const focusList = Controller.getFocusList();
        const trackSectionLength = focusList[0].trackSection.length;
        const fadeInProperty = effect.properties.getProperty('fadeInLength');
        const maxLength = Math.min(fadeInProperty, trackSectionLength);

        this.fadeInLengthCurrentValue = `${EffectUtil.floorPropertyValue(maxLength, 1)}`;
      }
      else {
        this.fadeInLengthCurrentValue = '1';
      }

      const focusList = Controller.getFocusList();
      this.sectionLength = focusList.reduce((acc, focus) => Math.min(acc, focus.trackSection.length), focusList[0].trackSection.length);
    }

    render() {
      this.innerHTML = `
          <div class="effect-input">
            <div class="effect-option-name"> Fade in time</div>
            <div class="property-percentage-input">
              <input class="property-percentage-input" type="range" value="${this.fadeInLengthCurrentValue}" min="0.1" max="${this.sectionLength}" step="0.1" event-key=${EventKeyType.EFFECT_FADE_IN_INPUT_LENGTH}>
              <div class="property-percentage-value fade-in-length">${this.fadeInLengthCurrentValue}</div>
            </div>
          </div>
      `;
    }
  };
  customElements.define('audi-effect-fade-in', FadeInEffect);
})();

export { };
