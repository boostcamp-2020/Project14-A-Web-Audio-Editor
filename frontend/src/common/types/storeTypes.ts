import { Source } from "@model"
import { ModalStateType } from "@types"

enum StoreChannelType {
    SOURCE_LIST_CHANNEL = 'SOURCE_LIST_CHANNEL',
    MODAL_STATE_CHANNEL = 'MODAL_STATE_CHANNEL'
}

interface StoreStateType {
    sourceList: Source[];
    modalState: ModalStateType;
}

export{
    StoreStateType,
    StoreChannelType
}
