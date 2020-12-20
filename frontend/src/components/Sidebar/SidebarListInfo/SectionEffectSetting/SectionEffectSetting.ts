import { ModalType, EventType, EventKeyType, EffectType, EffectTitleType, EffectContentType, IconType, StoreChannelType, SidebarMode } from '@types';
import { Controller, CommandController } from '@controllers';
import { EventUtil } from '@util';
import { Effect, GainProperties, CompressorProperties, FilterProperties, ReverbProperties, FadeInProperties, FadeOutProperties, EffectProperties } from '@model';
import { storeChannel } from "@store";
import './SectionEffectSetting.scss';

(() => {
  const SectionEffectSetting = class extends HTMLElement {

    private effectName: string;
    private effectType: string;
    private effectContentType: EffectContentType;

    constructor() {
      super();
      this.effectName = EffectTitleType.gain;
      this.effectType = EffectType.gain;
      this.effectContentType = EffectContentType.gain;
    }

    connectedCallback(): void {
      this.render();
      this.initEvent();
      this.subscribe();
    }


    render(): void {
      this.innerHTML = `
                <div class="effect-setting-outer-wrap">
                    <div class="effect-setting-title-wrap">
                      <div class="effect-setting-title">
                        <div>${this.effectName}</div>
                      </div>
                    </div>
                    ${this.effectContentType}

                    <div class="effect-setting-btn-wrap">
                        <audi-button data-event-key=${EventKeyType.EFFECT_SETTING_APPLY_BTN_CLICK} data-value="적용" ></audi-button>
                        <audi-button data-event-key=${EventKeyType.EFFECT_SETTING_CANCEL_BTN_CLICK} data-value="취소"></audi-button>
                    </div>
                </div>
            `;
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EFFECT_SETTING_APPLY_BTN_CLICK,
        listeners: [this.applyEffectListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EFFECT_SETTING_CANCEL_BTN_CLICK,
        listeners: [this.cancelEffectListener],
        bindObj: this
      });
    }

    applyEffectListener(): void {
      try {
        switch (this.effectType) {
          case EffectType.gain:
            this.addGainEffect();
            break;
          case EffectType.compressor:
            this.addCompressorEffect();
            break;
          case EffectType.filter:
            this.addFilterEffect();
            break;
          case EffectType.reverb:
            this.addReverbEffect();
            break;
          case EffectType.fadein:
            this.addFadeInEffect();
            break;
          case EffectType.fadeout:
            this.addFadeOutEffect();
            break;
          default:
            break;
        }
        Controller.changeSidebarMode(SidebarMode.EFFECT_LIST);
        Controller.setIsEffectModifyMode(false);
      } catch (e) {
        console.log(e);
      }

      this.render();
    }

    addGainEffect(): void {
      const gainElement: HTMLInputElement | null = document.querySelector('input.gain-percentage-input');
      if (!gainElement) return;

      const gain = Number(gainElement.value) / 100;

      const effectProperties = new GainProperties({ gain: gain });
      const newEffect = new Effect({ name: this.effectType, properties: effectProperties });

      this.updateEffectList(newEffect);
    }

    addCompressorEffect(): void {
      const compressorThreshold: HTMLDivElement | null = document.querySelector('div.threshold-value');
      const compressorKnee: HTMLDivElement | null = document.querySelector('div.knee-value');
      const compressorRatio: HTMLDivElement | null = document.querySelector('div.ratio-value');
      const compressorAttack: HTMLDivElement | null = document.querySelector('div.attack-value');
      const compressorRelease: HTMLDivElement | null = document.querySelector('div.release-value');
      if (!compressorThreshold || !compressorKnee || !compressorRatio || !compressorAttack || !compressorRelease) return;

      const threshold = Number(compressorThreshold.innerText);
      const knee = Number(compressorKnee.innerText);
      const ratio = Number(compressorRatio.innerText);
      const attack = Number(compressorAttack.innerText);
      const release = Number(compressorRelease.innerText);

      const effectProperties = new CompressorProperties({ threshold: threshold, knee: knee, ratio: ratio, attack: attack, release: release });
      const newEffect = new Effect({ name: this.effectType, properties: effectProperties });

      this.updateEffectList(newEffect);
    }

    addFilterEffect(): void {
      const filterRadios = document.getElementsByName('filter-type');
      const filterFrequency: HTMLDivElement | null = document.querySelector('div.frequency-value');
      const filterQ: HTMLDivElement | null = document.querySelector('div.Q-value');
      if (!filterRadios || !filterFrequency || !filterQ) return;

      let type: string = '';
      filterRadios.forEach((radio: HTMLElement) => {
        if (radio.checked) {
          type = radio.value;
        }
      })
      const frequency = Number(filterFrequency.innerText);
      const Q = Number(filterQ.innerText);

      const effectProperties = new FilterProperties({ type: type, frequency: frequency, Q: Q });
      const newEffect = new Effect({ name: this.effectType, properties: effectProperties });

      this.updateEffectList(newEffect);
    }

    addReverbEffect(): void {
      const reverbMix: HTMLDivElement | null = document.querySelector('div.mix-ratio-value');
      const reverbTime: HTMLDivElement | null = document.querySelector('div.time-value');
      const reverbDecay: HTMLDivElement | null = document.querySelector('div.decay-value');

      if (!reverbMix || !reverbTime || !reverbDecay) return;

      const mix = Number(reverbMix.innerText);
      const time = Number(reverbTime.innerText);
      const decay = Number(reverbDecay.innerText);

      const effectProperties = new ReverbProperties({ mix: mix, time: time, decay: decay });
      const newEffect = new Effect({ name: this.effectType, properties: effectProperties });

      this.updateEffectList(newEffect);
    }

    addFadeInEffect(): void {
      const fadeInLengthElement: HTMLDivElement | null = document.querySelector('div.fade-in-length');

      if (!fadeInLengthElement) return;

      const fadeInLength = Number(fadeInLengthElement.innerText);
      const effectProperties = new FadeInProperties({ fadeInLength: fadeInLength });
      const newEffect = new Effect({ name: this.effectType, properties: effectProperties });

      this.updateEffectList(newEffect);
    }

    addFadeOutEffect(): void {
      const fadeOutLengthElement: HTMLDivElement | null = document.querySelector('div.fade-out-length');
      if (!fadeOutLengthElement) return;

      const fadeOutLength = Number(fadeOutLengthElement.innerText);
      const effectProperties = new FadeOutProperties({ fadeOutLength: fadeOutLength });
      const newEffect = new Effect({ name: this.effectType, properties: effectProperties });

      this.updateEffectList(newEffect);
    }

    cancelEffectListener(): void {
      Controller.changeSidebarMode(SidebarMode.EFFECT_LIST);
    }

    openEffectListModalBtnClickListener(): void {
      Controller.changeModalState(ModalType.effect, false);
    }

    subscribe(): void {
      storeChannel.subscribe(StoreChannelType.EFFECT_OPTION_TYPE_CHANNEL, this.effectOptionTypeObserverCallback, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.EFFECT_OPTION_TYPE_CHANNEL, this.effectOptionTypeObserverCallback, this);
    }

    effectOptionTypeObserverCallback(newEffectOptionType): void {
      this.changeEffectOption(newEffectOptionType);
      this.render();
    }

    changeEffectOption(effectType: EffectType): void {
      this.effectName = EffectTitleType[`${effectType}`];
      this.effectType = EffectType[`${effectType}`];
      this.effectContentType = EffectContentType[`${effectType}`];
    }

    updateEffectList(newEffect: Effect): void {
      if (!Controller.getIsEffectModifyMode()) {
        CommandController.executeAddEffectCommand(newEffect);
      }
      else {
        const { id: modifyEffectId } = Controller.getModifyingEffectInfo();
        newEffect.id = modifyEffectId;
        CommandController.executeModifyEffectCommand(newEffect);
      }
    }

  }
  customElements.define('audi-section-effect-setting', SectionEffectSetting);
})();

export { };
