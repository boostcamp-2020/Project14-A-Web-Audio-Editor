import { Source, Track, TrackSection } from '@model';
import { store } from '@store';
import { ModalType, FocusInfo, CursorType } from '@types';
import CommandManager from '@command/CommandManager';
import { DeleteCommand, PasteCommand, SplitCommand } from '@command';
import { CopyUtil, SectionEffectListUtil, TimeUtil } from '@util';

interface SectionData {
  sectionChannelData: number[];
  duration: number;
}

const getSectionChannelData = (trackId: number, trackSectionId: number): SectionData | undefined => {
  const { trackList, sourceList } = store.getState();
  const track = trackList.find((track) => track.id === trackId);

  if (!track) return;

  const { trackSectionList } = track;
  const trackSection = trackSectionList.find((trackSection) => trackSection.id === trackSectionId);
  if (!trackSection) return;

  const source = sourceList.find((source) => source.id === trackSection.sourceId);

  if (!source) return;

  const { parsedChannelData, duration } = source;
  const { parsedChannelStartTime, parsedChannelEndTime } = trackSection;

  const numOfPeakPerSecond = parsedChannelData.length / duration;

  const sectionChannelStartTime = numOfPeakPerSecond * parsedChannelStartTime;
  const sectionChannelEndTime = numOfPeakPerSecond * parsedChannelEndTime;
  const sectionChannelData = parsedChannelData.slice(sectionChannelStartTime, sectionChannelEndTime);

  return {
    sectionChannelData: sectionChannelData,
    duration: parsedChannelEndTime - parsedChannelStartTime
  };
};

const getSourceBySourceId = (sourceId: number): Source | undefined => {
  const { sourceList } = store.getState();
  const source = sourceList.find((source) => source.id === sourceId);

  return source;
};

const addSource = (source: Source): void => {
  store.setSource(source);
};

const changeModalState = (modalType: ModalType, isHidden: Boolean): void => {
  store.setModalState(modalType, isHidden);
};

const changeCursorStringTime = (minute: number, second: number, milsecond: number): void => {
  const newCursorStringTime = TimeUtil.getStringTime(minute, second, milsecond);
  store.setCursorStringTime(newCursorStringTime);
};

const changeTrackDragState = (isTrackDraggable: Boolean): void => {
  store.setTrackDragState(isTrackDraggable);
};

const getTrackList = (): Track[] => {
  const { trackList } = store.getState();
  return trackList;
};

const getTrack = (trackId: number): Track | null => {
  const { trackList } = store.getState();
  const track = trackList.find((track) => track.id === trackId);

  if (!track) return null;

  return track;
};

const setTrack = (track: Track): void => {
  store.setTrack(track);
};

const addTrackSection = (trackId: number, trackSection: TrackSection): void => {
  store.setTrackSection(trackId, trackSection);
};

const changeCurrentPosition = (currentPosition: number): void => {
  store.setCurrentPosition(currentPosition);
};

const getCurrentPosition = (): number[] => {
  const { currentPosition, cursorNumberTime } = store.getState();

  return [currentPosition, cursorNumberTime];
};

const getCtrlIsPressed = (): boolean => {
  const { ctrlIsPressed } = store.getState();
  return ctrlIsPressed;
};

const setCtrlIsPressed = (isPressed: boolean): void => {
  store.setCtrlIsPressed(isPressed);
};

const getFocusList = () => {
  const { focusList } = store.getState();
  return focusList;
};

const toggleFocus = (trackId: number, sectionId: number, selectedElement: HTMLElement): void => {
  const { trackList, focusList, ctrlIsPressed, cursorMode } = store.getState();

  if (cursorMode !== CursorType.SELECT_MODE) return;

  const track = trackList.find((track) => track.id === trackId);
  const trackSection = track?.trackSectionList.find((section) => section.id === sectionId);

  if (!trackSection) return;

  const existFocus = focusList.find((info) => info.trackSection.id === sectionId);

  if (ctrlIsPressed) {
    if (existFocus) {
      removeFocus(sectionId, selectedElement);
    } else {
      addFocus(trackSection, selectedElement);
    }
  } else {
    resetFocus();
    addFocus(trackSection, selectedElement);
  }
};

