import { Source, Track, TrackSection } from '@model';
import { store } from '@store';
import { ModalType, FocusInfo, CursorType, SectionDataType } from '@types';
import CommandManager from '@command/CommandManager';
import { DeleteCommand, PasteCommand, SplitCommand, MoveCommand } from '@command';
import { CopyUtil, SectionEffectListUtil, TimeUtil } from '@util';
import playbackTool from '@components/PlaybackTools/PlaybackToolClass';

const getTrackSection = (trackId: number, trackSectionId: number): TrackSection | undefined => {
  const { trackList } = store.getState();
  const track = trackList.find((track) => track.id === trackId);
  if (!track) return;

  const { trackSectionList } = track;
  const trackSection = trackSectionList.find((trackSection) => trackSection.id === trackSectionId);
  if (!trackSection) return;
  return trackSection;
};

const getSource = (trackId: number, trackSectionId: number): Source | undefined => {
  const { sourceList } = store.getState();
  const trackSection = getTrackSection(trackId, trackSectionId);

  if (!trackSection) return;
  const source = sourceList.find((source) => source.id === trackSection.sourceId);
  if (!source) return;

  return source;
};

const getSourceAndTrackSection = (trackId: number, trackSectionId: number): { source: Source; trackSection: TrackSection } | undefined => {
  const { trackList, sourceList } = store.getState();
  const track = trackList.find((track) => track.id === trackId);
  if (!track) return;

  const { trackSectionList } = track;
  const trackSection = trackSectionList.find((trackSection) => trackSection.id === trackSectionId);
  if (!trackSection) return;

  const source = sourceList.find((source) => source.id === trackSection.sourceId);
  if (!source) return;

  return { source, trackSection };
};

const getSectionData = (trackId: number, trackSectionId: number): SectionDataType | undefined => {
  const getSourceAndTrackSection = (trackId: number, trackSectionId: number): { source: Source; trackSection: TrackSection } | undefined => {
    const { trackList, sourceList } = store.getState();
    const track = trackList.find((track) => track.id === trackId);
    if (!track) return;

    const { trackSectionList } = track;
    const trackSection = trackSectionList.find((trackSection) => trackSection.id === trackSectionId);
    if (!trackSection) return;

    const source = sourceList.find((source) => source.id === trackSection.sourceId);
    if (!source) return;

    return { source, trackSection };
  };

  const parseSectionData = ({ source, trackSection }: { source: Source; trackSection: TrackSection }): SectionDataType | undefined => {
    if (!source || !trackSection) return;

    const { parsedChannelData, duration } = source;
    const { channelStartTime, channelEndTime } = trackSection;

    const numOfPeakPerSecond = parsedChannelData.length / duration;

    const sectionChannelStartTime = numOfPeakPerSecond * channelStartTime;
    const sectionChannelEndTime = numOfPeakPerSecond * channelEndTime;
    const sectionChannelData = parsedChannelData.slice(sectionChannelStartTime, sectionChannelEndTime);

    return {
      sectionChannelData: sectionChannelData,
      duration: channelEndTime - channelStartTime
    };
  };

  const pipe = (f, g) => (x, y) => g(f(x, y));
  return pipe(getSourceAndTrackSection, parseSectionData)(trackId, trackSectionId);
};

const getSourceBySourceId = (sourceId: number): Source | undefined => {
  const { sourceList } = store.getState();
  const source = sourceList.find((source) => source.id === sourceId);

  return source;
};

