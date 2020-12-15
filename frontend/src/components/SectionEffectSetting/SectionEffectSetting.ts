import { ModalType, EventType, EventKeyType, EffectType, EffectTitleType, EffectContentType, IconType } from '@types';
import { Controller } from '@controllers';
import { EventUtil, SectionEffectSettingUtil } from '@util';
import { Effect, GainProperties, CompressorProperties, FilterProperties, ReverbProperties, EffectProperties } from '@model';
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

    applyEffectListener() {        
        let effectProperties:EffectProperties|null = null;
        let newEffect:Effect|null = null;

        switch(this.effectType) {
            case EffectType.gain:
                const gainElement:HTMLInputElement = document.querySelector('input.gain-percentage-input');
                if(!gainElement) return;
                
                const gain = Number(gainElement.value) / 100;
                effectProperties = new GainProperties({gain:gain});
                newEffect = new Effect({name:this.effectType, properties:effectProperties});
                Controller.addEffect(newEffect); 
                break;

            case EffectType.compressor:
                const compressorThreshold:HTMLDivElement  = document.querySelector('div.threshold-value');
                const compressorKnee:HTMLDivElement  = document.querySelector('div.knee-value');
                const compressorRatio:HTMLDivElement  = document.querySelector('div.ratio-value');
                const compressorAttack:HTMLDivElement  = document.querySelector('div.attack-value');
                const compressorRelease:HTMLDivElement  = document.querySelector('div.release-value');
                if(!compressorThreshold||!compressorKnee||!compressorRatio||!compressorAttack||!compressorRelease) return;
            
                const threshold = Number(compressorThreshold.innerText);
                const knee = Number(compressorKnee.innerText);
                const ratio = Number(compressorRatio.innerText);
                const attack = Number(compressorAttack.innerText);
                const release= Number(compressorRelease.innerText);

                effectProperties = new CompressorProperties({threshold:threshold, knee:knee, ratio:ratio, attack:attack, release:release});
                newEffect = new Effect({name:this.effectType, properties:effectProperties});
                Controller.addEffect(newEffect);
                break;

            case EffectType.filter:
                const filterRadios = document.getElementsByName('filter-type');
                const filterFrequency:HTMLDivElement = document.querySelector('div.frequency-value');
                const filterQ:HTMLDivElement = document.querySelector('div.Q-value');

                if(!filterRadios||!filterFrequency||!filterQ) return;
                let type:string='';
                filterRadios.forEach((radio)=>{
                    if(radio.checked){
                        type = radio.value; 
                    }
                })
                const frequency = Number(filterFrequency.innerText);
                const Q = Number(filterQ.innerText);
                
                effectProperties = new FilterProperties({type:type, frequency:frequency, Q:Q});
                newEffect = new Effect({name:this.effectType, properties:effectProperties});
                Controller.addEffect(newEffect);
                break;

            case EffectType.reverb:
                const reverbMix:HTMLDivElement = document.querySelector('div.mix-ratio-value');
                const reverbTime:HTMLDivElement = document.querySelector('div.time-value');
                const reverbDecay:HTMLDivElement = document.querySelector('div.decay-value');
               
                if(!reverbMix || !reverbTime || !reverbDecay) return;

                const mix = Number(reverbMix.innerText);
                const time = Number(reverbTime.innerText);
                const decay = Number(reverbDecay.innerText);

                effectProperties = new ReverbProperties({mix:mix, time:time, decay:decay});
                newEffect = new Effect({name:this.effectType, properties:effectProperties});
                Controller.addEffect(newEffect);

                break;
            default:
                break;
        }
     
        SectionEffectSettingUtil.hideEffectSetting();   
    }

    cancelEffectListener() {
      SectionEffectSettingUtil.hideEffectSetting();
    }

    openEffectListModalBtnClickListener(): void {
      Controller.changeModalState(ModalType.effect, false);
    }

    hide(): void {
      this.classList.add('hide');
    }

    show(effectType:string): void {     
      switch(effectType){
          case EffectType.gain:
            this.effectName = EffectTitleType.gain;
            this.effectType = EffectType.gain;
            this.effectContentType = EffectContentType.gain;
            break;
          case EffectType.compressor:
            this.effectName = EffectTitleType.compressor;
            this.effectType = EffectType.compressor;
            this.effectContentType = EffectContentType.compressor;
              break;
          case EffectType.filter:
            this.effectName = EffectTitleType.filter;
            this.effectType = EffectType.filter;
            this.effectContentType = EffectContentType.filter;
              break;
          case EffectType.reverb:
            this.effectName = EffectTitleType.reverb;
            this.effectType = EffectType.reverb;
            this.effectContentType = EffectContentType.reverb;
              break;
          default: 
              break;
      }

      this.render();
      
      this.classList.remove('hide');
    }
  };

  customElements.define('audi-section-effect-setting', SectionEffectSetting);
})();

export { };
