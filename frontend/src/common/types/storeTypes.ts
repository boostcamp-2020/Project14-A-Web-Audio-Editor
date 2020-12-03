import { Source, Track, AudioSourceInfoInTrack } from "@model"
import { ModalStateType } from "@types"

enum StoreChannelType {
    SOURCE_LIST_CHANNEL = 'SOURCE_LIST_CHANNEL',
    MODAL_STATE_CHANNEL = 'MODAL_STATE_CHANNEL',
    TRACK_DRAG_STATE_CHANNEL = 'TRACK_DRAG_STATE_CHANNEL',
    TRACK_SECTION_LIST_CHANNEL = 'TRACK_SECTION_LIST_CHANNEL',
    CURSOR_TIME_CHANNEL = 'CURSOR_TIME_CHANNEL',
    TRACK_CHANNEL = 'TRACK_CHANNEL',
    CURRENT_POSITION_CHANNEL = 'CURRENT_POSITION_CHANNEL'
}

interface StoreStateType {
    cursorTime: string;
    sourceList: Source[];
    modalState: ModalStateType;
    isTrackDraggable: Boolean;
    trackList : Track[];
    audioSourceInfoInTrackList: AudioSourceInfoInTrack[];
    currentPosition: number;
}

interface StoreObserverData {
  callback: Function;
  bindObj: Object;
}

export { StoreStateType, StoreChannelType, StoreObserverData };
