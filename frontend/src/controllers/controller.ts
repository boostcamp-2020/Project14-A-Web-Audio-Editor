import { Source, Track, TrackSection } from '@model';
import { store } from "@store";
import { ModalType, FocusInfo, CursorType } from "@types";

const getSectionChannelData = (trackId: number, trackSectionId: number): number[] | undefined => {
    const { trackList, sourceList } = store.getState();

    const track = trackList.find((track) => (track.id === trackId));
    if (!track) return;

    const { trackSectionList } = track;
    const trackSection = trackSectionList.find(trackSection => (trackSection.id === trackSectionId));

    if (!trackSection) return;

    const source = sourceList.find((source) => (source.id === trackSection.sourceId));

    if (!source) return;

    const { channelData, parsedChannelData, duration, length, sampleRate } = source;
    const { parsedChannelStartTime, parsedChannelEndTime } = trackSection;

    return parsedChannelData;
}

const getSourceBySourceId = (sourceId: number): Source | undefined => {
    const { sourceList } = store.getState();
    const source = sourceList.find((source) => (source.id === sourceId));

    return source;
}

const addSource = (source: Source): void => {
    store.setSource(source);
}

const changeModalState = (modalType: ModalType, isHidden: Boolean): void => {
    store.setModalState(modalType, isHidden);
};

const changeCursorTime = (minute: string, second: string, milsecond: string): void => {
    store.setCursorTime(minute, second, milsecond);
};

const changeTrackDragState = (isTrackDraggable: Boolean): void => {
    store.setTrackDragState(isTrackDraggable);
}

const getTrackList = (): Track[] => {
    const { trackList } = store.getState();
    return trackList;
}

const addTrack = (track: Track): void => {
    store.setTrack(track);
}

const addTrackSection = (trackId: number, trackSection: TrackSection): void => {
    store.setTrackSection(trackId, trackSection);
}

const getCtrlIsPressed = (): boolean => {
    const { ctrlIsPressed } = store.getState();
    return ctrlIsPressed;
}

const setCtrlIsPressed = (isPressed: boolean): void => {
    store.setCtrlIsPressed(isPressed);
}

const getFocusList = () => {
    const { focusList } = store.getState();
    return focusList;
}

const toggleFocus = (trackId: number, sectionId: number, selectedElement: HTMLElement): void => {
    const { trackList, focusList, ctrlIsPressed, cursorMode } = store.getState();

    if (cursorMode !== CursorType.SELECT_MODE) return;

    const track = trackList.find(track => track.id === trackId);
    const trackSection = track?.trackSectionList.find(section => section.id === sectionId);

    if (!trackSection) return;

    const existFocus = focusList.find(info => info.trackSection.id === sectionId);

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
}

const addFocus = (trackSection: TrackSection, selectedElement: HTMLElement): void => {
    selectedElement.classList.add('focused-section')
    const newFocusInfo: FocusInfo = {
        trackSection: trackSection,
        element: selectedElement
    }
    store.addFocus(newFocusInfo);
}

const removeFocus = (sectionId: number, selectedElement: HTMLElement): void => {
    const { focusList } = store.getState();
    const index = focusList.findIndex(focus => focus.trackSection.id === sectionId);
    selectedElement.classList.remove('focused-section')
    store.removeFocus(index);
}

const resetFocus = (): void => {
    const { focusList } = store.getState();
    focusList.forEach(focus => focus.element.classList.remove('focused-section'));
    store.resetFocus();
}

const getCursorMode = (): CursorType => {
    const { cursorMode } = store.getState();
    return cursorMode;
}

const getClipBoard = (): TrackSection | null => {
    const { clipBoard } = store.getState();
    return clipBoard;
}

const setClipBoard = (newSection: TrackSection) => {
    store.setClipBoard(newSection);
}


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
    getCtrlIsPressed,
    setCtrlIsPressed,
    getFocusList,
    toggleFocus,
    addFocus,
    removeFocus,
    resetFocus,
    getCursorMode,
    getClipBoard,
    setClipBoard
}
