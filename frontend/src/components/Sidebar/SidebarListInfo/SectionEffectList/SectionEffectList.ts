import { ModalType, EventType, EventKeyType, IconType } from '@types';
import { Controller } from '@controllers';
import { EventUtil } from '@util';
import { Effect, Source } from '@model';
import './SectionEffectList.scss';

(() => {
  const SectionEffectList = class extends HTMLElement {
    private effectList: Effect[];

    constructor() {
      super();
      this.effectList = [];
    }

    connectedCallback(): void {
      this.render();
      this.initEvent();
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EFFECT_LIST_OPEN_MODAL_BTN_CLICK,
        listeners: [this.openEffectListModalBtnClickListener],
        bindObj: this
      });
    }
    render(): void {
      this.innerHTML = `
                    
                    <div class="section-effect-list-container">
                      <div class="section-effect-list-title">
                        <div>Effect</div>
                        <audi-icon-button class="delegation" id="${IconType.listAdd}" icontype="${IconType.listAdd}" event-key=${EventKeyType.EFFECT_LIST_OPEN_MODAL_BTN_CLICK}></audi-icon-button> 
                      </div>
                      <ul class="section-effect-list-wrap">
                        ${this.getEffectList()}
                      </ul>  
                      <div class='section-effect-list-select-info-wrap'>
                        <ul class="section-effect-list-select-info">
                            <li class='section-effect-list-select-info-item'>파일명: - </li>
                            <li class='section-effect-list-select-info-item'>재생시간: - </li>
                            <li class='section-effect-list-select-info-item'>용량: - </li>
                            <li class='section-effect-list-select-info-item'>채널 수: - </li>
                            <li class='section-effect-list-select-info-item'>샘플레이트: - </li>
                        </ul>
                      </div>
                    </div>
            `;
    }

    getEffectList(): string {
      const focusList = Controller.getFocusList();

      if (!focusList.length) return '';
      if (focusList.length > 1) {
        return `${focusList.length}개 Section 선택`;
      }

      return focusList[0].trackSection.effectList.reduce(
        (acc, effect) =>
        (acc += `
          <li class="section-effect-container">
            <div class="section-effect"> 
              <span class="section-effect-list-effect-name">${effect.name}</span>
              <audi-icon-button icontype=${IconType.delete}></audi-icon-button> 
            </div>
          </li>
        `),
        ''
      );
    }

    openEffectListModalBtnClickListener(): void {
      Controller.changeModalState(ModalType.effect, false);
    }

    clickSourceObserverCallback(source: Source): void {
      const { fileName, fileSize, sampleRate, duration, numberOfChannels } = source;
    }
    // updateEffectList(newEffect: Effect): void {
    //   this.effectList = [...this.effectList, newEffect];
    //   this.render();
    // }

    hide(): void {
      this.classList.add('hide');
    }

    show(): void {
      this.classList.remove('hide');
      this.render();
    }
  };

  customElements.define('audi-section-effect-list', SectionEffectList);
})();

export { };