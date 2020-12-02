import { Source, Track } from "@model"
import { ModalStateType } from "@types"

enum StoreChannelType {
    SOURCE_LIST_CHANNEL = 'SOURCE_LIST_CHANNEL',
    MODAL_STATE_CHANNEL = 'MODAL_STATE_CHANNEL',
    TRACK_DRAG_STATE_CHANNEL = 'TRACK_DRAG_STATE_CHANNEL',
    TRACK_SECTION_LIST_CHANNEL = 'TRACK_SECTION_LIST_CHANNEL'
}

interface StoreStateType {
    sourceList: Source[];
    modalState: ModalStateType;
    isTrackDraggable: Boolean;
    trackList : Track[];
}

interface StoreObserverData {
    callback: Function;
    bindObj: Object;
}

export{
    StoreStateType,
    StoreChannelType,
    StoreObserverData
}
