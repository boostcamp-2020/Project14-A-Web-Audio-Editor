import { Source } from '@model';
import { store } from '@store';
import { ModalType } from '@types';

const addSource = (source: Source): void => {
  store.setSource(source);
};

const changeModalState = (modalType: ModalType, isHidden: Boolean): void => {
  store.setModalState(modalType, isHidden);
};

const changeCursorTime = (minute: string, second: string, milsecond: string): void => {
  store.setCursorTime(minute, second, milsecond);
};

export default {
  addSource,
  changeModalState,
  changeCursorTime
};
