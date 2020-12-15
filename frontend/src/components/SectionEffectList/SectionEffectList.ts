import { ModalType, EventType, EventKeyType, IconType } from '@types';
import { Controller } from '@controllers';
import { EventUtil } from '@util';
import { Effect } from '@model';
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
                <div class="effect-list-outer-wrap">
                    <div class="effect-list-title-wrap">
                      <div class="effect-list-title">
                        <div>Effect</div>
                        <audi-icon-button class="delegation" id="${IconType.listAdd}" color="white" icontype="${IconType.listAdd}" event-key=${EventKeyType.EFFECT_LIST_OPEN_MODAL_BTN_CLICK}></audi-icon-button> 
                      </div>
                    </div>
                    <ul class="effect-list-wrap">
                        ${this.getEffectList()}
                    </ul>  
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
          <li class="effect-container">
            <div class="effect"> 
              <div>${effect.name}</div>
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
