import { Source, Track, TrackSection } from '@model';
import { store } from "@store";
import { ModalType } from "@types";

const getSectionChannelData = (trackId: number, trackSectionId: number): number[] | undefined => { 
    const { trackList, sourceList } = store.getState();
    const track = trackList.find((track) => (track.id === trackId));
    // console.log(track);
    if(!track) return;
    
    const { trackSectionList } = track;
    const trackSection = trackSectionList.find((trackSection) => (trackSection.id === trackSectionId));
    // console.log(trackSection);
    if(!trackSection) return;

    const source = sourceList.find((source) => (source.id === trackSection.sourceId));
    // console.log(source);
    if(!source) return;

    const { channelData, parsedChannelData, duration, length, sampleRate } = source;
    const { parsedChannelStartTime, parsedChannelEndTime } = trackSection;
    console.log("channelData", channelData);
    console.log("parsedChannelData", parsedChannelData);
    console.log("duration", duration);
    console.log("length", length);
    console.log("sampleRate", sampleRate);

    return parsedChannelData;
}

const getSourceBySourceId = (sourceId: number): Source | undefined => {
    const { sourceList } = store.getState();
    const source = sourceList.find((source) => (source.id === sourceId));

    return source;
}

const addSource = (source: Source): void =>{
    store.setSource(source);
}

const changeModalState = (modalType: ModalType, isHidden: Boolean): void => {
    store.setModalState(modalType, isHidden);
}

const changeTrackDragState = (isTrackDraggable: Boolean): void =>{
    store.setTrackDragState(isTrackDraggable);
}

const getTrackList = (): Track[] =>{
    const { trackList } = store.getState();
    return trackList;
}

const addTrack = (track: Track): void => {
    store.setTrack(track);
}

const addTrackSection = (trackId: number, trackSection: TrackSection): void => {
    store.setTrackSection(trackId, trackSection);
}

export default {
    getSourceBySourceId,
    getSectionChannelData,
    addSource,
    changeModalState,
    changeTrackDragState,
    getTrackList,
    addTrack,
    addTrackSection
}
