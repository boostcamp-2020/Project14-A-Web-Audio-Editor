import { ModalType, EventType, EventKeyType, IconType, StoreChannelType, EffectType, EffectTitleType, SidebarMode } from '@types';
import { Controller, CommandController } from '@controllers';
import { EventUtil, EffectUtil } from '@util';
import { Source } from '@model';
import './SectionEffectList.scss';
import { storeChannel } from '@store';

(() => {
  const SectionEffectList = class extends HTMLElement {

    constructor() {
      super();
    }

    connectedCallback(): void {
      this.render();
      this.initEvent();
      this.subscribe();
    }

    initEvent(): void {
      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EFFECT_LIST_OPEN_MODAL_BTN_CLICK,
        listeners: [this.openEffectListModalBtnClickListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EFFECT_DELETE_BTN_CLICK,
        listeners: [this.deleteEffectBtnClickListener],
        bindObj: this
      });

      EventUtil.registerEventToRoot({
        eventTypes: [EventType.click],
        eventKey: EventKeyType.EFFECT_MODIFY,
        listeners: [this.modifyEffectListener],
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
                          ${this.getSectionInfo()}
                        </ul>
                      </div>
                    </div>
            `;
    }

    getSectionInfo(): string {
      const focusList = Controller.getFocusList();
      const trackSection = focusList[0].trackSection;
      const source = Controller.getSource(trackSection.trackId, trackSection.id);

      if (!focusList.length) return `
        <li class='section-effect-list-select-info-item'>파일명: - </li>
        <li class='section-effect-list-select-info-item'>시작시간: - </li>
        <li class='section-effect-list-select-info-item'>종료시간: - </li>
        <li class='section-effect-list-select-info-item'>길이: - </li>
        `;

      if (focusList.length > 1) {
        return `
          <li class='section-effect-list-multi-select-info-item'>${focusList.length}개 Section 선택</li>
        `;
      }

      return `
        <li class='section-effect-list-select-info-item'>파일명: ${source?.fileName} </li>
        <li class='section-effect-list-select-info-item'>시작시간: ${EffectUtil.roundPropertyValue(trackSection.trackStartTime, 2)}초 </li>
        <li class='section-effect-list-select-info-item'>종료시간: ${EffectUtil.roundPropertyValue(trackSection.trackStartTime + trackSection.length, 2)}초</li>
        <li class='section-effect-list-select-info-item'>길이: ${EffectUtil.roundPropertyValue(trackSection.length, 2)}초</li>
      `
    }

    getEffectList(): string {
      const focusList = Controller.getFocusList();

      if (focusList.length !== 1) {
        return ``;
      }
      const trackSection = focusList[0].trackSection;

      return focusList[0].trackSection.effectList.reduce(
        (acc, effect) =>
        (acc += `
          <li class="section-effect-container" data-effect-name="${effect.name}" data-effect-id="${effect.id}" data-effect-track-id="${trackSection.trackId}" data-effect-track-section-id="${trackSection.id}">
            <div class="section-effect delegation" event-key="${EventKeyType.EFFECT_MODIFY}"> 
              <span class="section-effect-list-effect-name">${EffectTitleType[effect.name]}</span>
              <audi-icon-button icontype=${IconType.deleteEffect}  class="delegation" event-key="${EventKeyType.EFFECT_DELETE_BTN_CLICK}"></audi-icon-button> 
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

    deleteEffectBtnClickListener(e) {
      const effectContainer = e.target.closest(".section-effect-container");
      const effectId: number = Number(effectContainer.dataset.effectId);

      CommandController.executeDeleteEffectCommand(effectId);
    }

    modifyEffectListener(e) {
      const effectContainer = e.target.closest(".section-effect-container");

      const effectId: number = Number(effectContainer.dataset.effectId);
      const effectTrackId: number = Number(effectContainer.dataset.effectTrackId);
      const effectTrackSectionId: number = Number(effectContainer.dataset.effectTrackSectionId);
      const effectType = effectContainer.dataset.effectName;

      Controller.setIsEffectModifyMode(true);
      Controller.setModifyingEffectInfo({ id: effectId, trackId: effectTrackId, trackSectionId: effectTrackSectionId });

      Controller.changeSidebarMode(SidebarMode.EFFECT_OPTION);
      Controller.changeEffectOptionType(effectType);
    }

    subscribe() {
      storeChannel.subscribe(StoreChannelType.EFFECT_STATE_CHANNEL, this.render, this);
      storeChannel.subscribe(StoreChannelType.FOCUS_LIST_CHANNEL, this.render, this);
    }

    disconnectedCallback() {
      this.unsubscribe();
    }

    unsubscribe(): void {
      storeChannel.unsubscribe(StoreChannelType.EFFECT_STATE_CHANNEL, this.render, this);
      storeChannel.unsubscribe(StoreChannelType.FOCUS_LIST_CHANNEL, this.render, this);
    }

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
