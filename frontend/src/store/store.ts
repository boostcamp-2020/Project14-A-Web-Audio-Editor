import { StoreStateType } from '@types';
import { Source } from '../model';
import { StoreChannelType, ModalType, ModalStateType } from '@types';
import { storeChannel } from '@store';

const store = new (class Store {
  private state: StoreStateType;

  constructor() {
    this.state = {
      cursorTime: '00:00:000',
      sourceList: [],
      modalState: {
        modalType: ModalType.upload,
        isHidden: true
      }
    };
  }

  setSource(source: Source): void {
    const { sourceList } = this.state;
    source.id = sourceList.length;

    const newSourceList = sourceList.concat(source);
    this.state = { ...this.state, sourceList: newSourceList };
    storeChannel.publish(StoreChannelType.SOURCE_LIST_CHANNEL, newSourceList);
  }

  setModalState(newModalType: ModalType, newIsHiiden: Boolean): void {
    const { modalState } = this.state;
    const { modalType, isHidden } = modalState;

    if (modalType === newModalType && isHidden === newIsHiiden) return;

    const newModalState: ModalStateType = { modalType: newModalType, isHidden: newIsHiiden };
    this.state = { ...this.state, modalState: newModalState };
    storeChannel.publish(StoreChannelType.MODAL_STATE_CHANNEL, newModalState);
  }

  setCursorTime(newMinute: string, newSecond: string, newMilsecond): void {
    const { cursorTime } = this.state;
    const [minute, second, milsecond] = cursorTime.split(':');

    if (minute === newMinute && second === newSecond && milsecond === newMilsecond) return;

    const newCursorTime: string = `${newMinute.padStart(2, '0')}:${newSecond.padStart(2, '0')}:${newMilsecond.padStart(3, '0')}`;
    this.state = { ...this.state, cursorTime: newCursorTime };
    storeChannel.publish(StoreChannelType.CURSOR_TIME_CHANNEL, newCursorTime);
  }
})();

export { store };
