import { icons } from '../IconButton/icons';
import { ModalType, EventType, EventKeyType, EffectList } from '@types';
import { Controller } from '@controllers';
import { EventUtil } from '@util';
import './SectionEffectList.scss';

(() => {
  const SectionEffectList = class extends HTMLElement {
    private size: string;
    private color: string;
    private effectList: EffectList[];

    constructor() {
      super();
      this.size = '20px';
      this.color = 'white';
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
                        <svg
                          class="icon"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          role="img"
                          width="${this.size}"
                          height="${this.size}"
                          event-key="${EventKeyType.EFFECT_LIST_OPEN_MODAL_BTN_CLICK}"
                        > 
                          <path fillRule="evenodd" fill="${this.color}" d="${icons.menu}"></path>
                        </svg>   
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

      return focusList[0].trackSection.effectList.reduce(
        (acc, effect) =>
          (acc += `
          <li class="effect-container">
            <div class="effect"> 
              <div>${effect.name}</div>
              <svg
                class="icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                role="img"
                width="${this.size}"
                height="${this.size}"
              > 
                <path fillRule="evenodd" fill="${this.color}" d="${icons.delete}"></path>
              </svg>   
            </div>
          </li>
        `),
        ''
      );
    }

    openEffectListModalBtnClickListener(): void {
      Controller.changeModalState(ModalType.effect, false);
    }

    updateEffectList(newEffect: EffectList): void {
      this.effectList = [...this.effectList, newEffect];
      this.render();
    }

    hide(): void {
      this.classList.add('hide');
    }

    show(): void {
      this.classList.remove('hide');
    }
  };

  customElements.define('audi-section-effect-list', SectionEffectList);
})();

export {};
