import { Source, Track, TrackSection } from '@model';
import { store } from "@store";
import { ModalType } from "@types";

interface SectionData{
    sectionChannelData: number[];
    duration: number; 
}

const getSectionChannelData = (trackId: number, trackSectionId: number): SectionData | undefined => { 
    const { trackList, sourceList } = store.getState();
    const track = trackList.find((track) => (track.id === trackId));
    if(!track) return;
    
    const { trackSectionList } = track;
    const trackSection = trackSectionList.find((trackSection) => (trackSection.id === trackSectionId));
    if(!trackSection) return;

    const source = sourceList.find((source) => (source.id === trackSection.sourceId));
    if(!source) return;

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
}

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

const getCurrentPosition = (): number => {
  const { currentPosition } = store.getState();
  return currentPosition;
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
  getCurrentPosition
};
