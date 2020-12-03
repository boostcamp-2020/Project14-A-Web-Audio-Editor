import { Source, Track, TrackSection } from "@model"
import { ModalStateType } from "@types"

enum StoreChannelType {
  SOURCE_LIST_CHANNEL = 'SOURCE_LIST_CHANNEL',
  MODAL_STATE_CHANNEL = 'MODAL_STATE_CHANNEL',
  TRACK_DRAG_STATE_CHANNEL = 'TRACK_DRAG_STATE_CHANNEL',
  TRACK_SECTION_LIST_CHANNEL = 'TRACK_SECTION_LIST_CHANNEL',
  CURSOR_TIME_CHANNEL = 'CURSOR_TIME_CHANNEL',
  EDIT_TOOLS_CHANNEL = 'EDIT_TOOLS_CHANNEL'
}

enum CursorType {
  SELECT_MODE = 'SELECT_MODE',
  CUT_MODE = 'CUT_MODE'
}

interface FocusInfo {
  trackSection: TrackSection,
  element: HTMLElement
}

interface StoreStateType {
  cursorTime: string;
  sourceList: Source[];
  modalState: ModalStateType;
  isTrackDraggable: Boolean;
  trackList: Track[];
  focusList: FocusInfo[];
  ctrlIsPressed: boolean;
  cursorMode: CursorType;
  trackIndex: number;
  sectionIndex: number;
  clipBoard: TrackSection | null;
}

interface StoreObserverData {
  callback: Function;
  bindObj: Object;
}

export { StoreStateType, StoreChannelType, StoreObserverData, CursorType, FocusInfo };