const getSourceList = (): Source[] => {
  const { sourceList } = store.getState();

  return sourceList;
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

const addTrackSectionFromSource = (sourceId: number, trackId: number): void => {
  const getSourceById = (sourceId: number): Source | undefined => {
    const { sourceList } = store.getState();
    const source = sourceList.find((source) => source.id === sourceId);
    return source;
  };

  const calculateTrackStartTime = (trackId: number): number | undefined => {
    const targetTrack = getTrack(trackId);
    if (!targetTrack) return;

    const { trackSectionList } = targetTrack;
    let trackStartTime = 0;
    if (trackSectionList.length > 0) {
      const lastTrackSection = trackSectionList[trackSectionList.length - 1];
      trackStartTime = lastTrackSection.channelEndTime;
    }

    return trackStartTime;
  };

  const addNewTrackSection = (trackId: number, source: Source, trackStartTime: number) => {
    if (!source || trackStartTime === undefined) return;

    const newTrackSection = new TrackSection({
      id: 0,
      sourceId: source.id,
      trackId: trackId,
      channelStartTime: 0,
      channelEndTime: source.duration,
      trackStartTime: trackStartTime
    });

    addTrackSection(trackId, newTrackSection);
  };

  const pipe = (f, g, h) => (x, y) => h(y, f(x), g(y));
  pipe(getSourceById, calculateTrackStartTime, addNewTrackSection)(sourceId, trackId);
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

const toggleFocus = (trackId: number, sectionId: number, selectedElement: HTMLCanvasElement): void => {
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

const addFocus = (trackSection: TrackSection, selectedElement: HTMLCanvasElement): void => {
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

const setCursorMode = (newCursorType: CursorType) => {
  const trackContainerElement = document.querySelector('.audi-main-audio-track-container');

  if (!trackContainerElement) return;

  if (newCursorType === CursorType.SELECT_MODE) {
    trackContainerElement.classList.remove('cursor-change');
  } else if (newCursorType === CursorType.CUT_MODE) {
    resetFocus();
    trackContainerElement.classList.add('cursor-change');
  }
  store.setCursorMode(newCursorType);
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

const changeMarkerNumberTime = (markerTime: number) => {
  store.setMarkerNumberTime(markerTime);
}

const getMarkerTime = (): number => {
  const { markerNumberTime } = store.getState();
  return markerNumberTime;
};

//markerEventUtil에서 이 함수로 바꿈.
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
  const [minute, second, milsecond] = TimeUtil.splitTime(cursorNumberTime);

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

const moveCommand = (prevTrackId: number, currentTrackId: number, sectionId: number, movingCursorTime: number, prevCursorTime: number) => {
  const { trackList } = store.getState();
  const prevTrack = trackList.find((track) => track.id === prevTrackId);
  const currentTrack = trackList.find((track) => track.id === currentTrackId);

  if (!prevTrack || !currentTrack) return;

  const trackSection = prevTrack.trackSectionList.find((section) => section.id === sectionId);

  if (!trackSection) return;

  const command = new MoveCommand(CopyUtil.copyTrack(prevTrack), CopyUtil.copyTrack(currentTrack), trackSection, movingCursorTime, prevCursorTime);
  CommandManager.execute(command);
};

const splitTrackSection = (cursorPosition: number, trackId: number, sectionId: number): void => {
  const track = getTrack(trackId);
  const trackSection = track?.trackSectionList.find((section) => section.id === sectionId);
  if (!trackSection || !track) return;

  const splitCommand = new SplitCommand(cursorPosition, CopyUtil.copyTrack(track), CopyUtil.copySection(trackSection));
  CommandManager.execute(splitCommand);
};

const changeMaxTrackWidth = (maxTrackWidth: number): void => {
  store.setMaxTrackWidth(maxTrackWidth);
};

const getMaxTrackWidth = () => {
  const { maxTrackWidth } = store.getState();
  return maxTrackWidth;
};

const changeMaxTrackPlayTime = (trackSectionList: TrackSection[]): void => {
  const trackPlaytime = trackSectionList.reduce((acc, trackSection) => acc += trackSection.length, 0);
  store.setMaxTrackPlayTime(trackPlaytime);
};

const getMaxTrackPlayTime = () => {
  const { maxTrackPlayTime } = store.getState();
  return maxTrackPlayTime;
};

const changeCurrentScrollAmount = (newCurrentScrollAmount: number): void => {
  store.setCurrentScrollAmount(newCurrentScrollAmount);
};

const audioCursorPlay = () => {
  playbackTool.audioCursorPlay();
}v

const audioPlayOrPause = (): void => {
  const ret = playbackTool.audioPlayOrPause();

  store.changePlayOrPauseIcon(ret);
};

const audioStop = (): void => {
  playbackTool.audioStop();
};

const audioRepeat = (): void => {
  const ret = playbackTool.audioRepeat();

  store.changeRepeatIconColor(ret);
};

const changeIsRepeatState = (isRepeatState: boolean): void => {
  store.setIsRepeatState(isRepeatState);
};

const getIsRepeatState = (): boolean => {
  const { isRepeat } = store.getState();
  return isRepeat;
};

const audioFastRewind = () => {
  playbackTool.audioFastRewind();
};

const audioFastForward = () => {
  playbackTool.audioFastForward();
};

const audioSkipPrev = () => {
  playbackTool.audioSkipPrev();
};

const audioSkipNext = () => {
  playbackTool.audioSkipNext();
};

const setMute = (trackId: number) => {
  playbackTool.setMute(trackId);
};

const unsetMute = (trackId: number) => {
  playbackTool.unsetMute(trackId);
};

const setSolo = (trackId: number) => {
  store.soloPlay(trackId);
  playbackTool.setSolo(trackId);
};

const unsetSolo = () => {
  playbackTool.unsetSolo();
};

const getCurrentScrollAmount = () : number => {
  const { currentScrollAmount } = store.getState();
  return currentScrollAmount;
};

export default {
  getTrackSection,
  getSource,
  getSourceAndTrackSection,
  addTrackSectionFromSource,
  getSectionData,
  getSourceList,
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
  setMarkerWidth,
  getIsPauseState,
  changeIsPauseState,
  changePlayStringTime,
  changeMarkerPlayStringTime,
  removeSection,
  deleteCommand,
  undoCommand,
  redoCommand,
  getMaxTrackPlayTime,
  cutCommand,
  pasteCommand,
  moveCommand,
  splitTrackSection,
  getSourceBySourceId,
  changeMarkerNumberTime,
  audioPlayOrPause,
  audioStop,
  audioFastRewind,
  audioFastForward,
  audioSkipPrev,
  audioSkipNext,
  audioCursorPlay,
  audioRepeat,
  changeIsRepeatState,
  getIsRepeatState,
  setMute,
  unsetMute,
  setSolo,
  unsetSolo,
  changeMaxTrackWidth,
  changeMaxTrackPlayTime,
  changeCurrentScrollAmount,
  getMaxTrackWidth,
  getCurrentScrollAmount
};
