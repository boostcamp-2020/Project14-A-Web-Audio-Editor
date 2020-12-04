import { Source, Track, TrackSection } from '@model';
import { store } from "@store";
import { ModalType, FocusInfo, CursorType } from "@types";
import CommandManager from '@command/CommandManager';
import DeleteCommand from '@command/DeleteCommand'
import { CopyUtil } from '@util'
import { PlayBarUtil } from '@util';

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

const changeCursorTime = (minute: string, second: string, milsecond: string): void => {
  store.setCursorTime(minute, second, milsecond);
};

const changeTrackDragState = (isTrackDraggable: Boolean): void => {
  store.setTrackDragState(isTrackDraggable);
};

const getTrackList = (): Track[] => {
  const { trackList } = store.getState();
  return trackList;
};

const addTrack = (track: Track): void => {
  store.setTrack(track);
};

const addTrackSection = (trackId: number, trackSection: TrackSection): void => {
  store.setTrackSection(trackId, trackSection);
};

const changeCurrentPosition = (currentPosition: number): void => {
  store.setCurrentPosition(currentPosition);
};

const getCurrentPosition = (): number[] => {
  const { currentPosition, totalCursorTime } = store.getState();

  return [currentPosition, totalCursorTime];
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
};

const removeFocus = (sectionId: number, selectedElement: HTMLElement): void => {
  const { focusList } = store.getState();
  const index = focusList.findIndex((focus) => focus.trackSection.id === sectionId);
  selectedElement.classList.remove('focused-section');
  store.removeFocus(index);
};

const resetFocus = (): void => {
  const { focusList } = store.getState();
  focusList.forEach((focus) => focus.element.classList.remove('focused-section'));
  store.resetFocus();
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

const pauseChangeMarkerTime = (playingTime: number): void => {
  const { markerTime } = store.getState();
  const newMarkerTime = markerTime + playingTime;

  store.setMarkerTime(newMarkerTime);
};

const cursorChangeMarkerTime = (newMarkerTime): void => {
  store.setMarkerTime(newMarkerTime);
};

const getMarkerTime = (): number => {
  const { markerTime } = store.getState();
  return markerTime;
};

const changeTotalCursorTime = (totalCursorTime: number): void => {
  store.setTotalCursorTime(totalCursorTime);
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

const changePlayTime = (passedTime: number): void => {
  const { playTime } = store.getState();

  const [minute, second, milsecond] = playTime.split(':');
  let newMinute = Number(minute);
  let newSecond = Number(second);
  let newMilsecond = Number(milsecond) + Math.floor(passedTime);

  if (newMilsecond >= 1000) {
    newMilsecond -= 1000;
    newSecond += 1;
  }

  if (newSecond >= 60) {
    newSecond -= 60;
    newMinute += 1;
  }

  const newPlayTime = `${newMinute.toString().padStart(2, '0')}:${newSecond.toString().padStart(2, '0')}:${newMilsecond.toString().padStart(3, '0')}`;

  store.setPlayTime(newPlayTime);
};

const resetPlayTime = (cursorTime: number): void => {
  const [minute, second, milsecond] = PlayBarUtil.setTime(cursorTime);

  const newPlayTime = `${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}:${milsecond.toString().padStart(3, '0')}`;

  store.setPlayTime(newPlayTime);
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
 
const setClipBoard = () => {
  const { focusList } = store.getState();

  if (focusList.length !== 1) return;

  const newSection: TrackSection = CopyUtil.copySection(focusList[0].trackSection);

  store.setClipBoard(newSection);
};

export default {
  getSourceBySourceId,
  getSectionChannelData,
  addSource,
  changeModalState,
  changeTrackDragState,
  getTrackList,
  addTrack,
  addTrackSection,
  changeCursorTime,
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
  pauseChangeMarkerTime,
  getMarkerTime,
  changeTotalCursorTime,
  cursorChangeMarkerTime,
  setMarkerWidth,
  getIsPauseState,
  changeIsPauseState,
  changePlayTime,
  resetPlayTime,
  removeSection,
  deleteCommand,
  undoCommand,
  redoCommand
};
