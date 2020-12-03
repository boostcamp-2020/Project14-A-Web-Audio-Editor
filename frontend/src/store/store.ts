import { StoreStateType, CursorType } from "@types";
import { Track, Source, TrackSection } from "@model";
import { StoreChannelType, ModalType, ModalStateType, FocusInfo } from "@types";
import { storeChannel } from "@store";

const store = new (class Store {
    private state: StoreStateType;

    constructor() {
        this.state = {
            cursorTime: '00:00:000',
            sourceList: [],
            modalState: {
                modalType: ModalType.upload,
                isHidden: true
            },
            isTrackDraggable: false,
            trackList: this.initTrackList(3),
            focusList: [],
            ctrlIsPressed: false,
            cursorMode: CursorType.SELECT_MODE,
            trackIndex: 3,
            sectionIndex: 0,
            clipBoard: null
        }
    }

    initTrackList(numOfTracks: number): Track[] {
        return Array(numOfTracks).fill(0).reduce((acc, cur, idx) => {
            const track = new Track({ id: idx, trackSectionList: [] });
            return acc.concat(track);
        }, []);
    }

    getState(): StoreStateType {
        return this.state;
    }

    setSource(source: Source): void {
        const { sourceList } = this.state;
        source.id = sourceList.length;

        const newSourceList = sourceList.concat(source);
        this.state = { ...this.state, sourceList: newSourceList };
        storeChannel.publish(StoreChannelType.SOURCE_LIST_CHANNEL, newSourceList);
    }

    setModalState(newModalType: ModalType, newIsHiiden: Boolean): void {
        const { modalState } = this.state;
        const { modalType, isHidden } = modalState;

        if (modalType === newModalType && isHidden === newIsHiiden) return;

        const newModalState: ModalStateType = { modalType: newModalType, isHidden: newIsHiiden };
        this.state = { ...this.state, modalState: newModalState };
        storeChannel.publish(StoreChannelType.MODAL_STATE_CHANNEL, newModalState);
    }

    setCursorTime(newMinute: string, newSecond: string, newMilsecond): void {
        const { cursorTime } = this.state;
        const [minute, second, milsecond] = cursorTime.split(':');

        if (minute === newMinute && second === newSecond && milsecond === newMilsecond) return;

        const newCursorTime: string = `${newMinute.padStart(2, '0')}:${newSecond.padStart(2, '0')}:${newMilsecond.padStart(3, '0')}`;
        this.state = { ...this.state, cursorTime: newCursorTime };
        storeChannel.publish(StoreChannelType.CURSOR_TIME_CHANNEL, newCursorTime);
    }

    setTrackDragState(newIsTrackDraggable: Boolean): void {
        const { isTrackDraggable } = this.state;
        if (isTrackDraggable === newIsTrackDraggable) return;

        this.state = { ...this.state, isTrackDraggable: newIsTrackDraggable };
        storeChannel.publish(StoreChannelType.TRACK_DRAG_STATE_CHANNEL, newIsTrackDraggable);
    }

    setTrack(newTrack: Track): void {
        const { trackList } = this.state;

        newTrack.id = trackList.length;
        const newAudioTrackList = trackList.concat(newTrack);

        this.state = { ...this.state, trackList: newAudioTrackList };
        console.log(this.state);
    }

    setTrackSection(trackId: number, newTrackSection: TrackSection): void {
        const { trackList } = this.state;
        const track = trackList.find(track => track.id === trackId)
        if (!track) return;

        const { trackSectionList } = track;
        newTrackSection.id = this.state.sectionIndex++;

        const newTrackSectionList = trackSectionList
            .concat(newTrackSection).sort((a, b) => a.trackStartTime - b.trackStartTime);

        const newTrack = new Track({ ...track, trackSectionList: newTrackSectionList });
        const newTrackList: Array<Track> = trackList.reduce<Track[]>((acc, track) =>
            (track.id === trackId) ? acc.concat(newTrack) : acc.concat(track),
            []);

        this.state = { ...this.state, trackList: newTrackList };

        storeChannel.publish(StoreChannelType.TRACK_SECTION_LIST_CHANNEL, {
            trackId: trackId,
            trackSectionList: newTrackSectionList
        });
    }

    setCtrlIsPressed(isPressed: boolean): void {
        this.state.ctrlIsPressed = isPressed;
    }

    addFocus(newFocusInfo: FocusInfo): void {
        const { focusList } = this.state;
        const newfocusList = focusList.concat(newFocusInfo);

        this.state = { ...this.state, focusList: newfocusList };
        storeChannel.publish(StoreChannelType.EDIT_TOOLS_CHANNEL, '');
    }

    removeFocus(removeIndex: number) {
        const { focusList } = this.state;
        const newfocusList = [...focusList];
        newfocusList.splice(removeIndex, 1);
        this.state = { ...this.state, focusList: newfocusList };
        storeChannel.publish(StoreChannelType.EDIT_TOOLS_CHANNEL, '');
    }

    resetFocus(): void {
        this.state = { ...this.state, focusList: [] };
        storeChannel.publish(StoreChannelType.EDIT_TOOLS_CHANNEL, '');
    }

    setClipBoard(newSection: TrackSection): void {
        this.state.clipBoard = newSection;
        storeChannel.publish(StoreChannelType.EDIT_TOOLS_CHANNEL, '');
    }
})();

export { store };
