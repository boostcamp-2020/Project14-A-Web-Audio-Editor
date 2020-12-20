import { Source, Track, AudioSourceInfoInTrack, TrackSection, SectionDragStartData, SelectTrackData } from '@model';
import { ModalStateType, ZoomInfoType, SidebarMode, EffectType, ModifyingEffectInfo } from '@types';

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
  FILE_TOOLS_CHANNEL = 'FILE_TOOLS_CHANNEL',
  PLAY_OR_PAUSE_CHANNEL = 'PLAY_OR_PAUSE_CHANNEL',
  MAX_TRACK_PLAY_TIME_CHANNEL = 'MAX_TRACK_PLAY_TIME_CHANNEL',
  CURRENT_SCROLL_AMOUNT_CHANNEL = 'CURRENT_SCROLL_AMOUNT_CHANNEL',
  TRACK_LIST_CHANNEL = 'TRACK_LIST_CHANNEL',
  SELECT_AUDIO_TRACK = 'SELECT_AUDIO_TRACK',
  FOCUS_LIST_CHANNEL = 'FOCUS_LIST_CHANNEL',
  ZOOM_RATE_CHANNEL = 'ZOOM_RATE_CHANNEL',
  RESET_MARKER_POSITION_CHANNEL = 'RESET_MARKER_POSITION_CHANNEL',
  TOTAL_TIME_CHANNEL = 'TOTAL_TIME_CHANNEL',
  SIDEBAR_MODE_CHANNEL = 'SIDEBAR_MODE_CHANNEL',
  EFFECT_OPTION_TYPE_CHANNEL = 'EFFECT_OPTION_TYPE_CHANNEL',
  SOURCELIST_SOURCE_INFO_CHANNEL = 'SOURCELIST_SOURCE_INFO_CHANNEL',
  ZOOM_PIXEL_PER_SECOND_CHANNEL = 'ZOOM_PIXEL_PER_SECOND_CHANNEL',
  EFFECT_STATE_CHANNEL = 'EFFECT_STATE_CHANNEL',
  COMMAND_REDO_UNDO_CHANNEL = 'COMMAND_REDO_UNDO_CHANNEL',
  CLIPBOARD_CHANNEL = 'CLIPBOARD_CHANNEL',
  CHANGE_TRACK_CHANNEL = 'CHANGE_TRACK_CHANNEL',
}

interface StoreStateType {
  cursorStringTime: string;
  playStringTime: string;
  sourceList: Source[];
  modalState: ModalStateType;
  isTrackDraggable: Boolean;
  trackList: Track[];
  currentPosition: number;
  focusList: FocusInfo[];
  ctrlIsPressed: boolean;
  cursorMode: CursorType;
  trackIndex: number;
  sectionIndex: number;
  effectIndex: number;
  clipBoard: TrackSection | null;
  markerNumberTime: number;
  cursorNumberTime: number;
  isPause: boolean;
  isRepeat: boolean;
  prevMaxTrackWidth: number;
  maxTrackWidth: number;
  maxTrackPlayTime: number;
  currentScrollAmount: number;
  sectionDragStartData: SectionDragStartData | null;
  selectTrackData: SelectTrackData;
  zoomInfo: ZoomInfoType;
  loopStartTime: number;
  loopEndTime: number;
  sidebarMode: SidebarMode;
  effectOptionType: EffectType;
  hoverSourceInfo: Source | null;
  isEffectModifyMode: boolean;
  modifyingEffectInfo: ModifyingEffectInfo;
}

interface StoreObserverData {
  callback: Function;
  bindObj: Object;
}

interface EffectList {
  name: string;
}

export { StoreStateType, StoreChannelType, StoreObserverData, CursorType, FocusInfo, EffectList };
