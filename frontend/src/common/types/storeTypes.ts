import { Source } from '@model';
import { ModalStateType } from '@types';

enum StoreChannelType {
  SOURCE_LIST_CHANNEL = 'SOURCE_LIST_CHANNEL',
  MODAL_STATE_CHANNEL = 'MODAL_STATE_CHANNEL',
  CURSOR_TIME_CHANNEL = 'CURSOR_TIME_CHANNEL'
}

interface StoreStateType {
  cursorTime: string;
  sourceList: Source[];
  modalState: ModalStateType;
}

interface StoreObserverData {
  callback: Function;
  bindObj: Object;
}

export { StoreStateType, StoreChannelType, StoreObserverData };
