import { Source, Track, AudioSourceInfoInTrack, TrackSection } from '@model';
import { ModalStateType } from '@types';

enum CursorType {
  SELECT_MODE = 'SELECT_MODE',
  CUT_MODE = 'CUT_MODE'
}

interface FocusInfo {
  trackSection: TrackSection;
  element: HTMLCanvasElement;
}

enum StoreChannelType {
  SOURCE_LIST_CHANNEL = 'SOURCE_LIST_CHANNEL',
  MODAL_STATE_CHANNEL = 'MODAL_STATE_CHANNEL',
  TRACK_DRAG_STATE_CHANNEL = 'TRACK_DRAG_STATE_CHANNEL',
  TRACK_SECTION_LIST_CHANNEL = 'TRACK_SECTION_LIST_CHANNEL',
  CURSOR_TIME_CHANNEL = 'CURSOR_TIME_CHANNEL',
  TRACK_CHANNEL = 'TRACK_CHANNEL',
  CURRENT_POSITION_CHANNEL = 'CURRENT_POSITION_CHANNEL',
  EDIT_TOOLS_CHANNEL = 'EDIT_TOOLS_CHANNEL',
  MARKER_TIME_CHANNEL = 'MARKER_TIME_CHANNEL',
  IS_PAUSE_CHANNEL = 'IS_PAUSE_CHANNEL',
  PLAY_TIME_CHANNEL = 'PLAY_TIME_CHANNEL',
  MAX_TRACK_WIDTH_CHANNEL = 'MAX_TRACK_WIDTH_CHANNEL',
  CURSOR_MODE_CHANNEL = 'CURSOR_MODE_CHANNEL',
  EDIT_MENU_CHANNEL = 'EDIT_MENU_CHANNEL',
  PLAY_OR_PAUSE_CHANNEL = 'PLAY_OR_PAUSE_CHANNEL',
  SOLO_CHANNEL = 'SOLO_CHANNEL'
}

interface StoreStateType {
  cursorStringTime: string;
  playStringTime: string;
  sourceList: Source[];
  modalState: ModalStateType;
  isTrackDraggable: Boolean;
  trackList: Track[];
  audioSourceInfoInTrackList: AudioSourceInfoInTrack[];
  currentPosition: number;
  focusList: FocusInfo[];
  ctrlIsPressed: boolean;
  cursorMode: CursorType;
  trackIndex: number;
  sectionIndex: number;
  clipBoard: TrackSection | null;
  markerNumberTime: number;
  cursorNumberTime: number;
  isPause: boolean;
  maxTrackWidth: number;
}

interface StoreObserverData {
  callback: Function;
  bindObj: Object;
}

interface EffectList {
  name: string;
}

export { StoreStateType, StoreChannelType, StoreObserverData, CursorType, FocusInfo, EffectList };