const addFocus = (trackSection: TrackSection, selectedElement: HTMLElement): void => {
  selectedElement.classList.add('focused-section');
  const newFocusInfo: FocusInfo = {
    trackSection: trackSection,
    element: selectedElement
  };
  store.addFocus(newFocusInfo);
  SectionEffectListUtil.showEffectList();
};

const removeFocus = (sectionId: number, selectedElement: HTMLElement): void => {
  const { focusList } = store.getState();
  const index = focusList.findIndex((focus) => focus.trackSection.id === sectionId);
  selectedElement.classList.remove('focused-section');
  store.removeFocus(index);
  SectionEffectListUtil.hideEffectList();
};

const resetFocus = (): void => {
  const { focusList } = store.getState();
  focusList.forEach((focus) => focus.element.classList.remove('focused-section'));
  store.resetFocus();
  SectionEffectListUtil.hideEffectList();
};

const getCursorMode = (): CursorType => {
  const { cursorMode } = store.getState();
  return cursorMode;
};

const setCursorMode = (newType: CursorType) => {
  const trackContainer = document.querySelector('.audi-main-audio-track-container');

  if (!trackContainer) return;

  if (newType === CursorType.SELECT_MODE) {
    trackContainer.classList.remove('cursor-change');
  } else if (newType === CursorType.CUT_MODE) {
    resetFocus();
    trackContainer.classList.add('cursor-change');
  }
  store.setCursorMode(newType);
};

const getClipBoard = (): TrackSection | null => {
  const { clipBoard } = store.getState();
  return clipBoard;
};

const pauseChangeMarkerNumberTime = (playingTime: number): void => {
  const { markerNumberTime } = store.getState();
  let newMarkerNumberTime = markerNumberTime + playingTime;
  if (newMarkerNumberTime < 0) {
    newMarkerNumberTime = 0;
  }

  store.setMarkerNumberTime(newMarkerNumberTime);
};

const changeCursorMarkerNumberTime = (newMarkerNumberTime: number): void => {
  store.setCursorNumberTime(newMarkerNumberTime);
};

const getMarkerTime = (): number => {
  const { markerNumberTime } = store.getState();
  return markerNumberTime;
};

const changeCursorNumberTime = (cursorNumberTime: number): void => {
  store.setCursorNumberTime(cursorNumberTime);
};

const changeIsPauseState = (isPauseState: boolean): void => {
  store.setIsPauseState(isPauseState);
};

const getIsPauseState = (): boolean => {
  const { isPause } = store.getState();
  return isPause;
};

const setMarkerWidth = (markerWidth: number): void => {
  store.setMarkerWidth(markerWidth);
};

const changePlayStringTime = (passedTime: number): void => {
  const { playStringTime } = store.getState();

  const [minute, second, milsecond] = playStringTime.split(':');
  let newMinute = Number(minute);
  let newSecond = Number(second);
  let newMilsecond = Number(milsecond) + Math.floor(passedTime);

  if (newMilsecond > 0) {
    if (newMilsecond >= 1000) {
      newMilsecond -= 1000;
      newSecond += 1;
    }

    if (newSecond >= 60) {
      newSecond -= 60;
      newMinute += 1;
    }
  } else {
    let totalMilsecond = newMinute * 1000 * 60 + newSecond * 1000 + newMilsecond;
    if (totalMilsecond < 0) {
      newMinute = 0;
      newSecond = 0;
      newMilsecond = 0;
    } else {
      newMinute = Math.floor(totalMilsecond / (1000 * 60));
      totalMilsecond -= newMinute * 1000 * 60;
      newSecond = Math.floor(totalMilsecond / 1000);
      totalMilsecond -= newSecond * 1000;
      newMilsecond = totalMilsecond;
    }
  }

  const newPlayStringTime = TimeUtil.getStringTime(newMinute, newSecond, newMilsecond);

  store.setPlayStringTime(newPlayStringTime);
};

