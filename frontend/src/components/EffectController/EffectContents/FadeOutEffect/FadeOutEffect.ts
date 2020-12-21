import "./FadeOutEffect.scss";
import { EventType, EventKeyType } from '@types';
import { EventUtil, EffectUtil } from '@util';
import { Controller } from "@controllers";

(() => {
  const FadeOutEffect = class extends HTMLElement {
    private fadeOutLengthValueElement: HTMLDivElement | null;
    private fadeOutLengthCurrentValue: string;
    private sectionLength: number;
    constructor() {
      super();
      this.fadeOutLengthValueElement = null;
      this.fadeOutLengthCurrentValue = '0';
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
        eventKey: EventKeyType.EFFECT_FADE_OUT_INPUT_LENGTH,
        listeners: [this.inputFadeInLengthListener],
        bindObj: this
      });
    }

    inputFadeInLengthListener = (e) => {
      const { target } = e;

      if (!this.fadeOutLengthValueElement) return;
      this.fadeOutLengthValueElement.innerText = `${target.value}`;
    }

    initElement(): void {
      this.fadeOutLengthValueElement = document.querySelector('.fade-out-length');
    }

    setDefaultProperties() {
      if (Controller.getIsEffectModifyMode()) {
        const effectIds = Controller.getModifyingEffectInfo();
        const effect = Controller.getEffect(effectIds.id, effectIds.trackId, effectIds.trackSectionId);

        const focusList = Controller.getFocusList();
        const trackSectionLength = focusList[0].trackSection.length;
        const fadeOutProperty = effect.properties.getProperty('fadeOutLength');
        const maxLength = Math.min(fadeOutProperty, trackSectionLength);

        this.fadeOutLengthCurrentValue = `${EffectUtil.floorPropertyValue(maxLength, 1)}`;
      }
      else {
        this.fadeOutLengthCurrentValue = '1';
      }

      const focusList = Controller.getFocusList();
      this.sectionLength = focusList.reduce((acc, focus) => Math.min(acc, focus.trackSection.length), focusList[0].trackSection.length);
    }

    render() {
      this.innerHTML = `
          <div class="effect-input">
            <div class="effect-option-name"> Fade out time</div>
            <div class="fade-out-length-input">
              <input class="fade-out-length-input" type="range" value="${this.fadeOutLengthCurrentValue}" min="0.1" max="${this.sectionLength}" step="0.1" event-key=${EventKeyType.EFFECT_FADE_OUT_INPUT_LENGTH}>
              <div class="property-percentage-value fade-out-length">${this.fadeOutLengthCurrentValue}</div>
            </div>
          </div>
      `;
    }
  };
  customElements.define('audi-effect-fade-out', FadeOutEffect);
})();

export { };
