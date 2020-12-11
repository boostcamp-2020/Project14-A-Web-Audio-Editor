import { Source, Track, TrackSection, SectionDragStartData } from '@model';
import { store } from '@store';
import { ModalType, FocusInfo, CursorType, SectionDataType } from '@types';
import { CopyUtil, SectionEffectListUtil, TimeUtil, WidthUtil } from '@util';
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

const createTrackSectionFromSource = (sourceId: number): TrackSection | undefined => {
  const { sourceList } = store.getState();
  const source = sourceList.find((source) => source.id === sourceId);

  if (!source) return;
  const newTrackSection = new TrackSection({
    id: 0,
    sourceId,
    trackId: 0,
    channelStartTime: 0,
    channelEndTime: source.duration,
    trackStartTime: 0
  });

  return newTrackSection;
}

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
  store.resetSelectTrackData();

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
    store.resetSelectTrackData();
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

const setMarkerWidth = (markerWidth: number|number[]): void => {
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

const setClipBoard = (): boolean => {
  const { focusList } = store.getState();

  if (focusList.length !== 1) return false;

  const newSection: TrackSection = CopyUtil.copySection(focusList[0].trackSection);
  newSection.id = 0;
  store.setClipBoard(newSection);

  return true;
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

const getCurrentScrollAmount = (): number => {
  const { currentScrollAmount } = store.getState();

  return currentScrollAmount;
}

const getCurrentScrollTime = (): number => {
  const { currentScrollAmount, maxTrackWidth, maxTrackPlayTime } = store.getState();

  const secondPerPixel = WidthUtil.getSecondPerPixel(maxTrackWidth, maxTrackPlayTime);

  return secondPerPixel * currentScrollAmount;
}

const audioCursorPlay = () => {
  playbackTool.audioCursorPlay();
};

const audioPlayOrPause = (): void => {
  const audioPlayType = playbackTool.audioPlayOrPause();
  store.changePlayOrPauseIcon(audioPlayType);
};

const audioStop = (): void => {
  playbackTool.audioStop();
};

const audioRepeat = (): void => {
  playbackTool.audioRepeat();
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
  playbackTool.setSolo(trackId);
};

const unsetSolo = (trackId: number) => {
  playbackTool.unsetSolo(trackId);
};

const changeSectionDragStartData = (sectionDragStartData: SectionDragStartData): void => {
  store.setSectionDragStartData(sectionDragStartData);
};

const getSectionDragStartData = (): SectionDragStartData | null => {
  const { sectionDragStartData } = store.getState();

  return sectionDragStartData;
};

const changeSelectTrackData = (trackId: number, selectedTime: number): void => {
  const track = getTrack(trackId);
  const trackSection = track?.trackSectionList.find(section => section.trackStartTime <= selectedTime && selectedTime <= section.trackStartTime + section.length)
  if (trackSection) {
    store.setSelectTrackData(0, 0);
    return;
  }
  store.setSelectTrackData(trackId, selectedTime);
};

const getSelectTrackData = () => {
  const { selectTrackData } = store.getState();
  return selectTrackData;
};
  
const pushTrackWidthIndex = (newTrack: Track): void => {
  const { trackList, trackIndex } = store.getState();
  const newTrackList = trackList.concat(newTrack);

  store.setTrackList(newTrackList);
  store.setTrackIndex(trackIndex + 1);
};

const popTrackWithIndex = (): Track | undefined => {
  const { trackList, trackIndex } = store.getState();
  const removedTrack = trackList.pop();
  
  store.setTrackList(trackList);
  store.setTrackIndex(trackIndex - 1);
  return removedTrack;
};

const removeTrackById = (trackId: number): Track | undefined => {
  const { trackList } = store.getState();
  const trackToRemove = trackList.find((track) => track.id === trackId);

  if(!trackToRemove) return;
  const newTrackList = trackList.filter((track) => track.id !== trackId);
  
  store.setTrackList(newTrackList);
  return trackToRemove;
};

const insertTrack = (insertIdx: number, trackToInsert: Track): void => {
  const { trackList } = store.getState();
  
  const newTrackList = Array(trackList.length + 1).fill(0).map(( _, idx) => {
    if(idx < insertIdx) return trackList[idx];
    if(idx > insertIdx) return trackList[idx - 1];
    return trackToInsert;
  });

  store.setTrackList(newTrackList);
};

export default {
  getTrackSection,
  getSource,
  getSourceAndTrackSection,
  createTrackSectionFromSource,
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
  getMaxTrackPlayTime,
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
  getCurrentScrollTime,
  getCurrentScrollAmount,
  changeSectionDragStartData,
  getSectionDragStartData,
  changeSelectTrackData,
  getSelectTrackData,
  popTrackWithIndex,
  pushTrackWidthIndex,
  removeTrackById,
  insertTrack
};