const changeMarkerPlayStringTime = (cursorNumberTime: number): void => {
  const [minute, second, milsecond] = TimeUtil.getSplitTime(cursorNumberTime);

  const newPlayStringTime = TimeUtil.getStringTime(minute, second, milsecond);

  store.setPlayStringTime(newPlayStringTime);
};

const removeSection = (trackId: number, sectionIndex: number) => {
  store.removeSection(trackId, sectionIndex);
};

const deleteCommand = () => {
  const { focusList } = store.getState();
  if (focusList.length === 0) return;
  const command = new DeleteCommand();
  CommandManager.execute(command);
};

const undoCommand = () => {
  if (CommandManager.undoList.length === 0) return;
  CommandManager.undo();
};

const redoCommand = () => {
  if (CommandManager.redoList.length === 0) return;
  CommandManager.redo();
};

const setClipBoard = (): boolean => {
  const { focusList } = store.getState();

  if (focusList.length !== 1) return false;

  const newSection: TrackSection = CopyUtil.copySection(focusList[0].trackSection);
  newSection.id = 0;
  store.setClipBoard(newSection);

  return true;
};

const cutCommand = () => {
  if (!setClipBoard()) return;

  const command = new DeleteCommand();
  CommandManager.execute(command);
};

const pasteCommand = () => {
  const { focusList, trackList, clipBoard } = store.getState();

  if (focusList.length !== 1) return false;

  const track = trackList.find((track) => track.id === focusList[0].trackSection.trackId);
  if (!track || !clipBoard) return;

  const copyTrack = CopyUtil.copyTrack(track);
  const copySection = CopyUtil.copySection(clipBoard);
  const focusSection = focusList[0].trackSection;

  copySection.trackStartTime = focusSection.trackStartTime + focusSection.length;
  copySection.trackId = focusSection.trackId;

  const command = new PasteCommand(copyTrack, copySection);

  CommandManager.execute(command);
};

const splitCommand = (cursorPosition: number, trackId: number, sectionId: number): void => {
  const track = getTrack(trackId);
  const trackSection = track?.trackSectionList.find((section) => section.id === sectionId);

  if (!trackSection || !track) return;

  const command = new SplitCommand(cursorPosition, CopyUtil.copyTrack(track), CopyUtil.copySection(trackSection));
  CommandManager.execute(command);
};

const changeMaxTrackWidth = (newMaxTrackWidth: number) => {
  const { maxTrackWidth } = store.getState();
  if (maxTrackWidth >= newMaxTrackWidth) return;
  store.setMaxTrackWidth(newMaxTrackWidth);
};

export default {
  getSourceBySourceId,
  getSectionChannelData,
  addSource,
  changeModalState,
  changeTrackDragState,
  getTrackList,
  getTrack,
  setTrack,
  addTrackSection,
  changeCursorStringTime,
  changeCurrentPosition,
  getCurrentPosition,
  getCtrlIsPressed,
  setCtrlIsPressed,
  getFocusList,
  toggleFocus,
  addFocus,
  removeFocus,
  resetFocus,
  getCursorMode,
  setCursorMode,
  getClipBoard,
  setClipBoard,
  pauseChangeMarkerNumberTime,
  getMarkerTime,
  changeCursorNumberTime,
  changeCursorMarkerNumberTime,
  setMarkerWidth,
  getIsPauseState,
  changeIsPauseState,
  changePlayStringTime,
  changeMarkerPlayStringTime,
  removeSection,
  deleteCommand,
  undoCommand,
  redoCommand,
  changeMaxTrackWidth,
  cutCommand,
  pasteCommand,
  splitCommand
};
